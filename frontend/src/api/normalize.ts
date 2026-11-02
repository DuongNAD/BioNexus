import type { Page } from '@/types/api';

/**
 * Chuẩn hóa kết quả danh sách phân trang:
 * Tương thích linh hoạt với cả mảng phẳng `T[]` (như khi API trả về trực tiếp mảng)
 * lẫn đối tượng phân trang `Page<T>`.
 */
export function normalizePage<T>(data: Page<T> | T[] | null | undefined): Page<T> {
  if (!data) {
    return {
      items: [],
      page: 1,
      size: 12,
      total: 0,
    };
  }

  if (Array.isArray(data)) {
    return {
      items: data,
      page: 1,
      size: data.length || 12,
      total: data.length,
    };
  }

  return {
    items: Array.isArray(data.items) ? data.items : [],
    page: typeof data.page === 'number' && data.page >= 1 ? data.page : 1,
    size: typeof data.size === 'number' && data.size >= 1 ? data.size : 12,
    total: typeof data.total === 'number' ? data.total : (data.items?.length || 0),
  };
}
