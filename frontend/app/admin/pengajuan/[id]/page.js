"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { apiGet, assetUrl } from "@/lib/api";
import { labelStyle, inputStyle } from "@/lib/formStyles";
import { getExtraFields, AGAMA_OPTIONS } from "@/lib/suratFields";
import SuratPreview from "@/components/SuratPreview";
import Icon from "@/components/Icon";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const STATUS_LABEL = {
  pending: { text: "Menunggu Verifikasi", chipClass: "chip-neutral" },
  diproses: { text: "Sedang Diproses", chipClass: "chip-progress" },
  selesai: { text: "Selesai Terbit", chipClass: "chip-approved" },
  ditolak: { text: "Ditolak / Revisi", chipClass: "chip-stamp" },
  dibatalkan: { text: "Dibatalkan", chipClass: "chip-cancelled" },
};

export default function EditPengajuanPage({ params }) {
  const { id } = use(params);
  const { token } = useAuth();
  const router = useRouter();

  const [pengajuan, setPengajuan] = useState(null);
  const [form, setForm] = useState(null);
  const [dataTambahan, setDataTambahan] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const [showBatalkan, setShowBatalkan] = useState(false);
  const [alasanBatal, setAlasanBatal] = useState("");
  const [batalkanStatus, setBatalkanStatus] = useState("idle");
  const [batalkanError, setBatalkanError] = useState("");

  useEffect(() => {
    if (!token) return;
    apiGet(`/pengajuan-surat/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((data) => {
        setPengajuan(data);
        setForm({
          nama_pemohon: data.nama_pemohon || "",
          nik: data.nik || "",
          tempat_lahir: data.tempat_lahir || "",
          tanggal_lahir: data.tanggal_lahir ? data.tanggal_lahir.slice(0, 10) : "",
          jenis_kelamin: data.jenis_kelamin || "",
          agama: data.agama || "",
          pekerjaan: data.pekerjaan || "",
          alamat: data.alamat || "",
          keperluan: data.keperluan || "",
        });
        setDataTambahan(data.data_tambahan || {});
      })
      .catch((err) => setError(err.message));
  }, [id, token]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleExtraChange(name, value) {
    setDataTambahan((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch(`${API_URL}/pengajuan-surat/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, data_tambahan: dataTambahan }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const detail = err?.errors ? Object.values(err.errors).flat().join(" ") : null;
        throw new Error(detail || err?.message || "Gagal menyimpan perubahan.");
      }

      router.push("/admin/pengajuan");
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  async function handleBatalkanTerbitkanUlang() {
    setBatalkanStatus("loading");
    setBatalkanError("");

    try {
      const res = await fetch(`${API_URL}/pengajuan-surat/${id}/batalkan-terbitkan-ulang`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alasan: alasanBatal }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Gagal membatalkan surat.");
      }

      // Langsung arahkan admin ke pengajuan pengganti supaya datanya
      // ditinjau ulang dulu sebelum diterbitkan — bukan asal terbit lagi
      // dengan data yang sama persis.
      router.push(`/admin/pengajuan/${data.pengajuan_baru.id}`);
    } catch (err) {
      setBatalkanStatus("error");
      setBatalkanError(err.message);
    }
  }

  if (error && !form) return <p className="card-text">Gagal memuat: {error}</p>;
  if (!form || !pengajuan) return <p className="card-text">Memuat...</p>;

  const namaSurat = pengajuan.jenis_surat?.nama_surat || "";
  const extraFields = getExtraFields(namaSurat);
  const syaratList = pengajuan.jenis_surat?.syarat || [];
  const statusInfo = STATUS_LABEL[pengajuan.status] || STATUS_LABEL.pending;
  const sudahTerbit = pengajuan.status === "selesai";

  return (
    <div>
      <Link href="/admin/pengajuan" style={{ fontSize: 13, color: "var(--color-text-muted)", display: "inline-block", marginBottom: 12 }}>
        ← Kembali ke Daftar Pengajuan
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <span className="eyebrow" style={{ color: "var(--color-primary)" }}>
            Detail Pengajuan &middot; #{String(pengajuan.id).padStart(4, "0")}
          </span>
          <h1 className="section-title" style={{ marginTop: 4, marginBottom: 6 }}>
            {namaSurat}
          </h1>
          <span className={`chip ${statusInfo.chipClass}`}>{statusInfo.text}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview((v) => !v)}
          className="btn"
          style={{ background: "transparent", border: "1px solid var(--color-primary)", color: "var(--color-primary-dark)" }}
        >
          <Icon name="fact_check" size={18} />
          {showPreview ? "Sembunyikan Preview Surat" : "Lihat Preview Surat"}
        </button>
      </div>

      {/* ===== Pengajuan ini adalah pengganti surat yang dibatalkan ===== */}
      {pengajuan.surat_asal && (
        <div
          className="card"
          style={{ padding: 16, marginBottom: 20, background: "var(--color-bg-alt)", display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}
        >
          <Icon name="gpp_maybe" size={18} style={{ color: "var(--color-text-muted)", flexShrink: 0 }} />
          <span>
            Pengajuan ini dibuat sebagai pengganti surat nomor{" "}
            <strong>{pengajuan.surat_asal.nomor_surat}</strong> yang dibatalkan.{" "}
            <Link href={`/admin/pengajuan/${pengajuan.surat_asal.id}`} style={{ color: "var(--color-primary-dark)", fontWeight: 600 }}>
              Lihat surat asal →
            </Link>
          </span>
        </div>
      )}

      {/* ===== Surat ini sudah dibatalkan ===== */}
      {pengajuan.status === "dibatalkan" && (
        <div className="card" style={{ padding: 20, marginBottom: 20, borderColor: "var(--color-error)" }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: "var(--color-error)", marginBottom: 6 }}>
            Surat Ini Sudah Dibatalkan
          </p>
          <p className="card-text" style={{ marginBottom: pengajuan.surat_pengganti ? 10 : 0 }}>
            Alasan: {pengajuan.alasan_pembatalan}
          </p>
          {pengajuan.surat_pengganti && (
            <Link href={`/admin/pengajuan/${pengajuan.surat_pengganti.id}`} style={{ color: "var(--color-primary-dark)", fontWeight: 600, fontSize: 13 }}>
              Lihat pengajuan pengganti →
            </Link>
          )}
        </div>
      )}

      {/* ===== Batalkan & Terbitkan Ulang (cuma buat surat yang sudah terbit) ===== */}
      {sudahTerbit && (
        <div className="card" style={{ padding: 20, marginBottom: 20, borderColor: "var(--color-error)" }}>
          {!showBatalkan ? (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Ada Kesalahan di Surat Ini?</p>
                <p className="card-text">
                  Batalkan surat ini lalu buat pengajuan pengganti dengan nomor baru untuk ditinjau ulang.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBatalkan(true)}
                className="btn"
                style={{ background: "transparent", border: "1px solid var(--color-error)", color: "var(--color-error)", flexShrink: 0 }}
              >
                <Icon name="cancel" size={18} />
                Batalkan &amp; Terbitkan Ulang
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>
                Batalkan Surat &amp; Terbitkan Ulang
              </p>
              <p className="card-text" style={{ marginBottom: 12 }}>
                Surat ini akan ditandai <strong>dibatalkan</strong> (tetap tersimpan sebagai arsip) dan
                sebuah pengajuan pengganti akan dibuat dengan status <strong>menunggu verifikasi</strong> —
                supaya datanya ditinjau ulang dulu sebelum diterbitkan dengan nomor baru.
              </p>
              <label style={labelStyle}>Alasan Pembatalan (wajib)</label>
              <textarea
                value={alasanBatal}
                onChange={(e) => setAlasanBatal(e.target.value)}
                rows={3}
                placeholder="Contoh: NIK yang tertulis di surat salah ketik."
                style={{ ...inputStyle, resize: "vertical", marginBottom: 10 }}
              />
              {batalkanError && (
                <p style={{ color: "var(--color-error)", fontSize: 13, marginBottom: 10 }}>{batalkanError}</p>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={handleBatalkanTerbitkanUlang}
                  disabled={!alasanBatal.trim() || batalkanStatus === "loading"}
                  className="btn"
                  style={{ background: "var(--color-error)", color: "var(--color-white)" }}
                >
                  {batalkanStatus === "loading" ? "Memproses..." : "Ya, Batalkan Surat Ini"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowBatalkan(false);
                    setAlasanBatal("");
                    setBatalkanError("");
                  }}
                  className="btn"
                  style={{ background: "transparent", border: "1px solid var(--color-border)" }}
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showPreview && (
        <div style={{ marginBottom: 28 }}>
          <SuratPreview
            namaSurat={namaSurat}
            form={form}
            dataTambahan={dataTambahan}
            final={
              sudahTerbit
                ? {
                    nomor_surat: pengajuan.nomor_surat,
                    kode_verifikasi: pengajuan.kode_verifikasi,
                    ditandatangani_oleh: pengajuan.ditandatangani_oleh,
                    tanggal_terbit: pengajuan.finalized_at,
                  }
                : null
            }
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, maxWidth: 640, width: "100%", margin: "0 auto" }}>
        {/* ===== Data Identitas Pemohon ===== */}
        <p style={{ fontWeight: 700, fontSize: 13, color: "var(--color-primary-dark)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.03em" }}>
          Data Identitas Pemohon
        </p>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nama Lengkap</label>
          <input name="nama_pemohon" value={form.nama_pemohon} onChange={handleChange} required style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>NIK</label>
          <input name="nik" value={form.nik} onChange={handleChange} required pattern="\d{16}" maxLength={16} style={inputStyle} />
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={labelStyle}>Tempat Lahir</label>
            <input name="tempat_lahir" value={form.tempat_lahir} onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={labelStyle}>Tanggal Lahir</label>
            <input type="date" name="tanggal_lahir" value={form.tanggal_lahir} onChange={handleChange} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={labelStyle}>Jenis Kelamin</label>
            <select name="jenis_kelamin" value={form.jenis_kelamin} onChange={handleChange} style={inputStyle}>
              <option value="">Pilih...</option>
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 160 }}>
            <label style={labelStyle}>Agama</label>
            <select name="agama" value={form.agama} onChange={handleChange} style={inputStyle}>
              <option value="">Pilih...</option>
              {AGAMA_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Pekerjaan</label>
          <input name="pekerjaan" value={form.pekerjaan} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Alamat</label>
          <textarea name="alamat" value={form.alamat} onChange={handleChange} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        {/* ===== Data Tambahan (kalau ada) ===== */}
        {extraFields.length > 0 && (
          <>
            <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: 20 }} />
            <p style={{ fontWeight: 700, fontSize: 13, color: "var(--color-primary-dark)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Data Tambahan untuk {namaSurat}
            </p>
            {extraFields.map((field) => (
              <div key={field.name} style={{ marginBottom: 16 }}>
                <label style={labelStyle}>{field.label}</label>
                {field.type === "jk" ? (
                  <select
                    value={dataTambahan[field.name] || ""}
                    onChange={(e) => handleExtraChange(field.name, e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Pilih...</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                ) : (
                  <input
                    type={field.type === "date" ? "date" : "text"}
                    value={dataTambahan[field.name] || ""}
                    onChange={(e) => handleExtraChange(field.name, e.target.value)}
                    style={inputStyle}
                  />
                )}
              </div>
            ))}
          </>
        )}

        <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: 20 }} />

        {/* ===== Keperluan ===== */}
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Keperluan</label>
          <textarea
            name="keperluan"
            value={form.keperluan}
            onChange={handleChange}
            required
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>

        {/* ===== Lampiran Berkas (berlabel sesuai syarat) ===== */}
        {pengajuan.lampiran_files && pengajuan.lampiran_files.length > 0 && (
          <>
            <div style={{ borderTop: "1px solid var(--color-border)", marginBottom: 20 }} />
            <p style={{ fontWeight: 700, fontSize: 13, color: "var(--color-primary-dark)", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Lampiran Berkas
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {pengajuan.lampiran_files.map((path, idx) => (
                <a
                  key={idx}
                  href={assetUrl(path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "var(--color-bg-alt)",
                    borderRadius: "var(--radius-sm)",
                    fontSize: 13,
                    color: "var(--color-text)",
                  }}
                >
                  <Icon name="open_in_new" size={16} style={{ color: "var(--color-primary)" }} />
                  <span style={{ flex: 1 }}>
                    <strong>{syaratList[idx] || `Berkas ${idx + 1}`}</strong>
                  </span>
                  <span style={{ color: "var(--color-primary-dark)", fontWeight: 600 }}>Lihat berkas →</span>
                </a>
              ))}
            </div>
          </>
        )}

        {error && <p style={{ color: "var(--color-error)", fontSize: 14, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="btn btn-solid" disabled={status === "loading"}>
            {status === "loading" ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/pengajuan")}
            className="btn"
            style={{ background: "transparent", border: "1px solid var(--color-border)" }}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
