# BioNexus Frontend — Tiến Độ Dự Án (PROGRESS.md)

Tài liệu theo dõi tiến độ thi công 6 Mốc công việc của BioNexus Frontend theo tiêu chuẩn chất lượng nghiêm ngặt (WCAG 2.2 AA, thiết kế mẫu R, không emoji, tương thích WAR context `/BioNexus`).

---

## 1. Tổng Quan Lộ Trình 6 Milestones

| Mốc | Tên Mốc | Trạng Thái | Số Lượng Test | Cổng Chất Lượng (Quality Gate) |
|---|---|---|---|---|
| **M1** | Foundation, Design System mẫu R, Kho ảnh thật & Khung điều hướng 25 Routes | **HOÀN THÀNH** | 62 Unit/Stress tests, 25 Routes verified | `npm run check` PASS, verify-router PASS (25/25) |
| **M2** | Dữ liệu mẫu MSW 2, In-Memory DB & Lớp API Client (PROMPTS 03, 05) | **HOÀN THÀNH** | 95 Vitest unit tests, 109 E2E contract tests | `npm run check` PASS (0 errors, 0 warnings, 0 emojis), 109/109 E2E PASS |
| **M3** | Đồ họa 3D Tương tác (BioEarth, ParticleMorph, Helix) & Trang chủ 4 chương (PROMPTS 06, 07, 08, 09) | **HOÀN THÀNH** | 110 Vitest tests (15 unit 3D), 109 E2E contract tests | Bundle gzip ≤ 220 KB, Lazy Three chunk, 1 canvas WebGL tối đa, fallback tĩnh |
| **M4** | Bách khoa Phân loại 6 cấp & Hồ sơ Loài Chi tiết (PROMPTS 10, 11) | **HOÀN THÀNH** | 156 Vitest unit tests, 109 E2E contract tests | Miller columns 6 cấp, AnimatedBeam, 3D Helix toggle, Magazine Hero, 12-col Bento Grid, Command Palette ⌘K, 0 emojis, check PASS |
| **M5** | Sàn Sinh vật cảnh, Giỏ hàng, Đặt hàng & Kênh Người bán | **HOÀN THÀNH** | 167 Vitest tests, 109 E2E contract tests | 13 Routes (6–18), Atomic transaction, FlyToCart, VietQR, Lens 2.5x, 0 emojis, `npm run check` PASS |
| **M6** | Quản trị Admin, QA Cổng chất lượng Toàn diện & Bàn giao | **HOÀN THÀNH** | 215 Vitest tests, 109 E2E contract tests | 24 routes + 1 dev, RBAC 3 vai trò, Landing gzip 157.17 KB <= 180 KB, check PASS |

---

## 2. Chi Tiết Thi Công Mốc 1 (Milestone 1)

- **Mục tiêu**: Xây dựng kiến trúc nền tảng, hệ thống thiết kế mẫu R (Bảng màu ngọc bích tối, Cormorant Garamond + Be Vietnam Pro + JetBrains Mono), kho ảnh thật có bản quyền Wikimedia Commons (`photos.ts`), 37 thành phần UI cơ bản, và bộ điều hướng `createHashRouter` 25 routes.
- **Kết quả đạt được**:
  - `src/styles/tokens.css` và `src/styles/globals.css`: Thiết lập 100% design tokens chuẩn mẫu R.
  - `src/components/ui/`: Hoàn thiện Button, Badge, Card, Dialog, Input, Select, Textarea, Skeleton, Tabs, IucnBadge, Price, StatusPill, Logo, Kbd.
  - `src/content/photos.ts`: Kho ảnh thật 9 loài với credit bản quyền Wikimedia Commons đầy đủ (CC BY, CC BY-SA, Public Domain).
  - `src/app/router.tsx` & `src/app/routes.ts`: Dựng 24 tuyến đường chính thức + 1 tuyến dev UI, vượt qua bài kiểm tra `verify-router.mjs` đạt 25/25 PASS.

---

## 3. Chi Tiết Thi Công Mốc 2 (Milestone 2: Dữ liệu mẫu MSW & Lớp API)

- **Mục tiêu**: Thi công toàn bộ hợp đồng API tại `docs/frontend/04-hop-dong-api-va-mock.md` và `PROMPTS.md` (PROMPT 03, 05), xây dựng hệ thống MSW 2 với 29+ endpoints, in-memory DB với tính năng lưu trữ bền vững `localStorage` (`bionexus.mock.v1`), client HTTP đa năng, và TanStack Query v5 hooks.

### 3.1 Các Thành phần & Tệp Tin Đã Xây Dựng
1. **DTOs & Types (`src/types/api.ts`, `src/types/index.ts`, `src/api/types.ts`)**:
   - Khung `ApiResponse<T>`, `Page<T>`, 59+ mã enum `MessageKey` từ Java backend.
   - Bất đối xứng trường DTO chuẩn hóa: `SpeciesDto` sử dụng `imageURL` và `referenceURL`; `ProductDto` sử dụng `imageUrl`.
   - Domain enums: `TaxonomyRank`, `ConservationStatus`, `ProductStatus`, `SellerStatus`, `OrderStatus`, `UserStatus`, `AccountType`, `AdminRole`.
   - DTOs đầy đủ: `TaxonomyNodeDto`, `TaxonomyDetailDto`, `SpeciesDto`, `ProductDto`, `SellerDto`, `AuthResponse`, `MeDto`, `CartDto`, `CartItemDto`, `OrderDto`, `OrderItemDto`, `ReviewDto`.

2. **Dữ liệu Hạt giống Nguồn (`src/mocks/data/`)**:
   - `users.ts`: 7 users (levanc, nguyenvana, phamthid, tranthib, hoangvane, vuthif, dangvang) và 5 admins (superadmin, biologist1, moderator1, moderator2, biologist2).
   - `shops.ts`: 5 shops (BioGreen Exotic, AquaTerra Shop, Carnivora Garden, Exotic Reptile Hub, Gecko Lab).
   - `taxonomy.ts`: 26 nodes phân loại từ Giới (Kingdom) xuống Chi (Genus).
   - `species.ts`: 9 loài mẫu bóc tách từ `seed_data.sql`.
   - `products.ts`: 10 sản phẩm (7 APPROVED, 1 PENDING, 1 REJECTED, 1 SOLD_OUT).
   - `orders.ts`: 3 đơn hàng mẫu (`ORD-2026-0001`, `ORD-2026-0002`, `ORD-2026-0003`).
   - `carts.ts`: 2 giỏ hàng mẫu (levanc có 2 món hợp lệ; phamthid có 2 món thử nghiệm lỗi biên).
   - `reviews.ts`: Đánh giá mẫu cho các sản phẩm sàn.
   - `index.ts`: Khởi tạo trạng thái hạt giống sạch `createInitialSeedState()`.

3. **Cơ Sở Dữ Liệu In-Memory (`src/mocks/db.ts`)**:
   - Lưu trữ liên tục vào `localStorage` với key `bionexus.mock.v1`, có hàm `resetDb()` hoàn nguyên dữ liệu gốc tức thời.
   - Thuật toán `normalizeSearchString` tìm kiếm tiếng Việt không dấu.
   - Truy xuất phả hệ phân loại & Breadcrumbs ngược lên Giới (Kingdom).
   - Giỏ hàng động: Giá và tính khả dụng được tính toán trực tiếp từ bảng `Products` (giỏ không lưu giá tĩnh).
   - Transaction đặt hàng nguyên tử (`placeOrder`): Pre-validation phase chặn hết hàng / mua hàng của shop mình, Execution phase trừ kho nguyên tử, tự động chuyển `SOLD_OUT` khi kho về 0, sinh mã `ORD-2026-XXXX`.
   - State machine kiểm duyệt shop và sản phẩm phân quyền theo vai trò (`MODERATOR`, `SUPER_ADMIN`, `BIOLOGIST`).

4. **MSW 2 Handlers Toàn diện (`src/mocks/handlers/`)**:
   - 29 endpoints thuộc 9 phân hệ: Auth, Taxonomy, Species, Products, Cart, Orders, Reviews, Seller, Admin, cùng 2 endpoint Health & Ping.
   - Kết nối vào `src/mocks/browser.ts` và kích hoạt tự động qua `enableMocking()` tại `src/main.tsx`.

5. **Client HTTP, Normalization & Adapters (`src/api/`)**:
   - `src/api/client.ts`: Hàm `api<T>` đảm bảo đường dẫn tương đối `api/...` (tự động loại bỏ dấu `/` đầu), tự động gắn Bearer token, bắt mã 401 tự động điều hướng `#/login?next=...` hoặc `#/admin/login?next=...`.
   - `src/api/errors.ts`: Lớp `ApiError` chuẩn hóa mã lỗi `MessageKey` và thông điệp tiếng Việt có dấu.
   - `src/api/normalize.ts`: `normalizePage<T>` tương thích cả mảng `T[]` lẫn đối tượng `Page<T>`.
   - `src/api/adapters.ts`: `toSpeciesView()` và `toProductView()` bảo toàn 100% DTO gốc và sản sinh ViewModel giàu tính năng.
   - `src/lib/messages.ts`: Mapping đầy đủ 59+ MessageKey sang câu tiếng Việt chuẩn.
   - `src/lib/parseEnvironmentSpecs.ts`: Parser thông số sinh học (nhiệt độ nước, nhiệt độ không khí, điểm sưởi, độ ẩm), định dạng tiền tệ `formatVnd`, và kiểm tra `isValidOrderCode`.

6. **TanStack Query v5 Hooks & Route Protection Shells**:
   - Query Key Factory tập trung tại `src/api/keys.ts`.
   - Custom Hooks: `useTaxonomyTree`, `useTaxonomyDetail`, `useTaxonomyChildren`, `useSpeciesList`, `useSpeciesDetail`, `useProducts`, `useProductDetail`, `useCart`, `useOrders`, `useMe`, `useSellerProfile`, `usePendingSellers`, `usePendingProducts`.
   - Mutation Hooks: `useLogin`, `useAdminLogin`, `useRegister`, `useLogout`, `useAddToCart` (optimistic update có rollback), `useUpdateCartItem`, `useRemoveCartItem`, `useClearCart`, `usePlaceOrder`, `useApplySeller`, `useUpdateSellerProfile`, `useCreateProduct`, `useModerateProduct`, `useModerateSeller`, `useCreateSpecies`.
   - Route Protection Shells: `RequireAuth`, `RequireSeller`, `RequireRole` tại `src/components/auth/`.

