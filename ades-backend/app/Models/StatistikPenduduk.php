<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StatistikPenduduk extends Model
{
    protected $table = 'statistik_penduduk';

    protected $fillable = [
        'kategori',
        'jumlah',
        'tahun',
    ];
}
