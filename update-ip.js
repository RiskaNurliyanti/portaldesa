/**
 * Sinkronkan IP jaringan lokal ke file konfigurasi backend & frontend.
 *
 * Deteksi IP LAN mesin ini, lalu tulis ke:
 *   - ades-backend/.env          (FRONTEND_URL)
 *   - frontend/next.config.mjs   (allowedDevOrigins)
 *   - frontend/.env.local        (NEXT_PUBLIC_API_URL)
 *
 * Usage (dari folder root project, sejajar ades-backend/ dan frontend/):
 *   node update-ip.js
 *   node update-ip.js 192.168.1.23   // paksa IP tertentu
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

function detectLocalIp() {
  const interfaces = os.networkInterfaces();
  const candidates = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        candidates.push({ name, address: iface.address });
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  // Prioritaskan rentang jaringan rumah/kantor yang umum (192.168.x.x, 10.x.x.x)
  candidates.sort((a, b) => {
    const score = (ip) => (ip.startsWith("192.168.") || ip.startsWith("10.") ? 0 : 1);
    return score(a.address) - score(b.address);
  });

  return candidates;
}

function updateEnv(envPath, ip) {
  if (!fs.existsSync(envPath)) {
    console.log(`[skip] ${envPath} tidak ditemukan`);
    return false;
  }

  let content = fs.readFileSync(envPath, "utf8");
  const line = `FRONTEND_URL=http://${ip}:3000`;

  content = /^FRONTEND_URL=.*$/m.test(content)
    ? content.replace(/^FRONTEND_URL=.*$/m, line)
    : content + `\n${line}\n`;

  fs.writeFileSync(envPath, content);
  console.log(`[ok] ${envPath} -> ${line}`);
  return true;
}

function updateNextConfig(configPath, ip) {
  if (!fs.existsSync(configPath)) {
    console.log(`[skip] ${configPath} tidak ditemukan`);
    return false;
  }

  let content = fs.readFileSync(configPath, "utf8");
  const line = `allowedDevOrigins: ["${ip}"],`;

  if (!/allowedDevOrigins:\s*\[[^\]]*\],?/.test(content)) {
    console.log(`[warn] baris allowedDevOrigins tidak ditemukan di ${configPath}`);
    return false;
  }

  content = content.replace(/allowedDevOrigins:\s*\[[^\]]*\],?/, line);
  fs.writeFileSync(configPath, content);
  console.log(`[ok] ${configPath} -> ${line}`);
  return true;
}

function updateFrontendEnvLocal(envLocalPath, ip) {
  const line = `NEXT_PUBLIC_API_URL=http://${ip}:8000/api`;
  let content = fs.existsSync(envLocalPath) ? fs.readFileSync(envLocalPath, "utf8") : "";

  content = /^NEXT_PUBLIC_API_URL=.*$/m.test(content)
    ? content.replace(/^NEXT_PUBLIC_API_URL=.*$/m, line)
    : content + (content && !content.endsWith("\n") ? "\n" : "") + `${line}\n`;

  fs.writeFileSync(envLocalPath, content);
  console.log(`[ok] ${envLocalPath} -> ${line}`);
  return true;
}

console.log("Mendeteksi IP jaringan lokal...\n");

const candidates = detectLocalIp();

if (!candidates) {
  console.log("Tidak ada alamat IP jaringan selain localhost.");
  console.log("Pastikan mesin ini terhubung ke WiFi/LAN, lalu coba lagi.");
  process.exit(1);
}

if (candidates.length > 1) {
  console.log("Ditemukan lebih dari satu alamat jaringan:");
  candidates.forEach((c, i) => console.log(`  ${i + 1}. ${c.address}  (${c.name})`));
  console.log(`Memakai: ${candidates[0].address}`);
  console.log("(kalau salah, jalankan: node update-ip.js <IP_YANG_BENAR>)\n");
}

const ipArg = process.argv[2];
const ip = ipArg || candidates[0].address;

console.log(`IP: ${ip}\n`);

const root = __dirname;
const envOk = updateEnv(path.join(root, "ades-backend", ".env"), ip);
const configOk = updateNextConfig(path.join(root, "frontend", "next.config.mjs"), ip);
const frontendEnvOk = updateFrontendEnvLocal(path.join(root, "frontend", ".env.local"), ip);

console.log("\n" + "-".repeat(50));
if (envOk && configOk && frontendEnvOk) {
  console.log("Selesai. Restart kedua server:\n");
  console.log("  cd ades-backend && php artisan config:clear && php artisan serve --host=0.0.0.0 --port=8000");
  console.log("  cd frontend && npx next dev -H 0.0.0.0\n");
  console.log(`Buka dari HP: http://${ip}:3000`);
} else {
  console.log("Beberapa file gagal diupdate, lihat pesan di atas.");
}
console.log("-".repeat(50));
