# Project: BioNexus Frontend

## Architecture
BioNexus Frontend là ứng dụng web Single Page Application (SPA) xây dựng bằng React 19, TypeScript strict mode, Vite, Tailwind CSS v4, Motion, và Three.js/React Three Fiber. Ứng dụng chạy theo kiến trúc Mock-First với Mock Service Worker 2 (MSW) mô phỏng 100% hợp đồng API của backend Java Tomcat 10 (`/BioNexus`), cho phép phát triển, kiểm thử hoàn chỉnh và chuyển đổi liền mạch sang backend thật bằng cách tắt mock (`VITE_USE_MOCKS=false`).

### Luồng dữ liệu và Phân tầng kiến trúc
1. **Lớp Giao diện (Presentation Layer)**:
   - 24 route chính thức định tuyến bằng `createHashRouter` (hỗ trợ triển khai tĩnh trong WAR Tomcat không bị 404 khi tải lại).
   - 4 Khung Layout Shell: `RootLayout`, `AuthLayout`, `AccountLayout`/`SellerLayout`, `AdminLayout`.
   - Hệ thống thiết kế chuẩn mẫu R ("Bio-Luxury tối"): bảng token CSS ngữ nghĩa (`tokens.css`), typography 3 font, thang 7 màu IUCN, 37 UI components dùng chung.
   - Lớp đồ họa 3D lười (Lazy 3D Layer): Three.js cô lập trong manual chunk `three`, bọc qua `SceneShell` bảo đảm poster-first, unmount khi ra khỏi màn hình, tối đa 1 WebGL canvas hoạt động tại một thời điểm, thích ứng 4 phân cấp phần cứng (`high`, `medium`, `low`, `static`).
2. **Lớp Quản trị Trạng thái & Dữ liệu (State & Data Layer)**:
   - TanStack Query (v5): Quản lý cache server-state, query key factory tập trung (`queryKeys`), optimistic update cho giỏ hàng, tự động hủy và làm mới dữ liệu.
   - HTTP Client tập trung (`src/api/client.ts`): Gọi đường dẫn tương đối `api/...` (không dấu `/` đầu), bao bọc `ApiResponse<T>`, hàm `normalizePage()` tương thích đa hình (mảng phẳng hoặc đối tượng Page).
   - Lớp Adapter (`src/api/adapters.ts`): Chuẩn hóa các trường không đồng nhất từ backend (ví dụ `SpeciesDto.imageURL` vs `ProductDto.imageUrl`) thành View Models nhất quán cho component.
3. **Lớp Giả lập Dữ liệu (Mock Service Worker Layer)**:
   - MSW 2 Service Worker (`src/mocks/browser.ts`, `src/mocks/handlers/`): Chặn các request `api/...`, mô phỏng độ trễ mạng và xác thực token JWT giả lập.
   - Kho lưu trữ state giả lập (`src/mocks/db.ts`): Ánh xạ 10 bảng dữ liệu từ `database/seed_data.sql`, đồng bộ hóa vào `localStorage` (`bionexus.mock.v1`) để giữ trạng thái cho các thao tác thêm giỏ hàng, đặt hàng, tạo bài bán, duyệt bài của kịch bản demo 5 phút (PLAN 11.3).
4. **Lớp Tài nguyên & Bản quyền Đa phương tiện (Media Assets & Licensing)**:
   - 100% ảnh thật lấy từ Wikimedia Commons có giấy phép tự do (CC0, CC BY, CC BY-SA, Public Domain), tuyệt đối không dùng ảnh AI.
   - Pipeline tối ưu Sharp tạo ảnh đa kích thước (AVIF q55, WebP q72, JPG 1600) kèm chuỗi placeholder mờ base64 16px chống giật layout (CLS).
   - Trang `/credits` và artifact Bảng duyệt ảnh ghi nhận đầy đủ tác giả, giấy phép, link gốc và lý do chọn.

---

## Feature Inventory
Bảng danh mục toàn bộ tính năng trích xuất từ 3 báo cáo khảo sát kỹ thuật, phân định mốc thực hiện và nguồn gốc đặc tả.

