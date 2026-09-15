<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('galeri', function (Blueprint $table) {
            // Foto yang diupload bersamaan (dalam satu kali submit form) dikasih
            // kode kelompok yang sama, supaya bisa ditampilkan sebagai satu
            // kartu dengan slider di frontend, bukan kartu terpisah-pisah.
            $table->string('kelompok')->nullable()->after('id');
        });
    }

    public function down(): void
    {
        Schema::table('galeri', function (Blueprint $table) {
            $table->dropColumn('kelompok');
        });
    }
};
