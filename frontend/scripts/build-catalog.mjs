#!/usr/bin/env node
/**
 * scripts/build-catalog.mjs
 * Sinh dữ liệu mở rộng từ frontend/catalog/NN-x.json (nhóm 01–11 và 13, do Antigravity thu thập, Claude đã đối chiếu GBIF/Commons):
 * 1. Khối SQL giữa hai mốc CATALOG trong database/seed_data.sql (thay khối cũ nếu đã có).
 * 2. src/mocks/data/catalog.generated.ts: cùng dữ liệu cho MSW, id nối tiếp seed gốc theo đúng thứ tự INSERT.
 * 3. public/catalog/index.json + species-XX.json: hồ sơ mở rộng ngoài hợp đồng API (giống species-extras.ts của 9 loài gốc)
 *    cho giao diện tải lười; gộp nguồn ảnh từ catalog/_photos-manifest.json.
 * Chạy lại an toàn: kết quả chỉ phụ thuộc nội dung catalog. Dùng: node scripts/build-catalog.mjs [--check]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(FRONTEND_DIR, '..');
const CATALOG_DIR = path.join(FRONTEND_DIR, 'catalog');
const SEED_SQL = path.join(REPO_ROOT, 'database', 'seed_data.sql');
const MOCK_OUT = path.join(FRONTEND_DIR, 'src', 'mocks', 'data', 'catalog.generated.ts');
const CHECK_ONLY = process.argv.includes('--check');

const MARK_BEGIN = '    -- >>> CATALOG BEGIN';
const MARK_END = '    -- <<< CATALOG END';
const INSERT_BEFORE = '    -- 11. Kiểm tra seed';

const IUCN = new Set(['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX']);
const RANKS = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus'];
const RANK_SQL = { kingdom: 'KINGDOM', phylum: 'PHYLUM', class: 'CLASS', order: 'ORDER', family: 'FAMILY', genus: 'GENUS' };

// Seed gốc (khớp src/mocks/data/*.ts): 25 nút, 9 loài, 10 sản phẩm, 7 user, 5 shop
const SEED_COUNTS = { taxonomy: 25, species: 9, products: 10, users: 7, shops: 5 };
const SEED_NODES = [
  'Animalia', 'Plantae', 'Chordata', 'Tracheophyta', 'Reptilia', 'Amphibia', 'Magnoliopsida',
  'Squamata', 'Testudines', 'Caudata', 'Caryophyllales', 'Eublepharidae', 'Agamidae', 'Pythonidae',
  'Testudinidae', 'Ambystomatidae', 'Nepenthaceae', 'Droseraceae', 'Eublepharis', 'Pogona', 'Python',
  'Testudo', 'Ambystoma', 'Nepenthes', 'Dionaea',
];
const SEED_SHOP_IDS = { 'BioGreen Exotic': 1, 'Carnivora Garden': 3 };

// Tên Việt cho các cấp cao: catalog chỉ có taxonomyVi cho bộ, họ, chi
const HIGH_RANK_VI = {
  Arthropoda: 'Ngành Chân khớp', Mollusca: 'Ngành Thân mềm',
  Actinopterygii: 'Lớp Cá vây tia', Arachnida: 'Lớp Hình nhện', Merostomata: 'Lớp Đuôi kiếm',
  Malacostraca: 'Lớp Giáp mềm', Gastropoda: 'Lớp Chân bụng', Bivalvia: 'Lớp Hai mảnh vỏ',
  Insecta: 'Lớp Côn trùng', Liliopsida: 'Lớp Một lá mầm', Mammalia: 'Lớp Thú', Aves: 'Lớp Chim',
  Pinopsida: 'Lớp Thông',
};

// Shop mới cho từng nhóm (chủ shop là user test, mật khẩu thô giống seed gốc vì backend chưa băm)
const NEW_SHOPS = [
  { group: '02', shopName: 'Serpent Lab', bio: 'Trại nhân giống rắn cảnh có giấy tờ nguồn gốc.', user: { username: 'serpentlab', fullName: 'Ngô Minh Khoa', phone: '0971000201', address: 'Thủ Đức, TP.HCM' } },
  { group: '03', shopName: 'Rùa Xanh Garden', bio: 'Rùa cạn và rùa nước sinh sản nhân tạo, tư vấn chuồng nuôi.', user: { username: 'ruaxanh', fullName: 'Bùi Thanh Hà', phone: '0971000302', address: 'Biên Hòa, Đồng Nai' } },
  { group: '04', shopName: 'Frog Haven', bio: 'Ếch, cóc và kỳ giông cảnh nhân giống trong nước.', user: { username: 'froghaven', fullName: 'Đỗ Quang Huy', phone: '0971000403', address: 'Ninh Kiều, Cần Thơ' } },
  { group: '05', shopName: 'Aqua Việt', bio: 'Cá cảnh nước ngọt, cá thuỷ sinh và cá tầng đáy.', user: { username: 'aquaviet', fullName: 'Trịnh Bảo Ngọc', phone: '0971000504', address: 'Hoàng Mai, Hà Nội' } },
  { group: '06', shopName: 'Invert Studio', bio: 'Nhện, bọ cạp, tôm cảnh và ốc nuôi nhốt sinh sản.', user: { username: 'invertstudio', fullName: 'Lý Gia Bảo', phone: '0971000605', address: 'Hải Châu, Đà Nẵng' } },
  { group: '08', shopName: 'Đà Lạt Orchid & Cactus', bio: 'Lan, xương rồng, mọng nước và cây thuỷ sinh nuôi cấy mô.', user: { username: 'dalatorchid', fullName: 'Hồ Thị Lan', phone: '0971000806', address: 'Phường 9, Đà Lạt' } },
  { group: '10', shopName: 'Vườn Chim Hà Nội', bio: 'Chim cảnh nuôi sinh sản, có giấy phép.', user: { username: 'vuonchim', fullName: 'Phan Đức Thịnh', phone: '0971001007', address: 'Long Biên, Hà Nội' } },
  { group: '11', shopName: 'Reef House Nha Trang', bio: 'Cá cảnh biển nhân giống và thiết bị bể rạn.', user: { username: 'reefhouse', fullName: 'Võ Hải Đăng', phone: '0971001108', address: 'Nha Trang, Khánh Hòa' } },
  { group: '13', shopName: 'Pet Garden Sài Gòn', bio: 'Chó mèo thuần chủng và thú nhỏ từ trại nhân giống đăng ký, tiêm phòng và tẩy giun đầy đủ.', user: { username: 'petgarden', fullName: 'Đặng Thu Trang', phone: '0971001309', address: 'Gò Vấp, TP.HCM' } },
];
const GROUP_SHOP = { '01': 'BioGreen Exotic', '07': 'Carnivora Garden' };
for (const s of NEW_SHOPS) GROUP_SHOP[s.group] = s.shopName;
// Gà, cút, chim cảnh của nhóm thú cưng do shop chim bán
const shopOf = (s) => (s._group === '13' && s.taxonomy.class === 'Aves' ? GROUP_SHOP['10'] : GROUP_SHOP[s._group]);

// IUCN không đánh giá dạng thuần hoá (chó nhà, mèo nhà...) nhưng cột conservationStatus bắt buộc 1 trong 7 mức:
// lưu LC làm giá trị giữ chỗ, giao diện đọc cờ domestic trong public/catalog để ghi "Vật nuôi, IUCN không đánh giá"
const DOMESTIC_STATUS = 'LC';

// Khoá ảnh sản phẩm: slug loài + slug giống bỏ dấu tiếng Việt (khớp scripts/fetch-catalog-photos.mjs)
const asciiSlug = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const productKeyOf = (s, p) => `${slugOf(s.scientificName)}--${asciiSlug(p.breedEn || p.breedVi || p.nameVi)}`;

// ---------- Đọc và kiểm catalog ----------
// Nhóm 12 là ảnh bổ sung cho 9 loài gốc, không phải loài catalog
const files = fs.readdirSync(CATALOG_DIR).filter((f) => /^(0\d|1[013])-[a-z]\.json$/.test(f)).sort();
if (files.length === 0) throw new Error('Không có file catalog nào trong frontend/catalog');
const species = [];
const seen = new Set();
for (const f of files) {
  const group = f.slice(0, 2);
  for (const s of JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, f), 'utf8'))) {
    if (seen.has(s.scientificName)) throw new Error(`Trùng loài ${s.scientificName} (${f})`);
    if (!(s.domestic && s.iucn == null) && !IUCN.has(s.iucn)) throw new Error(`${s.scientificName}: IUCN "${s.iucn}" ngoài 7 mức database nhận`);
    for (const r of RANKS) if (!s.taxonomy?.[r]) throw new Error(`${s.scientificName}: thiếu taxonomy.${r}`);
    if (!s.scientificName.startsWith(`${s.taxonomy.genus} `)) throw new Error(`${s.scientificName}: không thuộc chi ${s.taxonomy.genus}`);
    seen.add(s.scientificName);
    species.push({ ...s, _group: group });
  }
}

// ---------- Cây phân loại: thêm nút chưa có, giữ thứ tự cấp ----------
const nodeByName = new Map(SEED_NODES.map((n) => [n, { existing: true }]));
const newNodes = Object.fromEntries(RANKS.map((r) => [r, []]));
for (const s of species) {
  const chain = RANKS.map((r) => s.taxonomy[r]);
  RANKS.forEach((rank, i) => {
    const name = chain[i];
    const parent = i === 0 ? null : chain[i - 1];
    const known = nodeByName.get(name);
    if (known) {
      if (!known.existing && known.parent !== parent) throw new Error(`Nút ${name} có hai cha: ${known.parent} và ${parent}`);
      return;
    }
    const vi = (s.taxonomyVi?.[rank] ?? HIGH_RANK_VI[name] ?? `${{ kingdom: 'Giới', phylum: 'Ngành', class: 'Lớp', order: 'Bộ', family: 'Họ', genus: 'Chi' }[rank]} ${name}`).slice(0, 100);
    const node = { name, vi, rank, parent };
    nodeByName.set(name, node);
    newNodes[rank].push(node);
  });
}

// ---------- Chuẩn hoá từng loài ----------
const range = (a, b) => (a == null && b == null ? null : `${Math.round(a ?? b)}-${Math.round(b ?? a)}`);
function environmentSpecs(e = {}) {
  const parts = [];
  const water = range(e.waterTempMin, e.waterTempMax);
  const temp = range(e.tempMin, e.tempMax);
  const bask = range(e.baskMin, e.baskMax);
  if (water) parts.push(`Nhiệt độ nước: ${water}°C`);
  else if (temp) parts.push(`Nhiệt độ: ${temp}°C${bask ? ` (điểm sưởi ${bask}°C)` : ''}`);
  const humid = range(e.humidMin, e.humidMax);
  if (humid) parts.push(`Độ ẩm: ${humid}%`);
  if (e.phMin != null || e.phMax != null) parts.push(`pH: ${e.phMin ?? e.phMax}-${e.phMax ?? e.phMin}`);
  // parseEnvironmentSpecs đọc "Môi trường:" tới cuối chuỗi nên phải đứng cuối
  if (e.habitatVi) parts.push(`Môi trường: ${e.habitatVi}`);
  return parts.join(', ');
}
const slugOf = (sci) => sci.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const clean = (t) => (t ?? '').replace(/\s*♂\s*/g, ' đực ').replace(/\s*♀\s*/g, ' cái ').replace(/[☀-➿]/g, '').replace(/\s{2,}/g, ' ').trim();
const deepClean = (v) => (typeof v === 'string' ? clean(v) : Array.isArray(v) ? v.map(deepClean) : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, deepClean(x)])) : v);
function commonName(s) {
  const vi = clean(s.commonNameVi);
  const en = clean(s.commonNameEn);
  const full = vi && en && vi.toLowerCase() !== en.toLowerCase() ? `${vi} (${en})` : vi || en || s.scientificName;
  return full.length <= 150 ? full : (vi || en).slice(0, 150);
}
// Băm ổn định để trạng thái, tồn kho của sản phẩm không đổi giữa các lần chạy
const hash = (str) => [...str].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const speciesRows = species.map((s, i) => ({
  id: SEED_COUNTS.species + i + 1,
  genus: s.taxonomy.genus,
  scientificName: s.scientificName,
  commonName: commonName(s),
  conservationStatus: s.iucn ?? DOMESTIC_STATUS,
  environmentSpecs: environmentSpecs(s.environment),
  description: clean(s.descriptionVi),
  imageUrl: `https://bionexus.vn/images/${slugOf(s.scientificName)}.jpg`,
  referenceUrl: `https://www.gbif.org/species/${s.gbifKey}`,
}));

