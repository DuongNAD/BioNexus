import type { SpeciesDto, ProductDto, SellerDto } from '@/types/api';
import { parseEnvironmentSpecs, formatVnd, type ParsedEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS, type SpeciesExtra } from '@/content/species-extras';

export { SPECIES_EXTRAS, type SpeciesExtra };

export interface SpeciesViewModel extends SpeciesDto {
  displayName: string;
  englishName: string;
  slug: string;
  group: 'Bò sát' | 'Lưỡng cư' | 'Cây ăn thịt' | 'Khác';
  origin: { lat: number; lng: number; place: string };
  heroPhoto: string;
  galleryPhotos: string[];
  parsedSpecs: ParsedEnvironmentSpecs;
  // Các trường tạp chí khoa học mở rộng
  heroPhotoId?: string;
  portraitPhotoId?: string;
  habitatPhotoId?: string;
  galleryPhotoIds?: string[];
  focus?: string;
  conservationNote?: string;
  pullQuote?: string;
  nativeCoordsFormatted?: string;
  gbifUrl?: string;
  diet?: string;
  lifespan?: string;
  activityTime?: string;
}

export interface ProductViewModel extends ProductDto {
  formattedPrice: string;
  isAvailable: boolean;
  isOutOfStock: boolean;
  displayShopName: string;
  displayImage: string;
}

/**
 * Tách tên tiếng Việt và tên tiếng Anh từ commonName.
 * Ví dụ: "Trăn bóng (Ball Python)" -> displayName: "Trăn bóng", englishName: "Ball Python"
 */
export function extractNames(commonName: string): { displayName: string; englishName: string } {
  if (!commonName) return { displayName: '', englishName: '' };
  const match = commonName.match(/^(.*?)\s*\((.*?)\)$/);
  if (match && match[1] && match[2]) {
    return {
      displayName: match[1].trim(),
      englishName: match[2].trim(),
    };
  }
  return {
    displayName: commonName.trim(),
    englishName: '',
  };
}

/**
 * Chuyển đổi SpeciesDto sang SpeciesViewModel đầy đủ, bảo toàn các trường DTO gốc
 */
export function toSpeciesView(dto: SpeciesDto): SpeciesViewModel {
  const { displayName, englishName } = extractNames(dto.commonName);
  const extras = SPECIES_EXTRAS[dto.scientificName];

  return {
    ...dto,
    displayName: displayName || dto.scientificName,
    englishName,
    slug: extras?.slug || dto.scientificName.toLowerCase().replace(/\s+/g, '-'),
    group: extras?.group || 'Khác',
    origin: extras?.origin || { lat: 10.78, lng: 106.7, place: 'Việt Nam' },
    heroPhoto: extras ? `photos/${extras.slug}/hero-960.webp` : dto.imageURL || 'photos/placeholder.webp',
    galleryPhotos: extras?.galleryPhotoIds
      ? extras.galleryPhotoIds.map((id) => `photos/${id}.webp`)
      : dto.imageURL
        ? [dto.imageURL]
        : [],
    parsedSpecs: parseEnvironmentSpecs(dto.environmentSpecs),
    heroPhotoId: extras?.heroPhotoId,
    portraitPhotoId: extras?.portraitPhotoId,
    habitatPhotoId: extras?.habitatPhotoId,
    galleryPhotoIds: extras?.galleryPhotoIds,
    focus: extras?.focus || 'center',
    conservationNote: extras?.conservationNote,
    pullQuote: extras?.pullQuote,
    nativeCoordsFormatted: extras?.nativeCoordsFormatted,
    gbifUrl: extras?.gbifUrl || (dto.referenceURL ? dto.referenceURL : undefined),
    diet: extras?.diet,
    lifespan: extras?.lifespan,
    activityTime: extras?.activityTime,
  };
}

/**
 * Chuyển đổi ProductDto sang ProductViewModel đầy đủ, bảo toàn các trường DTO gốc
 */
export function toProductView(dto: ProductDto, sellerMap?: Record<number, SellerDto>): ProductViewModel {
  const shopName =
    dto.shopName ||
    (sellerMap && dto.sellerProfileId ? sellerMap[dto.sellerProfileId]?.shopName : null);

  return {
    ...dto,
    formattedPrice: formatVnd(dto.price),
    isAvailable: dto.status === 'APPROVED' && dto.stockQuantity > 0,
    isOutOfStock: dto.stockQuantity <= 0 || dto.status === 'SOLD_OUT',
    displayShopName: shopName || `Cửa hàng #${dto.sellerProfileId}`,
    displayImage: dto.imageUrl || 'photos/product-placeholder.webp',
  };
}
