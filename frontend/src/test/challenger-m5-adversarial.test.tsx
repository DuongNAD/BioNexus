import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import { db } from '@/mocks/db';
import { NumberStepper } from '@/components/ui/NumberStepper';
import AccountPage from '@/pages/account/AccountPage';
import LoginPage from '@/pages/auth/LoginPage';
import { registerSchema } from '@/pages/auth/RegisterPage';
import { setAuthSession, clearAuthSession } from '@/api/authStore';
import * as authQueries from '@/api/queries/useAuthQueries';
import * as authMutations from '@/api/mutations/useAuthMutations';
import { toast } from 'sonner';
import type { MeDto, SellerDto } from '@/types/api';

describe('CHALLENGER 1: Transactional Adversarial Stress Testing — Milestone 5', () => {
  beforeEach(() => {
    db.resetDb();
    clearAuthSession();
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. KIỂM THỬ ĐỐI KHÁNG NGHIỆP VỤ GIỎ HÀNG & TỒN KHO
  // =========================================================================
  describe('1. Cart & Inventory Adversarial Stress Testing', () => {
    describe('1.1 NumberStepper Boundary & Adversarial Inputs', () => {
      it('prevents decrementing below min (1) and disables decrement button', () => {
        const handleChange = vi.fn();
        render(<NumberStepper value={1} min={1} max={5} onChange={handleChange} />);

        const decBtn = screen.getByLabelText('Giảm số lượng');
        expect(decBtn).toBeDisabled();

        fireEvent.click(decBtn);
        expect(handleChange).not.toHaveBeenCalled();
      });

      it('prevents incrementing above max (5) and disables increment button', () => {
        const handleChange = vi.fn();
        render(<NumberStepper value={5} min={1} max={5} onChange={handleChange} />);

        const incBtn = screen.getByLabelText('Tăng số lượng');
        expect(incBtn).toBeDisabled();

        fireEvent.click(incBtn);
        expect(handleChange).not.toHaveBeenCalled();
      });

      it('clamps input of 0 or negative numbers to min (1)', () => {
        const handleChange = vi.fn();
        render(<NumberStepper value={2} min={1} max={5} onChange={handleChange} />);

        const input = screen.getByRole('textbox', { name: 'Số lượng' });

        // Nhập 0 -> kẹp về 1
        fireEvent.change(input, { target: { value: '0' } });
        expect(handleChange).toHaveBeenLastCalledWith(1);

        // Nhập số âm -> kẹp về 1
        fireEvent.change(input, { target: { value: '-25' } });
        expect(handleChange).toHaveBeenLastCalledWith(1);
      });

      it('clamps input exceeding max (e.g. 9999) to max (5)', () => {
        const handleChange = vi.fn();
        render(<NumberStepper value={2} min={1} max={5} onChange={handleChange} />);

        const input = screen.getByRole('textbox', { name: 'Số lượng' });

        fireEvent.change(input, { target: { value: '9999' } });
        expect(handleChange).toHaveBeenLastCalledWith(5);
      });

      it('truncates floating point numbers to integer within range (e.g. 3.75 -> 3)', () => {
        const handleChange = vi.fn();
        render(<NumberStepper value={1} min={1} max={10} onChange={handleChange} />);

        const input = screen.getByRole('textbox', { name: 'Số lượng' });

        fireEvent.change(input, { target: { value: '3.75' } });
        expect(handleChange).toHaveBeenLastCalledWith(3);
      });

      it('ignores non-numeric strings (abc, special characters) and empty string', () => {
        const handleChange = vi.fn();
        render(<NumberStepper value={2} min={1} max={5} onChange={handleChange} />);

        const input = screen.getByRole('textbox', { name: 'Số lượng' });

        fireEvent.change(input, { target: { value: 'abc' } });
        expect(handleChange).not.toHaveBeenCalled();

        fireEvent.change(input, { target: { value: '@#$%' } });
        expect(handleChange).not.toHaveBeenCalled();

        fireEvent.change(input, { target: { value: '' } });
        expect(handleChange).not.toHaveBeenCalled();
      });

      it('disables entire stepper when disabled prop is true', () => {
        const handleChange = vi.fn();
        render(<NumberStepper value={2} min={1} max={5} onChange={handleChange} disabled={true} />);

        const decBtn = screen.getByLabelText('Giảm số lượng');
        const incBtn = screen.getByLabelText('Tăng số lượng');
        const input = screen.getByRole('textbox', { name: 'Số lượng' });

        expect(decBtn).toBeDisabled();
        expect(incBtn).toBeDisabled();
        expect(input).toBeDisabled();
      });
    });

    describe('1.2 Inventory Boundaries & Status Violations', () => {
      it('rejects adding product with stock 0 or SOLD_OUT status with 409', () => {
        // Product 6 (Rùa Hermann baby) is SOLD_OUT (stockQuantity: 0)
        const res = db.addToCart(3, 6, 1);
        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(['PRODUCT_OUT_OF_STOCK', 'PRODUCT_NOT_AVAILABLE']).toContain(res.body.code);
      });

      it('rejects adding product with PENDING or REJECTED status with 409 PRODUCT_NOT_AVAILABLE', () => {
        // Product 3 is PENDING, Product 5 is REJECTED
        const resPending = db.addToCart(3, 3, 1);
        expect(resPending.status).toBe(409);
        expect(resPending.body.code).toBe('PRODUCT_NOT_AVAILABLE');

        const resRejected = db.addToCart(3, 5, 1);
        expect(resRejected.status).toBe(409);
        expect(resRejected.body.code).toBe('PRODUCT_NOT_AVAILABLE');
      });

      it('rejects adding quantity exceeding available stock with 409 CART_QUANTITY_EXCEEDS_STOCK', () => {
        // Product 2 (Leopard Gecko Tangerine Baby) has stock = 3
        const res = db.addToCart(3, 2, 4);
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('CART_QUANTITY_EXCEEDS_STOCK');
      });

      it('rejects cumulative additions that breach stock capacity with 409', () => {
        // Product 2 has stock = 3. levanc adds 2, then adds 2 more (total 4 > 3)
        const res1 = db.addToCart(3, 2, 2);
        expect(res1.status).toBe(200);

        const res2 = db.addToCart(3, 2, 2);
        expect(res2.status).toBe(409);
        expect(res2.body.code).toBe('CART_QUANTITY_EXCEEDS_STOCK');
      });

      it('rejects zero or negative quantities with 400 CART_INVALID_QUANTITY', () => {
        const resZero = db.addToCart(3, 1, 0);
        expect(resZero.status).toBe(400);
        expect(resZero.body.code).toBe('CART_INVALID_QUANTITY');

        const resNegative = db.addToCart(3, 1, -5);
        expect(resNegative.status).toBe(400);
        expect(resNegative.body.code).toBe('CART_INVALID_QUANTITY');
      });

      it('rejects updating cart item to 0 or negative with 400 CART_INVALID_QUANTITY', () => {
        // levanc has product 4 in initial seed
        const res = db.updateCartItem(3, 4, 0);
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('CART_INVALID_QUANTITY');

        const resNeg = db.updateCartItem(3, 4, -2);
        expect(resNeg.status).toBe(400);
        expect(resNeg.body.code).toBe('CART_INVALID_QUANTITY');
      });

      it('rejects updating non-existent cart item with 404 CART_ITEM_NOT_FOUND', () => {
        const res = db.updateCartItem(3, 9999, 1);
        expect(res.status).toBe(404);
        expect(res.body.code).toBe('CART_ITEM_NOT_FOUND');
      });

      it('removes item properly and returns 200 CART_ITEM_REMOVED', () => {
        const cartBefore = db.getCart(3);
        const itemToRemove = cartBefore.items[0]!;

        const res = db.removeCartItem(3, itemToRemove.productId);
        expect(res.status).toBe(200);
        expect(res.body.code).toBe('CART_ITEM_REMOVED');

        const cartAfter = db.getCart(3);
        expect(cartAfter.items.find((i) => i.productId === itemToRemove.productId)).toBeUndefined();
      });
    });

    describe('1.3 Self-Purchase Prevention (ORDER_OWN_PRODUCT)', () => {
      it('blocks shop owner from adding their own product to cart (403 ORDER_OWN_PRODUCT)', () => {
        // nguyenvana (userId: 1) owns Shop 1 (BioGreen Exotic) which owns Product 1 & 2
        const resProd1 = db.addToCart(1, 1, 1);
        expect(resProd1.status).toBe(403);
        expect(resProd1.body.code).toBe('ORDER_OWN_PRODUCT');

        const resProd2 = db.addToCart(1, 2, 1);
        expect(resProd2.status).toBe(403);
        expect(resProd2.body.code).toBe('ORDER_OWN_PRODUCT');
      });

      it('allows shop owner to purchase products from other shops', () => {
        // nguyenvana (Shop 1) adds Product 8 (owned by Shop 3 Carnivora Garden, phamthid)
        const res = db.addToCart(1, 8, 1);
        expect(res.status).toBe(200);
        expect(res.body.code).toBe('CART_ITEM_ADDED');
      });

      it('blocks shop owner from direct buy of own product via placeOrder (403 ORDER_OWN_PRODUCT)', () => {
        // nguyenvana (userId: 1) owns Shop 1 BioGreen Exotic which owns Product 1
        const res = db.placeOrder(1, {
          shippingAddress: 'Quận 1, TP Hồ Chí Minh',
          items: [{ productId: 1, quantity: 1 }],
        });
        expect(res.status).toBe(403);
        expect(res.body.code).toBe('ORDER_OWN_PRODUCT');
      });
    });
  });

  // =========================================================================
  // 2. KIỂM THỬ ĐỐI KHÁNG GIAO DỊCH ĐẶT HÀNG & ACID CONFLICT
  // =========================================================================
  describe('2. Order Transaction & Concurrency Adversarial Testing', () => {
    it('executes successful 2-item cart order for levanc, decrements stock, generates ORD-2026-XXXX, clears cart', () => {
      const cartBefore = db.getCart(3);
      expect(cartBefore.items).toHaveLength(2);
      const [itemA, itemB] = cartBefore.items;

      const prodABefore = db.getProductById(itemA!.productId)!;
      const prodBBefore = db.getProductById(itemB!.productId)!;

      const orderRes = db.placeOrder(3, {
        shippingAddress: '456 Lê Duẩn, Quận Hải Châu, TP Đà Nẵng (Người nhận: Lê Văn C - 0923456789)',
      });

      expect(orderRes.status).toBe(201);
      expect(orderRes.body.success).toBe(true);
      expect(orderRes.body.code).toBe('ORDER_CREATE_SUCCESS');

      const orderData = orderRes.body.data!;
      expect(orderData.orderCode).toMatch(/^ORD-2026-\d{4}$/);
      expect(orderData.items).toHaveLength(2);

      // Verify stock decrement
      const prodAAfter = db.getProductById(itemA!.productId)!;
      const prodBAfter = db.getProductById(itemB!.productId)!;
      expect(prodAAfter.stockQuantity).toBe(prodABefore.stockQuantity - itemA!.quantity);
      expect(prodBAfter.stockQuantity).toBe(prodBBefore.stockQuantity - itemB!.quantity);

      // Verify cart cleared
      const cartAfter = db.getCart(3);
      expect(cartAfter.items).toHaveLength(0);
      expect(cartAfter.subtotal).toBe(0);

      // Verify stored in orders history
      const userOrders = db.getUserOrders(3);
      expect(userOrders.some((o) => o.id === orderData.id)).toBe(true);
    });

    it('guarantees ACID Atomicity: rolls back completely if any single item fails validation', () => {
      // Create multi-item order where Item 1 is valid (Product 1 stock: 5, qty: 1)
      // but Item 2 exceeds stock (Product 4 stock: 2, requested qty: 10)
      const prod1Before = db.getProductById(1)!;
      const prod4Before = db.getProductById(4)!;

      const orderRes = db.placeOrder(2, {
        shippingAddress: 'Hoàn Kiếm, Hà Nội',
        items: [
          { productId: 1, quantity: 1 },
          { productId: 4, quantity: 10 },
        ],
      });

      // Must fail with 409
      expect(orderRes.status).toBe(409);
      expect(orderRes.body.code).toBe('PRODUCT_OUT_OF_STOCK');

      // CRITICAL CHECK: Product 1 MUST NOT BE DECREMENTED!
      const prod1After = db.getProductById(1)!;
      const prod4After = db.getProductById(4)!;
      expect(prod1After.stockQuantity).toBe(prod1Before.stockQuantity);
      expect(prod4After.stockQuantity).toBe(prod4Before.stockQuantity);
    });

    it('rejects checkout of corrupted cart with 409 (phamthid seed scenario) and preserves cart', () => {
      // phamthid (userId: 4) has Tangerine x5 (stock 3) and Hermann baby x1 (SOLD_OUT)
      const cartBefore = db.getCart(4);
      expect(cartBefore.items).toHaveLength(2);

      const orderRes = db.placeOrder(4, {
        shippingAddress: 'Thanh Khê, Đà Nẵng',
      });

      expect(orderRes.status).toBe(409);
      expect(['PRODUCT_OUT_OF_STOCK', 'PRODUCT_NOT_AVAILABLE']).toContain(orderRes.body.code);

      // Cart MUST NOT be wiped on failure
      const cartAfter = db.getCart(4);
      expect(cartAfter.items).toHaveLength(2);
    });

    it('rejects duplicate items within the same order payload with 400 ORDER_DUPLICATE_ITEMS', () => {
      const orderRes = db.placeOrder(2, {
        shippingAddress: 'Quận 1, TP Hồ Chí Minh',
        items: [
          { productId: 1, quantity: 1 },
          { productId: 1, quantity: 1 },
        ],
      });

      expect(orderRes.status).toBe(400);
      expect(orderRes.body.code).toBe('ORDER_DUPLICATE_ITEMS');
    });

    it('rejects empty or whitespace-only shipping address with 400 ORDER_INVALID_SHIPPING_ADDRESS', () => {
      const resEmpty = db.placeOrder(3, { shippingAddress: '' });
      expect(resEmpty.status).toBe(400);
      expect(resEmpty.body.code).toBe('ORDER_INVALID_SHIPPING_ADDRESS');

      const resWhitespace = db.placeOrder(3, { shippingAddress: '     ' });
      expect(resWhitespace.status).toBe(400);
      expect(resWhitespace.body.code).toBe('ORDER_INVALID_SHIPPING_ADDRESS');
    });

    it('keeps background cart untouched during direct buy checkout', () => {
      // levanc (userId: 3) has 2 items in cart
      const cartBefore = db.getCart(3);
      expect(cartBefore.items).toHaveLength(2);

      // levanc buys Product 1 directly
      const orderRes = db.placeOrder(3, {
        shippingAddress: 'Đà Nẵng',
        items: [{ productId: 1, quantity: 1 }],
      });
      expect(orderRes.status).toBe(201);

      // Cart MUST still contain the 2 previous items
      const cartAfter = db.getCart(3);
      expect(cartAfter.items).toHaveLength(2);
    });
  });

  // =========================================================================
  // 3. KIỂM THỬ ĐỐI KHÁNG XÁC THỰC, BẢO MẬT & KÊNH NGƯỜI BÁN
  // =========================================================================
  describe('3. Auth, Security & Seller Channel Adversarial Testing', () => {
    describe('3.1 Locked Account Enforcements', () => {
      it('blocks login of BANNED user (vuthif) with 403 AUTH_ACCOUNT_BANNED', () => {
        const res = db.loginUser('vuthif', '123456');
        expect(res.status).toBe(403);
        expect(res.body.code).toBe('AUTH_ACCOUNT_BANNED');
        expect(res.body.data).toBeNull();
      });

      it('blocks login of INACTIVE user (dangvang) with 403 AUTH_ACCOUNT_INACTIVE', () => {
        const res = db.loginUser('dangvang', '123456');
        expect(res.status).toBe(403);
        expect(res.body.code).toBe('AUTH_ACCOUNT_INACTIVE');
        expect(res.body.data).toBeNull();
      });

      it('rejects incorrect passwords or non-existent usernames with 401 AUTH_INVALID_CREDENTIALS', () => {
        const resWrongPass = db.loginUser('levanc', 'wrongpassword');
        expect(resWrongPass.status).toBe(401);
        expect(resWrongPass.body.code).toBe('AUTH_INVALID_CREDENTIALS');

        const resWrongUser = db.loginUser('nonexistent_user', '123456');
        expect(resWrongUser.status).toBe(401);
        expect(resWrongUser.body.code).toBe('AUTH_INVALID_CREDENTIALS');
      });

      it('allows ACTIVE user (levanc) with 200 and valid JWT token', () => {
        const res = db.loginUser('levanc', '123456');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.token).toMatch(/^mock\..+\.test-sig$/);
      });
    });

    describe('3.2 Registration Uniqueness & Normalization', () => {
      it('rejects duplicate username with 409 USER_USERNAME_EXISTS', () => {
        const res = db.registerUser({
          username: 'nguyenvana',
          password: 'Password123!',
          fullName: 'Nguyễn Văn A Fake',
          email: 'unique_email@test.com',
          phone: '0912345678',
          address: 'Hà Nội',
        });
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('USER_USERNAME_EXISTS');
      });

      it('rejects case/accent variant of existing username with 409 USER_USERNAME_EXISTS', () => {
        const res = db.registerUser({
          username: 'NguyễnVănA',
          password: 'Password123!',
          fullName: 'Nguyễn Văn A Test',
          email: 'another_email@test.com',
          phone: '0912345678',
          address: 'Hà Nội',
        });
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('USER_USERNAME_EXISTS');
      });

      it('rejects duplicate email with 409 USER_EMAIL_EXISTS', () => {
        const res = db.registerUser({
          username: 'brand_new_user',
          password: 'Password123!',
          fullName: 'Người Dùng Mới',
          email: 'vana@gmail.com', // Trùng với email của nguyenvana
          phone: '0912345678',
          address: 'Hà Nội',
        });
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('USER_EMAIL_EXISTS');
      });

      it('rejects registration with missing mandatory fields with 400 USER_MISSING_FIELDS', () => {
        const res = db.registerUser({
          username: '',
          password: '',
          fullName: '',
          email: '',
          phone: '',
          address: '',
        });
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('USER_MISSING_FIELDS');
      });
    });

    describe('3.3 Open Redirect Prevention (Safe Next URL)', () => {
      const getSafeRedirectUrl = (next: string | null) => {
        if (!next) return '#/account';
        if (next.startsWith('/') && !next.startsWith('//')) {
          return `#${next}`;
        }
        return '#/account';
      };

      it('neutralizes external URL open-redirect attacks', () => {
        expect(getSafeRedirectUrl('https://evil-phishing.com')).toBe('#/account');
        expect(getSafeRedirectUrl('http://attacker.org')).toBe('#/account');
        expect(getSafeRedirectUrl('//evil.com/login')).toBe('#/account');
        expect(getSafeRedirectUrl('///evil.com')).toBe('#/account');
      });

      it('neutralizes javascript and data protocol execution vectors', () => {
        expect(getSafeRedirectUrl('javascript:alert(document.domain)')).toBe('#/account');
        expect(getSafeRedirectUrl('data:text/html,<script>alert(1)</script>')).toBe('#/account');
        expect(getSafeRedirectUrl('vbscript:msgbox(1)')).toBe('#/account');
      });

      it('safely allows valid internal application hash routes', () => {
        expect(getSafeRedirectUrl('/cart')).toBe('#/cart');
        expect(getSafeRedirectUrl('/checkout')).toBe('#/checkout');
        expect(getSafeRedirectUrl('/products/1')).toBe('#/products/1');
        expect(getSafeRedirectUrl('/orders/2?new=1')).toBe('#/orders/2?new=1');
      });
    });

    describe('3.4 AccountPage 5 Shop States Matrix', () => {
      const renderAccountWithMockMe = (meData: MeDto) => {
        setAuthSession({
          token: 'mock.test.token',
          id: meData.id,
          username: meData.username,
          fullName: meData.fullName,
          accountType: 'USER',
          role: null,
        });

        vi.spyOn(authQueries, 'useMe').mockReturnValue({
          data: meData,
          isLoading: false,
          isError: false,
          error: null,
        } as any);

        const queryClient = new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: 0 } },
        });

        return render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/account']}>
              <Routes>
                <Route path="/account" element={<AccountPage />} />
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>
        );
      };

      it('State 1 (No Shop): renders invitation to apply with CTA "Nộp hồ sơ mở shop ngay"', () => {
        const mockMe: MeDto = {
          id: 5,
          username: 'hoangthie',
          fullName: 'Hoàng Thị E',
          email: 'vane@gmail.com',
          phone: '0945678901',
          address: 'Cần Thơ',
          status: 'ACTIVE',
          shop: null,
        };

        renderAccountWithMockMe(mockMe);

        expect(screen.getByText('Trở thành Nhà bảo tồn & Đối tác nhân giống BioNexus')).toBeInTheDocument();
        expect(screen.getByText('Nộp hồ sơ mở shop ngay')).toBeInTheDocument();
      });

      it('State 2 (PENDING): renders CITES examination timeline and pending warning', () => {
        const mockMe: MeDto = {
          id: 2,
          username: 'tranthib',
          fullName: 'Trần Thị B',
          email: 'thib@gmail.com',
          phone: '0912345678',
          address: 'Cầu Giấy, Hà Nội',
          status: 'ACTIVE',
          shop: {
            id: 2,
            shopName: 'AquaTerra Shop',
            status: 'PENDING',
          } as SellerDto,
        };

        renderAccountWithMockMe(mockMe);

        expect(screen.getByText('AquaTerra Shop')).toBeInTheDocument();
        expect(
          screen.getByText(/Hồ sơ đang chờ Ban Quản trị BioNexus thẩm định giấy phép/i)
        ).toBeInTheDocument();
        expect(screen.getByText('Bước 1: Nộp hồ sơ')).toBeInTheDocument();
        expect(screen.getByText('Bước 2: Thẩm định CITES')).toBeInTheDocument();
        expect(screen.getByText('Bước 3: Kích hoạt shop')).toBeInTheDocument();
      });

      it('State 3 (ACTIVE): renders active shop actions ("Vào Kênh người bán", "Đăng cá thể mới")', () => {
        const mockMe: MeDto = {
          id: 1,
          username: 'nguyenvana',
          fullName: 'Nguyễn Văn A',
          email: 'vana@gmail.com',
          phone: '0901234567',
          address: 'Quận 1, TP.HCM',
          status: 'ACTIVE',
          shop: {
            id: 1,
            shopName: 'BioGreen Exotic',
            status: 'ACTIVE',
            bio: 'Trại nhân giống bò sát cảnh F2+ đạt chuẩn CITES',
          } as SellerDto,
        };

        renderAccountWithMockMe(mockMe);

        expect(screen.getByText('BioGreen Exotic')).toBeInTheDocument();
        expect(screen.getByText('Vào Kênh người bán')).toBeInTheDocument();
        expect(screen.getByText('Đăng cá thể mới')).toBeInTheDocument();
      });

      it('State 4 (REJECTED): renders rejection reason and CTA "Nộp lại hồ sơ cấp phép →"', () => {
        const mockMe: MeDto = {
          id: 5,
          username: 'hoangvane',
          fullName: 'Hoàng Văn E',
          email: 'vane@gmail.com',
          phone: '0945678901',
          address: 'Cần Thơ',
          status: 'ACTIVE',
          shop: {
            id: 4,
            shopName: 'Exotic Reptile Hub',
            status: 'REJECTED',
          } as SellerDto,
        };

        renderAccountWithMockMe(mockMe);

        expect(screen.getByText('Exotic Reptile Hub')).toBeInTheDocument();
        expect(screen.getByText('Lý do chưa phê duyệt:')).toBeInTheDocument();
        expect(screen.getByText('Nộp lại hồ sơ cấp phép →')).toBeInTheDocument();
      });

      it('State 5 (BANNED): renders suspension notice and support email contact', () => {
        const mockMe: MeDto = {
          id: 6,
          username: 'vuthif',
          fullName: 'Vũ Thị F',
          email: 'thif@gmail.com',
          phone: '0956789012',
          address: 'Đồng Nai',
          status: 'BANNED',
          shop: {
            id: 5,
            shopName: 'Gecko Lab',
            status: 'BANNED',
          } as SellerDto,
        };

        renderAccountWithMockMe(mockMe);

        expect(screen.getByText('Gecko Lab')).toBeInTheDocument();
        expect(
          screen.getByText(/Cơ sở của bạn tạm thời bị khóa do nhận được khiếu nại/i)
        ).toBeInTheDocument();
        expect(screen.getByText('kiemduyet@bionexus.vn')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // 4. KIỂM THỬ ĐỐI KHÁNG GIAO DIỆN & TƯƠNG TÁC NGƯỜI DÙNG (UI/UX FLOWS)
  // =========================================================================
  describe('4. UI & Form Adversarial Flow Verification', () => {
    describe('4.1 Register Schema Boundary & Validation Tests', () => {
      it('validates correct registration data', () => {
        const validData = {
          username: 'tranvana',
          password: 'Password123!',
          confirmPassword: 'Password123!',
          fullName: 'Trần Văn A',
          email: 'tranvana@example.com',
          phone: '0912345678',
          address: '123 Phố Huế, Hà Nội',
        };

        const result = registerSchema.safeParse(validData);
        expect(result.success).toBe(true);
      });

      it('rejects usernames with uppercase or invalid symbols', () => {
        const invalidUsernames = ['User123', 'user-name', 'user.name', 'usr', 'user@123'];
        for (const u of invalidUsernames) {
          const res = registerSchema.safeParse({
            username: u,
            password: 'Password123!',
            confirmPassword: 'Password123!',
            fullName: 'Trần Văn A',
            email: 'test@example.com',
            phone: '0912345678',
            address: 'Hà Nội',
          });
          expect(res.success).toBe(false);
        }
      });

      it('rejects passwords shorter than 6 characters or mismatching confirmation', () => {
        const shortPass = registerSchema.safeParse({
          username: 'validuser',
          password: '12345',
          confirmPassword: '12345',
          fullName: 'Trần Văn A',
          email: 'test@example.com',
          phone: '0912345678',
          address: 'Hà Nội',
        });
        expect(shortPass.success).toBe(false);

        const mismatchPass = registerSchema.safeParse({
          username: 'validuser',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword!',
          fullName: 'Trần Văn A',
          email: 'test@example.com',
          phone: '0912345678',
          address: 'Hà Nội',
        });
        expect(mismatchPass.success).toBe(false);
      });

      it('rejects invalid Vietnam phone formats', () => {
        const invalidPhones = ['123456789', '091234567', '091234567890', '84912345678', '081234567a'];
        for (const p of invalidPhones) {
          const res = registerSchema.safeParse({
            username: 'validuser',
            password: 'Password123!',
            confirmPassword: 'Password123!',
            fullName: 'Trần Văn A',
            email: 'test@example.com',
            phone: p,
            address: 'Hà Nội',
          });
          expect(res.success).toBe(false);
        }
      });
    });

    describe('4.2 LoginPage Error Enforcements & Quick Seed', () => {
      const renderLogin = () => {
        const queryClient = new QueryClient({
          defaultOptions: { queries: { retry: false, gcTime: 0 } },
        });

        return render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/login']}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            </MemoryRouter>
          </QueryClientProvider>
        );
      };

      it('displays BANNED message when attempting login with vuthif', async () => {
        vi.spyOn(authMutations, 'useLogin').mockReturnValue({
          mutateAsync: vi.fn().mockRejectedValue({
            code: 'AUTH_ACCOUNT_BANNED',
            message: 'Tài khoản của bạn đã bị khóa vĩnh viễn',
          }),
          isPending: false,
        } as any);

        renderLogin();

        const vuthifBtn = screen.getByText('vuthif');
        fireEvent.click(vuthifBtn);

        await waitFor(() => {
          expect(
            screen.getByText('Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm quy chế bảo tồn.')
          ).toBeInTheDocument();
        });
      });

      it('displays INACTIVE message when attempting login with dangvang', async () => {
        vi.spyOn(authMutations, 'useLogin').mockReturnValue({
          mutateAsync: vi.fn().mockRejectedValue({
            code: 'AUTH_ACCOUNT_INACTIVE',
            message: 'Tài khoản chưa được kích hoạt',
          }),
          isPending: false,
        } as any);

        renderLogin();

        const dangvangBtn = screen.getByText('dangvang');
        fireEvent.click(dangvangBtn);

        await waitFor(() => {
          expect(
            screen.getByText(
              'Tài khoản chưa được kích hoạt hoặc đang tạm khóa. Vui lòng kiểm tra email kích hoạt.'
            )
          ).toBeInTheDocument();
        });
      });

      it('displays credential error message on invalid password', async () => {
        vi.spyOn(authMutations, 'useLogin').mockReturnValue({
          mutateAsync: vi.fn().mockRejectedValue({
            code: 'AUTH_INVALID_CREDENTIALS',
            status: 401,
          }),
          isPending: false,
        } as any);

        renderLogin();

        const userInput = screen.getByPlaceholderText('Nhập username hoặc email...');
        const passInput = screen.getByPlaceholderText('Nhập mật khẩu...');
        fireEvent.change(userInput, { target: { value: 'someuser' } });
        fireEvent.change(passInput, { target: { value: 'wrongpass' } });

        const submitBtn = screen.getByRole('button', { name: 'Đăng nhập' });
        fireEvent.click(submitBtn);

        await waitFor(() => {
          expect(screen.getByText('Sai tài khoản hoặc mật khẩu.')).toBeInTheDocument();
        });
      });
    });

    describe('4.3 Sonner Toast Undo Mechanism Verification', () => {
      it('triggers sonner toast with "Hoàn tác" action when item is deleted from cart', () => {
        const toastInfoSpy = vi.spyOn(toast, 'info');

        const mockCartItem = {
          productId: 4,
          productName: 'Trăn bóng Pastel',
          quantity: 2,
          price: 2500000,
          lineTotal: 5000000,
          available: true,
          maxQuantity: 2,
          speciesScientificName: 'Python regius',
        };

        const mockAddToCart = vi.fn();

        const handleRemoveItem = (item: typeof mockCartItem) => {
          toast.info(`Đã xóa "${item.productName}" khỏi giỏ hàng`, {
            duration: 6000,
            action: {
              label: 'Hoàn tác',
              onClick: () => {
                mockAddToCart({
                  productId: item.productId,
                  quantity: item.quantity,
                });
              },
            },
          });
        };

        handleRemoveItem(mockCartItem);

        expect(toastInfoSpy).toHaveBeenCalledWith(
          'Đã xóa "Trăn bóng Pastel" khỏi giỏ hàng',
          expect.objectContaining({
            duration: 6000,
            action: expect.objectContaining({
              label: 'Hoàn tác',
            }),
          })
        );

        // Kích hoạt callback hoàn tác
        const callArgs = toastInfoSpy.mock.calls[0]![1] as any;
        callArgs.action.onClick();

        expect(mockAddToCart).toHaveBeenCalledWith({
          productId: 4,
          quantity: 2,
        });
      });
    });
  });
});
