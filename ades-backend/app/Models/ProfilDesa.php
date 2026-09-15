<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProfilDesa extends Model
{
    protected $table = 'profil_desa';

    protected $fillable = [
        'nama_desa',
        'alamat',
        'sejarah',
        'visi',
        'misi',
        'jumlah_dusun',
    ];
}
