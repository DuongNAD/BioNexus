import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyState } from '../EmptyState';
import { ShoppingBag } from 'lucide-react';

describe('EmptyState Component', () => {
  it('renders title and description correctly', () => {
    render(
      <EmptyState
        title="Không tìm thấy sinh vật cảnh"
        description="Hãy thử tìm kiếm với từ khóa khác."
      />
    );

    expect(screen.getByText('Không tìm thấy sinh vật cảnh')).toBeInTheDocument();
    expect(screen.getByText('Hãy thử tìm kiếm với từ khóa khác.')).toBeInTheDocument();
  });

  it('renders action button and triggers callback', () => {
    const onAction = vi.fn();
    render(
      <EmptyState
        icon={<ShoppingBag data-testid="icon" />}
        title="Giỏ hàng trống"
        description="Chưa có món nào."
        action={{
          label: 'Khám phá ngay',
          onClick: onAction,
        }}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
    const btn = screen.getByRole('button', { name: 'Khám phá ngay' });
    fireEvent.click(btn);

    expect(onAction).toHaveBeenCalledTimes(1);
  });
});
