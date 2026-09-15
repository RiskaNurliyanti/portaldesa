<?php

namespace Database\Seeders;

use App\Models\Berita;
use Illuminate\Database\Seeder;

// Data dummy — diisi pakai foto dari paket referensi desain (bukan foto
// stok generik), sesuai instruksi: boleh dipakai untuk berita/galeri/
// profil, TIDAK untuk data surat/pengajuan.
class BeritaSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            [
                'judul' => 'Panen Raya Serentak, Hasil Gabah Desa Sukamaju Meningkat',
                'gambar' => '/storage/berita/panen-raya-2026.png',
                'konten' => "Warga Desa Sukamaju bersama kelompok tani (Gapoktan) Makmur Lestari menggelar panen raya serentak di area persawahan Dusun I dan Dusun II. Hasil panen musim ini tercatat meningkat dibanding musim sebelumnya, didukung oleh perbaikan saluran irigasi yang rampung awal tahun.\n\nKepala Desa menyampaikan apresiasi kepada seluruh petani atas kerja keras sepanjang musim tanam, dan berharap hasil panen kali ini dapat menopang ketahanan pangan desa serta meningkatkan kesejahteraan warga.\n\nPemerintah desa juga menyampaikan bahwa dukungan terhadap kelompok tani akan terus dilanjutkan lewat program penyediaan bibit unggul dan pelatihan pertanian pada tahun anggaran berikutnya.",
                'published_at' => now()->subDays(3),
            ],
            [
                'judul' => 'Meriahnya Festival Budaya & Pertunjukan Pencak Silat Desa',
                'gambar' => '/storage/berita/festival-budaya-desa.png',
                'konten' => "Dalam rangka melestarikan budaya lokal, Desa Sukamaju menggelar Festival Budaya tahunan yang diisi dengan pertunjukan pencak silat, kesenian tradisional, dan bazar UMKM warga. Kegiatan ini berlangsung meriah dan dihadiri oleh warga dari berbagai dusun.\n\nPertunjukan pencak silat yang dibawakan oleh sanggar seni desa mendapat sambutan antusias, terutama dari generasi muda yang turut diajak untuk mengenal dan melestarikan seni bela diri tradisional ini.\n\nPanitia berharap festival ini dapat terus rutin diselenggarakan setiap tahun sebagai bagian dari upaya menjaga identitas budaya desa di tengah arus modernisasi.",
                'published_at' => now()->subDays(8),
            ],
            [
                'judul' => 'Gotong Royong Perbaikan Infrastruktur Jalan Desa',
                'gambar' => '/storage/berita/gotong-royong-jalan-desa.png',
                'konten' => "Puluhan warga berpartisipasi dalam kegiatan gotong royong perbaikan jalan penghubung antar-dusun yang rusak akibat musim hujan. Kegiatan ini merupakan bagian dari program kerja bakti rutin yang digagas oleh pemerintah desa bersama karang taruna.\n\nSelain perbaikan jalan, kegiatan gotong royong juga mencakup pembersihan saluran drainase untuk mencegah genangan air saat musim hujan tiba.\n\nKepala Dusun menyampaikan terima kasih atas partisipasi aktif warga, dan menekankan bahwa semangat gotong royong adalah modal utama pembangunan desa yang berkelanjutan.",
                'published_at' => now()->subDays(15),
            ],
            [
                'judul' => 'Kegiatan Posyandu Rutin: Pemeriksaan Kesehatan Ibu dan Balita',
                'gambar' => '/storage/berita/posyandu-rutin.png',
                'konten' => "Posyandu Desa Sukamaju kembali menggelar kegiatan rutin bulanan berupa pemeriksaan kesehatan ibu hamil, penimbangan balita, dan pemberian imunisasi. Kegiatan ini dilaksanakan di Balai Desa dengan didampingi bidan desa dan kader kesehatan setempat.\n\nSelain pemeriksaan kesehatan, ibu-ibu peserta posyandu juga mendapatkan penyuluhan seputar gizi seimbang untuk balita serta pentingnya pemeriksaan kehamilan secara berkala.\n\nPemerintah desa mengimbau seluruh ibu yang memiliki balita untuk rutin membawa anaknya ke posyandu setiap bulan guna memantau tumbuh kembang anak secara optimal.",
                'published_at' => now()->subDays(22),
            ],
            [
                'judul' => 'Musyawarah Desa Bahas Rencana Pembangunan Tahun Depan',
                'gambar' => '/storage/berita/musyawarah-desa.png',
                'konten' => "Pemerintah Desa Sukamaju menggelar Musyawarah Desa (Musdes) yang dihadiri oleh perangkat desa, BPD, tokoh masyarakat, dan perwakilan warga dari tiap dusun. Musdes kali ini membahas prioritas penggunaan dana desa untuk tahun anggaran mendatang.\n\nBeberapa usulan prioritas yang mengemuka dalam musyawarah antara lain perbaikan infrastruktur jalan, peningkatan layanan kesehatan, dan pengembangan potensi ekonomi lokal berbasis pertanian.\n\nHasil musyawarah ini akan menjadi acuan dalam penyusunan Rencana Kerja Pemerintah Desa (RKPDes) yang akan disahkan pada rapat berikutnya.",
                'published_at' => now()->subDays(30),
            ],
        ];

        foreach ($items as $item) {
            Berita::updateOrCreate(
                ['judul' => $item['judul']],
                $item
            );
        }
    }
}
