/**
 * BioNexus E2E Test Suite — Authoritative Seed Data
 * Sourced directly from database/seed_data.sql and docs/frontend/04-hop-dong-api-va-mock.md
 */

import type {
  TaxonomyNodeDto,
  SpeciesDto,
  ProductDto,
  SellerDto,
  UserStatus,
  AdminRole,
  AccountType,
  OrderStatus,
} from './types.ts';

export interface SeedUser {
  id: number;
  username: string;
  passwordHash: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  status: UserStatus;
}

export interface SeedAdmin {
  id: number;
  account: string;
  fullName: string;
  passwordHash: string;
  adminRole: AdminRole;
  status: UserStatus;
}

export interface SeedCartItem {
  productId: number;
  quantity: number;
}

export interface SeedOrder {
  id: number;
  orderCode: string;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

export const SEED_USERS: SeedUser[] = [
  { id: 1, username: 'nguyenvana', passwordHash: '123456', email: 'vana@gmail.com', fullName: 'Nguyễn Văn A', phone: '0901234567', address: 'Quận 1, TP.HCM', status: 'ACTIVE' },
  { id: 2, username: 'tranthib', passwordHash: '123456', email: 'thib@gmail.com', fullName: 'Trần Thị B', phone: '0912345678', address: 'Cầu Giấy, Hà Nội', status: 'ACTIVE' },
  { id: 3, username: 'levanc', passwordHash: '123456', email: 'vanc@gmail.com', fullName: 'Lê Văn C', phone: '0987654321', address: 'Hải Châu, Đà Nẵng', status: 'ACTIVE' },
  { id: 4, username: 'phamthid', passwordHash: '123456', email: 'thid@gmail.com', fullName: 'Phạm Thị D', phone: '0934567890', address: 'Thanh Khê, Đà Nẵng', status: 'ACTIVE' },
  { id: 5, username: 'hoangvane', passwordHash: '123456', email: 'vane@gmail.com', fullName: 'Hoàng Văn E', phone: '0945678901', address: 'Ninh Kiều, Cần Thơ', status: 'ACTIVE' },
  { id: 6, username: 'vuthif', passwordHash: '123456', email: 'thif@gmail.com', fullName: 'Vũ Thị F', phone: '0956789012', address: 'Biên Hòa, Đồng Nai', status: 'BANNED' },
  { id: 7, username: 'dangvang', passwordHash: '123456', email: 'vang@gmail.com', fullName: 'Đặng Văn G', phone: '0967890123', address: 'Nha Trang, Khánh Hòa', status: 'INACTIVE' },
];

export const SEED_ADMINS: SeedAdmin[] = [
  { id: 1, account: 'superadmin', fullName: 'Admin Tổng', passwordHash: 'admin123', adminRole: 'SUPER_ADMIN', status: 'ACTIVE' },
  { id: 2, account: 'biologist1', fullName: 'TS. Sinh Học Nam', passwordHash: 'admin123', adminRole: 'BIOLOGIST', status: 'ACTIVE' },
  { id: 3, account: 'moderator1', fullName: 'Kiểm Duyệt Viên', passwordHash: 'admin123', adminRole: 'MODERATOR', status: 'ACTIVE' },
  { id: 4, account: 'moderator2', fullName: 'Kiểm Duyệt Viên 2', passwordHash: 'admin123', adminRole: 'MODERATOR', status: 'INACTIVE' },
  { id: 5, account: 'biologist2', fullName: 'ThS. Sinh Học Minh', passwordHash: 'admin123', adminRole: 'BIOLOGIST', status: 'BANNED' },
];

export const SEED_SHOPS: SellerDto[] = [
  { id: 1, userId: 1, shopName: 'BioGreen Exotic', businessLicenseUrl: 'https://bionexus.vn/licenses/lic-01.pdf', bio: 'Chuyên cung cấp sinh vật cảnh và cây thực vật quý hiếm có giấy phép.', status: 'ACTIVE', approvedByAdminId: 3, ownerFullName: 'Nguyễn Văn A', ownerUsername: 'nguyenvana' },
  { id: 2, userId: 2, shopName: 'AquaTerra Shop', businessLicenseUrl: 'https://bionexus.vn/licenses/lic-02.pdf', bio: 'Trại nhân giống bò sát và lưỡng cư sinh sản nhân tạo.', status: 'PENDING', approvedByAdminId: null, ownerFullName: 'Trần Thị B', ownerUsername: 'tranthib' },
  { id: 3, userId: 4, shopName: 'Carnivora Garden', businessLicenseUrl: 'https://bionexus.vn/licenses/lic-03.pdf', bio: 'Vườn ươm cây ăn côn trùng: nắp ấm, bắt ruồi, gọng vó.', status: 'ACTIVE', approvedByAdminId: 3, ownerFullName: 'Phạm Thị D', ownerUsername: 'phamthid' },
  { id: 4, userId: 5, shopName: 'Exotic Reptile Hub', businessLicenseUrl: null, bio: 'Cửa hàng bò sát nhập khẩu.', status: 'REJECTED', approvedByAdminId: null, ownerFullName: 'Hoàng Văn E', ownerUsername: 'hoangvane' },
  { id: 5, userId: 6, shopName: 'Gecko Lab', businessLicenseUrl: 'https://bionexus.vn/licenses/lic-05.pdf', bio: 'Nhân giống tắc kè và thằn lằn cảnh.', status: 'BANNED', approvedByAdminId: 3, ownerFullName: 'Vũ Thị F', ownerUsername: 'vuthif' },
];

export const SEED_TAXONOMY: TaxonomyNodeDto[] = [
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

export const SEED_SPECIES: SpeciesDto[] = [
  {
    id: 1,
    nodeId: 24,
    scientificName: 'Ambystoma mexicanum',
    commonName: 'Kỳ giông Mexico (Axolotl)',
    conservationStatus: 'CR',
    environmentSpecs: 'Nhiệt độ nước: 14-18°C, pH: 7.4-7.6, Môi trường: Nước ngọt hoàn toàn, lọc yếu, không nền sỏi nhỏ',
    description: 'Loài lưỡng cư giữ lại đặc điểm ấu trùng suốt đời (neoteny). Cực kỳ nguy cấp ngoài tự nhiên, chỉ còn tại hồ Xochimilco.',
    imageURL: 'https://bionexus.vn/species/ambystoma-mexicanum.jpg',
    referenceURL: 'https://www.gbif.org/species/2431969',
  },
  {
    id: 2,
    nodeId: 25,
    scientificName: 'Nepenthes rajah',
    commonName: 'Nắp ấm khổng lồ Rajah',
    conservationStatus: 'EN',
    environmentSpecs: 'Nhiệt độ: ngày 20-25°C, đêm 10-15°C, Độ ẩm: 75-90%, Ánh sáng: tán xạ mạnh, Giá thể: dớn + perlite thoát nước',
    description: 'Cây ăn thịt cao sơn đặc hữu núi Kinabalu, Borneo. Bình ấm lớn tới 41cm, có thể bẫy được động vật có xương sống nhỏ.',
    imageURL: 'https://bionexus.vn/species/nepenthes-rajah.jpg',
    referenceURL: 'https://www.gbif.org/species/3753587',
  },
  {
    id: 3,
    nodeId: 20,
    scientificName: 'Python regius',
    commonName: 'Trăn bóng (Ball Python)',
    conservationStatus: 'NT',
    environmentSpecs: 'Nhiệt độ: 26-32°C (điểm sưởi 32-34°C), Độ ẩm: 55-65%, Chuồng: hộp chuyên dụng có hang trú hai đầu',
    description: 'Loài trăn nhỏ có tập tính cuộn tròn như quả bóng khi tự vệ. Bản tính hiền lành, nhiều biến dị màu (morph) nhân giống nhân tạo.',
    imageURL: 'https://bionexus.vn/species/python-regius.jpg',
    referenceURL: 'https://www.gbif.org/species/2465191',
  },
  {
    id: 4,
    nodeId: 21,
    scientificName: 'Eublepharis macularius',
    commonName: 'Thằn lằn da báo (Leopard Gecko)',
    conservationStatus: 'LC',
    environmentSpecs: 'Nhiệt độ: 24-30°C (điểm sưởi 31-33°C), Độ ẩm: 30-40% (hang ẩm 70-80%), Giá thể: giấy báo hoặc thảm chuyên dụng',
    description: 'Thằn lằn mí mắt nguồn gốc Trung Á, hoạt động hoàng hôn và ban đêm. Dễ nuôi, đuôi tích trữ mỡ, không có đĩa bám ở chân.',
    imageURL: 'https://bionexus.vn/species/eublepharis-macularius.jpg',
    referenceURL: 'https://www.gbif.org/species/2464731',
  },
  {
    id: 5,
    nodeId: 26,
    scientificName: 'Dionaea muscipula',
    commonName: 'Cây bắt ruồi Venus',
    conservationStatus: 'VU',
    environmentSpecs: 'Nhiệt độ: 21-35°C (ngủ đông 5-10°C), Độ ẩm: 50-70%, Ánh sáng: nắng trực tiếp ≥4h, Nước: thẩm thấu ngược hoặc nước mưa',
    description: 'Cây ăn thịt nổi tiếng với phiến lá gập lại cực nhanh khi con mồi chạm vào lông cảm giác hai lần. Đặc hữu duyên hải Bắc và Nam Carolina.',
    imageURL: 'https://bionexus.vn/species/dionaea-muscipula.jpg',
    referenceURL: 'https://www.gbif.org/species/3190822',
  },
  {
    id: 6,
    nodeId: 20,
    scientificName: 'Python bivittatus',
    commonName: 'Trăn đất (Burmese Python)',
    conservationStatus: 'VU',
    environmentSpecs: 'Nhiệt độ: 26-32°C (điểm sưởi 35°C), Độ ẩm: 60-75%, Chuồng: chuồng cỡ lớn kiên cố, khay nước đủ ngâm toàn thân',
    description: 'Một trong những loài trăn lớn nhất thế giới, bản địa Đông Nam Á kể cả Việt Nam. Cần diện tích nuôi lớn và kinh nghiệm chuyên sâu.',
    imageURL: 'https://bionexus.vn/species/python-bivittatus.jpg',
    referenceURL: 'https://www.gbif.org/species/7542289',
  },
  {
    id: 7,
    nodeId: 22,
    scientificName: 'Pogona vitticeps',
    commonName: 'Rồng Úc (Central Bearded Dragon)',
    conservationStatus: 'LC',
    environmentSpecs: 'Nhiệt độ: 24-29°C (điểm sưởi 38-42°C, đêm >18°C), Độ ẩm: 30-40%, Đèn: bắt buộc UVB 10.0 hoặc 12-14%',
    description: 'Loài thằn lằn bản địa bán sa mạc Úc. Rất dạn người, có túi gai dưới cổ xòe ra khi kích động hoặc phơi nắng.',
    imageURL: 'https://bionexus.vn/species/pogona-vitticeps.jpg',
    referenceURL: 'https://www.gbif.org/species/2465806',
  },
  {
    id: 8,
    nodeId: 23,
    scientificName: 'Testudo hermanni',
    commonName: 'Rùa Hermann',
    conservationStatus: 'VU',
    environmentSpecs: 'Nhiệt độ: 22-28°C (điểm sưởi 32-35°C), Độ ẩm: 50-65%, Đèn: UVB 10.0, Chế độ ăn: 100% thảo mộc giàu canxi, xơ cao',
    description: 'Rùa cạn cỡ nhỏ bản địa Nam Âu quanh Địa Trung Hải. Mai vòm vàng đen đẹp mắt, hiền lành, tuổi thọ có thể vượt 50 năm.',
    imageURL: 'https://bionexus.vn/species/testudo-hermanni.jpg',
    referenceURL: 'https://www.gbif.org/species/2442111',
  },
  {
    id: 9,
    nodeId: 25,
    scientificName: 'Nepenthes ampullaria',
    commonName: 'Nắp ấm bình ba màu (Ampullaria)',
    conservationStatus: 'LC',
    environmentSpecs: 'Nhiệt độ: ngày 28-34°C, đêm 20-24°C, Độ ẩm: 80-95%, Ánh sáng: tán xạ trung bình, Môi trường: đầm lầy thấp râm mát',
    description: 'Cây nắp ấm đất thấp Đông Nam Á, mọc thành thảm ấm tròn dưới mặt đất. Thích nghi ăn mùn lá rụng bên cạnh bẫy côn trùng.',
    imageURL: 'https://bionexus.vn/species/nepenthes-ampullaria.jpg',
    referenceURL: 'https://www.gbif.org/species/3753696',
  },
];

export const SEED_PRODUCTS: ProductDto[] = [
  {
    id: 1,
    sellerProfileId: 1,
    speciesId: 4,
    productName: 'Leopard Gecko High Yellow (3 tháng tuổi)',
    price: 850000,
    stockQuantity: 5,
    description: 'Cá thể khỏe mạnh, ăn dế tốt, đã lột xác 3 lần.',
    imageUrl: 'https://bionexus.vn/images/prod-gecko-1.jpg',
    status: 'APPROVED',
    shopName: 'BioGreen Exotic',
    speciesCommonName: 'Thằn lằn da báo (Leopard Gecko)',
    speciesScientificName: 'Eublepharis macularius',
    conservationStatus: 'LC',
  },
  {
    id: 2,
    sellerProfileId: 1,
    speciesId: 4,
    productName: 'Leopard Gecko Tangerine Baby',
    price: 1200000,
    stockQuantity: 3,
    description: 'Màu cam đậm đột biến gen, giấy tờ nguồn gốc đầy đủ.',
    imageUrl: 'https://bionexus.vn/images/prod-gecko-2.jpg',
    status: 'APPROVED',
    shopName: 'BioGreen Exotic',
    speciesCommonName: 'Thằn lằn da báo (Leopard Gecko)',
    speciesScientificName: 'Eublepharis macularius',
    conservationStatus: 'LC',
  },
  {
    id: 3,
    sellerProfileId: 1,
    speciesId: 7,
    productName: 'Rồng Úc Hypo Baby (2 tháng tuổi)',
    price: 1500000,
    stockQuantity: 4,
    description: 'Cá thể ăn dế và rau tốt, đang chờ kiểm duyệt.',
    imageUrl: 'https://bionexus.vn/images/prod-bearded-dragon-1.jpg',
    status: 'PENDING',
    shopName: 'BioGreen Exotic',
    speciesCommonName: 'Rồng Úc (Central Bearded Dragon)',
    speciesScientificName: 'Pogona vitticeps',
    conservationStatus: 'LC',
  },
  {
    id: 4,
    sellerProfileId: 1,
    speciesId: 3,
    productName: 'Trăn bóng Pastel (4 tháng tuổi)',
    price: 2500000,
    stockQuantity: 2,
    description: 'Cá thể nhân giống, ăn chuột tốt, có giấy tờ nguồn gốc.',
    imageUrl: 'https://bionexus.vn/images/prod-ball-python-1.jpg',
    status: 'APPROVED',
    shopName: 'BioGreen Exotic',
    speciesCommonName: 'Trăn bóng (Ball Python)',
    speciesScientificName: 'Python regius',
    conservationStatus: 'NT',
  },
  {
    id: 5,
    sellerProfileId: 1,
    speciesId: 6,
    productName: 'Trăn đất Albino (6 tháng tuổi)',
    price: 2800000,
    stockQuantity: 1,
    description: 'Chưa đính kèm giấy tờ nguồn gốc.',
    imageUrl: 'https://bionexus.vn/images/prod-burmese-python-1.jpg',
    status: 'REJECTED',
    shopName: 'BioGreen Exotic',
    speciesCommonName: 'Trăn đất (Burmese Python)',
    speciesScientificName: 'Python bivittatus',
    conservationStatus: 'VU',
  },
  {
    id: 6,
    sellerProfileId: 1,
    speciesId: 8,
    productName: 'Rùa Hermann baby',
    price: 3500000,
    stockQuantity: 0,
    description: 'Rùa cạn con, ăn rau và cỏ; hiện đã bán hết.',
    imageUrl: 'https://bionexus.vn/images/prod-hermann-tortoise-1.jpg',
    status: 'SOLD_OUT',
    shopName: 'BioGreen Exotic',
    speciesCommonName: 'Rùa Hermann',
    speciesScientificName: 'Testudo hermanni',
    conservationStatus: 'VU',
  },
  {
    id: 7,
    sellerProfileId: 1,
    speciesId: 1,
    productName: 'Axolotl Leucistic (5 cm)',
    price: 450000,
    stockQuantity: 8,
    description: 'Axolotl hồng nhạt (leucistic) nhân giống nhân tạo.',
    imageUrl: 'https://bionexus.vn/images/prod-axolotl-1.jpg',
    status: 'APPROVED',
    shopName: 'BioGreen Exotic',
    speciesCommonName: 'Kỳ giông Mexico (Axolotl)',
    speciesScientificName: 'Ambystoma mexicanum',
    conservationStatus: 'CR',
  },
  {
    id: 8,
    sellerProfileId: 3,
    speciesId: 5,
    productName: 'Cây bắt ruồi Venus (Venus Flytrap)',
    price: 120000,
    stockQuantity: 40,
    description: 'Cây nuôi cấy mô, chậu 8 cm.',
    imageUrl: 'https://bionexus.vn/images/prod-venus-flytrap-1.jpg',
    status: 'APPROVED',
    shopName: 'Carnivora Garden',
    speciesCommonName: 'Cây bắt ruồi Venus',
    speciesScientificName: 'Dionaea muscipula',
    conservationStatus: 'VU',
  },
  {
    id: 9,
    sellerProfileId: 3,
    speciesId: 2,
    productName: 'Nắp ấm Rajah cây con',
    price: 2500000,
    stockQuantity: 2,
    description: 'Cây con nuôi cấy mô, có giấy tờ nguồn gốc.',
    imageUrl: 'https://bionexus.vn/images/prod-nepenthes-rajah-1.jpg',
    status: 'APPROVED',
    shopName: 'Carnivora Garden',
    speciesCommonName: 'Nắp ấm khổng lồ Rajah',
    speciesScientificName: 'Nepenthes rajah',
    conservationStatus: 'EN',
  },
  {
    id: 10,
    sellerProfileId: 3,
    speciesId: 9,
    productName: 'Nắp ấm Ampullaria xanh',
    price: 350000,
    stockQuantity: 10,
    description: 'Cây trưởng thành, đã ra túi bẫy.',
    imageUrl: 'https://bionexus.vn/images/prod-nepenthes-ampullaria-1.jpg',
    status: 'APPROVED',
    shopName: 'Carnivora Garden',
    speciesCommonName: 'Nắp ấm bình ba màu (Ampullaria)',
    speciesScientificName: 'Nepenthes ampullaria',
    conservationStatus: 'LC',
  },
];

export const SEED_CARTS: Record<number, SeedCartItem[]> = {
  // levanc (userId: 3): 2 valid items
  // product 7: Axolotl Leucistic (450,000) x 1
  // product 4: Trăn bóng Pastel (2,500,000) x 1
  // subtotal = 2,950,000 VND
  3: [
    { productId: 7, quantity: 1 },
    { productId: 4, quantity: 1 },
  ],
  // phamthid (userId: 4): 2 problematic items
  // product 2: Leopard Gecko Tangerine Baby (stock 3) x 5
  // product 6: Rùa Hermann baby (status SOLD_OUT) x 1
  4: [
    { productId: 2, quantity: 5 },
    { productId: 6, quantity: 1 },
  ],
};

export const SEED_ORDERS: SeedOrder[] = [
  {
    id: 1,
    orderCode: 'ORD-2026-0001',
    userId: 3, // levanc
    status: 'PENDING',
    totalAmount: 2050000,
    shippingAddress: 'Hải Châu, Đà Nẵng',
    createdAt: '2026-10-25T14:30:00Z',
    items: [
      { productId: 1, productName: 'Trăn bóng Normal F1 (3 tháng tuổi)', quantity: 1, unitPrice: 1200000, lineTotal: 1200000 },
      { productId: 3, productName: 'Leopard Gecko Tangerine Tremper Albino', quantity: 1, unitPrice: 850000, lineTotal: 850000 },
    ],
  },
  {
    id: 2,
    orderCode: 'ORD-2026-0002',
    userId: 3, // levanc
    status: 'COMPLETED',
    totalAmount: 590000,
    shippingAddress: 'Hải Châu, Đà Nẵng',
    createdAt: '2026-10-26T09:15:00Z',
    items: [
      { productId: 7, productName: 'Nắp ấm Ampullaria chùm ấm xanh đốm đỏ', quantity: 1, unitPrice: 320000, lineTotal: 320000 },
      { productId: 5, productName: 'Cây bắt ruồi Venus Akai Ryu (Red Dragon)', quantity: 1, unitPrice: 180000, lineTotal: 180000 },
    ],
  },
  {
    id: 3,
    orderCode: 'ORD-2026-0003',
    userId: 2, // tranthib
    status: 'COMPLETED',
    totalAmount: 1800000,
    shippingAddress: 'Cầu Giấy, Hà Nội',
    createdAt: '2026-10-26T16:45:00Z',
    items: [
      { productId: 5, productName: 'Cây bắt ruồi Venus Akai Ryu (Red Dragon)', quantity: 10, unitPrice: 180000, lineTotal: 1800000 },
    ],
  },
];
