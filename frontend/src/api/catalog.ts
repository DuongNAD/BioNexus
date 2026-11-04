import { useQuery } from '@tanstack/react-query';
import { queryKeys } from './keys';

/**
 * Hồ sơ mở rộng của các loài catalog (ngoài hợp đồng API, giống species-extras.ts của 9 loài gốc).
 * File tĩnh public/catalog/* do scripts/build-catalog.mjs sinh. Không có file thì giao diện vẫn chạy với dữ liệu API.
 */

export type CatalogGroup =
  | 'Bò sát'
  | 'Lưỡng cư'
  | 'Cá cảnh'
  | 'Động vật không xương sống'
  | 'Cây ăn thịt'
  | 'Cây cảnh'
  | 'Thú'
  | 'Chim';

/** Một dòng trong catalog/index.json, tên trường viết tắt để file nhỏ */
export interface CatalogIndexEntry {
  s: string;
  slug: string;
  g: CatalogGroup;
  /** Có ảnh hero */
  h?: 1;
  /** Có ảnh portrait */
  p?: 1;
  /** Màu chủ đạo của ảnh portrait, dùng làm nền khi ảnh đang tải */
  c?: string;
  o?: [number, number];
  r?: string;
}

export interface CatalogPhoto {
  src: string;
  width: number;
  height: number;
  color?: string;
  author: string;
  license: string;
  licenseUrl?: string;
  sourceUrl: string;
  modified?: boolean;
}

export interface CatalogCare {
  difficulty?: 'Dễ' | 'Trung bình' | 'Khó' | null;
  beginnerFriendly?: boolean | null;
  enclosureVi?: string | null;
  lightingVi?: string | null;
  feedingVi?: string | null;
  socialVi?: string | null;
  commonProblemsVi?: string[];
}

export interface CatalogSpecies {
  scientificName: string;
  slug: string;
  group: CatalogGroup;
  commonNameVi: string | null;
  commonNameEn: string | null;
  otherNamesVi: string[];
  synonyms: string[];
  regionVi: string | null;
  origin: { place?: string; lat: number; lng: number } | null;
  iucnAssessedYear: number | null;
  populationTrend: 'Increasing' | 'Stable' | 'Decreasing' | 'Unknown' | null;
  iucnUrl: string | null;
  wikipediaVi: string | null;
  wikipediaEn: string | null;
  wikidataId: string | null;
  size: {
    lengthCmMin?: number | null;
    lengthCmMax?: number | null;
    weightGMin?: number | null;
    weightGMax?: number | null;
    heightCmMax?: number | null;
    noteVi?: string | null;
  } | null;
  distribution: { countries?: string[]; nativeRangeVi?: string | null; elevationM?: { min?: number | null; max?: number | null } | null } | null;
  habitatTypesVi: string[];
  identificationVi: string | null;
  behaviorVi: string | null;
  reproductionVi: string | null;
  threatsVi: string[];
  funFactsVi: string[];
  similarSpecies: string[];
  dietVi: string | null;
  lifespanVi: string | null;
  activityTimeVi: string | null;
  conservationNoteVi: string | null;
  pullQuoteVi: string | null;
  care: CatalogCare | null;
  trade: { tradeable: boolean; cites: string | null; vnProtected: string | null };
  photos: { hero: CatalogPhoto | null; portrait: CatalogPhoto | null };
  sources: string[];
}

export interface CatalogCredit extends CatalogPhoto {
  scientificName: string;
  role: 'hero' | 'portrait';
}

const SHARDS = 16;

/** Slug theo quy tắc của build-catalog.mjs và thư mục public/photos/c/<slug> */
export function catalogSlug(scientificName: string): string {
  return scientificName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

/** Băm FNV-1a giống build-catalog.mjs để biết loài nằm ở mảnh nào mà không cần tải chỉ mục */
export function catalogShardOf(slug: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h ^ slug.charCodeAt(i), 0x01000193) >>> 0;
  return h % SHARDS;
}

export function catalogPhotoPath(scientificName: string, role: 'hero' | 'portrait'): string {
  return `photos/c/${catalogSlug(scientificName)}/${role}.webp`;
}

let indexCache: Map<string, CatalogIndexEntry> | null = null;
let indexPending: Promise<Map<string, CatalogIndexEntry>> | null = null;

/**
 * Tải chỉ mục một lần cho cả phiên. Các query loài chờ hàm này trước khi đổi DTO sang view model,
 * để adapter đọc được nhóm, toạ độ, ảnh một cách đồng bộ.
 */
export function loadCatalogIndex(): Promise<Map<string, CatalogIndexEntry>> {
  if (indexCache) return Promise.resolve(indexCache);
  indexPending ??= fetch('catalog/index.json')
    .then((res) => (res.ok ? (res.json() as Promise<CatalogIndexEntry[]>) : []))
    .then((rows) => (indexCache = new Map(rows.map((r) => [r.s, r]))))
    .catch(() => {
      // Lỗi mạng: lần sau thử lại, lần này giao diện chạy với dữ liệu API thuần
      indexPending = null;
      return new Map<string, CatalogIndexEntry>();
    });
  return indexPending;
}

export function getCatalogEntry(scientificName: string): CatalogIndexEntry | undefined {
  return indexCache?.get(scientificName);
}

/** Hồ sơ đầy đủ của một loài catalog; null nếu loài không có trong catalog (9 loài gốc, loài admin mới thêm) */
export function useCatalogSpecies(scientificName: string | undefined, options?: { enabled?: boolean }) {
  const shard = scientificName ? catalogShardOf(catalogSlug(scientificName)) : -1;
  return useQuery({
    queryKey: queryKeys.catalog.shard(shard),
    queryFn: async (): Promise<Record<string, CatalogSpecies>> => {
      const res = await fetch(`catalog/species-${String(shard).padStart(2, '0')}.json`);
      return res.ok ? res.json() : {};
    },
    select: (data) => (scientificName ? (data[scientificName] ?? null) : null),
    enabled: !!scientificName && (options?.enabled ?? true),
    staleTime: Infinity,
  });
}

/** Nguồn ảnh của mọi loài catalog cho trang Ghi nguồn */
export function useCatalogCredits() {
  return useQuery({
    queryKey: queryKeys.catalog.credits(),
    queryFn: async (): Promise<CatalogCredit[]> => {
      const res = await fetch('catalog/credits.json');
      return res.ok ? res.json() : [];
    },
    staleTime: Infinity,
  });
}
