"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiGet, assetUrl } from "@/lib/api";
import Icon from "@/components/Icon";

function formatTanggal(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function isBaru(dateStr) {
  const tujuhHari = 7 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(dateStr).getTime() <= tujuhHari;
}

export default function BeritaPage() {
  const [semuaBerita, setSemuaBerita] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tahun, setTahun] = useState("");
  const [urutan, setUrutan] = useState("terbaru");
  const [page, setPage] = useState(1);
  const PER_HALAMAN = 10;

  useEffect(() => {
    apiGet("/berita?per_page=100")
      .then((res) => setSemuaBerita(res.data ?? []))
      .catch((err) => console.error("Gagal ambil berita:", err.message))
      .finally(() => setLoading(false));
  }, []);

  const tahunOptions = useMemo(() => {
    const set = new Set(semuaBerita.map((b) => new Date(b.published_at).getFullYear()));
    return Array.from(set).sort((a, b) => b - a);
  }, [semuaBerita]);

  const hasil = useMemo(() => {
    let arr = [...semuaBerita];
    if (q.trim()) {
      const kata = q.toLowerCase();
      arr = arr.filter(
        (b) => b.judul.toLowerCase().includes(kata) || (b.konten || "").toLowerCase().includes(kata)
      );
    }
    if (tahun) {
      arr = arr.filter((b) => new Date(b.published_at).getFullYear() === Number(tahun));
    }
    arr.sort((a, b) => {
      const da = new Date(a.published_at).getTime();
      const db = new Date(b.published_at).getTime();
      return urutan === "terlama" ? da - db : db - da;
    });
    return arr;
  }, [semuaBerita, q, tahun, urutan]);

  const unggulan = !q && !tahun && urutan === "terbaru" ? hasil[0] : null;
  const sisaBeritaSemua = unggulan ? hasil.slice(1) : hasil;

  useEffect(() => {
    setPage(1);
  }, [q, tahun, urutan]);

  const totalHalaman = Math.max(1, Math.ceil(sisaBeritaSemua.length / PER_HALAMAN));
  const sisaBerita = sisaBeritaSemua.slice((page - 1) * PER_HALAMAN, page * PER_HALAMAN);

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
          <div>
            <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
              Saluran Penerangan Resmi Desa
            </span>
            <h1 className="section-title" style={{ marginTop: 6, marginBottom: 4 }}>
              Warta &amp; Berita Kedinasan
            </h1>
            <p className="card-text" style={{ maxWidth: 480 }}>
              Portal transparansi publik penyampaian maklumat kegiatan dan
              pembangunan Desa Sukamaju.
            </p>
          </div>
          <div
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "10px 16px",
              fontSize: 12.5,
              color: "var(--color-text-muted)",
              flexShrink: 0,
              height: "fit-content",
            }}
          >
            Total publikasi:{" "}
            <strong style={{ color: "var(--color-text)" }}>{semuaBerita.length} warta</strong>
          </div>
        </div>

        {/* ===== Filter ===== */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "24px 0 8px" }}>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari judul atau isi berita..."
            style={{
              flex: "1 1 220px",
              padding: "10px 14px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-border)",
              fontSize: 14,
            }}
          />
          <select
            value={tahun}
            onChange={(e) => setTahun(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "var(--radius-pill)", border: "1px solid var(--color-border)", fontSize: 14 }}
          >
            <option value="">Semua Tahun Arsip</option>
            {tahunOptions.map((th) => (
              <option key={th} value={th}>
                Tahun Arsip {th}
              </option>
            ))}
          </select>
          <select
            value={urutan}
            onChange={(e) => setUrutan(e.target.value)}
            style={{ padding: "10px 14px", borderRadius: "var(--radius-pill)", border: "1px solid var(--color-border)", fontSize: 14 }}
          >
            <option value="terbaru">Terbitan Terbaru</option>
            <option value="terlama">Terbitan Terlama</option>
          </select>
        </div>

        {loading ? (
          <p className="card-text" style={{ marginTop: 24 }}>Memuat...</p>
        ) : hasil.length === 0 ? (
          <p className="card-text" style={{ marginTop: 24 }}>
            {q ? `Tidak ada berita yang cocok dengan "${q}".` : "Belum ada berita yang dipublikasikan."}
          </p>
        ) : (
          <>
            {/* ===== Artikel unggulan (terbaru) ===== */}
            {unggulan && (
              <Link
                href={`/berita/${unggulan.slug}`}
                className="card berita-unggulan"
                style={{
                  padding: 0,
                  marginTop: 28,
                  marginBottom: 32,
                }}
              >
                <div
                  style={{
                    backgroundImage: unggulan.gambar ? `url(${assetUrl(unggulan.gambar)})` : undefined,
                    backgroundColor: "var(--color-bg-alt)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    minHeight: 240,
                  }}
                />
                <div style={{ padding: 28, display: "flex", flexDirection: "column" }}>
                  <span
                    className="eyebrow"
                    style={{
                      color: "var(--color-accent)",
                      background: "var(--color-accent-soft-bg)",
                      padding: "3px 10px",
                      borderRadius: 999,
                      display: "inline-flex",
                      alignSelf: "flex-start",
                      marginBottom: 12,
                    }}
                  >
                    Sorotan Utama
                  </span>
                  <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginBottom: 8 }}>
                    {formatTanggal(unggulan.published_at)}
                  </p>
                  <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 10, lineHeight: 1.3 }}>
                    {unggulan.judul}
                  </h2>
                  <p className="card-text" style={{ marginBottom: 16 }}>
                    {(unggulan.konten || "").slice(0, 160)}
                    {(unggulan.konten || "").length > 160 ? "…" : ""}
                  </p>
                  <span style={{ marginTop: "auto", color: "var(--color-primary)", fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
                    Baca Warta Selengkapnya
                    <Icon name="arrow_forward" size={16} />
                  </span>
                </div>
              </Link>
            )}

            {/* ===== Grid berita lainnya ===== */}
            <div className="card-grid">
              {sisaBerita.map((berita) => (
                <Link key={berita.id} href={`/berita/${berita.slug}`} className="card">
                  <div
                    className="card-image"
                    style={
                      berita.gambar
                        ? { backgroundImage: `url(${assetUrl(berita.gambar)})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : undefined
                    }
                  />
                  <div className="card-body">
                    <span className="card-tag">
                      {isBaru(berita.published_at) ? "Baru" : "Berita Desa"}
                    </span>
                    <h3 className="card-title">{berita.judul}</h3>
                    <p className="card-text" style={{ marginBottom: 10 }}>
                      {(berita.konten || "").slice(0, 90)}
                      {(berita.konten || "").length > 90 ? "…" : ""}
                    </p>
                    <p style={{ fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
                      <Icon name="calendar_today" size={14} />
                      {formatTanggal(berita.published_at)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            {sisaBeritaSemua.length > PER_HALAMAN && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 32 }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn"
                  style={{ background: "transparent", border: "1px solid var(--color-border)", padding: "6px 12px", fontSize: 13 }}
                >
                  ← Sebelumnya
                </button>
                <span style={{ fontSize: 13, color: "var(--color-text-muted)", padding: "0 8px" }}>
                  Halaman {page} dari {totalHalaman}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalHalaman, p + 1))}
                  disabled={page === totalHalaman}
                  className="btn"
                  style={{ background: "transparent", border: "1px solid var(--color-border)", padding: "6px 12px", fontSize: 13 }}
                >
                  Selanjutnya →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
