<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('statistik_penduduk', function (Blueprint $table) {
            $table->id();
            $table->string('kategori');
            $table->unsignedInteger('jumlah')->default(0);
            $table->unsignedSmallInteger('tahun');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('statistik_penduduk');
    }
};
