import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QuickSearch, normalizeSearchString } from '../QuickSearch';
import { SEED_SPECIES } from '@/mocks/data/species';
import { SEED_PRODUCTS } from '@/mocks/data/products';
import { toProductView, toSpeciesView } from '@/api/adapters';

// QuickSearch lấy dữ liệu qua hook API: test thay hook bằng dữ liệu seed để không cần mạng
vi.mock('@/api/queries/useSpeciesQueries', () => ({
  useSpeciesList: () => ({ data: SEED_SPECIES.map((s) => toSpeciesView(s)) }),
}));
vi.mock('@/api/queries/useProductQueries', () => ({
  useAllApprovedProducts: () => ({
    data: SEED_PRODUCTS.filter((p) => p.status === 'APPROVED').map((p) => toProductView(p)),
  }),
}));

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

    const input = screen.getByRole('combobox', { name: /Tìm loài, sản phẩm hoặc trang/i });
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('UT-SCH-02: Ctrl+K gọi onOpen khi bảng được điều khiển từ ngoài', () => {
    const handleOpen = vi.fn();
    render(
      <MemoryRouter>
        <QuickSearch isOpen={false} onClose={() => {}} onOpen={handleOpen} />
      </MemoryRouter>
    );

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(handleOpen).toHaveBeenCalledTimes(1);
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

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toMatch(/^quicksearch-item-/);
    fireEvent.keyDown(input, { key: 'ArrowUp' });

    // Escape do Radix xử lý, chỉ gọi onClose một lần
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('UT-SCH-06: không lộ route dev và khu quản trị cho khách', () => {
    render(
      <MemoryRouter>
        <QuickSearch isOpen={true} onClose={() => {}} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'quan tri' } });
    expect(screen.queryByText('Quản trị hệ thống')).not.toBeInTheDocument();
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
