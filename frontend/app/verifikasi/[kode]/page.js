"use client";

import { use, useEffect, useState } from "react";
import { apiGetWithStatus } from "@/lib/api";
import Icon from "@/components/Icon";

export default function VerifikasiPage({ params }) {
  const { kode } = use(params);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let diabaikan = false;
    setLoading(true);
    setResult(null);

    apiGetWithStatus(`/verifikasi/${kode}`, 6000)
      .then(({ data }) => {
        if (diabaikan) return;

        // Backend tetap balas body JSON walau statusnya 404/410 (mis.
        // surat sudah dibatalkan) — pakai apa adanya, jangan diganti
        // pesan generik supaya info "lihat surat pengganti" gak hilang.
        setResult(data || { valid: false, message: "Kode verifikasi tidak ditemukan atau dokumen tidak sah." });
      })
      .catch((err) => {
        if (diabaikan) return;
        setResult({ valid: false, message: err.message });
      })
      .finally(() => {
        if (!diabaikan) setLoading(false);
      });

    return () => {
      diabaikan = true;
    };
  }, [kode, attempt]);

  return (
    <div className="section" style={{ display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ padding: 32, width: "100%", maxWidth: 560 }}>
        <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
          Verifikasi Dokumen Resmi
        </span>
        <h1 className="section-title" style={{ fontSize: 24, marginTop: 6, marginBottom: 20 }}>
          Verifikasi Keaslian Surat
        </h1>

        {loading ? (
          <div>
            <p className="card-text">Memeriksa dokumen...</p>
            <div
              style={{
                marginTop: 12,
                height: 4,
                borderRadius: 999,
                background: "var(--color-bg-alt)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: "40%",
                  background: "var(--color-primary)",
                  animation: "verifikasi-loading 1s ease-in-out infinite",
                }}
              />
            </div>
            <style>{`
              @keyframes verifikasi-loading {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(350%); }
              }
            `}</style>
          </div>
        ) : result?.valid ? (
          <>
            <div
              style={{
                background: "var(--color-primary)",
                color: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                padding: 20,
                marginBottom: 24,
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="check_circle" size={26} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <p style={{ fontFamily: "var(--font-heading), serif", fontWeight: 600, fontSize: 17, margin: 0 }}>
                    Dokumen Ini Asli &amp; Terdaftar Resmi
                  </p>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    Status: Sah
                  </span>
                </div>
                <p style={{ fontSize: 13, margin: 0, opacity: 0.9 }}>
                  Dokumen ini diterbitkan secara elektronik oleh Sistem
                  Informasi Desa Sukamaju dan sah tanpa memerlukan tanda
                  tangan basah.
                </p>
              </div>
            </div>

            <table style={{ width: "100%", fontSize: 14 }}>
              <tbody>
                <tr>
                  <td style={{ padding: "6px 0", color: "var(--color-text-muted)", width: 140 }}>
                    Nomor Surat
                  </td>
                  <td style={{ padding: "6px 0", fontWeight: 600 }}>{result.nomor_surat}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 0", color: "var(--color-text-muted)" }}>Jenis Surat</td>
                  <td style={{ padding: "6px 0", fontWeight: 600 }}>{result.jenis_surat}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 0", color: "var(--color-text-muted)" }}>Atas Nama</td>
                  <td style={{ padding: "6px 0", fontWeight: 600 }}>{result.nama_pemohon}</td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 0", color: "var(--color-text-muted)" }}>Tanggal Terbit</td>
                  <td style={{ padding: "6px 0", fontWeight: 600 }}>
                    {new Date(result.tanggal_terbit).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: "6px 0", color: "var(--color-text-muted)" }}>
                    Ditandatangani
                  </td>
                  <td style={{ padding: "6px 0", fontWeight: 600 }}>{result.ditandatangani_oleh}</td>
                </tr>
              </tbody>
            </table>
          </>
        ) : (
          <>
            <div
              style={{
                background: "var(--color-accent)",
                color: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                padding: 20,
                marginBottom: 20,
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="cancel" size={26} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                  <p style={{ fontFamily: "var(--font-heading), serif", fontWeight: 600, fontSize: 17, margin: 0 }}>
                    {result?.dibatalkan ? "Surat Ini Sudah Dibatalkan" : "Dokumen Tidak Valid"}
                  </p>
                  <span
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      padding: "2px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {result?.dibatalkan ? "Dibatalkan" : "Tidak Terdaftar"}
                  </span>
                </div>
                <p style={{ fontSize: 13, margin: 0, opacity: 0.9 }}>
                  {result?.message ||
                    "Kode verifikasi tidak ditemukan. Pastikan QR code atau link yang kamu buka benar."}
                </p>
              </div>
            </div>
            {result?.dibatalkan && result?.surat_pengganti && (
              <a
                href={`/verifikasi/${result.surat_pengganti.kode_verifikasi}`}
                className="btn btn-solid"
                style={{ marginRight: 8 }}
              >
                Lihat Surat Pengganti ({result.surat_pengganti.nomor_surat})
              </a>
            )}
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="btn"
              style={{ background: "transparent", border: "1px solid var(--color-border)" }}
            >
              Coba Lagi
            </button>
          </>
        )}
      </div>
    </div>
  );
}
