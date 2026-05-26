<?php

namespace Database\Seeders;

use App\Models\Annonce;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnonceSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first()
            ?? User::first();

        $csvPath = __DIR__ . '/data.csv';
        $handle  = fopen($csvPath, 'r');
        $headers = fgetcsv($handle);   // skip header row

        // Normalise header names to simple ASCII keys
        $headers = array_map(fn($h) => mb_strtolower(trim($h)), $headers);

        // Skip rows already processed (one valid row per existing annonce)
        $skip     = Annonce::count();
        $skipped  = 0;
        $inserted = 0;

        while (($row = fgetcsv($handle)) !== false && $inserted < 100) {
            if (count($row) !== count($headers)) continue;

            $data = array_combine($headers, $row);

            $price = $this->parsePrice($data['prix'] ?? '');
            if ($price <= 0) continue;

            if ($skipped < $skip) { $skipped++; continue; }

            $mileage = $this->parseMileage($data['kilométrage'] ?? '');
            $year    = (int) ($data['année-modèle'] ?? 0);
            if ($year < 1970 || $year > 2026) continue;

            $brand = trim($data['marque'] ?? '');
            $model = trim($data['modèle'] ?? '');
            if (!$brand || !$model) continue;

            $city        = $this->parseCity($data['localisation'] ?? '');
            $doors       = $this->parseDoors($data['nombre de portes'] ?? '');
            $origin      = trim($data['origine'] ?? '') ?: null;
            $firstHand   = $this->parseBool($data['première main'] ?? '');
            $fuelType    = trim($data['type de carburant'] ?? '') ?: 'Diesel';
            $transmission= trim($data['boite de vitesses'] ?? '') ?: 'Manuelle';
            $fiscalPower = trim($data['puissance fiscale'] ?? '') ?: null;
            $condition   = trim($data['état'] ?? '') ?: 'Bon';
            $title       = trim($data['titre'] ?? '') ?: "$brand $model $year";

            $options = [
                'abs'               => $this->parseBool($data['abs'] ?? ''),
                'airbags'           => $this->parseBool($data['airbags'] ?? ''),
                'bluetooth'         => $this->parseBool($data['cd/mp3/bluetooth'] ?? ''),
                'camera_recul'      => $this->parseBool($data['caméra de recul'] ?? ''),
                'climatisation'     => $this->parseBool($data['climatisation'] ?? ''),
                'esp'               => $this->parseBool($data['esp'] ?? ''),
                'jantes_alu'        => $this->parseBool($data['jantes aluminium'] ?? ''),
                'limiteur_vitesse'  => $this->parseBool($data['limiteur de vitesse'] ?? ''),
                'ordinateur_bord'   => $this->parseBool($data['ordinateur de bord'] ?? ''),
                'radar_recul'       => $this->parseBool($data['radar de recul'] ?? ''),
                'regulateur'        => $this->parseBool($data['régulateur de vitesse'] ?? ''),
                'sieges_cuir'       => $this->parseBool($data['sièges cuir'] ?? ''),
                'gps'               => $this->parseBool($data['système de navigation/gps'] ?? ''),
                'toit_ouvrant'      => $this->parseBool($data['toit ouvrant'] ?? ''),
                'verrouillage'      => $this->parseBool($data['verrouillage centralisé à distance'] ?? ''),
                'vitres_electriques'=> $this->parseBool($data['vitres électriques'] ?? ''),
            ];

            $description = $this->buildDescription(
                $brand, $model, $year, $fuelType, $transmission,
                $mileage, $condition, $city, $options
            );

            Annonce::create([
                'user_id'      => $admin->id,
                'title'        => $title,
                'description'  => $description,
                'price'        => $price,
                'brand'        => $brand,
                'model'        => $model,
                'model_year'   => $year,
                'mileage'      => $mileage,
                'fuel_type'    => $fuelType,
                'transmission' => $transmission,
                'fiscal_power' => $fiscalPower,
                'car_condition'=> $condition,
                'status'       => 'approved',
                'city'         => $city,
                'doors'        => $doors,
                'origin'       => $origin,
                'first_hand'   => $firstHand,
                'options'      => $options,
            ]);

            $inserted++;
        }

        fclose($handle);
        $this->command->info("Inserted $inserted annonces from CSV.");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private function parsePrice(string $raw): float
    {
        // "78 000 DH"  →  78000
        $clean = preg_replace('/[^\d]/', '', $raw);
        return $clean ? (float) $clean : 0;
    }

    private function parseMileage(string $raw): int
    {
        // "250 000 - 299 999" → 275000 (midpoint), "300 000+" → 300000
        preg_match_all('/\d[\d\s]*/', $raw, $m);
        $nums = array_values(array_map(
            fn($n) => (int) preg_replace('/\s/', '', $n),
            array_filter($m[0], fn($n) => trim($n) !== '')
        ));
        if (count($nums) >= 2) return (int) (($nums[0] + $nums[1]) / 2);
        if (count($nums) === 1) return $nums[0];
        return 0;
    }

    private function parseCity(string $raw): ?string
    {
        // "Castilla, Tanger"  →  "Tanger"
        // "Toute la ville, Had Soualem"  →  "Had Soualem"
        $parts = explode(',', $raw);
        return trim(end($parts)) ?: null;
    }

    private function parseDoors(string $raw): ?int
    {
        $v = (int) $raw;
        return $v > 0 ? $v : null;
    }

    private function parseBool(string $raw): bool
    {
        $raw = strtolower(trim($raw));
        return in_array($raw, ['true', 'oui', '1', 'yes'], true);
    }

    private function buildDescription(
        string $brand, string $model, int $year,
        string $fuel, string $trans, int $mileage,
        string $condition, ?string $city, array $opts
    ): string {
        $km    = number_format($mileage, 0, '.', ' ');
        $equip = array_keys(array_filter($opts));
        $labels = [
            'abs' => 'ABS', 'airbags' => 'Airbags', 'bluetooth' => 'Bluetooth',
            'camera_recul' => 'Caméra de recul', 'climatisation' => 'Climatisation',
            'esp' => 'ESP', 'jantes_alu' => 'Jantes aluminium',
            'limiteur_vitesse' => 'Limiteur de vitesse', 'ordinateur_bord' => 'Ordinateur de bord',
            'radar_recul' => 'Radar de recul', 'regulateur' => 'Régulateur de vitesse',
            'sieges_cuir' => 'Sièges cuir', 'gps' => 'GPS',
            'toit_ouvrant' => 'Toit ouvrant', 'verrouillage' => 'Verrouillage centralisé',
            'vitres_electriques' => 'Vitres électriques',
        ];
        $equipStr = implode(', ', array_map(fn($k) => $labels[$k] ?? $k, $equip));

        $desc = "$brand $model $year — $fuel, $trans, $km km. État : $condition.";
        if ($city) $desc .= " Situé à $city.";
        if ($equipStr) $desc .= " Équipements : $equipStr.";
        return $desc;
    }
}
