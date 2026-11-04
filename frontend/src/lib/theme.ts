import { useCallback, useSyncExternalStore } from 'react';

/**
 * Chế độ sáng/tối: thuộc tính data-theme trên <html>, lưu ở localStorage.
 * index.html đặt sẵn data-theme trước khi React chạy để trang không nháy màu lúc tải.
 */
export type Theme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'bionexus.theme';

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  // Thanh địa chỉ trên điện thoại đổi màu theo nền
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f6f8f5' : '#030807');
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Chế độ riêng tư chặn localStorage: vẫn đổi được trong phiên này
  }
  listeners.forEach((l) => l());
}

export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const theme = useSyncExternalStore(subscribe, readTheme, () => 'dark' as Theme);
  const toggleTheme = useCallback(() => applyTheme(readTheme() === 'light' ? 'dark' : 'light'), []);
  return { theme, toggleTheme };
}
