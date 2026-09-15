// Ikon SVG lokal (bukan font dari Google) — dipakai gantiin
// <span className="material-symbols-outlined">nama_ikon</span> yang
// sebelumnya bergantung ke internet (fonts.googleapis.com). Kalau HP
// atau server gak ada akses internet beneran (cuma jaringan lokal),
// font itu gagal dimuat dan malah muncul sebagai teks mentah nyasar
// ("eck_circle" dkk). SVG di bawah ini digambar langsung di kode,
// jadi selalu tampil sama persis di semua device tanpa perlu internet.
//
// Pemakaian: <Icon name="check_circle" size={20} />
// `size` dalam px (default 20), warna ikut `color` CSS di elemen induk
// (pakai currentColor) kecuali di-override lewat style/className.

const PATHS = {
  account_balance: (
    <>
      <path d="M3 21h18" />
      <path d="M4 10h16" />
      <path d="M12 3l9 5H3z" />
      <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
    </>
  ),
  arrow_back: <path d="M19 12H5M12 19l-7-7 7-7" />,
  arrow_forward: <path d="M5 12h14M12 5l7 7-7 7" />,
  calendar_month: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  calendar_today: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
    </>
  ),
  cancel: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  check_circle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </>
  ),
  checklist: (
    <>
      <path d="M3.5 6l1.7 1.7L8.5 4.5M3.5 13l1.7 1.7L8.5 11.5M3.5 20l1.7 1.7L8.5 18.5" />
      <path d="M12 6h9M12 13h9M12 20h9" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.3" />
      <rect x="13" y="3" width="8" height="8" rx="1.3" />
      <rect x="3" y="13" width="8" height="8" rx="1.3" />
      <rect x="13" y="13" width="8" height="8" rx="1.3" />
    </>
  ),
  delete: (
    <>
      <path d="M4 7h16M9 7V4.8A1.8 1.8 0 0110.8 3h2.4A1.8 1.8 0 0115 4.8V7" />
      <path d="M6 7l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  download: (
    <>
      <path d="M12 3v12m0 0l-4.2-4.2M12 15l4.2-4.2" />
      <path d="M4.5 17v2.5a2 2 0 002 2h11a2 2 0 002-2V17" />
    </>
  ),
  draw: (
    <>
      <path d="M4 20l1-4L16.5 4.5a2 2 0 012.8 0l.2.2a2 2 0 010 2.8L8 19l-4 1z" />
      <path d="M14 6.5l3.5 3.5" />
    </>
  ),
  edit_document: (
    <>
      <path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2v-9" />
      <path d="M14 3l5 5" />
      <path d="M12 14l6-6 2.3 2.3-6 6H12z" />
    </>
  ),
  fact_check: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M7.5 12l1.8 1.8L12.5 10" />
      <path d="M8 17h8" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4.5h13l-2.6 4L18 12.5H5" />
    </>
  ),
  format_quote: (
    <>
      <path d="M6.5 8A2.5 2.5 0 004 10.5V14h4v-4H6.3c0-1 .3-1.5 1.2-1.6z" />
      <path d="M15 8a2.5 2.5 0 00-2.5 2.5V14h4v-4h-1.7c0-1 .3-1.5 1.2-1.6z" />
    </>
  ),
  gavel: (
    <>
      <path d="M9 6.5L14 11.5" />
      <path d="M6 9.5L2.5 13l4 4L10 13.5" />
      <path d="M13 2.5L20.5 10" />
      <path d="M2 21.5h11" />
    </>
  ),
  gpp_maybe: (
    <>
      <path d="M12 2.5l8 3.2V11c0 5-3.4 8.7-8 9.5-4.6-.8-8-4.5-8-9.5V5.7l8-3.2z" />
      <path d="M12 8v4.5" />
      <circle cx="12" cy="15.5" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  location_city: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V9l5-3v15M14 21V5l5 3v13" />
      <path d="M8 12h1M8 16h1M17 11h1M17 15h1" />
    </>
  ),
  menu_book: (
    <>
      <path d="M12 6.5c-2-1.5-5.5-1.5-8-.7v13c2.5-.8 6-.8 8 .7 2-1.5 5.5-1.5 8-.7v-13c-2.5-.8-6-.8-8 .7z" />
      <path d="M12 6.5v13" />
    </>
  ),
  newspaper: (
    <>
      <rect x="3" y="5" width="14" height="15" rx="1.5" />
      <path d="M17 8.5h3.5v9a1.5 1.5 0 01-1.5 1.5H17" />
      <path d="M6.5 9h7M6.5 12h7M6.5 15h4" />
    </>
  ),
  notifications: (
    <>
      <path d="M6 9a6 6 0 1112 0c0 4.5 1.5 6 1.5 6h-15S6 13.5 6 9z" />
      <path d="M10 19a2 2 0 004 0" />
    </>
  ),
  open_in_new: (
    <>
      <path d="M18 13.5V19a1.5 1.5 0 01-1.5 1.5H5A1.5 1.5 0 013.5 19V7.5A1.5 1.5 0 015 6h5.5" />
      <path d="M14.5 3.5H20.5V9.5" />
      <path d="M20 4L11 13" />
    </>
  ),
  photo_camera: (
    <>
      <path d="M4 8.5A1.5 1.5 0 015.5 7h2L9 4.5h6L16.5 7h2A1.5 1.5 0 0120 8.5v10A1.5 1.5 0 0118.5 20h-13A1.5 1.5 0 014 18.5v-10z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  photo_library: (
    <>
      <rect x="2.5" y="6" width="14" height="14" rx="1.5" />
      <path d="M6 20.5h13a1.5 1.5 0 001.5-1.5V6.5" />
      <circle cx="7" cy="10.5" r="1.4" />
      <path d="M3 17l3.2-3.2a1 1 0 011.4 0L11 17" />
    </>
  ),
  schedule: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  verified: (
    <>
      <path d="M12 2.5l2.2 1.6 2.7-.3 1 2.5 2.5 1-.3 2.7 1.6 2.2-1.6 2.2.3 2.7-2.5 1-1 2.5-2.7-.3L12 21.5l-2.2-1.6-2.7.3-1-2.5-2.5-1 .3-2.7L2.3 12l1.6-2.2-.3-2.7 2.5-1 1-2.5 2.7.3L12 2.5z" />
      <path d="M8.5 12.3l2.3 2.3 4.7-4.7" />
    </>
  ),
  verified_user: (
    <>
      <path d="M12 2.5l8 3.2V11c0 5-3.4 8.7-8 9.5-4.6-.8-8-4.5-8-9.5V5.7l8-3.2z" />
      <path d="M8.5 12l2.3 2.3 4.7-4.7" />
    </>
  ),
  visibility: (
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  visibility_off: (
    <>
      <path d="M10.6 5.2c.5-.1 1-.2 1.4-.2 6.5 0 10 7 10 7-.6 1.2-1.8 2.9-3.5 4.3" />
      <path d="M6.4 6.7C4.1 8.3 2 12 2 12s3.5 7 10 7c1.1 0 2.1-.2 3-.5" />
      <path d="M9.5 9.7a3 3 0 004.2 4.2" />
      <path d="M3 3l18 18" />
    </>
  ),
};

export default function Icon({ name, size = 20, style, className, ...rest }) {
  const content = PATHS[name];

  if (!content) {
    // Ikon belum terdaftar — jangan bikin halaman rusak, cukup gak
    // render apa-apa (bukannya nampilin nama ikon mentah kayak
    // masalah font sebelumnya).
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0, ...style }}
      className={className}
      {...rest}
    >
      {content}
    </svg>
  );
}
