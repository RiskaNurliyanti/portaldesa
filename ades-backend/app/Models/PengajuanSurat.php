<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PengajuanSurat extends Model
{
    protected $table = 'pengajuan_surat';

    protected $fillable = [
        'user_id',
        'jenis_surat_id',
        'nama_pemohon',
        'nik',
        'tempat_lahir',
        'tanggal_lahir',
        'jenis_kelamin',
        'agama',
        'pekerjaan',
        'alamat',
        'keperluan',
        'data_tambahan',
        'lampiran',
        'lampiran_files',
        'status',
        'catatan_admin',
        'riwayat_revisi',
        'nomor_surat',
        'kode_verifikasi',
        'file_surat',
        'ditandatangani_oleh',
        'finalized_at',
        'alasan_pembatalan',
        'dibatalkan_pada',
        'pengganti_dari_id',
    ];

    protected $casts = [
        'tanggal_lahir' => 'date',
        'data_tambahan' => 'array',
        'lampiran_files' => 'array',
        'riwayat_revisi' => 'array',
        'finalized_at' => 'datetime',
        'dibatalkan_pada' => 'datetime',
    ];

    public function jenisSurat()
    {
        return $this->belongsTo(JenisSurat::class, 'jenis_surat_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Surat LAMA yang digantikan oleh baris ini (kalau baris ini lahir
    // dari alur "Batalkan & Terbitkan Ulang").
    public function suratAsal()
    {
        return $this->belongsTo(PengajuanSurat::class, 'pengganti_dari_id');
    }

    // Surat PENGGANTI yang dibuat waktu baris ini dibatalkan (kebalikan
    // dari suratAsal()). Null kalau baris ini belum pernah dibatalkan.
    public function suratPengganti()
    {
        return $this->hasOne(PengajuanSurat::class, 'pengganti_dari_id');
    }
}
