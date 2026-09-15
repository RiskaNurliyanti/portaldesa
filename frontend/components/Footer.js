import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-title">Desa Sukamaju</div>
            <p style={{ fontSize: 14, color: "var(--color-text-muted)" }}>
              Jl. Raya Sukamaju No. 1, Kec. Cikoneng, Kab. Ciamis, Jawa Barat.
            </p>
          </div>

          <div>
            <div className="footer-title">Navigasi</div>
            <div className="footer-links">
              <Link href="/profil">Profil Desa</Link>
              <Link href="/berita">Berita</Link>
              <Link href="/layanan">Layanan</Link>
              <Link href="/galeri">Galeri</Link>
            </div>
          </div>

          <div>
            <div className="footer-title">Kontak</div>
            <div className="footer-links">
              <a href="mailto:info@desasukamaju.test">info@desasukamaju.test</a>
              <a href="tel:+622100000000">(021) 0000-0000</a>
            </div>
          </div>
        </div>

        <div
          className="footer-bottom"
          style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "space-between", textAlign: "left" }}
        >
          <span>© {new Date().getFullYear()} Pemerintah Desa Sukamaju. Semua hak dilindungi.</span>
          <span className="eyebrow" style={{ color: "var(--color-text-muted)" }}>
            Sistem Informasi Desa Resmi · Kabupaten Ciamis
          </span>
        </div>
      </div>
    </footer>
  );
}
