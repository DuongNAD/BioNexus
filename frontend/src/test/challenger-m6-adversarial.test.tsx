import type { ReactNode } from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Routes, Route } from 'react-router';
import { RequireRole } from '@/components/auth/RouteGuards';
import { db } from '@/mocks/db';
import { setAuthSession, clearAuthSession } from '@/api/authStore';
import { createMockToken } from '@/mocks/auth';
import { AdminLayout } from '@/components/layout/AdminLayout';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminSellersPage from '@/pages/admin/AdminSellersPage';
import AdminProductsPage from '@/pages/admin/AdminProductsPage';
import AdminSpeciesPage from '@/pages/admin/AdminSpeciesPage';
import * as adminQueries from '@/api/queries/useAdminQueries';
import * as speciesQueries from '@/api/queries/useSpeciesQueries';
import { toProductView } from '@/api/adapters';
import { toast } from 'sonner';
import type { AdminRole, AuthResponse, CreateSpeciesRequest } from '@/types/api';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Mock auth profiles using valid mock tokens from createMockToken
const MOCK_SUPERADMIN: AuthResponse = {
  token: createMockToken({ sub: 101, username: 'superadmin', accountType: 'ADMIN', role: 'SUPER_ADMIN' }),
  id: 101,
  username: 'superadmin',
  fullName: 'Nguyễn Quản Trị Tối Cao',
  accountType: 'ADMIN',
  role: 'SUPER_ADMIN',
};

const MOCK_MODERATOR1: AuthResponse = {
  token: createMockToken({ sub: 102, username: 'moderator1', accountType: 'ADMIN', role: 'MODERATOR' }),
  id: 102,
  username: 'moderator1',
  fullName: 'Lê Kiểm Duyệt',
  accountType: 'ADMIN',
  role: 'MODERATOR',
};

const MOCK_BIOLOGIST1: AuthResponse = {
  token: createMockToken({ sub: 104, username: 'biologist1', accountType: 'ADMIN', role: 'BIOLOGIST' }),
  id: 104,
  username: 'biologist1',
  fullName: 'TS. Nguyễn Sinh Học',
  accountType: 'ADMIN',
  role: 'BIOLOGIST',
};

const MOCK_NORMAL_USER: AuthResponse = {
  token: createMockToken({ sub: 1, username: 'levanc', accountType: 'USER', role: null }),
  id: 1,
  username: 'levanc',
  fullName: 'Lê Văn C',
  accountType: 'USER',
  role: null,
};

