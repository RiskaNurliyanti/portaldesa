"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { apiGet } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminBeritaPage() {
  const { token } = useAuth();
  const [beritaList, setBeritaList] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!token) return;
    setLoading(true);
    try {
      const res = await apiGet("/admin/berita", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBeritaList(res.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [token]);

  async function handleDelete(id) {
    if (!confirm("Yakin mau hapus berita ini?")) return;
    await fetch(`${API_URL}/berita/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
            Warta Kedinasan &amp; Siaran Publik
          </span>
          <h1 className="section-title" style={{ marginBottom: 0, marginTop: 4 }}>
            Kelola Berita
          </h1>
        </div>
        <Link href="/admin/berita/baru" className="btn btn-solid">
          + Berita Baru
        </Link>
      </div>

      {loading ? (
        <p className="card-text">Memuat...</p>
      ) : beritaList.length === 0 ? (
        <p className="card-text">Belum ada berita.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {beritaList.map((b) => (
            <div
              key={b.id}
              className="card"
              style={{
                padding: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <span className={`chip ${b.published_at ? "chip-approved" : "chip-neutral"}`} style={{ marginBottom: 6 }}>
                  {b.published_at ? "Terbit" : "Draf"}
                </span>
                <p style={{ fontWeight: 600, marginTop: 6 }}>{b.judul}</p>
                <p className="card-text">
                  {new Date(b.created_at).toLocaleDateString("id-ID")}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link
                  href={`/admin/berita/${b.slug}`}
                  className="btn"
                  style={{
                    background: "transparent",
                    color: "var(--color-primary-dark)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="btn"
                  style={{ background: "var(--color-accent-soft-bg)", color: "var(--color-accent)" }}
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
