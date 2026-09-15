"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import { inputStyle } from "@/lib/formStyles";

// Input password dengan tombol toggle lihat/sembunyikan.
export default function PasswordInput({ value, onChange, style, ...rest }) {
  const [terlihat, setTerlihat] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <input
        type={terlihat ? "text" : "password"}
        value={value}
        onChange={onChange}
        style={{ ...inputStyle, paddingRight: 40, ...style }}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setTerlihat((v) => !v)}
        aria-label={terlihat ? "Sembunyikan password" : "Lihat password"}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-muted)",
          display: "flex",
          padding: 4,
        }}
      >
        <Icon name={terlihat ? "visibility_off" : "visibility"} size={18} />
      </button>
    </div>
  );
}
