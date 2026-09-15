import Link from "next/link";
import Hero from "@/components/Hero";
import { apiGet, assetUrl } from "@/lib/api";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

async function getBeritaTerbaru() {
  try {
    const res = await apiGet("/berita");
    return (res.data ?? []).slice(0, 4);
  } catch (err) {
    return [];
  }
}

async function getLayananPopuler() {
  try {
    const res = await apiGet("/jenis-surat");
    return res.slice(0, 3);
  } catch (err) {
    return [];
  }
}

async function getGaleriPreview() {
  try {
    const res = await apiGet("/galeri");
    return (res ?? []).slice(0, 4);
  } catch (err) {
    return [];
  }
}

async function getProfilRingkas() {
  try {
    return await apiGet("/profil-desa");
  } catch (err) {
    return null;
  }
}

function formatTanggal(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function HomePage() {
  const [beritaTerbaru, layananPopuler, galeriPreview, profil] = await Promise.all([
    getBeritaTerbaru(),
    getLayananPopuler(),
    getGaleriPreview(),
    getProfilRingkas(),
  ]);

  return (
    <>
      <Hero />

      {/* ===== Sekilas Profil Desa =====
          Catatan: Luas Wilayah & Jumlah Penduduk di bawah ini angka
          ILUSTRATIF (belum ada field-nya di data profil desa) —
          Jumlah Dusun diambil dari data profil desa sesungguhnya
          kalau sudah diisi admin. */}
      <section className="section">
        <div className="container">
          <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
            Selayang Pandang
          </span>
          <h2 className="section-title" style={{ marginTop: 6 }}>
            Sekilas Profil Desa Sukamaju
          </h2>
          <p className="section-subtitle" style={{ maxWidth: 720 }}>
            {profil?.sejarah
              ? profil.sejarah.slice(0, 220) + (profil.sejarah.length > 220 ? "…" : "")
              : "Desa Sukamaju adalah desa agraris yang dikenal dengan hamparan sawah dan kehidupan warganya yang guyub. Pemerintah desa berkomitmen memberikan pelayanan administrasi yang transparan dan mudah diakses seluruh warga."}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
              marginTop: 28,
              marginBottom: 16,
            }}
          >
            <div className="card" style={{ padding: 20, boxShadow: "none" }}>
              <span className="eyebrow" style={{ color: "var(--color-text-muted)" }}>
                Luas Wilayah
              </span>
              <p
                style={{
                  fontFamily: "var(--font-heading), serif",
                  fontSize: 26,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  margin: "6px 0 0",
                }}
              >
                412 Ha
              </p>
            </div>
            <div className="card" style={{ padding: 20, boxShadow: "none" }}>
              <span className="eyebrow" style={{ color: "var(--color-text-muted)" }}>
                Jumlah Penduduk
              </span>
              <p
                style={{
                  fontFamily: "var(--font-heading), serif",
                  fontSize: 26,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  margin: "6px 0 0",
                }}
              >
                4.281 Jiwa
              </p>
            </div>
            <div className="card" style={{ padding: 20, boxShadow: "none" }}>
              <span className="eyebrow" style={{ color: "var(--color-text-muted)" }}>
                Kewilayahan
              </span>
              <p
                style={{
                  fontFamily: "var(--font-heading), serif",
                  fontSize: 26,
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  margin: "6px 0 0",
                }}
              >
                {profil?.jumlah_dusun ? `${profil.jumlah_dusun} Dusun` : "3 Dusun"}
              </p>
            </div>
          </div>

          <Link href="/profil" className="btn-link">
            Baca Profil Lengkap Desa →
          </Link>
        </div>
      </section>

      {/* ===== Berita Terbaru ===== */}
      <section className="section section-alt">
        <div className="container">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "flex-end",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <div>
              <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
                Warta Kedinasan &amp; Siaran Publik
              </span>
              <h2 className="section-title" style={{ marginTop: 6, marginBottom: 0 }}>
                Kabar Berita Desa Terkini
              </h2>
            </div>
            <Link href="/berita" className="btn-link">
              Arsip Berita Lengkap →
            </Link>
          </div>

          {beritaTerbaru.length === 0 ? (
            <p className="card-text">
              Belum ada berita yang dipublikasikan saat ini. Cek lagi nanti.
            </p>
          ) : (
            <div className="card-grid">
              {beritaTerbaru.map((berita) => (
                <Link key={berita.id} href={`/berita/${berita.slug}`} className="card">
                  <div
                    className="card-image"
                    style={
                      berita.gambar
                        ? {
                            backgroundImage: `url(${assetUrl(berita.gambar)})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  />
                  <div className="card-body">
                    <span className="card-tag">Berita Desa</span>
                    <h3 className="card-title">{berita.judul}</h3>
                    <p className="card-text">{formatTanggal(berita.published_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== Layanan Populer (gaya "buku registrasi") ===== */}
      <section className="section">
        <div className="container">
          <div
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              padding: 32,
              boxShadow: "var(--shadow-sheet)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 28,
              }}
            >
              <div>
                <span className="eyebrow" style={{ color: "var(--color-primary)" }}>
                  Pelayanan Publik Terpadu Satu Pintu
                </span>
                <h2 className="section-title" style={{ marginTop: 6, marginBottom: 0, fontSize: 26 }}>
                  Layanan Surat Administrasi Warga
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--color-bg-alt)",
                  padding: "10px 16px",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <Icon name="gavel" size={24} style={{ color: "var(--color-accent)" }} />
                <div>
                  <div className="eyebrow" style={{ color: "var(--color-accent)" }}>
                    Standar Pelayanan
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Tarif Resmi Rp 0 (Gratis)</div>
                </div>
              </div>
            </div>

            {layananPopuler.length === 0 ? (
              <p className="card-text">Belum ada layanan yang tersedia.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
                {layananPopuler.map((layanan) => (
                  <div
                    key={layanan.id}
                    style={{
                      background: "var(--color-white)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "var(--radius-md)",
                      padding: 20,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          fontFamily: "var(--font-heading), serif",
                          fontSize: 17,
                          fontWeight: 600,
                          marginBottom: 10,
                        }}
                      >
                        {layanan.nama_surat}
                      </h3>
                      <div
                        style={{
                          background: "var(--color-bg-alt)",
                          borderRadius: "var(--radius-sm)",
                          padding: "10px 12px",
                          fontSize: 13,
                          color: "var(--color-text-muted)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 4,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Estimasi Waktu</span>
                          <strong style={{ color: "var(--color-text)" }}>{layanan.estimasi_hari} hari kerja</strong>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span>Biaya</span>
                          <strong style={{ color: "var(--color-primary)" }}>Gratis</strong>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/layanan/ajukan/${layanan.id}`}
                      className="btn btn-solid"
                      style={{ marginTop: 16, width: "100%" }}
                    >
                      Ajukan Surat Ini
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 24, textAlign: "center" }}>
              <Link href="/layanan" className="btn-link">
                Lihat Semua Layanan →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Dokumentasi / Galeri ===== */}
      {galeriPreview.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: 12,
                marginBottom: 28,
              }}
            >
              <div>
                <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
                  Dokumentasi Visual &amp; Arsip Lapangan
                </span>
                <h2 className="section-title" style={{ marginTop: 6, marginBottom: 0 }}>
                  Dokumentasi Desa Sukamaju
                </h2>
              </div>
              <Link href="/galeri" className="btn-link">
                Lihat Semua Dokumentasi →
              </Link>
            </div>

            <div className="card-grid">
              {galeriPreview.map((foto) => (
                <div key={foto.id} className="card">
                  <div
                    className="card-image"
                    style={{
                      backgroundImage: `url(${assetUrl(foto.gambar)})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      height: 160,
                    }}
                  />
                  <div
                    className="card-body"
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}
                  >
                    <span className="card-title" style={{ fontSize: 14, marginBottom: 0 }}>
                      {foto.judul}
                    </span>
                    <Icon name="photo_camera" size={18} style={{ color: "var(--color-primary)" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
