<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table = 'notifikasi';

    protected $fillable = [
        'user_id',
        'untuk_admin',
        'judul',
        'pesan',
        'link',
        'dibaca',
    ];

    protected $casts = [
        'untuk_admin' => 'boolean',
        'dibaca' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper: bikin notifikasi yang muncul di semua akun admin
    public static function buatUntukAdmin(string $judul, string $pesan, ?string $link = null): self
    {
        return self::create([
            'untuk_admin' => true,
            'judul' => $judul,
            'pesan' => $pesan,
            'link' => $link,
        ]);
    }

    // Helper: bikin notifikasi buat satu warga tertentu
    public static function buatUntukUser(int $userId, string $judul, string $pesan, ?string $link = null): self
    {
        return self::create([
            'user_id' => $userId,
            'judul' => $judul,
            'pesan' => $pesan,
            'link' => $link,
        ]);
    }
}
