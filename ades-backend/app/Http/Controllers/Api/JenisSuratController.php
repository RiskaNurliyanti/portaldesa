<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JenisSurat;
use Illuminate\Http\Request;

class JenisSuratController extends Controller
{
    public function index()
    {
        return response()->json(JenisSurat::orderBy('nama_surat')->get());
    }

    public function show(JenisSurat $jenisSurat)
    {
        return response()->json($jenisSurat);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_surat' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'syarat' => 'required|array|min:1',
            'syarat.*' => 'string',
            'estimasi_hari' => 'nullable|integer|min:1',
            'biaya' => 'nullable|string|max:100',
        ]);

        return response()->json(JenisSurat::create($validated), 201);
    }

    public function update(Request $request, JenisSurat $jenisSurat)
    {
        $validated = $request->validate([
            'nama_surat' => 'sometimes|required|string|max:255',
            'deskripsi' => 'nullable|string',
            'syarat' => 'sometimes|required|array|min:1',
            'syarat.*' => 'string',
            'estimasi_hari' => 'nullable|integer|min:1',
            'biaya' => 'nullable|string|max:100',
        ]);

        $jenisSurat->update($validated);

        return response()->json($jenisSurat);
    }

    public function destroy(JenisSurat $jenisSurat)
    {
        $jenisSurat->delete();

        return response()->json(['message' => 'Jenis surat dihapus.']);
    }
}
