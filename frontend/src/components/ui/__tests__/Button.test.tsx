import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('Hiển thị nội dung văn bản và class mặc định', () => {
    render(<Button>Khám phá Sinh quyển</Button>);
    const button = screen.getByRole('button', { name: /Khám phá Sinh quyển/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-accent');
  });

  it('Kích hoạt sự kiện onClick khi người dùng click', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Nhấn vào đây</Button>);
    const button = screen.getByRole('button', { name: /Nhấn vào đây/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('Vô hiệu hóa và hiển thị trạng thái loading khi isLoading = true', () => {
    render(<Button isLoading>Đang lưu</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('Hỗ trợ các biến thể màu sắc khác nhau', () => {
    const { rerender } = render(<Button variant="danger">Xóa dữ liệu</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-danger/15');

    rerender(<Button variant="secondary">Thứ cấp</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-surface-hover');
  });
});
