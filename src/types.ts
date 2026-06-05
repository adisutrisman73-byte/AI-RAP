export interface Component {
  id: string; // unique ID like 'semen', 'pasir', 'pekerja'
  name: string;
  category: "bahan" | "tenaga" | "alat";
  unit: string; // kg, m3, buah, OH, sewa-hari
  defaultPrice: number;
}

export interface AHSPCoefficient {
  componentId: string;
  coefficient: number; // e.g., 6.24 kg semen
}

export interface AHSPItem {
  id: string; // Code of work (e.g. 'A.4.4.2.4')
  name: string; // Item name (e.g. 'Plesteran Dinding 1:4 Tebal 15mm')
  unit: string; // m3, m2, m', kg, buah, ls
  coefficients: AHSPCoefficient[];
  isCustom?: boolean;
}

export interface RABItem {
  id: string; // Unique instance ID
  ahspId: string; // Reference to AHSPItem.id
  sectionId: string; // Reference to Section.id
  name: string; // Can be customized from standard name
  volume: number; // e.g. 15.5 m2
}

export interface Section {
  id: string;
  name: string; // Grouping like "Pekerjaan Pondasi", "Pekerjaan Dinding"
}

export interface Project {
  id: string;
  name: string;
  description: string;
  sections: Section[];
  items: RABItem[];
  componentPrices: Record<string, number>; // Project-specific pricing overrides
  createdAt: string;
}

export interface ProjectHistoryItem {
  id: string;
  name: string;
  createdAt: string;
}