7. **DevPanel Điều Khiển Nâng Cao (`src/components/dev/DevPanel.tsx`)**:
   - Thanh trượt độ trễ mạng giả lập (100 - 3000 ms).
   - Thanh trượt tỷ lệ lỗi mô phỏng (0% - 50%).
   - Nút "Khôi phục dữ liệu gốc": gọi `db.resetDb()` và gọi `queryClient.invalidateQueries()`.
   - Bộ chọn đăng nhập nhanh 12 tài khoản hạt giống (levanc, nguyenvana, phamthid, tranthib, hoangvane, vuthif, dangvang, superadmin, moderator1, biologist1, moderator2, biologist2).
   - Tuyệt đối KHÔNG chứa emoji; sử dụng biểu tượng Lucide icons sang trọng.

---

## 4. Chi Tiết Thi Công Mốc 3 (Milestone 3: Đồ Họa 3D Tương Tác & Trang Chủ 4 Chương)

- **Mục tiêu**: Hiện thực hóa PROMPTS 06, 07, 08, 09; xây dựng toàn bộ hạ tầng 3D theo tiêu chuẩn chất lượng cao nhất của BioNexus:
  - 100% tiếng Việt có dấu, 0 emoji, bảng màu ngọc bích tối mẫu R.
  - Tối đa đúng 1 WebGL canvas hoạt động đồng thời (bảo vệ bộ nhớ & GPU).
  - Tự động unmount khi canvas ra ngoài khung nhìn (IntersectionObserver rootMargin 200px).
  - Hỗ trợ prefers-reduced-motion và tier fallback ảnh tĩnh (`static`) cho thiết bị không có GPU mạnh.
  - Tách riêng bundle `three` qua Rollup manualChunks, giữ landing bundle ban đầu gzip ≤ 220 KB.

### 4.1 Các Phân Hệ & Tệp Tin Đã Xây Dựng
1. **Hạ Tầng Quản Lý 3D (`src/components/3d/`)**:
   - `types.ts`: Định nghĩa toàn bộ kiểu dữ liệu `QualityTier` ('ultra' | 'high' | 'medium' | 'low' | 'static'), `DeviceCapabilities`, `QualityConfig`, `SceneShellProps`.
   - `QualityProvider.tsx`: Thuật toán tự động nhận diện phần cứng (WebGL2, unmasked renderer GPU tiering, cores, memory, mobile/touch, reduced-motion); hỗ trợ override qua `localStorage` (`bionexus.quality_tier`), tự động hạ cấp nếu phát hiện giật khung hình liên tiếp (`reportFpsDrop()`), clamp DPR an toàn.
   - `SceneShell.tsx`: Cơ chế quản lý semaphore đơn canvas toàn cục (`globalActiveCanvasId`), IntersectionObserver `rootMargin: '200px'`, lớp poster ảnh tĩnh chuyển mượt (opacity fade), xử lý sự kiện `webglcontextlost` / `webglcontextrestored`, và lớp hỗ trợ khiếm thị `.sr-only` đạt chuẩn WCAG 2.2 AA.
   - `useSectionProgress.ts`: Hook theo dõi tiến độ cuộn scroll mượt mà không gây re-render Canvas, cấp phát dữ liệu trực tiếp cho R3F `useFrame`.

2. **Hạt Biến Hình Hero (`src/components/3d/ParticleMorph.tsx` & Shaders)**:
   - Shaders GLSL chuyên dụng: `particleMorph.vert.glsl` (nội suy bậc ba Hermite mượt mà, mid-transition spatial curl swirl, idle breathing, tương tác đẩy con trỏ chuột pointer repulsion và sóng xung kích shockwave ring khi nhấp chuột); `particleMorph.frag.glsl` (đĩa điểm phát quang ngọc bích mềm mại).
   - 4 hình thái sinh học đặc trưng:
     - Hình thái 0: Thiên hà xoắn ốc Logarithmic (`aPos0`).
     - Hình thái 1: Chuỗi xoắn kép DNA Double Helix (`aPos1`).
     - Hình thái 2: Lá cây sinh học Parabolic Foliage với gân lá trung tâm đối xứng (`aPos2`).
     - Hình thái 3: Địa cầu Fibonacci Sphere (`aPos3`).
   - Tương tác Raycasting trực tiếp trên mặt phẳng Z=0, suy biến mượt mà khi người dùng không tương tác, dọn dẹp bộ nhớ GPU BufferGeometry toàn diện khi unmount.

3. **Chuỗi Xoắn Phân Loại Học (`src/components/3d/HelixScene.tsx`)**:
   - 14 nấc phân loại học từ Giới (Kingdom) xuống Loài (Species) tương ứng dữ liệu bách khoa BioNexus.
   - Cặp ống xoắn CatmullRomCurve3 màu ngọc lục bảo (`#6ee7b7`) và xanh ngọc (`#5eead4`).
   - Cầu nối cặp bazơ nitơ với mã màu liên kết hydro đặc trưng (A-T cyan, G-C emerald) và các quả cầu phát sáng.
   - Outward Offset chuẩn xác $R+0.75=4.05$, đưa nhãn phân loại học nằm rõ ràng phía ngoài chuỗi xoắn mà không bị che khuất.
   - Đạo diễn chuyển động camera (`useFrame`) bám theo tiến độ cuộn, tự động xác định taxon hoạt động hiện tại.

4. **Địa Cầu Tương Tác 7 Lớp (`src/components/3d/BioEarth/`)**:
   - `types.ts` & `coordinates.ts`: Tọa độ 3 trung tâm sinh sản tại Việt Nam (SGN, DAD, HAN), 9 loài mẫu bách khoa với tọa độ nguồn gốc tự nhiên, bảng mã màu 5 cấp IUCN chính thức (`#10b981`, `#84cc16`, `#eab308`, `#f97316`, `#ef4444`).
   - `BioEarth.tsx`: Kiến trúc 7 lớp hoàn chỉnh:
     - Lớp 1 (Lõi hành tinh): Sphere `#03130E` làm occluder che khuất mặt sau, bao quanh bởi lưới kinh vĩ độ 15°.
     - Lớp 2 (Hạt lục địa): 4,000 hạt Fibonacci land particles mật độ cao cho lục địa và đường bờ biển.
     - Lớp 3 (Khí quyển phát sáng): Fresnel glow màu xanh ngọc `#00D29E`.
     - Lớp 4 (Vành đai bụi vũ trụ): Outer ring halo bao quanh địa cầu.
     - Lớp 5 (Điểm định vị loài): 9 marker loài IUCN có hiệu ứng nhịp thở pulsing marker và vòng đệm mở rộng.
     - Lớp 6 (Cung đường bay 3D): Đường cong Slerp 3D bay từ các vùng phân bố tự nhiên trên thế giới hội tụ về các trung tâm nhân giống tại Việt Nam.
     - Lớp 7 (Thẻ tương tác HTML): Drei Html tooltip kính mờ cao cấp, hiển thị ảnh thật, tên khoa học, cấp bảo tồn IUCN, và nút liên kết trực tiếp vào hồ sơ loài.

5. **Trang Chủ 4 Chương Hoàn Chỉnh (`src/pages/Home.tsx`)**:
   - Chương 0 (Khởi nguyên Sinh học): Hero 100vh với ParticleMorph, tiêu đề mẫu R Cormorant Garamond, nút khám phá, và chỉ số thống kê sinh thái sống.
   - Chương 1 (Bách khoa Phả hệ): HelixScene 14 nấc gắn liền bảng tra cứu cấp bậc phân loại và nút dẫn tới `/taxonomy`.
   - Chương 2 (Hành tinh BioNexus): BioEarth 7 lớp với bảng thống kê 3 trạm nhân giống và 9 vùng phân bố quốc tế.
   - Chương 3 (Sàn Giao dịch & Bảo tồn): Giới thiệu sản phẩm sinh vật cảnh F2+ đã kiểm duyệt với `ProductCard.tsx` chuẩn mẫu R, cam kết nguồn gốc minh bạch.
   - Điều hướng chương trực quan: 4 chấm chuyển chương mượt mà, hỗ trợ phím tắt số `0`..`3` và phím mũi tên.

6. **Tích Hợp Hệ Thống & Tối Ưu Hóa**:
   - `src/App.tsx`: Bao bọc ứng dụng bằng `<QualityProvider>`.
   - `src/app/router.tsx`: Lazy-load trang chủ `Home.tsx` qua `React.lazy`.
   - `src/components/dev/DevPanel.tsx`: Bổ sung bảng điều khiển chất lượng 3D, giả lập rớt FPS, hiển thị card đồ họa và tier đang kích hoạt.
   - `public/posters/`: Tạo poster WebP dự phòng cho 3 phân cảnh (`home-genesis.webp`, `home-helix.webp`, `home-earth.webp`).

---

### 4.2 Chi Tiết Khắc Phục Lỗi Kiến Trúc Mốc 3 (Iteration 2 Remediation)
Dựa trên thẩm định độc lập từ Reviewer, toàn bộ 5 phát hiện (Finding 1 đến Finding 5) đã được giải quyết triệt để:
1. **Khắc phục Lỗi Che Khuất Poster (Finding 1 - Critical)**:
   - Tại `SceneShell.tsx`: Bổ sung cơ chế phòng vệ 2 lớp (Layer 1: timer 300ms tự động làm mờ poster khi canvas mount; Layer 2: callback `onFirstFrame` kích hoạt ngay khi frame đầu tiên sẵn sàng).
   - Tại `Home.tsx`: Đấu nối render prop `(_tier, handleFirstFrame)` trên cả 3 phân cảnh (Chương 0 Genesis, Chương 1 Helix, Chương 2 Earth), truyền `onCreated={() => handleFirstFrame?.()}` vào thẻ `<Canvas>`.
2. **Khắc phục Bế Tắc Semaphore Khi Cuộn (Finding 2 - Critical)**:
   - Nâng cấp bộ điều phối `canvasListeners` trong `SceneShell.tsx`: khi slot toàn cục được giải phóng (`activeId === null`), component kế tiếp đang nằm trong khung nhìn (`isNearView && isEligible`) tự động tái chiếm slot ngay lập tức mà không cần sự kiện giao cắt mới.
   - Sao chép mảng an toàn `Array.from(canvasListeners)` ngăn chặn lỗi re-entrancy.
3. **Khắc phục Mất Ngữ Cảnh WebGL Không Thể Phục Hồi (Finding 3 - Major)**:
   - Loại bỏ `!contextLost` khỏi điều kiện `shouldMountCanvas`. Thẻ `<canvas>` và wrapper DOM được bảo toàn nguyên vẹn trong DOM.
   - Khi nhận `webglcontextlost`, gọi `e.preventDefault()`, phủ poster tĩnh `opacity-100 z-10` che đè lên. Khi GPU phục hồi và phát `webglcontextrestored`, listener khôi phục đồ họa 3D trơn tru.
