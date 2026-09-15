<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use Illuminate\Http\Request;

class NotifikasiController extends Controller
{
    // Ambil notifikasi buat user yang lagi login (admin lihat notif untuk_admin,
    // warga lihat notif miliknya sendiri)
    public function index(Request $request)
    {
        $user = $request->user();

        $query = $user->role === 'admin'
            ? Notifikasi::where('untuk_admin', true)
            : Notifikasi::where('user_id', $user->id);

        $notifikasi = $query->orderByDesc('created_at')->limit(30)->get();

        return response()->json([
            'data' => $notifikasi,
            'jumlah_belum_dibaca' => (clone $query)->where('dibaca', false)->count(),
        ]);
    }

    public function tandaiDibaca(Request $request, Notifikasi $notifikasi)
    {
        $user = $request->user();

        // Pastikan gak bisa nandain notif orang lain
        $bolehAkses = $user->role === 'admin'
            ? $notifikasi->untuk_admin
            : $notifikasi->user_id === $user->id;

        if (! $bolehAkses) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $notifikasi->update(['dibaca' => true]);

        return response()->json($notifikasi);
    }

    public function tandaiSemuaDibaca(Request $request)
    {
        $user = $request->user();

        $query = $user->role === 'admin'
            ? Notifikasi::where('untuk_admin', true)
            : Notifikasi::where('user_id', $user->id);

        $query->update(['dibaca' => true]);

        return response()->json(['message' => 'Semua notifikasi ditandai dibaca.']);
    }
}
