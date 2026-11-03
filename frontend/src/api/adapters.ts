import type { SpeciesDto, ProductDto, SellerDto } from '@/types/api';
import { parseEnvironmentSpecs, formatVnd, type ParsedEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS, type SpeciesExtra } from '@/content/species-extras';
import { PHOTOS } from '@/content/photos';

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

const SPECIES_ID_TO_SLUG: Record<number, string> = {
  1: 'axolotl',
  2: 'nepenthes-rajah',
  3: 'ball-python',
  4: 'leopard-gecko',
  5: 'venus-flytrap',
  6: 'burmese-python',
  7: 'bearded-dragon',
  8: 'hermann-tortoise',
  9: 'nepenthes-ampullaria',
};

const SEED_PRODUCT_IMAGE_MAP: Record<string, string> = {
  'https://bionexus.vn/images/prod-gecko-1.jpg': 'photos/products/prod-gecko-1-960.webp',
  'https://bionexus.vn/images/prod-gecko-2.jpg': 'photos/products/prod-gecko-2-960.webp',
  'https://bionexus.vn/images/prod-bearded-dragon-1.jpg': 'photos/products/prod-bearded-dragon-1-960.webp',
  'https://bionexus.vn/images/prod-ball-python-1.jpg': 'photos/products/prod-ball-python-1-960.webp',
  'https://bionexus.vn/images/prod-burmese-python-1.jpg': 'photos/products/prod-burmese-python-1-960.webp',
  'https://bionexus.vn/images/prod-hermann-tortoise-1.jpg': 'photos/products/prod-hermann-tortoise-1-960.webp',
  'https://bionexus.vn/images/prod-axolotl-1.jpg': 'photos/products/prod-axolotl-1-960.webp',
  'https://bionexus.vn/images/prod-venus-flytrap-1.jpg': 'photos/products/prod-venus-flytrap-1-960.webp',
  'https://bionexus.vn/images/prod-nepenthes-rajah-1.jpg': 'photos/products/prod-nepenthes-rajah-1-960.webp',
  'https://bionexus.vn/images/prod-nepenthes-ampullaria-1.jpg': 'photos/products/prod-nepenthes-ampullaria-1-960.webp',
};

const SPECIES_ID_TO_PROD_IMAGE: Record<number, string> = {
  1: 'photos/products/prod-axolotl-1-960.webp',
  2: 'photos/products/prod-nepenthes-rajah-1-960.webp',
  3: 'photos/products/prod-ball-python-1-960.webp',
  4: 'photos/products/prod-gecko-1-960.webp',
  5: 'photos/products/prod-venus-flytrap-1-960.webp',
  6: 'photos/products/prod-burmese-python-1-960.webp',
  7: 'photos/products/prod-bearded-dragon-1-960.webp',
  8: 'photos/products/prod-hermann-tortoise-1-960.webp',
  9: 'photos/products/prod-nepenthes-ampullaria-1-960.webp',
};

function photoIdToLocalWebp(photoId: string, slug: string): string {
  const meta = PHOTOS[photoId];
  if (meta) {
    return (
      meta.sources.webp[meta.sources.webp.length - 1]?.src ||
      meta.sources.jpg
    );
  }
  if (photoId.includes('-product-')) {
    return SPECIES_ID_TO_PROD_IMAGE[
      Number(
        Object.entries(SPECIES_ID_TO_SLUG).find(([, s]) => s === slug)?.[0] || 4
      )
    ]!;
  }
  const prefix = `${slug}-`;
  const role = photoId.startsWith(prefix) ? photoId.slice(prefix.length) : 'hero';
  return `photos/${slug}/${role}-960.webp`;
}

/**
 * Chuyển đổi SpeciesDto sang SpeciesViewModel đầy đủ, bảo toàn các trường DTO gốc
 */
export function toSpeciesView(dto: SpeciesDto): SpeciesViewModel {
  const { displayName, englishName } = extractNames(dto.commonName);
  const extras = SPECIES_EXTRAS[dto.scientificName];
  const slug = extras?.slug || SPECIES_ID_TO_SLUG[dto.id] || dto.scientificName.toLowerCase().replace(/\s+/g, '-');

  return {
    ...dto,
    displayName: displayName || dto.scientificName,
    englishName,
    slug,
    group: extras?.group || 'Khác',
    origin: extras?.origin || { lat: 10.78, lng: 106.7, place: 'Việt Nam' },
    heroPhoto: extras ? `photos/${extras.slug}/hero-960.webp` : `photos/${slug}/hero-960.webp`,
    galleryPhotos: extras?.galleryPhotoIds
      ? extras.galleryPhotoIds.map((id) => photoIdToLocalWebp(id, extras.slug))
      : [`photos/${slug}/hero-960.webp`, `photos/${slug}/portrait-960.webp`, `photos/${slug}/habitat-960.webp`],
    parsedSpecs: parseEnvironmentSpecs(dto.environmentSpecs),
    heroPhotoId: extras?.heroPhotoId,
    portraitPhotoId: extras?.portraitPhotoId,
    habitatPhotoId: extras?.habitatPhotoId,
    galleryPhotoIds: extras?.galleryPhotoIds,
    focus: extras?.focus || 'center',
    conservationNote: extras?.conservationNote,
    pullQuote: extras?.pullQuote,
    nativeCoordsFormatted: extras?.nativeCoordsFormatted,
    gbifUrl: dto.referenceURL ? dto.referenceURL : undefined,
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

  const extras = dto.speciesScientificName ? SPECIES_EXTRAS[dto.speciesScientificName] : undefined;
  const slug = extras?.slug || SPECIES_ID_TO_SLUG[dto.speciesId] || 'leopard-gecko';

  let displayImage = SPECIES_ID_TO_PROD_IMAGE[dto.speciesId] || `photos/${slug}/hero-960.webp`;
  if (dto.imageUrl) {
    if (SEED_PRODUCT_IMAGE_MAP[dto.imageUrl]) {
      displayImage = SEED_PRODUCT_IMAGE_MAP[dto.imageUrl]!;
    } else if (!dto.imageUrl.startsWith('https://bionexus.vn/')) {
      displayImage = dto.imageUrl;
    }
  }

  return {
    ...dto,
    formattedPrice: formatVnd(dto.price),
    isAvailable: dto.status === 'APPROVED' && dto.stockQuantity > 0,
    isOutOfStock: dto.stockQuantity <= 0 || dto.status === 'SOLD_OUT',
    displayShopName: shopName || `Cửa hàng #${dto.sellerProfileId}`,
    displayImage,
  };
}
