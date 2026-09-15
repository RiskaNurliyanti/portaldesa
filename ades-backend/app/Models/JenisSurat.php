<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisSurat extends Model
{
    protected $table = 'jenis_surat';

    protected $fillable = [
        'nama_surat',
        'deskripsi',
        'syarat',
        'estimasi_hari',
        'biaya',
    ];

    // Kolom "syarat" otomatis di-encode/decode sebagai array PHP <-> JSON di database
    protected $casts = [
        'syarat' => 'array',
    ];

    public function pengajuan()
    {
        return $this->hasMany(PengajuanSurat::class);
    }
}
