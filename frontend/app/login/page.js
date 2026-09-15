"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { labelStyle, inputStyle } from "@/lib/formStyles";
import Icon from "@/components/Icon";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push(user.role === "admin" ? "/admin/dashboard" : "/");
      }
    } catch (err) {
      setError(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 32, width: "100%", maxWidth: 400 }}>
      <h1 className="section-title" style={{ fontSize: 24, marginBottom: 4 }}>
        Masuk
      </h1>
      <p className="card-text" style={{ marginBottom: 24 }}>
        Masuk untuk mengelola konten desa atau memantau pengajuan suratmu.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ textAlign: "right", marginBottom: 16 }}>
          <Link href="/forgot-password" style={{ fontSize: 13, color: "var(--color-primary)" }}>
            Lupa password?
          </Link>
        </div>

        {error && (
          <p style={{ color: "#b3261e", fontSize: 14, marginBottom: 12 }}>{error}</p>
        )}

        <button type="submit" className="btn btn-solid" style={{ width: "100%" }} disabled={loading}>
          {loading ? "Memproses..." : "Masuk"}
        </button>
      </form>

      <p style={{ fontSize: 14, marginTop: 20, textAlign: "center" }}>
        Belum punya akun?{" "}
        <Link
          href={redirectTo ? `/register?redirect=${encodeURIComponent(redirectTo)}` : "/register"}
          style={{ color: "var(--color-primary)", fontWeight: 600 }}
        >
          Daftar
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="auth-split">
      <div className="auth-split-photo">
        <div className="auth-split-photo-text">
          <p>Sistem Informasi Desa</p>
          <h2>Selamat datang kembali</h2>
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
            Terintegrasi dengan sistem administrasi Balai Desa Sukamaju
          </div>
        </div>
      </div>
      <div className="auth-split-form">
        <Suspense fallback={<p className="card-text">Memuat...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