| # | Feature Code | Feature Name & Description | Milestone | Source |
|---|--------------|----------------------------|-----------|--------|
| 1 | FEAT-CORE-01 | Khởi tạo dự án Vite + React 19 + TypeScript strict + Tailwind v4 + HashRouter | M1 | PROMPT 01, docs/01 |
| 2 | FEAT-CORE-02 | Thiết lập hệ sinh thái công cụ: Lucide React, Sonner, Biome/ESLint, Prettier, Vitest | M1 | PROMPT 01, docs/01 |
| 3 | FEAT-DS-01 | Triển khai bảng token CSS "Bio-Luxury tối" (màu sắc, kính mờ glassmorphism, thang IUCN) | M1 | PROMPT 04, docs/02 |
| 4 | FEAT-DS-02 | Thiết lập Typography phân cấp 3 font: Be Vietnam Pro, Cormorant Garamond, JetBrains Mono | M1 | PROMPT 04, docs/02 |
| 5 | FEAT-DS-03 | Thư viện 37 thành phần UI dùng chung (Buttons, Inputs, Cards, Badges, Modals, Tabs, Skeleton) | M1 | PROMPT 04, docs/02 |
| 6 | FEAT-MEDIA-01 | Kịch bản thu thập và kiểm tra bản quyền ảnh tự do từ Wikimedia Commons API (`fetch-photos.mjs`) | M1 | PROMPT 02, docs/06 |
| 7 | FEAT-MEDIA-02 | Pipeline tối ưu hóa ảnh Sharp (AVIF/WebP/JPG đa kích thước, base64 placeholder) (`optimize-photos.mjs`) | M1 | PROMPT 02, docs/06 |
| 8 | FEAT-MEDIA-03 | Xây dựng từ điển dữ liệu ảnh `PHOTOS`, artifact Bảng duyệt ảnh và trang ghi công `/credits` | M1 | PROMPT 02, docs/06 |
| 9 | FEAT-API-01 | Centralized HTTP Client `api<T>()` tương đối `api/...`, xử lý mã lỗi `MessageKey` (59 keys) | M2 | PROMPT 03, docs/04 |
| 10 | FEAT-API-02 | Khai báo 23 interface DTO TypeScript và tầng chuyển đổi `adapters.ts` (`normalizePage`) | M2 | PROMPT 03, docs/04 |
| 11 | FEAT-API-03 | Thiết lập TanStack Query (v5) client và Query Key Factory tập trung `queryKeys` | M2 | PROMPT 03, docs/04 |
| 12 | FEAT-MSW-01 | Khởi tạo MSW 2 Service Worker (`browser.ts`) và nạp seed data 10 bảng từ `seed_data.sql` | M2 | PROMPT 03, docs/04 |
| 13 | FEAT-MSW-02 | Kho lưu trữ state đột biến `db.ts` đồng bộ `localStorage` (`bionexus.mock.v1`) có hàm reset | M2 | PROMPT 03, docs/04 |
| 14 | FEAT-MSW-03 | Triển khai 29 MSW Handlers (Auth, Taxonomy, Species, Products, Cart, Orders, Seller, Admin) | M2 | PROMPT 03, docs/04 |
| 15 | FEAT-NAV-01 | Triển khai 4 Layout Shells: `RootLayout`, `AuthLayout`, `AccountLayout`, `AdminLayout` | M2 | PROMPT 05, docs/03 |
| 16 | FEAT-NAV-02 | Cơ chế bảo vệ định tuyến: `RequireAuth`, `RequireRole`, `RequireSeller` kèm `?next=` | M2 | PROMPT 05, docs/03 |
| 17 | FEAT-3D-01 | Nền tảng đồ họa 3D: cô lập Three.js chunk, `QualityProvider` (4 tiers), `SceneShell` poster-first | M3 | PROMPT 06, docs/05 |
| 18 | FEAT-3D-02 | Cảnh hạt biến hình `ParticleMorph` (5 hình dạng sinh học, GLSL shader sóng & xoáy, fallback) | M3 | PROMPT 06, docs/05 |
| 19 | FEAT-3D-03 | Địa cầu 3D `BioEarth` (7 lớp: lõi, hạt lục địa, bờ biển, khí quyển, 9 marker IUCN, cung sáng shop) | M3 | PROMPT 07, docs/05 |
| 20 | FEAT-3D-04 | Chuỗi xoắn `HelixScene` (14 bậc, 28 thẻ ảnh WebP 960px, ống sáng phát quang, cuộn dính đồng bộ) | M3 | PROMPT 09, docs/05 |
| 21 | FEAT-ROUTE-01 | Route 1: Trang chủ tương tác (`/`) tích hợp 6 phân đoạn câu chuyện sinh quyển BioNexus | M3 | PROMPTS 08-09, docs/03 |
| 22 | FEAT-ROUTE-02 | Route 2: Cây phân loại sinh học tương tác (`/taxonomy`) 6 cấp bậc phân loại | M4 | PROMPT 10, docs/03 |
| 23 | FEAT-ROUTE-03 | Route 3: Chi tiết nút phân loại (`/taxonomy/:id`) hiển thị nút con và danh sách loài | M4 | PROMPT 10, docs/03 |
| 24 | FEAT-ROUTE-04 | Route 4: Bách khoa toàn thư sinh vật (`/species`) với bộ lọc phân loại, IUCN và tìm kiếm | M4 | PROMPT 10, docs/03 |
| 25 | FEAT-ROUTE-05 | Route 5: Hồ sơ loài tạp chí khoa học (`/species/:id`) với Hero 16:9, bản đồ sinh cảnh, liên kết shop | M4 | PROMPT 11, docs/03 |
| 26 | FEAT-UI-SEARCH | Hộp tìm kiếm thông minh Command Palette (`⌘K` / `Ctrl+K`) tra cứu nhanh toàn site | M4 | PROMPT 10, docs/03 |
| 27 | FEAT-ROUTE-06 | Route 6: Danh mục sàn sinh vật cảnh (`/products`) lọc theo loài, cửa hàng, giá, trạng thái | M5 | PROMPT 12, docs/03 |
| 28 | FEAT-ROUTE-07 | Route 7: Chi tiết sản phẩm sinh vật cảnh (`/products/:id`) với bộ ảnh, nguồn gốc sinh học | M5 | PROMPT 12, docs/03 |
| 29 | FEAT-ROUTE-08 | Route 8 & 9: Đăng nhập (`/login`) & Đăng ký (`/register`) layout chia đôi 55/45 | M5 | PROMPT 14, docs/03 |
| 30 | FEAT-ROUTE-09 | Route 11: Giỏ hàng trực quan (`/cart`) cập nhật số lượng optimistic, kiểm tra tồn kho | M5 | PROMPT 13, docs/03 |
| 31 | FEAT-ROUTE-10 | Route 12: Thanh toán & Xác nhận đơn hàng (`/checkout`) mô phỏng transaction khấu trừ kho | M5 | PROMPT 13, docs/03 |
| 32 | FEAT-ROUTE-11 | Route 13 & 14: Lịch sử đơn hàng (`/orders`) và Chi tiết đơn hàng (`/orders/:id`) | M5 | PROMPT 13, docs/03 |
| 33 | FEAT-ROUTE-12 | Route 15: Trung tâm quản lý tài khoản cá nhân (`/account`) | M5 | PROMPT 14, docs/03 |
| 34 | FEAT-ROUTE-13 | Route 16: Đăng ký trở thành người bán sinh vật cảnh (`/seller/apply`) | M5 | PROMPT 14, docs/03 |
| 35 | FEAT-ROUTE-14 | Route 17: Bảng điều khiển người bán & Danh sách sản phẩm (`/seller`) | M5 | PROMPT 14, docs/03 |
| 36 | FEAT-ROUTE-15 | Route 18: Đăng bán sản phẩm mới (`/seller/products/new`) liên kết mã loài và tải ảnh | M5 | PROMPT 14, docs/03 |
| 37 | FEAT-ROUTE-16 | Route 10: Đăng nhập quản trị viên chuyên biệt (`/admin/login`) | M6 | PROMPT 15, docs/03 |
| 38 | FEAT-ROUTE-17 | Route 19: Bảng tổng quan quản trị (`/admin`) với chỉ số thống kê KPI sinh quyển | M6 | PROMPT 15, docs/03 |
| 39 | FEAT-ROUTE-18 | Route 20: Kiểm duyệt hồ sơ người bán (`/admin/sellers`) phê duyệt/từ chối shop | M6 | PROMPT 15, docs/03 |
| 40 | FEAT-ROUTE-19 | Route 21: Kiểm duyệt sản phẩm đăng bán (`/admin/products`) đối soát loài bảo tồn | M6 | PROMPT 15, docs/03 |
| 41 | FEAT-ROUTE-20 | Route 22: Quản trị danh mục loài sinh vật (`/admin/species`) thêm/sửa loài | M6 | PROMPT 15, docs/03 |
| 42 | FEAT-ROUTE-21 | Route 23: Trang ghi công bản quyền ảnh (`/credits`) hiển thị tác giả, giấy phép, link gốc | M6 | PROMPT 16, docs/06 |
| 43 | FEAT-ROUTE-22 | Route 24: Trang 404 Không tìm thấy (`*`) và Route Dev giới thiệu thành phần UI (`/dev/ui`) | M6 | PROMPT 16, docs/03 |
| 44 | FEAT-QA-01 | Kiểm định hiển thị chuẩn xác toàn bộ 24 routes ở 2 độ phân giải 1440×900 và 390×844 | M6 | PROMPT 16, AGENTS |
| 45 | FEAT-QA-02 | Kiểm định tiêu chuẩn tiếp cận WCAG 2.2 AA (Lighthouse Accessibility ≥ 95, focus, alt) | M6 | PROMPT 16, AGENTS |
| 46 | FEAT-QA-03 | Đo lường hiệu năng đồ họa 3D (FPS ≥ 58 cấu hình cao, unmount culling, memory leak) | M6 | PROMPT 16, docs/05 |
| 47 | FEAT-QA-04 | Tổng duyệt kịch bản demo 5 phút (PLAN 11.3) và hoàn thiện tài liệu PROGRESS.md, HANDOFF.md | M6 | PROMPT 16, ORIGINAL_REQUEST |

