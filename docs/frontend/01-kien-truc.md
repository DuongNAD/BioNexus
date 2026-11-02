# 01 · Kiến trúc frontend

## 1. Mục tiêu chất lượng

| Tiêu chí | Mức yêu cầu |
|---|---|
| Thị giác | Bám mẫu R (`reference/screens/`). Mọi trang cùng một ngôn ngữ thiết kế. Ảnh thật ở mọi nơi có loài hoặc sản phẩm |
| Chuyển động | 60 FPS trên Apple Silicon, ≥ 45 FPS trên laptop tầm trung. Có chế độ giảm chuyển động |
| Hiệu năng | Trang không có 3D: LCP ≤ 2,0 s, CLS ≤ 0,05 (bản `preview`, desktop). JS khung chung ban đầu ≤ 220 KB gzip. three.js nằm ở chunk riêng, chỉ tải khi cần |
| Truy cập | WCAG 2.2 AA. Lighthouse Accessibility ≥ 95 |
| Độ tin cậy | Mọi trang có đủ 4 trạng thái (đang tải, rỗng, lỗi, có dữ liệu). Không có lỗi console. Typecheck sạch |
| Bàn giao | Tắt MSW là chạy với backend thật mà không phải sửa component. Có `HANDOFF.md` |

## 2. Stack và lý do

Phiên bản ghi dưới đây là bản đã chạy ổn trong prototype (11/2026). Cài bản mới nhất cùng major. Nếu lỗi thì quay về đúng các bản này.

| Lớp | Thư viện | Vì sao |
|---|---|---|
| Build | `vite` 8, `@vitejs/plugin-react` 6 | Dev server tức thì; build ra file tĩnh để nhúng vào WAR |
| UI | `react` 19, `react-dom` 19 | Chuẩn hiện nay. R3F 9 cần React 19 |
| Ngôn ngữ | `typescript` 5 (strict) | Kiểu dữ liệu khớp DTO Java nên lúc nối API không sai tên trường; agent sinh code ít lỗi hơn |
| Định tuyến | `react-router` 7, `createHashRouter` + `lazy` | Hash để F5 không bị 404 trên Tomcat. `lazy` tách mỗi trang thành chunk riêng |
| Dữ liệu máy chủ | `@tanstack/react-query` 5 | Bộ đệm, trạng thái đang tải và lỗi, invalidation sau khi thay đổi dữ liệu. Code giữ nguyên khi đổi từ mock sang API thật |
| Giả API | `msw` 2 (service worker) | Chặn `fetch('api/...')` ở tầng mạng và trả JSON đúng hợp đồng. Tắt bằng `VITE_USE_MOCKS=false` |
| Form | `react-hook-form` 7, `zod` 4, `@hookform/resolvers` | Validate phía client bằng câu báo lỗi tiếng Việt, cùng luật với `MessageKey` của backend |
| Kiểu dáng | `tailwindcss` 4 (`@tailwindcss/vite`), `clsx`, `tailwind-merge`, `class-variance-authority` | Token trong CSS variable; component có các biến thể |
| Thành phần nền | `radix-ui` (Dialog, Popover, Tabs, Tooltip, DropdownMenu, Slider, Toast) qua shadcn CLI (bản TSX) | Truy cập bàn phím chuẩn, không phải tự viết |
| Hiệu ứng UI | `motion` (Motion for React), `lenis` | Animation khai báo, `layoutId`, cuộn theo tiến độ; cuộn mượt |
| Thành phần có hiệu ứng | Magic UI, Aceternity UI, React Bits (cài qua registry của shadcn, chỉ lấy khi cần) | Nguồn mở; đã thử trong prototype: BlurFade, NumberTicker, AnimatedBeam, ContainerScroll |
| 3D | `three` 0.18x, `@react-three/fiber` 9, `@react-three/drei` 10, `@react-three/postprocessing` 3, `postprocessing` 6, `maath` | Đã chạy ổn trong prototype (Q, P, O và R) |
| Địa lý | `d3-geo` 3, `topojson-client` 3, `world-atlas` 2 | Vẽ đường bờ biển và làm mặt nạ lục địa cho Hành tinh BioNexus, dữ liệu offline (Natural Earth, public domain) |
| Icon | `lucide-react` | Nét mảnh, đồng bộ |
| Thông báo | `sonner` | Toast đẹp, có hàng đợi |
| Font | `@fontsource/be-vietnam-pro`, `@fontsource/cormorant-garamond`, `@fontsource/jetbrains-mono` | Có bộ chữ tiếng Việt; tự host, không gọi Google Fonts |
| Chất lượng | `oxlint` (hoặc ESLint 9), `prettier`, `vitest`, `@testing-library/react`, `@playwright/test`, `@axe-core/playwright`, `stats-gl` (chỉ dùng khi dev) | Lint nhanh; test hàm; test e2e, chụp ảnh tự động, kiểm tra truy cập; đo FPS |
| Ảnh | `sharp` (devDependency, chỉ dùng trong script) | Tạo AVIF, WebP nhiều kích cỡ và ảnh mờ tạm (placeholder) |

