import { Component, AHSPItem } from "../types";

export const DEFAULT_COMPONENTS: Component[] = [
  // BAHAN (MATERIALS)
  { id: "semen_pc", name: "Semen Portland (PC) per kg", category: "bahan", unit: "kg", defaultPrice: 1500 },
  { id: "pasir_pasang", name: "Pasir Pasang per m3", category: "bahan", unit: "m3", defaultPrice: 280000 },
  { id: "pasir_beton", name: "Pasir Beton per m3", category: "bahan", unit: "m3", defaultPrice: 320000 },
  { id: "pasir_urug", name: "Pasir Urug per m3", category: "bahan", unit: "m3", defaultPrice: 200000 },
  { id: "batu_belah", name: "Batu Kali Belah 15/20 cm per m3", category: "bahan", unit: "m3", defaultPrice: 350000 },
  { id: "batu_pecah_12", name: "Batu Pecah (Split) 1/2 cm per m3", category: "bahan", unit: "m3", defaultPrice: 380000 },
  { id: "bata_merah", name: "Batu Bata Merah per buah", category: "bahan", unit: "buah", defaultPrice: 1100 },
  { id: "cat_dasar", name: "Cat Dasar / Alkali Sealer per kg", category: "bahan", unit: "kg", defaultPrice: 26000 },
  { id: "cat_tembok", name: "Cat Tembok / Emulsi Ekonomis per kg", category: "bahan", unit: "kg", defaultPrice: 42000 },
  { id: "plamir_tembok", name: "Plamir Tembok per kg", category: "bahan", unit: "kg", defaultPrice: 15000 },
  { id: "air", name: "Air Bersih per liter", category: "bahan", unit: "liter", defaultPrice: 250 },
  { id: "kayu_bekesting", name: "Kayu Kelas III (Bekesting) per m3", category: "bahan", unit: "m3", defaultPrice: 2500000 },
  { id: "paku_biasa", name: "Paku Biasa 2\" s.d. 5\" per kg", category: "bahan", unit: "kg", defaultPrice: 22000 },
  { id: "besi_beton", name: "Besi Beton Polos/Ulir per kg", category: "bahan", unit: "kg", defaultPrice: 14500 },
  { id: "kawat_beton", name: "Kawat Beton (Bendrat) per kg", category: "bahan", unit: "kg", defaultPrice: 24000 },
  { id: "keramik_60x60", name: "Keramik Lantai Polos 60x60 cm per m2", category: "bahan", unit: "m2", defaultPrice: 135000 },
  { id: "keramik_40x40", name: "Keramik Lantai 40x40 cm per m2", category: "bahan", unit: "m2", defaultPrice: 85000 },
  { id: "keramik_dinding", name: "Keramik Dinding 20x25 cm per m2", category: "bahan", unit: "m2", defaultPrice: 95000 },
  { id: "semen_warna", name: "Semen Warna (Pengisi Nat) per kg", category: "bahan", unit: "kg", defaultPrice: 18000 },
  { id: "baja_ringan_c", name: "Profil Canal C Baja Ringan per meter", category: "bahan", unit: "meter", defaultPrice: 22000 },
  { id: "reng_baja_ringan", name: "Reng Baja Ringan per meter", category: "bahan", unit: "meter", defaultPrice: 12000 },
  { id: "skrup_baja_ringan", name: "Sekrup Baja Ringan per buah", category: "bahan", unit: "buah", defaultPrice: 350 },
  { id: "genteng_beton", name: "Genteng Beton per buah", category: "bahan", unit: "buah", defaultPrice: 9500 },
  { id: "kabel_nya", name: "Kabel NYA 1x1.5 mm per meter", category: "bahan", unit: "m", defaultPrice: 5500 },
  { id: "pipa_conduit", name: "Pipa Listrik Conduit PVC per batang", category: "bahan", unit: "batang", defaultPrice: 15000 },
  { id: "saklar_tunggal", name: "Saklar Tunggal per buah", category: "bahan", unit: "buah", defaultPrice: 18000 },
  { id: "stop_kontak", name: "Stop Kontak 1 Phase per buah", category: "bahan", unit: "buah", defaultPrice: 20000 },
  { id: "fitting_lampu", name: "Fitting Lampu Plafon per buah", category: "bahan", unit: "buah", defaultPrice: 15000 },
  { id: "pipa_pvc_12", name: "Pipa PVC AW 1/2\" per batang", category: "bahan", unit: "batang", defaultPrice: 24000 },
  { id: "kran_air", name: "Kran Air Kuningan 1/2\" per buah", category: "bahan", unit: "buah", defaultPrice: 35000 },

  // TENAGA (LABOR)
  { id: "pekerja", name: "Pekerja Terampil (OH)", category: "tenaga", unit: "OH", defaultPrice: 120000 },
  { id: "tukang_batu", name: "Tukang Batu / Konstruksi (OH)", category: "tenaga", unit: "OH", defaultPrice: 150000 },
  { id: "tukang_kayu", name: "Tukang Kayu (OH)", category: "tenaga", unit: "OH", defaultPrice: 150000 },
  { id: "tukang_besi", name: "Tukang Besi (OH)", category: "tenaga", unit: "OH", defaultPrice: 150000 },
  { id: "tukang_cat", name: "Tukang Cat (OH)", category: "tenaga", unit: "OH", defaultPrice: 145000 },
  { id: "tukang_listrik", name: "Tukang Listrik (OH)", category: "tenaga", unit: "OH", defaultPrice: 160000 },
  { id: "tukang_pipa", name: "Tukang Pipa / Plambing (OH)", category: "tenaga", unit: "OH", defaultPrice: 155000 },
  { id: "kepala_tukang", name: "Kepala Tukang (OH)", category: "tenaga", unit: "OH", defaultPrice: 170000 },
  { id: "mandor", name: "Mandor Lapangan (OH)", category: "tenaga", unit: "OH", defaultPrice: 180000 },

  // ALAT (TOOLS)
  { id: "molen_mixer", name: "Sewa Concrete Mixer (Molen) per hari", category: "alat", unit: "hari", defaultPrice: 350000 },
  { id: "alat_bantu", name: "Alat Bantu Kerja Mini (Set/Lump-Sum)", category: "alat", unit: "set", defaultPrice: 15000 },
];

