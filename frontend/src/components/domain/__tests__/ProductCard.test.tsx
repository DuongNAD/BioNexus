import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ProductCard } from '../ProductCard';
import type { ProductViewModel } from '@/api/adapters';

const mockProduct: ProductViewModel = {
  id: 1,
  sellerProfileId: 101,
  speciesId: 1,
  productName: 'Kỳ giông Axolotl Leucistic (3 tháng tuổi)',
  price: 850000,
  formattedPrice: '850.000 ₫',
  stockQuantity: 5,
  description: 'Cá thể khỏe mạnh, mang đỏ tươi, ăn trùn chỉ tốt.',
  imageUrl: 'photos/axolotl/hero-960.webp',
  status: 'APPROVED',
  isAvailable: true,
  isOutOfStock: false,
  displayShopName: 'BioGreen Exotic',
  displayImage: 'photos/axolotl/hero-960.webp',
  speciesCommonName: 'Axolotl (Kỳ giông Mexico)',
  speciesScientificName: 'Ambystoma mexicanum',
  conservationStatus: 'CR',
};

// ProductCard chứa Link nên cần router
const renderCard = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('ProductCard Component', () => {
  it('renders product information, badges, and formatted price', () => {
    renderCard(<ProductCard product={mockProduct} />);

    expect(screen.getByText('Kỳ giông Axolotl Leucistic (3 tháng tuổi)')).toBeInTheDocument();
    expect(screen.getByText('BioGreen Exotic')).toBeInTheDocument();
    expect(screen.getByText('850.000')).toBeInTheDocument();
    expect(screen.getByText('₫')).toBeInTheDocument();
    expect(screen.getByText('F2+ Nhân tạo')).toBeInTheDocument();
    expect(screen.getByText('Còn 5 cá thể')).toBeInTheDocument();
  });

  it('triggers onAddToCart callback when add button clicked', () => {
    const onAddToCart = vi.fn();
    renderCard(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />);

    const btn = screen.getByRole('button', { name: /Thêm Kỳ giông Axolotl Leucistic/i });
    fireEvent.click(btn);

    expect(onAddToCart).toHaveBeenCalledWith(1, expect.any(Object));
  });

  it('disables add button and renders out of stock badge when sold out', () => {
    const outOfStockProduct: ProductViewModel = {
      ...mockProduct,
      stockQuantity: 0,
      isAvailable: false,
      isOutOfStock: true,
      status: 'SOLD_OUT',
    };

    renderCard(<ProductCard product={outOfStockProduct} onAddToCart={vi.fn()} />);

    expect(screen.getByText('Hết hàng')).toBeInTheDocument();
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('exposes the whole card as a keyboard-reachable link to the product detail', () => {
    renderCard(<ProductCard product={mockProduct} />);

    const link = screen.getByRole('link', { name: 'Kỳ giông Axolotl Leucistic (3 tháng tuổi)' });
    expect(link).toHaveAttribute('href', '/products/1');
    // Không có onAddToCart thì không có nút thừa
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
