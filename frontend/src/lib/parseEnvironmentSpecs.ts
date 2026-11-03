import type { ParsedEnvironmentSpecs, ConservationStatus } from '@/types/api';
export type { ParsedEnvironmentSpecs };


export const IUCN_RATINGS: readonly ConservationStatus[] = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'] as const;

// Khớp token --iucn-* (tài liệu 02 mục 2): huy hiệu và thang IUCN phải cùng một màu
export const IUCN_COLORS: Record<ConservationStatus, string> = {
  LC: '#60c659',
  NT: '#cce226',
  VU: '#f9e814',
  EN: '#fc7f3f',
  CR: '#d81e05',
  EW: '#542344',
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
  // Chuỗi gõ tay có thể ở dạng NFD (dấu tách rời): chuẩn hóa để regex có dấu khớp được
  s = s.normalize('NFC');

  // Môi trường sống: phần sau "Môi trường:" (tài liệu 04 mục 7)
  const habitatMatch = s.match(/Môi trường:\s*(.+)$/i);
  if (habitatMatch) {
    result.habitat = habitatMatch[1]!.trim();
  }

  // Nhiệt độ ban đêm, ví dụ "ngày 18-26°C, đêm 10-15°C"
  const nightMatch = s.match(/đêm\s*(\d+)-(\d+)°C/i);
  if (nightMatch) {
    result.nightTempMin = parseInt(nightMatch[1]!, 10);
    result.nightTempMax = parseInt(nightMatch[2]!, 10);
  }

  // "Độ ẩm: không áp dụng" (loài thủy sinh) khác với chuỗi không đọc được
  if (/Độ ẩm:\s*không áp dụng/i.test(s)) {
    result.humidityNotApplicable = true;
  }

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
