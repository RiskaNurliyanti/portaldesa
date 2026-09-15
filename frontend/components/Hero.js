import Link from "next/link";

/**
 * Hero pakai foto sawah asli desa sebagai kanvas full-bleed — bukan
 * ilustrasi/pattern generik. Prinsipnya diambil dari referensi "Cora":
 * foto MENJADI background-nya, teks melayang langsung di atasnya,
 * bukan dikurung dalam kotak/kartu.
 */
export default function Hero() {
  return (
    <section className="hero">
      <div
        className="hero-bg"
        style={{ backgroundImage: "url('/hero-sawah.png')" }}
        role="img"
        aria-label="Pemandangan sawah dan pegunungan di Desa Sukamaju"
      />
      <div className="hero-overlay" />

      <div className="hero-content">
        <p className="hero-eyebrow">Sistem Informasi Desa</p>
        <h1 className="hero-title">Desa Sukamaju</h1>
        <p className="hero-desc">
          Portal resmi warga untuk informasi berita, layanan surat, dan
          kegiatan desa — kapan saja, tanpa perlu antre.
        </p>
        <div className="hero-actions">
          <Link href="/profil" className="btn btn-primary">
            Lihat Profil Desa
          </Link>
          <Link href="/layanan" className="btn btn-outline">
            Ajukan Layanan
          </Link>
        </div>
      </div>
    </section>
  );
}
