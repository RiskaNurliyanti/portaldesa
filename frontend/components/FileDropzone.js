"use client";

import { useRef, useState } from "react";

/**
 * Kotak upload custom biar gak pakai tampilan bawaan browser yang polos
 * ("Choose Files / No file chosen"). Bisa diklik atau di-drag-drop, dan
 * file yang baru dipilih NAMBAH ke daftar yang sudah ada (bukan ganti) --
 * itu ditangani lewat prop onAddFiles yang dikasih dari parent.
 *
 * `files` boleh campuran dua bentuk:
 * - File asli dari input/drag-drop (preview pakai URL.createObjectURL)
 * - Berkas lama yang sudah ada di server, bentuknya
 *   `{ isExisting: true, url, name }` (preview langsung pakai url-nya,
 *   dipakai di alur "lengkapi berkas" waktu pengajuan ditolak)
 */
export default function FileDropzone({ files, onAddFiles, onRemoveFile, accept, label }) {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFiles(fileList) {
    onAddFiles(Array.from(fileList || []));
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
        style={{ display: "none" }}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragActive ? "var(--color-primary)" : "var(--color-border)"}`,
          borderRadius: "var(--radius-md)",
          padding: "24px 16px",
          textAlign: "center",
          cursor: "pointer",
          background: dragActive ? "var(--color-bg-alt)" : "transparent",
          transition: "background 0.15s ease, border-color 0.15s ease",
        }}
      >
        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--color-primary-dark)" }}>
          Klik untuk pilih file
        </p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>
          {label || "atau tarik file ke sini — bisa diunggah bertahap satu-satu"}
        </p>
      </div>

      {files.length > 0 && (
        <ul style={{ marginTop: 10, paddingLeft: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: 10 }}>
          {files.map((f, idx) => {
            const isExisting = f && f.isExisting;
            const isImage = isExisting
              ? /\.(jpe?g|png|gif|webp)$/i.test(f.url || "")
              : f.type?.startsWith("image/");
            const previewSrc = isExisting ? f.url : URL.createObjectURL(f);
            const displayName = f.name;

            return (
              <li
                key={isExisting ? `existing-${f.url}` : `${f.name}-${f.size}-${idx}`}
                style={{
                  position: "relative",
                  width: 90,
                  background: "var(--color-bg-alt)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                }}
              >
                {isImage ? (
                  <img
                    src={previewSrc}
                    alt={displayName}
                    style={{ width: "100%", height: 70, objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 70,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    PDF
                  </div>
                )}
                {isExisting && (
                  <span
                    style={{
                      position: "absolute",
                      top: 3,
                      left: 3,
                      background: "rgba(0,0,0,0.55)",
                      color: "#fff",
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: 999,
                    }}
                  >
                    Lama
                  </span>
                )}
                <p
                  style={{
                    margin: 0,
                    fontSize: 10,
                    padding: "3px 4px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={displayName}
                >
                  {displayName}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFile(idx);
                  }}
                  style={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    background: "rgba(0,0,0,0.6)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    fontSize: 11,
                    lineHeight: 1,
                    cursor: "pointer",
                  }}
                  aria-label={`Hapus ${displayName}`}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}