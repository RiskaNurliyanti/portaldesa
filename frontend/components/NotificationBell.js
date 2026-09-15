"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { apiGet } from "@/lib/api";
import Icon from "@/components/Icon";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function NotificationBell() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const boxRef = useRef(null);

  async function loadNotif() {
    if (!token) return;
    try {
      const res = await apiGet("/notifikasi", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data ?? []);
      setUnread(res.jumlah_belum_dibaca ?? 0);
    } catch (err) {
      console.error("Gagal ambil notifikasi:", err.message);
    }
  }

  useEffect(() => {
    loadNotif();
    // Refresh otomatis tiap 30 detik, biar notif baru muncul tanpa perlu reload manual
    const interval = setInterval(loadNotif, 30000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleClickItem(item) {
    if (!item.dibaca) {
      try {
        await fetch(`${API_URL}/notifikasi/${item.id}/dibaca`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, dibaca: true } : n)));
        setUnread((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setOpen(false);
    if (item.link) router.push(item.link);
  }

  async function handleTandaiSemua() {
    try {
      await fetch(`${API_URL}/notifikasi/tandai-semua-dibaca`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems((prev) => prev.map((n) => ({ ...n, dibaca: true })));
      setUnread(0);
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return null;

  return (
    <div ref={boxRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Notifikasi"
        style={{
          position: "relative",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 6,
          lineHeight: 1,
          display: "inline-flex",
          color: "var(--color-text)",
        }}
      >
        <Icon name="notifications" size={22} />
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "var(--color-accent)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 999,
              minWidth: 16,
              height: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 3px",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: 320,
            maxHeight: 400,
            overflowY: "auto",
            background: "var(--color-bg)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-elevated)",
            zIndex: 100,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13 }}>Notifikasi</span>
            {unread > 0 && (
              <button
                onClick={handleTandaiSemua}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p style={{ padding: 16, fontSize: 13, color: "var(--color-text-muted)" }}>
              Belum ada notifikasi.
            </p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => handleClickItem(item)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  border: "none",
                  borderBottom: "1px solid var(--color-border)",
                  background: item.dibaca ? "transparent" : "var(--color-bg-alt)",
                  cursor: "pointer",
                }}
              >
                <p style={{ margin: 0, fontWeight: 600, fontSize: 13 }}>{item.judul}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>
                  {item.pesan}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--color-text-muted)" }}>
                  {new Date(item.created_at).toLocaleString("id-ID")}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