const PRODUCT_MANIFEST = path.join(CATALOG_DIR, '_product-photos-manifest.json');
const productPhotos = fs.existsSync(PRODUCT_MANIFEST) ? JSON.parse(fs.readFileSync(PRODUCT_MANIFEST, 'utf8')) : {};
const productRows = [];
const productExtras = {};
const usedNames = new Set();
const usedKeys = new Set();
for (const s of species) {
  if (!s.trade?.tradeable) continue;
  const shopName = shopOf(s);
  if (!shopName) continue;
  for (const p of s.products ?? []) {
    let name = clean(p.nameVi).slice(0, 200);
    // Giỏ hàng và đơn hàng trong seed tra sản phẩm theo tên nên tên phải duy nhất
    for (let n = 2; usedNames.has(name); n++) name = `${clean(p.nameVi).slice(0, 190)} (mẫu ${n})`;
    usedNames.add(name);
    const h = hash(name);
    const bucket = h % 100;
    // Loài cần kiểm duyệt nguồn gốc (CITES, hoang dã bản địa...) thì tin đăng luôn chờ duyệt
    const status = s.trade.needsReview ? 'PENDING' : bucket < 84 ? 'APPROVED' : bucket < 91 ? 'PENDING' : bucket < 96 ? 'SOLD_OUT' : 'REJECTED';
    // Sản phẩm có ảnh riêng (giống chó, mèo...): imageUrl là đường dẫn tương đối tới ảnh trong bản build, chạy được cả dưới context /BioNexus
    const key = p.photos?.length ? productKeyOf(s, p) : null;
    if (key && usedKeys.has(key)) throw new Error(`Trùng khoá ảnh sản phẩm ${key}`);
    if (key) usedKeys.add(key);
    const photo = key ? productPhotos[key] : undefined;
    productRows.push({
      id: SEED_COUNTS.products + productRows.length + 1,
      shopName,
      scientificName: s.scientificName,
      productName: name,
      price: p.priceVnd,
      stockQuantity: status === 'SOLD_OUT' ? 0 : 1 + (h % 30),
      description: clean(p.descriptionVi),
      imageUrl: photo ? photo.src : `https://bionexus.vn/images/prod-${slugOf(s.scientificName)}.jpg`,
      status,
      photo,
    });
    // Thông tin giống (tính cách, kích thước, tuổi thọ...) ngoài hợp đồng API, tra theo tên sản phẩm
    if (p.breedVi) {
      productExtras[name] = deepClean({
        breedVi: p.breedVi, breedEn: p.breedEn ?? null, temperamentVi: p.temperamentVi ?? null, sizeVi: p.sizeVi ?? null,
        lifespanVi: p.lifespanVi ?? null, careVi: p.careVi ?? null, originVi: p.originVi ?? null,
      });
    }
  }
}

