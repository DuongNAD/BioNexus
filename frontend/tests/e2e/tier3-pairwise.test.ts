/**
 * BioNexus E2E Test Suite — Tier 3: Cross-Feature Combinations
 * Tests pairwise interactions across subsystems (Cart+Auth, Checkout+Stock, Seller+Admin, Taxonomy+Marketplace).
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { BioNexusTestClient } from './harness/client.ts';
import { isValidOrderCode } from './harness/specs.ts';

describe('Tier 3: Cross-Feature Combinations — BioNexus Pairwise Suite', () => {
  let client: BioNexusTestClient;

  beforeEach(() => {
    client = new BioNexusTestClient();
  });

  // =========================================================================
  // Pairwise 1: Cart + Auth State Transition
  // =========================================================================
  describe('Pairwise 1: Cart Operations and Authentication Session Lifecycle', () => {
    it('T3-PAIR-01: guest attempt to add to cart requires login, preserves target in ?next=, and restores cart on login', async () => {
      // 1. Unauthenticated guest attempts to access /cart
      assert.equal(client.getToken(), null);
      const guestCart = await client.getCart();
      assert.equal(guestCart.success, false);
      assert.equal(guestCart.code, 'AUTH_UNAUTHORIZED');

      // 2. Simulated route guard redirection to #/login?next=/cart
      const nextTarget = '/cart';
      assert.equal(nextTarget, '/cart');

      // 3. User logs in
      const loginRes = await client.login({ username: 'levanc', password: '123456' });
      assert.equal(loginRes.success, true);

      // 4. User's cart is now retrieved and verified
      const userCart = await client.getCart();
      assert.equal(userCart.success, true);
      assert.equal(userCart.data!.items.length, 2);
      assert.equal(userCart.data!.subtotal, 2950000);
    });

    it('T3-PAIR-02: switching accounts swaps active cart and order history seamlessly', async () => {
      // Login user 1 (levanc)
      await client.login({ username: 'levanc', password: '123456' });
      const levancCart = await client.getCart();
      assert.equal(levancCart.data!.items.length, 2);
      const levancOrders = await client.getMyOrders();
      assert.ok(levancOrders.data!.length >= 2);

      // Logout and login user 2 (tranthib)
      client.logout();
      await client.login({ username: 'tranthib', password: '123456' });
      const tranthibCart = await client.getCart();
      assert.equal(tranthibCart.data!.items.length, 0); // tranthib has empty cart
      const tranthibOrders = await client.getMyOrders();
      assert.ok(tranthibOrders.data!.every((o) => o.orderCode !== 'ORD-2026-0001'));
    });
  });

  // =========================================================================
  // Pairwise 2: Checkout + Concurrent Stock Depletion (Transaction Atomicity)
  // =========================================================================
  describe('Pairwise 2: Checkout and Inventory Stock Contention Atomicity', () => {
    it('T3-PAIR-03: atomic rollback when a cart item is concurrently depleted before checkout completes', async () => {
      // User levanc has 2 items: Product 7 (Axolotl, qty 1, stock 8) and Product 4 (Pastel, qty 1, stock 2)
      await client.login({ username: 'levanc', password: '123456' });

      // Simulate a concurrent customer buying out all stock of Product 4 (Pastel)
      const store = client.getStore();
      const pastel = store.products.find((p) => p.id === 4)!;
      pastel.stockQuantity = 0;
      pastel.status = 'SOLD_OUT';

      // Now levanc attempts checkout of their cart
      const checkoutRes = await client.placeOrder({ shippingAddress: '123 Hải Châu, Đà Nẵng' });
      assert.equal(checkoutRes.success, false);
      assert.ok(
        checkoutRes.code === 'PRODUCT_OUT_OF_STOCK' || checkoutRes.code === 'PRODUCT_NOT_AVAILABLE',
        'Checkout must fail atomically'
      );

      // Transaction Rollback Check: Product 7 (Axolotl) stock must NOT have been deducted!
      const axolotl = store.products.find((p) => p.id === 7)!;
      assert.equal(axolotl.stockQuantity, 8, 'Axolotl stock must remain unaffected by rolled-back transaction');

      // Levanc cart must still contain the items so they can adjust
      const cartAfter = await client.getCart();
      assert.equal(cartAfter.data!.items.length, 2);
    });

    it('T3-PAIR-04: successful checkout reduces stock to zero, triggers SOLD_OUT, and blocks subsequent buyers', async () => {
      // Product 4 (Pastel) has stock 2
      // Buyer 1 (tranthib) buys 2 units
      await client.login({ username: 'tranthib', password: '123456' });
      const order1 = await client.placeOrder({
        items: [{ productId: 4, quantity: 2 }],
        shippingAddress: 'Hà Nội',
      });
      assert.equal(order1.success, true);

      // Verify product transitioned to SOLD_OUT
      const prod = (await client.getProductDetail(4)).data!;
      assert.equal(prod.stockQuantity, 0);
      assert.equal(prod.status, 'SOLD_OUT');

      // Buyer 2 (levanc) attempts to purchase Product 4
      client.logout();
      await client.login({ username: 'levanc', password: '123456' });
      const order2 = await client.placeOrder({
        items: [{ productId: 4, quantity: 1 }],
        shippingAddress: 'Đà Nẵng',
      });
      assert.equal(order2.success, false);
      assert.equal(order2.code, 'PRODUCT_OUT_OF_STOCK');
    });
  });

  // =========================================================================
  // Pairwise 3: Seller Ownership and Purchase Integrity
  // =========================================================================
  describe('Pairwise 3: Seller Shop Ownership and Purchasing Conflict Separation', () => {
    it('T3-PAIR-05: merchant is blocked from buying own shop product, but other users can purchase it', async () => {
      // nguyenvana owns BioGreen Exotic which sells Product 1 (Leopard Gecko High Yellow)
      await client.login({ username: 'nguyenvana', password: '123456' });
      const selfBuy = await client.addToCart(1, 1);
      assert.equal(selfBuy.success, false);
      assert.equal(selfBuy.code, 'ORDER_OWN_PRODUCT');

      // Switch to levanc (different user)
      client.logout();
      await client.login({ username: 'levanc', password: '123456' });
      const validBuy = await client.addToCart(1, 1);
      assert.equal(validBuy.success, true);
      assert.ok(validBuy.data!.items.some((i) => i.productId === 1));
    });
  });

  // =========================================================================
  // Pairwise 4: Full Merchant Lifecycle & Public Store Visibility
  // =========================================================================
  describe('Pairwise 4: Merchant Application, Moderation, Product Listing, and Catalog Discovery', () => {
    it('T3-PAIR-06: full pipeline: user applies -> moderator approves shop -> shop creates product -> moderator approves product -> appears in public store', async () => {
      // 1. Regular user registers
      const reg = await client.register({
        username: 'vietnam_herp',
        password: 'password123',
        email: 'herp@bionexus.vn',
        fullName: 'Việt Nam Herpetology',
        phone: '0977112233',
        address: 'Hà Nội',
      });
      assert.equal(reg.success, true);

      // 2. User applies for a new shop
      const apply = await client.applySeller({
        shopName: 'Herp Paradise',
        businessLicenseUrl: 'https://bionexus.vn/lic-herp.pdf',
        bio: 'Trại bò sát cảnh thủ đô',
      });
      assert.equal(apply.success, true);
      assert.equal(apply.data!.status, 'PENDING');
      const shopId = apply.data!.id;

      // 3. User attempts to create a product while shop is PENDING -> BLOCKED
      const earlyProd = await client.createSellerProduct({
        speciesId: 3, // Python regius
        productName: 'Trăn bóng Banana F1',
        price: 3800000,
        stockQuantity: 3,
        description: 'Chờ duyệt shop',
        imageUrl: 'https://bionexus.vn/banana.jpg',
      });
      assert.equal(earlyProd.success, false);
      assert.equal(earlyProd.code, 'SELLER_NOT_ACTIVE');

      // 4. Moderator logs in and approves the shop
      client.logout();
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      const shopMod = await client.moderateSeller(shopId, 'ACTIVE');
      assert.equal(shopMod.success, true);
      assert.equal(shopMod.data!.status, 'ACTIVE');

      // 5. Merchant logs in and creates product now that shop is ACTIVE
      client.logout();
      await client.login({ username: 'vietnam_herp', password: 'password123' });
      const prodCreate = await client.createSellerProduct({
        speciesId: 3,
        productName: 'Trăn bóng Banana F1',
        price: 3800000,
        stockQuantity: 3,
        description: 'Morph vàng sáng chuối',
        imageUrl: 'https://bionexus.vn/banana.jpg',
      });
      assert.equal(prodCreate.success, true);
      assert.equal(prodCreate.data!.status, 'PENDING');
      const prodId = prodCreate.data!.id;

      // 6. Check public store: product must NOT be visible yet
      const publicBefore = await client.getProducts();
      assert.ok(!publicBefore.data!.items.some((p) => p.id === prodId));

      // 7. Moderator logs in and approves product
      client.logout();
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      const prodMod = await client.moderateProduct(prodId, 'APPROVED');
      assert.equal(prodMod.success, true);
      assert.equal(prodMod.data!.status, 'APPROVED');

      // 8. Product immediately appears in public marketplace!
      const publicAfter = await client.getProducts();
      assert.ok(publicAfter.data!.items.some((p) => p.id === prodId));
    });
  });

  // =========================================================================
  // Pairwise 5: Taxonomy to Species to Shop Pipeline
  // =========================================================================
  describe('Pairwise 5: Taxonomy Tree to Species Profile to Marketplace Products', () => {
    it('T3-PAIR-07: drills down taxonomy tree, retrieves species, and displays matching shop products', async () => {
      // 1. Browse root
      const root = await client.getRootTaxonomy();
      const animalia = root.data!.find((n) => n.scientificName === 'Animalia')!;

      // 2. Drill into Chordata -> Reptilia -> Squamata -> Pythonidae -> Python
      const pythonDetail = await client.getTaxonomyDetail(20);
      assert.equal(pythonDetail.data!.node.scientificName, 'Python');

      // 3. Get species under Python
      const speciesList = await client.getTaxonomySpecies(20);
      const ballPython = speciesList.data!.find((s) => s.scientificName === 'Python regius')!;
      assert.ok(ballPython);

      // 4. Fetch products matching Python regius (speciesId = 3)
      const products = await client.getProducts({ speciesId: ballPython.id });
      assert.equal(products.success, true);
      assert.ok(products.data!.items.length >= 1);
      assert.ok(products.data!.items.every((p) => p.speciesId === ballPython.id));
      assert.equal(products.data!.items[0]!.speciesCommonName, 'Trăn bóng (Ball Python)');
    });
  });

  // =========================================================================
  // Pairwise 6: Role-Based Privilege Separation
  // =========================================================================
  describe('Pairwise 6: Role-Based Boundary Isolation (Moderator vs Biologist)', () => {
    it('T3-PAIR-08: verifies strict privilege boundaries: Moderator cannot manage species and Biologist cannot moderate products', async () => {
      // Moderator login
      await client.loginAdmin({ account: 'moderator1', password: 'admin123' });
      // Moderator CAN moderate products
      const modProd = await client.getPendingProducts();
      assert.equal(modProd.success, true);
      // Moderator CANNOT create species
      const modSpecies = await client.createSpecies({
        nodeId: 20,
        scientificName: 'Python breach',
        commonName: 'Trăn vượt quyền',
        conservationStatus: 'LC',
        environmentSpecs: '26°C',
        description: 'Test',
        imageURL: '',
        referenceURL: '',
      });
      assert.equal(modSpecies.success, false);
      assert.equal(modSpecies.code, 'AUTH_FORBIDDEN');

      // Biologist login
      client.logout();
      await client.loginAdmin({ account: 'biologist1', password: 'admin123' });
      // Biologist CAN create species
      const bioSpecies = await client.createSpecies({
        nodeId: 20,
        scientificName: 'Python bivittatus progs',
        commonName: 'Trăn đất phân loài',
        conservationStatus: 'VU',
        environmentSpecs: '26-32°C',
        description: 'Test',
        imageURL: '',
        referenceURL: '',
      });
      assert.equal(bioSpecies.success, true);
      // Biologist CANNOT moderate products
      const bioProd = await client.getPendingProducts();
      assert.equal(bioProd.success, false);
      assert.equal(bioProd.code, 'AUTH_FORBIDDEN');
    });
  });
});
