<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Berita extends Model
{
    protected $table = 'berita';

    protected $fillable = [
        'judul',
        'slug',
        'konten',
        'gambar',
        'galeri',
        'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
        'galeri' => 'array',
    ];

    // Slug otomatis dibuat dari judul kalau tidak diisi manual
    protected static function booted(): void
    {
        static::creating(function (Berita $berita) {
            if (empty($berita->slug)) {
                $berita->slug = Str::slug($berita->judul) . '-' . uniqid();
            }
        });
    }
}
