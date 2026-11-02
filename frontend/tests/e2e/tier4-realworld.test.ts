/**
 * BioNexus E2E Test Suite — Tier 4: Real-World Workload Scenarios
 * Tests end-to-end multi-step user journeys and the authoritative 5-minute demo scenario from PLAN.md Section 11.3.
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { BioNexusTestClient } from './harness/client.ts';
import { isValidOrderCode, parseEnvironmentSpecs, formatVnd } from './harness/specs.ts';

describe('Tier 4: Real-World Workload Scenarios — BioNexus Application Suite', () => {
  let client: BioNexusTestClient;

  beforeEach(() => {
    client = new BioNexusTestClient();
  });

  // =========================================================================
  // Scenario 1: The Aptech 5-Minute Grand Demo Flow (PLAN.md Section 11.3)
  // =========================================================================
  describe('Scenario 1: PLAN.md Section 11.3 — The 5-Minute Grand Demo Flow', () => {
    it('T4-SCN-01: executes the complete 6-step Aptech evaluation scenario flawlessly', async () => {
      // -----------------------------------------------------------------------
      // Step 1: Browse Taxonomy Tree
      // Trang chủ → duyệt Animalia → Chordata → Reptilia → Squamata → Python → 2 loài với huy hiệu IUCN
      // -----------------------------------------------------------------------
      const roots = await client.getRootTaxonomy();
      const animalia = roots.data!.find((n) => n.scientificName === 'Animalia')!;
      assert.ok(animalia, 'Root Kingdom Animalia must exist');

      const chordataChildren = await client.getTaxonomyChildren(3); // 3 = Chordata
      assert.ok(chordataChildren.data!.some((n) => n.scientificName === 'Reptilia'));

      const reptiliaChildren = await client.getTaxonomyChildren(8); // 8 = Squamata
      assert.ok(reptiliaChildren.data!.some((n) => n.scientificName === 'Pythonidae'));

      const pythonDetail = await client.getTaxonomyDetail(20); // 20 = Python
      assert.equal(pythonDetail.data!.node.scientificName, 'Python');
      assert.equal(pythonDetail.data!.node.rank, 'GENUS');

      const pythonSpecies = await client.getTaxonomySpecies(20);
      assert.equal(pythonSpecies.data!.length, 2, 'Python genus must have exactly 2 species');
      const ballPython = pythonSpecies.data!.find((s) => s.scientificName === 'Python regius')!;
      const burmesePython = pythonSpecies.data!.find((s) => s.scientificName === 'Python bivittatus')!;
      assert.equal(ballPython.conservationStatus, 'NT', 'Python regius must have IUCN badge NT');
      assert.equal(burmesePython.conservationStatus, 'VU', 'Python bivittatus must have IUCN badge VU');

      // -----------------------------------------------------------------------
      // Step 2: Open Species Profile & Attempt Unauthenticated Purchase
      // Mở loài → thấy sản phẩm → thử đặt hàng khi chưa đăng nhập (bị yêu cầu đăng nhập)
      // -----------------------------------------------------------------------
      const speciesDetail = await client.getSpeciesDetail(ballPython.id);
      assert.equal(speciesDetail.data!.scientificName, 'Python regius');
      const specs = parseEnvironmentSpecs(speciesDetail.data!.environmentSpecs);
      assert.equal(specs.tempMin, 26);
      assert.equal(specs.tempMax, 32);

      // Find products associated with Ball Python
      const linkedProducts = await client.getProducts({ speciesId: ballPython.id });
      assert.ok(linkedProducts.data!.items.length >= 1);
      const targetProduct = linkedProducts.data!.items[0]!;

      // Unauthenticated user attempts purchase
      assert.equal(client.getToken(), null);
      const guestOrder = await client.placeOrder({
        items: [{ productId: targetProduct.id, quantity: 1 }],
        shippingAddress: '123 Đường Lạ, Hà Nội',
      });
      assert.equal(guestOrder.success, false);
      assert.equal(guestOrder.code, 'AUTH_UNAUTHORIZED', 'Unauthenticated order must be rejected');

      // -----------------------------------------------------------------------
      // Step 3: Login as levanc & Place Order from Cart
      // Đăng nhập levanc → mua 1 sản phẩm (hoặc bỏ 2 sản phẩm vào giỏ rồi đặt hàng) → xem "Đơn của tôi"
      // -----------------------------------------------------------------------
      const userLogin = await client.login({ username: 'levanc', password: '123456' });
      assert.equal(userLogin.success, true);
      assert.equal(userLogin.data!.username, 'levanc');

      // Verify levanc pre-existing cart (2 items, 2,950,000 VND)
      const userCart = await client.getCart();
      assert.equal(userCart.data!.items.length, 2);
      assert.equal(userCart.data!.subtotal, 2950000);

      // Checkout cart
      const placeOrderRes = await client.placeOrder({
        shippingAddress: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
      });
      assert.equal(placeOrderRes.success, true);
      assert.ok(placeOrderRes.data);
      assert.ok(isValidOrderCode(placeOrderRes.data.orderCode));
      assert.equal(placeOrderRes.data.totalAmount, 2950000);

      // Verify order appears in "Đơn của tôi"
      const myOrders = await client.getMyOrders();
      assert.ok(myOrders.data!.some((o) => o.orderCode === placeOrderRes.data!.orderCode));

      // -----------------------------------------------------------------------
      // Step 4: Login as nguyenvana (Shop BioGreen Exotic) & Create New Product
      // Đăng nhập nguyenvana → đăng sản phẩm mới (PENDING)
      // -----------------------------------------------------------------------
      client.logout();
      const sellerLogin = await client.login({ username: 'nguyenvana', password: '123456' });
      assert.equal(sellerLogin.success, true);

      const newListing = await client.createSellerProduct({
        speciesId: ballPython.id,
        productName: 'Trăn bóng Pastel Het Clown (Con non 2 tháng)',
        price: 3600000,
        stockQuantity: 2,
        description: 'Cá thể khoẻ mạnh tự ăn chuột đông lạnh, gen Clown.',
        imageUrl: 'https://bionexus.vn/images/prod-ball-python-clown.jpg',
      });
      assert.equal(newListing.success, true);
      assert.equal(newListing.data!.status, 'PENDING');
      const newProdId = newListing.data!.id;

      // Verify new product is hidden from public catalog
      const pubBefore = await client.getProducts();
      assert.ok(!pubBefore.data!.items.some((p) => p.id === newProdId));

      // -----------------------------------------------------------------------
      // Step 5: Login as moderator1 & Approve Product
      // Đăng nhập moderator1 → duyệt → sản phẩm hiện ở trang công khai
      // -----------------------------------------------------------------------
      client.logout();
      const modLogin = await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      assert.equal(modLogin.success, true);
      assert.equal(modLogin.data!.role, 'MODERATOR');

      const pendingProds = await client.getPendingProducts();
      assert.ok(pendingProds.data!.some((p) => p.id === newProdId));

      const approveRes = await client.moderateProduct(newProdId, 'APPROVED');
      assert.equal(approveRes.success, true);
      assert.equal(approveRes.data!.status, 'APPROVED');

      // Product must now appear in the public catalog
      const pubAfter = await client.getProducts();
      assert.ok(pubAfter.data!.items.some((p) => p.id === newProdId));

      // -----------------------------------------------------------------------
      // Step 6: Security Demonstration
      // Chứng minh bảo mật: gọi API admin bằng token USER → 403; sửa 1 ký tự của token → 401
      // -----------------------------------------------------------------------
      // A. Call admin endpoint with USER token
      client.logout();
      await client.login({ username: 'levanc', password: '123456' });
      const forbiddenAdmin = await client.getPendingSellers();
      assert.equal(forbiddenAdmin.success, false);
      assert.equal(forbiddenAdmin.code, 'AUTH_FORBIDDEN');

      // B. Tamper with token signature
      const validToken = client.getToken()!;
      const tamperedToken = validToken.slice(0, -3) + 'XYZ';
      client.setToken(tamperedToken);

      const tamperedCheck = await client.getMe();
      assert.equal(tamperedCheck.success, false);
      assert.equal(tamperedCheck.code, 'AUTH_TOKEN_INVALID');
    });
  });

  // =========================================================================
  // Scenario 2: Merchant Onboarding & Multi-Product Launch Flow
  // =========================================================================
  describe('Scenario 2: New Merchant Onboarding & Catalog Expansion Flow', () => {
    it('T4-SCN-02: guides new merchant from registration to approved store and customer purchase', async () => {
      // 1. User registration
      const reg = await client.register({
        username: 'green_breeder',
        password: 'password123',
        email: 'breeder@bionexus.vn',
        fullName: 'Vườn Ươm Xanh',
        phone: '0911223344',
        address: 'Hải Châu, Đà Nẵng',
      });
      assert.equal(reg.success, true);

      // 2. Apply for seller profile
      const apply = await client.applySeller({
        shopName: 'Vườn Ươm Cây Ăn Thịt',
        businessLicenseUrl: 'https://bionexus.vn/licenses/lic-vuonuom.pdf',
        bio: 'Chuyên nhân giống mô nắp ấm và gọng vó tại Đà Nẵng.',
      });
      assert.equal(apply.success, true);
      const shopId = apply.data!.id;

      // 3. Moderator approves application
      client.logout();
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      const shopApproval = await client.moderateSeller(shopId, 'ACTIVE');
      assert.equal(shopApproval.success, true);

      // 4. Merchant creates 2 products: one valid, one problematic
      client.logout();
      await client.login({ username: 'green_breeder', password: 'password123' });

      // Product A: Nắp ấm Ampullaria con (Species 9)
      const prodA = await client.createSellerProduct({
        speciesId: 9,
        productName: 'Nắp ấm Ampullaria Green Spotted Baby',
        price: 280000,
        stockQuantity: 10,
        description: 'Cây con cấy mô thuần khí hậu Đà Nẵng.',
        imageUrl: 'https://bionexus.vn/images/amp-spotted.jpg',
      });
      assert.equal(prodA.success, true);

      // Product B: Cây bắt ruồi Venus (Species 5)
      const prodB = await client.createSellerProduct({
        speciesId: 5,
        productName: 'Bắt ruồi Venus không giấy tờ',
        price: 150000,
        stockQuantity: 5,
        description: 'Chưa đủ chứng minh nguồn gốc giống.',
        imageUrl: 'https://bionexus.vn/images/venus-no-lic.jpg',
      });
      assert.equal(prodB.success, true);

      // 5. Moderator approves Prod A and rejects Prod B
      client.logout();
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      const approveA = await client.moderateProduct(prodA.data!.id, 'APPROVED');
      assert.equal(approveA.success, true);
      assert.equal(approveA.data!.status, 'APPROVED');

      const rejectB = await client.moderateProduct(prodB.data!.id, 'REJECTED');
      assert.equal(rejectB.success, true);
      assert.equal(rejectB.data!.status, 'REJECTED');

      // 6. Customer purchases Product A
      client.logout();
      await client.login({ username: 'levanc', password: '123456' });
      const purchase = await client.placeOrder({
        items: [{ productId: prodA.data!.id, quantity: 2 }],
        shippingAddress: 'Đà Nẵng',
      });
      assert.equal(purchase.success, true);
      assert.equal(purchase.data!.totalAmount, 2 * 280000);

      // Stock drops from 10 to 8
      const prodAfter = (await client.getProductDetail(prodA.data!.id)).data!;
      assert.equal(prodAfter.stockQuantity, 8);
    });
  });

  // =========================================================================
  // Scenario 3: Out-of-Stock Conflict & Cart Recovery Flow (phamthid Scenario)
  // =========================================================================
  describe('Scenario 3: Cart Recovery & Inventory Conflict Resolution (phamthid)', () => {
    it('T4-SCN-03: handles invalid cart with exceeded stock and sold out items, adjusts, and recovers checkout', async () => {
      // phamthid seed cart contains:
      // 1. Leopard Gecko Tangerine Baby x 5 (stock is 3)
      // 2. Rùa Hermann baby x 1 (SOLD_OUT)
      await client.login({ username: 'phamthid', password: '123456' });
      const initialCart = await client.getCart();
      assert.equal(initialCart.data!.items.length, 2);

      // Attempt checkout fails with 409
      const failedCheckout = await client.placeOrder({ shippingAddress: 'Thanh Khê, Đà Nẵng' });
      assert.equal(failedCheckout.success, false);
      assert.equal(failedCheckout.code, 'PRODUCT_OUT_OF_STOCK');

      // User corrects cart:
      // Step A: update Leopard Gecko Tangerine (Product 2) quantity to 3 (exact stock limit)
      const updatedItem = await client.updateCartItem(2, 3);
      assert.equal(updatedItem.success, true);

      // Step B: remove SOLD_OUT Hermann tortoise (Product 6)
      const removedItem = await client.removeCartItem(6);
      assert.equal(removedItem.success, true);
      assert.equal(removedItem.data!.items.length, 1);
      assert.equal(removedItem.data!.items[0]!.productId, 2);
      assert.equal(removedItem.data!.items[0]!.quantity, 3);

      // Step C: re-attempt checkout now succeeds
      const successfulCheckout = await client.placeOrder({ shippingAddress: 'Thanh Khê, Đà Nẵng' });
      assert.equal(successfulCheckout.success, true);
      assert.ok(isValidOrderCode(successfulCheckout.data!.orderCode));

      // Product 2 stock is now 0 and transitions to SOLD_OUT
      const prod2After = (await client.getProductDetail(2)).data!;
      assert.equal(prod2After.stockQuantity, 0);
      assert.equal(prod2After.status, 'SOLD_OUT');
    });
  });

  // =========================================================================
  // Scenario 4: Scientific Biodiversity Discovery & Command Palette Flow
  // =========================================================================
  describe('Scenario 4: Scientific Biodiversity Explorer & Command Palette Flow', () => {
    it('T4-SCN-04: searches species, explores profile, checks environment specs, and filters critically endangered taxa', async () => {
      // 1. Visitor searches for "axolotl" via Command Palette query
      const searchRes = await client.getSpeciesList({ q: 'axolotl' });
      assert.equal(searchRes.data!.length, 1);
      const axolotl = searchRes.data![0]!;
      assert.equal(axolotl.scientificName, 'Ambystoma mexicanum');

      // 2. Retrieve detailed profile
      const detail = await client.getSpeciesDetail(axolotl.id);
      assert.equal(detail.data!.conservationStatus, 'CR', 'Axolotl must be Critically Endangered');

      // 3. Parse water temperature and aquatic habitat specs
      const env = parseEnvironmentSpecs(detail.data!.environmentSpecs);
      assert.equal(env.waterTempMin, 14);
      assert.equal(env.waterTempMax, 18);
      assert.ok(detail.data!.description.includes('Xochimilco'));

      // 4. Trace taxonomy upwards to Class Amphibia
      const parentNode = await client.getTaxonomyDetail(axolotl.nodeId);
      const crumbNames = parentNode.data!.breadcrumbs.map((b) => b.scientificName);
      assert.ok(crumbNames.includes('Amphibia'));
      assert.ok(crumbNames.includes('Chordata'));

      // 5. Explore all species with IUCN CR status across the encyclopedia
      const allSpecies = (await client.getSpeciesList()).data!;
      const crTaxa = allSpecies.filter((s) => s.conservationStatus === 'CR');
      assert.equal(crTaxa.length, 1);
      assert.equal(crTaxa[0]!.scientificName, 'Ambystoma mexicanum');
    });
  });

  // =========================================================================
  // Scenario 5: Multi-Tenant Security & Account Integrity Audit
  // =========================================================================
  describe('Scenario 5: Multi-Tenant Security & Privilege Audit Workflow', () => {
    it('T4-SCN-05: verifies comprehensive defense against privilege escalation, inactive logins, and data leaks', async () => {
      // Check 1: Inactive user login blocked
      const inactiveUser = await client.login({ username: 'dangvang', password: '123456' });
      assert.equal(inactiveUser.success, false);
      assert.equal(inactiveUser.code, 'AUTH_ACCOUNT_INACTIVE');

      // Check 2: Banned user login blocked
      const bannedUser = await client.login({ username: 'vuthif', password: '123456' });
      assert.equal(bannedUser.success, false);
      assert.equal(bannedUser.code, 'AUTH_ACCOUNT_BANNED');

      // Check 3: Inactive admin login blocked
      const inactiveAdmin = await client.loginAdmin({ account: 'moderator2', password: 'admin123' });
      assert.equal(inactiveAdmin.success, false);
      assert.equal(inactiveAdmin.code, 'AUTH_ACCOUNT_INACTIVE');

      // Check 4: Regular user cannot view another user order detail
      await client.login({ username: 'tranthib', password: '123456' });
      // Order 1 belongs to levanc
      const leakAttempt = await client.getOrderDetail(1);
      assert.equal(leakAttempt.success, false);
      assert.equal(leakAttempt.code, 'ORDER_NOT_FOUND', 'Foreign orders must return 404 to avoid ID enumeration leaks');

      // Check 5: Regular user cannot perform administrative mutations
      const breachAttempt = await client.moderateProduct(1, 'REJECTED');
      assert.equal(breachAttempt.success, false);
      assert.equal(breachAttempt.code, 'AUTH_FORBIDDEN');
    });
  });
});
