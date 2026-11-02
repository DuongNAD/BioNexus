/**
 * src/lib/env.ts
 * Quản lý biến môi trường dự án BioNexus.
 * Theo quy ước: .gitignore bỏ qua mọi file .env.*,
 * nên USE_MOCKS tự động bật ở chế độ dev và tắt ở chế độ build production nếu không có config khác.
 */
export const USE_MOCKS: boolean =
  import.meta.env.VITE_USE_MOCKS != null
    ? import.meta.env.VITE_USE_MOCKS === 'true'
    : import.meta.env.DEV;

export const MOCK_LATENCY: number = Number(import.meta.env.VITE_MOCK_LATENCY ?? 350);

export const API_BASE: string = import.meta.env.VITE_API_BASE ?? 'api/';
