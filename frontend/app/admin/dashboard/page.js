"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { apiGet } from "@/lib/api";
import Icon from "@/components/Icon";

const STAT_CARDS = [
  {
    key: "pengajuanPending",
    label: "Pengajuan Menunggu Diproses",
    icon: "edit_document",
    href: "/admin/pengajuan",
    accent: "accent",
  },
  {
    key: "berita",
    label: "Total Berita Terbit",
    icon: "newspaper",
    href: "/admin/berita",
    accent: "primary",
  },
  {
    key: "galeri",
    label: "Total Foto Galeri",
    icon: "photo_library",
    href: "/admin/galeri",
    accent: "primary",
  },
];

export default function AdminDashboardPage() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ berita: null, pengajuanPending: null, galeri: null });

  useEffect(() => {
    if (!token) return;

    async function loadStats() {
      try {
        const authHeader = { headers: { Authorization: `Bearer ${token}` } };
        const [beritaRes, pengajuanRes, galeriRes] = await Promise.all([
          apiGet("/admin/berita", authHeader),
          apiGet("/pengajuan-surat?status=pending", authHeader),
          apiGet("/galeri"),
        ]);

        setStats({
          berita: beritaRes.meta?.total ?? beritaRes.data?.length ?? 0,
          pengajuanPending: pengajuanRes.meta?.total ?? pengajuanRes.data?.length ?? 0,
          galeri: Array.isArray(galeriRes) ? galeriRes.length : 0,
        });
      } catch (err) {
        console.error("Gagal ambil statistik dashboard:", err.message);
      }
    }

    loadStats();
  }, [token]);

  return (
    <div>
      <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
        Panel Kedinasan
      </span>
      <h1 className="section-title" style={{ marginTop: 6, marginBottom: 4 }}>
        Selamat datang, {user?.name?.split(" ")[0] || "Admin"}
      </h1>
      <p className="card-text" style={{ marginBottom: 28 }}>
        Ringkasan aktivitas layanan Desa Sukamaju hari ini.
      </p>

      <div className="card-grid">
        {STAT_CARDS.map((stat) => {
          const isAccent = stat.accent === "accent";
          return (
            <Link
              key={stat.key}
              href={stat.href}
              className="card"
              style={{ padding: 20, display: "flex", alignItems: "center", gap: 16 }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--radius-md)",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: isAccent ? "var(--color-accent-soft-bg)" : "var(--color-primary-pale)",
                  color: isAccent ? "var(--color-accent)" : "var(--color-primary-dark)",
                }}
              >
                <Icon name={stat.icon} size={26} />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-heading), serif",
                    fontSize: 28,
                    fontWeight: 600,
                    color: isAccent ? "var(--color-accent)" : "var(--color-text)",
                    lineHeight: 1,
                  }}
                >
                  {stats[stat.key] ?? "…"}
                </p>
                <p className="card-text" style={{ marginTop: 4 }}>
                  {stat.label}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <div
        className="card"
        style={{
          marginTop: 24,
          padding: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="gavel" size={20} style={{ color: "var(--color-primary)" }} />
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>
            Ada pengajuan surat yang perlu ditinjau? Cek antrean pengajuan.
          </p>
        </div>
        <Link href="/admin/pengajuan" className="btn btn-solid">
          Kelola Pengajuan Surat
        </Link>
      </div>
    </div>
  );
}
