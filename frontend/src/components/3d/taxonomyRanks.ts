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
  { level: 1, rankEn: 'Phylum', rankVi: 'Ngành', name: 'Chordata · Tracheophyta', desc: 'Ngành Dây sống và Ngành Thực vật có mạch' },
  { level: 2, rankEn: 'Class', rankVi: 'Lớp', name: 'Reptilia · Amphibia · Magnoliopsida', desc: 'Lớp Bò sát, Lớp Lưỡng cư và Lớp Hai lá mầm' },
  { level: 3, rankEn: 'Order', rankVi: 'Bộ', name: 'Squamata · Testudines · Caudata · Caryophyllales', desc: 'Bộ Có vảy, Bộ Rùa, Bộ Có đuôi và Bộ Cẩm chướng' },
  { level: 4, rankEn: 'Family', rankVi: 'Họ', name: 'Pythonidae · Agamidae · Nepenthaceae…', desc: '7 họ: Trăn, Nhông, Eublepharidae, Rùa núi, Ambystomatidae, Nắp ấm, Gọng vó' },
  { level: 5, rankEn: 'Genus', rankVi: 'Chi', name: 'Python · Pogona · Ambystoma · Nepenthes…', desc: '7 chi chứa 9 loài sinh vật cảnh của BioNexus' },
];

/** Chuỗi xoắn có nhiều bậc thang hơn số cấp: chia đều các bậc thang cho 6 cấp từ trên xuống */
export function rankIndexForRung(rung: number, rungCount: number): number {
  if (rungCount <= 1) return 0;
  const clamped = Math.min(Math.max(rung, 0), rungCount - 1);
  return Math.min(TAXONOMIC_RANKS.length - 1, Math.floor((clamped * TAXONOMIC_RANKS.length) / rungCount));
}
