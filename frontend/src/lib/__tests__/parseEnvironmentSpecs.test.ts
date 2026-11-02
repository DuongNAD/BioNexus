import { describe, it, expect } from 'vitest';
import {
  parseEnvironmentSpecs,
  isValidOrderCode,
  formatVnd,
  IUCN_RATINGS,
  IUCN_COLORS,
} from '../parseEnvironmentSpecs';

describe('parseEnvironmentSpecs', () => {
  it('xử lý chuỗi rỗng hoặc undefined', () => {
    expect(parseEnvironmentSpecs('')).toEqual({
      tempMin: null,
      tempMax: null,
      raw: '',
    });
  });

  it('phân tích thông số của Axolotl (thủy sinh)', () => {
    const raw = 'Nhiệt độ nước: 14-18°C, pH: 7.4-7.6, Môi trường: Nước ngọt hoàn toàn, lọc yếu, không nền sỏi nhỏ';
    const parsed = parseEnvironmentSpecs(raw);
    expect(parsed.waterTempMin).toBe(14);
    expect(parsed.waterTempMax).toBe(18);
    expect(parsed.tempMin).toBe(14);
    expect(parsed.tempMax).toBe(18);
  });

  it('phân tích thông số của Nắp ấm Rajah (ngày/đêm)', () => {
    const raw = 'Nhiệt độ: ngày 20-25°C, đêm 10-15°C, Độ ẩm: 75-90%, Ánh sáng: tán xạ mạnh, Giá thể: dớn + perlite thoát nước';
    const parsed = parseEnvironmentSpecs(raw);
    expect(parsed.tempMin).toBe(20);
    expect(parsed.tempMax).toBe(25);
    expect(parsed.humidMin).toBe(75);
    expect(parsed.humidMax).toBe(90);
  });

  it('phân tích thông số của Trăn bóng (có điểm sưởi)', () => {
    const raw = 'Nhiệt độ: 26-32°C (điểm sưởi 32-34°C), Độ ẩm: 55-65%, Chuồng: hộp chuyên dụng có hang trú hai đầu';
    const parsed = parseEnvironmentSpecs(raw);
    expect(parsed.tempMin).toBe(26);
    expect(parsed.tempMax).toBe(32);
    expect(parsed.baskMin).toBe(32);
    expect(parsed.baskMax).toBe(34);
    expect(parsed.humidMin).toBe(55);
    expect(parsed.humidMax).toBe(65);
  });

  it('phân tích thông số của Thằn lằn da báo (Leopard Gecko)', () => {
    const raw = 'Nhiệt độ: 24-30°C (điểm sưởi 31-33°C), Độ ẩm: 30-40% (hang ẩm 70-80%), Giá thể: giấy báo hoặc thảm chuyên dụng';
    const parsed = parseEnvironmentSpecs(raw);
    expect(parsed.tempMin).toBe(24);
    expect(parsed.tempMax).toBe(30);
    expect(parsed.baskMin).toBe(31);
    expect(parsed.baskMax).toBe(33);
    expect(parsed.humidMin).toBe(30);
    expect(parsed.humidMax).toBe(40);
  });

  it('phân tích thông số của Cây bắt ruồi Venus (Venus Flytrap)', () => {
    const raw = 'Nhiệt độ: 21-35°C (ngủ đông 5-10°C), Độ ẩm: 50-70%, Ánh sáng: nắng trực tiếp ≥4h, Nước: thẩm thấu ngược hoặc nước mưa';
    const parsed = parseEnvironmentSpecs(raw);
    expect(parsed.tempMin).toBe(21);
    expect(parsed.tempMax).toBe(35);
    expect(parsed.humidMin).toBe(50);
    expect(parsed.humidMax).toBe(70);
  });

  it('phân tích thông số của Trăn đất (điểm sưởi đơn 35°C)', () => {
    const raw = 'Nhiệt độ: 26-32°C (điểm sưởi 35°C), Độ ẩm: 60-75%, Chuồng: chuồng cỡ lớn kiên cố, khay nước đủ ngâm toàn thân';
    const parsed = parseEnvironmentSpecs(raw);
    expect(parsed.tempMin).toBe(26);
    expect(parsed.tempMax).toBe(32);
    expect(parsed.baskMin).toBe(35);
    expect(parsed.baskMax).toBe(35);
    expect(parsed.humidMin).toBe(60);
    expect(parsed.humidMax).toBe(75);
  });

  it('phân tích thông số của Rùa Hermann (Địa Trung Hải)', () => {
    const raw = 'Nhiệt độ: 22-28°C (điểm sưởi 32-35°C), Độ ẩm: 50-65%, Đèn: UVB 10.0, Chế độ ăn: 100% thảo mộc giàu canxi, xơ cao';
    const parsed = parseEnvironmentSpecs(raw);
    expect(parsed.tempMin).toBe(22);
    expect(parsed.tempMax).toBe(28);
    expect(parsed.baskMin).toBe(32);
    expect(parsed.baskMax).toBe(35);
    expect(parsed.humidMin).toBe(50);
    expect(parsed.humidMax).toBe(65);
  });

  it('phân tích thông số của Rồng Úc (điểm sưởi cao)', () => {
    const raw = 'Nhiệt độ: 24-29°C (điểm sưởi 38-42°C, đêm >18°C), Độ ẩm: 30-40%, Đèn: bắt buộc UVB 10.0 hoặc 12-14%';
    const parsed = parseEnvironmentSpecs(raw);
    expect(parsed.tempMin).toBe(24);
    expect(parsed.tempMax).toBe(29);
    expect(parsed.baskMin).toBe(38);
    expect(parsed.baskMax).toBe(42);
    expect(parsed.humidMin).toBe(30);
    expect(parsed.humidMax).toBe(40);
  });

  it('phân tích thông số của Nắp ấm bình ba màu (Ampullaria)', () => {
    const raw = 'Nhiệt độ: ngày 28-34°C, đêm 20-24°C, Độ ẩm: 80-95%, Ánh sáng: tán xạ trung bình, Môi trường: đầm lầy thấp râm mát';
    const parsed = parseEnvironmentSpecs(raw);
    expect(parsed.tempMin).toBe(28);
    expect(parsed.tempMax).toBe(34);
    expect(parsed.humidMin).toBe(80);
    expect(parsed.humidMax).toBe(95);
  });
});

describe('isValidOrderCode', () => {
  it('xác thực đúng định dạng ORD-YYYY-XXXX', () => {
    expect(isValidOrderCode('ORD-2026-0001')).toBe(true);
    expect(isValidOrderCode('ORD-2026-A1B2C3')).toBe(true);
    expect(isValidOrderCode('ORD-2026-999999')).toBe(true);
  });

  it('từ chối mã sai định dạng', () => {
    expect(isValidOrderCode('ORD-26-0001')).toBe(false);
    expect(isValidOrderCode('INV-2026-0001')).toBe(false);
    expect(isValidOrderCode('ORD-2026-')).toBe(false);
    expect(isValidOrderCode('')).toBe(false);
  });
});

describe('formatVnd', () => {
  it('định dạng tiền tệ tiếng Việt đúng quy chuẩn', () => {
    const formatted = formatVnd(1200000);
    expect(formatted).toContain('1.200.000');
    expect(formatted).toContain('₫');
  });
});

describe('IUCN Metadata', () => {
  it('chứa đủ 7 mức bảo tồn', () => {
    expect(IUCN_RATINGS).toHaveLength(7);
    expect(Object.keys(IUCN_COLORS)).toHaveLength(7);
  });
});
