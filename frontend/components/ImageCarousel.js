"use client";

import { useState } from "react";

/**
 * Slider foto sederhana. Kalau cuma 1 foto, otomatis tampil sebagai gambar
 * biasa tanpa tombol navigasi. Klik foto buat buka lightbox lewat prop
 * onImageClick (opsional).
 */
export default function ImageCarousel({ images, height = 200, onImageClick }) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const single = images.length === 1;

  function goTo(newIndex) {
    setIndex((newIndex + images.length) % images.length);
  }

  return (
    <div style={{ position: "relative" }}>
      <img
        src={images[index].src}
        alt={images[index].alt || ""}
        onClick={() => onImageClick?.(images[index].src, images[index].alt)}
        style={{
          width: "100%",
          height,
          objectFit: "cover",
          display: "block",
          cursor: onImageClick ? "zoom-in" : "default",
        }}
      />

      {!single && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(index - 1);
            }}
            aria-label="Foto sebelumnya"
            style={navButtonStyle("left")}
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goTo(index + 1);
            }}
            aria-label="Foto berikutnya"
            style={navButtonStyle("right")}
          >
            ›
          </button>

          <div
            style={{
              position: "absolute",
              bottom: 8,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 5,
            }}
          >
            {images.map((_, idx) => (
              <span
                key={idx}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: idx === index ? "#fff" : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </div>

          <span
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              fontSize: 11,
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            {index + 1}/{images.length}
          </span>
        </>
      )}
    </div>
  );
}

function navButtonStyle(side) {
  return {
    position: "absolute",
    top: "50%",
    [side]: 6,
    transform: "translateY(-50%)",
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    border: "none",
    borderRadius: "50%",
    width: 28,
    height: 28,
    fontSize: 18,
    lineHeight: 1,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };
}