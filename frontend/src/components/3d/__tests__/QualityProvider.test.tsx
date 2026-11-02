import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QualityProvider, useQuality } from '../QualityProvider';

describe('QualityProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('ném lỗi khi useQuality() được gọi ngoài QualityProvider', () => {
    expect(() => {
      renderHook(() => useQuality());
    }).toThrow('useQuality must be used within a QualityProvider');
  });

  it('cung cấp cấu hình chất lượng mặc định', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QualityProvider>{children}</QualityProvider>
    );

    const { result } = renderHook(() => useQuality(), { wrapper });

    expect(result.current.tier).toBeDefined();
    expect(['high', 'medium', 'low', 'static']).toContain(result.current.tier);
    expect(result.current.config).toBeDefined();
    expect(result.current.config.dpr).toBeDefined();
  });

  it('tôn trọng cài đặt người dùng ghi đè từ localStorage', () => {
    localStorage.setItem('bionexus.quality_tier', 'low');

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QualityProvider>{children}</QualityProvider>
    );

    const { result } = renderHook(() => useQuality(), { wrapper });

    expect(result.current.userTier).toBe('low');
    expect(result.current.tier).toBe('low');
  });

  it('cho phép thay đổi userTier thông qua setUserTier() và lưu vào localStorage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QualityProvider>{children}</QualityProvider>
    );

    const { result } = renderHook(() => useQuality(), { wrapper });

    act(() => {
      result.current.setUserTier('static');
    });

    expect(result.current.userTier).toBe('static');
    expect(result.current.tier).toBe('static');
    expect(localStorage.getItem('bionexus.quality_tier')).toBe('static');

    act(() => {
      result.current.setUserTier('auto');
    });

    expect(result.current.userTier).toBe('auto');
    expect(localStorage.getItem('bionexus.quality_tier')).toBeNull();
  });

  it('hạ cấp tier khi gọi reportFpsDrop()', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QualityProvider>{children}</QualityProvider>
    );

    const { result } = renderHook(() => useQuality(), { wrapper });

    act(() => {
      result.current.reportFpsDrop();
    });

    expect(['medium', 'low', 'static']).toContain(result.current.tier);
  });

  it('ngay lập tức khởi tạo tier là static trên thiết bị bật prefers-reduced-motion (tránh 1-frame flash)', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('prefers-reduced-motion: reduce'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QualityProvider>{children}</QualityProvider>
    );

    const { result } = renderHook(() => useQuality(), { wrapper });

    // Khẳng định: Ngay từ frame đầu tiên đã nhận diện prefersReducedMotion = true và tier = static
    expect(result.current.prefersReducedMotion).toBe(true);
    expect(result.current.tier).toBe('static');
  });
});
