import type { BreedingHub, SpeciesBioMarker } from './types';
import { SPECIES_EXTRAS, type SpeciesViewModel } from '@/api/adapters';

export const VIETNAM_BREEDING_HUBS: BreedingHub[] = [
  {
    id: 'HUB-SGN',
    name: 'Trang Trại Bảo Tồn Nam Bộ',
    city: 'TP. Hồ Chí Minh',
    lat: 10.78,
    lng: 106.7,
    shopName: 'BioGreen Exotic',
    shopStatus: 'ACTIVE',
    specialty: 'Bò sát bán sa mạc & Lưỡng cư F2',
  },
  {
    id: 'HUB-DAD',
    name: 'Viện Ươm Cây Ăn Thịt Miền Trung',
    city: 'Đà Nẵng',
    lat: 16.07,
    lng: 108.19,
    shopName: 'Carnivora Garden',
    shopStatus: 'ACTIVE',
    specialty: 'Thực vật ăn côn trùng in-vitro',
  },
  {
    id: 'HUB-HAN',
    name: 'Trại Nhân Giống Bắc Bộ',
    city: 'Hà Nội',
    lat: 21.03,
    lng: 105.79,
    shopName: 'AquaTerra Shop',
    shopStatus: 'PENDING',
    specialty: 'Bò sát nhiệt đới & Rùa cạn',
  },
];

export const IUCN_MARKER_COLORS: Record<string, string> = {
  CR: '#EF4444', // Đỏ - Cực kỳ nguy cấp
  EN: '#F97316', // Cam - Nguy cấp
  VU: '#F59E0B', // Vàng hổ phách - Sắp nguy cấp
  NT: '#00D29E', // Xanh ngọc bích - Sắp bị đe dọa
  LC: '#6EE7B7', // Xanh bạc hà - Ít quan tâm
};

const DEG = Math.PI / 180;

/**
 * Chuyển đổi tọa độ vĩ độ/kinh độ sang vectơ Descartes 3D
 */
