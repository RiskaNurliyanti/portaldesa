"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { apiGet } from "@/lib/api";
import PengajuanForm from "@/components/PengajuanForm";

export default function LengkapiPengajuanPage({ params }) {
  const { id } = use(params);
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [pengajuan, setPengajuan] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/akun/pengajuan/${id}/lengkapi`)}`);
    }
  }, [authLoading, user, router, id]);

  useEffect(() => {
    if (!token) return;
    apiGet(`/pengajuan-surat/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(setPengajuan)
      .catch((err) => setError(err.message || "Gagal memuat data pengajuan."))
      .finally(() => setFetching(false));
  }, [id, token]);

  if (authLoading || !user || fetching) {
    return (
      <div className="section container">
        <p className="card-text">Memuat...</p>
      </div>
    );
  }

  if (error || !pengajuan) {
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <h1 className="section-title">Pengajuan Tidak Ditemukan</h1>
          <p className="card-text" style={{ marginBottom: 16 }}>
            {error || "Pengajuan yang kamu maksud tidak ditemukan atau bukan milikmu."}
          </p>
          <Link href="/akun/pengajuan" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            ← Kembali ke Pengajuan Saya
          </Link>
        </div>
      </div>
    );
  }

  if (pengajuan.status !== "ditolak") {
    return (
      <div className="section">
        <div className="container" style={{ maxWidth: 560 }}>
          <h1 className="section-title">Tidak Bisa Dilengkapi</h1>
          <p className="card-text" style={{ marginBottom: 16 }}>
            Pengajuan {pengajuan.jenis_surat?.nama_surat} ini statusnya sekarang
            "{pengajuan.status}", bukan "ditolak" — jadi tidak perlu (dan tidak
            bisa) dilengkapi ulang lewat halaman ini.
          </p>
          <Link href="/akun/pengajuan" style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            ← Kembali ke Pengajuan Saya
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: 560 }}>
        <span className="eyebrow" style={{ color: "var(--color-accent)" }}>
          Perbaikan Pengajuan
        </span>
        <h1 className="section-title" style={{ marginTop: 6 }}>
          Lengkapi {pengajuan.jenis_surat?.nama_surat}
        </h1>
        <p className="section-subtitle">
          Perbaiki data dan/atau berkas sesuai catatan admin, lalu kirim ulang.
          Pengajuan ini akan ditinjau ulang oleh admin — tidak perlu bikin
          pengajuan baru dari awal.
        </p>

        <PengajuanForm jenisSurat={pengajuan.jenis_surat} mode="lengkapi" existingPengajuan={pengajuan} />
      </div>
    </div>
  );
}
