<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class BeritaController extends Controller
{
    // Publik: hanya berita yang sudah published, bisa dicari lewat ?q=
    public function index(Request $request)
    {
        $query = Berita::whereNotNull('published_at')
            ->where('published_at', '<=', now());

        if ($request->filled('q')) {
            $query->where(function ($sub) use ($request) {
                $sub->where('judul', 'like', '%' . $request->query('q') . '%')
                    ->orWhere('konten', 'like', '%' . $request->query('q') . '%');
            });
        }

        // per_page bisa disesuaikan dari frontend (dibatasi maks 100 biar
        // gak disalahgunakan buat narik seluruh tabel sekaligus)
        $perPage = min((int) $request->input('per_page', 9), 100);

        return response()->json($query->orderByDesc('published_at')->paginate($perPage));
    }

    public function show(string $slug)
    {
        return response()->json(Berita::where('slug', $slug)->firstOrFail());
    }

    // Admin: termasuk draft yang belum publish
    public function adminIndex()
    {
        return response()->json(Berita::orderByDesc('created_at')->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'judul' => 'required|string|max:255',
            'konten' => 'required|string',
            'gambar' => 'nullable|image|max:8192',
            'galeri' => 'nullable|array',
            'galeri.*' => 'image|max:8192',
            'published_at' => 'nullable|date',
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = Storage::url($request->file('gambar')->store('berita', 'public'));
        } else {
            unset($validated['gambar']);
        }

        if ($request->hasFile('galeri')) {
            $validated['galeri'] = collect($request->file('galeri'))
                ->map(fn ($file) => Storage::url($file->store('berita', 'public')))
                ->values()
                ->all();
        } else {
            unset($validated['galeri']);
        }

        return response()->json(Berita::create($validated), 201);
    }

    public function update(Request $request, Berita $berita)
    {
        $validated = $request->validate([
            'judul' => 'sometimes|required|string|max:255',
            'konten' => 'sometimes|required|string',
            'gambar' => 'nullable|image|max:8192',
            'galeri' => 'nullable|array',
            'galeri.*' => 'image|max:8192',
            'published_at' => 'nullable|date',
        ]);

        if ($request->hasFile('gambar')) {
            $validated['gambar'] = Storage::url($request->file('gambar')->store('berita', 'public'));
        } else {
            unset($validated['gambar']);
        }

        if ($request->hasFile('galeri')) {
            $fotoBaru = collect($request->file('galeri'))
                ->map(fn ($file) => Storage::url($file->store('berita', 'public')))
                ->values()
                ->all();
        } else {
            $fotoBaru = [];
        }

        // "galeri_tetap" isinya daftar foto lama yang MASIH mau dipertahankan
        // (admin bisa hapus foto lama lewat form, jadi ini bukan cuma nambah)
        $galeriTetap = [];
        if ($request->filled('galeri_tetap')) {
            $galeriTetap = json_decode($request->input('galeri_tetap'), true) ?? [];
        }

        $galeriGabungan = array_values(array_merge($galeriTetap, $fotoBaru));
        $validated['galeri'] = $galeriGabungan ?: null;

        $berita->update($validated);

        return response()->json($berita);
    }

    public function destroy(Berita $berita)
    {
        $berita->delete();

        return response()->json(['message' => 'Berita dihapus.']);
    }
}
