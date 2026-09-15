<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_surat', function (Blueprint $table) {
            // Jejak riwayat tiap kali pengajuan ditolak lalu dilengkapi/diajukan
            // ulang oleh warga (Opsi A: "Lengkapi Berkas", bukan bikin pengajuan
            // baru). Disimpan sebagai array JSON, tiap entri: catatan_admin
            // (alasan tolak sebelumnya), ditolak_pada, dilengkapi_pada.
            // Berguna buat admin melihat histori & mencegah bolak-balik
            // tolak-lengkapi tanpa jejak.
            $table->json('riwayat_revisi')->nullable()->after('catatan_admin');
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_surat', function (Blueprint $table) {
            $table->dropColumn('riwayat_revisi');
        });
    }
};
