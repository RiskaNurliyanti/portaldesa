import Link from "next/link";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import PengajuanForm from "@/components/PengajuanForm";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

async function getJenisSurat(id) {
  try {
    return await apiGet(`/jenis-surat/${id}`);
  } catch (err) {
    return null;
  }
}

export default async function AjukanSuratPage({ params }) {
  const { id } = await params;
  const jenisSurat = await getJenisSurat(id);

  if (!jenisSurat) {
    notFound();
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 640 }}>
        <Link
          href="/layanan"
          style={{ fontSize: 13, color: "var(--color-text-muted)", display: "inline-block", marginBottom: 16 }}
        >
          ← Kembali ke Daftar Layanan
        </Link>

        {/* ===== Kop formulir ala dokumen kedinasan ===== */}
        <div
          style={{
            background: "var(--color-primary-dark)",
            color: "var(--color-white)",
            borderRadius: "var(--radius-lg)",
            padding: "24px 28px",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span
              className="eyebrow"
              style={{ color: "rgba(255,255,255,0.75)", background: "rgba(255,255,255,0.1)", padding: "3px 10px", borderRadius: 999 }}
            >
              Formulir Pengajuan Online
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                background: "rgba(255,255,255,0.12)",
                padding: "4px 12px",
                borderRadius: 999,
              }}
            >
              <Icon name="schedule" size={16} />
              Estimasi {jenisSurat.estimasi_hari} Hari Kerja
            </span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: "var(--color-white)", marginTop: 14, marginBottom: 8 }}>
            Formulir Permohonan {jenisSurat.nama_surat}
          </h1>
          {jenisSurat.deskripsi && (
            <p style={{ fontSize: 14, opacity: 0.85, margin: 0, maxWidth: 480 }}>{jenisSurat.deskripsi}</p>
          )}
        </div>

        {/* ===== Notis keamanan & validasi ===== */}
        <div
          style={{
            background: "var(--color-accent-soft-bg)",
            border: "1px solid var(--color-accent-soft-border)",
            borderRadius: "var(--radius-md)",
            padding: "14px 18px",
            marginBottom: 28,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
          }}
        >
          <Icon name="gpp_maybe" size={20} style={{ color: "var(--color-accent)", flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: "var(--color-accent)", margin: 0, lineHeight: 1.6 }}>
            <strong>Protokol Keamanan &amp; Validasi Dokumen.</strong> Pastikan
            data yang kamu isi sudah benar dan sesuai dokumen resmi (KTP/KK)
            sebelum mengirim. Pengajuan dengan data yang tidak sesuai berisiko
            ditolak admin.
          </p>
        </div>

        <PengajuanForm jenisSurat={jenisSurat} />

        {/* ===== Alur proses ===== */}
        <div
          style={{
            marginTop: 28,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {[
            { icon: "fact_check", label: "1. Verifikasi Admin", desc: "Petugas memeriksa kelengkapan berkas & data." },
            { icon: "draw", label: "2. Ditandatangani Kades", desc: "Surat diterbitkan resmi dengan nomor & QR." },
            { icon: "download", label: "3. Unduh Dokumen", desc: "Kamu bisa unduh PDF lewat Pengajuan Saya." },
          ].map((step) => (
            <div key={step.label} className="card" style={{ padding: 16, boxShadow: "none" }}>
              <Icon name={step.icon} size={22} style={{ color: "var(--color-primary)" }} />
              <p style={{ fontWeight: 700, fontSize: 13, margin: "8px 0 2px" }}>{step.label}</p>
              <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