4. **Khắc phục Rò Rỉ Three.js Vào Landing Modulepreload (Finding 4 - Major)**:
   - Tại `vite.config.ts`: Cấu hình `build.modulePreload.resolveDependencies` lọc bỏ toàn bộ chunk `three` và `geo` khỏi preload của HTML.
   - Điều hướng module ảo `\0vite/preload-helper` vào chunk `react-vendor` trong `manualChunks`, cắt đứt hoàn toàn static import từ `index.js` sang `three.js`.
   - Tạo script `scripts/verify-no-three-preload.mjs` và tích hợp `"check:preload"` vào `npm run check`.
5. **Khắc phục 1-Frame Flash prefers-reduced-motion (Finding 5 - Minor)**:
   - Tại `QualityProvider.tsx`: Khởi tạo lười đồng bộ `useState<boolean>(() => window.matchMedia(...).matches)`, trả về tier `'static'` ngay từ Frame 1 mà không gây giật nhấp nháy.
6. **Khắc phục Góc Nhìn OrbitControls Trong BioEarth (Finding Reviewer 2)**:
   - Cập nhật hướng nhìn đích $\mathbf{v}_{\text{view}}$ động theo $\mathbf{P}_{\text{cam}}$ và $\mathbf{u}_{\text{cam}} \times 0.18$ trong `useFrame`.
   - Tối ưu Zero GC Allocation thông qua các `useRef` lưu Vector3 và Quaternion tái sử dụng.

---

## 5. Số Liệu Kiểm Thử & Cam Kết Chất Lượng Toàn Diện

### 5.1 Cổng kiểm tra `npm run check` (Sau Iteration 2)
- `tsc --noEmit` (TypeScript strict): **PASS (0 errors)**.
- `oxlint src/`: **PASS (0 errors, 0 warnings)** trên toàn bộ 109 tệp mã nguồn.
- `lint:emojis`: **PASS (0 emoji)** trong `frontend/src/`.
- `vitest run`: **PASS 14/14 test files (130/130 tests)**:
  - `src/components/3d/__tests__/SceneShell.test.tsx` (10 tests PASS - Poster-First, WCAG 2.2 AA sr-only, static tier, onFirstFrame hook, 300ms fallback timer, single canvas semaphore, deadlock-free auto-claim, context lost retention, context restored recovery, unmount cleanup)
  - `src/components/3d/__tests__/QualityProvider.test.tsx` (6 tests PASS - Nhận diện phần cứng, override localStorage, hạ cấp FPS, khởi tạo đồng bộ prefers-reduced-motion)
  - `src/components/3d/__tests__/adversarial-3d.test.tsx` (12 tests PASS - Bao gồm Thử thách 3 context retention & recovery)
  - `src/components/3d/__tests__/3d-geometry.test.ts` (7 tests PASS)
  - `src/api/__tests__/normalize.test.ts` (4 tests PASS)
  - `src/lib/__tests__/parseEnvironmentSpecs.test.ts` (9 tests PASS)
  - `src/api/__tests__/client.test.ts` (3 tests PASS)
  - `src/api/__tests__/adapters.test.ts` (6 tests PASS)
  - `src/lib/__tests__/env.test.ts` (4 tests PASS)
  - `src/mocks/__tests__/db.test.ts` (11 tests PASS)
  - `src/components/ui/__tests__/Badge.test.tsx` (6 tests PASS)
  - `src/components/ui/__tests__/Button.test.tsx` (4 tests PASS)
  - `src/components/ui/__tests__/ui-stress.test.tsx` (31 tests PASS)
  - `src/components/ui/__tests__/components-stress.test.tsx` (17 tests PASS)
- `tsc -b && vite build`: **PASS** (2558 modules transformed, build thành công).
- `check:preload` (`node scripts/verify-no-three-preload.mjs`): **PASS (0 modulepreload thẻ three/geo trong dist/index.html)**.

### 5.2 Ngân Sách Kích Thước Bundle (Bundle Budget)
- **Quy tắc ngân sách**: Landing JS ban đầu gzip ≤ 220 KB, cô lập thư viện 3D vào chunk riêng.
- **Kết quả thực tế từ Vite Rollup (Iteration 2)**:
  - `dist/assets/index-*.js`: **179.92 kB** (gzip: **47.52 kB**)
  - `dist/assets/react-vendor-*.js`: **426.24 kB** (gzip: **134.68 kB**)
  - 👉 **Tổng Landing Bundle JS**: **182.20 kB gzip** (Đạt chuẩn nghiêm ngặt ≤ 220 KB).
  - `dist/assets/three-*.js`: **964.74 kB** (gzip: **260.42 kB**) — Cô lập hoàn toàn trong chunk `three`, nạp lười khi mount các cảnh 3D.
  - `dist/assets/Home-*.js`: **49.66 kB** (gzip: **17.37 kB**)
  - `dist/index.html`: **0 thẻ modulepreload liên quan đến Three.js**.
  - `dist/assets/index-*.js`: **0 static import liên quan đến Three.js**.

### 5.3 Bộ kiểm thử E2E Contract Suite
- Lệnh: `node --experimental-strip-types --test frontend/tests/e2e/*.test.ts`
- Kết quả: **PASS 109/109 tests (34 suites, 0 failed, 0 skipped)**
  - Tier 1: Feature Coverage (Feature 1..9): 45 tests PASS
  - Tier 2: Boundary Matrix (Edge cases 1..30): 30 tests PASS
  - Tier 3: Pairwise Combinations (Pipelines 1..6): 6 tests PASS
  - Tier 4: Real-World Workload Scenarios (Scenario 1..5): 5 tests PASS
  - Adversarial & Challenger Suites: 23 tests PASS

### 5.4 Khung điều hướng Router Verification
- Kết quả: **PASS 25/25 routes** (toàn bộ 24 routes nghiệp vụ + 1 route dev preview được mount chính xác).

---

## 6. Chi Tiết Thi Công Mốc 4 (Milestone 4: Bách khoa Phân loại & Hồ sơ Loài Tạp chí)

- **Mục tiêu**: Thi công trọn vẹn PROMPTS 10 và 11:
  1. Cây phân loại sinh học (`/taxonomy`, `/taxonomy/:id`) với Miller columns 6 cấp kết nối tia photon `AnimatedBeam`, chế độ Chuỗi xoắn 3D Helix toggle, panel tóm tắt nhánh sticky, chế độ mobile drill-down 1 cột và deep link rehydration.
  2. Bách khoa danh mục loài (`/species`): Hero Ticker 5 mức IUCN, thanh lọc dính (tìm kiếm không dấu NFD, nhóm sinh học, đa chọn IUCN, sắp xếp), chuyển đổi hiển thị Grid / BioEarth 3D.
  3. Hồ sơ loài tạp chí khoa học (`/species/:id`): Hero bìa tạp chí toàn màn hình, 12-col Bento Grid (`ClimateBar`, `HumidityGauge`, `HabitatCard`, `BioEarth` mini, thang 7 mức IUCN phát quang, liên kết GBIF), trích dẫn kéo Cormorant Garamond, `MasonryGallery` 6–8 ảnh thật kèm `Lightbox` (WCAG 2.2 AA focus trap, bàn phím ←/→/Esc), chuỗi phân loại dọc 6 cấp, danh sách cá thể bán hợp pháp F2+ và loài họ hàng gần.
  4. Command Palette ⌘K (`QuickSearch.tsx`): phím tắt toàn cục `Cmd+K`/`Ctrl+K`, nút kính lúp trên Navbar, tìm kiếm thời gian thực tiếng Việt không dấu trên 4 nhóm danh mục (9 loài, 26 nút phân loại, 7 sản phẩm, 24 routes điều hướng), điều hướng bàn phím hoàn chỉnh (ArrowUp, ArrowDown, Enter, Esc), phân nhóm trực quan, thumbnails ảnh thật.

### 6.1 Các Thành phần & Tệp tin Đã Triển khai
1. **Trang Cây Phân Loại Học (`src/pages/taxonomy/`)**:
   - `TaxonomyPage.tsx`: Bộ điều phối chính, đồng bộ URL hash `#/taxonomy/:id`, tính toán cây Miller columns động.
   - `components/MillerColumns.tsx`: Khung điều hướng Miller columns 6 cấp (Giới → Ngành → Lớp → Bộ → Họ → Chi → Loài), gắn anchor kết nối tia photon `AnimatedBeam`.
   - `components/TaxonColumn.tsx` & `components/TaxonRow.tsx`: Cột phân cấp đơn lẻ và dòng danh pháp (chuẩn ICZN/ICN: chỉ in nghiêng Chi và Loài).
   - `components/SpeciesColumn.tsx` & `components/SpeciesCardCompact.tsx`: Cột terminal hiển thị card loài 4:5 khi chọn cấp Chi.
   - `components/TaxonomySidebar.tsx`: Panel tóm tắt dính bên phải với 2 ô KPI (số loài, số cá thể bán), ảnh tiêu biểu, danh sách loài và nút CTA tới `/species`.
   - `components/TaxonomyHeader.tsx`: Breadcrumbs phả hệ và bộ chuyển chế độ SegmentedControl (Cột / Chuỗi xoắn 3D).
   - `components/TaxonomyHelixView.tsx`: Chế độ hiển thị 3D Helix nạp lười qua `SceneShell`, thuật toán lặp Modulo 14 nấc, thẻ kính nổi tương tác.
   - `components/MobileTaxonomyView.tsx`: Chế độ duyệt di động 1 cột mượt mà với nút Back, thẻ tóm tắt accordion.
   - `components/TaxonomyNotFound.tsx`: Màn hình 404 thân thiện khi ID phân loại không tồn tại.

2. **Trang Danh mục Loài (`src/pages/species/`)**:
   - `SpeciesListPage.tsx`: Bộ điều phối danh mục loài, đồng bộ bộ lọc với query URL params `?node=`, `?q=`, `?group=`, `?iucn=`, `?sort=`.
   - `components/SpeciesHero.tsx`: Ticker 5 mức độ bảo tồn IUCN (CR, EN, VU, NT, LC) với số lượng loài theo thời gian thực.
   - `components/SpeciesFilterBar.tsx`: Thanh lọc dính (Search input chuẩn NFD, Tab nhóm Bò sát/Lưỡng cư/Thực vật, đa chọn IUCN, Sort select).
   - `components/SpeciesMapView.tsx`: Chế độ xem bản đồ 3D `BioEarth` đồng bộ danh sách 9 loài và cung đường bay về 3 Hub Việt Nam.