// ---------- SQL ----------
const q = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);
const nq = (v) => (v == null ? 'NULL' : `N'${String(v).replace(/'/g, "''")}'`);
const block = [];
block.push(MARK_BEGIN);
block.push('    -- 10b. Dữ liệu mở rộng SINH TỰ ĐỘNG bởi frontend/scripts/build-catalog.mjs từ frontend/catalog/*.json. Đừng sửa tay:');
block.push('    -- sửa catalog rồi chạy lại script. Tên khoa học, gbifKey, phân loại đã đối chiếu GBIF Backbone; IUCN đối chiếu Wikidata (P141);');
block.push(`    -- ảnh trên Wikimedia Commons đã kiểm giấy phép. ${speciesRows.length} loài, ${productRows.length} sản phẩm, ${NEW_SHOPS.length} shop mới.`);
block.push('    -- Có thêm mức EX. Vật nuôi thuần hoá (chó nhà, mèo nhà...) IUCN không đánh giá nên lưu LC làm giá trị giữ chỗ.');
block.push('    -- Sản phẩm có ảnh riêng thì imageUrl là đường dẫn tương đối photos/p/... trong bản build giao diện.');
block.push('    -- Users mới dùng mật khẩu thô giống khối 1 (backend chưa băm).');
block.push('');
block.push('    INSERT INTO Users (username, password_hash, email, fullName, phone, address, status)');
block.push('    VALUES');
block.push(NEW_SHOPS.map((s) => `    (${q(s.user.username)}, '123456', ${q(`${s.user.username}@example.com`)}, ${nq(s.user.fullName)}, ${q(s.user.phone)}, ${nq(s.user.address)}, 'ACTIVE')`).join(',\n') + ';');
block.push('');
block.push('    INSERT INTO SellerProfiles (userID, shopName, businessLicenseUrl, bio, status, approvedByAdminID)');
block.push('    SELECT u.userID, v.shopName, v.businessLicenseUrl, v.bio, \'ACTIVE\', a.adminID');
block.push('    FROM (VALUES');
block.push(NEW_SHOPS.map((s, i) => `        (${q(s.user.username)}, ${nq(s.shopName)}, ${q(`https://bionexus.vn/licenses/lic-${String(6 + i).padStart(2, '0')}.pdf`)}, ${nq(s.bio)})`).join(',\n'));
block.push('    ) AS v(username, shopName, businessLicenseUrl, bio)');
block.push('    LEFT JOIN Users  u ON u.username = v.username');
block.push("    LEFT JOIN Admins a ON a.account = 'moderator1';");
for (const rank of RANKS) {
  const nodes = newNodes[rank];
  if (!nodes.length) continue;
  block.push('');
  if (rank === 'kingdom') {
    block.push('    INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID)');
    block.push('    VALUES');
    block.push(nodes.map((n) => `    (${q(n.name)}, ${nq(n.vi)}, 'KINGDOM', NULL)`).join(',\n') + ';');
    continue;
  }
  block.push(`    INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID)`);
  block.push(`    SELECT v.scientificName, v.commonName, '${RANK_SQL[rank]}', p.nodeID`);
  block.push('    FROM (VALUES');
  block.push(nodes.map((n) => `        (${q(n.name)}, ${nq(n.vi)}, ${q(n.parent)})`).join(',\n'));
  block.push('    ) AS v(scientificName, commonName, parentName)');
  block.push('    LEFT JOIN TaxonomyNodes p ON p.scientificName = v.parentName;');
}
block.push('');
block.push('    INSERT INTO Species (nodeID, managedByAdminID, scientificName, commonName, conservationStatus, environmentSpecs, description, imageUrl, referenceUrl)');
block.push('    SELECT g.nodeID, a.adminID, v.scientificName, v.commonName, v.conservationStatus,');
block.push('           v.environmentSpecs, v.description, v.imageUrl, v.referenceUrl');
block.push('    FROM (VALUES');
block.push(speciesRows.map((s) => `        (${q(s.genus)}, ${q(s.scientificName)}, ${nq(s.commonName)}, ${q(s.conservationStatus)},\n         ${nq(s.environmentSpecs || null)},\n         ${nq(s.description || null)},\n         ${q(s.imageUrl)}, ${q(s.referenceUrl)})`).join(',\n'));
block.push('    ) AS v(genusName, scientificName, commonName, conservationStatus, environmentSpecs, description, imageUrl, referenceUrl)');
block.push('    LEFT JOIN TaxonomyNodes g ON g.scientificName = v.genusName');
block.push("    LEFT JOIN Admins        a ON a.account = 'biologist1';");
block.push('');
block.push('    INSERT INTO Products (sellerProfileID, speciesID, productName, price, stockQuantity, description, imageUrl, status, moderatedByAdminID)');
block.push('    SELECT sp.sellerProfileID, s.speciesID, v.productName, v.price, v.stockQuantity,');
block.push('           v.description, v.imageUrl, v.status, a.adminID');
block.push('    FROM (VALUES');
block.push(productRows.map((p) => `        (${nq(p.shopName)}, ${q(p.scientificName)}, ${nq(p.productName)}, ${p.price.toFixed(2)}, ${p.stockQuantity}, ${nq(p.description || null)}, ${q(p.imageUrl)}, '${p.status}', ${p.status === 'PENDING' ? 'NULL' : "'moderator1'"})`).join(',\n'));
block.push('    ) AS v(shopName, speciesName, productName, price, stockQuantity, description, imageUrl, status, moderatorAccount)');
block.push('    LEFT JOIN SellerProfiles sp ON sp.shopName = v.shopName');
block.push('    LEFT JOIN Species        s  ON s.scientificName = v.speciesName');
block.push('    LEFT JOIN Admins         a  ON a.account = v.moderatorAccount;');
block.push('');
// Khối kiểm tra cuối file không bắt được khoá ngoại NULL do tra sai tên, nên kiểm riêng ở đây
block.push('    IF EXISTS (SELECT 1 FROM Products WHERE sellerProfileID IS NULL OR speciesID IS NULL)');
block.push("        THROW 50010, N'Catalog: sản phẩm tra sai tên shop hoặc tên loài', 1;");
block.push('    IF EXISTS (SELECT 1 FROM Species WHERE nodeID IS NULL)');
block.push("        THROW 50011, N'Catalog: loài tra sai tên chi', 1;");
block.push(MARK_END);
const sqlBlock = block.join('\n') + '\n';

// ---------- Mock ----------
const idOf = new Map();
SEED_NODES.forEach((n, i) => idOf.set(n, i + 1));
const mockTaxonomy = [];
for (const rank of RANKS) {
  for (const n of newNodes[rank]) {
    const id = SEED_COUNTS.taxonomy + mockTaxonomy.length + 1;
    idOf.set(n.name, id);
    mockTaxonomy.push({ id, scientificName: n.name, commonName: n.vi, rank: RANK_SQL[rank], parentId: n.parent ? idOf.get(n.parent) : null });
  }
}
const mockUsers = NEW_SHOPS.map((s, i) => ({ id: SEED_COUNTS.users + i + 1, username: s.user.username, passwordHash: '123456', email: `${s.user.username}@example.com`, fullName: s.user.fullName, phone: s.user.phone, address: s.user.address, status: 'ACTIVE' }));
const shopId = new Map(Object.entries(SEED_SHOP_IDS));
const mockShops = NEW_SHOPS.map((s, i) => {
  const id = SEED_COUNTS.shops + i + 1;
  shopId.set(s.shopName, id);
  return { id, userId: mockUsers[i].id, shopName: s.shopName, businessLicenseUrl: `https://bionexus.vn/licenses/lic-${String(6 + i).padStart(2, '0')}.pdf`, bio: s.bio, status: 'ACTIVE', approvedByAdminId: 3, ownerFullName: s.user.fullName, ownerUsername: s.user.username };
});
const speciesId = new Map(speciesRows.map((s) => [s.scientificName, s.id]));
const speciesBySci = new Map(speciesRows.map((s) => [s.scientificName, s]));
const mockSpecies = speciesRows.map((s) => ({ id: s.id, nodeId: idOf.get(s.genus), scientificName: s.scientificName, commonName: s.commonName, conservationStatus: s.conservationStatus, environmentSpecs: s.environmentSpecs, description: s.description, imageURL: s.imageUrl, referenceURL: s.referenceUrl }));
const mockProducts = productRows.map((p) => ({ id: p.id, sellerProfileId: shopId.get(p.shopName), speciesId: speciesId.get(p.scientificName), productName: p.productName, price: p.price, stockQuantity: p.stockQuantity, description: p.description, imageUrl: p.imageUrl, status: p.status, shopName: p.shopName, speciesCommonName: speciesBySci.get(p.scientificName).commonName, speciesScientificName: p.scientificName, conservationStatus: speciesBySci.get(p.scientificName).conservationStatus }));

const ts = `// SINH TỰ ĐỘNG bởi scripts/build-catalog.mjs từ frontend/catalog/*.json. Đừng sửa tay.
// Khớp khối CATALOG trong database/seed_data.sql; id nối tiếp seed gốc theo thứ tự INSERT.
import type { MockUser, MockSellerProfile, MockTaxonomyNode, MockSpecies, MockProduct } from '../types';

export const CATALOG_USERS: MockUser[] = ${JSON.stringify(mockUsers)};

export const CATALOG_SHOPS: MockSellerProfile[] = ${JSON.stringify(mockShops)};

export const CATALOG_TAXONOMY: MockTaxonomyNode[] = ${JSON.stringify(mockTaxonomy)};

export const CATALOG_SPECIES: MockSpecies[] = ${JSON.stringify(mockSpecies)};

export const CATALOG_PRODUCTS: MockProduct[] = ${JSON.stringify(mockProducts)};
`;

// ---------- Hồ sơ mở rộng cho giao diện ----------
// 16 mảnh theo băm FNV-1a của slug: giao diện tự tính mảnh từ tên loài, không cần tải chỉ mục trước (khớp src/api/catalog.ts)
const SHARDS = 16;
const shardOf = (slug) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < slug.length; i++) h = Math.imul(h ^ slug.charCodeAt(i), 0x01000193) >>> 0;
  return h % SHARDS;
};
const MANIFEST = path.join(CATALOG_DIR, '_photos-manifest.json');
const photoManifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
const PUBLIC_CATALOG = path.join(FRONTEND_DIR, 'public', 'catalog');
const photoOf = (m) => m && { src: m.src, width: m.width, height: m.height, color: m.color, author: m.author, license: m.license, licenseUrl: m.licenseUrl, sourceUrl: m.sourceUrl, ...(m.modified ? { modified: true } : {}) };
const catalogIndex = [];
const catalogCredits = [];
const shards = Array.from({ length: SHARDS }, () => ({}));
for (const s of species) {
  const slug = slugOf(s.scientificName);
  const m = photoManifest[s.scientificName] ?? {};
  catalogIndex.push({
    s: s.scientificName, slug, g: s.group,
    ...(m.hero ? { h: 1 } : {}), ...(m.portrait ? { p: 1 } : {}), ...(m.portrait?.color ? { c: m.portrait.color } : {}),
    // Vật nuôi thuần hoá: thẻ loài, thẻ sản phẩm ghi "Vật nuôi" thay cho mức IUCN giữ chỗ
    ...(s.domestic ? { d: 1 } : {}),
    // Toạ độ và vùng cho bản đồ, địa cầu, ô tìm kiếm ở trang danh sách (không cần tải mảnh hồ sơ)
    ...(s.origin ? { o: [s.origin.lat, s.origin.lng], r: clean(s.regionVi || s.origin.place) } : {}),
  });
  for (const role of ['hero', 'portrait']) if (m[role]) catalogCredits.push({ scientificName: s.scientificName, role, ...photoOf(m[role]) });
  shards[shardOf(slug)][s.scientificName] = deepClean({
    scientificName: s.scientificName, slug, group: s.group,
    commonNameVi: s.commonNameVi || null, commonNameEn: s.commonNameEn || null,
    otherNamesVi: s.otherNamesVi ?? [], synonyms: s.synonyms ?? [],
    regionVi: s.regionVi ?? null, origin: s.origin ?? null,
    iucnAssessedYear: s.iucnAssessedYear ?? null, populationTrend: s.populationTrend ?? null, iucnUrl: s.iucnUrl ?? null,
    wikipediaVi: s.wikipediaVi ?? null, wikipediaEn: s.wikipediaEn ?? null, wikidataId: s.wikidataId ?? null,
    size: s.size ?? null, distribution: s.distribution ?? null, habitatTypesVi: s.habitatTypesVi ?? [],
    identificationVi: s.identificationVi ?? null, behaviorVi: s.behaviorVi ?? null, reproductionVi: s.reproductionVi ?? null,
    threatsVi: s.threatsVi ?? [], funFactsVi: s.funFactsVi ?? [], similarSpecies: s.similarSpecies ?? [],
    dietVi: s.dietVi ?? null, lifespanVi: s.lifespanVi ?? null, activityTimeVi: s.activityTimeVi ?? null,
    conservationNoteVi: s.conservationNoteVi ?? null, pullQuoteVi: s.pullQuoteVi || null,
    care: s.care ?? null,
    trade: { tradeable: !!s.trade?.tradeable, cites: s.trade?.cites ?? null, vnProtected: s.trade?.vnProtected ?? null, ...(s.trade?.needsReview ? { needsReview: true, reasonVi: s.trade.reasonVi ?? null } : {}) },
    ...(s.domestic ? { domestic: true, wildAncestor: s.wildAncestor ?? null } : {}),
    ...(s.vaccinationVi ? { vaccinationVi: s.vaccinationVi } : {}),
    ...(s.legalNoteVi ? { legalNoteVi: s.legalNoteVi } : {}),
    photos: { hero: photoOf(m.hero) ?? null, portrait: photoOf(m.portrait) ?? null },
    sources: s.sources ?? [],
  });
}
for (const p of productRows) if (p.photo) catalogCredits.push({ scientificName: p.scientificName, role: 'product', productName: p.productName, ...photoOf(p.photo) });

