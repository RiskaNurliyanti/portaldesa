"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { labelStyle, inputStyle } from "@/lib/formStyles";
import Icon from "@/components/Icon";

function RegisterForm() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setLoading(true);
    try {
      await register(
        form.name,
        form.email,
        form.password,
        form.password_confirmation
      );
      router.push(redirectTo || "/");
    } catch (err) {
      setError(err.message || "Gagal mendaftar. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 32, width: "100%", maxWidth: 400 }}>
      <h1 className="section-title" style={{ fontSize: 24, marginBottom: 4 }}>
        Daftar Akun Warga
      </h1>
      <p className="card-text" style={{ marginBottom: 24 }}>
        Daftar supaya bisa memantau status pengajuan suratmu.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nama Lengkap</label>
          <input name="name" required value={form.name} onChange={handleChange} style={inputStyle} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            name="email"
            required
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Password (min. 8 karakter)</label>
          <input
            type="password"
            name="password"
            required
            minLength={8}
            value={form.password}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={labelStyle}>Konfirmasi Password</label>
          <input
            type="password"
            name="password_confirmation"
            required
            minLength={8}
            value={form.password_confirmation}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>

        {error && (
          <p style={{ color: "#b3261e", fontSize: 14, marginBottom: 12 }}>{error}</p>
        )}

        <button type="submit" className="btn btn-solid" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p style={{ fontSize: 14, marginTop: 20, textAlign: "center" }}>
        Sudah punya akun?{" "}
        <Link
          href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"}
          style={{ color: "var(--color-primary)", fontWeight: 600 }}
        >
          Masuk
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="auth-split">
      <div className="auth-split-photo">
        <div className="auth-split-photo-text">
          <p>Sistem Informasi Desa</p>
          <h2>Jadi bagian dari Sukamaju</h2>
          <div
            style={{
              marginTop: 20,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.12)",
              backdropFilter: "blur(4px)",
              padding: "8px 14px",
              borderRadius: "var(--radius-md)",
              fontSize: 13,
            }}
          >
            <Icon name="verified_user" size={18} />
            Satu akun buat ajukan &amp; pantau semua surat administrasimu
          </div>
        </div>
      </div>
      <div className="auth-split-form">
        <Suspense fallback={<p className="card-text">Memuat...</p>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
