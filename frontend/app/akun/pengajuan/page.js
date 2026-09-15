"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { apiGet, assetUrl, downloadFile } from "@/lib/api";

const STATUS_LABEL = {
  pending: { text: "Menunggu diproses", chipClass: "chip-neutral" },
  diproses: { text: "Sedang diproses", chipClass: "chip-progress" },
  selesai: { text: "Selesai — surat terbit", chipClass: "chip-approved" },
  ditolak: { text: "Ditolak", chipClass: "chip-stamp" },
  dibatalkan: { text: "Dibatalkan — diajukan ulang", chipClass: "chip-cancelled" },
};

export default function PengajuanSayaPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!token) return;
    apiGet("/pengajuan-surat/saya", { headers: { Authorization: `Bearer ${token}` } })
      .then(setList)
      .catch((err) => console.error(err))
      .finally(() => setFetching(false));
  }, [token]);

  const filteredList = useMemo(() => {
    if (!q.trim()) return list;
    const kata = q.toLowerCase();
    return list.filter(
      (item) =>
        (item.jenis_surat?.nama_surat || "").toLowerCase().includes(kata) ||
        (item.keperluan || "").toLowerCase().includes(kata) ||
        (item.nomor_surat || "").toLowerCase().includes(kata)
    );
  }, [q, list]);

  if (loading || !user) {
    return (
      <div className="section container">
        <p className="card-text">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 720 }}>
        <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
          Layanan Mandiri Warga
        </span>
        <h1 className="section-title" style={{ marginTop: 6 }}>
          Pengajuan Surat Saya
        </h1>
        <p className="section-subtitle">
          Riwayat semua surat yang pernah kamu ajukan lewat akun ini.
        </p>

        {list.length > 0 && (
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari jenis surat, keperluan, atau nomor surat..."
            style={{
              width: "100%",
              maxWidth: 420,
              padding: "10px 16px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--color-border)",
              fontSize: 14,
              marginBottom: 24,
            }}
          />
        )}

        {fetching ? (
          <p className="card-text">Memuat riwayat...</p>
        ) : list.length === 0 ? (
          <p className="card-text">
            Kamu belum pernah mengajukan surat lewat akun ini. Ajukan lewat
            halaman{" "}
            <a href="/layanan" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
              Layanan
            </a>
            .
          </p>
        ) : filteredList.length === 0 ? (
          <p className="card-text">Tidak ada pengajuan yang cocok dengan &quot;{q}&quot;.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filteredList.map((item) => {
              const statusInfo = STATUS_LABEL[item.status] || STATUS_LABEL.pending;
              return (
                <div key={item.id} className="card" style={{ padding: 20 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 8,
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, fontFamily: "var(--font-heading), serif", fontSize: 17 }}>
                        {item.jenis_surat?.nama_surat}
                      </p>
                      <p className="card-text">
                        Diajukan: {new Date(item.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span className={`chip ${statusInfo.chipClass}`} style={{ alignSelf: "flex-start" }}>
                      {statusInfo.text}
                    </span>
                  </div>

                  <p className="card-text" style={{ marginBottom: 8 }}>{item.keperluan}</p>

                  {item.catatan_admin && (
                    <div
                      style={{
                        background: item.status === "ditolak" ? "var(--color-accent-soft-bg)" : "var(--color-bg-alt)",
                        border: `1px solid ${item.status === "ditolak" ? "var(--color-accent-soft-border)" : "var(--color-border)"}`,
                        borderRadius: "var(--radius-sm)",
                        padding: "8px 12px",
                        fontSize: 13,
                        color: item.status === "ditolak" ? "var(--color-accent)" : "var(--color-text-muted)",
                        marginBottom: 12,
                      }}
                    >
                      <strong>Catatan admin:</strong> {item.catatan_admin}
                    </div>
                  )}

                  {item.status === "dibatalkan" && item.alasan_pembatalan && (
                    <div
                      style={{
                        background: "var(--color-error-bg)",
                        border: "1px solid var(--color-error)",
                        borderRadius: "var(--radius-sm)",
                        padding: "8px 12px",
                        fontSize: 13,
                        color: "var(--color-error)",
                        marginBottom: 12,
                      }}
                    >
                      <strong>Surat ini dibatalkan.</strong> Alasan: {item.alasan_pembatalan}. Pengajuan
                      pengganti sudah dibuat dan akan ditinjau ulang oleh admin.
                    </div>
                  )}

                  {item.status === "selesai" && item.file_surat && (
                    <button
                      type="button"
                      onClick={() =>
                        downloadFile(
                          `/pengajuan-surat/${item.id}/unduh-surat`,
                          `${item.jenis_surat?.nama_surat || "surat"}.pdf`,
                          token
                        )
                      }
                      className="btn btn-solid"
                    >
                      Download Surat (PDF)
                    </button>
                  )}

                  {item.status === "ditolak" && (
                    <Link href={`/akun/pengajuan/${item.id}/lengkapi`} className="btn btn-solid">
                      Lengkapi Berkas & Ajukan Ulang
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
