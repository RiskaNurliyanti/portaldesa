<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_surat', function (Blueprint $table) {
            // Kenapa surat ini dibatalkan (wajib diisi admin waktu membatalkan)
            $table->text('alasan_pembatalan')->nullable()->after('catatan_admin');
            $table->timestamp('dibatalkan_pada')->nullable()->after('finalized_at');

            // Nunjuk ke surat LAMA yang dibatalkan, kalau baris ini adalah
            // pengajuan pengganti hasil "Batalkan & Terbitkan Ulang".
            // Relasi "surat lama ini digantikan oleh yang mana" cukup
            // dicari balik lewat kolom ini (hasOne), gak perlu kolom FK
            // kedua di baris yang lama.
            $table->foreignId('pengganti_dari_id')
                ->nullable()
                ->after('dibatalkan_pada')
                ->constrained('pengajuan_surat')
                ->nullOnDelete();
        });

        // Kolom status dibuat pakai enum() di migrasi awal. Di Postgres,
        // Laravel menerjemahkan enum() jadi CHECK constraint (bukan tipe
        // ENUM asli) — jadi buat nambah nilai baru, constraint lama harus
        // dibongkar dulu baru dibuat ulang dengan daftar nilai yang lebih
        // lengkap.
        DB::statement('ALTER TABLE pengajuan_surat DROP CONSTRAINT IF EXISTS pengajuan_surat_status_check');
        DB::statement("ALTER TABLE pengajuan_surat ADD CONSTRAINT pengajuan_surat_status_check CHECK (status IN ('pending', 'diproses', 'selesai', 'ditolak', 'dibatalkan'))");
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE pengajuan_surat DROP CONSTRAINT IF EXISTS pengajuan_surat_status_check');
        DB::statement("ALTER TABLE pengajuan_surat ADD CONSTRAINT pengajuan_surat_status_check CHECK (status IN ('pending', 'diproses', 'selesai', 'ditolak'))");

        Schema::table('pengajuan_surat', function (Blueprint $table) {
            $table->dropConstrainedForeignId('pengganti_dari_id');
            $table->dropColumn(['alasan_pembatalan', 'dibatalkan_pada']);
        });
    }
};