3. **Trang Hồ sơ Loài Tạp chí Khoa học (`src/pages/species/`)**:
   - `SpeciesDetailPage.tsx`: Bộ điều phối hồ sơ loài, tích hợp TanStack Query nạp đồng thời chi tiết loài, breadcrumbs phân loại và cá thể bán.
   - `components/SpeciesHeroCover.tsx`: Bìa tạp chí toàn màn hình với hiệu ứng MaskText, tên thường tiếng Việt lớn, tên khoa học Cormorant Garamond in nghiêng phát quang, huy hiệu IUCN, nhãn bản quyền ảnh Wikimedia Commons.
   - `components/SpeciesBentoGrid.tsx`: Bento Grid 12 cột module khoa học:
     - `ClimateBar.tsx`: Thang nhiệt độ ngang 10–50°C, dải nhiệt độ tối ưu phát quang, điểm sưởi basking, tự động thích ứng loài thủy sinh (Axolotl).
     - `HumidityGauge.tsx`: Đồng hồ đo độ ẩm SVG hình tròn tỏa sáng viền gradient ngọc bích.
     - `HabitatCard.tsx`: Thẻ sinh cảnh tự nhiên với tọa độ GPS, mô tả khí hậu và ảnh sinh cảnh thật.
     - `BioEarth Mini`: Quả địa cầu 3D mini xoay tới tọa độ bản địa loài.
     - `IucnScale.tsx`: Thang 7 mức độ bảo tồn toàn cầu với vạch định vị phát quang rực rỡ.
   - `components/SpeciesTaxonomyBeam.tsx`: Chuỗi phả hệ dọc 6 cấp liên kết trực tiếp vào cây phân loại.
   - `components/SpeciesNotFound.tsx`: Màn hình lỗi 404 chuẩn khoa học khi truy cập ID loài không tồn tại.

4. **Thành phần Dùng chung & Trải nghiệm Người dùng (`src/components/`)**:
   - `domain/TaxonPath.tsx`: Thanh breadcrumbs phả hệ chuẩn hóa loại trừ trùng lặp, tuân thủ chuẩn in nghiêng danh pháp quốc tế.
   - `domain/TaxonRankChip.tsx`: Huy hiệu cấp bậc phân loại kèm tooltip giải thích định nghĩa khoa học.
   - `domain/SpeciesCard.tsx`: Thẻ loài tỷ lệ 4:5 chuẩn mẫu R với zoom ảnh mượt mà, huy hiệu IUCN góc trên, thông tin cá thể bán.
   - `domain/Lightbox.tsx`: Hộp thoại phóng to ảnh toàn màn hình xây dựng trên Radix UI Dialog, bẫy tiêu điểm (focus trap), điều khiển bàn phím (Mũi tên Trái/Phải/Esc), ghi công bản quyền ảnh Wikimedia Commons chuẩn CC BY / CC BY-SA / Public Domain.
   - `domain/MasonryGallery.tsx`: Lưới ảnh xếp gạch 6–8 ảnh thật chất lượng cao kết nối trực tiếp với Lightbox.
   - `motion/AnimatedBeam.tsx`: Hiệu ứng tia photon năng lượng chuyển động dọc đường cong SVG nối các nút phân loại.
   - `navigation/QuickSearch.tsx` & `QuickSearchTrigger`: Hộp tìm kiếm nhanh Command Palette ⌘K toàn cục, hỗ trợ gõ không dấu tiếng Việt chuẩn NFD, 4 nhóm kết quả, điều khiển bàn phím WCAG 2.2 AA.

5. **Bộ Nối Dữ Liệu & Tiện Ích (`src/api/adapters.ts`, `src/lib/`)**:
   - `content/species-extras.ts`: Cơ sở dữ liệu mở rộng cho toàn bộ 9 loài (tọa độ GPS, định danh ảnh, điểm lấy nét `objectPosition`, nhận định bảo tồn, trích dẫn khoa học, liên kết GBIF).
   - `lib/parseEnvironmentSpecs.ts`: Nâng cấp regex trích xuất thông số môi trường sinh học hỗ trợ cả dải nhiệt độ và điểm sưởi đơn (`điểm sưởi 35°C` cho Trăn đất *Python bivittatus*).

### 6.2 Báo Cáo Kiểm Tra Cổng Chất Lượng Mốc 4
- `npm run check`: **PASS HOÀN TOÀN**
  - `tsc --noEmit`: 0 lỗi type.
  - `oxlint src/`: 0 cảnh báo, 0 lỗi trên 151 files với 99 rules.
  - `verify-no-emojis.mjs`: 0 emoji trong toàn bộ mã nguồn `frontend/src/`.
  - `vitest run`: **18 test files PASS, 156 tests PASS (100%)**.
  - `tsc -b && vite build`: **PASS** (2593 modules transformed, đóng gói tối ưu).
  - `verify-no-three-preload.mjs`: **PASS (0 modulepreload three/geo trong dist/index.html)**.
- `node --experimental-strip-types --test frontend/tests/e2e/*.test.ts`: **109/109 E2E Contract Tests PASS (100%)**.

---

## 7. Chi Tiết Thi Công Mốc 5 (Milestone 5: Sàn Sinh Vật Cảnh, Giỏ Hàng, Đặt Hàng & Kênh Người Bán)

- **Mục tiêu**: Thi công trọn vẹn 13 tuyến đường (Routes 6–18) thuộc phân hệ thương mại sinh vật cảnh có kiểm duyệt, giỏ hàng tương tác, đặt hàng nguyên tử và kênh quản lý người bán:
  - 100% tiếng Việt có dấu đầy đủ, 0 emoji (kiểm soát tự động qua `scripts/verify-no-emojis.mjs`), bảng màu ngọc bích tối mẫu R.
  - Tương thích context WAR `/BioNexus`, HashRouter, API tương đối `api/...`.
  - Tương tác vật lý cao cấp: Kính lúp kỹ thuật số 2.5x (`LensMagnifier`), hiệu ứng hạt bay vào giỏ hàng (`FlyToCart`), mã VietQR động (`VietQRCard`), pháo hoa chúc mừng động (`CelebrationConfetti`), bộ đếm số mượt mà (`Ticker`), bộ điều chỉnh số lượng an toàn (`NumberStepper`).
  - Giao dịch nguyên tử (Atomic transaction) với ACID simulation, xử lý đồng thời HTTP 409 Conflict, bảo vệ `ORDER_OWN_PRODUCT`, cảnh báo tồn kho và hoàn tác tức thì.

### 7.1 Các Tuyến Đường & Phân Hệ Đã Hoàn Thiện (Routes 6–18)
1. **Sàn Thương Mại Sinh Vật Cảnh (`/products` — Route 6)**:
   - `ProductsPage.tsx`: Hero strip tạp chí với Ken-Burns slideshow, 3 sản phẩm nổi bật bố cục 2:1:1, Ticker tổng số sinh vật đang mở bán.
   - Thanh lọc dính (Sticky filter sidebar): Tìm kiếm gõ có độ trễ (debounce 300ms), pills nhóm sinh học, chọn loài từ bách khoa, thanh trượt khoảng giá (`Slider`), checkbox chỉ xem còn hàng, đa chọn cấp bảo tồn IUCN và nút đặt lại bộ lọc.
   - Đồng bộ 2 chiều với URL Search Params (`?q=`, `?group=`, `?species=`, `?minPrice=`, `?maxPrice=`, `?inStock=`, `?iucn=`, `?sort=`, `?page=`).
   - Toolbar sắp xếp (mới nhất, giá tăng dần, giá giảm dần, bảng chữ cái), lưới 3 cột thẻ sản phẩm tỷ lệ 4:5, phân trang đồng bộ.

2. **Chi Tiết Sinh Vật Cảnh (`/products/:id` — Route 7)**:
   - `ProductDetailPage.tsx`: Bố cục tạp chí khoa học 12 cột.
   - Cột trái 7/12: Kính lúp kỹ thuật số `LensMagnifier` độ phóng đại 2.5x, đường kính 160px với con trỏ neon bám chuột, nút mở Lightbox toàn màn hình, dải ảnh thu nhỏ đa góc nhìn.
   - Cột phải 5/12 dính (sticky): Breadcrumbs phả hệ, tiêu đề sinh vật, tên khoa học in nghiêng, chip shop (`ShopChip`) dẫn tới cửa hàng, hiển thị giá `formatVnd`, cảnh báo kho (chỉ còn N cá thể / hết hàng).
   - Bộ chọn số lượng `NumberStepper` tự động giới hạn bởi tồn kho khả dụng trừ số lượng đã có trong giỏ hàng.
   - Cặp nút hành động: "Thêm vào giỏ" tích hợp quỹ đạo hạt bay `FlyToCart`, "Mua ngay" chuyển thẳng tới `/checkout?productId=...&quantity=...`. Chặn tự mua hàng của chính mình (`ORDER_OWN_PRODUCT`), nhắc đăng nhập thân thiện.
   - Hộp cam kết 3 tiêu chuẩn vàng BioNexus: F2+ hợp pháp CITES, bảo hành sống khỏe 48h, hồ sơ phả hệ đầy đủ.
   - 3 Tab thông tin: Mô tả chi tiết, Thông số sinh học & điều kiện nuôi (tự động liên kết từ bách khoa loài), Quy chuẩn vận chuyển & đóng gói chuyên dụng sinh học.
   - Danh sách sinh vật cùng loài và cùng nhóm họ hàng; thanh điều khiển dính đáy màn hình trên thiết bị di động.

3. **Giỏ Hàng Tương Tác Cao Cấp (`/cart` — Route 8)**:
   - `CartPage.tsx`: Phân nhóm sản phẩm theo từng nhà nhân giống/cửa hàng.
   - Hàng sản phẩm `CartItemRow`: Tên sinh vật, tên khoa học, giá đơn vị, bộ điều chỉnh `NumberStepper`.
   - Cảnh báo tồn kho thời gian thực: Phát hiện sản phẩm vượt quá tồn kho khả dụng kèm nút "Giảm về N" tiện lợi; phát hiện sản phẩm đã hết hàng hoặc ngừng kinh doanh, tự động loại trừ khỏi tổng tiền thanh toán.
   - Xóa món với Sonner toast kèm nút "Hoàn tác" (Undo) khôi phục giỏ hàng tức thời; hộp thoại xác nhận dọn sạch toàn bộ giỏ hàng.
   - Cột tóm tắt đơn hàng dính: Ticker tổng tiền động, kiểm tra tính hợp lệ trước khi cho phép tiến hành đặt hàng.