**Không dùng:** Next.js (WAR chỉ nhận file tĩnh), Redux (TanStack Query và Context đã đủ), CSS-in-JS khi chạy, thư viện UI nặng như MUI hay Ant Design (khó ra phong cách riêng), GSAP (Motion đã đủ; prototype có dùng nhưng bản thật bỏ để bớt một thư viện).

## 3. Cấu trúc thư mục

```text
frontend/
├─ index.html                 lang="vi", theme-color, preload font chính
├─ vite.config.ts             base './', alias '@' → src, proxy '/api' → http://localhost:8081, manualChunks (three)
├─ tsconfig.json              strict, noUncheckedIndexedAccess, paths '@/*'
├─ .env.example               mẫu biến môi trường (file .env.* thật bị .gitignore gốc bỏ qua)
├─ components.json            shadcn (tsx: true) + registry @magicui, @aceternity, @react-bits
├─ HANDOFF.md                 viết ở Prompt 16
├─ public/
│  ├─ mockServiceWorker.js    sinh bằng `npx msw init public`
│  ├─ photos/<slug>/…         ảnh thật đã tối ưu (tài liệu 06)
│  ├─ posters/…               ảnh tĩnh thay cảnh 3D (giảm chuyển động hoặc máy yếu)
│  └─ fonts/…                 font .woff cho chữ 3D (troika), nếu dùng
├─ scripts/
│  ├─ fetch-photos.mjs        tìm và tải ảnh Commons, ghi metadata giấy phép
│  ├─ optimize-photos.mjs     sharp: AVIF + WebP ở 480/960/1600 px, ảnh mờ tạm
│  └─ shots.mjs               Playwright chụp mọi route ở 2 kích thước
├─ tests/e2e/                 smoke test các luồng chính
└─ src/
   ├─ main.tsx                bật MSW (nếu VITE_USE_MOCKS) rồi mới render
   ├─ app/
   │  ├─ router.tsx           createHashRouter, lazy, errorElement
   │  ├─ routes.ts            danh sách route (dùng chung cho Navbar và script chụp ảnh)
   │  ├─ providers.tsx        QueryClient, AuthProvider, QualityProvider, Lenis, Toaster, TooltipProvider
   │  └─ layouts/             RootLayout (Navbar, Footer, chuyển trang), AccountLayout, SellerLayout, AdminLayout
   ├─ api/
   │  ├─ client.ts            hàm api(): gắn token, mở ApiResponse, ném ApiError, xử lý 401
   │  ├─ types.ts             kiểu khớp DTO Java (tài liệu 04)
   │  ├─ keys.ts              query keys
   │  └─ endpoints/           taxonomy.ts, species.ts, products.ts, auth.ts, me.ts, cart.ts, orders.ts, seller.ts, admin.ts
   │                          (mỗi file: hàm gọi + hook useQuery/useMutation)
   ├─ mocks/
   │  ├─ browser.ts           setupWorker
   │  ├─ seed.ts              dữ liệu chép đúng từ database/seed_data.sql
   │  ├─ db.ts                kho trong bộ nhớ (lưu localStorage, có nút reset)
   │  ├─ auth.ts              token giả, đọc người gọi từ header
   │  └─ handlers/            mỗi nhóm endpoint một file
   ├─ features/               mỗi tính năng có pages/, components/, hooks/ riêng
   │  ├─ home/  taxonomy/  species/  shop/  cart/  checkout/  orders/
   │  ├─ auth/  account/  seller/  admin/  credits/  system/   (system: 404, lỗi, offline)
   ├─ components/
   │  ├─ ui/                  thành phần nền (button, input, badge, dialog…)
   │  ├─ layout/              Navbar, Footer, PageHeader, Section, Container
   │  ├─ media/               Photo, Gallery, Lightbox, PhotoCredit
   │  ├─ motion/              BlurFade, Reveal, MaskText, Ticker, Magnetic, ScrollProgress
   │  ├─ domain/              IucnBadge, StatusPill, Price, SpeciesCard, ProductCard, TaxonPath, ClimateBar…
   │  └─ dev/                 DevPanel (chỉ ở chế độ dev)
   ├─ three/
   │  ├─ core/                QualityProvider, useCanvasInView, SceneShell (Canvas + Poster)
   │  ├─ particles/           ParticleMorph (engine), shapes.ts, shaders.ts
   │  ├─ earth/               BioEarth, landMask.ts, geo.ts, Coastlines, Graticule, Markers, Arcs, Atmosphere
   │  └─ helix/               HelixScene, HelixPanel
   ├─ content/
   │  ├─ species-extras.ts    dữ liệu riêng của frontend: nơi bản địa (lat/lng), nhóm, ảnh, điểm lấy nét
   │  ├─ photos.generated.ts  sinh bởi script ảnh: src, kích thước, tác giả, giấy phép
   │  └─ copy.ts              văn bản marketing dài (giữ tách khỏi component)
   ├─ lib/                    format (VND, ngày), iucn, parseEnvironmentSpecs, cn, slug
   └─ styles/                 tokens.css, globals.css
```

