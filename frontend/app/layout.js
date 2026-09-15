import { Newsreader, Public_Sans } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/lib/AuthContext";
import "./globals.css";

// Font judul — Newsreader dipilih karena kesan "dokumen resmi terformat"
// (mirip typeface yang biasa dipakai di surat-surat pemerintahan),
// bukan sans generik yang sering dipakai di template SaaS.
const newsreader = Newsreader({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-heading",
});

// Font body — Public Sans awalnya didesain buat U.S. Web Design System
// (layanan digital pemerintahan), jadi karakternya pas buat portal
// pelayanan publik seperti ini.
const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "Desa Sukamaju — Sistem Informasi Desa",
  description:
    "Portal resmi Desa Sukamaju: berita, layanan administrasi surat, galeri kegiatan, dan profil desa.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${newsreader.variable} ${publicSans.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
