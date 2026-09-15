<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('berita', function (Blueprint $table) {
            // Foto tambahan di dalam berita (beda dari "gambar" yang jadi sampul),
            // opsional, disimpan sebagai array path JSON
            $table->json('galeri')->nullable()->after('gambar');
        });
    }

    public function down(): void
    {
        Schema::table('berita', function (Blueprint $table) {
            $table->dropColumn('galeri');
        });
    }
};