---

## Milestones

| # | Name | Scope & PROMPTS | Dependencies | Status |
|---|------|-----------------|-------------|--------|
| M1 | Nền tảng dự án, Thiết kế mẫu R & Kho ảnh thật | FEAT-CORE-01..02, FEAT-DS-01..03, FEAT-MEDIA-01..03 (PROMPTS 00, 01, 02, 04) | None | DONE |
| M2 | Dữ liệu MSW, Lớp API & Khung điều hướng | FEAT-API-01..03, FEAT-MSW-01..03, FEAT-NAV-01..02 (PROMPTS 03, 05) | M1 | DONE |
| M3 | Đồ họa 3D, Chuyển động & Trang chủ tương tác | FEAT-3D-01..04, FEAT-ROUTE-01 (PROMPTS 06, 07, 08, 09) | M1, M2 | DONE (GATE PASS) |
| M4 | Bách khoa phân loại & Hồ sơ loài tạp chí | FEAT-ROUTE-02..05, FEAT-UI-SEARCH (PROMPTS 10, 11) | M1, M2 | DONE (GATE PASS) |
| M5 | Sàn sinh vật cảnh, Giỏ hàng, Đặt hàng & Người bán | FEAT-ROUTE-06..15 (PROMPTS 12, 13, 14) | M1, M2, M4 | DONE (GATE PASS) |
| M6 | Quản trị Admin, Kiểm định chất lượng toàn site & Bàn giao | FEAT-ROUTE-16..22, FEAT-QA-01..04 (PROMPTS 15, 16) | M1, M2, M3, M4, M5 | PLANNED |
| E2E | E2E Testing Track (Requirement-driven Opaque Box) | Tiers 1-4 Test Suite (T1: Feature Coverage, T2: Boundary, T3: Pairwise, T4: Workloads) | None (Opaque-box derived from ORIGINAL_REQUEST & specs) | DONE (109/109 pass) |

