<?php

namespace App\Console\Commands;

use App\Models\Annonce;
use App\Models\Image;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class FetchCarImages extends Command
{
    protected $signature = 'annonces:fetch-images
                            {--limit=50 : Number of annonces to process}
                            {--force    : Re-fetch even if annonce already has images}';

    protected $description = 'Fetch one car image per annonce from the Pexels API';

    public function handle(): int
    {
        $apiKey = config('services.pexels.key');

        if (! $apiKey) {
            $this->error('PEXELS_API_KEY is not set in .env');
            return 1;
        }

        $limit = (int) $this->option('limit');
        $force = $this->option('force');

        $query = Annonce::where('status', 'approved');

        if (! $force) {
            $query->whereDoesntHave('images');
        }

        $annonces = $query->limit($limit)->get();

        if ($annonces->isEmpty()) {
            $this->info('No annonces to process.');
            return 0;
        }

        $this->info("Processing {$annonces->count()} annonce(s)…");
        $bar = $this->output->createProgressBar($annonces->count());
        $bar->start();

        $fetched = 0;
        $failed  = 0;

        foreach ($annonces as $annonce) {
            // Build search query: "BMW Serie 3 car" gives better results than model alone
            $search = urlencode("{$annonce->brand} {$annonce->model} car");

            $response = Http::withHeaders([
                'Authorization' => $apiKey,
            ])->get("https://api.pexels.com/v1/search?query={$search}&per_page=3&orientation=landscape");

            if ($response->successful()) {
                $photos = $response->json('photos', []);

                // Pick the first photo that isn't a generic stock photo
                $url = null;
                foreach ($photos as $photo) {
                    $url = $photo['src']['large'] ?? $photo['src']['medium'] ?? null;
                    if ($url) break;
                }

                if ($url) {
                    if ($force) {
                        Image::where('annonce_id', $annonce->id)->delete();
                    }
                    Image::create(['annonce_id' => $annonce->id, 'url' => $url]);
                    $fetched++;
                } else {
                    $failed++;
                }
            } else {
                $failed++;
                // Stop on auth error
                if ($response->status() === 403) {
                    $this->newLine();
                    $this->error('Pexels API returned 403 — check your API key.');
                    break;
                }
            }

            $bar->advance();
            // Stay within Pexels rate limit (200 req/hour = ~1 req/18s, but in practice 1 req/0.5s is fine)
            usleep(300_000); // 300ms between requests
        }

        $bar->finish();
        $this->newLine();
        $this->info("Done. Fetched: {$fetched} — Failed/skipped: {$failed}");

        return 0;
    }
}
