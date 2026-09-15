"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { apiGet, assetUrl, downloadFile } from "@/lib/api";
import Icon from "@/components/Icon";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const STATUS_OPTIONS = ["pending", "diproses", "selesai", "ditolak"];
const STATUS_LABEL = {
  pending: { text: "Menunggu Verifikasi", chipClass: "chip-neutral" },
  diproses: { text: "Sedang Diproses", chipClass: "chip-progress" },
  selesai: { text: "Selesai Terbit", chipClass: "chip-approved" },
  ditolak: { text: "Ditolak / Revisi", chipClass: "chip-stamp" },
  dibatalkan: { text: "Dibatalkan", chipClass: "chip-cancelled" },
};

export default function AdminPengajuanPage() {
  const { token } = useAuth();
  const [allList, setAllList] = useState([]);
  const [filter, setFilter] = useState("");
  const [jenisFilter, setJenisFilter] = useState("");
  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [finalisasiId, setFinalisasiId] = useState(null);
  const [nomorSurat, setNomorSurat] = useState("");
  const [ditandatanganiOleh, setDitandatanganiOleh] = useState("Kepala Desa Sukamaju");
  const [finalisasiError, setFinalisasiError] = useState("");
  const [finalisasiLoading, setFinalisasiLoading] = useState(false);
  const [page, setPage] = useState(1);
  const PER_HALAMAN = 10;

  // Diambil TANPA filter status dari server, biar bisa hitung jumlah per
  // status buat tab (filter status dilakukan di client). Filter pencarian
  // teks & jenis surat tetap dikirim ke server.
  async function loadData() {
    if (!token) return;
    try {
      const params = new URLSearchParams();
      params.set("per_page", "200");
      if (q) params.set("q", q);
      const query = params.toString() ? `?${params.toString()}` : "";
      const res = await apiGet(`/pengajuan-surat${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllList(res.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadData();
  }, [token, q]);

  const jenisSuratOptions = useMemo(() => {
    const map = new Map();
    allList.forEach((item) => {
      if (item.jenis_surat) map.set(item.jenis_surat.id, item.jenis_surat.nama_surat);
    });
    return Array.from(map.entries());
  }, [allList]);

  const filteredByJenis = useMemo(() => {
    if (!jenisFilter) return allList;
    return allList.filter((item) => String(item.jenis_surat?.id) === jenisFilter);
  }, [allList, jenisFilter]);

  const counts = useMemo(() => {
    const c = { "": filteredByJenis.length };
    STATUS_OPTIONS.forEach((s) => {
      c[s] = filteredByJenis.filter((item) => item.status === s).length;
    });
    return c;
  }, [filteredByJenis]);

  const list = useMemo(() => {
    if (!filter) return filteredByJenis;
    return filteredByJenis.filter((item) => item.status === filter);
  }, [filteredByJenis, filter]);

  // Reset ke halaman 1 tiap kali filter/pencarian berubah, biar gak
  // nyangkut di halaman kosong kalau hasil filter jadi lebih sedikit
  useEffect(() => {
    setPage(1);
  }, [filter, jenisFilter, q]);

  const totalHalaman = Math.max(1, Math.ceil(list.length / PER_HALAMAN));
  const listHalamanIni = useMemo(
    () => list.slice((page - 1) * PER_HALAMAN, page * PER_HALAMAN),
    [list, page]
  );

  function updateLocal(id, field, value) {
    setAllList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }

  async function handleSave(item) {
    if (item.status === "ditolak" && !item.catatan_admin?.trim()) {
      alert("Wajib isi alasan penolakan sebelum menyimpan status \"ditolak\".");
      return;
    }

    setSavingId(item.id);
    try {
      await fetch(`${API_URL}/pengajuan-surat/${item.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: item.status,
          catatan_admin: item.catatan_admin || "",
        }),
      });
    } finally {
      setSavingId(null);
    }
  }

  async function handleFinalisasi(item) {
    setFinalisasiLoading(true);
    setFinalisasiError("");
    try {
      const res = await fetch(`${API_URL}/pengajuan-surat/${item.id}/finalisasi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nomor_surat: nomorSurat,
          ditandatangani_oleh: ditandatanganiOleh,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Gagal menerbitkan surat.");
      }

      setFinalisasiId(null);
      setNomorSurat("");
      loadData();
    } catch (err) {
      setFinalisasiError(err.message);
    } finally {
      setFinalisasiLoading(false);
    }
  }

  const TABS = [
    { key: "", label: "Semua Berkas" },
    { key: "pending", label: "Menunggu Verifikasi" },
    { key: "diproses", label: "Sedang Diproses" },
    { key: "selesai", label: "Selesai Terbit" },
    { key: "ditolak", label: "Ditolak / Revisi" },
  ];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <span className="eyebrow" style={{ color: "var(--color-primary)" }}>
          Buku Register Elektronik &middot; Pengajuan Administrasi Warga
        </span>
        <h1 className="section-title" style={{ marginBottom: 4, marginTop: 4 }}>
          Pengelolaan &amp; Penerbitan Naskah Surat
        </h1>
        <p className="card-text">
          Verifikasi kelengkapan berkas, telaah lampiran persyaratan, dan
          penerbitan nomor surat resmi.
        </p>
      </div>

      {/* ===== Tab status berwarna ===== */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {TABS.map((tab) => {
          const isActive = filter === tab.key;
          const chipClass = tab.key ? STATUS_LABEL[tab.key].chipClass : null;
          return (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={tab.key ? `chip ${chipClass}` : "chip chip-neutral"}
              style={{
                cursor: "pointer",
                fontSize: 12,
                padding: "6px 14px",
                border: isActive ? "2px solid currentColor" : "1px solid transparent",
                opacity: isActive ? 1 : 0.6,
              }}
            >
              {tab.label} ({counts[tab.key] ?? 0})
            </button>
          );
        })}
      </div>

      {/* ===== Pencarian & filter ===== */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari No. Registrasi, NIK, atau Nama Pemohon..."
          style={{
            flex: "1 1 260px",
            padding: "10px 14px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-border)",
            fontSize: 14,
          }}
        />
        <select
          value={jenisFilter}
          onChange={(e) => setJenisFilter(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: "var(--radius-pill)",
            border: "1px solid var(--color-border)",
            fontSize: 14,
          }}
        >
          <option value="">Semua Jenis Pelayanan Surat</option>
          {jenisSuratOptions.map(([id, nama]) => (
            <option key={id} value={id}>
              {nama}
            </option>
          ))}
        </select>
        {(q || jenisFilter || filter) && (
          <button
            onClick={() => {
              setQ("");
              setJenisFilter("");
              setFilter("");
            }}
            className="btn"
            style={{ background: "transparent", border: "1px solid var(--color-border)" }}
          >
            Reset Filter
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <p className="card-text">Tidak ada berkas pengajuan yang cocok.</p>
      ) : (
        <div className="card" style={{ overflowX: "auto", boxShadow: "var(--shadow-sheet)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 840 }}>
            <thead>
              <tr style={{ background: "var(--color-bg-alt)", textAlign: "left" }}>
                {["No. Registrasi & Waktu", "Data Pemohon", "Jenis Surat & Keperluan", "Lampiran Persyaratan", "Status Disposisi", "Tindakan & Penerbitan"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 14px",
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        color: "var(--color-text-muted)",
                        borderBottom: "1px solid var(--color-border)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {listHalamanIni.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--color-border)", verticalAlign: "top" }}>
                  {/* No Registrasi & Waktu */}
                  <td style={{ padding: 14, whiteSpace: "nowrap" }}>
                    <p style={{ fontWeight: 700, margin: 0 }}>
                      #{String(item.id).padStart(4, "0")}
                    </p>
                    <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                      {new Date(item.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
                      <br />
                      {new Date(item.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                    </p>
                    {item.nomor_surat && (
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--color-primary-dark)",
                          fontWeight: 700,
                          marginTop: 6,
                          background: "var(--color-primary-pale)",
                          borderRadius: "var(--radius-sm)",
                          padding: "3px 6px",
                          display: "inline-block",
                        }}
                        title="Nomor surat resmi"
                      >
                        📄 {item.nomor_surat}
                      </p>
                    )}
                    {item.riwayat_revisi && item.riwayat_revisi.length > 0 && (
                      <p style={{ fontSize: 10.5, color: "var(--color-accent)", fontWeight: 700, marginTop: 4 }}>
                        🔁 Revisi {item.riwayat_revisi.length}x
                      </p>
                    )}
                  </td>

                  {/* Data Pemohon */}
                  <td style={{ padding: 14, minWidth: 150 }}>
                    <p style={{ fontWeight: 700, margin: 0 }}>{item.nama_pemohon}</p>
                    <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", margin: "2px 0 0" }}>
                      NIK: {item.nik}
                    </p>
                    <Link
                      href={`/admin/pengajuan/${item.id}`}
                      style={{ fontSize: 11.5, color: "var(--color-primary)", fontWeight: 600 }}
                    >
                      Edit Data Pengajuan
                    </Link>
                  </td>

                  {/* Jenis Surat & Keperluan */}
                  <td style={{ padding: 14, minWidth: 170 }}>
                    <p style={{ fontWeight: 600, margin: 0 }}>{item.jenis_surat?.nama_surat}</p>
                    <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", margin: "4px 0 0" }}>
                      {item.keperluan}
                    </p>
                  </td>

                  {/* Lampiran */}
                  <td style={{ padding: 14, minWidth: 100 }}>
                    {item.lampiran_files && item.lampiran_files.length > 0 ? (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {item.lampiran_files.map((path, idx) => {
                          const labelSyarat = item.jenis_surat?.syarat?.[idx] || `Berkas ${idx + 1}`;
                          return (
                            <div
                              key={idx}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 1,
                                background: "var(--color-bg-alt)",
                                borderRadius: 999,
                                paddingRight: 3,
                              }}
                            >
                              <a
                                href={assetUrl(path)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Lihat: ${labelSyarat}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 20,
                                  height: 20,
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "var(--color-primary-dark)",
                                }}
                              >
                                {idx + 1}
                              </a>
                              <button
                                type="button"
                                onClick={() =>
                                  downloadFile(
                                    `/pengajuan-surat/${item.id}/unduh-lampiran/${idx}`,
                                    `${labelSyarat}-${item.nama_pemohon}`,
                                    token
                                  )
                                }
                                title={`Unduh: ${labelSyarat}`}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "var(--color-text-muted)",
                                  padding: 2,
                                }}
                              >
                                <Icon name="download" size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>—</span>
                    )}
                  </td>

                  {/* Status Disposisi */}
                  <td style={{ padding: 14, minWidth: 160 }}>
                    <span className={`chip ${(STATUS_LABEL[item.status] || STATUS_LABEL.pending).chipClass}`}>
                      {(STATUS_LABEL[item.status] || STATUS_LABEL.pending).text}
                    </span>
                    {item.status !== "selesai" && finalisasiId !== item.id && (
                      <textarea
                        placeholder={
                          item.status === "ditolak"
                            ? "Wajib isi alasan penolakan"
                            : "Catatan admin (opsional)"
                        }
                        value={item.catatan_admin || ""}
                        onChange={(e) => updateLocal(item.id, "catatan_admin", e.target.value)}
                        rows={2}
                        style={{
                          width: "100%",
                          padding: 6,
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--color-border)",
                          fontSize: 11.5,
                          marginTop: 8,
                          fontFamily: "inherit",
                        }}
                      />
                    )}
                    {item.status === "selesai" && (
                      <p style={{ fontSize: 11, color: "var(--color-text-muted)", marginTop: 6 }}>
                        Kode: <code>{item.kode_verifikasi}</code>
                      </p>
                    )}
                  </td>

                  {/* Tindakan & Penerbitan */}
                  <td style={{ padding: 14, minWidth: 200 }}>
                    {item.status === "selesai" ? (
                      item.file_surat && (
                        <button
                          type="button"
                          onClick={() =>
                            downloadFile(
                              `/pengajuan-surat/${item.id}/unduh-surat`,
                              `${item.nomor_surat || "surat"}.pdf`,
                              token
                            )
                          }
                          className="btn btn-solid"
                          style={{ fontSize: 12, padding: "6px 12px" }}
                        >
                          Download PDF
                        </button>
                      )
                    ) : finalisasiId === item.id ? (
                      <div style={{ background: "var(--color-bg-alt)", borderRadius: "var(--radius-sm)", padding: 10 }}>
                        <input
                          placeholder="Nomor surat"
                          value={nomorSurat}
                          onChange={(e) => setNomorSurat(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-border)",
                            fontSize: 11.5,
                            marginBottom: 6,
                          }}
                        />
                        <input
                          placeholder="Ditandatangani oleh"
                          value={ditandatanganiOleh}
                          onChange={(e) => setDitandatanganiOleh(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "6px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-border)",
                            fontSize: 11.5,
                            marginBottom: 6,
                          }}
                        />
                        {finalisasiError && (
                          <p style={{ color: "var(--color-error)", fontSize: 11, marginBottom: 6 }}>{finalisasiError}</p>
                        )}
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleFinalisasi(item)}
                            className="btn btn-solid"
                            disabled={finalisasiLoading || !nomorSurat}
                            style={{ fontSize: 11.5, padding: "5px 10px" }}
                          >
                            {finalisasiLoading ? "..." : "Terbitkan"}
                          </button>
                          <button
                            onClick={() => {
                              setFinalisasiId(null);
                              setFinalisasiError("");
                            }}
                            className="btn"
                            style={{ fontSize: 11.5, padding: "5px 10px", background: "transparent", border: "1px solid var(--color-border)" }}
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <select
                          value={item.status}
                          onChange={(e) => updateLocal(item.id, "status", e.target.value)}
                          style={{
                            padding: "5px 8px",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid var(--color-border)",
                            fontSize: 11.5,
                          }}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABEL[s].text}
                            </option>
                          ))}
                        </select>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => handleSave(item)}
                            className="btn"
                            style={{
                              fontSize: 11.5,
                              padding: "5px 10px",
                              background: "transparent",
                              color: "var(--color-primary-dark)",
                              border: "1px solid var(--color-border)",
                            }}
                            disabled={savingId === item.id}
                          >
                            {savingId === item.id ? "..." : "Simpan"}
                          </button>
                          <button
                            onClick={() => setFinalisasiId(item.id)}
                            className="btn btn-solid"
                            style={{ fontSize: 11.5, padding: "5px 10px" }}
                          >
                            Terbitkan
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {list.length > PER_HALAMAN && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20 }}>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn"
            style={{ background: "transparent", border: "1px solid var(--color-border)", padding: "6px 12px", fontSize: 13 }}
          >
            ← Sebelumnya
          </button>
          <span style={{ fontSize: 13, color: "var(--color-text-muted)", padding: "0 8px" }}>
            Halaman {page} dari {totalHalaman}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalHalaman, p + 1))}
            disabled={page === totalHalaman}
            className="btn"
            style={{ background: "transparent", border: "1px solid var(--color-border)", padding: "6px 12px", fontSize: 13 }}
          >
            Selanjutnya →
          </button>
        </div>
      )}
    </div>
  );
}
