"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function LayananList({ jenisSuratList }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return jenisSuratList;
    const kata = q.toLowerCase();
    return jenisSuratList.filter(
      (s) =>
        s.nama_surat.toLowerCase().includes(kata) ||
        (s.deskripsi || "").toLowerCase().includes(kata)
    );
  }, [q, jenisSuratList]);

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-pill)",
          padding: "4px 4px 4px 16px",
          marginBottom: 12,
          maxWidth: 480,
        }}
      >
        <Icon name="search" size={20} style={{ color: "var(--color-text-muted)" }} />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari jenis surat..."
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "8px 0",
            fontSize: 14,
            background: "transparent",
          }}
        />
      </div>
      <p className="card-text" style={{ marginBottom: 24 }}>
        Menampilkan {filtered.length} dari {jenisSuratList.length} layanan resmi.
      </p>

      {filtered.length === 0 ? (
        <p className="card-text">Tidak ada jenis surat yang cocok dengan pencarianmu.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
          }}
        >
          {filtered.map((surat) => {
            const syaratRingkas = surat.syarat.join(" • ");
            return (
              <div
                key={surat.id}
                className="card"
                style={{ padding: 20, display: "flex", flexDirection: "column" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span className="eyebrow" style={{ color: "var(--color-text-muted)" }}>
                    REG-{String(surat.id).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "var(--color-primary-dark)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-primary)" }} />
                    Online Aktif
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-heading), serif",
                    fontSize: 17,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  {surat.nama_surat}
                </h3>
                {surat.deskripsi && (
                  <p className="card-text" style={{ marginBottom: 12, flex: "none" }}>
                    {surat.deskripsi}
                  </p>
                )}

                <div
                  style={{
                    background: "var(--color-bg-alt)",
                    borderRadius: "var(--radius-sm)",
                    padding: "8px 10px",
                    marginBottom: 14,
                  }}
                >
                  <p className="doc-index-syarat-label" style={{ marginBottom: 3 }}>
                    Persyaratan Pokok
                  </p>
                  <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: 0 }}>
                    {syaratRingkas}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12.5,
                    color: "var(--color-text-muted)",
                    marginBottom: 14,
                  }}
                >
                  <span>{surat.estimasi_hari} hari kerja</span>
                  <strong style={{ color: "var(--color-primary)" }}>{surat.biaya || "Gratis"}</strong>
                </div>

                <Link href={`/layanan/ajukan/${surat.id}`} className="btn btn-solid" style={{ marginTop: "auto" }}>
                  Ajukan Permohonan
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
