<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProfilDesa;
use Illuminate\Http\Request;

class ProfilDesaController extends Controller
{
    public function show()
    {
        return response()->json(ProfilDesa::first());
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'nama_desa' => 'required|string|max:255',
            'alamat' => 'nullable|string|max:255',
            'sejarah' => 'nullable|string',
            'visi' => 'nullable|string',
            'misi' => 'nullable|string',
            'jumlah_dusun' => 'nullable|integer|min:0',
        ]);

        $profil = ProfilDesa::first();

        $profil = $profil
            ? tap($profil)->update($validated)
            : ProfilDesa::create($validated);

        return response()->json($profil);
    }
}
