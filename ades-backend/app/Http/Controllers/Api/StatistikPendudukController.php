<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StatistikPenduduk;
use Illuminate\Http\Request;

class StatistikPendudukController extends Controller
{
    public function index(Request $request)
    {
        $tahun = $request->query('tahun', now()->year);

        return response()->json(
            StatistikPenduduk::where('tahun', $tahun)->get()
        );
    }

    // Admin: tambah atau update angka statistik per kategori+tahun
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori' => 'required|string|max:100',
            'jumlah' => 'required|integer|min:0',
            'tahun' => 'required|integer|min:2000|max:2100',
        ]);

        $data = StatistikPenduduk::updateOrCreate(
            ['kategori' => $validated['kategori'], 'tahun' => $validated['tahun']],
            ['jumlah' => $validated['jumlah']]
        );

        return response()->json($data, 201);
    }

    public function destroy(StatistikPenduduk $statistikPenduduk)
    {
        $statistikPenduduk->delete();

        return response()->json(['message' => 'Data statistik dihapus.']);
    }
}
