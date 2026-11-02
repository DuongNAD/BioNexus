/**
 * src/lib/motion.ts
 * Token chuyển động chuẩn dự án BioNexus (theo docs/frontend/02-he-thong-thiet-ke.md mục 6)
 */
export const dur = {
  fast: 0.15,   // Hover, focus
  base: 0.25,   // Mở menu, đổi tab
  slow: 0.45,   // Panel, thẻ đổi nội dung
  scene: 0.85,  // Chữ hero, ảnh lộ dần
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,       // Mặc định mượt mà
  inOut: [0.76, 0, 0.24, 1] as const,    // Chuyển cảnh lớn, che hoặc mở ảnh
} as const;

export const spring = {
  ui: { stiffness: 380, damping: 32 },   // layoutId (nav pill, tab, danh sách)
  soft: { stiffness: 160, damping: 18 }, // Thẻ nảy nhẹ khi hover
} as const;