**Luật import:** `features/*` được import từ `components`, `api`, `three`, `lib` và `content`. `components/*` không import `features`. Hai feature không import lẫn nhau. Phần dùng chung thì đưa lên `components/domain`.

## 4. Luồng dữ liệu

```text
Component ─▶ hook (useSpecies, useAddToCart…) ─▶ api() ─▶ fetch('api/…')
                                                    │
                       dev, VITE_USE_MOCKS=true ────┼─▶ MSW handler ─▶ mocks/db.ts (dữ liệu seed)
                       khi nối thật ────────────────┴─▶ Vite proxy ─▶ Tomcat :8081 ─▶ SQL Server
```

- `api<T>(path, init)`:
  - Gắn `Authorization: Bearer <token>`.
  - Đọc `ApiResponse<T>`. `success: false` hoặc mã HTTP ≥ 400 thì ném `ApiError { status, code, message }`.
  - Gặp 401 thì xóa token, lưu trang hiện tại vào `?next=` rồi chuyển về `#/login`.
- `normalizePage()` chấp nhận cả mảng thường lẫn `{ items, page, size, total }`. Hiện backend trả mảng cho `/api/products`; sau này mới phân trang.
- Câu báo lỗi: ưu tiên `message` server trả về; không có thì tra `MESSAGES[code]` trong `lib/messages.ts`.
- TanStack Query:
  - `staleTime` 60 s cho dữ liệu bách khoa, 0 cho giỏ hàng và đơn hàng.
  - Sau khi thay đổi dữ liệu thì invalidate đúng key.
  - Giỏ hàng cập nhật lạc quan (optimistic) và có rollback.
- Đăng nhập: `AuthProvider` giữ `{ token, user, accountType, role }` trong `localStorage`. Đi kèm `RequireAuth`, `RequireRole` và `RequireSeller` (kiểm tra shop ACTIVE từ `GET /api/me`).

## 5. Quy ước code

- Component là hàm, tên dạng `PascalCase`, mỗi component chính một file. Props có kiểu rõ ràng, không dùng `any`.
- Trang chỉ ghép khối và gọi hook. Khối giao diện chỉ nhận props. Logic đặt trong hook hoặc `lib`.
- Class Tailwind theo thứ tự layout → khoảng cách → chữ → màu → hiệu ứng. Biến thể dùng `cva`. Không viết màu hex trong component: dùng token (`bg-surface`, `text-fg-2`, `text-accent`…).
- Chữ hiển thị viết thẳng trong JSX bằng tiếng Việt. Đoạn văn dài thì đặt trong `content/copy.ts`.
- Animation: tối đa 2 hiệu ứng nổi bật trên mỗi khung nhìn. Dùng token thời lượng và easing (tài liệu 02). Mọi animation tôn trọng `useReducedMotion()`.
- Đặt tên file: `kebab-case.tsx` cho component trong `components/ui`, `PascalCase.tsx` cho component khác (thống nhất theo shadcn).

