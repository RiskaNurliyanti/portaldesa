<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Galeri;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GaleriController extends Controller
{
    public function index()
    {
        return response()->json(Galeri::orderByDesc('kegiatan_at')->orderByDesc('id')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'gambar' => 'required|array|min:1',
            'gambar.*' => 'image|max:8192',
            'kegiatan_at' => 'nullable|date',
        ]);

        // Semua foto yang diupload bareng di satu submit ini dikasih kode
        // kelompok yang sama, biar frontend bisa nampilinnya sebagai 1 kartu
        // dengan slider kalau lebih dari 1 foto.
        $kelompok = Str::uuid()->toString();
        $hasilUpload = [];

        foreach ($request->file('gambar') as $file) {
            $path = $file->store('galeri', 'public');

            $hasilUpload[] = Galeri::create([
                'kelompok' => $kelompok,
                'judul' => $validated['judul'],
                'gambar' => Storage::url($path),
                'kegiatan_at' => $validated['kegiatan_at'] ?? null,
            ]);
        }

        return response()->json($hasilUpload, 201);
    }

    public function destroy(Galeri $galeri)
    {
        $galeri->delete();

        return response()->json(['message' => 'Foto galeri dihapus.']);
    }
}
