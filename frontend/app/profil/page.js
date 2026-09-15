import { apiGet } from "@/lib/api";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

async function getProfil() {
  try {
    return { data: await apiGet("/profil-desa"), error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export const metadata = {
  title: "Profil Desa — Desa Sukamaju",
};

function IconSection({ icon, title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <Icon name={icon} size={22} style={{ color: "var(--color-primary)" }} />
        <h2 style={{ fontSize: 19, fontWeight: 600, margin: 0 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

export default async function ProfilPage() {
  const { data: profil, error } = await getProfil();

  if (!profil) {
    return (
      <div className="section">
        <div className="container">
          <p className="card-text">
            {error
              ? error
              : "Data profil desa belum tersedia. Admin bisa mengisinya lewat halaman Admin > Profil Desa."}
          </p>
        </div>
      </div>
    );
  }

  // Poin misi dipecah per baris dari teks asli (bukan konten karangan) —
  // kalau admin isi misi 1 baris per poin, otomatis tampil sebagai daftar
  // bernomor rapi.
  const misiPoin = (profil.misi || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 820 }}>
        {/* ===== Kop dokumen ===== */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "var(--color-primary-pale)",
            color: "var(--color-primary-dark)",
            padding: "5px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 16,
          }}
        >
          <Icon name="verified" size={16} />
          Dokumen Resmi &middot; Monografi Desa
        </div>

        <h1 className="section-title" style={{ fontSize: 38 }}>
          Profil &amp; Monografi {profil.nama_desa}
        </h1>
        <p className="section-subtitle" style={{ marginBottom: 8 }}>
          {profil.alamat}
        </p>

        {/* ===== Stat grid ===== */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 12,
            margin: "24px 0 40px",
          }}
        >
          {[
            { label: "Luas Wilayah", value: "412 Ha" },
            { label: "Jumlah Dusun", value: `${profil.jumlah_dusun || 0}` },
            { label: "Rukun Warga", value: "6 RW" },
            { label: "Rukun Tetangga", value: "18 RT" },
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: "14px 12px", textAlign: "center", boxShadow: "none" }}>
              <p style={{ fontFamily: "var(--font-heading), serif", fontSize: 22, fontWeight: 600, color: "var(--color-primary)", margin: 0 }}>
                {s.value}
              </p>
              <p className="eyebrow" style={{ color: "var(--color-text-muted)", marginTop: 4 }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: -28, marginBottom: 36 }}>
          * Luas wilayah, RW, dan RT masih berupa data ilustratif (belum ada formulir isian resminya di sistem).
        </p>

        {/* ===== Sejarah ===== */}
        {profil.sejarah && (
          <IconSection icon="menu_book" title="Sejarah & Latar Belakang Desa">
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.85, fontSize: 15.5, color: "var(--color-text)" }}>
              {profil.sejarah}
            </p>
          </IconSection>
        )}

        {/* ===== Visi ===== */}
        {profil.visi && (
          <IconSection icon="flag" title="Visi Pembangunan Desa">
            <div
              style={{
                background: "var(--color-primary-dark)",
                color: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                padding: "28px 32px",
                position: "relative",
              }}
            >
              <Icon
                name="format_quote"
                size={32}
                style={{ position: "absolute", top: 16, left: 16, opacity: 0.25 }}
              />
              <p
                style={{
                  fontFamily: "var(--font-heading), serif",
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.6,
                  margin: 0,
                  paddingLeft: 28,
                  fontStyle: "italic",
                }}
              >
                {profil.visi}
              </p>
            </div>
          </IconSection>
        )}

        {/* ===== Misi ===== */}
        {misiPoin.length > 0 && (
          <IconSection icon="checklist" title="Misi Pembangunan Desa">
            <ol style={{ paddingLeft: 20, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {misiPoin.map((poin, idx) => (
                <li key={idx} style={{ fontSize: 15, lineHeight: 1.7, color: "var(--color-text)" }}>
                  {poin}
                </li>
              ))}
            </ol>
          </IconSection>
        )}
      </div>
    </div>
  );
}
