"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { labelStyle, inputStyle } from "@/lib/formStyles";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      await forgotPassword(email);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Gagal mengirim link reset.");
    }
  }

  return (
    <div className="section" style={{ display: "flex", justifyContent: "center" }}>
      <div className="card" style={{ padding: 32, width: "100%", maxWidth: 400 }}>
        <h1 className="section-title" style={{ fontSize: 24, marginBottom: 4 }}>
          Lupa Password
        </h1>
        <p className="card-text" style={{ marginBottom: 24 }}>
          Masukkan email akunmu, kami kirimkan link buat bikin password baru.
        </p>

        {status === "success" ? (
          <p className="card-text">
            Kalau email <strong>{email}</strong> terdaftar, link reset password
            sudah dikirim. Cek inbox (atau folder spam) kamu.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              {status === "loading" ? "Mengirim..." : "Kirim Link Reset"}
            </button>
          </form>
        )}

        <p style={{ fontSize: 14, marginTop: 20, textAlign: "center" }}>
          <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  );
}
