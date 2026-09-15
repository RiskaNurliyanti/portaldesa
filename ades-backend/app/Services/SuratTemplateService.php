<?php

namespace App\Services;

use App\Models\PengajuanSurat;

/**
 * Nyusun isi (body) surat sesuai jenisnya. Setiap jenis surat punya kalimat
 * dan data yang beda — Domisili beda formatnya sama Kelahiran, misalnya.
 * Format kalimat mengacu ke template resmi surat keterangan desa/kelurahan.
 */
class SuratTemplateService
{
    public function build(PengajuanSurat $pengajuan): string
    {
        $nama = $pengajuan->jenisSurat->nama_surat;
        $data = $pengajuan->data_tambahan ?? [];

        return match (true) {
            str_contains($nama, 'Domisili') => $this->domisili($pengajuan),
            str_contains($nama, 'Tidak Mampu') => $this->sktm($pengajuan),
            str_contains($nama, 'Usaha') => $this->sku($pengajuan, $data),
            str_contains($nama, 'Kelahiran') => $this->kelahiran($pengajuan, $data),
            str_contains($nama, 'Kematian') => $this->kematian($pengajuan, $data),
            str_contains($nama, 'Nikah') => $this->pengantarNikah($pengajuan, $data),
            default => $this->generic($pengajuan),
        };
    }

    private function tabelDataDiri(PengajuanSurat $p): string
    {
        $jenisKelamin = match ($p->jenis_kelamin) {
            'L' => 'Laki-laki',
            'P' => 'Perempuan',
            default => '-',
        };

        $ttl = trim(($p->tempat_lahir ?: '-') . ', ' . ($p->tanggal_lahir?->translatedFormat('d F Y') ?: '-'));

        $rows = [
            ['Nama', $p->nama_pemohon],
            ['NIK', $p->nik],
            ['Tempat/Tgl Lahir', $ttl],
            ['Jenis Kelamin', $jenisKelamin],
            ['Agama', $p->agama ?: '-'],
            ['Pekerjaan', $p->pekerjaan ?: '-'],
            ['Alamat', $p->alamat ?: '-'],
        ];

        $html = '<table class="data">';
        foreach ($rows as [$label, $value]) {
            $html .= "<tr><td width=\"150\">{$label}</td><td>: {$value}</td></tr>";
        }
        $html .= '</table>';

        return $html;
    }

    private function domisili(PengajuanSurat $p): string
    {
        $dataDiri = $this->tabelDataDiri($p);

        return "Yang bertandatangan di bawah ini Kepala Desa Sukamaju, Kecamatan Cikoneng, Kabupaten Ciamis, menerangkan dengan sebenarnya bahwa:
        {$dataDiri}
        <p>adalah benar merupakan penduduk yang berdomisili di alamat tersebut di atas. Surat keterangan ini dibuat untuk keperluan: <strong>{$p->keperluan}</strong>.</p>";
    }

    private function sktm(PengajuanSurat $p): string
    {
        $dataDiri = $this->tabelDataDiri($p);

        return "Yang bertandatangan di bawah ini Kepala Desa Sukamaju menerangkan dengan sebenarnya bahwa:
        {$dataDiri}
        <p>adalah benar warga Desa Sukamaju yang termasuk dalam kategori kurang mampu secara ekonomi. Surat keterangan ini dibuat untuk keperluan: <strong>{$p->keperluan}</strong>.</p>";
    }

    private function sku(PengajuanSurat $p, array $data): string
    {
        $dataDiri = $this->tabelDataDiri($p);
        $namaUsaha = $data['nama_usaha'] ?? '-';
        $jenisUsaha = $data['jenis_usaha'] ?? '-';

        return "Yang bertandatangan di bawah ini Kepala Desa Sukamaju menerangkan dengan sebenarnya bahwa:
        {$dataDiri}
        <p>adalah benar memiliki usaha dengan rincian sebagai berikut:</p>
        <table class=\"data\">
          <tr><td width=\"150\">Nama Usaha</td><td>: {$namaUsaha}</td></tr>
          <tr><td>Jenis Usaha</td><td>: {$jenisUsaha}</td></tr>
        </table>
        <p>Surat keterangan ini dibuat untuk keperluan: <strong>{$p->keperluan}</strong>.</p>";
    }

