"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { apiGet, apiPostForm, assetUrl } from "@/lib/api";
import { labelStyle } from "@/lib/formStyles";
import FileDropzone from "@/components/FileDropzone";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function AdminGaleriPage() {
  const { token } = useAuth();
  const [galeriList, setGaleriList] = useState([]);
  const [judul, setJudul] = useState("");
  const [tanggal, setTanggal] = useState("");
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const data = await apiGet("/galeri");
      setGaleriList(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("judul", judul);
      if (tanggal) formData.append("kegiatan_at", tanggal);
      files.forEach((file) => formData.append("gambar[]", file));

      await apiPostForm("/galeri", formData, token);

      setJudul("");
      setTanggal("");
      setFiles([]);
      setStatus("idle");
      loadData();
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Hapus foto ini?")) return;
    await fetch(`${API_URL}/galeri/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    loadData();
  }

  return (
    <div>
      <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
        Dokumentasi Visual &amp; Arsip Lapangan
      </span>
      <h1 className="section-title" style={{ marginBottom: 20, marginTop: 4 }}>
        Kelola Galeri
      </h1>

      <form
        onSubmit={handleUpload}
        className="card"
        style={{ padding: 20, marginBottom: 28, maxWidth: 480 }}
      >
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Judul Foto</label>
          <input
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: 14,
            }}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label style={labelStyle}>Tanggal Kegiatan (opsional)</label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: 14,
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>File Foto</label>
          <FileDropzone
            files={files}
            onAddFiles={(fileBaru) => {
              setFiles((prev) => {
                const sudahAda = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
                const filtered = fileBaru.filter((f) => !sudahAda.has(`${f.name}-${f.size}-${f.lastModified}`));
                return [...prev, ...filtered];
              });
            }}
            onRemoveFile={(idx) => setFiles((prev) => prev.filter((_, i) => i !== idx))}
            accept="image/*"
          />
        </div>

        {error && (
          <p style={{ color: "var(--color-error)", fontSize: 14, marginBottom: 12 }}>{error}</p>
        )}

        <button
          type="submit"
          className="btn btn-solid"
          disabled={status === "loading" || files.length === 0}
        >
          {status === "loading" ? "Mengunggah..." : "Unggah Foto"}
        </button>
      </form>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {galeriList.map((foto) => (
          <div key={foto.id} className="card">
            <img
              src={assetUrl(foto.gambar)}
              alt={foto.judul}
              style={{ width: "100%", height: 140, objectFit: "cover" }}
            />
            <div
              className="card-body"
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <p className="card-text" style={{ margin: 0, fontWeight: 600 }}>{foto.judul}</p>
                {foto.kegiatan_at && (
                  <p className="card-text" style={{ margin: 0, fontSize: 12 }}>
                    {new Date(foto.kegiatan_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(foto.id)}
                style={{
                  color: "var(--color-error)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
