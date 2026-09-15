"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { apiPostForm, assetUrl } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { getExtraFields, AGAMA_OPTIONS } from "@/lib/suratFields";
import { labelStyle, inputStyle } from "@/lib/formStyles";
import SuratPreview from "@/components/SuratPreview";
import Icon from "@/components/Icon";

// Satu slot upload untuk satu baris syarat (dipetakan lewat index array
// `files`, konsisten sama urutan `jenisSurat.syarat`). Ini yang bikin
// warga jelas berkas mana buat syarat yang mana — bukan satu kotak upload
// umum yang nampung banyak file tanpa label.
function SyaratSlot({ nomor, label, file, onPilih, onHapus }) {
  const isExisting = file?.isExisting;
  const isImage = isExisting
    ? /\.(jpe?g|png|gif|webp)$/i.test(file.url || "")
    : file?.type?.startsWith("image/");
  const previewSrc = isExisting ? file.url : file ? URL.createObjectURL(file) : null;

  return (
    <div
      className="card"
      style={{
        padding: 14,
        marginBottom: 10,
        boxShadow: "none",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "var(--color-primary-pale)",
          color: "var(--color-primary-dark)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {nomor}
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{label}</p>
        {file ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            {isImage ? (
              <img src={previewSrc} alt={label} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: "var(--radius-sm)" }} />
            ) : (
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--color-bg-alt)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  flexShrink: 0,
                }}
              >
                PDF
              </span>
            )}
            <span style={{ fontSize: 12, color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {file.name}
            </span>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "2px 0 0" }}>Belum ada berkas dipilih</p>
        )}
      </div>

      <label
        className="btn"
        style={{
          background: file ? "transparent" : "var(--color-primary)",
          color: file ? "var(--color-primary-dark)" : "var(--color-white)",
          border: file ? "1px solid var(--color-border)" : "none",
          fontSize: 12,
          padding: "6px 12px",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {file ? "Ganti" : "Pilih Berkas"}
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => {
            if (e.target.files?.[0]) onPilih(e.target.files[0]);
            e.target.value = "";
          }}
          style={{ display: "none" }}
        />
      </label>
      {file && (
        <button
          type="button"
          onClick={onHapus}
          aria-label="Hapus berkas"
          style={{ background: "none", border: "none", color: "var(--color-accent)", cursor: "pointer", flexShrink: 0 }}
        >
          <Icon name="delete" size={18} />
        </button>
      )}
    </div>
  );
}

