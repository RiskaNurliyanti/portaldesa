<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BeritaController;
use App\Http\Controllers\Api\GaleriController;
use App\Http\Controllers\Api\JenisSuratController;
use App\Http\Controllers\Api\NotifikasiController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PengajuanSuratController;
use App\Http\Controllers\Api\ProfilDesaController;
use App\Http\Controllers\Api\StatistikPendudukController;
use Illuminate\Support\Facades\Route;

// ==================== AUTH ====================
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/reset-password', [PasswordResetController::class, 'resetPassword']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Warga login (maupun admin) bisa akses ini, gak wajib role admin
    Route::post('/pengajuan-surat', [PengajuanSuratController::class, 'store']);
    Route::get('/pengajuan-surat/saya', [PengajuanSuratController::class, 'milikSaya']);
    Route::get('/pengajuan-surat/{pengajuanSurat}', [PengajuanSuratController::class, 'show']);
    Route::post('/pengajuan-surat/{pengajuanSurat}/lengkapi', [PengajuanSuratController::class, 'lengkapi']);
    Route::get('/pengajuan-surat/{pengajuanSurat}/unduh-surat', [PengajuanSuratController::class, 'unduhSurat']);
    Route::get('/pengajuan-surat/{pengajuanSurat}/unduh-lampiran/{index}', [PengajuanSuratController::class, 'unduhLampiran']);

    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::put('/notifikasi/{notifikasi}/dibaca', [NotifikasiController::class, 'tandaiDibaca']);
    Route::put('/notifikasi/tandai-semua-dibaca', [NotifikasiController::class, 'tandaiSemuaDibaca']);
});

// ==================== PUBLIK (tanpa login) ====================
Route::get('/profil-desa', [ProfilDesaController::class, 'show']);

Route::get('/berita', [BeritaController::class, 'index']);
Route::get('/berita/{slug}', [BeritaController::class, 'show']);

Route::get('/galeri', [GaleriController::class, 'index']);

Route::get('/jenis-surat', [JenisSuratController::class, 'index']);
Route::get('/jenis-surat/{jenisSurat}', [JenisSuratController::class, 'show']);

Route::get('/statistik-penduduk', [StatistikPendudukController::class, 'index']);

// Publik: dipanggil waktu QR code di surat dipindai
Route::get('/verifikasi/{kode}', [PengajuanSuratController::class, 'verifikasi']);

// ==================== KHUSUS ADMIN (wajib login + role admin) ====================
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::put('/profil-desa', [ProfilDesaController::class, 'update']);

    Route::get('/admin/berita', [BeritaController::class, 'adminIndex']);
    Route::post('/berita', [BeritaController::class, 'store']);
    Route::put('/berita/{berita}', [BeritaController::class, 'update']);
    Route::delete('/berita/{berita}', [BeritaController::class, 'destroy']);

    Route::post('/galeri', [GaleriController::class, 'store']);
    Route::delete('/galeri/{galeri}', [GaleriController::class, 'destroy']);

    Route::post('/jenis-surat', [JenisSuratController::class, 'store']);
    Route::put('/jenis-surat/{jenisSurat}', [JenisSuratController::class, 'update']);
    Route::delete('/jenis-surat/{jenisSurat}', [JenisSuratController::class, 'destroy']);

    Route::get('/pengajuan-surat', [PengajuanSuratController::class, 'index']);
    Route::put('/pengajuan-surat/{pengajuanSurat}', [PengajuanSuratController::class, 'update']);
    Route::put('/pengajuan-surat/{pengajuanSurat}/status', [PengajuanSuratController::class, 'updateStatus']);
    Route::put('/pengajuan-surat/{pengajuanSurat}/finalisasi', [PengajuanSuratController::class, 'finalisasi']);
    Route::put('/pengajuan-surat/{pengajuanSurat}/batalkan-terbitkan-ulang', [PengajuanSuratController::class, 'batalkanTerbitkanUlang']);

    Route::post('/statistik-penduduk', [StatistikPendudukController::class, 'store']);
    Route::delete('/statistik-penduduk/{statistikPenduduk}', [StatistikPendudukController::class, 'destroy']);
});
