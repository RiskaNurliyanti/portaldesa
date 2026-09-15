"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Kotak pencarian sederhana — submit-nya update query string di URL,
// biar halaman (server component) fetch ulang datanya dengan filter baru.
export default function SearchBox({ basePath, defaultValue = "", placeholder = "Cari..." }) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("q", value.trim());
    router.push(`${basePath}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, marginBottom: 24, maxWidth: 420 }}>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          padding: "10px 14px",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          fontSize: 14,
        }}
      />
      <button type="submit" className="btn btn-solid" style={{ padding: "10px 18px" }}>
        Cari
      </button>
    </form>
  );
}
