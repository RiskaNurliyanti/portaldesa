<?php

use Illuminate\Support\Facades\Route;

// Backend ini API-only — frontend-nya aplikasi Next.js terpisah. Rute
// ini cuma buat mastiin server hidup kalau diakses langsung dari
// browser, bukan halaman yang beneran dipakai.
Route::get('/', function () {
    return response()->json([
        'aplikasi' => 'ADES API',
        'status' => 'ok',
    ]);
});
