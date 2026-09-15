import { notFound } from "next/navigation";
import { apiGet, assetUrl } from "@/lib/api";
import BeritaGaleri from "@/components/BeritaGaleri";

export const dynamic = "force-dynamic";

async function getBeritaBySlug(slug) {
  try {
    return await apiGet(`/berita/${slug}`);
  } catch (err) {
    return null;
  }
}

export default async function BeritaDetailPage({ params }) {
  const { slug } = await params;
  const berita = await getBeritaBySlug(slug);

  if (!berita) {
    notFound();
  }

  return (
    <article className="section">
      <div className="container" style={{ maxWidth: 700 }}>
        <p
          className="eyebrow"
          style={{
            color: "var(--color-primary-dark)",
            marginBottom: 10,
          }}
        >
          {new Date(berita.published_at).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <h1 style={{ fontSize: 36, fontWeight: 600, marginBottom: 28, lineHeight: 1.2 }}>
          {berita.judul}
        </h1>

        {berita.gambar && (
          <img
            src={assetUrl(berita.gambar)}
            alt={berita.judul}
            style={{
              width: "100%",
              borderRadius: "var(--radius-md)",
              marginBottom: 28,
            }}
          />
        )}

        <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.85, fontSize: 16 }}>
          {berita.konten}
        </div>

        {berita.galeri && berita.galeri.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <p className="eyebrow" style={{ color: "var(--color-primary-dark)", marginBottom: 12 }}>
              Galeri Foto
            </p>
            <BeritaGaleri images={berita.galeri.map((path) => assetUrl(path))} />
          </div>
        )}
      </div>
    </article>
  );
}