---

## Interface Contracts

### 1. Presentation Layer ↔ API Client Layer (`src/api/`)
- **Centralized Client Signature**:
  ```typescript
  export async function api<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>>;
  ```
  - `endpoint`: Đường dẫn tương đối bắt đầu bằng `api/...` (tuyệt đối KHÔNG có dấu `/` ở đầu, ví dụ `api/species`, `api/products/1`).
  - Tự động đính kèm `Authorization: Bearer <token>` nếu có token trong `authStore`.
  - Tự động chuyển hướng đến `/login` kèm `?next=` khi nhận mã HTTP 401.
  - Tự động ném `ApiError` có chứa `code` (khớp với 59 mã enum `MessageKey`) và `message` tiếng Việt.
- **Data Normalization Signature**:
  ```typescript
  export function normalizePage<T>(data: Page<T> | T[] | undefined): Page<T>;
  ```
  - Xử lý bất đồng bộ cấu trúc phân trang backend (tương thích cả mảng thường `T[]` lẫn đối tượng `Page<T>`).

### 2. API Layer ↔ MSW Mock Layer (`src/mocks/`)
- **In-Memory & Persistent Storage Contract (`src/mocks/db.ts`)**:
  - Khởi tạo từ `database/seed_data.sql`: 7 Users, 5 Admins, 5 Shops, 25 TaxonomyNodes, 9 Species, 10 Products, 3 Orders, 2 Carts.
  - Lưu trữ đột biến vào `localStorage` key `bionexus.mock.v1`.
  - Hàm `resetDb()` xóa cache và nạp lại dữ liệu gốc.