export const STANDARD_AHSP_DATABASE: AHSPItem[] = [
  {
    id: "A.2.2.1.1",
    name: "Galian Tanah Biasa Kedalaman s.d. 1 Meter",
    unit: "m3",
    coefficients: [
      { componentId: "pekerja", coefficient: 0.75 },
      { componentId: "mandor", coefficient: 0.025 },
    ],
  },
  {
    id: "A.2.3.1.11",
    name: "Pengurugan 1 m3 Pasir Urug (Pasir Urug Padat)",
    unit: "m3",
    coefficients: [
      { componentId: "pasir_urug", coefficient: 1.2 },
      { componentId: "air", coefficient: 10 },
      { componentId: "pekerja", coefficient: 0.3 },
      { componentId: "mandor", coefficient: 0.01 },
    ],
  },
  {
    id: "A.3.2.1.2",
    name: "Pemasangan Pondasi Batu Belah Belah Campuran 1 SP : 4 PP",
    unit: "m3",
    coefficients: [
      { componentId: "batu_belah", coefficient: 1.2 },
      { componentId: "semen_pc", coefficient: 163.0 },
      { componentId: "pasir_pasang", coefficient: 0.52 },
      { componentId: "pekerja", coefficient: 1.5 },
      { componentId: "tukang_batu", coefficient: 0.75 },
      { componentId: "kepala_tukang", coefficient: 0.075 },
      { componentId: "mandor", coefficient: 0.075 },
    ],
  },
  {
    id: "A.4.1.1.5",
    name: "Pembuatan 1 m3 Beton Mutu fc' 19,3 MPa (K-225) Camp. Manual/Molen",
    unit: "m3",
    coefficients: [
      { componentId: "semen_pc", coefficient: 371.0 },
      { componentId: "pasir_beton", coefficient: 0.499 },
      { componentId: "batu_pecah_12", coefficient: 0.762 },
      { componentId: "air", coefficient: 215 },
      { componentId: "pekerja", coefficient: 1.65 },
      { componentId: "tukang_batu", coefficient: 0.275 },
      { componentId: "kepala_tukang", coefficient: 0.028 },
      { componentId: "mandor", coefficient: 0.083 },
      { componentId: "molen_mixer", coefficient: 0.05 },
    ],
  },
  {
    id: "A.4.1.1.X1",
    name: "Pekerjaan Pembesian dengan Besi Beton Polos / Ulir per 10 kg",
    unit: "10-kg",
    coefficients: [
      { componentId: "besi_beton", coefficient: 10.5 }, // includes wastage
      { componentId: "kawat_beton", coefficient: 0.15 },
      { componentId: "pekerja", coefficient: 0.07 },
      { componentId: "tukang_besi", coefficient: 0.07 },
      { componentId: "kepala_tukang", coefficient: 0.007 },
      { componentId: "mandor", coefficient: 0.004 },
    ],
  },
  {
    id: "A.4.1.1.X2",
    name: "Pembuatan Bekesting untuk Pondasi / Struktur Sederhana per 1 m2",
    unit: "m2",
    coefficients: [
      { componentId: "kayu_bekesting", coefficient: 0.04 },
      { componentId: "paku_biasa", coefficient: 0.3 },
      { componentId: "pekerja", coefficient: 0.52 },
      { componentId: "tukang_kayu", coefficient: 0.26 },
      { componentId: "kepala_tukang", coefficient: 0.026 },
      { componentId: "mandor", coefficient: 0.026 },
    ],
  },
  {
    id: "A.4.4.1.9",
    name: "Pemasangan Dinding Bata Merah Tebal 1/2 Bata Campuran 1 SP : 4 PP",
    unit: "m2",
    coefficients: [
      { componentId: "bata_merah", coefficient: 70 },
      { componentId: "semen_pc", coefficient: 11.5 },
      { componentId: "pasir_pasang", coefficient: 0.043 },
      { componentId: "pekerja", coefficient: 0.3 },
      { componentId: "tukang_batu", coefficient: 0.1 },
      { componentId: "kepala_tukang", coefficient: 0.01 },
      { componentId: "mandor", coefficient: 0.015 },
    ],
  },
  {
    id: "A.4.4.2.4",
    name: "Pemasangan Plesteran Dinding 1 KP : 4 PP Tebal 15 mm",
    unit: "m2",
    coefficients: [
      { componentId: "semen_pc", coefficient: 6.24 },
      { componentId: "pasir_pasang", coefficient: 0.024 },
      { componentId: "pekerja", coefficient: 0.2 },
      { componentId: "tukang_batu", coefficient: 0.15 },
      { componentId: "kepala_tukang", coefficient: 0.015 },
      { componentId: "mandor", coefficient: 0.01 },
    ],
  },
  {
    id: "A.4.4.2.21",
    name: "Pekerjaan Acian Semen pada Dinding Plesteran",
    unit: "m2",
    coefficients: [
      { componentId: "semen_pc", coefficient: 3.25 },
      { componentId: "pekerja", coefficient: 0.2 },
      { componentId: "tukang_batu", coefficient: 0.1 },
      { componentId: "kepala_tukang", coefficient: 0.01 },
      { componentId: "mandor", coefficient: 0.01 },
    ],
  },
  {
    id: "A.4.7.1.10",
    name: "Pengecatan Tembok Baru dengan Cat Tembok Emulsi (3 Lapis)",
    unit: "m2",
    coefficients: [
      { componentId: "plamir_tembok", coefficient: 0.1 },
      { componentId: "cat_dasar", coefficient: 0.1 },
      { componentId: "cat_tembok", coefficient: 0.26 },
      { componentId: "pekerja", coefficient: 0.02 },
      { componentId: "tukang_cat", coefficient: 0.063 },
      { componentId: "kepala_tukang", coefficient: 0.0063 },
      { componentId: "mandor", coefficient: 0.0025 },
      { componentId: "alat_bantu", coefficient: 0.1 },
    ],
  },
  {
    id: "A.4.4.3.35",
    name: "Pemasangan Lantai Keramik 60x60 cm Polos",
    unit: "m2",
    coefficients: [
      { componentId: "keramik_60x60", coefficient: 1.05 },
      { componentId: "semen_pc", coefficient: 11.38 },
      { componentId: "pasir_pasang", coefficient: 0.045 },
      { componentId: "semen_warna", coefficient: 1.5 },
      { componentId: "pekerja", coefficient: 0.62 },
      { componentId: "tukang_batu", coefficient: 0.35 },
      { componentId: "kepala_tukang", coefficient: 0.035 },
      { componentId: "mandor", coefficient: 0.03 },
    ],
  },
  {
    id: "A.4.4.3.33",
    name: "Pemasangan Lantai Keramik 40x40 cm",
    unit: "m2",
    coefficients: [
      { componentId: "keramik_40x40", coefficient: 1.05 },
      { componentId: "semen_pc", coefficient: 10.0 },
      { componentId: "pasir_pasang", coefficient: 0.045 },
      { componentId: "semen_warna", coefficient: 1.5 },
      { componentId: "pekerja", coefficient: 0.62 },
      { componentId: "tukang_batu", coefficient: 0.35 },
      { componentId: "kepala_tukang", coefficient: 0.035 },
      { componentId: "mandor", coefficient: 0.03 },
    ],
  },
  {
    id: "A.4.4.3.54",
    name: "Pemasangan Keramik Dinding 20x25 cm",
    unit: "m2",
    coefficients: [
      { componentId: "keramik_dinding", coefficient: 1.05 },
      { componentId: "semen_pc", coefficient: 9.3 },
      { componentId: "pasir_pasang", coefficient: 0.018 },
      { componentId: "semen_warna", coefficient: 1.94 },
      { componentId: "pekerja", coefficient: 0.62 },
      { componentId: "tukang_batu", coefficient: 0.45 },
      { componentId: "kepala_tukang", coefficient: 0.045 },
      { componentId: "mandor", coefficient: 0.03 },
    ],
  },
  {
    id: "A.4.2.1.20",
    name: "Pemasangan Rangka Atap Baja Ringan",
    unit: "m2",
    coefficients: [
      { componentId: "baja_ringan_c", coefficient: 3.8 },
      { componentId: "reng_baja_ringan", coefficient: 4.5 },
      { componentId: "skrup_baja_ringan", coefficient: 15.0 },
      { componentId: "pekerja", coefficient: 0.25 },
      { componentId: "tukang_kayu", coefficient: 0.15 },
      { componentId: "kepala_tukang", coefficient: 0.015 },
      { componentId: "mandor", coefficient: 0.0125 },
    ],
  },
  {
    id: "A.4.5.1.19",
    name: "Pemasangan Penutup Atap Genteng Beton",
    unit: "m2",
    coefficients: [
      { componentId: "genteng_beton", coefficient: 11.0 },
      { componentId: "paku_biasa", coefficient: 0.04 },
      { componentId: "pekerja", coefficient: 0.15 },
      { componentId: "tukang_kayu", coefficient: 0.075 },
      { componentId: "kepala_tukang", coefficient: 0.008 },
      { componentId: "mandor", coefficient: 0.008 },
    ],
  },
  {
    id: "A.8.4.1.3",
    name: "Pemasangan Instalasi Titik Penerangan Listrik Kabel NYA",
    unit: "titik",
    coefficients: [
      { componentId: "kabel_nya", coefficient: 15.0 },
      { componentId: "pipa_conduit", coefficient: 4.0 },
      { componentId: "pekerja", coefficient: 0.3 },
      { componentId: "tukang_listrik", coefficient: 0.35 },
      { componentId: "kepala_tukang", coefficient: 0.035 },
      { componentId: "mandor", coefficient: 0.015 },
    ],
  },
  {
    id: "A.8.4.1.12",
    name: "Pemasangan Fitting Lampu Plafon",
    unit: "buah",
    coefficients: [
      { componentId: "fitting_lampu", coefficient: 1.0 },
      { componentId: "pekerja", coefficient: 0.05 },
      { componentId: "tukang_listrik", coefficient: 0.05 },
      { componentId: "kepala_tukang", coefficient: 0.005 },
      { componentId: "mandor", coefficient: 0.0025 },
    ],
  },
  {
    id: "A.8.4.1.20",
    name: "Pemasangan Stop Kontak atau Saklar Tunggal",
    unit: "buah",
    coefficients: [
      { componentId: "saklar_tunggal", coefficient: 1.0 },
      { componentId: "pipa_conduit", coefficient: 1.0 },
      { componentId: "pekerja", coefficient: 0.1 },
      { componentId: "tukang_listrik", coefficient: 0.1 },
      { componentId: "kepala_tukang", coefficient: 0.01 },
      { componentId: "mandor", coefficient: 0.005 },
    ],
  },
  {
    id: "A.5.1.1.2",
    name: "Pemasangan Pipa Air Bersih PVC AW dia. 1/2\"",
    unit: "meter",
    coefficients: [
      { componentId: "pipa_pvc_12", coefficient: 0.3 }, // 1 batang = 4 meter, so 0.3 batang is ~1.2 meter to include wastage
      { componentId: "pekerja", coefficient: 0.054 },
      { componentId: "tukang_pipa", coefficient: 0.09 },
      { componentId: "kepala_tukang", coefficient: 0.009 },
      { componentId: "mandor", coefficient: 0.0027 },
    ],
  },
  {
    id: "A.5.1.1.19",
    name: "Pemasangan Kran Air Kuningan dia. 1/2\"",
    unit: "buah",
    coefficients: [
      { componentId: "kran_air", coefficient: 1.0 },
      { componentId: "pekerja", coefficient: 0.01 },
      { componentId: "tukang_pipa", coefficient: 0.015 },
      { componentId: "kepala_tukang", coefficient: 0.0015 },
      { componentId: "mandor", coefficient: 0.0005 },
    ],
  },
];

// Helper functions
export function getComponentPrice(
  componentId: string,
  projectPrices: Record<string, number>,
  allComponents: Component[] = DEFAULT_COMPONENTS
): number {
  if (projectPrices[componentId] !== undefined) {
    return projectPrices[componentId];
  }
  const comp = allComponents.find((c) => c.id === componentId);
  return comp ? comp.defaultPrice : 0;
}

export function calculateAHSPItemUnitPrice(
  item: AHSPItem,
  projectPrices: Record<string, number>,
  allComponents: Component[] = DEFAULT_COMPONENTS
): number {
  return item.coefficients.reduce((sum, coef) => {
    const price = getComponentPrice(coef.componentId, projectPrices, allComponents);
    return sum + price * coef.coefficient;
  }, 0);
}

export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}
