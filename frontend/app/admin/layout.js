"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import Icon from "@/components/Icon";

const ADMIN_LINKS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/pengajuan", label: "Pengajuan Surat", icon: "edit_document" },
  { href: "/admin/berita", label: "Berita", icon: "newspaper" },
  { href: "/admin/galeri", label: "Galeri", icon: "photo_library" },
  { href: "/admin/profil", label: "Profil Desa", icon: "account_balance" },
];

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Proteksi route: redirect ke /login kalau belum login atau bukan admin
  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="section container">
        <p className="card-text">Memeriksa akses admin...</p>
      </div>
    );
  }

  return (
    <div
      className="container admin-layout"
      style={{
        display: "flex",
        gap: 24,
        padding: "32px 24px",
        alignItems: "flex-start",
        flexWrap: "wrap",
        maxWidth: 1440,
      }}
    >
      <aside className="admin-sidebar" style={{ width: 200, flexShrink: 0 }}>
        <div
          className="card"
          style={{ padding: 16, position: "sticky", top: 88 }}
        >
          <p className="eyebrow" style={{ color: "var(--color-text-muted)", padding: "0 8px", marginBottom: 10 }}>
            Modul Kedinasan
          </p>
          <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {ADMIN_LINKS.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: "var(--radius-md)",
                    fontSize: 14,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--color-primary-dark)" : "var(--color-text-muted)",
                    background: isActive ? "var(--color-primary-pale)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--color-primary)" : "3px solid transparent",
                  }}
                >
                  <Icon name={link.icon} size={20} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 12, paddingTop: 12 }}>
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: "var(--radius-md)",
                fontSize: 13,
                fontWeight: 500,
                color: "var(--color-text-muted)",
              }}
            >
              <Icon name="arrow_back" size={20} />
              Lihat Situs Publik
            </Link>
            <button
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="btn"
              style={{
                marginTop: 8,
                width: "100%",
                background: "transparent",
                color: "var(--color-accent)",
                border: "1px solid var(--color-border)",
              }}
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 280 }}>{children}</div>
    </div>
  );
}