- **DTO Preservation & Compatibility**:
  - `SpeciesDto` bắt buộc dùng `imageURL` và `referenceURL`.
  - `ProductDto` bắt buộc dùng `imageUrl`.
  - Adapter `src/api/adapters.ts` là nơi duy nhất chuẩn hóa tên thuộc tính cho component giao diện.

### 3. Presentation Layer ↔ 3D Graphics Engine (`src/components/3d/`)
- **Quality Provider Contract**:
  ```typescript
  export type QualityTier = 'high' | 'medium' | 'low' | 'static';
  export function useQuality(): { tier: QualityTier; isMobile: boolean; prefersReducedMotion: boolean };
  ```
- **SceneShell Wrapper Contract**:
  - Prop `posterSrc`: Ảnh WebP/AVIF render sẵn hiển thị đầu tiên trước khi nạp Canvas.
  - Cổng kiểm tra WebGL và `IntersectionObserver` (ngưỡng 200px): Chỉ mount Canvas khi vào khung nhìn; unmount khi cuộn cách xa hơn 1 màn hình.
  - Đảm bảo quy tắc bất biến: Tối đa 1 Canvas WebGL nặng hoạt động tại một thời điểm trên toàn ứng dụng.

### 4. Implementation Track ↔ E2E Testing Track
- **Entry Points & Execution**:
  - HashRouter URLs: `#/`, `#/taxonomy`, `#/species/:id`, `#/products`, `#/cart`, `#/admin`, etc.
  - Test Runner: Khởi chạy ứng dụng với mock MSW bật và thực thi các kịch bản kiểm thử không phụ thuộc vào mã nguồn nội bộ.
  - Test Suite xuất bản tín hiệu sẵn sàng qua `TEST_READY.md`.

---

## Code Layout

