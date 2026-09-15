# Frontend — Sistem Informasi Desa Sukamaju

Aplikasi Next.js (App Router) untuk portal desa: halaman publik (profil
desa, berita, galeri, layanan surat), akun warga, dan dashboard admin.

Untuk panduan setup lengkap (termasuk backend-nya), lihat
[README di root project](../README.md).

## Perintah

```bash
npm install       # install dependencies
npm run dev       # jalankan mode development
npm run build     # build production
npm run lint      # cek linting
```

## Catatan

- `NEXT_PUBLIC_API_URL` (di `.env.local`) adalah alamat API Laravel yang
  dipakai browser. `INTERNAL_API_URL` (opsional) dipakai server Next.js
  sendiri saat merender halaman di server — kalau tidak diisi, defaultnya
  `http://127.0.0.1:8000/api`.
- Jalankan `node update-ip.js` kalau mau akses dari perangkat lain di
  jaringan yang sama (misal HP) — lihat root README untuk detailnya.
