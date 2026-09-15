/** @type {import('next').NextConfig} */
const nextConfig = {
  // Biar HP di jaringan WiFi yang sama boleh akses dev server ini.
  // ⚠️ IP ini BUKAN otomatis — kalau laptop dapat IP baru dari router
  // (lihat lewat `ipconfig`/`ifconfig`), update juga baris di bawah ini
  // DAN FRONTEND_URL di ades-backend/.env supaya tetap cocok.
  allowedDevOrigins: ["192.168.1.10"],
};

export default nextConfig;
