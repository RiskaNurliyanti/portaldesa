<?php

namespace Database\Seeders;

use App\Models\JenisSurat;
use Illuminate\Database\Seeder;

class JenisSuratSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'nama_surat' => 'Surat Keterangan Domisili',
                'deskripsi' => 'Bukti alamat tempat tinggal untuk berbagai keperluan administrasi.',
                'syarat' => [
                    'Surat pengantar RT, dilanjut stempel RW',
                    'Fotokopi KTP (bawa asli untuk verifikasi)',
                    'Fotokopi Kartu Keluarga',
                ],
                'estimasi_hari' => 1,
                'biaya' => 'Gratis',
            ],
            [
                'nama_surat' => 'Surat Keterangan Tidak Mampu (SKTM)',
                'deskripsi' => 'Untuk keringanan biaya pendidikan, kesehatan, atau pengajuan bantuan sosial.',
                'syarat' => [
                    'Surat pengantar dan keterangan dari RT sampai dukuh',
                    'Surat pernyataan belum terdaftar di DTKS',
                    'Rincian biaya pendidikan atau rumah sakit',
                    'Fotokopi Kartu Keluarga',
                    'Fotokopi KTP',
                ],
                'estimasi_hari' => 3,
                'biaya' => 'Gratis',
            ],
            [
                'nama_surat' => 'Surat Keterangan Usaha (SKU)',
                'deskripsi' => 'Bukti legalitas usaha, misalnya untuk pengajuan kredit/KUR.',
                'syarat' => [
                    'Surat pengantar RT/RW',
                    'KTP asli dan fotokopi',
                    'Fotokopi Kartu Keluarga',
                ],
                'estimasi_hari' => 2,
                'biaya' => 'Gratis',
            ],
            [
                'nama_surat' => 'Surat Keterangan Kelahiran',
                'deskripsi' => 'Pendukung pembuatan akta kelahiran, terutama jika lahir di luar fasilitas kesehatan.',
                'syarat' => [
                    'Surat keterangan lahir dari bidan/rumah sakit',
                    'Fotokopi Kartu Keluarga',
                    'Fotokopi KTP orang tua',
                    'Fotokopi surat nikah orang tua',
                ],
                'estimasi_hari' => 2,
                'biaya' => 'Gratis',
            ],
            [
                'nama_surat' => 'Surat Keterangan Kematian',
                'deskripsi' => 'Untuk mengurus dokumen administrasi terkait kematian warga.',
                'syarat' => [
                    'Pengantar RT asli',
                    'Surat keterangan kematian dari rumah sakit/rukun kematian',
                    'Fotokopi KTP dan KK milik almarhum',
                    'Fotokopi KTP dan KK pelapor',
                ],
                'estimasi_hari' => 1,
                'biaya' => 'Gratis',
            ],
            [
                'nama_surat' => 'Surat Pengantar Nikah',
                'deskripsi' => 'Syarat administrasi pernikahan di KUA.',
                'syarat' => [
                    'Pengantar RT asli',
                    'Fotokopi KTP calon mempelai',
                    'Fotokopi Kartu Keluarga calon mempelai',
                    'Surat persetujuan orang tua bermaterai (jika di bawah 17 tahun)',
                ],
                'estimasi_hari' => 1,
                'biaya' => 'Gratis',
            ],
        ];

        foreach ($data as $item) {
            // updateOrCreate, bukan create polos — supaya seeder ini aman
            // dijalankan berkali-kali tanpa bikin data dobel
            JenisSurat::updateOrCreate(
                ['nama_surat' => $item['nama_surat']],
                $item
            );
        }
    }
}