    private function kelahiran(PengajuanSurat $p, array $data): string
    {
        $namaAnak = $data['nama_anak'] ?? '-';
        $jenisKelaminAnak = ($data['jenis_kelamin_anak'] ?? '') === 'L' ? 'laki-laki' : 'perempuan';
        $tempatLahirAnak = $data['tempat_lahir_anak'] ?? '-';
        $tanggalLahirAnak = $data['tanggal_lahir_anak'] ?? '-';
        $namaAyah = $data['nama_ayah'] ?? '-';
        $namaIbu = $data['nama_ibu'] ?? '-';

        return "Yang bertandatangan di bawah ini Kepala Desa Sukamaju menerangkan dengan sebenarnya bahwa telah lahir seorang anak {$jenisKelaminAnak} dengan rincian sebagai berikut:
        <table class=\"data\">
          <tr><td width=\"160\">Nama Anak</td><td>: {$namaAnak}</td></tr>
          <tr><td>Tempat/Tgl Lahir</td><td>: {$tempatLahirAnak}, {$tanggalLahirAnak}</td></tr>
          <tr><td>Nama Ayah</td><td>: {$namaAyah}</td></tr>
          <tr><td>Nama Ibu</td><td>: {$namaIbu}</td></tr>
        </table>
        <p>Surat keterangan ini dibuat sebagai bukti kelahiran untuk keperluan: <strong>{$p->keperluan}</strong>.</p>";
    }

    private function kematian(PengajuanSurat $p, array $data): string
    {
        $namaAlmarhum = $data['nama_almarhum'] ?? $p->nama_pemohon;
        $tanggalMeninggal = $data['tanggal_meninggal'] ?? '-';
        $tempatMeninggal = $data['tempat_meninggal'] ?? '-';
        $sebab = $data['sebab_kematian'] ?? '-';

        return "Yang bertandatangan di bawah ini Kepala Desa Sukamaju menerangkan dengan sebenarnya bahwa telah meninggal dunia:
        <table class=\"data\">
          <tr><td width=\"160\">Nama</td><td>: {$namaAlmarhum}</td></tr>
          <tr><td>Tanggal Meninggal</td><td>: {$tanggalMeninggal}</td></tr>
          <tr><td>Tempat Meninggal</td><td>: {$tempatMeninggal}</td></tr>
          <tr><td>Sebab</td><td>: {$sebab}</td></tr>
        </table>
        <p>Surat ini dilaporkan oleh {$p->nama_pemohon} (NIK: {$p->nik}), untuk keperluan: <strong>{$p->keperluan}</strong>.</p>";
    }

    private function pengantarNikah(PengajuanSurat $p, array $data): string
    {
        $dataDiri = $this->tabelDataDiri($p);
        $namaPasangan = $data['nama_pasangan'] ?? '-';
        $nikPasangan = $data['nik_pasangan'] ?? '-';

        return "Yang bertandatangan di bawah ini Kepala Desa Sukamaju menerangkan dengan sebenarnya bahwa:
        {$dataDiri}
        <p>akan melangsungkan pernikahan dengan:</p>
        <table class=\"data\">
          <tr><td width=\"150\">Nama Pasangan</td><td>: {$namaPasangan}</td></tr>
          <tr><td>NIK Pasangan</td><td>: {$nikPasangan}</td></tr>
        </table>
        <p>Surat pengantar ini dibuat untuk keperluan pendaftaran nikah di KUA setempat.</p>";
    }

    private function generic(PengajuanSurat $p): string
    {
        $dataDiri = $this->tabelDataDiri($p);

        return "Yang bertandatangan di bawah ini Kepala Desa Sukamaju menerangkan dengan sebenarnya bahwa:
        {$dataDiri}
        <p>Surat keterangan ini dibuat untuk keperluan: <strong>{$p->keperluan}</strong>.</p>";
    }
}
