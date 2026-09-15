<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Galeri extends Model
{
    protected $table = 'galeri';

    protected $fillable = [
        'kelompok',
        'judul',
        'gambar',
        'kegiatan_at',
    ];

    protected $casts = [
        'kegiatan_at' => 'date',
    ];
}
