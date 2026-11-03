import { describe, it, expect } from 'vitest';
import { getHelixPoint, TAXONOMIC_RANKS, HELIX_LEVELS } from '../HelixScene';
import { rankIndexForRung } from '../taxonomyRanks';
import {
  latLngToVector3,
  DEFAULT_SPECIES_BIOMARKERS,
  VIETNAM_BREEDING_HUBS,
  IUCN_MARKER_COLORS,
} from '../BioEarth/coordinates';

describe('3D Hình học & Dữ liệu Sinh học Milestone 3', () => {
  describe('HelixScene Taxonomic Ranks & Geometry', () => {
    it('chứa đúng 6 cấp phân loại của BioNexus từ Giới đến Chi', () => {
      expect(TAXONOMIC_RANKS).toHaveLength(6);
      expect(TAXONOMIC_RANKS[0]?.rankVi).toBe('Giới');
      expect(TAXONOMIC_RANKS[5]?.rankVi).toBe('Chi');
      TAXONOMIC_RANKS.forEach((rank, idx) => {
        expect(rank.level).toBe(idx);
        expect(rank.name).toBeDefined();
        expect(rank.desc).toBeDefined();
      });
    });

    it('chia đều các bậc thang của chuỗi xoắn cho 6 cấp, từ Giới ở đỉnh tới Chi ở đáy', () => {
      expect(rankIndexForRung(0, HELIX_LEVELS)).toBe(0);
      expect(rankIndexForRung(HELIX_LEVELS - 1, HELIX_LEVELS)).toBe(5);
      let prev = 0;
      for (let k = 0; k < HELIX_LEVELS; k++) {
        const idx = rankIndexForRung(k, HELIX_LEVELS);
        expect(idx).toBeGreaterThanOrEqual(prev);
        prev = idx;
      }
    });

    it('hàm getHelixPoint() tính toán toạ độ không gian hợp lệ, không chứa NaN hay Infinity', () => {
      for (let k = 0; k < 14; k++) {
        const [x0, y0, z0] = getHelixPoint(k, 0, 3.3);
        const [x1, y1, z1] = getHelixPoint(k, 1, 3.3);

        expect(Number.isFinite(x0)).toBe(true);
        expect(Number.isFinite(y0)).toBe(true);
        expect(Number.isFinite(z0)).toBe(true);

        expect(Number.isFinite(x1)).toBe(true);
        expect(Number.isFinite(y1)).toBe(true);
        expect(Number.isFinite(z1)).toBe(true);

        // Bán kính mặt phẳng XZ phải xấp xỉ bán kính r
        const radius0 = Math.hypot(x0, z0);
        const radius1 = Math.hypot(x1, z1);
        expect(radius0).toBeCloseTo(3.3, 2);
        expect(radius1).toBeCloseTo(3.3, 2);

        // Hai sợi lệch pha 180 độ (vectơ đối xứng nhau qua trục Y)
        expect(x0).toBeCloseTo(-x1, 2);
        expect(z0).toBeCloseTo(-z1, 2);
        expect(y0).toBeCloseTo(y1, 2);
      }
    });

    it('bán kính ngoài Outward Offset (R + 0.75 = 4.05) cách biệt an toàn chống cắt xuyên thẻ', () => {
      const [x, , z] = getHelixPoint(0, 0, 4.05);
      const outerRadius = Math.hypot(x, z);
      expect(outerRadius).toBeCloseTo(4.05, 2);
      expect(outerRadius).toBeGreaterThan(3.3);
    });
  });

  describe('BioEarth Coordinates & Geo Data', () => {
    it('hàm latLngToVector3() ánh xạ tọa độ địa lý sang mặt cầu Descartes với bán kính chuẩn xác', () => {
      const radius = 2.2;
      // Điểm Cực Bắc (lat: 90, lng: 0)
      const northPole = latLngToVector3(90, 0, radius);
      expect(northPole[0]).toBeCloseTo(0, 2);
      expect(northPole[1]).toBeCloseTo(radius, 2);
      expect(northPole[2]).toBeCloseTo(0, 2);

      // Điểm Xích Đạo (lat: 0, lng: 0)
      const equator = latLngToVector3(0, 0, radius);
      const dist = Math.hypot(equator[0], equator[1], equator[2]);
      expect(dist).toBeCloseTo(radius, 2);

      // Toạ độ TP.HCM (lat: 10.78, lng: 106.7)
      const sgn = latLngToVector3(10.78, 106.7, radius);
      expect(Math.hypot(sgn[0], sgn[1], sgn[2])).toBeCloseTo(radius, 2);
    });

    it('danh sách 9 loài sinh vật cảnh bản địa có đầy đủ thuộc tính và ảnh hợp lệ', () => {
      expect(DEFAULT_SPECIES_BIOMARKERS).toHaveLength(9);
      expect(new Set(DEFAULT_SPECIES_BIOMARKERS.map((m) => m.scientificName)).size).toBe(9);

      DEFAULT_SPECIES_BIOMARKERS.forEach((sp) => {
        // Marker nhận diện bằng scientificName, không gắn id DB
        expect(sp.speciesId).toBeUndefined();
        expect(sp.displayName).toBeDefined();
        expect(sp.scientificName).toBeDefined();
        expect(sp.origin.lat).toBeGreaterThanOrEqual(-90);
        expect(sp.origin.lat).toBeLessThanOrEqual(90);
        expect(sp.origin.lng).toBeGreaterThanOrEqual(-180);
        expect(sp.origin.lng).toBeLessThanOrEqual(180);
        expect(sp.heroPhoto).toMatch(/^photos\//);
        expect(['CR', 'EN', 'VU', 'NT', 'LC']).toContain(sp.conservationStatus);
      });
    });

    it('danh sách 3 trung tâm nhân giống Việt Nam phủ đủ 3 miền Bắc - Trung - Nam', () => {
      expect(VIETNAM_BREEDING_HUBS).toHaveLength(3);
      const hubIds = VIETNAM_BREEDING_HUBS.map((h) => h.id);
      expect(hubIds).toContain('HUB-SGN');
      expect(hubIds).toContain('HUB-DAD');
      expect(hubIds).toContain('HUB-HAN');

      VIETNAM_BREEDING_HUBS.forEach((hub) => {
        expect(hub.shopName).toBeDefined();
        expect(hub.city).toBeDefined();
        expect(hub.lat).toBeGreaterThan(0);
        expect(hub.lng).toBeGreaterThan(100);
      });
    });

    it('bảng màu IUCN_MARKER_COLORS định nghĩa chuẩn 5 mức bảo tồn', () => {
      expect(IUCN_MARKER_COLORS['CR']).toBe('#EF4444');
      expect(IUCN_MARKER_COLORS['EN']).toBe('#F97316');
      expect(IUCN_MARKER_COLORS['VU']).toBe('#F59E0B');
      expect(IUCN_MARKER_COLORS['NT']).toBe('#00D29E');
      expect(IUCN_MARKER_COLORS['LC']).toBe('#6EE7B7');
    });
  });
});
