import { describe, expect, it, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { distanceKm, fmtLL, mrz } from '@/lib/geo';
import {
  CHAPTERS,
  JOURNEY_CREDITS,
  JOURNEY_SPECIES_BASE,
  LEG,
  resolveJourneySpecies,
} from '@/content/journey';
import { SEED_SPECIES } from '@/mocks/data/species';
import {
  PASSPORT_STORAGE_KEY,
  PassportProvider,
  readPassportMap,
  usePassport,
} from '@/hooks/usePassport';
import {
  KINSHIP_DISCLAIMER,
  buildKinshipCaptions,
  buildKinshipTree,
  findCommonAncestor,
  formatKinshipCaption,
} from '@/pages/journey/KinshipSection';

describe('Hành trình 9 loài · Toán học địa lý & MRZ (geo.ts)', () => {
  it('distanceKm([20.32, 105.61], [11.42, 107.43]) trả số km hợp lý làm tròn đến 10 km', () => {
    const km = distanceKm([20.32, 105.61], [11.42, 107.43]);
    expect(km % 10).toBe(0);
    expect(km).toBeGreaterThanOrEqual(950);
    expect(km).toBeLessThanOrEqual(1050);
  });

  it('fmtLL định dạng đúng độ-phút và hướng B/N/Đ/T', () => {
    expect(fmtLL(20.32, 105.61)).toBe('20°19′B  105°37′Đ');
    expect(fmtLL(-25, 134)).toBe('25°00′N  134°00′Đ');
    expect(fmtLL(34.2, -77.9)).toBe('34°12′B  77°54′T');
  });

  it('mrz("Lê Văn C") trả đúng chuỗi 36 ký tự bắt đầu bằng P<BNX<LE<<VAN<<C<', () => {
    const line = mrz('Lê Văn C');
    expect(line).toHaveLength(36);
    expect(line.startsWith('P<BNX<LE<<VAN<<C<')).toBe(true);
    expect(line).toBe('P<BNX<LE<<VAN<<C<<<<<<<<<<<<<<<<<<<<');
  });
});

describe('Hành trình 9 loài · Cấu hình lộ trình & bản quyền ảnh (journey.ts)', () => {
  it('đủ 9 trạm có slug khớp đúng 9 loài trong seed_data', () => {
    const stationLegs = Object.entries(LEG).filter(([k]) => k.startsWith('tram-'));
    expect(stationLegs).toHaveLength(9);

    const seedSciNames = new Set(SEED_SPECIES.map((s) => s.scientificName));
    for (const [, leg] of stationLegs) {
      expect(leg.slug).toBeTruthy();
      const resolved = resolveJourneySpecies(leg.slug!, SEED_SPECIES);
      expect(seedSciNames.has(resolved.sci)).toBe(true);
    }

    const allChapterStations = CHAPTERS.flatMap((c) => c.stations);
    expect(allChapterStations).toEqual([
      'tram-1',
      'tram-2',
      'tram-3',
      'tram-4',
      'tram-5',
      'tram-6',
      'tram-7',
      'tram-8',
      'tram-9',
    ]);
  });

  it('mọi ảnh trong JOURNEY_CREDITS có source bắt đầu bằng https://commons.wikimedia.org/wiki/File:', () => {
    expect(JOURNEY_CREDITS.length).toBeGreaterThanOrEqual(28);
    for (const credit of JOURNEY_CREDITS) {
      expect(credit.source.startsWith('https://commons.wikimedia.org/wiki/File:')).toBe(true);
      expect(credit.author.length).toBeGreaterThan(0);
      expect(credit.license.length).toBeGreaterThan(0);
    }
  });
});

describe('Hành trình 9 loài · Hộ chiếu loài (usePassport)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('collect("burmese-python") lưu vào localStorage["bionexus.passport.v1"], gọi lặp không nhân đôi, đủ 9 loài có completedAt', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(PassportProvider, { initialWelcomeMode: false, children });

    const { result } = renderHook(() => usePassport(), { wrapper });

    act(() => {
      result.current.collect('burmese-python');
      result.current.collect('burmese-python');
    });

    expect(result.current.met).toEqual(['burmese-python']);
    const storedAfterOne = readPassportMap();
    expect(storedAfterOne.guest?.met).toEqual(['burmese-python']);
    expect(storedAfterOne.guest?.completedAt).toBeUndefined();

    const allNineSlugs = Object.keys(JOURNEY_SPECIES_BASE);
    expect(allNineSlugs).toHaveLength(9);

    act(() => {
      for (const slug of allNineSlugs) {
        result.current.collect(slug);
      }
    });

    expect(result.current.met).toHaveLength(9);
    const raw = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const storedFinal = readPassportMap();
    expect(storedFinal.guest?.met).toHaveLength(9);
    expect(storedFinal.guest?.completedAt).toBeTruthy();
  });

  it('không vỡ khi localStorage chứa JSON hỏng', () => {
    window.localStorage.setItem(PASSPORT_STORAGE_KEY, '{broken-json');
    expect(() => readPassportMap()).not.toThrow();
    expect(readPassportMap()).toEqual({});
  });
});

describe('Hành trình 9 loài · Cây họ hàng (KinshipSection)', () => {
  it('dựng đúng 9 lá; tổ tiên chung của nắp ấm và bắt ruồi Venus là Caryophyllales; câu giải thích sinh đúng cho nhánh 1 loài và nhiều loài', () => {
    const tree = buildKinshipTree(760);
    expect(tree.leaves).toHaveLength(9);

    const lca = findCommonAncestor(tree.byId, 'nepenthes-rajah', 'venus-flytrap');
    expect(lca?.id).toBe('Caryophyllales');
    expect(lca?.label).toBe('Bộ Cẩm chướng');

    const captions = buildKinshipCaptions(tree);
    expect(captions).toHaveLength(4);
    expect(captions[0]).toBe(
      'Cây bắt ruồi Venus, Nắp ấm Ampullaria và Nắp ấm Rajah cùng thuộc Bộ Cẩm chướng.'
    );
    expect(captions[1]).toBe('Trăn đất và Trăn bóng cùng thuộc Chi Trăn.');
    expect(captions[2]).toBe(
      'Rồng Úc, Thằn lằn da báo, Trăn đất và Trăn bóng cùng thuộc Bộ Có vảy.'
    );
    expect(captions[3]).toBe('Axolotl là loài duy nhất thuộc Lớp Lưỡng cư trong chín loài.');

    expect(formatKinshipCaption('Lớp Lưỡng cư', ['Axolotl'])).toBe(
      'Axolotl là loài duy nhất thuộc Lớp Lưỡng cư trong chín loài.'
    );
    expect(KINSHIP_DISCLAIMER).toBe(
      'Đây là họ hàng theo phân loại, không phải lịch sử tiến hóa.'
    );
  });
});