// mode "baru" (default): ajukan surat baru lewat POST /pengajuan-surat.
// mode "lengkapi": Opsi A ("Lengkapi Berkas") — dipakai warga waktu
// pengajuannya sebelumnya DITOLAK. Form pre-filled dari existingPengajuan,
// kirim ulang lewat POST /pengajuan-surat/{id}/lengkapi ke pengajuan yang
// SAMA (bukan bikin pengajuan baru).
export default function PengajuanForm({ jenisSurat, mode = "baru", existingPengajuan = null }) {
  const { user, token, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const isLengkapi = mode === "lengkapi" && existingPengajuan;
  const [step, setStep] = useState("form"); // form | preview | success
  const [form, setForm] = useState({
    nama_pemohon: existingPengajuan?.nama_pemohon || "",
    nik: existingPengajuan?.nik || "",
    tempat_lahir: existingPengajuan?.tempat_lahir || "",
    tanggal_lahir: existingPengajuan?.tanggal_lahir ? existingPengajuan.tanggal_lahir.slice(0, 10) : "",
    jenis_kelamin: existingPengajuan?.jenis_kelamin || "",
    agama: existingPengajuan?.agama || "",
    pekerjaan: existingPengajuan?.pekerjaan || "",
    alamat: existingPengajuan?.alamat || "",
    keperluan: existingPengajuan?.keperluan || "",
  });
  const [dataTambahan, setDataTambahan] = useState(existingPengajuan?.data_tambahan || {});
  const [files, setFiles] = useState(
    () =>
      (existingPengajuan?.lampiran_files || []).map((path, idx) => ({
        isExisting: true,
        path,
        url: assetUrl(path),
        name: `Berkas lama ${idx + 1}`,
      }))
  );
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [setuju, setSetuju] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const extraFields = getExtraFields(jenisSurat.nama_surat);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleExtraChange(name, value) {
    setDataTambahan((prev) => ({ ...prev, [name]: value }));
  }

  function handleLanjutPreview(e) {
    e.preventDefault();
    setStep("preview");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleKirim() {
    setStatus("loading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append("data_tambahan", JSON.stringify(dataTambahan));

      if (isLengkapi) {
        // Berkas lama yang masih dipertahankan warga dikirim sebagai path,
        // berkas baru (File asli) dikirim sebagai lampiran[] biasa. Berkas
        // lama yang sudah dihapus dari daftar otomatis gak ikut terkirim,
        // jadi di backend dianggap sengaja dibuang.
        files.forEach((f) => {
          if (!f) return;
          if (f.isExisting) {
            formData.append("lampiran_existing[]", f.path);
          } else {
            formData.append("lampiran[]", f);
          }
        });

        await apiPostForm(`/pengajuan-surat/${existingPengajuan.id}/lengkapi`, formData, token);
      } else {
        formData.append("jenis_surat_id", jenisSurat.id);
        files.forEach((f) => {
          if (f) formData.append("lampiran[]", f);
        });

        await apiPostForm("/pengajuan-surat", formData, token);
      }

      setStep("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setStatus("idle");
    }
  }

  // Wajib login dulu sebelum bisa ngajuin surat — biar setiap pengajuan
  // pasti ke-link ke akun, gak ada lagi yang "ilang" gara-gara anonim.
  if (!authLoading && !user) {
    return (
      <div className="card" style={{ padding: 28, textAlign: "center" }}>
        <h3 className="card-title" style={{ marginBottom: 8 }}>
          Login Dulu Yuk
        </h3>
        <p className="card-text" style={{ marginBottom: 20 }}>
          Kamu harus login supaya pengajuan surat ini ke-link ke akunmu dan
          bisa dipantau statusnya lewat menu "Pengajuan Saya".
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="btn btn-solid">
            Masuk
          </Link>
          <Link
            href={`/register?redirect=${encodeURIComponent(pathname)}`}
            className="btn"
            style={{ background: "transparent", border: "1px solid var(--color-border)" }}
          >
            Daftar Akun
          </Link>
        </div>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h3 className="card-title" style={{ marginBottom: 8 }}>
          {isLengkapi ? "Pengajuan Berhasil Diajukan Ulang" : "Pengajuan Berhasil Dikirim"}
        </h3>
        <p className="card-text">
          {isLengkapi
            ? `Perbaikan pengajuan ${jenisSurat.nama_surat} kamu sudah kami terima dan akan ditinjau ulang oleh admin. Pantau statusnya lewat menu "Pengajuan Saya".`
            : `Pengajuan ${jenisSurat.nama_surat} kamu sudah kami terima dan akan
          diproses dalam estimasi ${jenisSurat.estimasi_hari} hari. Surat
          resmi (PDF dengan nomor surat & QR verifikasi) bisa kamu dapatkan
          setelah admin selesai memproses — simpan NIK kamu untuk keperluan
          pengecekan status ke kantor desa.`}
        </p>
      </div>
    );
  }

  if (step === "preview") {
    return (
      <div>
        <SuratPreview namaSurat={jenisSurat.nama_surat} form={form} dataTambahan={dataTambahan} />

        {errorMsg && (
          <p style={{ color: "#b3261e", fontSize: 14, marginTop: 16 }}>{errorMsg}</p>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button
            type="button"
            onClick={() => setStep("form")}
            className="btn"
            style={{
              flex: 1,
              background: "transparent",
              color: "var(--color-primary-dark)",
              border: "1px solid var(--color-border)",
            }}
          >
            Kembali Edit
          </button>
          <button
            type="button"
            onClick={handleKirim}
            className="btn btn-solid"
            style={{ flex: 1 }}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Mengirim..." : isLengkapi ? "Kirim Ulang Pengajuan" : "Kirim Pengajuan Sekarang"}
          </button>
        </div>

        <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 12 }}>
          Ini pratinjau isi surat berdasarkan data yang kamu masukkan. Nomor
          surat, tanda tangan, dan QR verifikasi baru akan muncul setelah
          admin memproses dan menerbitkan surat aslinya.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLanjutPreview} className="card" style={{ padding: 24 }}>
      {isLengkapi && existingPengajuan?.catatan_admin && (
        <div
          style={{
            background: "#fdecea",
            border: "1px solid #f3c6c1",
            borderRadius: "var(--radius-md)",
            padding: 14,
            marginBottom: 20,
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 13, color: "#b3261e", marginBottom: 4 }}>
            Alasan pengajuan ini ditolak admin:
          </p>
          <p style={{ fontSize: 13, color: "#7a1f19", margin: 0 }}>
            {existingPengajuan.catatan_admin}
          </p>
          <p style={{ fontSize: 12, color: "#7a1f19", marginTop: 8, marginBottom: 0 }}>
            Perbaiki data dan/atau berkas di bawah sesuai catatan di atas,
            lalu kirim ulang — pengajuan ini akan ditinjau ulang oleh admin
            tanpa perlu bikin pengajuan baru dari nol.
          </p>
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--color-primary)",
          color: "var(--color-white)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 14px",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          I
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>Data Identitas Pemohon</span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Nama Lengkap</label>
        <input
          name="nama_pemohon"
          value={form.nama_pemohon}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>NIK (16 digit)</label>
        <input
          name="nik"
          value={form.nik}
          onChange={handleChange}
          required
          pattern="\d{16}"
          title="NIK harus 16 digit angka"
          maxLength={16}
          style={inputStyle}
        />
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={labelStyle}>Tempat Lahir</label>
          <input
            name="tempat_lahir"
            value={form.tempat_lahir}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={labelStyle}>Tanggal Lahir</label>
          <input
            type="date"
            name="tanggal_lahir"
            value={form.tanggal_lahir}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={labelStyle}>Jenis Kelamin</label>
          <select
            name="jenis_kelamin"
            value={form.jenis_kelamin}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Pilih...</option>
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={labelStyle}>Agama</label>
          <select
            name="agama"
            value={form.agama}
            onChange={handleChange}
            required
            style={inputStyle}
          >
            <option value="">Pilih...</option>
            {AGAMA_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Pekerjaan</label>
        <input
          name="pekerjaan"
          value={form.pekerjaan}
          onChange={handleChange}
          required
          style={inputStyle}
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Alamat Lengkap</label>
        <textarea
          name="alamat"
          value={form.alamat}
          onChange={handleChange}
          required
          rows={2}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      {extraFields.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "var(--color-primary)",
              color: "var(--color-white)",
              borderRadius: "var(--radius-sm)",
              padding: "8px 14px",
              marginBottom: 18,
              marginTop: 8,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              II
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>
              Data Tambahan untuk {jenisSurat.nama_surat}
            </span>
          </div>
          {extraFields.map((field) => (
            <div key={field.name} style={{ marginBottom: 16 }}>
              <label style={labelStyle}>{field.label}</label>
              {field.type === "jk" ? (
                <select
                  value={dataTambahan[field.name] || ""}
                  onChange={(e) => handleExtraChange(field.name, e.target.value)}
                  required
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
                  required={!field.label.includes("opsional")}
                  style={inputStyle}
                />
              )}
            </div>
          ))}
        </>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--color-primary)",
          color: "var(--color-white)",
          borderRadius: "var(--radius-sm)",
          padding: "8px 14px",
          marginBottom: 18,
          marginTop: extraFields.length > 0 ? 8 : 0,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {extraFields.length > 0 ? "III" : "II"}
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>
          Maksud Permohonan &amp; Lampiran Berkas
        </span>
      </div>

      <div
        style={{
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius-md)",
          padding: 14,
          marginBottom: 16,
          fontSize: 13,
        }}
      >
        <p style={{ fontWeight: 600, marginBottom: 10 }}>
          Lampiran Dokumen Kelengkapan Berkas
        </p>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", marginTop: -6, marginBottom: 12 }}>
          Unggah 1 berkas untuk tiap syarat di bawah (format JPG/PNG/PDF).
        </p>
        {isLengkapi && (
          <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 12 }}>
            Berkas lama masih ditampilkan di tiap slot — klik "Ganti" kalau
            ada yang mau diperbarui, atau biarkan kalau sudah benar.
          </p>
        )}

        {(jenisSurat.syarat || []).map((syaratText, idx) => (
          <SyaratSlot
            key={idx}
            nomor={idx + 1}
            label={syaratText}
            file={files[idx]}
            onPilih={(file) =>
              setFiles((prev) => {
                const next = [...prev];
                while (next.length <= idx) next.push(undefined);
                next[idx] = file;
                return next;
              })
            }
            onHapus={() =>
              setFiles((prev) => {
                const next = [...prev];
                next[idx] = undefined;
                return next;
              })
            }
          />
        ))}

        <div style={{ marginTop: 20, marginBottom: 4 }}>
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
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          background: "var(--color-bg-alt)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 14px",
          marginBottom: 16,
          fontSize: 13,
          color: "var(--color-text-muted)",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={setuju}
          onChange={(e) => setSetuju(e.target.checked)}
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        Saya menyatakan data yang saya isi di atas adalah benar dan dapat
        dipertanggungjawabkan. Apabila di kemudian hari ditemukan data yang
        tidak sesuai, saya bersedia menerima konsekuensi sesuai ketentuan
        yang berlaku.
      </label>

      <button
        type="submit"
        className="btn btn-solid"
        style={{ width: "100%" }}
        disabled={!(jenisSurat.syarat || []).every((_, idx) => files[idx]) || !setuju}
      >
        Lihat Preview Surat
      </button>
    </form>
  );
}
