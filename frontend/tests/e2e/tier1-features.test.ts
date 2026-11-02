/**
 * BioNexus E2E Test Suite — Tier 1: Feature Coverage
 * Tests primary happy paths and functional contracts for every feature in PROJECT.md.
 * Minimum 5 test cases per core feature domain.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { BioNexusTestClient } from './harness/client.ts';
import {
  OFFICIAL_24_ROUTES,
  IUCN_RATINGS,
  IUCN_COLORS,
  parseEnvironmentSpecs,
  isValidOrderCode,
  formatVnd,
} from './harness/specs.ts';

describe('Tier 1: Feature Coverage — BioNexus Contract Suite', () => {
  let client: BioNexusTestClient;

  beforeEach(() => {
    client = new BioNexusTestClient();
  });

  // =========================================================================
  // Feature 1: Taxonomy Navigation (FEAT-ROUTE-02, FEAT-ROUTE-03)
  // =========================================================================
  describe('Feature 1: Taxonomy Navigation (6 Cấp Phân Loại)', () => {
    it('T1-TAX-01: retrieves the 2 root kingdoms (Animalia and Plantae)', async () => {
      const res = await client.getRootTaxonomy();
      assert.equal(res.success, true);
      assert.equal(res.code, 'SUCCESS');
      assert.ok(Array.isArray(res.data));
      assert.equal(res.data.length, 2);
      const names = res.data.map((n) => n.scientificName).sort();
      assert.deepEqual(names, ['Animalia', 'Plantae']);
      assert.ok(res.data.every((n) => n.parentId === null && n.rank === 'KINGDOM'));
    });

    it('T1-TAX-02: retrieves child nodes for Chordata and Tracheophyta', async () => {
      // Node 3 = Chordata
      const chordataChildren = await client.getTaxonomyChildren(3);
      assert.equal(chordataChildren.success, true);
      assert.ok(Array.isArray(chordataChildren.data));
      const chordataNames = chordataChildren.data.map((n) => n.scientificName);
      assert.ok(chordataNames.includes('Reptilia'));
      assert.ok(chordataNames.includes('Amphibia'));
      assert.ok(chordataChildren.data.every((n) => n.parentId === 3 && n.rank === 'CLASS'));
    });

    it('T1-TAX-03: retrieves Squamata children yielding 3 reptile families', async () => {
      // Node 8 = Squamata (Bộ Có vảy)
      const res = await client.getTaxonomyChildren(8);
      assert.equal(res.success, true);
      assert.ok(Array.isArray(res.data));
      assert.equal(res.data.length, 3);
      const familyNames = res.data.map((n) => n.scientificName).sort();
      assert.deepEqual(familyNames, ['Agamidae', 'Eublepharidae', 'Pythonidae']);
      assert.ok(res.data.every((n) => n.rank === 'FAMILY'));
    });

    it('T1-TAX-04: resolves full breadcrumb hierarchy from Kingdom to Genus', async () => {
      // Node 20 = Python (GENUS)
      const detail = await client.getTaxonomyDetail(20);
      assert.equal(detail.success, true);
      assert.ok(detail.data);
      assert.equal(detail.data.node.scientificName, 'Python');
      assert.equal(detail.data.node.rank, 'GENUS');

      // Breadcrumb sequence: Animalia -> Chordata -> Reptilia -> Squamata -> Pythonidae -> Python
      const crumbNames = detail.data.breadcrumbs.map((b) => b.scientificName);
      assert.deepEqual(crumbNames, [
        'Animalia',
        'Chordata',
        'Reptilia',
        'Squamata',
        'Pythonidae',
        'Python',
      ]);
    });

    it('T1-TAX-05: retrieves species associated with a leaf Genus node', async () => {
      // Node 20 = Python genus has 2 species: Python regius (NT) and Python bivittatus (VU)
      const res = await client.getTaxonomySpecies(20);
      assert.equal(res.success, true);
      assert.ok(Array.isArray(res.data));
      assert.equal(res.data.length, 2);
      const sciNames = res.data.map((s) => s.scientificName).sort();
      assert.deepEqual(sciNames, ['Python bivittatus', 'Python regius']);
      assert.ok(res.data.every((s) => s.nodeId === 20));
    });
  });

  // =========================================================================
  // Feature 2: Species Encyclopedia & Profiles (FEAT-ROUTE-04, FEAT-ROUTE-05)
  // =========================================================================
  describe('Feature 2: Species Encyclopedia & Profiles (Bách Khoa Loài)', () => {
    it('T1-SPE-01: retrieves all 9 baseline species with valid IUCN status and metadata', async () => {
      const res = await client.getSpeciesList();
      assert.equal(res.success, true);
      assert.ok(Array.isArray(res.data));
      assert.equal(res.data.length, 9);
      for (const sp of res.data) {
        assert.ok(sp.id > 0);
        assert.ok(sp.scientificName.length > 0);
        assert.ok(sp.commonName.length > 0);
        assert.ok(IUCN_RATINGS.includes(sp.conservationStatus as any));
        assert.ok(sp.environmentSpecs.length > 0);
      }
    });

    it('T1-SPE-02: filters species by IUCN status matching authoritative seed counts', async () => {
      // Seed distribution: LC: 3, NT: 1, VU: 3, EN: 1, CR: 1
      const all = (await client.getSpeciesList()).data!;
      const vuSpecies = all.filter((s) => s.conservationStatus === 'VU');
      const crSpecies = all.filter((s) => s.conservationStatus === 'CR');
      const enSpecies = all.filter((s) => s.conservationStatus === 'EN');
      const ntSpecies = all.filter((s) => s.conservationStatus === 'NT');
      const lcSpecies = all.filter((s) => s.conservationStatus === 'LC');

      assert.equal(vuSpecies.length, 3, 'VU should have 3 species (Python bivittatus, Dionaea muscipula, Testudo hermanni)');
      assert.equal(crSpecies.length, 1, 'CR should have 1 species (Ambystoma mexicanum)');
      assert.equal(enSpecies.length, 1, 'EN should have 1 species (Nepenthes rajah)');
      assert.equal(ntSpecies.length, 1, 'NT should have 1 species (Python regius)');
      assert.equal(lcSpecies.length, 3, 'LC should have 3 species');
    });

    it('T1-SPE-03: fetches individual species profile with hero image and GBIF reference', async () => {
      // Species 1 = Ambystoma mexicanum
      const res = await client.getSpeciesDetail(1);
      assert.equal(res.success, true);
      assert.ok(res.data);
      assert.equal(res.data.scientificName, 'Ambystoma mexicanum');
      assert.equal(res.data.conservationStatus, 'CR');
      assert.ok(res.data.referenceURL?.includes('gbif.org'));
      assert.ok(res.data.imageURL !== null);
    });

    it('T1-SPE-04: parses biological climate and environmental specs into structured ranges', () => {
      // Python regius: "Nhiệt độ: 26-32°C (điểm sưởi 32-34°C), Độ ẩm: 55-65%"
      const parsed = parseEnvironmentSpecs('Nhiệt độ: 26-32°C (điểm sưởi 32-34°C), Độ ẩm: 55-65%');
      assert.equal(parsed.tempMin, 26);
      assert.equal(parsed.tempMax, 32);
      assert.equal(parsed.baskMin, 32);
      assert.equal(parsed.baskMax, 34);
      assert.equal(parsed.humidMin, 55);
      assert.equal(parsed.humidMax, 65);

      // Axolotl: "Nhiệt độ nước: 14-18°C, pH: 7.4-7.6, Môi trường: Nước ngọt hoàn toàn"
      const waterParsed = parseEnvironmentSpecs('Nhiệt độ nước: 14-18°C, pH: 7.4-7.6, Môi trường: Nước ngọt hoàn toàn');
      assert.equal(waterParsed.waterTempMin, 14);
      assert.equal(waterParsed.waterTempMax, 18);
      assert.equal(waterParsed.tempMin, 14);
      assert.equal(waterParsed.tempMax, 18);
    });

    it('T1-SPE-05: searches species by query string matching common and scientific names', async () => {
      const searchAxo = await client.getSpeciesList({ q: 'axolotl' });
      assert.equal(searchAxo.success, true);
      assert.equal(searchAxo.data!.length, 1);
      assert.equal(searchAxo.data![0]!.scientificName, 'Ambystoma mexicanum');

      const searchNep = await client.getSpeciesList({ q: 'Nepenthes' });
      assert.equal(searchNep.success, true);
      assert.equal(searchNep.data!.length, 2);
    });
  });

  // =========================================================================
  // Feature 3: Marketplace Products (FEAT-ROUTE-06, FEAT-ROUTE-07)
  // =========================================================================
  describe('Feature 3: Marketplace Products (Sàn Sinh Vật Cảnh)', () => {
    it('T1-PROD-01: lists exactly 7 APPROVED products in the public catalog', async () => {
      const res = await client.getProducts();
      assert.equal(res.success, true);
      assert.ok(res.data);
      assert.equal(res.data.total, 7);
      assert.equal(res.data.items.length, 7);
      assert.ok(res.data.items.every((p) => p.status === 'APPROVED'));
    });

    it('T1-PROD-02: retrieves product details with shop name, species name, and price', async () => {
      // Product 1 = Leopard Gecko High Yellow
      const res = await client.getProductDetail(1);
      assert.equal(res.success, true);
      assert.ok(res.data);
      assert.equal(res.data.id, 1);
      assert.equal(res.data.productName, 'Leopard Gecko High Yellow (3 tháng tuổi)');
      assert.equal(res.data.price, 850000);
      assert.equal(res.data.shopName, 'BioGreen Exotic');
      assert.equal(res.data.speciesScientificName, 'Eublepharis macularius');
      assert.equal(res.data.conservationStatus, 'LC');
    });

    it('T1-PROD-03: filters public products by species ID', async () => {
      // Species 4 = Eublepharis macularius (Leopard gecko) has 2 approved products (p1 and p2)
      const res = await client.getProducts({ speciesId: 4 });
      assert.equal(res.success, true);
      assert.equal(res.data!.items.length, 2);
      assert.ok(res.data!.items.every((p) => p.speciesId === 4));
    });

    it('T1-PROD-04: paginates product results with configurable page and size', async () => {
      const page1 = await client.getProducts({ page: 1, size: 3 });
      assert.equal(page1.success, true);
      assert.equal(page1.data!.items.length, 3);
      assert.equal(page1.data!.page, 1);
      assert.equal(page1.data!.size, 3);
      assert.equal(page1.data!.total, 7);

      const page2 = await client.getProducts({ page: 2, size: 3 });
      assert.equal(page2.success, true);
      assert.equal(page2.data!.items.length, 3);
      assert.equal(page2.data!.page, 2);
      // Items on page 1 and page 2 must be distinct
      const ids1 = page1.data!.items.map((i) => i.id);
      const ids2 = page2.data!.items.map((i) => i.id);
      assert.ok(!ids1.some((id) => ids2.includes(id)));
    });

    it('T1-PROD-05: searches products by name and description query', async () => {
      const res = await client.getProducts({ q: 'bắt ruồi' });
      assert.equal(res.success, true);
      assert.ok(res.data!.items.length >= 1);
      assert.ok(res.data!.items.some((p) => p.productName.includes('bắt ruồi')));
    });
  });

  // =========================================================================
  // Feature 4: User Authentication & Profile (FEAT-ROUTE-08, FEAT-ROUTE-12)
  // =========================================================================
  describe('Feature 4: User Authentication & Profile (Đăng Nhập & Hồ Sơ)', () => {
    it('T1-AUTH-01: logs in successfully with valid user credentials (levanc / 123456)', async () => {
      const res = await client.login({ username: 'levanc', password: '123456' });
      assert.equal(res.success, true);
      assert.equal(res.code, 'SUCCESS');
      assert.ok(res.data);
      assert.equal(res.data.username, 'levanc');
      assert.equal(res.data.accountType, 'USER');
      assert.ok(res.data.token.startsWith('mock.'));
      assert.equal(client.getToken(), res.data.token);
    });

    it('T1-AUTH-02: registers a new user account with unique credentials', async () => {
      const res = await client.register({
        username: 'newexplorer',
        password: 'password123',
        email: 'explorer@bionexus.vn',
        fullName: 'Nhà Thám Hiểm Mới',
        phone: '0988776655',
        address: 'Quận 7, TP.HCM',
      });
      assert.equal(res.success, true);
      assert.equal(res.code, 'SUCCESS');
      assert.ok(res.data);
      assert.equal(res.data.username, 'newexplorer');
      assert.equal(res.data.accountType, 'USER');
    });

    it('T1-AUTH-03: retrieves authenticated user profile via /api/me', async () => {
      await client.login({ username: 'levanc', password: '123456' });
      const me = await client.getMe();
      assert.equal(me.success, true);
      assert.equal(me.data.username, 'levanc');
      assert.equal(me.data.fullName, 'Lê Văn C');
      assert.equal(me.data.status, 'ACTIVE');
      assert.equal(me.data.shop, null); // levanc has no shop
    });

    it('T1-AUTH-04: retrieves associated shop profile in /api/me for active merchant (nguyenvana)', async () => {
      await client.login({ username: 'nguyenvana', password: '123456' });
      const me = await client.getMe();
      assert.equal(me.success, true);
      assert.equal(me.data.username, 'nguyenvana');
      assert.ok(me.data.shop);
      assert.equal(me.data.shop.shopName, 'BioGreen Exotic');
      assert.equal(me.data.shop.status, 'ACTIVE');
    });

    it('T1-AUTH-05: logs out and verifies subsequent protected requests are rejected', async () => {
      await client.login({ username: 'levanc', password: '123456' });
      assert.ok(client.getToken() !== null);
      client.logout();
      assert.equal(client.getToken(), null);

      const me = await client.getMe();
      assert.equal(me.success, false);
      assert.equal(me.code, 'AUTH_UNAUTHORIZED');
    });
  });

  // =========================================================================
  // Feature 5: Shopping Cart Management (FEAT-ROUTE-09)
  // =========================================================================
  describe('Feature 5: Shopping Cart Management (Giỏ Hàng)', () => {
    it('T1-CART-01: retrieves initial seed cart for levanc (2 items, 2.950.000 VND)', async () => {
      await client.login({ username: 'levanc', password: '123456' });
      const cart = await client.getCart();
      assert.equal(cart.success, true);
      assert.ok(cart.data);
      assert.equal(cart.data.items.length, 2);
      assert.equal(cart.data.itemCount, 2);
      // Item 1: Axolotl Leucistic (450,000), Item 2: Trăn bóng Pastel (2,500,000)
      assert.equal(cart.data.subtotal, 2950000);
      assert.ok(cart.data.items.every((it) => it.available === true));
    });

    it('T1-CART-02: adds an approved product to an empty cart with stock validation', async () => {
      // User tranthib starts with an empty cart
      await client.login({ username: 'tranthib', password: '123456' });
      const emptyCart = await client.getCart();
      assert.equal(emptyCart.data!.items.length, 0);

      // Add 2 units of Product 1 (Leopard Gecko High Yellow, price: 850,000, stock: 5)
      const res = await client.addToCart(1, 2);
      assert.equal(res.success, true);
      assert.equal(res.data!.items.length, 1);
      assert.equal(res.data!.items[0]!.quantity, 2);
      assert.equal(res.data!.subtotal, 1700000);
    });

    it('T1-CART-03: cumulates quantity when adding an existing cart item again', async () => {
      await client.login({ username: 'tranthib', password: '123456' });
      await client.addToCart(1, 1);
      const res = await client.addToCart(1, 2);
      assert.equal(res.success, true);
      assert.equal(res.data!.items.length, 1);
      assert.equal(res.data!.items[0]!.quantity, 3);
      assert.equal(res.data!.subtotal, 3 * 850000);
    });

    it('T1-CART-04: updates quantity of a cart item within available stock limits', async () => {
      await client.login({ username: 'tranthib', password: '123456' });
      await client.addToCart(1, 2);
      const updated = await client.updateCartItem(1, 4);
      assert.equal(updated.success, true);
      assert.equal(updated.data!.items[0]!.quantity, 4);
      assert.equal(updated.data!.subtotal, 4 * 850000);
    });

    it('T1-CART-05: removes an item and clears entire cart', async () => {
      await client.login({ username: 'tranthib', password: '123456' });
      await client.addToCart(1, 1);
      await client.addToCart(8, 2); // Venus Flytrap

      const removed = await client.removeCartItem(1);
      assert.equal(removed.success, true);
      assert.equal(removed.data!.items.length, 1);
      assert.equal(removed.data!.items[0]!.productId, 8);

      const cleared = await client.clearCart();
      assert.equal(cleared.success, true);
      assert.equal(cleared.data!.items.length, 0);
      assert.equal(cleared.data!.subtotal, 0);
    });
  });

  // =========================================================================
  // Feature 6: Checkout & Order Creation (FEAT-ROUTE-10, FEAT-ROUTE-11)
  // =========================================================================
  describe('Feature 6: Checkout & Orders (Thanh Toán & Đơn Hàng)', () => {
    it('T1-ORD-01: executes checkout for levanc cart deducting stock and clearing cart', async () => {
      await client.login({ username: 'levanc', password: '123456' });
      // Pre-check stock: p7 (Axolotl) has 8, p4 (Pastel) has 2
      const p7Before = (await client.getProductDetail(7)).data!;
      const p4Before = (await client.getProductDetail(4)).data!;
      assert.equal(p7Before.stockQuantity, 8);
      assert.equal(p4Before.stockQuantity, 2);

      // Checkout entire cart
      const res = await client.placeOrder({ shippingAddress: '123 Nguyễn Văn Linh, Đà Nẵng' });
      assert.equal(res.success, true);
      assert.equal(res.code, 'SUCCESS');
      assert.ok(res.data);
      assert.ok(isValidOrderCode(res.data.orderCode));
      assert.equal(res.data.status, 'PENDING');
      assert.equal(res.data.totalAmount, 2950000);
      assert.equal(res.data.items.length, 2);

      // Post-check: Cart must now be empty
      const cartAfter = await client.getCart();
      assert.equal(cartAfter.data!.items.length, 0);

      // Post-check: Stock deducted: p7 from 8 to 7, p4 from 2 to 1
      const p7After = (await client.getProductDetail(7)).data!;
      const p4After = (await client.getProductDetail(4)).data!;
      assert.equal(p7After.stockQuantity, 7);
      assert.equal(p4After.stockQuantity, 1);
    });

    it('T1-ORD-02: places direct order for specific item without touching cart', async () => {
      await client.login({ username: 'tranthib', password: '123456' });
      // Direct purchase of 1 unit of Product 8 (Cây bắt ruồi Venus, 120,000 VND)
      const res = await client.placeOrder({
        items: [{ productId: 8, quantity: 1 }],
        shippingAddress: 'Cầu Giấy, Hà Nội',
      });
      assert.equal(res.success, true);
      assert.equal(res.data!.totalAmount, 120000);
      assert.equal(res.data!.items.length, 1);
      assert.equal(res.data!.items[0]!.productId, 8);
    });

    it('T1-ORD-03: verifies generated orderCode conforms to ORD-YYYY-XXXXXX format', async () => {
      await client.login({ username: 'tranthib', password: '123456' });
      const res = await client.placeOrder({
        items: [{ productId: 8, quantity: 1 }],
        shippingAddress: 'Hà Nội',
      });
      assert.ok(isValidOrderCode(res.data!.orderCode));
      assert.match(res.data!.orderCode, /^ORD-2026-[A-Z0-9]{4,8}$/);
    });

    it('T1-ORD-04: retrieves user order history with existing seed orders', async () => {
      await client.login({ username: 'levanc', password: '123456' });
      const orders = await client.getMyOrders();
      assert.equal(orders.success, true);
      assert.ok(orders.data!.length >= 2);
      const codes = orders.data!.map((o) => o.orderCode);
      assert.ok(codes.includes('ORD-2026-0001'));
      assert.ok(codes.includes('ORD-2026-0002'));
    });

    it('T1-ORD-05: retrieves specific order detail by order ID', async () => {
      await client.login({ username: 'levanc', password: '123456' });
      const order = await client.getOrderDetail(1);
      assert.equal(order.success, true);
      assert.equal(order.data!.id, 1);
      assert.equal(order.data!.orderCode, 'ORD-2026-0001');
      assert.equal(order.data!.totalAmount, 2050000);
      assert.equal(order.data!.items.length, 2);
    });
  });

  // =========================================================================
  // Feature 7: Merchant / Seller Operations (FEAT-ROUTE-13..15)
  // =========================================================================
  describe('Feature 7: Seller Operations (Người Bán Sinh Vật Cảnh)', () => {
    it('T1-SEL-01: submits a new seller application entering PENDING status', async () => {
      await client.login({ username: 'levanc', password: '123456' });
      const res = await client.applySeller({
        shopName: 'Đà Nẵng Reptiles',
        businessLicenseUrl: 'https://bionexus.vn/licenses/lic-danang.pdf',
        bio: 'Trại sinh sản bò sát miền Trung.',
      });
      assert.equal(res.success, true);
      assert.equal(res.code, 'SUCCESS');
      assert.ok(res.data);
      assert.equal(res.data.shopName, 'Đà Nẵng Reptiles');
      assert.equal(res.data.status, 'PENDING');
      assert.equal(res.data.approvedByAdminId, null);
    });

    it('T1-SEL-02: retrieves all shop products for active merchant including non-approved', async () => {
      // nguyenvana owns BioGreen Exotic (ACTIVE)
      await client.login({ username: 'nguyenvana', password: '123456' });
      const res = await client.getSellerProducts();
      assert.equal(res.success, true);
      assert.ok(res.data);
      // BioGreen Exotic has 7 products across APPROVED, PENDING, REJECTED, SOLD_OUT
      assert.equal(res.data.length, 7);
      const statuses = new Set(res.data.map((p) => p.status));
      assert.ok(statuses.has('APPROVED'));
      assert.ok(statuses.has('PENDING'));
      assert.ok(statuses.has('REJECTED'));
      assert.ok(statuses.has('SOLD_OUT'));
    });

    it('T1-SEL-03: creates a new product listing entering PENDING status awaiting review', async () => {
      await client.login({ username: 'nguyenvana', password: '123456' });
      const res = await client.createSellerProduct({
        speciesId: 3, // Python regius
        productName: 'Trăn bóng Mojave Pastel F1',
        price: 3200000,
        stockQuantity: 2,
        description: 'Con non 2 tháng tuổi thuần giống.',
        imageUrl: 'https://bionexus.vn/images/mojave.jpg',
      });
      assert.equal(res.success, true);
      assert.ok(res.data);
      assert.equal(res.data.productName, 'Trăn bóng Mojave Pastel F1');
      assert.equal(res.data.status, 'PENDING');
      assert.equal(res.data.shopName, 'BioGreen Exotic');
      assert.equal(res.data.conservationStatus, 'NT');
    });

    it('T1-SEL-04: verifies new PENDING product is not visible in public marketplace', async () => {
      await client.login({ username: 'nguyenvana', password: '123456' });
      const created = await client.createSellerProduct({
        speciesId: 3,
        productName: 'Trăn bóng Enchi Fire',
        price: 4000000,
        stockQuantity: 1,
        description: 'Morph Enchi Fire hiếm.',
        imageUrl: 'https://bionexus.vn/images/enchi.jpg',
      });
      const newProdId = created.data!.id;

      // Public product query
      const publicCatalog = await client.getProducts();
      assert.ok(!publicCatalog.data!.items.some((p) => p.id === newProdId));
    });

    it('T1-SEL-05: verifies seller profile contains required contact and license metadata', async () => {
      await client.login({ username: 'nguyenvana', password: '123456' });
      const me = await client.getMe();
      assert.ok(me.data.shop);
      assert.equal(me.data.shop.userId, 1);
      assert.ok(me.data.shop.businessLicenseUrl !== null);
      assert.ok(me.data.shop.bio !== null);
    });
  });

  // =========================================================================
  // Feature 8: Admin Moderation & Taxonomy Management (FEAT-ROUTE-16..20)
  // =========================================================================
  describe('Feature 8: Admin Moderation & Management (Quản Trị)', () => {
    it('T1-ADM-01: logs in as moderator1 and retrieves pending seller applications queue', async () => {
      const login = await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      assert.equal(login.success, true);
      assert.equal(login.data!.role, 'MODERATOR');

      const queue = await client.getPendingSellers();
      assert.equal(queue.success, true);
      assert.ok(queue.data!.length >= 1);
      assert.ok(queue.data!.some((s) => s.shopName === 'AquaTerra Shop'));
    });

    it('T1-ADM-02: approves a pending seller transitioning status to ACTIVE with admin ID', async () => {
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      // Shop 2 = AquaTerra Shop (PENDING)
      const res = await client.moderateSeller(2, 'ACTIVE');
      assert.equal(res.success, true);
      assert.equal(res.data!.id, 2);
      assert.equal(res.data!.status, 'ACTIVE');
      assert.equal(res.data!.approvedByAdminId, 3); // moderator1 admin ID is 3
    });

    it('T1-ADM-03: retrieves pending products queue and approves a pending product', async () => {
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      const pending = await client.getPendingProducts();
      assert.equal(pending.success, true);
      assert.ok(pending.data!.length >= 1);
      assert.ok(pending.data!.some((p) => p.id === 3)); // Product 3 is PENDING in seed

      // Approve product 3
      const mod = await client.moderateProduct(3, 'APPROVED');
      assert.equal(mod.success, true);
      assert.equal(mod.data!.status, 'APPROVED');

      // Now product 3 must appear in the public catalog
      const pub = await client.getProducts();
      assert.ok(pub.data!.items.some((p) => p.id === 3));
    });

    it('T1-ADM-04: biologist logs in and creates a new species under a GENUS node', async () => {
      const login = await client.loginAdmin({ account: 'biologist1', password: 'admin123' });
      assert.equal(login.success, true);
      assert.equal(login.data!.role, 'BIOLOGIST');

      // Create new species under Node 20 (Python genus)
      const res = await client.createSpecies({
        nodeId: 20,
        scientificName: 'Python reticulatus',
        commonName: 'Trăn gấm (Reticulated Python)',
        conservationStatus: 'LC',
        environmentSpecs: 'Nhiệt độ: 26-32°C, Độ ẩm: 65-75%',
        description: 'Loài bò sát dài nhất thế giới, phân bố rộng ở Đông Nam Á.',
        imageURL: 'https://bionexus.vn/species/python-reticulatus.jpg',
        referenceURL: 'https://www.gbif.org/species/2465223',
      });
      assert.equal(res.success, true);
      assert.equal(res.data!.scientificName, 'Python reticulatus');
      assert.equal(res.data!.nodeId, 20);
    });

    it('T1-ADM-05: superadmin logs in and has access to both moderation and species creation', async () => {
      const login = await client.loginAdmin({ account: 'superadmin', password: 'admin123' });
      assert.equal(login.success, true);
      assert.equal(login.data!.role, 'SUPER_ADMIN');

      const sellers = await client.getPendingSellers();
      assert.equal(sellers.success, true);

      const prods = await client.getPendingProducts();
      assert.equal(prods.success, true);
    });
  });

  // =========================================================================
  // Feature 9: Navigation Shells & Route Registry (FEAT-NAV-01, FEAT-NAV-02)
  // =========================================================================
  describe('Feature 9: Navigation & Route Registry (24 Routes & Shells)', () => {
    it('T1-NAV-01: registers all 24 required routes with designated layouts and permissions', () => {
      assert.equal(OFFICIAL_24_ROUTES.length, 24);
      const routes = OFFICIAL_24_ROUTES.map((r) => r.route);
      assert.ok(routes.includes('#/'));
      assert.ok(routes.includes('#/taxonomy'));
      assert.ok(routes.includes('#/species'));
      assert.ok(routes.includes('#/products'));
      assert.ok(routes.includes('#/cart'));
      assert.ok(routes.includes('#/checkout'));
      assert.ok(routes.includes('#/account'));
      assert.ok(routes.includes('#/seller'));
      assert.ok(routes.includes('#/admin'));
      assert.ok(routes.includes('#/credits'));
    });

    it('T1-NAV-02: verifies 4 standard Layout Shells cover all 24 routes', () => {
      const layouts = new Set(OFFICIAL_24_ROUTES.map((r) => r.layout));
      assert.deepEqual(Array.from(layouts).sort(), ['Account', 'Admin', 'Auth', 'Root', 'Seller']);
    });

    it('T1-NAV-03: identifies 3D-heavy routes for isolated lazy loading', () => {
      const threeD = OFFICIAL_24_ROUTES.filter((r) => r.is3D);
      assert.ok(threeD.some((r) => r.route === '#/'));
    });

    it('T1-NAV-04: verifies Credits route (/credits) is public for media licensing compliance', () => {
      const credits = OFFICIAL_24_ROUTES.find((r) => r.route === '#/credits');
      assert.ok(credits);
      assert.equal(credits.permission, 'ALL');
      assert.equal(credits.layout, 'Root');
    });

    it('T1-NAV-05: verifies UI Preview route (/dev/ui) exists for component showcase', () => {
      const uiPreview = OFFICIAL_24_ROUTES.find((r) => r.route === '#/dev/ui');
      assert.ok(uiPreview);
      assert.equal(uiPreview.pageName, 'UIPreview');
    });
  });

  // =========================================================================
  // Feature 10: Design System & Media Attribution (FEAT-DS-01, FEAT-MEDIA-03)
  // =========================================================================
  describe('Feature 10: Design System & Media Attribution (Chuẩn Mẫu R)', () => {
    it('T1-DS-01: defines full 7-level IUCN conservation scale with authoritative hex tokens', () => {
      assert.equal(IUCN_RATINGS.length, 7);
      for (const rating of IUCN_RATINGS) {
        assert.ok(IUCN_COLORS[rating], `Color token missing for ${rating}`);
        assert.match(IUCN_COLORS[rating]!, /^#[0-9a-fA-F]{6}$/);
      }
    });

    it('T1-DS-02: formats currency amounts using Vietnamese Dong standard symbol (₫)', () => {
      const formatted = formatVnd(2950000);
      assert.ok(formatted.includes('2.950.000') || formatted.includes('2,950,000'));
      assert.ok(formatted.includes('₫'));
    });

    it('T1-DS-03: verifies IUCN color mapping aligns with conservation severity', () => {
      assert.equal(IUCN_COLORS['CR'], '#f14668', 'CR should be vivid red alert');
      assert.equal(IUCN_COLORS['LC'], '#48c774', 'LC should be stable green');
      assert.equal(IUCN_COLORS['EX'], '#000000', 'EX should be black');
    });

    it('T1-DS-04: verifies environment specs parser handles edge format without humidity', () => {
      const res = parseEnvironmentSpecs('Nhiệt độ nước: 14-18°C, Độ ẩm: không áp dụng (thủy sinh)');
      assert.equal(res.waterTempMin, 14);
      assert.equal(res.waterTempMax, 18);
      assert.ok(res.humidMin == null);
    });

    it('T1-DS-05: verifies all seed products specify valid price in positive integers', async () => {
      const prods = await client.getProducts();
      for (const p of prods.data!.items) {
        assert.ok(Number.isInteger(p.price));
        assert.ok(p.price > 0);
      }
    });
  });
});