4. **Quy Trình Đặt Hàng Nguyên Tử (`/checkout` — Route 9)**:
   - `CheckoutPage.tsx`: Hỗ trợ 2 luồng đặt hàng (từ giỏ hàng hoặc mua ngay `?productId=X&quantity=Y`).
   - Quy trình 2 bước trực quan với thanh tiến trình có hiệu ứng chuyển động:
     - Bước 1 (Giao hàng): Tự động điền thông tin từ hồ sơ người dùng (`api/me`), xác thực dữ liệu qua Zod schema `checkoutShippingSchema` (họ tên, số điện thoại Việt Nam chuẩn 10 chữ số, địa chỉ chi tiết, ghi chú vận chuyển sinh học), cam kết chăm sóc có trách nhiệm bắt buộc.
     - Bước 2 (Thanh toán & Xác nhận): Lựa chọn phương thức thanh toán (COD khi nhận hàng, chuyển khoản VietQR động với mã QR mô phỏng, ví BioPay), bảng tóm tắt đơn hàng, cảnh báo khóa giao dịch ACID (giữ kho 15 phút), nút đặt hàng với trạng thái tải mượt mà.
   - Xử lý mã lỗi HTTP 409 Conflict: Hiển thị hộp thoại thông báo chi tiết khi có xung đột tồn kho hoặc thay đổi trạng thái, hướng dẫn người dùng kiểm tra lại giỏ hàng.

5. **Lịch Sử Đơn Hàng & Chi Tiết Đơn Hàng (`/orders`, `/orders/:id` — Routes 10–11)**:
   - `OrdersPage.tsx`: Hệ thống tab trạng thái đơn hàng (Tất cả, Chờ xử lý, Hoàn tất, Đã hủy), thẻ đơn hàng `OrderCard` với mã đơn dạng mono `ORD-2026-XXXX`, ngày đặt chuẩn tiếng Việt, huy hiệu trạng thái `StatusPill`, danh sách ảnh đại diện thu nhỏ xếp lớp, tổng tiền VND và nút "Xem chi tiết →".
   - `OrderDetailPage.tsx`:
     - Banner chúc mừng đặt hàng thành công xuất hiện khi có param `?new=1`, kích hoạt hiệu ứng pháo hoa bào tử sinh học (`CelebrationConfetti`) và dấu tích xanh SVG vẽ bằng Motion `pathLength: [0, 1]`.
     - Dòng thời gian 4 nấc (Chờ xác nhận → Đang chuẩn bị → Đang giao hàng → Hoàn tất) hoặc rẽ nhánh Đã hủy (CANCELLED).
     - Bảng chi tiết sản phẩm bất biến (immutable snapshot) theo giá tại thời điểm đặt hàng.
     - Hướng dẫn nhận hàng và quay video mở hộp sinh vật (unboxing) có giá trị khiếu nại bảo hành; tính năng "Mua lại" và hộp thoại "Liên hệ cửa hàng".

6. **Phân Hệ Xác Thực & Đăng Ký (`/login`, `/register`, `/admin/login` — Routes 12–14)**:
   - `AuthLayout.tsx`: Khung giao diện xác thực cao cấp với slideshow Ken-Burns xoay vòng 5 ảnh thật Wikimedia Commons, hiệu ứng Iris reveal, thẻ thông tin bản quyền ảnh nổi.
   - `LoginPage.tsx`: Đăng nhập bằng tên tài khoản hoặc email, mật khẩu có nút bật/tắt ẩn hiện, bảng 4 nút đăng nhập nhanh bằng tài khoản hạt giống (`levanc`, `nguyenvana`, `vuthif`, `dangvang`) với biểu tượng Lucide sang trọng (0 emoji), bảo vệ tham số chuyển tiếp an toàn `?next=`.
   - `RegisterPage.tsx`: Xác thực biểu mẫu qua Zod schema, thanh đo độ mạnh mật khẩu 4 cấp trực quan (Yếu, Trung bình, Khá, Mạnh), tự động bắt lỗi HTTP 409 Conflict và gán lỗi vào từng trường biểu mẫu, tự động đăng nhập ngay sau khi đăng ký thành công.
   - `AdminLoginPage.tsx`: Cổng đăng nhập quản trị viên chuyên biệt, hỗ trợ đăng nhập nhanh 3 tài khoản hạt giống (`superadmin`, `moderator1`, `biologist1`).

7. **Hồ Sơ Cá Nhân & Kênh Người Bán (`/account`, `/seller/apply`, `/seller`, `/seller/products/new` — Routes 15–18)**:
   - `AccountPage.tsx`: Thẻ hồ sơ thành viên với avatar chữ cái đầu, thông tin định danh (username, email, điện thoại, địa chỉ); Ma trận 5 trạng thái cửa hàng động (Chưa có shop, PENDING đang chờ duyệt, ACTIVE đang hoạt động, REJECTED bị từ chối kèm lý do, BANNED bị đình chỉ) với nút hành động và dòng thời gian xử lý tương ứng.
   - `SellerApplyPage.tsx`: Biểu mẫu đăng ký mở gian hàng với thẻ xem trước dính kiểu "Paper island", tự động đồng bộ tên shop, hotline và bio theo thời gian thực.
   - `SellerDashboardPage.tsx`: Bảng điều khiển nhà bán hàng với 4 thẻ chỉ số KPI chính (Doanh thu VND, Đơn hàng mới, Sản phẩm đã duyệt, Đánh giá trung bình), bảng quản lý danh mục sản phẩm của shop với các tab trạng thái (Tất cả, Đang bán, Chờ duyệt, Bị từ chối, Hết hàng).
   - `SellerNewProductPage.tsx`: Biểu mẫu đăng bán sinh vật cảnh mới với hộp chọn tìm kiếm 9 loài bách khoa (kèm chip IUCN), bộ chọn ảnh thật hoặc URL tùy chỉnh, giá bán VND, số lượng kho, mô tả và thẻ xem trước `ProductCard` cập nhật trực tiếp.

### 7.2 UI Primitives & Domain Components Mới
- `src/components/ui/NumberStepper.tsx`: Bộ điều chỉnh số lượng an toàn với nút `[-]`/`[+]`, nhập số trực tiếp, giới hạn min/max, hỗ trợ bàn phím và trạng thái vô hiệu hóa.
- `src/components/ui/Ticker.tsx`: Bộ đếm số chuyển động mượt mà với hàm làm mềm cubic ease-out, hỗ trợ định dạng tiền tệ VND hoặc số nguyên.
- `src/components/ui/EmptyState.tsx`: Thành phần trạng thái rỗng tái sử dụng với icon tinh tế, tiêu đề, mô tả và nút hành động.
- `src/components/ui/Slider.tsx`: Thanh trượt khoảng giá tùy biến trên nền `@radix-ui/react-slider` với phong cách Bio-Luxury.
- `src/components/domain/FlyToCart.tsx`: Hoạt ảnh hạt bay cong Bezier từ vị trí nút bấm đến biểu tượng giỏ hàng trên Header, kích hoạt hiệu ứng nảy nhẹ (`bounce`) tại giỏ hàng.
- `src/components/domain/ProductCard.tsx`: Nâng cấp tỷ lệ 4:5 chuẩn tạp chí mẫu R, lật mặt sau khi hover hiển thị góc chụp khác của sinh vật, huy hiệu IUCN, nhãn F2+ CITES, chỉ báo tồn kho, định dạng giá VND, nút thêm nhanh vào giỏ hàng.
- `src/components/domain/LensMagnifier.tsx`: Kính lúp kỹ thuật số độ phóng đại 2.5x với viền neon xanh ngọc 160px bám theo con trỏ chuột (tự động ẩn trên màn hình cảm ứng), tích hợp nút mở Lightbox toàn màn hình.
- `src/components/domain/VietQRCard.tsx`: Thẻ chuyển khoản ngân hàng VietQR sinh động với ma trận mã QR mô phỏng, logo Napas247, số tiền, nội dung chuyển khoản và các nút sao chép nhanh một chạm.
- `src/components/domain/CelebrationConfetti.tsx`: Hiệu ứng hạt bào tử phát quang chuyển động ngẫu nhiên và dấu tích kiểm tra SVG sinh động (`pathLength: [0, 1]`).
- `src/content/copy.ts`: Từ điển văn bản quy chuẩn đóng gói, vận chuyển, cam kết sinh học, hoàn toàn không chứa emoji.

### 7.3 Báo Cáo Kiểm Tra Cổng Chất Lượng Mốc 5
- `npm run check`: **PASS HOÀN TOÀN (100%)**
  - `tsc --noEmit` (TypeScript strict): **0 lỗi**.
  - `oxlint src/`: **0 cảnh báo, 0 lỗi trên 176 tệp mã nguồn**.
  - `scripts/verify-no-emojis.mjs`: **PASS (0 emoji)** trong toàn bộ mã nguồn `frontend/src/`.
  - `vitest run`: **PASS 21/21 test files (167/167 tests)**:
    - Bổ sung `NumberStepper.test.tsx` (6 tests: tăng, giảm, giới hạn biên min/max, gõ trực tiếp).
    - Bổ sung `EmptyState.test.tsx` (2 tests: hiển thị, kích hoạt nút hành động).
    - Bổ sung `ProductCard.test.tsx` (3 tests: render huy hiệu & giá, callback thêm nhanh, trạng thái hết hàng).
  - `tsc -b && vite build`: **PASS** (đóng gói production hoàn tất trong `dist/`, đường dẫn tương đối chuẩn WAR context).
  - `scripts/verify-no-three-preload.mjs`: **PASS (0 modulepreload Three.js/Geo trong dist/index.html)**.
- `node --experimental-strip-types --test frontend/tests/e2e/*.test.ts`: **109/109 E2E Contract Tests PASS (100%)**.

---

## 8. Chi Tiết Thi Công Mốc 6 (Milestone 6: Quản Trị Admin, Tối Ưu Hóa & Bàn Giao Toàn Diện - PROMPTS 15, 16)

- **Mục tiêu**: Hiện thực hóa PROMPTS 15, 16; xây dựng toàn bộ phân hệ Quản trị Admin (Routes 19–22), Tối ưu hóa điều hướng & Bản quyền (Routes 23–24), kiểm định phân quyền RBAC đa vai trò, bảo vệ ngân sách bundle Landing Gzip ≤ 180 KB, và lập hồ sơ bàn giao kỹ thuật `HANDOFF.md`.

### 8.1 Các Tuyến Đường Quản Trị & Tối Ưu Hóa Đã Xây Dựng
1. **Route 19 — Tổng Quan Quản Trị (`src/pages/admin/AdminDashboardPage.tsx` - `#/admin`)**:
   - 4 Thẻ chỉ số KPI StatTiles tích hợp hiệu ứng nhảy số mượt mà `Ticker`: Tổng hồ sơ cửa hàng, Sản phẩm sàn, Loài bách khoa, Doanh thu tuần.
   - Biểu đồ phân bổ 5 cấp độ bảo tồn Sách Đỏ IUCN (CR, EN, VU, NT, LC) theo tỷ lệ thực tế, tương tác tooltip hiển thị số lượng và danh mục khoa học.
   - Thẻ cảnh báo tuân thủ nghiêm ngặt Công ước CITES Phụ lục I & II: giám sát 100% cá thể bắt buộc đạt chuẩn nhân giống F2+ kiểm lâm.
   - Dòng thời gian hoạt động kiểm duyệt (Moderation Activity Timeline) phản ánh thời gian thực các quyết định duyệt/từ chối của kiểm duyệt viên.

