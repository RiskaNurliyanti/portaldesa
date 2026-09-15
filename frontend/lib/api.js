/**
 * Client HTTP untuk Laravel API.
 *
 * Base URL berbeda tergantung konteks eksekusi: di server (Server
 * Component) selalu pakai localhost karena backend jalan di mesin yang
 * sama; di browser pakai NEXT_PUBLIC_API_URL karena device lain (HP)
 * butuh alamat jaringan, bukan localhost miliknya sendiri.
 */
const isServer = typeof window === "undefined";
const API_URL = isServer
  ? process.env.INTERNAL_API_URL || "http://127.0.0.1:8000/api"
  : process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Timeout default buat semua request ke backend. Tanpa ini, kalau
// backend lambat merespons atau alamatnya gak kejangkau (mis. IP LAN
// di .env.local sudah berubah, atau database jauh lagi "bangun" dari
// idle), fetch() bakal nggantung tanpa batas waktu — halaman kelihatan
// kayak gak merespons sama sekali tanpa pesan error apa pun, termasuk
// yang paling parah: navigasi ke halaman yang datanya diambil di
// server (Server Component) ikut nggantung juga. Dengan AbortController
// ini, permintaan yang kelamaan dibatalkan dan error-nya jelas.
const TIMEOUT_MS = 10000;

async function fetchDenganTimeout(url, options = {}, timeoutMs = TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error(
        "Gagal terhubung ke server (waktu tunggu habis). Pastikan backend Laravel sedang berjalan dan perangkat ini bisa menjangkau alamatnya."
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function apiGet(path, options = {}) {
  const { timeoutMs, ...fetchOptions } = options;
  const headers = { Accept: "application/json", ...fetchOptions.headers };

  async function ambil() {
    return fetchDenganTimeout(`${API_URL}${path}`, { ...fetchOptions, headers }, timeoutMs);
  }

  let res;
  try {
    res = await ambil();
  } catch (err) {
    // Gagal di level jaringan (timeout/nggak kejangkau) — GET aman
    // diulang karena idempotent. Seringnya percobaan pertama gagal
    // cuma gara-gara database cloud lagi "bangun" dari idle; dicoba
    // sekali lagi dulu (koneksinya harusnya udah hangat) sebelum
    // benar-benar dianggap gagal, daripada user harus refresh manual.
    await new Promise((resolve) => setTimeout(resolve, 800));
    res = await ambil();
  }

  if (!res.ok) {
    throw new Error(`Gagal mengambil data dari ${path} (status ${res.status})`);
  }

  return res.json();
}

/**
 * Sama seperti apiGet, tapi tidak melempar error untuk response
 * non-2xx. Dipakai untuk endpoint yang body JSON-nya tetap berguna
 * walau statusnya gagal — misalnya /verifikasi/{kode} yang balas
 * 404/410 beserta pesan dan data surat pengganti, bukan cuma kode
 * status kosong.
 */
export async function apiGetWithStatus(path, timeoutMs) {
  async function ambil() {
    return fetchDenganTimeout(
      `${API_URL}${path}`,
      { headers: { Accept: "application/json" } },
      timeoutMs
    );
  }

  let res;
  try {
    res = await ambil();
  } catch (err) {
    // Sama seperti apiGet — GET aman diulang, kasih kesempatan sekali
    // lagi kalau gagal cuma gara-gara database lagi "bangun" dari idle.
    await new Promise((resolve) => setTimeout(resolve, 800));
    res = await ambil();
  }

  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

export async function apiPost(path, body, token) {
  const res = await fetchDenganTimeout(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `Gagal mengirim data ke ${path}`);
  }

  return res.json();
}

/** Submit multipart form data (upload file). Jangan set Content-Type manual. */
export async function apiPostForm(path, formData, token) {
  const res = await fetchDenganTimeout(
    `${API_URL}${path}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    },
    30000 // upload berkas butuh waktu lebih longgar dibanding request biasa
  );

  if (!res.ok) {
    const error = await res.json().catch(() => null);

    if (error?.errors) {
      const detail = Object.values(error.errors).flat().join(" ");
      throw new Error(detail || error.message || `Gagal mengirim data ke ${path}`);
    }

    if (error?.message) {
      throw new Error(error.message);
    }

    throw new Error(
      `Gagal mengirim data ke ${path} (status ${res.status}). Cek batas upload_max_filesize / post_max_size di php.ini.`
    );
  }

  return res.json();
}

// Hasil fungsi ini dipakai sebagai <img src> di browser, jadi selalu
// pakai alamat publik walau dipanggil dari kode server-side.
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function assetUrl(path) {
  if (!path) return null;
  if (path.startsWith("http")) return path;

  const backendRoot = PUBLIC_API_URL.replace(/\/api\/?$/, "");
  return `${backendRoot}${path}`;
}

/**
 * Unduh file (surat PDF / lampiran) lewat endpoint API berautentikasi,
 * bukan akses langsung ke storage.
 */
export async function downloadFile(apiPath, filename, token) {
  async function ambil() {
    return fetchDenganTimeout(
      `${API_URL}${apiPath}`,
      { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      30000
    );
  }

  let res;
  try {
    res = await ambil();
  } catch (err) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    res = await ambil();
  }

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Gagal mengunduh file.");
  }

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename || "file";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  window.URL.revokeObjectURL(blobUrl);
}
