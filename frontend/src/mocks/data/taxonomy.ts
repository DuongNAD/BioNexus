import type { MockTaxonomyNode } from '../types';

export const SEED_TAXONOMY: MockTaxonomyNode[] = [
  // KINGDOM
  { id: 1, scientificName: 'Animalia', commonName: 'Giới Động vật', rank: 'KINGDOM', parentId: null },
  { id: 2, scientificName: 'Plantae', commonName: 'Giới Thực vật', rank: 'KINGDOM', parentId: null },
  // PHYLUM
  { id: 3, scientificName: 'Chordata', commonName: 'Ngành Dây sống', rank: 'PHYLUM', parentId: 1 },
  { id: 4, scientificName: 'Tracheophyta', commonName: 'Ngành Thực vật có mạch', rank: 'PHYLUM', parentId: 2 },
  // CLASS
  { id: 5, scientificName: 'Reptilia', commonName: 'Lớp Bò sát', rank: 'CLASS', parentId: 3 },
  { id: 6, scientificName: 'Amphibia', commonName: 'Lớp Lưỡng cư', rank: 'CLASS', parentId: 3 },
  { id: 7, scientificName: 'Magnoliopsida', commonName: 'Lớp Hai lá mầm', rank: 'CLASS', parentId: 4 },
  // ORDER
  { id: 8, scientificName: 'Squamata', commonName: 'Bộ Có vảy', rank: 'ORDER', parentId: 5 },
  { id: 9, scientificName: 'Testudines', commonName: 'Bộ Rùa', rank: 'ORDER', parentId: 5 },
  { id: 10, scientificName: 'Urodela', commonName: 'Bộ Có đuôi', rank: 'ORDER', parentId: 6 },
  { id: 11, scientificName: 'Caryophyllales', commonName: 'Bộ Cẩm chướng', rank: 'ORDER', parentId: 7 },
  { id: 12, scientificName: 'Ericales', commonName: 'Bộ Thạch nam', rank: 'ORDER', parentId: 7 },
  // FAMILY
  { id: 13, scientificName: 'Pythonidae', commonName: 'Họ Trăn', rank: 'FAMILY', parentId: 8 },
  { id: 14, scientificName: 'Eublepharidae', commonName: 'Họ Thằn lằn mí', rank: 'FAMILY', parentId: 8 },
  { id: 15, scientificName: 'Agamidae', commonName: 'Họ Nhông', rank: 'FAMILY', parentId: 8 },
  { id: 16, scientificName: 'Testudinidae', commonName: 'Họ Rùa cạn', rank: 'FAMILY', parentId: 9 },
  { id: 17, scientificName: 'Ambystomatidae', commonName: 'Họ Kỳ giông lửa', rank: 'FAMILY', parentId: 10 },
  { id: 18, scientificName: 'Nepenthaceae', commonName: 'Họ Nắp ấm', rank: 'FAMILY', parentId: 11 },
  { id: 19, scientificName: 'Droseraceae', commonName: 'Họ Gọng vó', rank: 'FAMILY', parentId: 11 },
  // GENUS
  { id: 20, scientificName: 'Python', commonName: 'Chi Trăn hoa', rank: 'GENUS', parentId: 13 },
  { id: 21, scientificName: 'Eublepharis', commonName: 'Chi Thằn lằn da báo', rank: 'GENUS', parentId: 14 },
  { id: 22, scientificName: 'Pogona', commonName: 'Chi Rồng Úc', rank: 'GENUS', parentId: 15 },
  { id: 23, scientificName: 'Testudo', commonName: 'Chi Rùa cạn Địa Trung Hải', rank: 'GENUS', parentId: 16 },
  { id: 24, scientificName: 'Ambystoma', commonName: 'Chi Kỳ giông viền', rank: 'GENUS', parentId: 17 },
  { id: 25, scientificName: 'Nepenthes', commonName: 'Chi Nắp ấm nhiệt đới', rank: 'GENUS', parentId: 18 },
  { id: 26, scientificName: 'Dionaea', commonName: 'Chi Bắt ruồi', rank: 'GENUS', parentId: 19 },
];
