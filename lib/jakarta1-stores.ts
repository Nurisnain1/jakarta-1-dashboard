// Canonical Jakarta 1 store identity mapping reused from the existing Jakarta 1 dashboard.
// Keep staff identity separate from store identity.
export const JAKARTA1_STORE_CODES = ["M117","M118","M124","M127","M217","M227","M238","M255","M264"] as const;

export const JAKARTA1_STORE_NAMES: Record<string,string> = {
  M117: "DIGIMAP PLAZA SENAYAN",
  M118: "Digimap Pondok Indah Mall 3",
  M124: "DIGIMAP PACIFICPLACE",
  M127: "DIGIMAP APP Lotte Avenue",
  M217: "DIGIMAP BLOK - M PLAZA",
  M227: "Digimap Aeon Tanjung Barat",
  M238: "Digimap AAR Pondok Indah Mall 2",
  M255: "Digimap Antasari Place",
  M264: "Digimap Plaza Semanggi",
};

export const JAKARTA1_STORES = JAKARTA1_STORE_CODES.map(code => ({
  code,
  name: JAKARTA1_STORE_NAMES[code] || code,
}));
