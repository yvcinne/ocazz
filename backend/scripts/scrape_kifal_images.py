#!/usr/bin/env python3
"""
Scrape car images from occasion.kifal.ma and insert into the images table.

Strategy:
  1. Scrape all listing pages from kifal.ma (24 cars/page, ~44 pages).
  2. Build a map  {(brand, model): [url, url, ...]}  grouped by normalised name.
  3. For each car in our DB that has no images, look up matching images and insert up to 3.

Usage:
    python3 scripts/scrape_kifal_images.py              # only cars without images
    python3 scripts/scrape_kifal_images.py --force       # re-scrape even cars that already have images
    python3 scripts/scrape_kifal_images.py --pages 5     # only fetch first 5 pages of kifal.ma
    python3 scripts/scrape_kifal_images.py --dry-run     # print without writing to DB
"""

import argparse
import os
import re
import sys
import time
import unicodedata
import mysql.connector
import requests

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ENV_PATH    = os.path.join(SCRIPT_DIR, '..', '.env')

IMAGES_PER_CAR  = 3
DELAY_BETWEEN   = 0.5   # seconds between page fetches (polite crawling)
MAX_PAGES       = 50    # safety cap

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept-Language': 'fr-MA,fr;q=0.9',
}

# Regex to extract (title, image_url) pairs from listing HTML
CARD_RE = re.compile(
    r'title="([^"]+)"[^<]*</a>\s*<span[^>]*>\s*<img\s+src="(https://cdnmdj3lv0[^"]+)"',
    re.DOTALL
)


def load_env(path):
    config = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if '=' in line and not line.startswith('#'):
                    key, _, val = line.partition('=')
                    config[key.strip()] = val.strip().strip('"').strip("'")
    except FileNotFoundError:
        print(f"[ERROR] .env not found at {path}")
        sys.exit(1)
    return config


def get_db(env):
    return mysql.connector.connect(
        host=env.get('DB_HOST', '127.0.0.1'),
        port=int(env.get('DB_PORT', 3306)),
        database=env.get('DB_DATABASE', 'laravel'),
        user=env.get('DB_USERNAME', 'root'),
        password=env.get('DB_PASSWORD', ''),
    )


def normalize(text):
    """'Renault Clio' → 'renault clio', handles accents and extra spaces."""
    text = text.lower().strip()
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    return re.sub(r'\s+', ' ', text)


def scrape_all_pages(max_pages):
    """Return dict  {norm_key: [img_url, ...]}  scraped from kifal.ma."""
    image_map = {}   # norm_brand_model → [urls]
    session = requests.Session()
    session.headers.update(HEADERS)

    for page in range(1, max_pages + 1):
        url = f"https://occasion.kifal.ma/annonces?page={page}"
        try:
            r = session.get(url, timeout=15)
        except Exception as exc:
            print(f"  [WARN] page {page}: {exc}")
            break

        if r.status_code != 200:
            print(f"  [WARN] page {page} returned HTTP {r.status_code} — stopping.")
            break

        pairs = CARD_RE.findall(r.text)
        if not pairs:
            print(f"  No cards found on page {page} — end of listings.")
            break

        for title, img_url in pairs:
            key = normalize(title)
            image_map.setdefault(key, [])
            if img_url not in image_map[key]:
                image_map[key].append(img_url)

        print(f"  Page {page:3d}: {len(pairs)} cards  (total unique keys: {len(image_map)})")
        time.sleep(DELAY_BETWEEN)

    return image_map


def find_images(image_map, brand, model):
    """Try several normalisation strategies to find images for a DB car."""
    # Strategy 1: exact "brand model" match
    key = normalize(f"{brand} {model}")
    if key in image_map:
        return image_map[key]

    # Strategy 2: brand-only prefix match (e.g. "renault" matches "renault clio")
    brand_norm = normalize(brand)
    model_norm = normalize(model)
    candidates = []
    for k, urls in image_map.items():
        if k.startswith(brand_norm + ' ') and model_norm in k:
            candidates.extend(urls)
    if candidates:
        return candidates

    # Strategy 3: model anywhere in key (e.g. fuzzy)
    for k, urls in image_map.items():
        if model_norm in k:
            candidates.extend(urls)
    return candidates


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--pages',   type=int, default=MAX_PAGES, help='Max kifal.ma pages to scrape')
    parser.add_argument('--force',   action='store_true',         help='Re-scrape cars that already have images')
    parser.add_argument('--dry-run', action='store_true',         help='Print without writing to DB')
    args = parser.parse_args()

    env = load_env(ENV_PATH)

    print(f"Scraping kifal.ma (up to {args.pages} pages)…\n")
    image_map = scrape_all_pages(args.pages)
    print(f"\nScraped {sum(len(v) for v in image_map.values())} image URLs across {len(image_map)} unique models.\n")

    db  = get_db(env)
    cur = db.cursor(dictionary=True)

    if args.force:
        cur.execute("SELECT id, brand, model, model_year FROM annonces WHERE status='approved'")
    else:
        cur.execute("""
            SELECT a.id, a.brand, a.model, a.model_year
            FROM annonces a
            LEFT JOIN images i ON i.annonce_id = a.id
            WHERE a.status = 'approved' AND i.id IS NULL
        """)

    annonces = cur.fetchall()

    if not annonces:
        print("Nothing to process — all cars already have images.")
        db.close()
        return

    print(f"Processing {len(annonces)} car(s) from DB…\n")

    inserted = 0
    skipped  = 0

    for ann in annonces:
        aid   = ann['id']
        brand = ann['brand']
        model = ann['model']
        year  = ann['model_year']

        urls = find_images(image_map, brand, model)[:IMAGES_PER_CAR]

        if not urls:
            print(f"  [SKIP] {brand} {model} {year} — no match on kifal.ma")
            skipped += 1
            continue

        print(f"  [OK]   {brand} {model} {year} — {len(urls)} image(s)")
        if not args.dry_run:
            if args.force:
                cur.execute("DELETE FROM images WHERE annonce_id = %s", (aid,))
            for url in urls:
                cur.execute(
                    "INSERT INTO images (annonce_id, url, created_at, updated_at) VALUES (%s, %s, NOW(), NOW())",
                    (aid, url)
                )
            db.commit()
        else:
            for url in urls:
                print(f"         {url}")
        inserted += 1

    cur.close()
    db.close()
    print(f"\nDone. Images inserted for {inserted} car(s), {skipped} skipped (no match).")


if __name__ == '__main__':
    main()
