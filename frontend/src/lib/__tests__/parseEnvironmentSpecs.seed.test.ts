import { describe, it, expect } from 'vitest';
import { SEED_SPECIES } from '@/mocks/data/species';
import { parseEnvironmentSpecs } from '../parseEnvironmentSpecs';

// Tài liệu 04 mục 7: bộ phân tích phải đọc đúng cả 9 chuỗi environmentSpecs trong seed_data.sql
const EXPECTED: Record<string, { tempMin: number; tempMax: number; humid?: [number, number]; bask?: [number, number] }> = {
  'Eublepharis macularius': { tempMin: 26, tempMax: 32, humid: [30, 40] },
  'Pogona vitticeps': { tempMin: 26, tempMax: 32, humid: [30, 40], bask: [38, 42] },
  'Python regius': { tempMin: 26, tempMax: 32, humid: [50, 60] },
  'Python bivittatus': { tempMin: 26, tempMax: 32, humid: [60, 80] },
  'Testudo hermanni': { tempMin: 20, tempMax: 30, humid: [40, 60], bask: [32, 35] },
  'Ambystoma mexicanum': { tempMin: 14, tempMax: 18 },
  'Nepenthes rajah': { tempMin: 18, tempMax: 26, humid: [80, 95] },
  'Nepenthes ampullaria': { tempMin: 22, tempMax: 32, humid: [70, 90] },
  'Dionaea muscipula': { tempMin: 20, tempMax: 30, humid: [50, 70] },
};

describe('parseEnvironmentSpecs với 9 chuỗi seed', () => {
  it('có đủ 9 loài để kiểm', () => {
    expect(SEED_SPECIES).toHaveLength(9);
  });

  for (const species of SEED_SPECIES) {
    it(`đọc đúng ${species.scientificName}`, () => {
      const expected = EXPECTED[species.scientificName]!;
      const parsed = parseEnvironmentSpecs(species.environmentSpecs);
      expect(parsed.tempMin).toBe(expected.tempMin);
      expect(parsed.tempMax).toBe(expected.tempMax);
      if (expected.humid) {
        expect([parsed.humidMin, parsed.humidMax]).toEqual(expected.humid);
      }
      if (expected.bask) {
        expect([parsed.baskMin, parsed.baskMax]).toEqual(expected.bask);
      }
      expect(parsed.habitat).toBeTruthy();
    });
  }

  it('phân biệt "không áp dụng" và nhiệt độ ban đêm', () => {
    const axolotl = SEED_SPECIES.find((s) => s.scientificName === 'Ambystoma mexicanum')!;
    expect(parseEnvironmentSpecs(axolotl.environmentSpecs).humidityNotApplicable).toBe(true);

    const rajah = SEED_SPECIES.find((s) => s.scientificName === 'Nepenthes rajah')!;
    const parsed = parseEnvironmentSpecs(rajah.environmentSpecs);
    expect([parsed.nightTempMin, parsed.nightTempMax]).toEqual([10, 15]);
    expect(parsed.habitat).toBe('Rừng mây núi cao (khoảng 1.500-2.650 m)');
  });
});
