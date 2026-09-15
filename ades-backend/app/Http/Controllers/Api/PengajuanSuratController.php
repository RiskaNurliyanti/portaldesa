<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notifikasi;
use App\Models\PengajuanSurat;
use App\Services\SuratTemplateService;
use App\Support\FrontendUrl;
use Barryvdh\DomPDF\Facade\Pdf;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\PngWriter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PengajuanSuratController extends Controller
{
    // Warga mengajukan surat (boleh tanpa login)
    public function store(Request $request)
    {
        $validated = $request->validate([
            'jenis_surat_id' => 'required|exists:jenis_surat,id',
            'nama_pemohon' => 'required|string|max:255',
            'nik' => 'required|digits:16',
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'agama' => 'nullable|string|max:50',
            'pekerjaan' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'keperluan' => 'required|string',
            'data_tambahan' => 'nullable|string', // dikirim sebagai JSON string dari frontend
            'lampiran' => 'required|array|min:1',
            'lampiran.*' => 'file|mimes:jpg,jpeg,png,pdf|max:8192',
        ], [
            'lampiran.required' => 'Minimal satu berkas persyaratan wajib diunggah.',
        ]);

        $lampiranPaths = [];
        foreach ($request->file('lampiran') as $file) {
            $lampiranPaths[] = Storage::url($file->store('pengajuan', 'public'));
        }

        $dataTambahan = null;
        if (! empty($validated['data_tambahan'])) {
            $dataTambahan = json_decode($validated['data_tambahan'], true);
        }

        $pengajuan = PengajuanSurat::create([
            'user_id' => $request->user()->id,
            'jenis_surat_id' => $validated['jenis_surat_id'],
            'nama_pemohon' => $validated['nama_pemohon'],
            'nik' => $validated['nik'],
            'tempat_lahir' => $validated['tempat_lahir'] ?? null,
            'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
            'jenis_kelamin' => $validated['jenis_kelamin'] ?? null,
            'agama' => $validated['agama'] ?? null,
            'pekerjaan' => $validated['pekerjaan'] ?? null,
            'alamat' => $validated['alamat'] ?? null,
            'keperluan' => $validated['keperluan'],
            'data_tambahan' => $dataTambahan,
            'lampiran_files' => $lampiranPaths,
            'status' => 'pending',
        ]);

        Notifikasi::buatUntukAdmin(
            'Pengajuan Surat Baru',
            "{$pengajuan->nama_pemohon} mengajukan {$pengajuan->jenisSurat->nama_surat}.",
            '/admin/pengajuan'
        );

        return response()->json($pengajuan->load('jenisSurat'), 201);
    }

    // Admin: daftar semua pengajuan, bisa difilter ?status=pending dan/atau ?q=nama/nik
    public function index(Request $request)
    {
        $query = PengajuanSurat::with('jenisSurat')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('q')) {
            $kata = $request->query('q');
            $query->where(function ($sub) use ($kata) {
                $sub->where('nama_pemohon', 'like', "%{$kata}%")
                    ->orWhere('nik', 'like', "%{$kata}%");
            });
        }

        $perPage = min((int) $request->input('per_page', 15), 200);

        return response()->json($query->paginate($perPage));
    }

    // Bisa diakses admin (lihat semua), atau warga pemilik pengajuan ini
    // sendiri (dibutuhkan buat halaman "lengkapi berkas" waktu ditolak).
    public function show(Request $request, PengajuanSurat $pengajuanSurat)
    {
        $user = $request->user();
        $bolehAkses = $user->role === 'admin' || $pengajuanSurat->user_id === $user->id;

        if (! $bolehAkses) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        return response()->json($pengajuanSurat->load(['jenisSurat', 'suratAsal', 'suratPengganti']));
    }

    // Admin: edit ulang data inti pengajuan (misal ada salah ketik dari warga)
    public function update(Request $request, PengajuanSurat $pengajuanSurat)
    {
        $validated = $request->validate([
            'nama_pemohon' => 'sometimes|required|string|max:255',
            'nik' => 'sometimes|required|digits:16',
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'agama' => 'nullable|string|max:50',
            'pekerjaan' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'keperluan' => 'sometimes|required|string',
            'data_tambahan' => 'nullable|array',
        ]);

        $pengajuanSurat->update($validated);

        return response()->json($pengajuanSurat->fresh()->load('jenisSurat'));
    }

    // Warga (wajib login): lihat riwayat pengajuan miliknya sendiri
    public function milikSaya(Request $request)
    {
        $pengajuan = PengajuanSurat::with('jenisSurat')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get();

        return response()->json($pengajuan);
    }

    // Warga (wajib login, pemilik pengajuan): lengkapi/perbaiki data & berkas
    // pada pengajuan yang statusnya "ditolak", lalu ajukan ulang.
    //
    // Opsi A ("Lengkapi Berkas") — TIDAK membuat pengajuan baru. Pengajuan
    // yang sama dipakai lagi: data & lampiran ditimpa dengan yang baru,
    // status balik jadi "pending" supaya masuk antrean tinjau admin lagi.
    // Alasan penolakan sebelumnya disimpan ke riwayat_revisi sebagai jejak
    // audit, baru catatan_admin dikosongkan.
    public function lengkapi(Request $request, PengajuanSurat $pengajuanSurat)
    {
        if ($pengajuanSurat->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if ($pengajuanSurat->status !== 'ditolak') {
            return response()->json([
                'message' => 'Pengajuan ini bukan pengajuan yang ditolak, jadi tidak bisa dilengkapi ulang.',
            ], 422);
        }

        $validated = $request->validate([
            'nama_pemohon' => 'required|string|max:255',
            'nik' => 'required|digits:16',
            'tempat_lahir' => 'nullable|string|max:255',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:L,P',
            'agama' => 'nullable|string|max:50',
            'pekerjaan' => 'nullable|string|max:100',
            'alamat' => 'nullable|string',
            'keperluan' => 'required|string',
            'data_tambahan' => 'nullable|string', // JSON string dari frontend
            // Berkas lama yang masih mau dipertahankan warga (path yang sudah
            // ada) — path yang TIDAK dikirim di sini dianggap sengaja dihapus.
            'lampiran_existing' => 'nullable|array',
            'lampiran_existing.*' => 'string',
            // Berkas baru yang ditambahkan/pengganti
            'lampiran' => 'nullable|array',
            'lampiran.*' => 'file|mimes:jpg,jpeg,png,pdf|max:8192',
        ]);

        $lampiranLama = $pengajuanSurat->lampiran_files ?? [];
        $tetapDipakai = $validated['lampiran_existing'] ?? [];

        // Berkas lama yang gak lagi dipertahankan warga -> buang dari storage
        // biar gak numpuk file yatim.
        foreach ($lampiranLama as $path) {
            if (! in_array($path, $tetapDipakai, true)) {
                $relatif = ltrim(str_replace('/storage/', '', $path), '/');
                Storage::disk('public')->delete($relatif);
            }
        }

        $lampiranBaru = [];
        foreach ($request->file('lampiran', []) as $file) {
            $lampiranBaru[] = Storage::url($file->store('pengajuan', 'public'));
        }

        $lampiranFinal = array_values(array_merge($tetapDipakai, $lampiranBaru));

        if (empty($lampiranFinal)) {
            return response()->json([
                'message' => 'Minimal satu berkas persyaratan wajib ada.',
                'errors' => ['lampiran' => ['Minimal satu berkas persyaratan wajib ada.']],
            ], 422);
        }

        $dataTambahan = null;
        if (! empty($validated['data_tambahan'])) {
            $dataTambahan = json_decode($validated['data_tambahan'], true);
        }

        $riwayat = $pengajuanSurat->riwayat_revisi ?? [];
        $riwayat[] = [
            'catatan_admin' => $pengajuanSurat->catatan_admin,
            'ditolak_pada' => optional($pengajuanSurat->updated_at)->toIso8601String(),
            'dilengkapi_pada' => now()->toIso8601String(),
        ];

        $pengajuanSurat->update([
            'nama_pemohon' => $validated['nama_pemohon'],
            'nik' => $validated['nik'],
            'tempat_lahir' => $validated['tempat_lahir'] ?? null,
            'tanggal_lahir' => $validated['tanggal_lahir'] ?? null,
            'jenis_kelamin' => $validated['jenis_kelamin'] ?? null,
            'agama' => $validated['agama'] ?? null,
            'pekerjaan' => $validated['pekerjaan'] ?? null,
            'alamat' => $validated['alamat'] ?? null,
            'keperluan' => $validated['keperluan'],
            'data_tambahan' => $dataTambahan,
            'lampiran_files' => $lampiranFinal,
            'status' => 'pending',
            'catatan_admin' => null,
            'riwayat_revisi' => $riwayat,
        ]);

        $pengajuanSurat->load('jenisSurat');

        Notifikasi::buatUntukAdmin(
            'Pengajuan Diperbaiki & Diajukan Ulang',
            "{$pengajuanSurat->nama_pemohon} melengkapi berkas untuk {$pengajuanSurat->jenisSurat->nama_surat} yang sebelumnya ditolak.",
            '/admin/pengajuan'
        );

        return response()->json($pengajuanSurat->fresh()->load('jenisSurat'));
    }

    // Admin: ubah status pengajuan (mis. pending -> diproses)
    public function updateStatus(Request $request, PengajuanSurat $pengajuanSurat)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,diproses,selesai,ditolak',
            'catatan_admin' => 'nullable|string|required_if:status,ditolak',
        ], [
            'catatan_admin.required_if' => 'Alasan penolakan wajib diisi.',
        ]);

        $pengajuanSurat->update($validated);

        if ($pengajuanSurat->user_id) {
            $pengajuanSurat->load('jenisSurat');
            $pesan = "Pengajuan {$pengajuanSurat->jenisSurat->nama_surat} kamu sekarang berstatus \"{$validated['status']}\".";
            if ($validated['status'] === 'ditolak' && !empty($validated['catatan_admin'])) {
                $pesan .= " Alasan: {$validated['catatan_admin']}";
            }

            Notifikasi::buatUntukUser(
                $pengajuanSurat->user_id,
                'Status Pengajuan Diperbarui',
                $pesan,
                '/akun/pengajuan'
            );
        }

        return response()->json($pengajuanSurat->load('jenisSurat'));
    }

    // Admin: finalisasi — isi nomor surat, generate PDF + QR verifikasi,
    // status otomatis jadi "selesai"
    public function finalisasi(Request $request, PengajuanSurat $pengajuanSurat, SuratTemplateService $templateService)
    {
        $validated = $request->validate([
            'nomor_surat' => 'required|string|max:100|unique:pengajuan_surat,nomor_surat',
            'ditandatangani_oleh' => 'nullable|string|max:255',
        ]);

        $pengajuanSurat->load('jenisSurat');

        $kodeVerifikasi = strtoupper(Str::random(10));
        $namaPenandatangan = $validated['ditandatangani_oleh'] ?? 'Kepala Desa Sukamaju';

        $frontendUrl = FrontendUrl::resolve();
        $verifikasiUrl = "{$frontendUrl}/verifikasi/{$kodeVerifikasi}";

        // Generate QR code dalam bentuk PNG base64, ditempel langsung di PDF
        $qrCode = new QrCode(
            data: $verifikasiUrl,
            size: 220,
            margin: 4,
        );
        $qrResult = (new PngWriter())->write($qrCode);
        $qrBase64 = 'data:image/png;base64,' . base64_encode($qrResult->getString());

        $isiSurat = $templateService->build($pengajuanSurat);

        $pdf = Pdf::loadView('surat.pdf', [
            'jenisSurat' => $pengajuanSurat->jenisSurat->nama_surat,
            'nomorSurat' => $validated['nomor_surat'],
            'isiSurat' => $isiSurat,
            'qrBase64' => $qrBase64,
            'tempatTanggal' => 'Sukamaju, ' . now()->translatedFormat('d F Y'),
            'jabatan' => 'Kepala Desa Sukamaju',
            'namaPenandatangan' => $namaPenandatangan,
            'verifikasiUrl' => $verifikasiUrl,
        ]);

        $filename = 'surat/' . $pengajuanSurat->id . '-' . Str::slug($validated['nomor_surat']) . '.pdf';
        Storage::disk('public')->put($filename, $pdf->output());

        $pengajuanSurat->update([
            'nomor_surat' => $validated['nomor_surat'],
            'kode_verifikasi' => $kodeVerifikasi,
            'ditandatangani_oleh' => $namaPenandatangan,
            'file_surat' => Storage::url($filename),
            'status' => 'selesai',
            'finalized_at' => now(),
        ]);

        if ($pengajuanSurat->user_id) {
            Notifikasi::buatUntukUser(
                $pengajuanSurat->user_id,
                'Surat Sudah Terbit',
                "Surat {$pengajuanSurat->jenisSurat->nama_surat} kamu sudah selesai diproses dan siap diunduh.",
                '/akun/pengajuan'
            );
        }

        return response()->json($pengajuanSurat->fresh()->load('jenisSurat'));
    }

    // Admin: batalkan surat yang sudah terbit (biasanya karena ada
    // kesalahan data yang baru ketahuan setelah dicetak), lalu buat
    // pengajuan pengganti dengan nomor surat baru.
    //
    // Surat lama TIDAK dihapus — statusnya diubah jadi "dibatalkan" dan
    // tetap tersimpan sebagai arsip, supaya ada jejak kalau suatu saat
    // ditanyakan. Kode verifikasi & QR-nya tetap bisa dipindai, tapi
    // hasilnya sekarang bilang dokumen sudah tidak berlaku (lihat
    // verifikasi() di bawah).
    //
    // Pengajuan pengganti sengaja dikembalikan ke status "pending" —
    // BUKAN langsung ditandatangani ulang dengan data yang sama persis —
    // karena kebanyakan surat dibatalkan justru gara-gara datanya kurang
    // teliti waktu diisi. Jadi harus lewat proses tinjau (dan revisi
    // kalau perlu) dari awal lagi sebelum admin menerbitkannya.
    public function batalkanTerbitkanUlang(Request $request, PengajuanSurat $pengajuanSurat)
    {
        if ($pengajuanSurat->status !== 'selesai') {
            return response()->json([
                'message' => 'Hanya surat yang sudah terbit yang bisa dibatalkan & diterbitkan ulang.',
            ], 422);
        }

        $validated = $request->validate([
            'alasan' => 'required|string|max:1000',
        ], [
            'alasan.required' => 'Alasan pembatalan wajib diisi.',
        ]);

        $pengajuanBaru = DB::transaction(function () use ($pengajuanSurat, $validated) {
            $pengajuanSurat->update([
                'status' => 'dibatalkan',
                'alasan_pembatalan' => $validated['alasan'],
                'dibatalkan_pada' => now(),
            ]);

            return PengajuanSurat::create([
                'user_id' => $pengajuanSurat->user_id,
                'jenis_surat_id' => $pengajuanSurat->jenis_surat_id,
                'nama_pemohon' => $pengajuanSurat->nama_pemohon,
                'nik' => $pengajuanSurat->nik,
                'tempat_lahir' => $pengajuanSurat->tempat_lahir,
                'tanggal_lahir' => $pengajuanSurat->tanggal_lahir,
                'jenis_kelamin' => $pengajuanSurat->jenis_kelamin,
                'agama' => $pengajuanSurat->agama,
                'pekerjaan' => $pengajuanSurat->pekerjaan,
                'alamat' => $pengajuanSurat->alamat,
                'keperluan' => $pengajuanSurat->keperluan,
                'data_tambahan' => $pengajuanSurat->data_tambahan,
                'lampiran_files' => $pengajuanSurat->lampiran_files,
                'status' => 'pending',
                'pengganti_dari_id' => $pengajuanSurat->id,
            ]);
        });

        $pengajuanSurat->load('jenisSurat');

        if ($pengajuanSurat->user_id) {
            Notifikasi::buatUntukUser(
                $pengajuanSurat->user_id,
                'Surat Dibatalkan, Diajukan Ulang',
                "Surat {$pengajuanSurat->jenisSurat->nama_surat} nomor {$pengajuanSurat->nomor_surat} kamu dibatalkan. Alasan: {$validated['alasan']}. Pengajuan akan ditinjau ulang oleh admin untuk diterbitkan kembali.",
                '/akun/pengajuan'
            );
        }

        return response()->json([
            'surat_lama' => $pengajuanSurat,
            'pengajuan_baru' => $pengajuanBaru->load('jenisSurat'),
        ]);
    }

    // Publik: dipanggil waktu QR code di surat dipindai
    public function verifikasi(string $kode)
    {
        // Dibandingkan tanpa peduli besar/kecil huruf (UPPER di kedua sisi)
        // — beberapa aplikasi scan QR/browser HP otomatis mengecilkan huruf
        // di URL sebelum membukanya, yang bisa bikin kode yang sebenarnya
        // valid jadi gagal ketemu kalau dibandingkan apa adanya.
        $pengajuan = PengajuanSurat::with(['jenisSurat', 'suratPengganti'])
            ->whereRaw('UPPER(kode_verifikasi) = ?', [strtoupper(trim($kode))])
            ->whereNotNull('finalized_at')
            ->first();

        if (! $pengajuan) {
            return response()->json([
                'valid' => false,
                'message' => 'Kode verifikasi tidak ditemukan atau dokumen tidak sah.',
            ], 404);
        }

        // Surat ini sudah dibatalkan — jangan bilang "sah" cuma karena dia
        // pernah difinalisasi. Kalau pengganti sudah terbit, kasih tau
        // nomor & kode verifikasi surat penggantinya sekalian.
        if ($pengajuan->status === 'dibatalkan') {
            $pengganti = $pengajuan->suratPengganti;
            $penggantiSudahTerbit = $pengganti && $pengganti->status === 'selesai';

            return response()->json([
                'valid' => false,
                'dibatalkan' => true,
                'message' => 'Surat ini sudah dibatalkan dan tidak berlaku lagi.',
                'nomor_surat' => $pengajuan->nomor_surat,
                'jenis_surat' => $pengajuan->jenisSurat->nama_surat,
                'surat_pengganti' => $penggantiSudahTerbit ? [
                    'nomor_surat' => $pengganti->nomor_surat,
                    'kode_verifikasi' => $pengganti->kode_verifikasi,
                ] : null,
            ], 410);
        }

        return response()->json([
            'valid' => true,
            'nomor_surat' => $pengajuan->nomor_surat,
            'jenis_surat' => $pengajuan->jenisSurat->nama_surat,
            'nama_pemohon' => $pengajuan->nama_pemohon,
            'tanggal_terbit' => $pengajuan->finalized_at,
            'ditandatangani_oleh' => $pengajuan->ditandatangani_oleh,
        ]);
    }

    // Download PDF surat yang sudah terbit — lewat route API (bukan akses
    // langsung ke file storage), supaya kena CORS dengan benar dan bisa
    // dicek dulu siapa yang boleh akses (admin, atau pemilik pengajuannya).
    public function unduhSurat(Request $request, PengajuanSurat $pengajuanSurat)
    {
        $user = $request->user();
        $bolehAkses = $user->role === 'admin' || $pengajuanSurat->user_id === $user->id;

        if (! $bolehAkses) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        if (! $pengajuanSurat->file_surat) {
            return response()->json(['message' => 'Surat belum diterbitkan.'], 404);
        }

        $path = ltrim(str_replace('/storage/', '', $pengajuanSurat->file_surat), '/');

        if (! Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'File surat tidak ditemukan di server.'], 404);
        }

        $namaFile = ($pengajuanSurat->nomor_surat ? str_replace('/', '-', $pengajuanSurat->nomor_surat) : 'surat') . '.pdf';

        return Storage::disk('public')->download($path, $namaFile);
    }

    // Download salah satu berkas lampiran yang diupload warga waktu pengajuan
    public function unduhLampiran(Request $request, PengajuanSurat $pengajuanSurat, int $index)
    {
        $user = $request->user();
        $bolehAkses = $user->role === 'admin' || $pengajuanSurat->user_id === $user->id;

        if (! $bolehAkses) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $files = $pengajuanSurat->lampiran_files ?? [];

        if (! isset($files[$index])) {
            return response()->json(['message' => 'Berkas tidak ditemukan.'], 404);
        }

        $path = ltrim(str_replace('/storage/', '', $files[$index]), '/');

        if (! Storage::disk('public')->exists($path)) {
            return response()->json(['message' => 'File tidak ditemukan di server.'], 404);
        }

        return Storage::disk('public')->download($path);
    }
}
