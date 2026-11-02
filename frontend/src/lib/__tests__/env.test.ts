import { describe, it, expect } from 'vitest';
import { USE_MOCKS, MOCK_LATENCY, API_BASE } from '../env';
import { cn } from '../cn';

describe('Kiểm thử môi trường & hàm tiện ích (Milestone 1)', () => {
  it('Biến môi trường API_BASE phải là đường dẫn tương đối kết thúc bằng /', () => {
    expect(API_BASE).toBe('api/');
    expect(API_BASE.startsWith('/')).toBe(false);
  });

  it('Độ trễ giả lập mặc định phải là số dương', () => {
    expect(MOCK_LATENCY).toBeGreaterThanOrEqual(0);
  });

  it('USE_MOCKS phải là kiểu boolean', () => {
    expect(typeof USE_MOCKS).toBe('boolean');
  });

  it('Hàm tiện ích cn() gộp class Tailwind chính xác', () => {
    expect(cn('bg-bg', 'text-fg')).toBe('bg-bg text-fg');
    const isHidden = false;
    expect(cn('p-4', isHidden && 'hidden', 'text-accent')).toBe('p-4 text-accent');
    // Ghi đè class xung đột qua tailwind-merge
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });
});