2. **Route 20 — Kiểm Duyệt Cửa Hàng (`src/pages/admin/AdminSellersPage.tsx` - `#/admin/sellers`)**:
   - Bố cục Master-Detail tỷ lệ vàng 38% / 62% tối ưu hóa cho thao tác xử lý danh sách hàng loạt.
   - 5 Tab lọc trạng thái kèm bộ đếm số lượng thời gian thực: `Chờ duyệt` (PENDING), `Đang hoạt động` (ACTIVE), `Bị từ chối` (REJECTED), `Bị cấm` (BANNED), `Tất cả` (ALL).
   - Khung soi chiếu Giấy phép Khai sinh & Nuôi sinh sản CITES có dấu đỏ kiểm lâm mô phỏng, nút phóng to Lightbox toàn màn hình.
   - Hộp thoại duyệt có xác nhận, hộp thoại từ chối yêu cầu nhập lý do chi tiết (tối thiểu 10 ký tự, hỗ trợ gợi ý lý do nhanh chuẩn CITES), hộp thoại cấm vĩnh viễn.
   - Bộ phím tắt tốc độ cao (Speed Moderation Hotkeys): `J`/`K` (chuyển shop kế tiếp/trước), `A` (duyệt nhanh), `R` (mở modal từ chối), `Esc` (hủy), `?` (bật bảng trợ giúp). Tích hợp cơ chế Input Focus Guard tránh nuốt ký tự khi người dùng đang nhập văn bản.

3. **Route 21 — Kiểm Duyệt Sản Phẩm Sinh Vật Cảnh (`src/pages/admin/AdminProductsPage.tsx` - `#/admin/products`)**:
   - Bố cục Dual-Pane tỷ lệ 35% / 65% tập trung chuyên sâu vào tính xác thực sinh học của cá thể.
   - Cơ chế Soi Chiếu Đối Chuẩn Song Song (Side-by-side Species Verification):
     * Cột trái: Ảnh thực tế cá thể do người bán tải lên, tích hợp Kính lúp điện tử `LensMagnifier` 2.5x viền ngọc bích.
     * Cột phải: Ảnh mẫu đối chiếu chuẩn khoa học từ kho tư liệu Wikimedia Commons / iNaturalist với `LensMagnifier` 2.5x tương đương.
     * Giúp kiểm duyệt viên phát hiện ngay lập tức tình trạng "treo đầu dê bán thịt chó" hoặc cá thể bắt tự nhiên (Wild) giả mạo F2+.
   - Bảng phân tích phả hệ phân loại học 6 cấp (`TaxonPath`), huy hiệu IUCN, thanh chỉ số nhiệt độ `ClimateBar`, đồng hồ đo độ ẩm `HumidityGauge`, và liên kết tra cứu trực tiếp GBIF Taxonomy.

4. **Route 22 — Quản Lý Bách Khoa Loài (`src/pages/admin/AdminSpeciesPage.tsx` - `#/admin/species`)**:
   - Bảng cơ sở dữ liệu bách khoa toàn diện hiển thị 9 loài mẫu: Thumbnail, Tên khoa học in nghiêng chuẩn Latin, Tên thông thường tiếng Việt, Chi (Genus) trực thuộc, Huy hiệu IUCN, Số lượng bài bán liên kết trên sàn, Chỉ số vi khí hậu rút gọn.
   - Ngăn kéo trượt (Slide-over Sheet) 600px thêm loài mới chia làm 4 phân đoạn khoa học có thẩm định schema:
     1. *Thông tin định danh*: Tên khoa học, Tên tiếng Việt, Tên tiếng Anh, Cấp phân loại Chi (tra cứu động).
     2. *Bảo tồn & Sinh học*: Cấp độ IUCN, Khóa phân loại CITES, Môi trường sinh sống.
     3. *Chỉ số vi khí hậu*: Nhiệt độ nước, không khí, điểm sưởi, độ ẩm tối ưu.
     4. *Tư liệu & Giấy phép*: URL ảnh hero, URL ảnh chân dung, tác giả, giấy phép CC, liên kết nguồn Wikimedia Commons và GBIF.

5. **Route 23 — Ghi Công & Bản Quyền Hình Ảnh (`src/pages/Credits.tsx` - `#/credits`)**:
   - Bento Matrix 4 thẻ chỉ số bản quyền: 161 files ảnh nội bộ tối ưu (AVIF & WebP), 45 tác phẩm nguồn Wikimedia & iNaturalist, 0 ảnh AI (100% sinh vật thật), 100% minh bạch bản quyền tự do (CC0, CC BY 4.0, CC BY-SA 4.0).
   - Bộ lọc theo vai trò ảnh (Tất cả, Bách khoa loài, Sản phẩm sinh vật cảnh, Sinh cảnh) kết hợp thanh tìm kiếm thông minh theo loài, tác giả, giấy phép.

6. **Route 24 — Trang 404 Bio-Luxury (`src/pages/NotFoundPage.tsx` - `*`)**:
   - Thiết kế chuẩn mẫu R "Lạc lối trong Sinh quyển" với biểu tượng La bàn neon phát quang xoay nhẹ, huy hiệu 404 đỏ ngọc, hiển thị rõ ràng đường dẫn URL yêu cầu, và cụm nút điều hướng nhanh về Trang chủ, Bách khoa loài, Sàn sinh vật cảnh.

7. **Khung Điều Hướng Quản Trị & Phân Quyền (`src/components/layout/AdminLayout.tsx`)**:
   - Tự động điều chỉnh thanh điều hướng theo vai trò (RBAC):
     * `SUPER_ADMIN`: Toàn quyền 4 phân hệ.
     * `MODERATOR`: Kiểm duyệt shop & sản phẩm (tự động ẩn menu loài).
     * `BIOLOGIST`: Quản lý bách khoa loài (tự động ẩn menu shop & sản phẩm).
   - Màn hình 403 Forbidden Bio-Luxury sắc sảo chặn đứng truy cập trái phép.
   - Huy hiệu định danh quản trị viên (Admin Tổng: Tím huyền bí, Kiểm duyệt viên: Vàng ấm hổ phách, Nhà sinh học: Xanh ngọc bích).
   - Hỗ trợ đầy đủ Mobile Drawer cho máy tính bảng và điện thoại.

### 8.2 Tối Ưu Hóa Tải Trang & Bảo Vệ Ngân Sách Bundle
- Áp dụng kỹ thuật phân tách mã nguồn Code Splitting qua `React.lazy()` và `Suspense` cho toàn bộ các tuyến đường Admin, Credits và NotFound.
- Kết quả kiểm tra ngân sách tự động (`scripts/check-bundle-budget.mjs`):
  - Tổng dung lượng Landing JS (Raw): **506.14 KB**.
  - Tổng dung lượng Landing JS (Gzip): **157.17 KB**.
  - Ngân sách mục tiêu: **≤ 180.00 KB Gzip** -> **ĐẠT CHUẨN XUẤT SẮC**.
  - Kiểm tra Preload (`scripts/verify-no-three-preload.mjs`): **0 thẻ modulepreload Three.js/Geo trong dist/index.html**, đạt chuẩn 100%.

### 8.3 Báo Cáo Kiểm Tra Cổng Chất Lượng Mốc 6 (Quality Gate)
- `npm run check`: **PASS HOÀN TOÀN (100%)**
  - `tsc --noEmit` (TypeScript strict): **0 lỗi**.
  - `oxlint src/`: **0 cảnh báo, 0 lỗi trên 182 tệp mã nguồn**.
  - `scripts/verify-no-emojis.mjs`: **PASS (0 emoji)** trong toàn bộ mã nguồn `frontend/src/`.
  - `vitest run`: **PASS 22/22 test files (215/215 tests)**.
  - `tsc -b && vite build`: **PASS** (đóng gói production hoàn tất trong `dist/`, tất cả chunks Admin được tách biệt hoàn hảo).
  - `scripts/verify-no-three-preload.mjs`: **PASS (100%)**.
  - `scripts/check-bundle-budget.mjs`: **PASS (157.17 KB Gzip ≤ 180.00 KB)**.
- `node --test frontend/tests/e2e/*.test.ts`: **109/109 E2E Contract Tests PASS (100%)**.
- Toàn bộ hồ sơ bàn giao kỹ thuật được đúc kết tại `frontend/HANDOFF.md`.

---

## 9. Phần A — Khắc Phục Sự Cố Ảnh Giả & Xác Thực 45 Ảnh Thật Wikimedia Commons

### 9.1 Ghi Nhận Sự Cố & Nguyên Nhân
- Kiểm tra độc lập ngày 02/11/2026 phát hiện:
  1. 161 tệp trong `frontend/public/photos/` được sinh từ hàm `renderSvgPlate` trong script cũ (`optimize-photos.mjs`) dưới dạng thẻ đồ họa gradient vẽ chữ chứ không phải ảnh chụp sinh vật thật.
  2. Toàn bộ 45 `sourceUrl` trong `src/content/photos.ts` trước đó là tên file giả định không tồn tại trên Wikimedia Commons.
- Đây là vi phạm nghiêm trọng luật cứng về ảnh thật trong `AGENTS.md` và `docs/frontend/06-anh-that.md`.

### 9.2 Cách Đã Khắc Phục Triệt Để
1. **Xoá bỏ hoàn toàn ảnh giả & script vẽ thẻ SVG**:
   - Xoá toàn bộ 161 tệp ảnh giả trong `frontend/public/photos/`, xoá script cũ `scripts/optimize-photos.mjs` và xoá mọi mục credit không kiểm chứng được.
2. **Sử dụng 28 ảnh thật từ `docs/frontend/reference/trip-photos/` + Tải bổ sung 17 ảnh thật từ Wikimedia Commons API**:
   - Đưa 28 ảnh thật đã kiểm chứng trong `docs/frontend/reference/trip-photos/` cùng `credits.json` vào pipeline.
   - Truy vấn trực tiếp API `https://commons.wikimedia.org/w/api.php` (`action=query&generator=search&gsrnamespace=6&prop=imageinfo&iiprop=url|size|mime|extmetadata`) với `User-Agent` dự án và rate-limit 1 req/s để tải bổ sung ảnh thật cho 9 loài.
   - Tự mở xem trực tiếp từng ảnh bằng công cụ đọc file ảnh để xác nhận đúng loài, rõ nét, không watermark, giấy phép tự do hợp lệ (`CC0`, `CC BY`, `CC BY-SA`, `Public domain`).
