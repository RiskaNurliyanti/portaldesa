<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; line-height: 1.6; }
  .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 10px; margin-bottom: 24px; }
  .kop h1 { font-size: 14pt; margin: 0; font-weight: bold; }
  .kop h2 { font-size: 16pt; margin: 3px 0; letter-spacing: 1px; font-weight: bold; }
  .kop p { margin: 0; font-size: 10pt; }
  .judul { text-align: center; margin-bottom: 20px; }
  .judul h3 { text-decoration: underline; margin: 0; font-size: 13pt; letter-spacing: 0.5px; font-weight: bold; }
  .judul p { margin: 2px 0; font-size: 12pt; }
  table.data td { padding: 2px 8px 2px 0; vertical-align: top; font-size: 12pt; }
  .isi { text-align: justify; margin: 16px 0; }
  .footer-table { width: 100%; margin-top: 40px; font-size: 12pt; }
  .ttd-box { text-align: center; width: 220px; }
  .qr-box { text-align: center; width: 130px; }
  .catatan { font-size: 9pt; color: #333; margin-top: 40px; border-top: 1px solid #ccc; padding-top: 8px; font-family: 'Helvetica', Arial, sans-serif; }
</style>
</head>
<body>
  <div class="kop">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="width: 70px; vertical-align: middle;">
          @if(file_exists(public_path('garuda.png')))
            <img src="{{ public_path('garuda.png') }}" width="60" height="60">
          @endif
        </td>
        <td style="text-align: center; vertical-align: middle;">
          <h1>PEMERINTAH KABUPATEN CIAMIS</h1>
          <h1>KECAMATAN CIKONENG</h1>
          <h2>DESA SUKAMAJU</h2>
          <p>Jl. Raya Sukamaju No. 1, Kec. Cikoneng, Kab. Ciamis, Jawa Barat</p>
        </td>
        <td style="width: 70px;"></td>
      </tr>
    </table>
  </div>

  <div class="judul">
    <h3>{{ strtoupper($jenisSurat) }}</h3>
    <p>Nomor: {{ $nomorSurat }}</p>
  </div>

  <div class="isi">
    {!! $isiSurat !!}
  </div>

  <p style="margin-top: 24px;">Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.</p>

  <table class="footer-table">
    <tr>
      <td class="qr-box">
        <img src="{{ $qrBase64 }}" width="90" height="90"><br>
        <span style="font-size: 9px;">Pindai untuk verifikasi keaslian</span>
      </td>
      <td></td>
      <td class="ttd-box">
        {{ $tempatTanggal }}<br>
        {{ $jabatan }},<br><br><br><br>
        <strong><u>{{ $namaPenandatangan }}</u></strong>
      </td>
    </tr>
  </table>

  <div class="catatan">
    Dokumen ini diterbitkan secara elektronik oleh Sistem Informasi Desa Sukamaju dan sah tanpa memerlukan tanda tangan basah.
    Keabsahan dokumen ini dapat diverifikasi melalui QR code di atas atau kunjungi {{ $verifikasiUrl }}
  </div>
</body>
</html>
