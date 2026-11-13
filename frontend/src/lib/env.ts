/**
 * src/lib/env.ts
 * Quản lý biến môi trường dự án BioNexus.
 * Theo quy ước: .gitignore bỏ qua mọi file .env.*,
 * nên mặc định USE_MOCKS tắt (gọi backend thật qua proxy /api). Muốn dùng MSW thì đặt VITE_USE_MOCKS=true.
 */
export const USE_MOCKS: boolean = import.meta.env.VITE_USE_MOCKS === 'true';

export const MOCK_LATENCY: number = Number(import.meta.env.VITE_MOCK_LATENCY ?? 350);

export const API_BASE: string = import.meta.env.VITE_API_BASE ?? 'api/';