3. **Xây dựng Pipeline `scripts/build-real-photos.mjs` & Kiểm tra Tự động `scripts/verify-photos.mjs` (`npm run check:photos`)**:
   - Sinh 196 tệp ảnh đa phân giải (`960`, `1600`, `1920` WebP & AVIF) trong `public/trip/` và 161 tệp ảnh đa phân giải (`480`, `960`, `1600` AVIF, WebP, JPG) trong `public/photos/`, tổng cộng **357 tệp ảnh thật** kèm ảnh mờ LQIP base64.
   - Tạo `scripts/verify-photos.mjs` gom mọi `sourceUrl` trong `src/content/`, gọi API Wikimedia Commons theo lô 50 tiêu đề để kiểm tra file tồn tại và giấy phép hợp lệ, đồng thời đối chiếu mọi tệp vật lý trong `public/photos` và `public/trip`.

### 9.3 Kết Quả Chạy `npm run check:photos` (Nguyên Văn)
```text
> bionexus-frontend@1.0.0 check:photos
> node scripts/verify-photos.mjs

=== BioNexus Photo & Commons License Verification (check:photos) ===
Tìm thấy 45 sourceUrl duy nhất trong src/content/.
[OK] File:Ambystoma mexicanum.005 - Aquarium Finisterrae.jpg — Fernando Losada Rodríguez · CC BY-SA 4.0 (5152x3864)
[OK] File:Axolotl ambystoma mexicanum anfibio ASAG.jpg — Amandasofiarana · CC BY-SA 4.0 (1920x1280)
[OK] File:Trajineras (Xochimilco, 2009).JPG — El Comandante · CC BY-SA 3.0 (3648x2736)
[OK] File:Large lower pitcher of wild Nepenthes rajah plant.jpg — Unknown · Public domain (1488x1984)
[OK] File:Nepenthes rajah (5).jpg — NepGrower at English Wikipedia · Public domain (1984x1488)
[OK] File:Rainforest cloud forming Kinabalu Sabah Borneo Kampong Kundasang 5.jpg — kallerna · CC BY-SA 4.0 (5100x3400)
[OK] File:Python regius - ball python.jpg — Brian Gratwicke · CC BY 2.0 (4855x3036)
[OK] File:Python regius 070731 a.jpg — Rainer Altenkamp · CC BY-SA 3.0 (1848x1626)
[OK] File:Savanna landscape, Northern region, Ghana.jpg — Stig Nygaard · CC BY 2.0 (2560x1827)
[OK] File:Eublepharis macularius 2009 G6.jpg — George Chernilevsky · Public domain (3712x2088)
[OK] File:EUBLEPHARIS-MACULARIUS Leopard-Gecko Leopardgecko 201705276011.jpg — Christian von Faber-Castell · CC BY 4.0 (8688x5792)
[OK] File:Sunset in mountains, Turbat, Balochistan.jpg — Yasir Dora · CC BY-SA 4.0 (5344x3056)
[OK] File:Venus Flytrap - Dionaea muscipula, Green Swamp, Supply, North Carolina, October 18, 2021 (51693075042).jpg — Judy Gallagher · CC BY 2.0 (6720x4480)
[OK] File:Venus flytrap (53886303376).jpg — Judy Gallagher · CC BY 2.0 (3117x3117)
[OK] File:Longleaf Pine Savanna II (13158080455).jpg — Justin Meissen from St Paul, United States · CC BY-SA 2.0 (2400x1600)
[OK] File:Burmese Python photographed at Bardiya National Park2.jpg — Shadow Ayush · CC BY-SA 4.0 (6000x4000)
[OK] File:Burmese Python 03.jpg — SuperJew · CC BY-SA 3.0 (1600x1200)
[OK] File:Cat Tien Park, Vietnam, tropical forest, roots.jpg — Vyacheslav Argenberg · CC BY 4.0 (3984x2656)
[OK] File:Pogona vitticeps close-up 2009 G1.jpg — George Chernilevsky · Public domain (3712x2088)
[OK] File:Pogona vitticeps 2009 G1.jpg — George Chernilevsky · Public domain (3712x2088)
[OK] File:Petermann Ranges (AU), Uluru-Kata Tjuta National Park, Uluru, Kuniya Walk -- 2019 -- 3615.jpg — Dietmar Rabich · CC BY-SA 4.0 (6720x4480)
[OK] File:Testudo hermanni Boettgeri - 01.jpg — NorbertNagel · CC BY-SA 4.0 (3564x2376)
[OK] File:Testudo hermanni hermanni 01.jpg — Olaf Tausch · CC BY 3.0 (3126x2344)
[OK] File:Formation maquis.jpg — AmélieBertaigne · CC BY-SA 4.0 (3182x2387)
[OK] File:Pitcher Plant (Nepenthes ampullaria) (14136485484).jpg — Bernard DUPONT from FRANCE · CC BY-SA 2.0 (3222x2133)
[OK] File:Pitcher Plants (Nepenthes ampullaria) (8410326499).jpg — Bernard DUPONT from FRANCE · CC BY-SA 2.0 (3648x2736)
[OK] File:A view of the old rainforest- not much left unfortunately (11463945203).jpg — shankar s. from Dubai, united arab emirates · CC BY 2.0 (4288x2848)
[OK] File:Eublepharis macularius 1.jpg — Michał Zawiślak (mihauz @) · CC BY-SA 2.5 (2048x1536)
[OK] File:G. noční.jpg — Det at Czech Wikipedia · Public domain (2288x1712)
[OK] File:Pogona vitticeps 2009 G2.jpg — George Chernilevsky · Public domain (3712x2088)
[OK] File:Python regius - hypomelanistic.png — WingedWolfPsion · CC BY-SA 3.0 (1780x1070)
[OK] File:Burmese Python 02.jpg — Danleo~commonswiki · CC BY 2.5 (3264x2448)
[OK] File:Testudo hermanni JPG.jpg — Jean-Pol GRANDMONT · CC BY 3.0 (1936x1288)
[OK] File:Ambystoma mexicanum 2.jpg — Stan Shebs · CC BY-SA 3.0 (1800x794)
[OK] File:Dionaea muscipula trap.jpg — che · CC BY-SA 2.5 (3456x2304)
[OK] File:Nepenthes rajah.png — Unknown · Public domain (1488x1984)
[OK] File:Nep amp 295.jpg — No machine-readable author provided. NepGrower~commonswiki assumed (based on copyright claims). · CC BY-SA 2.5 (1488x1984)
[OK] File:Forest in Cuc Phuong National Park (15706323528).jpg — hds · CC BY 2.0 (4288x2848)
[OK] File:Taman Negara, Malaysia, Canopy Walkway.jpg — Vyacheslav Argenberg · CC BY 4.0 (3984x2656)
[OK] File:Venus Flytrap showing trigger hairs.jpg — Noah Elhardt · CC BY-SA 2.5 (1527x1670)
[OK] File:Tree Ferns (Cyathea sp.) and Montane Forest (14647918801).jpg — Bernard DUPONT from FRANCE · CC BY-SA 2.0 (3241x2130)
[OK] File:Nepenthes ampullaria elongated.jpg — Mgiganteus · CC BY-SA 3.0 (1984x1488)
[OK] File:Ambystoma mexicanum 3.jpg — Stan Shebs · CC BY-SA 3.0 (1800x1235)
[OK] File:Calanque de Cassis.jpg — Cocosea · CC BY-SA 4.0 (2560x1536)
[OK] File:Fishing on Tembeling River, Taman Negara, Malaysia.jpg — Vyacheslav Argenberg · CC BY 4.0 (3984x2656)

=== KẾT QUẢ KIỂM TRA ẢNH (PASS) ===
- Tổng số sourceUrl Wikimedia Commons đã xác thực: 45/45 (0 missing, 0 sai giấy phép)
- Tổng số file vật lý trong public/photos & public/trip: 357/357 đều khớp mục credit
```

---

## 10. Phần B — Trang Hành Trình 9 Loài (`/tham-hiem` — Route 25)

### 10.1 Kiến Trúc & Các Thành Phần Đã Thi Công
- **Tuyến đường**: `#/tham-hiem` (Route 25, đứng độc lập ngoài `RootLayout` để toàn quyền điều khiển cuộn dính `h-svh sticky top-0`, HUD thực địa, và thanh điều hướng 4 chặng).
- **Toán học & Địa lý (`src/lib/geo.ts`)**:
  - `distanceKm`: khoảng cách cung tròn lớn Haversine giữa các tọa độ trạm.
  - `dms` & `fmtLL`: đổi độ thập phân sang độ-phút-giây tiếng Việt (`B`/`N`, `Đ`/`T`).
  - `mrz`: sinh dòng chữ máy đọc chuẩn ICAO 44 ký tự không dấu từ họ tên người dùng.
  - `localTime`: giờ thực tại múi giờ của từng trạm qua `Intl.DateTimeFormat('vi-VN', { timeZone })`.
  - `WORLD_LAND_DOTS`: chuỗi `<path>` duy nhất gồm 1.716 chấm lục địa tính sẵn bằng phép chiếu `NaturalEarth1` trên dữ liệu đất liền `110m`.
- **Dữ liệu & Nội dung (`src/content/journey.ts`)**:
  - 4 chặng (`CHAPTERS`), 12 điểm dừng có tọa độ/múi giờ/độ cao (`LEG`), 3 chuyến bay xuyên lục địa (`FLIGHTS`), lộ trình 10 điểm (`ROUTE`), 9 thẻ giới thiệu tính năng `"Trên BioNexus"` (`TIPS`), 9 nhãn thị thực (`VISAS`), và 28 mục ghi công ảnh thực địa (`JOURNEY_CREDITS`).
  - Hàm `resolveJourneySpecies(slug, liveSpecies)` kết nối dữ liệu trực tiếp từ `useSpeciesList()` (MSW / API thật) và trích xuất nhiệt độ/độ ẩm qua `parseEnvironmentSpecs(habitat)`.
- **Trạng thái Hộ chiếu (`src/hooks/usePassport.ts`)**:
  - Lưu trữ bền vững tại `localStorage['bionexus.passport.v1']` theo khóa `username | 'guest'`, bọc toàn bộ `localStorage` trong `try/catch`.
  - Tự động đóng dấu khi cuộn qua ngưỡng `p >= 0.76` tại mỗi trạm (`useStamp`), phát thông báo `aria-live="polite"` cho trình đọc màn hình.
