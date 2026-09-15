/**
 * Setiap jenis surat butuh data tambahan yang beda-beda (Kelahiran butuh
 * data anak & ortu, Nikah butuh data pasangan, dst). Fungsi ini nentuin
 * field mana yang perlu ditampilkan di form, berdasarkan nama jenis surat.
 *
 * Data yang diisi lewat field-field ini dikirim sebagai "data_tambahan"
 * (JSON) ke backend, dipakai buat nyusun isi surat pas admin finalisasi.
 */
export function getExtraFields(namaSurat = "") {
  if (namaSurat.includes("Usaha")) {
    return [
      { name: "nama_usaha", label: "Nama Usaha", type: "text" },
      { name: "jenis_usaha", label: "Jenis Usaha", type: "text" },
    ];
  }

  if (namaSurat.includes("Kelahiran")) {
    return [
      { name: "nama_anak", label: "Nama Anak", type: "text" },
      { name: "jenis_kelamin_anak", label: "Jenis Kelamin Anak", type: "jk" },
      { name: "tempat_lahir_anak", label: "Tempat Lahir Anak", type: "text" },
      { name: "tanggal_lahir_anak", label: "Tanggal Lahir Anak", type: "date" },
      { name: "nama_ayah", label: "Nama Ayah", type: "text" },
      { name: "nama_ibu", label: "Nama Ibu", type: "text" },
    ];
  }

  if (namaSurat.includes("Kematian")) {
    return [
      { name: "nama_almarhum", label: "Nama Almarhum/Almarhumah", type: "text" },
      { name: "tanggal_meninggal", label: "Tanggal Meninggal", type: "date" },
      { name: "tempat_meninggal", label: "Tempat Meninggal", type: "text" },
      { name: "sebab_kematian", label: "Sebab Kematian (opsional)", type: "text" },
    ];
  }

  if (namaSurat.includes("Nikah")) {
    return [
      { name: "nama_pasangan", label: "Nama Calon Pasangan", type: "text" },
      { name: "nik_pasangan", label: "NIK Calon Pasangan", type: "text" },
    ];
  }

  return [];
}

export const AGAMA_OPTIONS = [
  "Islam",
  "Kristen",
  "Katolik",
  "Hindu",
  "Buddha",
  "Konghucu",
  "Lainnya",
];
