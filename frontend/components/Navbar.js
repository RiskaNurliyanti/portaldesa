"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import NotificationBell from "@/components/NotificationBell";

const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/profil", label: "Profil Desa" },
  { href: "/berita", label: "Berita" },
  { href: "/layanan", label: "Layanan" },
  { href: "/galeri", label: "Galeri" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  return (
    <header className="navbar">
      {/*
        Checkbox tersembunyi ini yang jadi "otak" buka-tutup menu mobile,
        murni pakai CSS (:checked ~ selector), TANPA JavaScript sama sekali.
        Ini paling reliable buat semua device/browser, termasuk yang
        kadang bermasalah dengan event handler React di touchscreen.
        `key={pathname}` bikin checkbox ini di-reset (balik unchecked)
        otomatis tiap pindah halaman.
      */}
      <input type="checkbox" id="navbar-menu-toggle" className="navbar-checkbox" key={pathname} />

      <div className="container navbar-inner">
        <Link href="/" className="navbar-brand">
          <span className="navbar-brand-overline">Kec. Cikoneng · Kab. Ciamis</span>
          <span className="navbar-brand-name">Desa Sukamaju</span>
        </Link>

        <nav className="navbar-links" style={{ alignItems: "center" }}>
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={isActive ? "navbar-link-active" : ""}>
                {link.label}
              </Link>
            );
          })}

          {user && <Link href="/akun/pengajuan">Pengajuan Saya</Link>}

          {user ? (
            <>
              {user.role === "admin" && (
                <Link href="/admin/dashboard" style={{ fontWeight: 600 }}>
                  Admin
                </Link>
              )}
              <NotificationBell />
              <button
                type="button"
                onClick={handleLogout}
                style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", padding: 0 }}
              >
                Keluar ({user.name.split(" ")[0]})
              </button>
            </>
          ) : (
            // Default-nya SELALU tampilkan Masuk & Daftar (anggap belum login),
            // baru diganti ke menu akun begitu AuthContext memastikan user memang
            // sudah login. Sengaja tidak digantung status `loading` lagi supaya
            // kedua tombol ini tidak pernah "hilang" hanya karena proses cek sesi
            // di client belum/gagal selesai (mis. hydration lambat di HP).
            <>
              <Link href="/login">Masuk</Link>
              <Link href="/register" className="btn btn-solid" style={{ padding: "8px 16px" }}>
                Daftar
              </Link>
            </>
          )}
        </nav>

        <label htmlFor="navbar-menu-toggle" className="navbar-toggle" aria-label="Buka/tutup menu navigasi">
          <span className="navbar-icon-open">☰</span>
          <span className="navbar-icon-close">✕</span>
        </label>
      </div>

      {/* Backdrop gelap — klik di luar buat nutup (label yang nunjuk ke checkbox yang sama) */}
      <label htmlFor="navbar-menu-toggle" className="navbar-backdrop" aria-hidden="true" />

      <div className="navbar-mobile">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}

        {user && <Link href="/akun/pengajuan">Pengajuan Saya</Link>}

        {user ? (
          <>
            {user.role === "admin" && <Link href="/admin/dashboard">Admin</Link>}
            <button
              type="button"
              onClick={handleLogout}
              style={{ background: "none", border: "none", textAlign: "left", font: "inherit", padding: "10px 0", width: "100%" }}
            >
              Keluar ({user.name.split(" ")[0]})
            </button>
          </>
        ) : (
          <>
            <Link href="/login">Masuk</Link>
            <Link href="/register">Daftar</Link>
          </>
        )}
      </div>
    </header>
  );
}