- **9 cơ chế vén màn riêng biệt cho 9 trạm**:
  1. `tram-1` (*Python bivittatus* — Cát Tiên): Ống nhòm hai tròng mở dần (`--bino`) + thước vạch góc phương vị.
  2. `tram-2` (*Nepenthes ampullaria* — Borneo): Ống kính macro xoay vòng khẩu độ `f/1.4 → f/8.0`, xóa nhòe `blur` (`--focus`).
  3. `tram-3` (*Nepenthes rajah* — Kinabalu): Leo độ cao `1.500 m → 2.650 m` trên HUD, hai lớp sương mù tách sang hai bên (`--mist`).
  4. `tram-4` (*Dionaea muscipula* — Bắc Carolina): Hai hàm răng cưa SVG khép rồi mở (`--jaws`), hiện ảnh macro lông gai cảm ứng.
  5. `tram-5` (*Ambystoma mexicanum* — Xochimilco): Đường mặt nước dâng từ đáy lên đỉnh màn hình (`--sub`) kèm hạt bọt khí `Motes kind="bubble"`.
  6. `tram-6` (*Python regius* — Ghana): Chuyển từ ảnh nhiệt hồng ngoại giả lập (`hue-rotate` + `saturate`) sang ánh sáng bình minh kèm thang nhiệt `22°C–34°C` (`--ir`).
  7. `tram-7` (*Eublepharis macularius* — Balochistan): Chùm đèn pin quét qua hốc đá đêm sa mạc bằng `radial-gradient` mặt nạ (`--beam`).
  8. `tram-8` (*Pogona vitticeps* — Trung Úc): Cơn lốc bụi cát đỏ và nắng chói sa mạc lắng dần (`--heat`).
  9. `tram-9` (*Testudo hermanni* — Địa Trung Hải): Tấm bưu thiếp 3D có tem ria đục lỗ lật mặt sau (`--flip`) ghi lời nhắn cho hành khách.
- **Kết thúc, Hộ chiếu & Cây họ hàng (`src/pages/journey/FinaleSection.tsx`, `src/pages/journey/KinshipSection.tsx`)**:
  - Màn `ket`: bản đồ toàn tuyến 63.300 km trên bầu trời sao (`Motes kind="star"`).
  - Màn `ho-chieu`: sổ hộ chiếu mở hai trang (trang thông tin + lưới 9 ô thị thực có con dấu SVG xoay nghiêng).
  - Màn `ho-hang` ("Chín loài, một cây họ hàng"): cây phân loại 7 cột từ "Sự sống" qua Giới → Ngành → Lớp → Bộ → Họ → Chi tới 9 loài, vẽ dần bằng `stroke-dashoffset`, làm nổi lần lượt 4 nhánh (`Caryophyllales`, `Python`, `Squamata`, `Amphibia`) kèm câu giải thích tự sinh từ dữ liệu và liên kết trực tiếp tới `#/taxonomy/:id`.
  - Màn `Certificate`: giấy chứng nhận nhà thám hiểm, dải cá thể hợp pháp đang bán từ `useProducts()`, và bảng ghi công 28 ảnh thật.

### 10.2 Bảng Đo FPS Thực Tế (1440×900) & Kích Thước Chunk `/tham-hiem`
- **Kích thước chunk lazy-load (`dist/assets/JourneyPage-*.js`)**:
  - Raw: **124.20 kB** | Gzip: **36.85 kB**.
  - Phụ thuộc Three.js: **0 byte** (`check:preload` & `check:budget` PASS 100%, Landing JS giữ nguyên ở mức **157.45 KB gzip** ≤ 180 KB).
- **Bảng FPS đo trên 19 mục cuộn tại 1440×900**:

| Mục (`section#id`) | Tên hiển thị | FPS trung bình (1440×900) | Ghi chú hiệu năng |
|---|---|---|---|
| `mo-dau` | Mở đầu & Hộ chiếu 3D | **60 FPS** | Biến CSS `--open` qua `requestAnimationFrame` |
| `tong-quan` | BioNexus là gì & Bản đồ lộ trình | **60 FPS** | SVG `<path>` đơn 1.716 chấm đất liền |
| `cua-rung` | Cửa rừng Cát Tiên | **60 FPS** | Tách 2 lớp ảnh tiền cảnh / hậu cảnh |
| `tram-1` | Trạm 01 · Trăn đất | **60 FPS** | Mặt nạ ống nhòm SVG + `preloadTripImage` |
| `song` | Nghỉ chân bờ sông | **60 FPS** | Cuộn ngang mượt không re-render React |
| `tram-2` | Trạm 02 · Nắp ấm bầu | **60 FPS** | Đổi độ mờ `blur` trực tiếp qua biến CSS |
| `tram-3` | Trạm 03 · Nắp ấm Rajah | **60 FPS** | Đếm độ cao DOM ref trực tiếp trên HUD |
| `bay-2` | Chặng bay 02 (BKI → ILM) | **60 FPS** | Nội suy đường cong Bézier bậc hai |
| `tram-4` | Trạm 04 · Cây bắt ruồi | **60 FPS** | Hai hàm răng cưa SVG trượt GPU transform |
| `tram-5` | Trạm 05 · Kỳ nhông Mexico | **60 FPS** | Mặt nước dâng + canvas 2D bubble motes |
| `bay-3` | Chặng bay 03 (MEX → ACC) | **60 FPS** | Nội suy đường cong Bézier bậc hai |
| `tram-6` | Trạm 06 · Trăn bóng | **60 FPS** | Chuyển lớp bộ lọc hồng ngoại mượt |
| `tram-7` | Trạm 07 · Thằn lằn da báo | **60 FPS** | Đèn pin `radial-gradient` theo biến CSS |
| `tram-8` | Trạm 08 · Rồng úc | **60 FPS** | Bụi cát sa mạc lắng dần 60fps |
| `bay-4` | Chặng bay 04 (ASP → MRS) | **60 FPS** | Nội suy đường cong Bézier bậc hai |
| `tram-9` | Trạm 09 · Rùa Hermann | **60 FPS** | Lật bưu thiếp 3D `rotateY` |
| `ket` | Tổng kết lộ trình 63.300 km | **60 FPS** | Bản đồ toàn tuyến + star motes |
| `ho-chieu` | Sổ hộ chiếu 2 trang | **60 FPS** | Lưới 9 con dấu SVG xoay nghiêng |
| `ho-hang` | Chín loài, một cây họ hàng | **60 FPS** | Cây phân loại SVG `pathLength="1"` + 4 nhánh nổi |

---

## 11. Phần C — Chuyến Đi Làm Quen Sau Đăng Ký & Hộ Chiếu Loài Cá Nhân Hóa

### 11.1 Các Hạng Mục Đã Triển Khai
1. **Chuyển hướng tự động sau đăng ký (`src/pages/auth/RegisterPage.tsx`)**:
   - Khi `POST api/auth/register` thành công, tự động điều hướng bằng `navigate('/tham-hiem?chao-mung=1', { replace: true })` (trừ khi có tham số `?next=` hợp lệ).
   - Đăng nhập bình thường tại `/login` giữ nguyên luồng cũ, không ép vào hành trình.
2. **Hai chế độ trên cùng một trang (`/tham-hiem` vs `/tham-hiem?chao-mung=1`)**:
   - **Chế độ khách (`/tham-hiem`)**: Tiêu đề `"Hành trình 9 loài"`, nút chính `"Mở hộ chiếu, lên đường"` (`#cua-rung`), bìa hộ chiếu ghi `"Khách thám hiểm"` nếu chưa đăng nhập.
   - **Chế độ người mới đăng ký (`/tham-hiem?chao-mung=1`)**: Nhãn `"Tài khoản đã sẵn sàng"`, tiêu đề `"Chào mừng, {user.fullName}"`, nút chính `"Bắt đầu hành trình"` (`#tong-quan`), nút phụ `"Bỏ qua, vào trang chủ"` và nút `"Bỏ qua chuyến đi"` trên Header; họ tên thật xuất hiện trên hộ chiếu, 3 thẻ lên máy bay (`bay-2`, `bay-3`, `bay-4`), mặt sau bưu thiếp (`tram-9`) và giấy chứng nhận.
   - Khi bấm `"Bỏ qua, vào trang chủ"` hoặc `"Bỏ qua chuyến đi"`, ghi nhận `skippedAt` vào `localStorage['bionexus.passport.v1']` và về `#/`.
3. **Thẻ `"Hộ chiếu loài"` trên trang `/account` (`src/pages/account/AccountPage.tsx`)**:
   - Hiển thị số dấu đã thu thập `n/9`, 9 chấm tiến độ và lưới 9 trạm loài kèm trạng thái `"Đã đóng dấu"` / `"Chưa gặp"`.
   - Khi `n === 0`: hiện nút `"Bắt đầu hành trình"` → `/tham-hiem?chao-mung=1`.
   - Khi `0 < n < 9`: hiện nút `"Đi tiếp hành trình"` → `/tham-hiem?tram=${firstUnmetStationId}` (tự cuộn tới trạm đầu tiên chưa có dấu).
   - Khi `n === 9`: hiện huy hiệu `"Nhà thám hiểm BioNexus"` và nút `"Xem lại hộ chiếu & chứng nhận"` → `/tham-hiem?tram=ho-chieu`.
4. **Điểm vào từ Thanh điều hướng, Trang chủ & DevPanel**:
   - `src/components/layout/RootLayout.tsx`: thêm mục `"Hành trình 9 loài"` (`/tham-hiem`) trên Navbar và Footer.
   - `src/pages/Home.tsx`: thêm dải mời tham gia `"Hành trình 9 loài ngoài tự nhiên"` (ảnh thật `trail` + nút `"Bắt đầu hành trình"` → `#/tham-hiem`) ngay trước phần kết.
   - `src/components/dev/DevPanel.tsx`: thêm nút một chạm `"Xem như người mới đăng ký"` tự động đăng nhập tài khoản `levanc`, làm mới hộ chiếu và mở `#/tham-hiem?chao-mung=1`.
5. **Bàn giao Backend (`frontend/HANDOFF.md`)**:
   - Bổ sung mục 3.5 đề xuất endpoint tùy chọn `GET api/me/passport` và `PUT api/me/passport` để đồng bộ hộ chiếu loài giữa nhiều thiết bị khi cần.

### 11.2 Kết Quả Kiểm Thử E2E & Cổng Chất Lượng Phần C
- **E2E 1 (Khách vãng lai `#/tham-hiem`)**: PASS (`h1` hiện `"Hành trình 9 loài"`, nút `"Mở hộ chiếu, lên đường"`, huy hiệu `0/9`).
- **E2E 2 (Đăng ký `"Nguyễn Văn Mới"` → `#/tham-hiem?chao-mung=1` → Bỏ qua)**: PASS (`h1` hiện `"Chào mừng, Nguyễn Văn Mới"`, hộ chiếu & thẻ lên máy bay hiện `"Nguyễn Văn Mới"`, bấm bỏ qua về `#/` và lưu `skippedAt`).
- **E2E 3 (Đóng dấu `#tram-1` → Tải lại trang vẫn còn `1/9` → `/account` hiện thẻ `"Hộ chiếu loài"` `1/9` & `"Đi tiếp hành trình"`)**: PASS.
- **E2E 4 (DevPanel `"Xem như người mới đăng ký"`)**: PASS.








