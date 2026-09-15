<?php

namespace Database\Seeders;

use App\Models\Galeri;
use Illuminate\Database\Seeder;

// Data dummy — diisi pakai foto dari paket referensi desain (bukan foto
// stok generik), sesuai instruksi: boleh dipakai untuk berita/galeri/
// profil, TIDAK untuk data surat/pengajuan.
class GaleriSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'kelompok' => 'panen-raya-2026',
                'judul' => 'Panen Raya Desa Sukamaju',
                'gambar' => '/storage/galeri/panen-raya-1.png',
                'kegiatan_at' => now()->subDays(3),
            ],
            [
                'kelompok' => 'festival-budaya-2026',
                'judul' => 'Festival Budaya & Pencak Silat',
                'gambar' => '/storage/galeri/festival-budaya-1.png',
                'kegiatan_at' => now()->subDays(8),
            ],
            [
                'kelompok' => 'gotong-royong-2026',
                'judul' => 'Gotong Royong Perbaikan Jalan',
                'gambar' => '/storage/galeri/gotong-royong-1.png',
                'kegiatan_at' => now()->subDays(15),
            ],
            [
                'kelompok' => 'posyandu-2026',
                'judul' => 'Kegiatan Posyandu Rutin',
                'gambar' => '/storage/galeri/posyandu-1.png',
                'kegiatan_at' => now()->subDays(22),
            ],
            [
                'kelompok' => 'musyawarah-2026',
                'judul' => 'Musyawarah Desa',
                'gambar' => '/storage/galeri/musyawarah-1.png',
                'kegiatan_at' => now()->subDays(30),
            ],
            [
                'kelompok' => 'sawah-2026',
                'judul' => 'Hamparan Sawah Terasering Sukamaju',
                'gambar' => '/storage/galeri/sawah-terasering-1.png',
                'kegiatan_at' => now()->subDays(40),
            ],
        ];

        foreach ($items as $item) {
            Galeri::updateOrCreate(
                ['kelompok' => $item['kelompok']],
                $item
            );
        }
    }
}
