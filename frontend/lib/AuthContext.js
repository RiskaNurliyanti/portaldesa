"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { apiPost } from "@/lib/api";

const AuthContext = createContext(null);
const STORAGE_KEY = "desa_auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Pulihkan sesi dari localStorage waktu app pertama dibuka
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed.user);
        setToken(parsed.token);
      }
    } catch (err) {
      console.error("Gagal membaca sesi login:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  function persist({ user, token }) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
    setUser(user);
    setToken(token);
  }

  const login = useCallback(async (email, password) => {
    const data = await apiPost("/login", { email, password });
    persist(data);
    return data.user;
  }, []);

  const register = useCallback(
    async (name, email, password, password_confirmation) => {
      const data = await apiPost("/register", {
        name,
        email,
        password,
        password_confirmation,
      });
      persist(data);
      return data.user;
    },
    []
  );

  const forgotPassword = useCallback(async (email) => {
    return apiPost("/forgot-password", { email });
  }, []);

  const resetPassword = useCallback(
    async ({ token, email, password, password_confirmation }) => {
      return apiPost("/reset-password", {
        token,
        email,
        password,
        password_confirmation,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      if (token) await apiPost("/logout", {}, token);
    } catch (err) {
      // Kalau gagal revoke token di server, tetap lanjut hapus sesi lokal
      console.error("Gagal logout di server:", err);
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  }
  return ctx;
}
