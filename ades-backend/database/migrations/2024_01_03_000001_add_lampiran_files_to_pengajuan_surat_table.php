<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_surat', function (Blueprint $table) {
            // Ganti dari 1 file (lampiran) jadi bisa banyak file (lampiran_files),
            // disimpan sebagai array JSON path
            $table->json('lampiran_files')->nullable()->after('lampiran');
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_surat', function (Blueprint $table) {
            $table->dropColumn('lampiran_files');
        });
    }
};
