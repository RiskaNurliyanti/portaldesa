"use client";

/**
 * Render tampilan surat (buat preview sebelum submit, atau buat lihat
 * hasil akhir yang sudah diterbitkan admin). Isi teksnya sengaja mengikuti
 * logika yang sama dengan SuratTemplateService.php di backend, supaya
 * preview yang dilihat warga mendekati hasil PDF aslinya.
 *
 * Props:
 * - namaSurat: string, nama jenis surat (dipakai buat nentuin isi)
 * - form: object data diri umum (nama_pemohon, nik, tempat_lahir, dst)
 * - dataTambahan: object data spesifik per jenis surat
 * - final: null kalau masih draft, atau object { nomor_surat, kode_verifikasi,
 *   ditandatangani_oleh, tanggal_terbit } kalau surat sudah diterbitkan
 */
export default function SuratPreview({ namaSurat = "", form = {}, dataTambahan = {}, final = null }) {
  const jenisKelaminLabel =
    form.jenis_kelamin === "L" ? "Laki-laki" : form.jenis_kelamin === "P" ? "Perempuan" : "-";

  const ttl = `${form.tempat_lahir || "-"}, ${
    form.tanggal_lahir
      ? new Date(form.tanggal_lahir).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-"
  }`;

  const dataDiriRows = [
    ["Nama", form.nama_pemohon || "-"],
    ["NIK", form.nik || "-"],
    ["Tempat/Tgl Lahir", ttl],
    ["Jenis Kelamin", jenisKelaminLabel],
    ["Agama", form.agama || "-"],
    ["Pekerjaan", form.pekerjaan || "-"],
    ["Alamat", form.alamat || "-"],
  ];

  function DataTable({ rows }) {
    return (
      <table style={{ marginBottom: 10, borderCollapse: "collapse" }}>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td style={{ width: 150, verticalAlign: "top", padding: "1px 8px 1px 0" }}>
                {label}
              </td>
              <td style={{ verticalAlign: "top" }}>: {value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function renderIsi() {
    if (namaSurat.includes("Domisili")) {
      return (
        <>
          <p>
            Yang bertandatangan di bawah ini Kepala Desa Sukamaju, Kecamatan
            Cikoneng, Kabupaten Ciamis, menerangkan dengan sebenarnya bahwa:
          </p>
          <DataTable rows={dataDiriRows} />
          <p>
            adalah benar merupakan penduduk yang berdomisili di alamat
            tersebut di atas. Surat keterangan ini dibuat untuk keperluan:{" "}
            <strong>{form.keperluan || "-"}</strong>.
          </p>
        </>
      );
    }

    if (namaSurat.includes("Tidak Mampu")) {
      return (
        <>
          <p>
            Yang bertandatangan di bawah ini Kepala Desa Sukamaju
            menerangkan dengan sebenarnya bahwa:
          </p>
          <DataTable rows={dataDiriRows} />
          <p>
            adalah benar warga Desa Sukamaju yang termasuk dalam kategori
            kurang mampu secara ekonomi. Surat keterangan ini dibuat untuk
            keperluan: <strong>{form.keperluan || "-"}</strong>.
          </p>
        </>
      );
    }

    if (namaSurat.includes("Usaha")) {
      return (
        <>
          <p>
            Yang bertandatangan di bawah ini Kepala Desa Sukamaju
            menerangkan dengan sebenarnya bahwa:
          </p>
          <DataTable rows={dataDiriRows} />
          <p>adalah benar memiliki usaha dengan rincian sebagai berikut:</p>
          <DataTable
            rows={[
              ["Nama Usaha", dataTambahan.nama_usaha || "-"],
              ["Jenis Usaha", dataTambahan.jenis_usaha || "-"],
            ]}
          />
          <p>
            Surat keterangan ini dibuat untuk keperluan:{" "}
            <strong>{form.keperluan || "-"}</strong>.
          </p>
        </>
      );
    }

    if (namaSurat.includes("Kelahiran")) {
      const jkAnak = dataTambahan.jenis_kelamin_anak === "L" ? "laki-laki" : "perempuan";
      return (
        <>
          <p>
            Yang bertandatangan di bawah ini Kepala Desa Sukamaju
            menerangkan dengan sebenarnya bahwa telah lahir seorang anak{" "}
            {jkAnak} dengan rincian sebagai berikut:
          </p>
          <DataTable
            rows={[
              ["Nama Anak", dataTambahan.nama_anak || "-"],
              [
                "Tempat/Tgl Lahir",
                `${dataTambahan.tempat_lahir_anak || "-"}, ${dataTambahan.tanggal_lahir_anak || "-"}`,
              ],
              ["Nama Ayah", dataTambahan.nama_ayah || "-"],
              ["Nama Ibu", dataTambahan.nama_ibu || "-"],
            ]}
          />
          <p>
            Surat keterangan ini dibuat sebagai bukti kelahiran untuk
            keperluan: <strong>{form.keperluan || "-"}</strong>.
          </p>
        </>
      );
    }

    if (namaSurat.includes("Kematian")) {
      return (
        <>
          <p>
            Yang bertandatangan di bawah ini Kepala Desa Sukamaju
            menerangkan dengan sebenarnya bahwa telah meninggal dunia:
          </p>
          <DataTable
            rows={[
              ["Nama", dataTambahan.nama_almarhum || form.nama_pemohon || "-"],
              ["Tanggal Meninggal", dataTambahan.tanggal_meninggal || "-"],
              ["Tempat Meninggal", dataTambahan.tempat_meninggal || "-"],
              ["Sebab", dataTambahan.sebab_kematian || "-"],
            ]}
          />
          <p>
            Surat ini dilaporkan oleh {form.nama_pemohon || "-"} (NIK:{" "}
            {form.nik || "-"}), untuk keperluan:{" "}
            <strong>{form.keperluan || "-"}</strong>.
          </p>
        </>
      );
    }

    if (namaSurat.includes("Nikah")) {
      return (
        <>
          <p>
            Yang bertandatangan di bawah ini Kepala Desa Sukamaju
            menerangkan dengan sebenarnya bahwa:
          </p>
          <DataTable rows={dataDiriRows} />
          <p>akan melangsungkan pernikahan dengan:</p>
          <DataTable
            rows={[
              ["Nama Pasangan", dataTambahan.nama_pasangan || "-"],
              ["NIK Pasangan", dataTambahan.nik_pasangan || "-"],
            ]}
          />
          <p>
            Surat pengantar ini dibuat untuk keperluan pendaftaran nikah di
            KUA setempat.
          </p>
        </>
      );
    }

    return (
      <>
        <p>
          Yang bertandatangan di bawah ini Kepala Desa Sukamaju
          menerangkan dengan sebenarnya bahwa:
        </p>
        <DataTable rows={dataDiriRows} />
        <p>
          Surat keterangan ini dibuat untuk keperluan:{" "}
          <strong>{form.keperluan || "-"}</strong>.
        </p>
      </>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "32px 28px",
        fontSize: 13,
        lineHeight: 1.7,
        color: "#1a1a1a",
      }}
    >
      {!final && (
        <svg
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <defs>
            <pattern
              id="watermark-pratinjau"
              width="260"
              height="110"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-28)"
            >
              <text
                x="0"
                y="55"
                fontSize="15"
                fontWeight="700"
                fontFamily="sans-serif"
                fill="rgba(179, 38, 30, 0.13)"
                letterSpacing="1"
              >
                PRATINJAU • BUKAN DOKUMEN RESMI
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#watermark-pratinjau)" />
        </svg>
      )}

      {!final && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#fff3cd",
            color: "#8a6d1a",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 999,
            letterSpacing: 0.5,
            zIndex: 2,
          }}
        >
          DRAFT — BELUM DITERBITKAN
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: "3px double #000",
          paddingBottom: 8,
          marginBottom: 18,
        }}
      >
        <img
          src="/garuda.png"
          alt="Logo Desa"
          style={{ width: 56, height: 56, flexShrink: 0, objectFit: "contain" }}
        />
        <div style={{ flex: 1, textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>PEMERINTAH KABUPATEN CIAMIS</p>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>KECAMATAN CIKONENG</p>
          <p style={{ margin: "2px 0", fontWeight: 700, fontSize: 16, letterSpacing: 1 }}>
            DESA SUKAMAJU
          </p>
          <p style={{ margin: 0, fontSize: 11, color: "#555" }}>
            Jl. Raya Sukamaju No. 1, Kec. Cikoneng, Kab. Ciamis, Jawa Barat
          </p>
        </div>
        <div style={{ width: 56, flexShrink: 0 }} />
      </div>

      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <p style={{ margin: 0, fontWeight: 700, textDecoration: "underline", fontSize: 14 }}>
          {namaSurat.toUpperCase()}
        </p>
        <p style={{ margin: "2px 0" }}>
          Nomor: {final?.nomor_surat || "(akan diisi admin setelah diterbitkan)"}
        </p>
      </div>

      <div style={{ textAlign: "justify" }}>{renderIsi()}</div>

      <p style={{ marginTop: 16 }}>
        Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat
        dipergunakan sebagaimana mestinya.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginTop: 32,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ textAlign: "center", width: 110 }}>
          {final ? (
            <>
              <div
                style={{
                  width: 90,
                  height: 90,
                  border: "1px dashed var(--color-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  color: "var(--color-text-muted)",
                  margin: "0 auto",
                }}
              >
                QR Code
              </div>
              <p style={{ fontSize: 9, marginTop: 4 }}>Pindai untuk verifikasi</p>
            </>
          ) : (
            <p style={{ fontSize: 10, color: "var(--color-text-muted)" }}>
              QR code muncul setelah surat diterbitkan admin
            </p>
          )}
        </div>

        <div style={{ textAlign: "center", width: 200 }}>
          <p style={{ margin: 0 }}>
            Sukamaju,{" "}
            {final?.tanggal_terbit
              ? new Date(final.tanggal_terbit).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "..."}
          </p>
          <p style={{ margin: 0 }}>Kepala Desa Sukamaju,</p>
          <div style={{ height: 50 }} />
          <p style={{ margin: 0, fontWeight: 700, textDecoration: "underline" }}>
            {final?.ditandatangani_oleh || "(menunggu diterbitkan)"}
          </p>
        </div>
      </div>
    </div>
  );
}