export function latLngToVector3(lat: number, lng: number, radius = 2.2): [number, number, number] {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

/**
 * 9 loài dựng sẵn (khóa theo scientificName) để vẽ ngay khi API chưa trả dữ liệu.
 * Khi có dữ liệu thật, dùng toBioMarker() để dựng marker từ danh sách loài của API.
 */
export const DEFAULT_SPECIES_BIOMARKERS: SpeciesBioMarker[] = [
  {
    scientificName: 'Ambystoma mexicanum',
    commonName: 'Kỳ giông Mexico (Axolotl)',
    displayName: 'Kỳ giông Mexico',
    conservationStatus: 'CR',
    group: 'Lưỡng cư',
    origin: { lat: 19.26, lng: -99.1, place: 'Hồ Xochimilco, Mexico' },
    hubId: 'HUB-SGN',
    heroPhoto: 'photos/axolotl/hero-960.webp',
    hasActiveProduct: true,
  },
  {
    scientificName: 'Nepenthes rajah',
    commonName: 'Nắp ấm khổng lồ Rajah',
    displayName: 'Nắp ấm Rajah',
    conservationStatus: 'EN',
    group: 'Cây ăn thịt',
    origin: { lat: 6.08, lng: 116.56, place: 'Núi Kinabalu, Borneo' },
    hubId: 'HUB-DAD',
    heroPhoto: 'photos/nepenthes-rajah/hero-960.webp',
    hasActiveProduct: true,
  },
  {
    scientificName: 'Python regius',
    commonName: 'Trăn bóng (Ball Python)',
    displayName: 'Trăn bóng',
    conservationStatus: 'NT',
    group: 'Bò sát',
    origin: { lat: 8.0, lng: -1.0, place: 'Savan Tây & Trung Phi' },
    hubId: 'HUB-SGN',
    heroPhoto: 'photos/ball-python/hero-960.webp',
    hasActiveProduct: true,
  },
  {
    scientificName: 'Eublepharis macularius',
    commonName: 'Thằn lằn da báo (Leopard Gecko)',
    displayName: 'Thằn lằn da báo',
    conservationStatus: 'LC',
    group: 'Bò sát',
    origin: { lat: 30.0, lng: 67.0, place: 'Cao nguyên đá Pakistan' },
    hubId: 'HUB-SGN',
    heroPhoto: 'photos/leopard-gecko/hero-960.webp',
    hasActiveProduct: true,
  },
  {
    scientificName: 'Dionaea muscipula',
    commonName: 'Cây bắt ruồi Venus',
    displayName: 'Cây bắt ruồi Venus',
    conservationStatus: 'VU',
    group: 'Cây ăn thịt',
    origin: { lat: 34.2, lng: -77.9, place: 'Đầm lầy than bùn Carolina, Mỹ' },
    hubId: 'HUB-DAD',
    heroPhoto: 'photos/venus-flytrap/hero-960.webp',
    hasActiveProduct: true,
  },
  {
    scientificName: 'Python bivittatus',
    commonName: 'Trăn đất (Burmese Python)',
    displayName: 'Trăn đất',
    conservationStatus: 'VU',
    group: 'Bò sát',
    origin: { lat: 21.9, lng: 95.9, place: 'Rừng mưa Indochina & Nam Á' },
    hubId: 'HUB-HAN',
    heroPhoto: 'photos/burmese-python/hero-960.webp',
    hasActiveProduct: false, // Cá thể chưa có shop APPROVED
  },
  {
    scientificName: 'Pogona vitticeps',
    commonName: 'Rồng Úc (Bearded Dragon)',
    displayName: 'Rồng Úc',
    conservationStatus: 'LC',
    group: 'Bò sát',
    origin: { lat: -25.0, lng: 134.0, place: 'Bán hoang mạc Simpson, Úc' },
    hubId: 'HUB-SGN',
    heroPhoto: 'photos/bearded-dragon/hero-960.webp',
    hasActiveProduct: true,
  },
  {
    scientificName: 'Testudo hermanni',
    commonName: 'Rùa Hermann',
    displayName: 'Rùa Hermann',
    conservationStatus: 'VU',
    group: 'Bò sát',
    origin: { lat: 41.9, lng: 15.0, place: 'Địa Trung Hải, Nam Âu' },
    hubId: 'HUB-SGN',
    heroPhoto: 'photos/hermann-tortoise/hero-960.webp',
    hasActiveProduct: true,
  },
  {
    scientificName: 'Nepenthes ampullaria',
    commonName: 'Nắp ấm bình ba màu',
    displayName: 'Nắp ấm bình ba màu',
    conservationStatus: 'LC',
    group: 'Cây ăn thịt',
    origin: { lat: 1.5, lng: 110.3, place: 'Đầm lầy Borneo, Sumatra' },
    hubId: 'HUB-DAD',
    heroPhoto: 'photos/nepenthes-ampullaria/hero-960.webp',
    hasActiveProduct: true,
  },
];

const DEFAULT_HUB_ID = VIETNAM_BREEDING_HUBS[0]!.id;

/** Dựng marker từ loài do API trả về; toạ độ và trung tâm nhân giống lấy từ species-extras theo scientificName */
export function toBioMarker(species: SpeciesViewModel, hasActiveProduct: boolean): SpeciesBioMarker {
  const extra = SPECIES_EXTRAS[species.scientificName];
  const fallback = DEFAULT_SPECIES_BIOMARKERS.find((m) => m.scientificName === species.scientificName);
  return {
    speciesId: species.id,
    scientificName: species.scientificName,
    commonName: species.commonName,
    displayName: species.displayName,
    conservationStatus: species.conservationStatus,
    group: species.group,
    origin: extra?.origin ?? fallback?.origin ?? species.origin,
    hubId: extra?.hubId ?? fallback?.hubId ?? DEFAULT_HUB_ID,
    heroPhoto: species.heroPhoto,
    hasActiveProduct,
  };
}
