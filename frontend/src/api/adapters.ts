import type { SpeciesDto, ProductDto, SellerDto } from '@/types/api';
import { parseEnvironmentSpecs, formatVnd, type ParsedEnvironmentSpecs } from '@/lib/parseEnvironmentSpecs';
import { SPECIES_EXTRAS, type SpeciesExtra } from '@/content/species-extras';
import { PHOTOS } from '@/content/photos';
import { catalogPhotoPath, getCatalogEntry, type CatalogGroup } from './catalog';

export { SPECIES_EXTRAS, type SpeciesExtra };

export type SpeciesGroup = SpeciesExtra['group'] | CatalogGroup | 'Khác';

export interface SpeciesViewModel extends SpeciesDto {
  displayName: string;
  englishName: string;
  slug: string;
  group: SpeciesGroup;
  origin: { lat: number; lng: number; place: string };
  heroPhoto: string;
  /** Ảnh cho thẻ trong lưới: loài catalog dùng ảnh portrait nhẹ hơn ảnh hero */
  cardPhoto: string;
  /** true khi loài thuộc catalog mở rộng (hồ sơ chi tiết nằm ở public/catalog) */
  isCatalog: boolean;
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

// Ảnh sản phẩm mẫu theo slug loài (slug tra từ scientificName, không dựa vào id trong DB)
const SLUG_TO_PROD_IMAGE: Record<string, string> = {
  axolotl: 'photos/products/prod-axolotl-1-960.webp',
  'nepenthes-rajah': 'photos/products/prod-nepenthes-rajah-1-960.webp',
  'ball-python': 'photos/products/prod-ball-python-1-960.webp',
  'leopard-gecko': 'photos/products/prod-gecko-1-960.webp',
  'venus-flytrap': 'photos/products/prod-venus-flytrap-1-960.webp',
  'burmese-python': 'photos/products/prod-burmese-python-1-960.webp',
  'bearded-dragon': 'photos/products/prod-bearded-dragon-1-960.webp',
  'hermann-tortoise': 'photos/products/prod-hermann-tortoise-1-960.webp',
  'nepenthes-ampullaria': 'photos/products/prod-nepenthes-ampullaria-1-960.webp',
};

// Seed lưu URL giả bionexus.vn: đổi sang ảnh thật đã tải về public/photos
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

export const PRODUCT_PLACEHOLDER_IMAGE = 'photos/product-placeholder.svg';

/** Slug ổn định từ tên khoa học khi loài chưa có trong species-extras */
function slugFromScientificName(scientificName: string): string {
  return scientificName.toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Ảnh hiển thị cho sản phẩm (dùng chung cho thẻ sản phẩm, giỏ, đơn, thanh toán, kiểm duyệt).
 * Ưu tiên ảnh người bán khai báo; URL giả của seed thì đổi sang ảnh thật; không có thì lấy ảnh theo loài.
 */
export function resolveProductImage(imageUrl: string | null | undefined, speciesScientificName?: string | null): string {
  if (imageUrl) {
    const mapped = SEED_PRODUCT_IMAGE_MAP[imageUrl];
    if (mapped) return mapped;
    if (!imageUrl.startsWith('https://bionexus.vn/')) {
      // Đường dẫn tuyệt đối '/photos/...' sẽ hỏng dưới context /BioNexus của WAR
      return imageUrl.startsWith('/') && !imageUrl.startsWith('//') ? imageUrl.slice(1) : imageUrl;
    }
  }
  if (!speciesScientificName) return PRODUCT_PLACEHOLDER_IMAGE;
  const slug = SPECIES_EXTRAS[speciesScientificName]?.slug;
  if (slug) return SLUG_TO_PROD_IMAGE[slug] || PRODUCT_PLACEHOLDER_IMAGE;
  // Loài catalog: dùng ảnh portrait của loài. Loài không có ảnh thì lib/imageFallback đổi sang ảnh giữ chỗ khi tải lỗi
  return catalogPhotoPath(speciesScientificName, 'portrait');
}

function photoIdToLocalWebp(photoId: string, slug: string): string {
  const meta = PHOTOS[photoId];
  if (meta) {
    return (
      meta.sources.webp[meta.sources.webp.length - 1]?.src ||
      meta.sources.jpg
    );
  }
  if (photoId.includes('-product-')) {
    return SLUG_TO_PROD_IMAGE[slug] || PRODUCT_PLACEHOLDER_IMAGE;
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
  const slug = extras?.slug || slugFromScientificName(dto.scientificName);
  const fallbackImage =
    dto.imageURL && !dto.imageURL.startsWith('https://bionexus.vn/') ? dto.imageURL : PRODUCT_PLACEHOLDER_IMAGE;
  // Chỉ mục catalog đã được các query loài tải xong trước khi gọi adapter (xem loadCatalogIndex)
  const entry = extras ? undefined : getCatalogEntry(dto.scientificName);
  const catalogHero = entry?.h ? catalogPhotoPath(dto.scientificName, 'hero') : undefined;
  const catalogPortrait = entry?.p ? catalogPhotoPath(dto.scientificName, 'portrait') : undefined;
  const heroPhoto = extras ? `photos/${extras.slug}/hero-960.webp` : (catalogHero ?? catalogPortrait ?? fallbackImage);

  return {
    ...dto,
    displayName: displayName || dto.scientificName,
    englishName,
    slug,
    group: extras?.group || entry?.g || 'Khác',
    origin:
      extras?.origin ||
      (entry?.o ? { lat: entry.o[0], lng: entry.o[1], place: entry.r ?? '' } : { lat: 10.78, lng: 106.7, place: 'Việt Nam' }),
    // Loài ngoài catalog (chưa có ảnh trong public/photos) thì dùng ảnh DB nếu là URL thật, không thì ảnh giữ chỗ
    heroPhoto,
    cardPhoto: catalogPortrait ?? heroPhoto,
    isCatalog: !!entry,
    galleryPhotos: extras?.galleryPhotoIds
      ? extras.galleryPhotoIds.map((id) => photoIdToLocalWebp(id, extras.slug))
      : [catalogHero, catalogPortrait].filter((p): p is string => !!p).concat(catalogHero || catalogPortrait ? [] : [fallbackImage]),
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

  const displayImage = resolveProductImage(dto.imageUrl, dto.speciesScientificName);

  return {
    ...dto,
    formattedPrice: formatVnd(dto.price),
    isAvailable: dto.status === 'APPROVED' && dto.stockQuantity > 0,
    isOutOfStock: dto.stockQuantity <= 0 || dto.status === 'SOLD_OUT',
    displayShopName: shopName || `Cửa hàng #${dto.sellerProfileId}`,
    displayImage,
  };
}
