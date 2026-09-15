"use client";

import BeritaForm from "@/components/admin/BeritaForm";

export default function BeritaBaruPage() {
  return (
    <div>
      <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
        Warta Kedinasan &amp; Siaran Publik
      </span>
      <h1 className="section-title" style={{ marginBottom: 20, marginTop: 4 }}>
        Berita Baru
      </h1>
      <BeritaForm />
    </div>
  );
}
