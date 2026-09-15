"use client";

import { useState } from "react";
import ImageCarousel from "@/components/ImageCarousel";
import Lightbox from "@/components/Lightbox";

// Galeri foto tambahan di dalam satu berita — ditampilkan sebagai 1 slider
// (bukan grid), biar hemat tempat kalau fotonya banyak.
export default function BeritaGaleri({ images }) {
  const [lightbox, setLightbox] = useState(null);

  if (!images || images.length === 0) return null;

  return (
    <div style={{ marginBottom: 24, borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
      <ImageCarousel
        images={images.map((src, idx) => ({ src, alt: `Galeri foto ${idx + 1}` }))}
        height={360}
        onImageClick={(src, alt) => setLightbox({ src, alt })}
      />
      <Lightbox src={lightbox?.src} alt={lightbox?.alt} onClose={() => setLightbox(null)} />
    </div>
  );
}
