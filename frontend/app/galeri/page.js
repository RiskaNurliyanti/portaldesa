"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, assetUrl } from "@/lib/api";
import ImageCarousel from "@/components/ImageCarousel";
import Lightbox from "@/components/Lightbox";
import Icon from "@/components/Icon";

export default function GaleriPage() {
  const [galeriList, setGaleriList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const PER_HALAMAN = 10;

  useEffect(() => {
    apiGet("/galeri")
      .then(setGaleriList)
      .catch((err) => console.error("Gagal ambil galeri:", err.message))
      .finally(() => setLoading(false));
  }, []);

  // Kelompokin foto yang diupload bareng (kelompok sama) jadi satu blok
  const kelompokMap = new Map();
  for (const foto of galeriList) {
    const key = foto.kelompok || `single-${foto.id}`;
    if (!kelompokMap.has(key)) kelompokMap.set(key, []);
    kelompokMap.get(key).push(foto);
  }
  const semuaBlok = Array.from(kelompokMap.values()).sort((a, b) => {
    const da = a[0].kegiatan_at ? new Date(a[0].kegiatan_at).getTime() : 0;
    const db = b[0].kegiatan_at ? new Date(b[0].kegiatan_at).getTime() : 0;
    return db - da;
  });

  const blokList = useMemo(() => {
    if (!q.trim()) return semuaBlok;
    const kata = q.toLowerCase();
    return semuaBlok.filter((grup) => grup[0].judul.toLowerCase().includes(kata));
  }, [q, semuaBlok]);

  useEffect(() => {
    setPage(1);
  }, [q]);

  const totalHalaman = Math.max(1, Math.ceil(blokList.length / PER_HALAMAN));
  const blokHalamanIni = blokList.slice((page - 1) * PER_HALAMAN, page * PER_HALAMAN);

  return (
    <div className="section">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 8 }}>
          <div>
            <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
              Dokumentasi Visual &amp; Arsip Lapangan
            </span>
            <h1 className="section-title" style={{ marginTop: 6, marginBottom: 4 }}>
              Galeri Dokumentasi Kegiatan
            </h1>
            <p className="card-text" style={{ maxWidth: 480 }}>
              Rekam jejak visual kegiatan &amp; pembangunan yang berlangsung di
              Desa Sukamaju.
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
            Total arsip: <strong style={{ color: "var(--color-text)" }}>{galeriList.length} foto</strong>
            {" "}dalam <strong style={{ color: "var(--color-text)" }}>{semuaBlok.length} kegiatan</strong>
          </div>
        </div>

        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari kegiatan berdasarkan judul..."
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "10px 16px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-border)",
            fontSize: 14,
            marginTop: 20,
          }}
        />

        {loading ? (
          <p className="card-text" style={{ marginTop: 24 }}>Memuat...</p>
        ) : semuaBlok.length === 0 ? (
          <p className="card-text" style={{ marginTop: 24 }}>Belum ada foto yang diunggah.</p>
        ) : blokList.length === 0 ? (
          <p className="card-text" style={{ marginTop: 24 }}>Tidak ada kegiatan yang cocok dengan &quot;{q}&quot;.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 32 }}>
            {blokHalamanIni.map((grup) => {
              const utama = grup[0];
              return (
                <div
                  key={utama.kelompok || utama.id}
                  className="card galeri-blok"
                  style={{ padding: 0 }}
                >
                  <div>
                    <ImageCarousel
                      images={grup.map((f) => ({ src: assetUrl(f.gambar), alt: f.judul }))}
                      height={320}
                      onImageClick={(src, alt) => setLightbox({ src, alt })}
                    />
                  </div>

                  <div style={{ padding: 24, display: "flex", flexDirection: "column" }}>
                    <span
                      className="eyebrow"
                      style={{
                        color: "var(--color-primary-dark)",
                        background: "var(--color-primary-pale)",
                        padding: "3px 10px",
                        borderRadius: 999,
                        display: "inline-flex",
                        alignSelf: "flex-start",
                        marginBottom: 12,
                      }}
                    >
                      Arsip Foto Kegiatan Desa
                    </span>

                    <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{utama.judul}</h2>

                    {utama.kegiatan_at && (
                      <p style={{ fontSize: 13, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
                        <Icon name="calendar_month" size={16} />
                        {new Date(utama.kegiatan_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    )}

                    <div
                      style={{
                        marginTop: "auto",
                        borderTop: "1px solid var(--color-border)",
                        paddingTop: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 12.5,
                        color: "var(--color-text-muted)",
                      }}
                    >
                      <Icon name="photo_library" size={16} style={{ color: "var(--color-primary)" }} />
                      {grup.length} foto dokumentasi
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {blokList.length > PER_HALAMAN && (
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
      </div>

      <Lightbox src={lightbox?.src} alt={lightbox?.alt} onClose={() => setLightbox(null)} />
    </div>
  );
}
