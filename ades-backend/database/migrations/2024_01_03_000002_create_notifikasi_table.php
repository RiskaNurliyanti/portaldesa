<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->id();
            // Kalau user_id diisi -> notif buat warga tertentu.
            // Kalau untuk_admin true -> notif ini muncul di semua akun admin.
            $table->foreignId('user_id')->nullable()->constrained()->cascadeOnDelete();
            $table->boolean('untuk_admin')->default(false);
            $table->string('judul');
            $table->text('pesan');
            $table->string('link')->nullable();
            $table->boolean('dibaca')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifikasi');
    }
};
