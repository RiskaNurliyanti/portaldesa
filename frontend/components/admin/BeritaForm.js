"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { labelStyle, inputStyle } from "@/lib/formStyles";
import { assetUrl } from "@/lib/api";
import FileDropzone from "@/components/FileDropzone";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function BeritaForm({ initialData }) {
  const { token } = useAuth();
  const router = useRouter();
  const isEdit = Boolean(initialData?.id);

  const [form, setForm] = useState({
    judul: initialData?.judul || "",
    konten: initialData?.konten || "",
    published_at: initialData?.published_at
      ? initialData.published_at.slice(0, 16)
      : "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(
    initialData?.gambar ? assetUrl(initialData.gambar) : null
  );
  const [galeriFiles, setGaleriFiles] = useState([]);
  const [galeriLama, setGaleriLama] = useState(initialData?.galeri || []);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFileChange(e) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected) {
      setPreview(URL.createObjectURL(selected));
    }
  }

  function handleAddGaleriFiles(fileBaru) {
    setGaleriFiles((prev) => {
      const sudahAda = new Set(prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`));
      const filtered = fileBaru.filter((f) => !sudahAda.has(`${f.name}-${f.size}-${f.lastModified}`));
      return [...prev, ...filtered];
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const formData = new FormData();
      formData.append("judul", form.judul);
      formData.append("konten", form.konten);
      if (form.published_at) {
        formData.append("published_at", new Date(form.published_at).toISOString());
      }
      if (file) formData.append("gambar", file);
      formData.append("galeri_tetap", JSON.stringify(galeriLama));
      galeriFiles.forEach((f) => formData.append("galeri[]", f));
      // PUT + file upload rewel ditangani PHP secara native, jadi dikirim
      // sebagai POST dengan penanda _method supaya Laravel tetap
      // mengarahkannya ke route PUT yang benar.
      if (isEdit) formData.append("_method", "PUT");

      const url = `${API_URL}/berita${isEdit ? `/${initialData.id}` : ""}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        const detail = err?.errors ? Object.values(err.errors).flat().join(" ") : null;
        throw new Error(detail || err?.message || `Gagal menyimpan berita (status ${res.status}).`);
      }

      router.push("/admin/berita");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 24, maxWidth: 640 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Judul</label>
        <input name="judul" value={form.judul} onChange={handleChange} required style={inputStyle} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Konten</label>
        <textarea
          name="konten"
          value={form.konten}
          onChange={handleChange}
          required
          rows={8}
          style={{ ...inputStyle, resize: "vertical" }}
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Gambar Sampul (opsional, cuma 1 foto)</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{
              marginTop: 10,
              width: "100%",
              maxHeight: 220,
              objectFit: "cover",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
            }}
          />
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Galeri Foto Tambahan (opsional, boleh lebih dari 1)</label>

        {galeriLama.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {galeriLama.map((path, idx) => (
              <div key={idx} style={{ position: "relative" }}>
                <img
                  src={assetUrl(path)}
                  alt={`Galeri ${idx + 1}`}
                  style={{ width: 70, height: 70, objectFit: "cover", borderRadius: "var(--radius-md)" }}
                />
                <button
                  type="button"
                  onClick={() => setGaleriLama((prev) => prev.filter((_, i) => i !== idx))}
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "var(--color-error)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    fontSize: 11,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <FileDropzone
          files={galeriFiles}
          onAddFiles={handleAddGaleriFiles}
          onRemoveFile={(idx) => setGaleriFiles((prev) => prev.filter((_, i) => i !== idx))}
          accept="image/*"
          label="atau tarik beberapa foto ke sini sekaligus"
        />
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>
          Tanggal Publish (kosongkan buat simpan sebagai draft)
        </label>
        <input
          type="datetime-local"
          name="published_at"
          value={form.published_at}
          onChange={handleChange}
          style={inputStyle}
        />
      </div>

      {error && (
        <p style={{ color: "var(--color-error)", fontSize: 14, marginBottom: 12 }}>{error}</p>
      )}

      <button type="submit" className="btn btn-solid" disabled={status === "loading"}>
        {status === "loading"
          ? "Menyimpan..."
          : isEdit
          ? "Simpan Perubahan"
          : "Publikasikan Berita"}
      </button>
    </form>
  );
}
