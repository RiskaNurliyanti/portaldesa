import { apiGet } from "@/lib/api";
import LayananList from "@/components/LayananList";

export const dynamic = "force-dynamic";

async function getJenisSurat() {
  try {
    return await apiGet("/jenis-surat");
  } catch (err) {
    console.error("Gagal ambil jenis surat:", err.message);
    return [];
  }
}

export const metadata = {
  title: "Layanan Administrasi — Desa Sukamaju",
};

export default async function LayananPage() {
  const jenisSuratList = await getJenisSurat();

  return (
    <div className="section">
      <div className="container">
        <span className="eyebrow" style={{ color: "var(--color-primary)" }}>
          Pelayanan Publik Terpadu Satu Pintu
        </span>
        <h1 className="section-title" style={{ marginTop: 6 }}>
          Layanan Administrasi Surat
        </h1>
        <p className="section-subtitle">
          Ajukan surat secara online. Siapkan berkas sesuai syarat sebelum
          mengisi form pengajuan.
        </p>

        {jenisSuratList.length === 0 ? (
          <p className="card-text">Belum ada jenis layanan yang tersedia.</p>
        ) : (
          <LayananList jenisSuratList={jenisSuratList} />
        )}
      </div>
    </div>
  );
}
