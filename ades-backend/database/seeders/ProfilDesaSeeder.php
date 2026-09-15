<?php

namespace Database\Seeders;

use App\Models\ProfilDesa;
use Illuminate\Database\Seeder;

class ProfilDesaSeeder extends Seeder
{
    public function run(): void
    {
        ProfilDesa::updateOrCreate(
            ['id' => 1],
            [
                'nama_desa' => 'Desa Sukamaju',
                'alamat' => 'Jl. Raya Sukamaju No. 1, Kec. Cikoneng, Kab. Ciamis, Jawa Barat',
                'sejarah' => 'Desa Sukamaju berdiri sejak tahun 1945 dan terus berkembang menjadi desa yang mandiri dengan mengedepankan gotong royong warganya. (Ganti teks ini lewat halaman Admin > Profil Desa)',
                'visi' => 'Mewujudkan Desa Sukamaju yang mandiri, sejahtera, dan berbudaya.',
                'misi' => "1. Meningkatkan pelayanan publik yang cepat dan transparan.\n2. Mendorong pertumbuhan ekonomi warga melalui UMKM.\n3. Menjaga kelestarian lingkungan dan budaya desa.",
                'jumlah_dusun' => 4,
            ]
        );
    }
}
