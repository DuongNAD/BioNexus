import { describe, it, expect } from 'vitest';
import { SEED_SPECIES } from '@/mocks/data/species';
import { SEED_PRODUCTS } from '@/mocks/data/products';
import { normalizeSearchString } from '@/components/navigation/QuickSearch';

describe('Species Filter Logic', () => {
  it('UT-SPE-01: Trạng thái ban đầu có đủ 9 loài sinh vật chuẩn seed data', () => {
    expect(SEED_SPECIES).toHaveLength(9);
  });

  it('UT-SPE-02: Lọc theo mức bảo tồn IUCN === VU trả về đúng 3 loài', () => {
    const vuSpecies = SEED_SPECIES.filter((s) => s.conservationStatus === 'VU');
    expect(vuSpecies).toHaveLength(3);

    const scientificNames = vuSpecies.map((s) => s.scientificName);
    expect(scientificNames).toContain('Dionaea muscipula'); // Cây bắt ruồi Venus
    expect(scientificNames).toContain('Python bivittatus'); // Trăn đất
    expect(scientificNames).toContain('Testudo hermanni'); // Rùa Hermann
  });

  it('UT-SPE-03: Lọc theo mức bảo tồn IUCN === CR trả về đúng 1 loài', () => {
    const crSpecies = SEED_SPECIES.filter((s) => s.conservationStatus === 'CR');
    expect(crSpecies).toHaveLength(1);
    expect(crSpecies[0]?.scientificName).toBe('Ambystoma mexicanum');
  });

  it('UT-SPE-04: Tìm kiếm từ khóa "gecko" khớp chính xác loài ID 4 và 2 sản phẩm', () => {
    const q = normalizeSearchString('gecko');

    const matchedSpecies = SEED_SPECIES.filter((s) => {
      return (
        normalizeSearchString(s.scientificName).includes(q) ||
        normalizeSearchString(s.commonName).includes(q)
      );
    });

    expect(matchedSpecies).toHaveLength(1);
    expect(matchedSpecies[0]?.id).toBe(4); // Eublepharis macularius

    const matchedProducts = SEED_PRODUCTS.filter((p) => {
      return (
        p.status === 'APPROVED' &&
        (normalizeSearchString(p.productName).includes(q) ||
          normalizeSearchString(p.description).includes(q))
      );
    });

    expect(matchedProducts).toHaveLength(2);
    expect(matchedProducts.map((p) => p.id)).toEqual([1, 2]);
  });

  it('UT-SPE-05: Tìm kiếm tiếng Việt không dấu khớp chuẩn xác', () => {
    // 1. "tran dat"
    const q1 = normalizeSearchString('tran dat');
    const matched1 = SEED_SPECIES.filter((s) => normalizeSearchString(s.commonName).includes(q1));
    expect(matched1).toHaveLength(1);
    expect(matched1[0]?.scientificName).toBe('Python bivittatus');

    // 2. "rua"
    const q2 = normalizeSearchString('rua');
    const matched2 = SEED_SPECIES.filter((s) => normalizeSearchString(s.commonName).includes(q2));
    expect(matched2).toHaveLength(1);
    expect(matched2[0]?.scientificName).toBe('Testudo hermanni');

    // 3. "nap am"
    const q3 = normalizeSearchString('nap am');
    const matched3 = SEED_SPECIES.filter((s) => normalizeSearchString(s.commonName).includes(q3));
    expect(matched3).toHaveLength(2);
    expect(matched3.map((s) => s.scientificName)).toEqual(['Nepenthes rajah', 'Nepenthes ampullaria']);
  });

  it('UT-SPE-06: Bộ lọc kết hợp nodeId: 20 (Chi Python) + IUCN: VU', () => {
    const combined = SEED_SPECIES.filter(
      (s) => s.nodeId === 20 && s.conservationStatus === 'VU'
    );
    expect(combined).toHaveLength(1);
    expect(combined[0]?.scientificName).toBe('Python bivittatus');
  });
});
