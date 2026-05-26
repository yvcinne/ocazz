#!/usr/bin/env python3
"""
Scrape car images from avito.ma and insert into the images table.

Usage:
    python scripts/scrape_avito_images.py              # process all cars without images
    python scripts/scrape_avito_images.py --limit 50   # process first 50
    python scripts/scrape_avito_images.py --force       # re-scrape even if already has images
    python scripts/scrape_avito_images.py --dry-run     # print results, don't write to DB
"""

import argparse
import os
import re
import time
import sys
import unicodedata
import mysql.connector
from playwright.sync_api import sync_playwright

# ── Config ────────────────────────────────────────────────────────────────────

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH   = os.path.join(SCRIPT_DIR, '..', '.env')

DELAY_BETWEEN_CARS = 1.5   # seconds between requests (be polite)
IMAGES_PER_CAR     = 3     # how many images to grab per car
TIMEOUT_MS         = 25000


# ── Helpers ───────────────────────────────────────────────────────────────────

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
        print(f"[ERROR] .env file not found at {path}")
        sys.exit(1)
    return config


def get_db(env):
    return mysql.connector.connect(
        host     = env.get('DB_HOST', '127.0.0.1'),
        port     = int(env.get('DB_PORT', 3306)),
        database = env.get('DB_DATABASE', 'laravel'),
        user     = env.get('DB_USERNAME', 'root'),
        password = env.get('DB_PASSWORD', ''),
    )


def slugify(text):
    """Convert "Land Rover" → "land_rover", "Citroën" → "citroen" """
    text = text.lower().strip()
    # Normalize accented chars
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = re.sub(r'[^a-z0-9]+', '_', text)
    return text.strip('_')


def build_avito_url(brand, model):
    return f"https://www.avito.ma/fr/maroc/{slugify(brand)}_{slugify(model)}"


def scrape_images(page, brand, model):
    url = build_avito_url(brand, model)
    try:
        page.goto(url, timeout=TIMEOUT_MS)
        time.sleep(2.5)

        # Extract images from listing cards (classifieds, not store logos)
        result = page.evaluate("""() => {
            const imgs = document.querySelectorAll("img[src*='content.avito.ma/classifieds']");
            const seen  = new Set();
            const out   = [];
            for (const img of imgs) {
                const src = img.getAttribute('src');
                if (src && !seen.has(src)) {
                    seen.add(src);
                    out.push(src);
                    if (out.length >= 5) break;
                }
            }
            return out;
        }""")

        return result[:IMAGES_PER_CAR]

    except Exception as exc:
        print(f"\n  [WARN] {brand} {model}: {exc}")
        return []


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--limit',   type=int, default=9999, help='Max annonces to process')
    parser.add_argument('--force',   action='store_true',    help='Re-scrape cars that already have images')
    parser.add_argument('--dry-run', action='store_true',    help='Print URLs without inserting into DB')
    args = parser.parse_args()

    env = load_env(ENV_PATH)
    db  = get_db(env)
    cur = db.cursor(dictionary=True)

    # Fetch annonces to process
    if args.force:
        cur.execute(
            "SELECT id, brand, model, model_year FROM annonces WHERE status='approved' LIMIT %s",
            (args.limit,)
        )
    else:
        cur.execute(
            """SELECT a.id, a.brand, a.model, a.model_year
               FROM annonces a
               LEFT JOIN images i ON i.annonce_id = a.id
               WHERE a.status = 'approved' AND i.id IS NULL
               LIMIT %s""",
            (args.limit,)
        )

    annonces = cur.fetchall()

    if not annonces:
        print("Nothing to process — all cars already have images.")
        db.close()
        return

    print(f"Processing {len(annonces)} car(s) from avito.ma…\n")

    fetched = 0
    skipped = 0

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            viewport={'width': 1280, 'height': 800},
        )
        page = ctx.new_page()
        # Block fonts/CSS/media to speed things up
        page.route("**/*.{woff,woff2,ttf,svg}", lambda r: r.abort())

        for i, annonce in enumerate(annonces, 1):
            aid   = annonce['id']
            brand = annonce['brand']
            model = annonce['model']
            year  = annonce['model_year']

            print(f"[{i}/{len(annonces)}] {brand} {model} {year} … ", end='', flush=True)

            urls = scrape_images(page, brand, model)

            if not urls:
                print("no images found")
                skipped += 1
            else:
                print(f"{len(urls)} image(s)")
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
                        print(f"    {url}")
                fetched += 1

            time.sleep(DELAY_BETWEEN_CARS)

        browser.close()

    cur.close()
    db.close()

    print(f"\nDone. Images fetched for {fetched} car(s), {skipped} skipped.")


if __name__ == '__main__':
    main()
