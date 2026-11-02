/**
 * BioNexus E2E Test Suite — Tier 2: Boundary & Corner Cases
 * Tests edge cases, boundary limits, invalid inputs, security constraints, and error codes.
 * Minimum 5 test cases per core feature domain.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { BioNexusTestClient } from './harness/client.ts';
import { parseEnvironmentSpecs, isValidOrderCode } from './harness/specs.ts';

describe('Tier 2: Boundary & Corner Cases — BioNexus Contract Suite', () => {
  let client: BioNexusTestClient;

  beforeEach(() => {
    client = new BioNexusTestClient();
  });

  // =========================================================================
  // Boundary 1: Taxonomy Navigation Limits & Error Handling
  // =========================================================================
  describe('Boundary 1: Taxonomy Hierarchy & ID Validation', () => {
    it('T2-TAX-01: rejects non-numeric taxonomy ID with 400 INVALID_ID', async () => {
      const res = await client.getTaxonomyDetail('invalid-alpha');
      assert.equal(res.success, false);
      assert.equal(res.code, 'INVALID_ID');
    });

    it('T2-TAX-02: rejects negative or zero taxonomy ID with 400 INVALID_ID', async () => {
      const resNeg = await client.getTaxonomyDetail(-5);
      assert.equal(resNeg.success, false);
      assert.equal(resNeg.code, 'INVALID_ID');

      const resZero = await client.getTaxonomyDetail(0);
      assert.equal(resZero.success, false);
      assert.equal(resZero.code, 'INVALID_ID');
    });

    it('T2-TAX-03: returns 404 TAXONOMY_NOT_FOUND for non-existent node ID 9999', async () => {
      const res = await client.getTaxonomyDetail(9999);
      assert.equal(res.success, false);
      assert.equal(res.code, 'TAXONOMY_NOT_FOUND');
    });

    it('T2-TAX-04: returns empty children array for leaf Genus nodes', async () => {
      // Node 20 = Python (GENUS) is a leaf taxonomy node with no child nodes
      const res = await client.getTaxonomyChildren(20);
      assert.equal(res.success, true);
      assert.ok(Array.isArray(res.data));
      assert.equal(res.data.length, 0);
    });

    it('T2-TAX-05: returns empty species array for non-leaf or empty genus nodes', async () => {
      // Node 1 = Animalia (KINGDOM) has no direct species attached
      const res = await client.getTaxonomySpecies(1);
      assert.equal(res.success, true);
      assert.ok(Array.isArray(res.data));
      assert.equal(res.data.length, 0);
    });
  });

  // =========================================================================
  // Boundary 2: Species Profiles & Climate Parsing Extremes
  // =========================================================================
  describe('Boundary 2: Species Queries & Climate String Boundaries', () => {
    it('T2-SPE-01: returns 404 SPECIES_NOT_FOUND for non-existent species ID 9999', async () => {
      const res = await client.getSpeciesDetail(9999);
      assert.equal(res.success, false);
      assert.equal(res.code, 'SPECIES_NOT_FOUND');
    });

    it('T2-SPE-02: returns 400 INVALID_ID for malformed species IDs', async () => {
      const res = await client.getSpeciesDetail('not-a-number');
      assert.equal(res.success, false);
      assert.equal(res.code, 'INVALID_ID');
    });

    it('T2-SPE-03: handles empty search query returning all baseline species', async () => {
      const res = await client.getSpeciesList({ q: '' });
      assert.equal(res.success, true);
      assert.equal(res.data!.length, 9);
    });

    it('T2-SPE-04: handles search query matching zero results gracefully', async () => {
      const res = await client.getSpeciesList({ q: 'loai-khong-ton-tai-xyz' });
      assert.equal(res.success, true);
      assert.ok(Array.isArray(res.data));
      assert.equal(res.data.length, 0);
    });

    it('T2-SPE-05: parses empty or malformed environment specs strings without throwing', () => {
      const emptyParsed = parseEnvironmentSpecs('');
      assert.equal(emptyParsed.tempMin, null);
      assert.equal(emptyParsed.tempMax, null);

      const gibberishParsed = parseEnvironmentSpecs('Khong co nhiet do nao o day ca');
      assert.equal(gibberishParsed.tempMin, null);
      assert.equal(gibberishParsed.tempMax, null);
    });
  });

  // =========================================================================
  // Boundary 3: Product Pagination & Catalog Filtering Limits
  // =========================================================================
  describe('Boundary 3: Product Catalog Pagination & Filter Limits', () => {
    it('T2-PROD-01: rejects page <= 0 with 400 INVALID_PAGINATION', async () => {
      const resZero = await client.getProducts({ page: 0 });
      assert.equal(resZero.success, false);
      assert.equal(resZero.code, 'INVALID_PAGINATION');

      const resNeg = await client.getProducts({ page: -1 });
      assert.equal(resNeg.success, false);
      assert.equal(resNeg.code, 'INVALID_PAGINATION');
    });

    it('T2-PROD-02: rejects page size outside [1, 48] with 400 INVALID_PAGINATION', async () => {
      const resSizeZero = await client.getProducts({ size: 0 });
      assert.equal(resSizeZero.success, false);
      assert.equal(resSizeZero.code, 'INVALID_PAGINATION');

      const resSizeTooBig = await client.getProducts({ size: 49 });
      assert.equal(resSizeTooBig.success, false);
      assert.equal(resSizeTooBig.code, 'INVALID_PAGINATION');
    });

    it('T2-PROD-03: accepts boundary page size values 1 and 48', async () => {
      const resMin = await client.getProducts({ size: 1 });
      assert.equal(resMin.success, true);
      assert.equal(resMin.data!.items.length, 1);

      const resMax = await client.getProducts({ size: 48 });
      assert.equal(resMax.success, true);
      assert.equal(resMax.data!.items.length, 7);
    });

    it('T2-PROD-04: returns empty items array when requesting page beyond total count', async () => {
      const resBeyond = await client.getProducts({ page: 99, size: 10 });
      assert.equal(resBeyond.success, true);
      assert.equal(resBeyond.data!.items.length, 0);
      assert.equal(resBeyond.data!.total, 7);
    });

    it('T2-PROD-05: returns 404 PRODUCT_NOT_FOUND for non-existent product ID', async () => {
      const res = await client.getProductDetail(9999);
      assert.equal(res.success, false);
      assert.equal(res.code, 'PRODUCT_NOT_FOUND');
    });
  });

  // =========================================================================
  // Boundary 4: Authentication Security & Account State Guards
  // =========================================================================
  describe('Boundary 4: Authentication Security & Account States', () => {
    it('T2-AUTH-01: rejects invalid password with 401 AUTH_INVALID_CREDENTIALS', async () => {
      const res = await client.login({ username: 'levanc', password: 'wrongpassword' });
      assert.equal(res.success, false);
      assert.equal(res.code, 'AUTH_INVALID_CREDENTIALS');
      assert.equal(client.getToken(), null);
    });

    it('T2-AUTH-02: blocks login for BANNED user with 403 AUTH_ACCOUNT_BANNED', async () => {
      // vuthif is BANNED in seed_data.sql
      const res = await client.login({ username: 'vuthif', password: '123456' });
      assert.equal(res.success, false);
      assert.equal(res.code, 'AUTH_ACCOUNT_BANNED');
    });

    it('T2-AUTH-03: blocks login for INACTIVE user with 403 AUTH_ACCOUNT_INACTIVE', async () => {
      // dangvang is INACTIVE in seed_data.sql
      const res = await client.login({ username: 'dangvang', password: '123456' });
      assert.equal(res.success, false);
      assert.equal(res.code, 'AUTH_ACCOUNT_INACTIVE');
    });

    it('T2-AUTH-04: blocks admin login for INACTIVE moderator with 403 AUTH_ACCOUNT_INACTIVE', async () => {
      // moderator2 is INACTIVE in seed_data.sql
      const res = await client.loginAdmin({ account: 'moderator2', password: 'admin123' });
      assert.equal(res.success, false);
      assert.equal(res.code, 'AUTH_ACCOUNT_INACTIVE');
    });

    it('T2-AUTH-05: blocks admin login for BANNED biologist with 403 AUTH_ACCOUNT_BANNED', async () => {
      // biologist2 is BANNED in seed_data.sql
      const res = await client.loginAdmin({ account: 'biologist2', password: 'admin123' });
      assert.equal(res.success, false);
      assert.equal(res.code, 'AUTH_ACCOUNT_BANNED');
    });

    it('T2-AUTH-06: rejects tampered or forged JWT signatures with 401 AUTH_TOKEN_INVALID', async () => {
      // Valid login first
      await client.login({ username: 'levanc', password: '123456' });
      const validToken = client.getToken()!;

      // Tamper signature part of token
      const tamperedToken = validToken.substring(0, validToken.lastIndexOf('.')) + '.forged-signature';
      client.setToken(tamperedToken);

      const me = await client.getMe();
      assert.equal(me.success, false);
      assert.equal(me.code, 'AUTH_TOKEN_INVALID');
    });
  });

  // =========================================================================
  // Boundary 5: Cart Inventory Limits & Quantity Constraints
  // =========================================================================
  describe('Boundary 5: Cart Limits & Stock Boundaries', () => {
    it('T2-CART-01: rejects adding zero or negative quantity with 400 CART_INVALID_QUANTITY', async () => {
      await client.login({ username: 'tranthib', password: '123456' });
      const resZero = await client.addToCart(1, 0);
      assert.equal(resZero.success, false);
      assert.equal(resZero.code, 'CART_INVALID_QUANTITY');

      const resNeg = await client.addToCart(1, -2);
      assert.equal(resNeg.success, false);
      assert.equal(resNeg.code, 'CART_INVALID_QUANTITY');
    });

    it('T2-CART-02: rejects adding quantity exceeding available stock with 409 CART_QUANTITY_EXCEEDS_STOCK', async () => {
      // Product 4 (Pastel) has stock 2
      await client.login({ username: 'tranthib', password: '123456' });
      const res = await client.addToCart(4, 3);
      assert.equal(res.success, false);
      assert.equal(res.code, 'CART_QUANTITY_EXCEEDS_STOCK');
    });

    it('T2-CART-03: rejects cumulative addition when total exceeds available stock', async () => {
      // Product 4 (Pastel) has stock 2
      await client.login({ username: 'tranthib', password: '123456' });
      const first = await client.addToCart(4, 2); // adds 2 (at capacity)
      assert.equal(first.success, true);

      const second = await client.addToCart(4, 1); // 2 + 1 = 3 > stock 2
      assert.equal(second.success, false);
      assert.equal(second.code, 'CART_QUANTITY_EXCEEDS_STOCK');
    });

    it('T2-CART-04: rejects adding SOLD_OUT product with 409 PRODUCT_OUT_OF_STOCK', async () => {
      // Product 6 = Rùa Hermann baby is SOLD_OUT (stock 0)
      await client.login({ username: 'tranthib', password: '123456' });
      const res = await client.addToCart(6, 1);
      assert.equal(res.success, false);
      assert.equal(res.code, 'PRODUCT_OUT_OF_STOCK');
    });

    it('T2-CART-05: rejects adding unapproved PENDING product with 409 PRODUCT_NOT_AVAILABLE', async () => {
      // Product 3 = Rồng Úc Hypo Baby is PENDING
      await client.login({ username: 'tranthib', password: '123456' });
      const res = await client.addToCart(3, 1);
      assert.equal(res.success, false);
      assert.equal(res.code, 'PRODUCT_NOT_AVAILABLE');
    });
  });

  // =========================================================================
  // Boundary 6: Checkout Atomic Transaction & Concurrency Failsafes
  // =========================================================================
  describe('Boundary 6: Checkout Atomic Integrity & Stock Depletion', () => {
    it('T2-ORD-01: rejects checkout when shopping cart is completely empty with 400 CART_EMPTY', async () => {
      await client.login({ username: 'tranthib', password: '123456' });
      const res = await client.placeOrder({ shippingAddress: '123 Hà Nội' });
      assert.equal(res.success, false);
      assert.equal(res.code, 'CART_EMPTY');
    });

    it('T2-ORD-02: rejects order placement when shipping address is empty or whitespace', async () => {
      await client.login({ username: 'levanc', password: '123456' });
      const resEmpty = await client.placeOrder({ shippingAddress: '' });
      assert.equal(resEmpty.success, false);
      assert.equal(resEmpty.code, 'ORDER_INVALID_ADDRESS');

      const resSpaces = await client.placeOrder({ shippingAddress: '   ' });
      assert.equal(resSpaces.success, false);
      assert.equal(resSpaces.code, 'ORDER_INVALID_ADDRESS');
    });

    it('T2-ORD-03: rejects checkout atomically when cart contains an item exceeding stock', async () => {
      // phamthid seed cart contains Leopard Gecko Tangerine Baby x 5 (stock is 3)
      await client.login({ username: 'phamthid', password: '123456' });
      const res = await client.placeOrder({ shippingAddress: '45 Thanh Khê, Đà Nẵng' });
      assert.equal(res.success, false);
      assert.equal(res.code, 'PRODUCT_OUT_OF_STOCK');

      // Verify transaction atomicity: cart must remain intact and stock must NOT be altered
      const cartAfter = await client.getCart();
      assert.equal(cartAfter.data!.items.length, 2);
    });

    it('T2-ORD-04: rejects checkout atomically when cart contains a SOLD_OUT item', async () => {
      // phamthid seed cart contains Rùa Hermann baby (SOLD_OUT)
      await client.login({ username: 'phamthid', password: '123456' });
      const res = await client.placeOrder({ shippingAddress: '45 Thanh Khê, Đà Nẵng' });
      assert.equal(res.success, false);
      assert.ok(res.code === 'PRODUCT_OUT_OF_STOCK' || res.code === 'PRODUCT_NOT_AVAILABLE');
    });

    it('T2-ORD-05: automatically transitions product status to SOLD_OUT when stock reaches exactly 0', async () => {
      await client.login({ username: 'tranthib', password: '123456' });
      // Product 4 (Pastel) currently has stockQuantity = 2
      const prodBefore = (await client.getProductDetail(4)).data!;
      assert.equal(prodBefore.stockQuantity, 2);
      assert.equal(prodBefore.status, 'APPROVED');

      // Buy all 2 remaining units
      const res = await client.placeOrder({
        items: [{ productId: 4, quantity: 2 }],
        shippingAddress: 'Cầu Giấy, Hà Nội',
      });
      assert.equal(res.success, true);

      // Verify product transitioned to SOLD_OUT
      const prodAfter = (await client.getProductDetail(4)).data!;
      assert.equal(prodAfter.stockQuantity, 0);
      assert.equal(prodAfter.status, 'SOLD_OUT');

      // Subsequent attempt to buy must fail
      const failedAttempt = await client.placeOrder({
        items: [{ productId: 4, quantity: 1 }],
        shippingAddress: 'Cầu Giấy, Hà Nội',
      });
      assert.equal(failedAttempt.success, false);
      assert.equal(failedAttempt.code, 'PRODUCT_OUT_OF_STOCK');
    });
  });

  // =========================================================================
  // Boundary 7: Merchant Application & Shop Ownership Rules
  // =========================================================================
  describe('Boundary 7: Merchant Lifecycle & Self-Purchase Prohibition', () => {
    it('T2-SEL-01: prevents merchant from buying their own shop products with 403 ORDER_OWN_PRODUCT', async () => {
      // nguyenvana owns BioGreen Exotic (shop 1)
      await client.login({ username: 'nguyenvana', password: '123456' });
      // Product 1 belongs to BioGreen Exotic
      const resAdd = await client.addToCart(1, 1);
      assert.equal(resAdd.success, false);
      assert.equal(resAdd.code, 'ORDER_OWN_PRODUCT');

      // Direct placeOrder must also be blocked
      const resOrder = await client.placeOrder({
        items: [{ productId: 1, quantity: 1 }],
        shippingAddress: 'Quận 1, TP.HCM',
      });
      assert.equal(resOrder.success, false);
      assert.equal(resOrder.code, 'ORDER_OWN_PRODUCT');
    });

    it('T2-SEL-02: rejects seller application if user already owns a shop profile', async () => {
      // nguyenvana already has BioGreen Exotic
      await client.login({ username: 'nguyenvana', password: '123456' });
      const res = await client.applySeller({
        shopName: 'Another Shop',
        businessLicenseUrl: 'https://bionexus.vn/lic.pdf',
        bio: 'Second shop bio',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'SELLER_ALREADY_REGISTERED');
    });

    it('T2-SEL-03: rejects duplicate shop name with 409 SELLER_SHOP_NAME_EXISTS', async () => {
      // levanc has no shop, but tries to take 'BioGreen Exotic'
      await client.login({ username: 'levanc', password: '123456' });
      const res = await client.applySeller({
        shopName: 'BioGreen Exotic',
        businessLicenseUrl: 'https://bionexus.vn/lic.pdf',
        bio: 'Duplicate name',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'SELLER_SHOP_NAME_EXISTS');
    });

    it('T2-SEL-04: blocks non-ACTIVE merchant (PENDING shop) from creating products with 403 SELLER_NOT_ACTIVE', async () => {
      // tranthib owns AquaTerra Shop which is PENDING
      await client.login({ username: 'tranthib', password: '123456' });
      const res = await client.createSellerProduct({
        speciesId: 7,
        productName: 'Rồng Úc Baby Mới',
        price: 900000,
        stockQuantity: 5,
        description: 'Chưa active shop',
        imageUrl: 'https://bionexus.vn/img.jpg',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'SELLER_NOT_ACTIVE');
    });

    it('T2-SEL-05: rejects product creation with non-existent species ID with 400 SPECIES_NOT_FOUND', async () => {
      await client.login({ username: 'nguyenvana', password: '123456' });
      const res = await client.createSellerProduct({
        speciesId: 9999, // Non-existent species
        productName: 'Sinh vật lạ',
        price: 1000000,
        stockQuantity: 1,
        description: 'Mô tả',
        imageUrl: 'https://bionexus.vn/img.jpg',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'SPECIES_NOT_FOUND');
    });
  });

  // =========================================================================
  // Boundary 8: Admin Role Boundaries & Status Transition Rules
  // =========================================================================
  describe('Boundary 8: Admin Role Segregation & Status State Machines', () => {
    it('T2-ADM-01: prevents regular user from accessing admin endpoints with 403 AUTH_FORBIDDEN', async () => {
      await client.login({ username: 'levanc', password: '123456' });
      const resSellers = await client.getPendingSellers();
      assert.equal(resSellers.success, false);
      assert.equal(resSellers.code, 'AUTH_FORBIDDEN');

      const resProds = await client.getPendingProducts();
      assert.equal(resProds.success, false);
      assert.equal(resProds.code, 'AUTH_FORBIDDEN');
    });

    it('T2-ADM-02: prevents BIOLOGIST admin from moderating shops or products with 403 AUTH_FORBIDDEN', async () => {
      await client.loginAdmin({ account: 'biologist1', password: 'admin123' });
      const res = await client.moderateSeller(2, 'ACTIVE');
      assert.equal(res.success, false);
      assert.equal(res.code, 'AUTH_FORBIDDEN');

      const resProd = await client.moderateProduct(3, 'APPROVED');
      assert.equal(resProd.success, false);
      assert.equal(resProd.code, 'AUTH_FORBIDDEN');
    });

    it('T2-ADM-03: prevents MODERATOR admin from creating species with 403 AUTH_FORBIDDEN', async () => {
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      const res = await client.createSpecies({
        nodeId: 20,
        scientificName: 'Python unverified',
        commonName: 'Trăn lạ',
        conservationStatus: 'LC',
        environmentSpecs: 'Nhiệt độ: 25°C',
        description: 'Test',
        imageURL: '',
        referenceURL: '',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'AUTH_FORBIDDEN');
    });

    it('T2-ADM-04: rejects illegal shop status transition (e.g. REJECTED to ACTIVE) with 409 SELLER_INVALID_STATUS_TRANSITION', async () => {
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      // Shop 4 = Exotic Reptile Hub is REJECTED
      const res = await client.moderateSeller(4, 'ACTIVE');
      assert.equal(res.success, false);
      assert.equal(res.code, 'SELLER_INVALID_STATUS_TRANSITION');
    });

    it('T2-ADM-05: rejects illegal product status transition on already-approved product with 409 PRODUCT_INVALID_STATUS_TRANSITION', async () => {
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      // Product 1 is already APPROVED
      const res = await client.moderateProduct(1, 'APPROVED');
      assert.equal(res.success, false);
      assert.equal(res.code, 'PRODUCT_INVALID_STATUS_TRANSITION');
    });
  });

  // =========================================================================
  // Boundary 9: Registration Validation & Duplication Defense
  // =========================================================================
  describe('Boundary 9: Registration Constraints & Duplicate Defense', () => {
    it('T2-REG-01: rejects registration with existing username with 409 USER_USERNAME_EXISTS', async () => {
      const res = await client.register({
        username: 'levanc', // Already exists in seed
        password: 'password123',
        email: 'unique_email@bionexus.vn',
        fullName: 'Trùng Tên',
        phone: '0900000000',
        address: 'Đà Nẵng',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'USER_USERNAME_EXISTS');
    });

    it('T2-REG-02: rejects registration with existing email with 409 USER_EMAIL_EXISTS', async () => {
      const res = await client.register({
        username: 'unique_user_999',
        password: 'password123',
        email: 'vanc@gmail.com', // levanc email
        fullName: 'Trùng Email',
        phone: '0900000000',
        address: 'Đà Nẵng',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'USER_EMAIL_EXISTS');
    });

    it('T2-REG-03: rejects registration with missing required fields with 400 USER_INVALID_INPUT', async () => {
      const res = await client.register({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phone: '',
        address: '',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'USER_INVALID_INPUT');
    });

    it('T2-REG-04: prevents creating species under a non-GENUS node (e.g. FAMILY) with 400 TAXONOMY_NOT_GENUS', async () => {
      await client.loginAdmin({ account: 'biologist1', password: 'admin123' });
      // Node 13 = Pythonidae (FAMILY), not GENUS
      const res = await client.createSpecies({
        nodeId: 13,
        scientificName: 'Python invalid_node',
        commonName: 'Trăn sai cấp',
        conservationStatus: 'LC',
        environmentSpecs: '26-30°C',
        description: 'Test',
        imageURL: '',
        referenceURL: '',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'TAXONOMY_NOT_GENUS');
    });

    it('T2-REG-05: prevents creating duplicate species scientific name with 409 SPECIES_NAME_EXISTS', async () => {
      await client.loginAdmin({ account: 'biologist1', password: 'admin123' });
      // Ambystoma mexicanum already exists in seed
      const res = await client.createSpecies({
        nodeId: 24, // Ambystoma genus
        scientificName: 'Ambystoma mexicanum',
        commonName: 'Trùng tên khoa học',
        conservationStatus: 'CR',
        environmentSpecs: '14-18°C',
        description: 'Test',
        imageURL: '',
        referenceURL: '',
      });
      assert.equal(res.success, false);
      assert.equal(res.code, 'SPECIES_NAME_EXISTS');
    });
  });
});