describe('CHALLENGER 1: Milestone 6 Adversarial Stress Testing Suite', () => {
  beforeEach(() => {
    db.resetDb();
    clearAuthSession();
    vi.clearAllMocks();

    // Default spies for admin component queries using authoritative db data
    vi.spyOn(adminQueries, 'useAdminSellers').mockImplementation((status) => {
      const all = db.getSellers(status);
      return {
        data: all,
        isLoading: false,
        isError: false,
        error: null,
      } as any;
    });

    vi.spyOn(adminQueries, 'useAdminProducts').mockImplementation((status) => {
      const all = db.getAdminProducts(status).map((p) => toProductView(p));
      return {
        data: all,
        isLoading: false,
        isError: false,
        error: null,
      } as any;
    });

    vi.spyOn(speciesQueries, 'useSpeciesList').mockImplementation(() => {
      const all = db.getSpeciesList();
      return {
        data: all,
        isLoading: false,
        isError: false,
        error: null,
      } as any;
    });
  });

  // =========================================================================
  // 1. KIỂM THỬ PHÂN QUYỀN RBAC & XUNG ĐỘT QUYỀN HẠN (RBAC STRESS TEST)
  // =========================================================================
  describe('1. RBAC & Privilege Boundary Stress Testing', () => {
    describe('1.1 AdminLayout Role-Filtered Navigation Menus', () => {
      it('SUPER_ADMIN sees all 4 management sections in navigation menu', () => {
        setAuthSession(MOCK_SUPERADMIN);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin']}>
              <AdminLayout />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getByRole('link', { name: /Tổng quan/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Duyệt shop/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Duyệt sản phẩm/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Quản lý loài/i })).toBeInTheDocument();
      });

      it('MODERATOR sees KPI, Shop Moderation, Product Moderation, but Species Management is HIDDEN', () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin']}>
              <AdminLayout />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getByRole('link', { name: /Tổng quan/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Duyệt shop/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Duyệt sản phẩm/i })).toBeInTheDocument();
        // Quản lý loài phải bị ẩn hoàn toàn khỏi DOM
        expect(screen.queryByRole('link', { name: /Quản lý loài/i })).not.toBeInTheDocument();
      });

      it('BIOLOGIST sees KPI and Species Management, but Shop and Product Moderation are HIDDEN', () => {
        setAuthSession(MOCK_BIOLOGIST1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin']}>
              <AdminLayout />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getByRole('link', { name: /Tổng quan/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Quản lý loài/i })).toBeInTheDocument();
        // Kiểm duyệt Shop & Sản phẩm phải bị ẩn hoàn toàn khỏi DOM
        expect(screen.queryByRole('link', { name: /Duyệt shop/i })).not.toBeInTheDocument();
        expect(screen.queryByRole('link', { name: /Duyệt sản phẩm/i })).not.toBeInTheDocument();
      });
    });

    // Quyền truy cập nay do router kiểm tra (RequireRole bọc từng route admin, xem src/app/router.tsx),
    // nên các test dưới đây dựng lại đúng cấu trúc đó thay vì dựa vào màn 403 riêng trong từng trang.
    const renderGuarded = (path: string, page: ReactNode, allowedRoles?: AdminRole[]) => {
      const queryClient = createTestQueryClient();
      return render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={[path]}>
            <Routes>
              <Route path="/admin/login" element={<p>Trang đăng nhập quản trị</p>} />
              <Route path="*" element={<RequireRole allowedRoles={allowedRoles}>{page}</RequireRole>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      );
    };

    describe('1.2 Route Access Protection: Unauthenticated & Regular User (levanc)', () => {
      it('Unauthenticated user opening /admin is redirected to the admin login page', () => {
        clearAuthSession();
        renderGuarded('/admin', <AdminDashboardPage />);

        expect(screen.getByText('Trang đăng nhập quản trị')).toBeInTheDocument();
        expect(screen.queryByText(/Tổng quan Quản trị/i)).not.toBeInTheDocument();
      });

      it('Regular USER (levanc) opening /admin sees the 403 state inside the layout', () => {
        setAuthSession(MOCK_NORMAL_USER);
        renderGuarded('/admin', <AdminDashboardPage />);

        expect(screen.getByText('Mã lỗi 403')).toBeInTheDocument();
        expect(screen.getByText(/Bạn không có quyền xem trang này/i)).toBeInTheDocument();
        expect(screen.getByText(/chỉ dành cho Ban Quản trị/i)).toBeInTheDocument();
      });

      it.each([
        ['/admin/sellers', <AdminSellersPage key="s" />, ['MODERATOR'] as AdminRole[]],
        ['/admin/products', <AdminProductsPage key="p" />, ['MODERATOR'] as AdminRole[]],
        ['/admin/species', <AdminSpeciesPage key="sp" />, ['BIOLOGIST'] as AdminRole[]],
      ])('Regular USER (levanc) opening %s is blocked with 403', (path, page, roles) => {
        setAuthSession(MOCK_NORMAL_USER);
        renderGuarded(path, page, roles);

        expect(screen.getByText('Mã lỗi 403')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Phím tắt/i })).not.toBeInTheDocument();
      });
    });

    describe('1.3 Role Isolation: BIOLOGIST attempting to access Commercial Moderation', () => {
      it.each([
        ['/admin/sellers', <AdminSellersPage key="s" />],
        ['/admin/products', <AdminProductsPage key="p" />],
      ])('BIOLOGIST opening %s sees 403 and no moderation actions', (path, page) => {
        setAuthSession(MOCK_BIOLOGIST1);
        renderGuarded(path, page, ['MODERATOR']);

        expect(screen.getByText('Mã lỗi 403')).toBeInTheDocument();
        expect(screen.getByText(/không được giao nhiệm vụ ở khu vực này/i)).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Từ chối/i })).not.toBeInTheDocument();
      });

      it('BIOLOGIST dashboard does not query moderator-only endpoints and hides moderation tiles', () => {
        setAuthSession(MOCK_BIOLOGIST1);
        const sellersSpy = vi.mocked(adminQueries.useAdminSellers);
        const productsSpy = vi.mocked(adminQueries.useAdminProducts);
        renderGuarded('/admin', <AdminDashboardPage />);

        expect(screen.getByText(/Tổng quan Quản trị/i)).toBeInTheDocument();
        expect(screen.queryByText('Shop chờ duyệt')).not.toBeInTheDocument();
        expect(screen.queryByText('Sản phẩm chờ duyệt')).not.toBeInTheDocument();
        // Hook vẫn được gọi (luật hook) nhưng phải ở trạng thái tắt để không bắn request 403
        expect(sellersSpy.mock.calls.every(([, opts]) => opts?.enabled === false)).toBe(true);
        expect(productsSpy.mock.calls.every(([, opts]) => opts?.enabled === false)).toBe(true);
      });
    });

    describe('1.4 Role Isolation: MODERATOR attempting to access Taxonomy/Species Management', () => {
      it('MODERATOR opening /admin/species is blocked with 403', () => {
        setAuthSession(MOCK_MODERATOR1);
        renderGuarded('/admin/species', <AdminSpeciesPage />, ['BIOLOGIST']);

        expect(screen.getByText('Mã lỗi 403')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /Thêm loài mới/i })).not.toBeInTheDocument();
      });
    });

    describe('1.5 Session ends while a moderation page is open', () => {
      it('Clearing the session unmounts the page through the guard instead of crashing on hook order', () => {
        setAuthSession(MOCK_MODERATOR1);
        renderGuarded('/admin/sellers', <AdminSellersPage />, ['MODERATOR']);
        expect(screen.getAllByText('AquaTerra Shop')[0]).toBeInTheDocument();

        act(() => {
          clearAuthSession();
        });

        expect(screen.getByText('Trang đăng nhập quản trị')).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // 2. KIỂM THỬ LOGIC KIỂM DUYỆT (MODERATION STATE MACHINE & VALIDATION TEST)
  // =========================================================================
  describe('2. Moderation State Machine & Validation Test', () => {
    describe('2.1 Seller Rejection Validation & State Transitions', () => {
      it('UI guards rejection: empty reason or < 10 characters disables button and aborts submission', () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/sellers']}>
              <AdminSellersPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('AquaTerra Shop')[0]).toBeInTheDocument();

        // Mở Dialog từ chối bằng nút Từ chối
        const rejectBtn = screen.getByRole('button', { name: /^Từ chối$/i });
        fireEvent.click(rejectBtn);

        expect(screen.getByRole('dialog', { name: 'Từ chối hồ sơ cửa hàng' })).toBeInTheDocument();

        // Nút Xác nhận Từ chối: ban đầu textarea rỗng -> disabled
        const confirmRejectBtn = screen.getByRole('button', { name: /^Từ chối hồ sơ$/i });
        expect(confirmRejectBtn).toBeDisabled();

        // Gõ lý do < 10 ký tự: "Sai giấy" (8 ký tự)
        const textarea = screen.getByLabelText(/^Lý do từ chối$/i);
        fireEvent.change(textarea, { target: { value: 'Sai giấy' } });
        expect(confirmRejectBtn).toBeDisabled();

        // Gõ lý do >= 10 ký tự: "Giấy phép CITES thiếu mộc đỏ kiểm lâm" (37 ký tự)
        fireEvent.change(textarea, { target: { value: 'Giấy phép CITES thiếu mộc đỏ kiểm lâm' } });
        expect(confirmRejectBtn).not.toBeDisabled();
      });

      it('Seller State Machine in DB: permits PENDING->ACTIVE, PENDING->REJECTED, ACTIVE->BANNED, forbids invalid transitions', () => {
        // 1. AquaTerra Shop (ID 2) ban đầu là PENDING
        const shop = db.getSellers().find((s) => s.id === 2);
        expect(shop).toBeDefined();
        expect(shop?.status).toBe('PENDING');

        // Thử chuyển không hợp lệ: PENDING -> BANNED trực tiếp
        const invalidDirectBan = db.moderateSeller(1, 2, 'BANNED');
        expect(invalidDirectBan.status).toBe(409);
        expect(invalidDirectBan.body.code).toBe('SELLER_INVALID_STATUS_TRANSITION');

        // Chuyển hợp lệ: PENDING -> ACTIVE
        const approveRes = db.moderateSeller(1, 2, 'ACTIVE');
        expect(approveRes.status).toBe(200);
        expect(approveRes.body.code).toBe('SELLER_APPROVED_SUCCESS');
        expect(approveRes.body.data?.status).toBe('ACTIVE');

        // Thử chuyển ngược không hợp lệ: ACTIVE -> PENDING
        const invalidRevert = db.moderateSeller(1, 2, 'PENDING');
        expect(invalidRevert.status).toBe(409);
        expect(invalidRevert.body.code).toBe('SELLER_INVALID_STATUS_TRANSITION');

        // Chuyển hợp lệ: ACTIVE -> BANNED
        const banRes = db.moderateSeller(1, 2, 'BANNED', 'Vi phạm quy chế nhân giống');
        expect(banRes.status).toBe(200);
        expect(banRes.body.code).toBe('SELLER_BANNED_SUCCESS');
        expect(banRes.body.data?.status).toBe('BANNED');

        // Thử chuyển từ BANNED -> ACTIVE (Bị chặn vĩnh viễn)
        const invalidUnban = db.moderateSeller(1, 2, 'ACTIVE');
        expect(invalidUnban.status).toBe(409);
        expect(invalidUnban.body.code).toBe('SELLER_INVALID_STATUS_TRANSITION');
      });
    });

    describe('2.2 Product Rejection Validation & Public Marketplace Reflection', () => {
      it('Product State Machine: approving PENDING product immediately reflects in public store catalog', () => {
        // Trước khi duyệt: sản phẩm #3 (Rồng Úc Hypo Baby) đang PENDING
        const pendingProduct = db.getAdminProducts().find((p) => p.id === 3);
        expect(pendingProduct).toBeDefined();
        expect(pendingProduct?.status).toBe('PENDING');

        // Danh mục công khai ban đầu (seed gốc + khối CATALOG) chưa có sản phẩm #3
        const initialPublic = db.getProducts();
        const initialTotal = initialPublic.total;
        const sameSpecies = { speciesId: pendingProduct!.speciesId, size: 48 };
        expect(db.getProducts(sameSpecies).items.some((p) => p.id === 3)).toBe(false);

        // Duyệt sản phẩm #3
        const approveRes = db.moderateProduct(1, 3, 'APPROVED');
        expect(approveRes.status).toBe(200);
        expect(approveRes.body.code).toBe('PRODUCT_APPROVED_SUCCESS');

        // Danh mục công khai phản ánh tức thì: thêm đúng 1 sản phẩm, chính là sản phẩm #3
        expect(db.getProducts().total).toBe(initialTotal + 1);
        const approvedItem = db.getProducts(sameSpecies).items.find((p) => p.id === 3);
        expect(approvedItem).toBeDefined();
        expect(approvedItem?.productName).toBe('Rồng Úc Hypo Baby (2 tháng tuổi)');
      });

      it('Product State Machine: rejects invalid transitions (e.g. APPROVED -> PENDING, REJECTED -> APPROVED)', () => {
        // Sản phẩm #1 ban đầu đã APPROVED
        const prod1 = db.getAdminProducts().find((p) => p.id === 1);
        expect(prod1?.status).toBe('APPROVED');

        const invalidPending = db.moderateProduct(1, 1, 'PENDING');
        expect(invalidPending.status).toBe(409);
        expect(invalidPending.body.code).toBe('PRODUCT_INVALID_STATUS_TRANSITION');

        // Sản phẩm #5 ban đầu REJECTED
        const prod5 = db.getAdminProducts().find((p) => p.id === 5);
        expect(prod5?.status).toBe('REJECTED');

        const invalidApprove = db.moderateProduct(1, 5, 'APPROVED');
        expect(invalidApprove.status).toBe(409);
        expect(invalidApprove.body.code).toBe('PRODUCT_INVALID_STATUS_TRANSITION');
      });

      it('Product Rejection UI: custom note < 5 characters triggers toast error and blocks mutation', () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/products']}>
              <AdminProductsPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('Rồng Úc Hypo Baby (2 tháng tuổi)')[0]).toBeInTheDocument();

        // Mở dialog từ chối
        const rejectBtn = screen.getByRole('button', { name: /^Từ chối$/i });
        fireEvent.click(rejectBtn);

        expect(screen.getByRole('dialog', { name: 'Từ chối sản phẩm' })).toBeInTheDocument();

        // Chọn "Lý do khác" (id = 'OTHER')
        const otherReasonCard = screen.getByText('Lý do khác');
        fireEvent.click(otherReasonCard);

        // Nhập note < 5 ký tự: "abc"
        const customNoteInput = screen.getByLabelText(/Ghi chú thêm/i);
        fireEvent.change(customNoteInput, { target: { value: 'abc' } });

        // Bấm Xác nhận Từ chối
        const confirmBtn = screen.getByRole('button', { name: /^Từ chối sản phẩm$/i });
        fireEvent.click(confirmBtn);

        // Kích hoạt toast lỗi
        expect(toast.error).toHaveBeenCalledWith('Vui lòng chọn hoặc nhập lý do từ chối cụ thể');
      });
    });

    describe('2.3 Queue Empty State & Auto-Advance', () => {
      it('AdminSellersPage displays empty state when filter matches 0 sellers', () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/sellers']}>
              <AdminSellersPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('AquaTerra Shop')[0]).toBeInTheDocument();

        // Tìm kiếm chuỗi không tồn tại
        const searchInput = screen.getByPlaceholderText(/Tìm shop, chủ shop/i);
        fireEvent.change(searchInput, { target: { value: 'ShopKhongTonTai999' } });

        // Hàng đợi hiển thị trạng thái rỗng
        expect(screen.getByText('Không có cửa hàng nào khớp bộ lọc.')).toBeInTheDocument();
        // Cột chi tiết hiển thị placeholder
        expect(screen.getByText('Chưa chọn hồ sơ nào')).toBeInTheDocument();
      });

      it('AdminProductsPage displays empty state when filter matches 0 products', () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/products']}>
              <AdminProductsPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('Rồng Úc Hypo Baby (2 tháng tuổi)')[0]).toBeInTheDocument();

        // Tìm kiếm chuỗi không tồn tại
        const searchInput = screen.getByPlaceholderText(/Tìm sản phẩm, loài/i);
        fireEvent.change(searchInput, { target: { value: 'CaTheKhongCoTrenDoi999' } });

        // Hàng đợi hiển thị trạng thái rỗng
        expect(screen.getByText('Không có sản phẩm nào khớp bộ lọc.')).toBeInTheDocument();
      });
    });

    describe('2.4 Species Management State Machine & Validation', () => {
      it('BIOLOGIST creates species successfully when attached to valid GENUS node (rank: GENUS)', () => {
        // Tra chi theo tên thay vì id cố định; Pogona barbata đã có trong catalog nên dùng loài khác cùng chi
        const pogonaId = db.getRawState().taxonomy.find((n) => n.scientificName === 'Pogona')!.id;
        const speciesBefore = db.getSpeciesList().length;
        const req: CreateSpeciesRequest = {
          nodeId: pogonaId,
          scientificName: 'Pogona microlepidota',
          commonName: 'Rồng Úc Kimberley',
          conservationStatus: 'LC',
          environmentSpecs: 'Nhiệt độ: 24–30°C; Điểm sưởi: 36–40°C; Độ ẩm: 35–50%',
          description: 'Loài bò sát có gai cằm sẫm màu khi bị kích động.',
          imageURL: '/photos/bearded-dragon/hero-960.webp',
          referenceURL: 'https://www.gbif.org/species/2469145',
        };

        const res = db.createSpecies(104, req);
        expect(res.status).toBe(201);
        expect(res.body.code).toBe('CREATED_SUCCESS');
        expect(res.body.data?.scientificName).toBe('Pogona microlepidota');

        // Danh sách loài tăng đúng 1
        expect(db.getSpeciesList().length).toBe(speciesBefore + 1);
      });

      it('Rejects creating species if attached to non-GENUS node (e.g. node 1 - Animalia, rank KINGDOM)', () => {
        const req: CreateSpeciesRequest = {
          nodeId: 1, // Animalia (KINGDOM)
          scientificName: 'Invalidus animalus',
          commonName: 'Loài Gắn Sai Cấp',
          conservationStatus: 'LC',
          environmentSpecs: 'Nhiệt độ: 20–25°C',
          description: 'Mô tả',
          imageURL: '/photos/axolotl/hero-960.webp',
          referenceURL: 'https://www.gbif.org/species/1',
        };

        const res = db.createSpecies(104, req);
        expect(res.status).toBe(400);
        expect(res.body.code).toBe('TAXONOMY_NOT_GENUS');
      });

      it('Rejects duplicate scientific name (case and diacritics normalized)', () => {
        const req: CreateSpeciesRequest = {
          nodeId: 22,
          scientificName: 'Pogona vitticeps', // Đã tồn tại trong seed
          commonName: 'Trùng Tên Khoa Học',
          conservationStatus: 'LC',
          environmentSpecs: 'Nhiệt độ: 26–32°C; Điểm sưởi: 38–42°C; Độ ẩm: 30–40%',
          description: 'Mô tả trùng',
          imageURL: '/photos/bearded-dragon/hero-960.webp',
          referenceURL: 'https://www.gbif.org/species/2469145',
        };

        const res = db.createSpecies(104, req);
        expect(res.status).toBe(409);
        expect(res.body.code).toBe('SPECIES_NAME_EXISTS');
      });
    });
  });

  // =========================================================================
  // 3. KIỂM THỬ PHÒNG VỆ PHÍM TẮT (INPUT FOCUS GUARD)
  // =========================================================================
  describe('3. Keyboard Ergonomics & Input Focus Guard Stress Testing', () => {
    describe('3.1 AdminSellersPage Input Focus Guard', () => {
      it('When search input is focused, typing J, K, A, R does NOT trigger navigation or open modals', () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/sellers']}>
              <AdminSellersPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('AquaTerra Shop')[0]).toBeInTheDocument();

        const searchInput = screen.getByPlaceholderText(/Tìm shop, chủ shop/i);
        searchInput.focus();
        expect(document.activeElement).toBe(searchInput);

        // Gõ phím A khi đang focus input -> KHÔNG được mở Approve Modal
        fireEvent.keyDown(searchInput, { key: 'a' });
        expect(screen.queryByRole('dialog', { name: 'Duyệt cửa hàng này?' })).not.toBeInTheDocument();

        // Gõ phím R khi đang focus input -> KHÔNG được mở Reject Modal
        fireEvent.keyDown(searchInput, { key: 'r' });
        expect(screen.queryByRole('dialog', { name: 'Từ chối hồ sơ cửa hàng' })).not.toBeInTheDocument();

        // Gõ phím J, K
        fireEvent.keyDown(searchInput, { key: 'j' });
        fireEvent.keyDown(searchInput, { key: 'k' });
      });

      it('When document body is active (no input focused), typing A opens Approve Modal and Esc closes it', async () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/sellers']}>
              <AdminSellersPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('AquaTerra Shop')[0]).toBeInTheDocument();

        // Bỏ focus mọi input
        document.body.focus();

        // Gõ 'a'
        fireEvent.keyDown(window, { key: 'a' });
        expect(screen.getByRole('dialog', { name: 'Duyệt cửa hàng này?' })).toBeInTheDocument();

        // Gõ 'Escape' để đóng
        fireEvent.keyDown(window, { key: 'Escape' });
        await waitFor(() => {
          expect(screen.queryByRole('dialog', { name: 'Duyệt cửa hàng này?' })).not.toBeInTheDocument();
        });
      });

      it('When document body is active, typing R opens Reject Modal and Esc closes it', async () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/sellers']}>
              <AdminSellersPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('AquaTerra Shop')[0]).toBeInTheDocument();

        document.body.focus();

        // Gõ 'r'
        fireEvent.keyDown(window, { key: 'r' });
        expect(screen.getByRole('dialog', { name: 'Từ chối hồ sơ cửa hàng' })).toBeInTheDocument();

        // Khi modal Reject đang mở, textarea xuất hiện: nếu gõ phím A/J/K trong textarea thì không kích hoạt hotkey khác
        const textarea = screen.getByLabelText(/^Lý do từ chối$/i);
        textarea.focus();
        fireEvent.keyDown(textarea, { key: 'a' });
        expect(screen.queryByRole('dialog', { name: 'Duyệt cửa hàng này?' })).not.toBeInTheDocument();

        // Nhấn Escape để đóng modal
        fireEvent.keyDown(window, { key: 'Escape' });
        await waitFor(() => {
          expect(screen.queryByRole('dialog', { name: 'Từ chối hồ sơ cửa hàng' })).not.toBeInTheDocument();
        });
      });
    });

    describe('3.2 AdminProductsPage Input Focus Guard', () => {
      it('When search input is focused, typing J, K, A, R does NOT trigger action modals', () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/products']}>
              <AdminProductsPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('Rồng Úc Hypo Baby (2 tháng tuổi)')[0]).toBeInTheDocument();

        const searchInput = screen.getByPlaceholderText(/Tìm sản phẩm, loài/i);
        searchInput.focus();

        // Gõ A, R, J, K
        fireEvent.keyDown(searchInput, { key: 'a' });
        expect(screen.queryByRole('dialog', { name: 'Duyệt sản phẩm này?' })).not.toBeInTheDocument();

        fireEvent.keyDown(searchInput, { key: 'r' });
        expect(screen.queryByRole('dialog', { name: 'Từ chối sản phẩm' })).not.toBeInTheDocument();
      });

      it('When document body is active, typing A opens Product Approve Modal and Esc closes it', async () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/products']}>
              <AdminProductsPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('Rồng Úc Hypo Baby (2 tháng tuổi)')[0]).toBeInTheDocument();

        document.body.focus();

        // Gõ 'a'
        fireEvent.keyDown(window, { key: 'a' });
        expect(screen.getByRole('dialog', { name: 'Duyệt sản phẩm này?' })).toBeInTheDocument();

        // Gõ 'Escape'
        fireEvent.keyDown(window, { key: 'Escape' });
        await waitFor(() => {
          expect(screen.queryByRole('dialog', { name: 'Duyệt sản phẩm này?' })).not.toBeInTheDocument();
        });
      });

      it('When document body is active, typing R opens Product Reject Modal and Esc closes it', async () => {
        setAuthSession(MOCK_MODERATOR1);
        const queryClient = createTestQueryClient();

        render(
          <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={['/admin/products']}>
              <AdminProductsPage />
            </MemoryRouter>
          </QueryClientProvider>
        );

        expect(screen.getAllByText('Rồng Úc Hypo Baby (2 tháng tuổi)')[0]).toBeInTheDocument();

        document.body.focus();

        // Gõ 'r'
        fireEvent.keyDown(window, { key: 'r' });
        expect(screen.getByRole('dialog', { name: 'Từ chối sản phẩm' })).toBeInTheDocument();

        // Gõ 'Escape'
        fireEvent.keyDown(window, { key: 'Escape' });
        await waitFor(() => {
          expect(screen.queryByRole('dialog', { name: 'Từ chối sản phẩm' })).not.toBeInTheDocument();
        });
      });
    });
  });
});
