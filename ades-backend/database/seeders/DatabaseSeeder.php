<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            \Database\Seeders\JenisSuratSeeder::class,
            \Database\Seeders\AdminUserSeeder::class,
            \Database\Seeders\ProfilDesaSeeder::class,
            \Database\Seeders\BeritaSeeder::class,
            \Database\Seeders\GaleriSeeder::class,
        ]);
    }
}