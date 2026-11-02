import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from '../src/mocks/handlers';
import { db } from '../src/mocks/db';
import { createMockToken } from '../src/mocks/auth';

const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());

describe('Adversarial Challenge Tier — Milestone 2 Empirical Verification', () => {
  beforeEach(() => {
    db.resetDb();
  });

  // =========================================================================
  // 1. Thử thách mã định danh không hợp lệ (Negative ID, String, Zero)
  //    Kỳ vọng: 400 INVALID_ID
  // =========================================================================
  describe('Challenge 1: Invalid Identifiers (Negative, Zero, Alphanumeric Strings)', () => {
    const invalidIds = [-1, -999, 0, 'abc', 'invalid-uuid', '12abc'];

    it('rejects invalid product IDs on GET /api/products/:id with 400 INVALID_ID', async () => {
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/products/${id}`);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid product IDs on GET /api/products/:id/reviews with 400 INVALID_ID', async () => {
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/products/${id}/reviews`);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid species IDs on GET /api/species/:id with 400 INVALID_ID', async () => {
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/species/${id}`);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid species IDs on GET /api/species/:id/products with 400 INVALID_ID', async () => {
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/species/${id}/products`);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid taxonomy IDs on GET /api/taxonomy/:id with 400 INVALID_ID', async () => {
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/taxonomy/${id}`);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid taxonomy IDs on GET /api/taxonomy/:id/children with 400 INVALID_ID', async () => {
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/taxonomy/${id}/children`);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid taxonomy IDs on GET /api/taxonomy/:id/species with 400 INVALID_ID', async () => {
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/taxonomy/${id}/species`);
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid order IDs on GET /api/orders/:id with 400 INVALID_ID', async () => {
      const userToken = createMockToken({ sub: 3, username: 'levanc', accountType: 'USER', role: null });
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${userToken}` },
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid product IDs on PUT /api/cart/items/:productId with 400 INVALID_ID', async () => {
      const userToken = createMockToken({ sub: 3, username: 'levanc', accountType: 'USER', role: null });
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/cart/items/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity: 1 }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid product IDs on DELETE /api/cart/items/:productId with 400 INVALID_ID', async () => {
      const userToken = createMockToken({ sub: 3, username: 'levanc', accountType: 'USER', role: null });
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/cart/items/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${userToken}` },
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid seller IDs on PUT /api/admin/sellers/:id/status with 400 INVALID_ID', async () => {
      const adminToken = createMockToken({ sub: 8, username: 'admin', accountType: 'ADMIN', role: 'SUPER_ADMIN' });
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/admin/sellers/${id}/status`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'ACTIVE' }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });

    it('rejects invalid product IDs on PUT /api/admin/products/:id/status with 400 INVALID_ID', async () => {
      const adminToken = createMockToken({ sub: 8, username: 'admin', accountType: 'ADMIN', role: 'SUPER_ADMIN' });
      for (const id of invalidIds) {
        const res = await fetch(`http://localhost:5173/api/admin/products/${id}/status`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'APPROVED' }),
        });
        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_ID');
      }
    });
  });

  // =========================================================================
  // 2. Thử thách tham số phân trang: page <= 0 hoặc size ngoài [1..48]
  //    Kỳ vọng: 400 INVALID_PAGINATION
  // =========================================================================
  describe('Challenge 2: Pagination Boundaries (page <= 0, size not in [1..48])', () => {
    const invalidPaginationCases = [
      { page: 0, size: 10, reason: 'page is 0' },
      { page: -1, size: 10, reason: 'page is negative' },
      { page: -99, size: 12, reason: 'page is deeply negative' },
      { page: 'abc', size: 12, reason: 'page is non-numeric' },
      { page: 1, size: 0, reason: 'size is 0' },
      { page: 1, size: -5, reason: 'size is negative' },
      { page: 1, size: 49, reason: 'size exceeds upper bound 48' },
      { page: 1, size: 50, reason: 'size is 50' },
      { page: 1, size: 1000, reason: 'size is excessive' },
      { page: 1, size: 'xyz', reason: 'size is non-numeric' },
    ];

    it('rejects all out-of-bound pagination parameters with 400 INVALID_PAGINATION', async () => {
      for (const testCase of invalidPaginationCases) {
        const url = `http://localhost:5173/api/products?page=${testCase.page}&size=${testCase.size}`;
        const res = await fetch(url);
        expect(res.status, `Failed for case: ${testCase.reason}`).toBe(400);
        const data = await res.json();
        expect(data.success).toBe(false);
        expect(data.code).toBe('INVALID_PAGINATION');
      }
    });

    it('accepts exact boundary valid pagination [size=1] and [size=48]', async () => {
      const resLower = await fetch('http://localhost:5173/api/products?page=1&size=1');
      expect(resLower.status).toBe(200);
      const dataLower = await resLower.json();
      expect(dataLower.success).toBe(true);
      expect(dataLower.data.size).toBe(1);

      const resUpper = await fetch('http://localhost:5173/api/products?page=1&size=48');
      expect(resUpper.status).toBe(200);
      const dataUpper = await resUpper.json();
      expect(dataUpper.success).toBe(true);
      expect(dataUpper.data.size).toBe(48);
    });
  });

  // =========================================================================
  // 3. Thử thách bảo mật tài khoản: BANNED (vuthif) & INACTIVE (dangvang)
  //    Kỳ vọng: 403 AUTH_ACCOUNT_BANNED / AUTH_ACCOUNT_INACTIVE
  // =========================================================================
  describe('Challenge 3: Account Security Gates (BANNED and INACTIVE Accounts)', () => {
    it('blocks BANNED user vuthif with 403 AUTH_ACCOUNT_BANNED (Direct DB and API Handler)', async () => {
      // Direct DB probe
      const dbRes = db.loginUser('vuthif', '123456');
      expect(dbRes.status).toBe(403);
      expect(dbRes.body.success).toBe(false);
      expect(dbRes.body.code).toBe('AUTH_ACCOUNT_BANNED');

      // API Handler probe
      const res = await fetch('http://localhost:5173/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'vuthif', password: '123456' }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('AUTH_ACCOUNT_BANNED');
    });

    it('blocks INACTIVE user dangvang with 403 AUTH_ACCOUNT_INACTIVE (Direct DB and API Handler)', async () => {
      // Direct DB probe
      const dbRes = db.loginUser('dangvang', '123456');
      expect(dbRes.status).toBe(403);
      expect(dbRes.body.success).toBe(false);
      expect(dbRes.body.code).toBe('AUTH_ACCOUNT_INACTIVE');

      // API Handler probe
      const res = await fetch('http://localhost:5173/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'dangvang', password: '123456' }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('AUTH_ACCOUNT_INACTIVE');
    });

    it('blocks wrong credentials with 401 AUTH_INVALID_CREDENTIALS', async () => {
      const res = await fetch('http://localhost:5173/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'levanc', password: 'wrongpassword' }),
      });
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('AUTH_INVALID_CREDENTIALS');
    });
  });

  // =========================================================================
  // 4. Thử thách luật cấm tự mua hàng: nguyenvana thêm sản phẩm của chính shop mình
  //    Kỳ vọng: 403 ORDER_OWN_PRODUCT
  // =========================================================================
  describe('Challenge 4: Anti-Self-Purchase Constraint (Seller Buying Own Shop Products)', () => {
    // nguyenvana (userId: 1) sở hữu shop 1 (BioGreen Exotic)
    // Product 1 (Leopard Gecko High Yellow) và Product 2 thuộc shop 1
    const sellerToken = createMockToken({ sub: 1, username: 'nguyenvana', accountType: 'USER', role: null });

    it('blocks seller from adding own shop product to cart with 403 ORDER_OWN_PRODUCT', async () => {
      // Direct DB probe
      const dbRes = db.addToCart(1, 1, 1);
      expect(dbRes.status).toBe(403);
      expect(dbRes.body.success).toBe(false);
      expect(dbRes.body.code).toBe('ORDER_OWN_PRODUCT');

      // API Handler probe
      const res = await fetch('http://localhost:5173/api/cart/items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: 1, quantity: 1 }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('ORDER_OWN_PRODUCT');
    });

    it('blocks seller from placing direct order on own shop product with 403 ORDER_OWN_PRODUCT', async () => {
      // Direct DB probe
      const dbRes = db.placeOrder(1, {
        shippingAddress: '123 Le Loi, Da Nang',
        items: [{ productId: 1, quantity: 1 }],
      });
      expect(dbRes.status).toBe(403);
      expect(dbRes.body.success).toBe(false);
      expect(dbRes.body.code).toBe('ORDER_OWN_PRODUCT');

      // API Handler probe
      const res = await fetch('http://localhost:5173/api/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: '123 Le Loi, Da Nang',
          items: [{ productId: 1, quantity: 1 }],
        }),
      });
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('ORDER_OWN_PRODUCT');
    });

    it('permits seller to purchase products from a different shop', async () => {
      // Product 8 belongs to shop 3 (Carnivora Garden), seller is nguyenvana (shop 1)
      const res = await fetch('http://localhost:5173/api/cart/items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sellerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: 8, quantity: 1 }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.data.items.some((i: any) => i.productId === 8)).toBe(true);
    });
  });

  // =========================================================================
  // 5. Thử thách giao dịch nguyên tử khi hết hàng: giỏ của phamthid
  //    (Tangerine x5 / tồn kho 3 VÀ Rùa Hermann x1 / SOLD_OUT)
  //    Kỳ vọng: 409 PRODUCT_OUT_OF_STOCK, kho và giỏ giữ nguyên 100% (Atomic Rollback)
  // =========================================================================
  describe('Challenge 5: Atomic Transaction Integrity on Stock Outage / Shortage', () => {
    it('rejects order with 409 and guarantees 100% zero-state mutation on rollback', async () => {
      // phamthid (userId: 4)
      const buyerToken = createMockToken({ sub: 4, username: 'phamthid', accountType: 'USER', role: null });

      // Ghi nhận hiện trạng trước giao dịch (Pre-conditions)
      const prod2Before = db.getProductById(2)!;
      const prod6Before = db.getProductById(6)!;
      const initialStock2 = prod2Before.stockQuantity; // Phải là 3
      const initialStock6 = prod6Before.stockQuantity; // Phải là 0
      const initialStatus6 = prod6Before.status;       // Phải là SOLD_OUT

      const cartBefore = db.getCart(4);
      expect(cartBefore.items).toHaveLength(2);
      expect(cartBefore.items.find((i) => i.productId === 2)?.quantity).toBe(5);
      expect(cartBefore.items.find((i) => i.productId === 6)?.quantity).toBe(1);

      const ordersBefore = db.getUserOrders(4);
      expect(ordersBefore).toHaveLength(0);
      const allOrdersBeforeCount = db.getRawState().orders.length;

      // Thực thi đặt hàng qua MSW API Handler
      const res = await fetch('http://localhost:5173/api/orders', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${buyerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress: '456 Tran Phu, Da Nang',
        }),
      });

      // Kiểm định mã lỗi phản hồi
      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(['PRODUCT_OUT_OF_STOCK', 'PRODUCT_NOT_AVAILABLE']).toContain(data.code);

      // Kiểm định tính toàn vẹn nguyên tử (Post-conditions & Invariants)
      // 1. Tồn kho sản phẩm 2 KHÔNG bị suy giảm
      const prod2After = db.getProductById(2)!;
      expect(prod2After.stockQuantity).toBe(initialStock2);

      // 2. Tồn kho và trạng thái sản phẩm 6 KHÔNG bị thay đổi
      const prod6After = db.getProductById(6)!;
      expect(prod6After.stockQuantity).toBe(initialStock6);
      expect(prod6After.status).toBe(initialStatus6);

      // 3. Giỏ hàng của phamthid KHÔNG bị xóa và vẫn nguyên 2 món
      const cartAfter = db.getCart(4);
      expect(cartAfter.items).toHaveLength(2);
      expect(cartAfter.items.find((i) => i.productId === 2)?.quantity).toBe(5);
      expect(cartAfter.items.find((i) => i.productId === 6)?.quantity).toBe(1);

      // 4. Không có bất kỳ đơn hàng ma (ghost order) nào được sinh ra
      const ordersAfter = db.getUserOrders(4);
      expect(ordersAfter).toHaveLength(0);
      expect(db.getRawState().orders.length).toBe(allOrdersBeforeCount);
    });
  });

  // =========================================================================
  // 6. Thử thách chuyển trạng thái phi pháp (State Machine Transitions)
  //    Kỳ vọng: 409 SELLER_INVALID_STATUS_TRANSITION & PRODUCT_INVALID_STATUS_TRANSITION
  // =========================================================================
  describe('Challenge 6: State Machine Transition Enforcement', () => {
    const adminToken = createMockToken({ sub: 8, username: 'admin', accountType: 'ADMIN', role: 'SUPER_ADMIN' });

    it('rejects illegal shop transition PENDING -> BANNED with 409 SELLER_INVALID_STATUS_TRANSITION', async () => {
      // Shop 2 (AquaTerra Shop) có status là PENDING trong seed data
      const shop2Before = db.getRawState().shops.find((s) => s.id === 2)!;
      expect(shop2Before.status).toBe('PENDING');

      // Chuyển thẳng PENDING -> BANNED (phi pháp)
      const res = await fetch('http://localhost:5173/api/admin/sellers/2/status', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'BANNED' }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('SELLER_INVALID_STATUS_TRANSITION');

      // Trạng thái shop 2 vẫn là PENDING
      const shop2After = db.getRawState().shops.find((s) => s.id === 2)!;
      expect(shop2After.status).toBe('PENDING');
    });

    it('enforces legal shop transition lifecycle: PENDING -> ACTIVE -> BANNED -> (illegal to ACTIVE)', async () => {
      // 1. PENDING -> ACTIVE (Hợp lệ cho shop 2)
      const res1 = await fetch('http://localhost:5173/api/admin/sellers/2/status', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      expect(res1.status).toBe(200);
      const data1 = await res1.json();
      expect(data1.code).toBe('SELLER_APPROVED_SUCCESS');
      expect(data1.data.status).toBe('ACTIVE');

      // 2. ACTIVE -> REJECTED (Phi pháp)
      const resIllegal = await fetch('http://localhost:5173/api/admin/sellers/2/status', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
      expect(resIllegal.status).toBe(409);
      expect((await resIllegal.json()).code).toBe('SELLER_INVALID_STATUS_TRANSITION');

      // 3. ACTIVE -> BANNED (Hợp lệ)
      const res2 = await fetch('http://localhost:5173/api/admin/sellers/2/status', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'BANNED' }),
      });
      expect(res2.status).toBe(200);
      const data2 = await res2.json();
      expect(data2.code).toBe('SELLER_BANNED_SUCCESS');
      expect(data2.data.status).toBe('BANNED');

      // 4. BANNED -> ACTIVE (Phi pháp)
      const resIllegal2 = await fetch('http://localhost:5173/api/admin/sellers/2/status', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ACTIVE' }),
      });
      expect(resIllegal2.status).toBe(409);
      expect((await resIllegal2.json()).code).toBe('SELLER_INVALID_STATUS_TRANSITION');
    });

    it('rejects illegal product transition APPROVED -> REJECTED with 409 PRODUCT_INVALID_STATUS_TRANSITION', async () => {
      // Product 1 là APPROVED
      const prod1 = db.getProductById(1)!;
      expect(prod1.status).toBe('APPROVED');

      const res = await fetch('http://localhost:5173/api/admin/products/1/status', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'REJECTED' }),
      });

      expect(res.status).toBe(409);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.code).toBe('PRODUCT_INVALID_STATUS_TRANSITION');
    });
  });
});
