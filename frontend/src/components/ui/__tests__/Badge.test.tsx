import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../Badge';
import { IucnBadge } from '../IucnBadge';

describe('Badge Component', () => {
  it('Hiển thị nội dung nhãn đúng', () => {
    render(<Badge>Sinh vật cảnh</Badge>);
    expect(screen.getByText('Sinh vật cảnh')).toBeInTheDocument();
  });

  it('Áp dụng class theo variant accent', () => {
    render(<Badge variant="accent">Nổi bật</Badge>);
    const badge = screen.getByText('Nổi bật');
    expect(badge).toHaveClass('text-accent');
  });

  it('Áp dụng class theo variant danger', () => {
    render(<Badge variant="danger">Cảnh báo</Badge>);
    const badge = screen.getByText('Cảnh báo');
    expect(badge).toHaveClass('text-danger');
  });
});

describe('IucnBadge Component', () => {
  it('Hiển thị mã bảo tồn và nhãn tiếng Việt', () => {
    render(<IucnBadge code="CR" />);
    expect(screen.getByText('CR')).toBeInTheDocument();
    expect(screen.getByText('Cực kỳ nguy cấp')).toBeInTheDocument();
  });

  it('Hiển thị đúng cho cấp EX (Tuyệt chủng)', () => {
    render(<IucnBadge code="EX" />);
    expect(screen.getByText('EX')).toBeInTheDocument();
    expect(screen.getByText('Tuyệt chủng')).toBeInTheDocument();
  });

  it('Xử lý an toàn khi mã không hợp lệ hoặc thiếu', () => {
    render(<IucnBadge code="" />);
    expect(screen.getByText('--')).toBeInTheDocument();
    expect(screen.getByText('Chưa xác định')).toBeInTheDocument();
  });

  it('Vật nuôi thuần hoá hiện "Vật nuôi" thay cho mức giữ chỗ trong DB', () => {
    render(<IucnBadge code="LC" domestic showLabel={false} />);
    expect(screen.getByText('Vật nuôi')).toBeInTheDocument();
    expect(screen.queryByText('LC')).not.toBeInTheDocument();
    expect(screen.queryByText('Ít quan tâm')).not.toBeInTheDocument();
  });
});
