"use client";

import { use, useEffect, useState } from "react";
import BeritaForm from "@/components/admin/BeritaForm";
import { apiGet } from "@/lib/api";

export default function EditBeritaPage({ params }) {
  const { slug } = use(params);
  const [berita, setBerita] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiGet(`/berita/${slug}`)
      .then(setBerita)
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) {
    return <p className="card-text">Gagal memuat berita: {error}</p>;
  }

  if (!berita) {
    return <p className="card-text">Memuat...</p>;
  }

  return (
    <div>
      <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
        Warta Kedinasan &amp; Siaran Publik
      </span>
      <h1 className="section-title" style={{ marginBottom: 20, marginTop: 4 }}>
        Edit Berita
      </h1>
      <BeritaForm initialData={berita} />
    </div>
  );
}