```
frontend/
├── index.html                     # Điểm vào SPA HTML, thiết lập thẻ meta và link font
├── package.json                   # Định nghĩa dependencies, scripts: dev, build, check, test
├── vite.config.ts                 # Cấu hình Vite (base: './', manualChunks: three, msw)
├── tsconfig.json                  # Cấu hình TypeScript strict
├── tailwind.config.ts             # Cấu hình Tailwind v4 liên kết tokens.css
├── public/
│   ├── mockServiceWorker.js       # MSW 2 worker script
│   └── photos/                    # Kho ảnh thật đã nén AVIF/WebP/JPG có bản quyền
├── src/
│   ├── main.tsx                   # Điểm khởi tạo React 19, MSW init, QueryClientProvider
│   ├── App.tsx                    # Cấu hình Router (createHashRouter), Toaster
│   ├── index.css                  # Tailwind directives và import tokens.css
│   ├── styles/
│   │   ├── tokens.css             # Biến CSS hệ thống thiết kế mẫu R (màu sắc, kính mờ, IUCN)
│   │   └── animations.css         # Keyframes chuyển động chuẩn mẫu R
│   ├── types/                     # Định nghĩa TypeScript DTOs, Enums, Models
│   │   ├── api.ts                 # ApiResponse<T>, Page<T>, MessageKey
│   │   ├── taxonomy.ts            # TaxonomyNode, TaxonomyDetail, Rank
│   │   ├── species.ts             # SpeciesDto, ConservationStatus, IUCN
│   │   ├── product.ts             # ProductDto, ProductStatus
│   │   ├── cart.ts                # Cart, CartItem
│   │   ├── order.ts               # Order, OrderDetail, OrderStatus
│   │   ├── user.ts                # User, SellerProfile, Admin
│   │   └── photos.ts              # PhotoMetadata, LicenseType
│   ├── api/                       # Tầng giao tiếp dữ liệu & TanStack Query hooks
│   │   ├── client.ts              # Centralized fetch wrapper api<T>(), normalizePage()
│   │   ├── keys.ts                # Query Key Factory tập trung
│   │   ├── adapters.ts            # Chuyển đổi DTO sang ViewModel
│   │   ├── useAuth.ts             # Hooks xác thực, đăng nhập, đăng ký
│   │   ├── useTaxonomy.ts         # Hooks cây phân loại
│   │   ├── useSpecies.ts          # Hooks bách khoa và hồ sơ loài
│   │   ├── useProducts.ts         # Hooks danh mục và chi tiết sản phẩm
│   │   ├── useCart.ts             # Hooks giỏ hàng (optimistic update)
│   │   ├── useOrders.ts           # Hooks tạo đơn và tra cứu đơn hàng
│   │   ├── useSeller.ts           # Hooks đăng ký và quản lý bán hàng
│   │   └── useAdmin.ts            # Hooks kiểm duyệt và thống kê quản trị
│   ├── mocks/                     # Tầng MSW Mock Service Worker 2
│   │   ├── browser.ts             # Setup worker MSW
│   │   ├── db.ts                  # Mock database state đồng bộ localStorage
│   │   ├── seed.ts                # Dữ liệu mẫu 100% khớp database/seed_data.sql
│   │   ├── auth.ts                # Xử lý token và session giả lập
│   │   └── handlers/              # Handlers chia theo domain
│   │       ├── auth.ts
│   │       ├── taxonomy.ts
│   │       ├── species.ts
│   │       ├── products.ts
│   │       ├── cart.ts
│   │       ├── orders.ts
│   │       ├── seller.ts
│   │       └── admin.ts
│   ├── components/                # Thư viện thành phần giao diện
│   │   ├── ui/                    # Thành phần nguyên tử (Button, Input, Badge, Card, Modal, etc.)
│   │   ├── motion/                # Thành phần chuyển động (BlurFade, MaskText, ZoomReveal, etc.)
│   │   ├── layout/                # Shells (RootLayout, AuthLayout, AccountLayout, AdminLayout)
│   │   ├── navigation/            # Navbar, Footer, Sidebar, Breadcrumb, CommandPalette
│   │   ├── media/                 # Photo, Gallery, Lightbox, CreditTag
│   │   └── 3d/                    # Thành phần đồ họa Three.js / R3F
│   │       ├── QualityProvider.tsx # Nhận diện phần cứng và chế độ giảm chuyển động
│   │       ├── SceneShell.tsx     # Bọc canvas, poster trước, unmount khi ra khỏi màn hình
│   │       ├── ParticleMorph/     # Cảnh hạt biến hình 5 dạng
│   │       ├── BioEarth/          # Địa cầu 3D tương tác 7 lớp
│   │       └── HelixScene/        # Chuỗi xoắn ADN 14 bậc cuộn dính
│   ├── pages/                     # 24 trang route chính thức
│   │   ├── Home.tsx               # / (Trang chủ)
│   │   ├── taxonomy/              # /taxonomy, /taxonomy/:id
│   │   ├── species/               # /species, /species/:id
│   │   ├── products/              # /products, /products/:id
│   │   ├── auth/                  # /login, /register, /admin/login
│   │   ├── cart/                  # /cart
│   │   ├── checkout/              # /checkout
│   │   ├── orders/                # /orders, /orders/:id
│   │   ├── account/               # /account
│   │   ├── seller/                # /seller/apply, /seller, /seller/products/new
│   │   ├── admin/                 # /admin, /admin/sellers, /admin/products, /admin/species
│   │   ├── Credits.tsx            # /credits
│   │   ├── NotFound.tsx           # * (404)
│   │   └── dev/UIPreview.tsx      # /dev/ui
│   └── content/                   # Dữ liệu tĩnh bổ trợ
│       ├── species-extras.ts      # Tọa độ sinh cảnh, slug, vị trí ảnh hero
│       └── photos.ts              # Bảng định nghĩa metadata ảnh có bản quyền
└── scripts/                       # Scripts tiện ích nội bộ
    ├── fetch-photos.mjs           # Tải ảnh từ Wikimedia Commons API
    └── optimize-photos.mjs        # Nén Sharp AVIF/WebP/JPG và tạo base64 placeholder
```
