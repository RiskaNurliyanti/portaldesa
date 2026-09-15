"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { apiGet } from "@/lib/api";
import Icon from "@/components/Icon";
import { labelStyle, inputStyle } from "@/lib/formStyles";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

function SectionHeader({ icon, title }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <Icon name={icon} size={20} style={{ color: "var(--color-primary)" }} />
      <p style={{ fontFamily: "var(--font-heading), serif", fontSize: 16, fontWeight: 600, margin: 0 }}>
        {title}
      </p>
    </div>
  );
}

export default function AdminProfilPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    nama_desa: "",
    alamat: "",
    sejarah: "",
    visi: "",
    misi: "",
    jumlah_dusun: 0,
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet("/profil-desa")
      .then((data) => {
        if (data) setForm((prev) => ({ ...prev, ...data }));
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function adjustDusun(delta) {
    setForm((prev) => ({ ...prev, jumlah_dusun: Math.max(0, Number(prev.jumlah_dusun || 0) + delta) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`${API_URL}/profil-desa`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menyimpan profil desa.");
      }

      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  if (loading) return <p className="card-text">Memuat...</p>;

  const jumlahKataSejarah = (form.sejarah || "").trim().split(/\s+/).filter(Boolean).length;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
            Pengaturan &amp; Pemutakhiran Portal
          </span>
          <h1 className="section-title" style={{ marginBottom: 4, marginTop: 4 }}>
            Kelola Profil Desa
          </h1>
          <p className="card-text" style={{ maxWidth: 480 }}>
            Perbarui identitas, sejarah, serta visi &amp; misi pembangunan desa
            yang tampil di halaman publik.
          </p>
        </div>
        <Link href="/profil" target="_blank" className="btn" style={{ background: "transparent", border: "1px solid var(--color-border)", flexShrink: 0 }}>
          <Icon name="open_in_new" size={18} />
          Pratinjau Halaman Publik
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card"
        style={{ padding: 28, maxWidth: 680, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* ===== Identitas & Kedudukan Wilayah ===== */}
        <div>
          <SectionHeader icon="location_city" title="Identitas Resmi &amp; Kedudukan Wilayah" />

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Nama Desa</label>
            <input name="nama_desa" value={form.nama_desa} onChange={handleChange} required style={inputStyle} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Alamat Kantor Balai Desa</label>
            <input name="alamat" value={form.alamat || ""} onChange={handleChange} style={inputStyle} />
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
              Cantumkan nama jalan, nomor, dusun/RT-RW, kecamatan, dan kabupaten.
            </p>
          </div>

          <div>
            <label style={labelStyle}>Jumlah Dusun / Wilayah Bagian</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                type="button"
                onClick={() => adjustDusun(-1)}
                className="btn"
                style={{ background: "var(--color-bg-alt)", padding: "8px 14px", fontSize: 16 }}
              >
                −
              </button>
              <span style={{ fontFamily: "var(--font-heading), serif", fontSize: 22, fontWeight: 600, minWidth: 32, textAlign: "center" }}>
                {form.jumlah_dusun || 0}
              </span>
              <button
                type="button"
                onClick={() => adjustDusun(1)}
                className="btn"
                style={{ background: "var(--color-bg-alt)", padding: "8px 14px", fontSize: 16 }}
              >
                +
              </button>
              <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>unit dusun</span>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)" }} />

        {/* ===== Sejarah ===== */}
        <div>
          <SectionHeader icon="menu_book" title="Sejarah Singkat &amp; Latar Belakang" />
          <label style={labelStyle}>Narasi Sejarah Desa</label>
          <textarea
            name="sejarah"
            value={form.sejarah || ""}
            onChange={handleChange}
            rows={6}
            style={{ ...inputStyle, resize: "vertical" }}
          />
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4, textAlign: "right" }}>
            {jumlahKataSejarah} kata
          </p>
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)" }} />

        {/* ===== Visi & Misi ===== */}
        <div>
          <SectionHeader icon="flag" title="Haluan Visi &amp; Misi Pembangunan Desa" />

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Rumusan Visi</label>
            <textarea
              name="visi"
              value={form.visi || ""}
              onChange={handleChange}
              rows={2}
              style={{
                ...inputStyle,
                resize: "vertical",
                background: "var(--color-bg-alt)",
                fontFamily: "var(--font-heading), serif",
                fontWeight: 600,
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Pernyataan Misi</label>
            <textarea
              name="misi"
              value={form.misi || ""}
              onChange={handleChange}
              rows={5}
              style={{ ...inputStyle, resize: "vertical" }}
            />
            <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 4 }}>
              Sarankan: pisahkan tiap poin misi ke baris baru.
            </p>
          </div>
        </div>

        {error && <p style={{ color: "var(--color-error)", fontSize: 14 }}>{error}</p>}
        {status === "success" && (
          <p style={{ color: "var(--color-primary-dark)", fontSize: 14, fontWeight: 600 }}>
            ✓ Perubahan tersimpan dan langsung tampil di halaman publik.
          </p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="submit" className="btn btn-solid" disabled={status === "loading"}>
            {status === "loading" ? "Menyimpan..." : "Simpan Pemutakhiran Profil"}
          </button>
        </div>
      </form>
    </div>
  );
}
