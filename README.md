# Sistem Informasi Desa Sukamaju

Portal desa full-stack: **Next.js** (frontend) + **Laravel** (backend/API) +
**PostgreSQL** (Neon). Warga bisa mengajukan surat online, admin desa
memproses dan menerbitkannya lengkap dengan PDF ber-QR code yang bisa
diverifikasi keasliannya.

## Struktur Folder

```
ades/
├── ades-backend/   → API Laravel
└── frontend/       → Aplikasi Next.js
```

## Menjalankan Secara Lokal

### 1. Backend (Laravel)

```bash
cd ades-backend
composer install
cp .env.example .env
php artisan key:generate
```

Isi kredensial database PostgreSQL di `.env` (bisa pakai
[Neon](https://neon.tech) untuk database gratis di cloud, atau PostgreSQL
lokal), lalu:

```bash
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

Tes cepat: buka `http://localhost:8000/api/jenis-surat`, harus muncul daftar
jenis surat dari seeder.

Akun admin default (dari seeder): `admin@desasukamaju.test` / `password123`
— **wajib ganti password setelah testing**, jangan dipakai di production.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Buka `http://localhost:3000`.

Kalau mau diakses dari HP di jaringan WiFi yang sama, jalankan
`node update-ip.js` dari folder `frontend/` untuk mengisi otomatis IP LAN
laptop ke `.env.local` dan `ades-backend/.env` (`FRONTEND_URL`), lalu restart
kedua server. IP ini bisa berubah kalau ganti jaringan atau restart router —
jalankan lagi script-nya kalau koneksi dari HP tiba-tiba gagal.

## Alur Tes End-to-End

1. **Publik** — buka `/layanan`, pilih salah satu jenis surat, isi form data
   diri, lihat preview, lalu kirim pengajuan.
2. **Admin** — login di `/login`, buka `/admin/pengajuan`, cari pengajuan
   yang baru masuk, lalu **Finalisasi & Terbitkan Surat** dengan mengisi
   nomor surat.
3. Download PDF surat yang sudah terbit — cek kop surat, isi data, QR code,
   dan blok tanda tangan.
4. Scan QR code (atau buka manual `/verifikasi/<kode_verifikasi>`) — harus
   muncul halaman **"Dokumen Ini Asli & Terdaftar Resmi"**.
5. Coba juga alur lain: `/register`, `/forgot-password` (link reset bisa
   dicek di `storage/logs/laravel.log` kalau `MAIL_MAILER=log`), serta
   `/admin/berita` dan `/admin/galeri` untuk kelola konten.

## Arsitektur

```
[Browser] ←→ [Next.js frontend, port 3000]
                     ↓ fetch API (Bearer token untuk endpoint admin)
              [Laravel backend, port 8000]
                     ↓ Eloquent ORM
              [PostgreSQL]
```

- **Auth** — Sanctum token-based, token disimpan di `localStorage` sisi
  frontend.
- **Proteksi admin** — middleware `admin` di backend (cek kolom `role` di
  database) + route guard client-side di `app/admin/layout.js`.
- **Surat PDF** — dibuat server-side dengan `dompdf`, QR code dengan
  `endroid/qr-code`, disimpan di `storage/app/public/surat/`.
- **Verifikasi** — setiap surat punya kode verifikasi unik, dicek lewat
  endpoint publik `/api/verifikasi/{kode}` tanpa perlu login. Surat yang
  dibatalkan tetap bisa dipindai tapi akan menampilkan status "sudah
  dibatalkan" beserta link ke surat penggantinya (kalau sudah terbit).
