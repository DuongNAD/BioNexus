import type { ParsedEnvironmentSpecs, ConservationStatus } from '@/types/api';
export type { ParsedEnvironmentSpecs };


export const IUCN_RATINGS: readonly ConservationStatus[] = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'] as const;

export const IUCN_COLORS: Record<ConservationStatus, string> = {
  LC: '#48c774',
  NT: '#29b6f6',
  VU: '#ffdd57',
  EN: '#ff9800',
  CR: '#f14668',
  EW: '#363636',
  EX: '#000000',
};

/**
 * Phân tích chuỗi đặc tả môi trường sống sinh học (nhiệt độ, độ ẩm, điểm sưởi, nhiệt độ nước).
 * Tương thích 100% với 9 chuỗi môi trường trong seed_data.sql.
 */
export function parseEnvironmentSpecs(s: string): ParsedEnvironmentSpecs {
  const result: ParsedEnvironmentSpecs = {
    tempMin: null,
    tempMax: null,
    raw: s,
  };

  if (!s || s.trim().length === 0) return result;

  // Nhiệt độ nước (Water temperature)
  const waterMatch = s.match(/Nhiệt độ nước:\s*(\d+)-(\d+)°C/i);
  if (waterMatch) {
    result.waterTempMin = parseInt(waterMatch[1]!, 10);
    result.waterTempMax = parseInt(waterMatch[2]!, 10);
    result.tempMin = result.waterTempMin;
    result.tempMax = result.waterTempMax;
  }

  // Nhiệt độ không khí chung (General air temperature)
  const tempMatch = s.match(/Nhiệt độ:\s*(?:ngày\s*)?(\d+)-(\d+)°C/i);
  if (tempMatch && result.tempMin === null) {
    result.tempMin = parseInt(tempMatch[1]!, 10);
    result.tempMax = parseInt(tempMatch[2]!, 10);
  }

  // Điểm sưởi (Basking temperature) - hỗ trợ cả dải 32-34°C và số đơn lẻ 35°C
  const baskMatch = s.match(/điểm sưởi\s*(\d+)(?:-(\d+))?°C/i);
  if (baskMatch) {
    result.baskMin = parseInt(baskMatch[1]!, 10);
    result.baskMax = baskMatch[2] ? parseInt(baskMatch[2]!, 10) : result.baskMin;
  }

  // Độ ẩm (Humidity)
  const humidMatch = s.match(/Độ ẩm:\s*(\d+)-(\d+)%/i);
  if (humidMatch) {
    result.humidMin = parseInt(humidMatch[1]!, 10);
    result.humidMax = parseInt(humidMatch[2]!, 10);
  }

  return result;
}

/**
 * Kiểm tra định dạng mã đơn hàng: ORD-YYYY-<4 đến 8 ký tự alphanumeric>
 * Ví dụ: ORD-2026-0001, ORD-2026-A1B2C3
 */
export function isValidOrderCode(code: string): boolean {
  return /^ORD-\d{4}-[A-Za-z0-9]{4,8}$/.test(code);
}

/**
 * Định dạng tiền tệ VND: ví dụ 1.200.000 ₫
 */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}