// ---------- Ghi ----------
const seed = fs.readFileSync(SEED_SQL, 'utf8');
const eol = seed.includes('\r\n') ? '\r\n' : '\n';
const lf = seed.replace(/\r\n/g, '\n');
let next;
if (lf.includes(MARK_BEGIN)) {
  const a = lf.indexOf(MARK_BEGIN);
  const b = lf.indexOf(MARK_END) + MARK_END.length + 1;
  next = lf.slice(0, a) + sqlBlock + lf.slice(b);
} else {
  const at = lf.indexOf(INSERT_BEFORE);
  if (at < 0) throw new Error('Không tìm thấy mốc "-- 11. Kiểm tra seed" trong seed_data.sql');
  next = lf.slice(0, at) + sqlBlock + '\n' + lf.slice(at);
}
const stats = `${speciesRows.length} loài, ${productRows.length} sản phẩm (${productRows.filter((p) => p.status === 'APPROVED').length} APPROVED), ${mockTaxonomy.length} nút phân loại mới, ${NEW_SHOPS.length} shop mới`;
if (CHECK_ONLY) {
  console.log('[check]', stats);
} else {
  fs.writeFileSync(SEED_SQL, next.replace(/\n/g, eol));
  fs.writeFileSync(MOCK_OUT, ts);
  fs.mkdirSync(PUBLIC_CATALOG, { recursive: true });
  fs.writeFileSync(path.join(PUBLIC_CATALOG, 'index.json'), JSON.stringify(catalogIndex));
  fs.writeFileSync(path.join(PUBLIC_CATALOG, 'credits.json'), JSON.stringify(catalogCredits));
  fs.writeFileSync(path.join(PUBLIC_CATALOG, 'products.json'), JSON.stringify(productExtras));
  shards.forEach((sh, i) => fs.writeFileSync(path.join(PUBLIC_CATALOG, `species-${String(i).padStart(2, '0')}.json`), JSON.stringify(sh)));
  console.log('Đã ghi', path.relative(REPO_ROOT, SEED_SQL), ',', path.relative(REPO_ROOT, MOCK_OUT), 'và public/catalog/');
  console.log(stats, `| ảnh: ${catalogIndex.filter((x) => x.h).length} hero, ${catalogIndex.filter((x) => x.p).length} portrait`);
}
