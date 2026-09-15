"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { labelStyle, inputStyle } from "@/lib/formStyles";

function ResetPasswordForm() {
  const params = useSearchParams();
  const { resetPassword } = useAuth();
  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const token = params.get("token") || "";
  const email = params.get("email") || "";

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password !== form.password_confirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    setStatus("loading");
    setError("");
    try {
      await resetPassword({
        token,
        email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Gagal reset password. Link mungkin sudah kedaluwarsa.");
    }
  }

  if (!token || !email) {
    return (
      <p className="card-text">
        Link reset password tidak valid. Minta link baru lewat halaman{" "}
        <Link href="/forgot-password" style={{ color: "var(--color-primary)" }}>
          lupa password
        </Link>
        .
      </p>
    );
  }

  if (status === "success") {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h3 className="card-title">Password Berhasil Diubah</h3>
        <p className="card-text" style={{ marginBottom: 16 }}>
          Silakan masuk dengan password barumu.
        </p>
        <Link href="/login" className="btn btn-solid">
          Ke Halaman Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Password Baru</label>
        <input
          type="password"
          required
          minLength={8}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={inputStyle}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Konfirmasi Password</label>
        <input
          type="password"
          required
          minLength={8}
          value={form.password_confirmation}
          onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
          style={inputStyle}
        />
      </div>

      {error && (
        <p style={{ color: "#b3261e", fontSize: 14, marginBottom: 12 }}>{error}</p>
      )}

      <button
        type="submit"
        className="btn btn-solid"
        style={{ width: "100%" }}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Menyimpan..." : "Simpan Password Baru"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="section" style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <h1 className="section-title" style={{ fontSize: 24, marginBottom: 16 }}>
          Reset Password
        </h1>
        <Suspense fallback={<p className="card-text">Memuat...</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
