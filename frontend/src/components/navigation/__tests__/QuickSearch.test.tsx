import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QuickSearch, normalizeSearchString } from '../QuickSearch';

describe('normalizeSearchString', () => {
  it('loại bỏ dấu tiếng Việt chuẩn NFD', () => {
    expect(normalizeSearchString('Trăn bóng')).toBe('tran bong');
    expect(normalizeSearchString('Kỳ giông Mexico')).toBe('ky giong mexico');
    expect(normalizeSearchString('Thằn lằn da báo')).toBe('than lan da bao');
    expect(normalizeSearchString('Động vật')).toBe('dong vat');
  });

  it('xử lý khoảng trắng thừa và chữ hoa chữ thường', () => {
    expect(normalizeSearchString('   GECKO   ')).toBe('gecko');
    expect(normalizeSearchString('')).toBe('');
  });
});

describe('QuickSearch Component', () => {
  it('UT-SCH-01: hiển thị dialog khi isOpen=true với vai trò accessibility chuẩn', () => {
    render(
      <MemoryRouter>
        <QuickSearch isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    const dialog = screen.getByRole('dialog', { name: /Tìm kiếm nhanh BioNexus/i });
    expect(dialog).toBeInTheDocument();

    const input = screen.getByRole('combobox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('UT-SCH-04: lọc và hiển thị chính xác các nhóm kết quả', () => {
    render(
      <MemoryRouter>
        <QuickSearch isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'gecko' } });

    // Khớp loài Thằn lằn da báo (Leopard Gecko) và các sản phẩm Gecko
    expect(screen.getByText('Thằn lằn da báo')).toBeInTheDocument();
    expect(screen.getByText(/Leopard Gecko High Yellow/i)).toBeInTheDocument();
  });

  it('UT-SCH-05: điều khiển bàn phím phím mũi tên và Escape', () => {
    const handleClose = vi.fn();
    render(
      <MemoryRouter>
        <QuickSearch isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'tran' } });

    // Bấm ArrowDown
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    // Bấm ArrowUp
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    // Bấm Escape gọi onClose
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalled();
  });

  it('UT-SCH-07: hiển thị trạng thái rỗng khi từ khóa không khớp', () => {
    render(
      <MemoryRouter>
        <QuickSearch isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'xyz12345nonexistent' } });

    expect(screen.getByText(/Không tìm thấy kết quả phù hợp/i)).toBeInTheDocument();
  });
});
