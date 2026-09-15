<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('pengajuan_surat', function (Blueprint $table) {
            // Data diri pemohon — dipakai buat isi teks surat, bukan cuma nama & NIK doang
            $table->string('tempat_lahir')->nullable()->after('nik');
            $table->date('tanggal_lahir')->nullable()->after('tempat_lahir');
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable()->after('tanggal_lahir');
            $table->string('agama')->nullable()->after('jenis_kelamin');
            $table->string('pekerjaan')->nullable()->after('agama');
            $table->text('alamat')->nullable()->after('pekerjaan');

            // Data tambahan yang beda-beda per jenis surat (nama anak, data almarhum,
            // nama pasangan nikah, dll) — disimpan fleksibel sebagai JSON
            $table->json('data_tambahan')->nullable()->after('keperluan');

            // Diisi admin waktu proses finalisasi/penerbitan surat
            $table->string('nomor_surat')->nullable()->unique()->after('status');
            $table->string('kode_verifikasi')->nullable()->unique()->after('nomor_surat');
            $table->string('file_surat')->nullable()->after('kode_verifikasi');
            $table->string('ditandatangani_oleh')->nullable()->after('file_surat');
            $table->timestamp('finalized_at')->nullable()->after('ditandatangani_oleh');
        });
    }

    public function down(): void
    {
        Schema::table('pengajuan_surat', function (Blueprint $table) {
            $table->dropColumn([
                'tempat_lahir',
                'tanggal_lahir',
                'jenis_kelamin',
                'agama',
                'pekerjaan',
                'alamat',
                'data_tambahan',
                'nomor_surat',
                'kode_verifikasi',
                'file_surat',
                'ditandatangani_oleh',
                'finalized_at',
            ]);
        });
    }
};
