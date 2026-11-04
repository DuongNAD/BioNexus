// Dữ liệu 6 cấp phân loại dùng cho chuỗi xoắn trang chủ.
// Tách khỏi HelixScene để trang dùng dữ liệu này không phải tải kèm three.js.
// Tên khoa học lấy đúng các nút trong database/seed_data.sql.

export interface TaxonomicRankStep {
  level: number;
  rankEn: 'Kingdom' | 'Phylum' | 'Class' | 'Order' | 'Family' | 'Genus';
  rankVi: string;
  name: string;
  desc: string;
}

export const TAXONOMIC_RANKS: TaxonomicRankStep[] = [
  { level: 0, rankEn: 'Kingdom', rankVi: 'Giới', name: 'Animalia · Plantae', desc: 'Giới Động vật và Giới Thực vật, hai gốc của cây phân loại BioNexus' },
  { level: 1, rankEn: 'Phylum', rankVi: 'Ngành', name: 'Chordata · Arthropoda · Mollusca · Tracheophyta', desc: 'Ngành Dây sống, Chân khớp, Thân mềm và Thực vật có mạch' },
  { level: 2, rankEn: 'Class', rankVi: 'Lớp', name: 'Reptilia · Aves · Actinopterygii · Magnoliopsida…', desc: 'Từ bò sát, chim, cá vây tia tới thực vật hai lá mầm' },
  { level: 3, rankEn: 'Order', rankVi: 'Bộ', name: 'Squamata · Testudines · Anura · Caryophyllales…', desc: 'Gần 50 bộ, mỗi bộ gom các họ có chung tổ tiên' },
  { level: 4, rankEn: 'Family', rankVi: 'Họ', name: 'Pythonidae · Agamidae · Nepenthaceae · Orchidaceae…', desc: 'Hơn 100 họ, từ Trăn, Nhông tới Nắp ấm và Lan' },
  { level: 5, rankEn: 'Genus', rankVi: 'Chi', name: 'Python · Pogona · Ambystoma · Nepenthes…', desc: 'Hơn 300 chi chứa hơn 600 loài trong bách khoa BioNexus' },
];

/** Chuỗi xoắn có nhiều bậc thang hơn số cấp: chia đều các bậc thang cho 6 cấp từ trên xuống */
export function rankIndexForRung(rung: number, rungCount: number): number {
  if (rungCount <= 1) return 0;
  const clamped = Math.min(Math.max(rung, 0), rungCount - 1);
  return Math.min(TAXONOMIC_RANKS.length - 1, Math.floor((clamped * TAXONOMIC_RANKS.length) / rungCount));
}
