import { describe, it, expect } from 'vitest';
import { normalizePage } from '../normalize';

describe('normalizePage', () => {
  it('xử lý null và undefined trả về cấu trúc Page chuẩn rỗng', () => {
    const result = normalizePage(null);
    expect(result).toEqual({
      items: [],
      page: 1,
      size: 12,
      total: 0,
    });
  });

  it('chuẩn hóa mảng phẳng T[] thành Page<T>', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const result = normalizePage(arr);
    expect(result.items).toEqual(arr);
    expect(result.page).toBe(1);
    expect(result.size).toBe(3);
    expect(result.total).toBe(3);
  });

  it('bảo toàn cấu trúc Page<T> hợp lệ', () => {
    const pageObj = {
      items: [{ id: 1 }, { id: 2 }],
      page: 2,
      size: 10,
      total: 12,
    };
    const result = normalizePage(pageObj);
    expect(result).toEqual(pageObj);
  });

  it('tự bù giá trị mặc định cho Page có trường thiếu sót', () => {
    const partialPage = {
      items: [{ id: 1 }],
    } as any;
    const result = normalizePage(partialPage);
    expect(result.page).toBe(1);
    expect(result.size).toBe(12);
    expect(result.total).toBe(1);
  });
});