## 6. Cổng chất lượng (npm scripts)

| Script | Làm gì |
|---|---|
| `dev` | Vite + MSW |
| `dev:api` | Vite, tắt MSW, proxy sang Tomcat 8081 (dùng khi nối API thật) |
| `build` / `preview` | Build ra `dist/` và chạy thử bản build |
| `typecheck` | `tsc --noEmit` |
| `lint` / `format` | oxlint / prettier |
| `test` | vitest: `lib/*`, `api/client`, handler MSW, parser |
| `e2e` | Playwright: luồng duyệt bách khoa → loài → sản phẩm → giỏ → đặt hàng; đăng sản phẩm; kiểm duyệt |
| `shots` | Chụp mọi route ở 1440×900 và 390×844 vào `.shots/` (thư mục này nằm trong `.gitignore`) |
| `photos:fetch` / `photos:build` | Script ảnh (tài liệu 06) |
| `check` | `typecheck && lint && test && build`, bắt buộc xanh trước khi báo xong |

## 7. Chia chunk và hiệu năng

- Mọi trang dùng `lazy()`. `vite.config.ts` gom `three`, `@react-three/*` và `postprocessing` vào chunk `three` riêng.
- Cảnh 3D được mount sau lần vẽ đầu tiên (`requestIdleCallback` hoặc khi khối đó lọt vào màn hình). Trong lúc chờ, hiện **poster** (ảnh tĩnh đúng khung cảnh đó) để không bị trống.
- Ảnh dùng `<picture>`: AVIF → WebP → JPEG, có `srcset`, khai báo `width` và `height` để không nhảy bố cục, `loading="lazy"` trừ ảnh LCP (ảnh LCP dùng `fetchpriority="high"`).
- Font: chỉ preload Be Vietnam Pro 400 và 600 (bộ chữ vietnamese và latin). Các font còn lại dùng `font-display: swap`.
- Danh sách dài (bảng admin) phân trang theo API, không render hơn 50 dòng một lúc.

## 8. Biến môi trường

`.gitignore` ở gốc repo (do SmartDrive quản lý, **không sửa**) bỏ qua mọi file `.env.*` trừ `.env.example`. Vì vậy code phải tự có giá trị mặc định đúng khi không có file env:

```ts
// src/lib/env.ts
export const USE_MOCKS = import.meta.env.VITE_USE_MOCKS != null
  ? import.meta.env.VITE_USE_MOCKS === 'true'
  : import.meta.env.DEV                       // mặc định: dev bật mock, build tắt mock
```

`npm run dev:api` đặt `VITE_USE_MOCKS=false` ngay trong script (`vite --mode api` kèm `.env.api` cục bộ, hoặc dùng `cross-env`).

| Biến | Dev | Build nộp | Ý nghĩa |
|---|---|---|---|
| `VITE_USE_MOCKS` | không đặt (tức `true`) | không đặt (tức `false`) | Bật MSW |
| `VITE_MOCK_LATENCY` | `350` | — | Độ trễ giả (ms), chỉnh được trong DevPanel |
| `VITE_API_BASE` | `api/` | `api/` | Luôn là đường dẫn tương đối |

## 9. Ghi chú cho vấn đáp

`docs/PLAN.md` ban đầu chọn "CSS thuần". Vì giao diện do AI làm và cần hiệu ứng cao cấp, bản này đổi sang Tailwind, TypeScript, MSW và three.js. Những điểm chủ dự án nên giải thích được: `api()` và vòng đời token, vì sao dùng `HashRouter` và `base './'`, vì sao MSW giúp làm giao diện trước, cách giao diện dùng `available` và `maxQuantity` của giỏ hàng. `HANDOFF.md` sẽ tóm tắt những điểm này.
