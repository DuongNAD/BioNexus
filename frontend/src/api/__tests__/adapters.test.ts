import { describe, it, expect } from 'vitest';
import { extractNames, toSpeciesView, toProductView } from '../adapters';
import type { SpeciesDto, ProductDto } from '@/types/api';

describe('extractNames', () => {
  it('tách tên tiếng Việt và tiếng Anh trong dấu ngoặc đơn', () => {
    const { displayName, englishName } = extractNames('Trăn bóng (Ball Python)');
    expect(displayName).toBe('Trăn bóng');
    expect(englishName).toBe('Ball Python');
  });

  it('xử lý tên không có phần tiếng Anh trong ngoặc', () => {
    const { displayName, englishName } = extractNames('Cây bắt ruồi Venus');
    expect(displayName).toBe('Cây bắt ruồi Venus');
    expect(englishName).toBe('');
  });

  it('xử lý chuỗi rỗng an toàn', () => {
    const { displayName, englishName } = extractNames('');
    expect(displayName).toBe('');
    expect(englishName).toBe('');
  });
});

describe('toSpeciesView', () => {
  it('bảo toàn các trường DTO gốc (imageURL, referenceURL) và bổ sung ViewModel', () => {
    const dto: SpeciesDto = {
      id: 3,
      nodeId: 20,
      scientificName: 'Python regius',
      commonName: 'Trăn bóng (Ball Python)',
      conservationStatus: 'NT',
      environmentSpecs: 'Nhiệt độ: 26-32°C (điểm sưởi 32-34°C), Độ ẩm: 55-65%',
      description: 'Trăn cỡ nhỏ, hiền lành.',
      imageURL: 'https://bionexus.vn/species/python-regius.jpg',
      referenceURL: 'https://www.gbif.org/species/2465191',
    };

    const vm = toSpeciesView(dto);
    expect(vm.id).toBe(3);
    expect(vm.imageURL).toBe(dto.imageURL);
    expect(vm.referenceURL).toBe(dto.referenceURL);
    expect(vm.displayName).toBe('Trăn bóng');
    expect(vm.englishName).toBe('Ball Python');
    expect(vm.slug).toBe('ball-python');
    expect(vm.group).toBe('Bò sát');
    expect(vm.parsedSpecs.tempMin).toBe(26);
    expect(vm.parsedSpecs.tempMax).toBe(32);
    expect(vm.parsedSpecs.baskMin).toBe(32);
  });
});

describe('toProductView', () => {
  it('bảo toàn imageUrl và định dạng giá VND', () => {
    const dto: ProductDto = {
      id: 1,
      sellerProfileId: 1,
      speciesId: 4,
      productName: 'Leopard Gecko High Yellow',
      price: 850000,
      stockQuantity: 5,
      description: 'Cá thể khỏe mạnh',
      imageUrl: 'https://bionexus.vn/images/prod-1.jpg',
      status: 'APPROVED',
      shopName: 'BioGreen Exotic',
    };

    const vm = toProductView(dto);
    expect(vm.imageUrl).toBe(dto.imageUrl);
    expect(vm.formattedPrice).toContain('850.000');
    expect(vm.isAvailable).toBe(true);
    expect(vm.isOutOfStock).toBe(false);
    expect(vm.displayShopName).toBe('BioGreen Exotic');
  });

  it('nhận diện đúng khi sản phẩm hết hàng hoặc SOLD_OUT', () => {
    const dto: ProductDto = {
      id: 6,
      sellerProfileId: 1,
      speciesId: 8,
      productName: 'Rùa Hermann baby',
      price: 3500000,
      stockQuantity: 0,
      description: 'Đã bán hết',
      imageUrl: null,
      status: 'SOLD_OUT',
    };

    const vm = toProductView(dto);
    expect(vm.isAvailable).toBe(false);
    expect(vm.isOutOfStock).toBe(true);
  });
});
