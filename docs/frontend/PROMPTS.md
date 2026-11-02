# Chuỗi prompt dựng giao diện BioNexus bằng Antigravity

**17 prompt (00 → 16)** chạy theo thứ tự, cộng 4 prompt dùng lúc cần (S1–S4).

**Cách chạy mỗi prompt:**
1. Mở một **cuộc hội thoại mới** trong Antigravity, workspace là thư mục gốc repo `BioNexus/`.
2. Chọn model (ví dụ Gemini 4 Argon) và bật **chế độ lập kế hoạch (Planning)**.
3. Dán **nguyên khối** trong ô ```` ```text ```` vào.
4. Đọc kế hoạch agent đưa ra. Thấy ổn thì cho chạy, chưa ổn thì sửa kế hoạch trước.
5. Agent làm xong thì kiểm tra theo mục **"Bạn kiểm tra"** dưới mỗi prompt. Ổn thì tự commit. Chưa ổn thì dùng **S1**.

**Trước khi bắt đầu:**
- Repo đã clone về ổ hệ thống (máy Mac, không phải ổ exFAT). Đã cài Node 22 LTS trở lên.
- Đã đọc lướt `docs/frontend/README.md`.
- Mỗi prompt tốn khoảng 1–3 giờ agent làm, tuỳ độ khó. Prompt 08, 09 và 11 nặng nhất.

**Nếu gấp hạn nộp**, đổi thứ tự để 5 thứ "không được cắt" của PLAN có giao diện trước, rồi mới làm phần 3D:

1. 00 → 01 → 03 → 04 → 05 (nền móng)
2. 12 → 13 (mua hàng) → 14 (đăng nhập, người bán) → 15 (kiểm duyệt) → 10 → 11 (bách khoa)
3. 02 (ảnh thật) → 06 → 07 → 08 → 09 (trang chủ 3D)
4. 16 (hoàn thiện)

Trong lúc chưa có ảnh thật (Prompt 02), agent dùng tạm 9 ảnh trong `docs/ui-mockups/assets/` và **ghi chú phải thay**.

---

## Prompt 00 · Định hướng (không code)

```text
Bạn là kỹ sư frontend cấp cao kiêm designer chuyển động, nhận dự án BioNexus (đồ án sàn sinh vật cảnh kèm bách khoa phân loại sinh vật).

Hôm nay CHƯA viết code. Hãy:
1. Đọc AGENTS.md, rồi đọc kỹ toàn bộ docs/frontend/ (README, 01→06, PROMPTS.md, reference/prototype-code.md) và xem 12 ảnh trong docs/frontend/reference/screens/.
2. Đọc docs/PLAN.md (mục 4, 5, 6, 8), database/seed_data.sql và các DTO trong backend/src/main/java/com/bionexus/backend/dto/ để hiểu dữ liệu thật. KHÔNG sửa các file này.
3. Viết một artifact "Bản hiểu dự án" (tiếng Việt, tối đa 2 trang) gồm:
   - tóm tắt sản phẩm, vai trò người dùng và 24 route;
   - hướng thiết kế mẫu R, nói bằng lời của bạn: điều gì làm nó đẹp, điều gì phải giữ;
   - các rủi ro kỹ thuật lớn nhất (3D, MSW, ảnh, hiệu năng) và cách bạn sẽ xử lý;
   - các điểm trong tài liệu còn mơ hồ hoặc mâu thuẫn, kèm câu hỏi cho chủ dự án (nếu có).
Không tạo file nào trong repo.
```

**Bạn kiểm tra:** agent hiểu đúng "giao diện trước, nối API sau" và nêu được mẫu R. Trả lời các câu hỏi nó đặt ra (nếu có) trước khi sang Prompt 01.

---

## Prompt 01 · Khởi tạo dự án frontend

```text
Nhiệm vụ: khởi tạo dự án frontend/ cho BioNexus đúng kiến trúc trong docs/frontend/01-kien-truc.md. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/01-kien-truc.md (toàn bộ); docs/frontend/02-he-thong-thiet-ke.md mục 2–4, 6.

LÀM:
1. Tạo dự án Vite + React 19 + TypeScript strict trong frontend/ (thư mục đang chỉ có .gitkeep; giữ nguyên file đó). Cài các thư viện ở bảng "Stack và lý do" trong tài liệu 01. Dùng bản mới nhất cùng major; gặp xung đột thì về đúng bản ghi trong bảng.
2. vite.config.ts: base './', alias '@' → src, proxy '/api' → http://localhost:8081, manualChunks tách 'three' (three, @react-three/*, postprocessing, maath) ra chunk riêng. tsconfig: strict, noUncheckedIndexedAccess, paths '@/*'.
3. Tailwind v4 qua @tailwindcss/vite. Tạo src/styles/tokens.css (ĐỦ token màu, bo góc, IUCN, trạng thái của tài liệu 02) và globals.css (map token sang Tailwind bằng @theme inline, nền tối, lớp nhiễu 3%, focus ring, prefers-reduced-motion). Font tự host bằng @fontsource: Be Vietnam Pro (300–700, các subset vietnamese, latin, latin-ext), Cormorant Garamond (500, 500 italic, 600), JetBrains Mono (400, 500).
4. src/lib/motion.ts chứa token chuyển động (dur, ease, spring) đúng tài liệu 02 mục 6.
5. shadcn CLI (tsx: true, Tailwind v4) và components.json có registry @magicui (https://magicui.design/r/{name}.json), @aceternity (https://ui.aceternity.com/registry/{name}.json), @react-bits (https://reactbits.dev/r/{name}.json). Chưa cần thêm component.
6. Router: src/app/routes.ts liệt kê ĐỦ 24 route + /dev/ui của tài liệu 03 mục 0 (path, tiêu đề, quyền, layout, có 3D hay không). src/app/router.tsx dùng createHashRouter + lazy. Mỗi trang tạm là một placeholder đẹp: eyebrow, tiêu đề tiếng Việt và mô tả một dòng lấy từ tài liệu 03. Có 4 layout: Root, Auth, Account/Seller (sidebar), Admin. Trang 404 tạm.
7. src/app/providers.tsx: QueryClientProvider, Lenis (tôn trọng reduced motion; khi đổi route thì cuộn về đầu), Toaster (sonner, theme tối), TooltipProvider. AuthProvider để khung rỗng, Prompt 03 sẽ hoàn thiện.
8. DevPanel (src/components/dev/DevPanel.tsx, chỉ có ở chế độ dev): nút nổi góc dưới trái, mở ra bảng có các mục để trống (Tài khoản, Mock, 3D, Chuyển động). Các prompt sau sẽ điền nội dung.
9. Scripts trong package.json: dev, dev:api, build, preview, typecheck, lint (oxlint), format (prettier), test (vitest + jsdom), e2e (playwright), shots, check. Tạo scripts/shots.mjs: Playwright chụp mọi route trong routes.ts ở 1440×900 và 390×844, lưu vào .shots/<ngày-giờ>/. Thêm .shots vào .gitignore của frontend.
10. src/lib/env.ts theo tài liệu 01 mục 8 (USE_MOCKS mặc định: dev bật, build tắt, vì .gitignore gốc bỏ qua mọi file .env.*; KHÔNG sửa .gitignore gốc). Tạo frontend/.env.example ghi các biến VITE_USE_MOCKS, VITE_MOCK_LATENCY=350. Script dev:api chạy Vite với VITE_USE_MOCKS=false.
11. index.html: lang="vi", <title>BioNexus · Bách khoa sinh học và sàn sinh vật cảnh</title>, meta description, theme-color #030807, favicon SVG logo (hai sợi xoắn cách điệu màu #6ee7b7, tự vẽ).

KHÔNG LÀM: chưa làm component đẹp, chưa làm 3D, chưa có MSW (Prompt 03), chưa tải ảnh (Prompt 02).

XONG KHI:
- npm run check xanh; npm run dev mở được, mọi route trong routes.ts vào được, F5 ở #/species/1 không lỗi;
- npm run shots chụp đủ route ở 2 kích thước;
- npm run build ra dist/ có đường dẫn tương đối (mở dist/index.html qua `npx vite preview` vẫn chạy);
- walkthrough có ảnh 3 route bất kỳ và cây thư mục đã tạo.
```

**Bạn kiểm tra:** `npm run dev`, bấm qua vài route; nền tối, font tiếng Việt hiện đúng dấu. Commit.

---

## Prompt 02 · Ảnh thật (lấy, chọn, tối ưu, ghi nguồn)

```text
Nhiệm vụ: xây kho ảnh thật cho BioNexus đúng docs/frontend/06-anh-that.md. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/06-anh-that.md (toàn bộ); docs/frontend/04-hop-dong-api-va-mock.md mục 7 (slug, nơi bản địa); database/seed_data.sql (9 loài, 10 sản phẩm).

LÀM:
1. scripts/photo-plan.json cho 9 loài (hero, portrait, gallery 4–6, habitat), 10 sản phẩm (đúng biến thể nếu tìm được) và 6–10 ảnh không khí. Truy vấn và category theo bảng trong tài liệu 06.
2. scripts/fetch-photos.mjs: gọi Wikimedia Commons API (header User-Agent đúng mẫu; tối đa 1 request mỗi giây; thử lại khi gặp 429), lọc giấy phép và kích thước, tải 3–4 ứng viên cho mỗi vai trò vào scripts/.photo-candidates/<slug>/ kèm candidates.json đủ metadata. Thêm .photo-candidates vào .gitignore.
3. Tự XEM từng ứng viên (mở ảnh), đối chiếu đúng loài theo tên khoa học, chọn ảnh tốt nhất cho từng vai trò rồi ghi scripts/photo-selection.json (focus, alt tiếng Việt, flip, lý do loại ảnh khác).
4. DỪNG LẠI, tạo artifact "Bảng duyệt ảnh": mỗi loài và mỗi sản phẩm một hàng, gồm ảnh nhỏ đã chọn, tên file gốc, tác giả, giấy phép, link gốc. Hỏi chủ dự án duyệt. Chỉ làm tiếp khi được đồng ý. Ảnh nào bị chê thì chọn lại.
5. scripts/optimize-photos.mjs (sharp): AVIF và WebP ở 480/960/1600 (hero thêm 2400), JPEG dự phòng, ảnh mờ tạm, xuất vào public/photos/<slug>/ và sinh src/content/photos.generated.ts đúng kiểu ở tài liệu 06 mục 3.4. Thêm script npm photos:fetch, photos:build.
6. src/content/species-extras.ts: 9 loài (slug, group, origin, hero, gallery, habitat, focus) đúng tài liệu 04 mục 7. Thêm vị trí 2 shop ACTIVE.
7. Component src/components/media/Photo.tsx (<picture>, srcset, sizes, ảnh mờ tạm, mờ dần khi tải xong, objectPosition, priority/fetchpriority), PhotoCredit.tsx (chip khi hover, nút i trên mobile), Gallery.tsx (masonry) và Lightbox.tsx (phím ←/→/Esc, focus trap, có nguồn ảnh).
8. Trang /credits đúng tài liệu 03 mục 15, nhóm theo loài.

KHÔNG LÀM: không dùng ảnh AI; không hotlink; không dùng ảnh trong docs/ui-mockups/assets nếu chưa tìm được bản gốc kèm giấy phép.

XONG KHI:
- mỗi loài có ít nhất 1 hero, 1 portrait, 4 gallery; mỗi sản phẩm có ảnh (đúng biến thể hoặc ảnh loài);
- public/photos ≤ 30 MB; trang /credits đủ thông tin; npm run check xanh;
- walkthrough có ảnh chụp /credits và bảng duyệt ảnh đã được đồng ý.
```

**Bạn kiểm tra:** xem kỹ bảng duyệt ảnh, chê thẳng ảnh nào xấu hoặc sai loài. Ảnh là thứ quyết định độ "xịn". Commit.

---

## Prompt 03 · Hợp đồng API, MSW và dữ liệu giả từ seed

```text
Nhiệm vụ: xây lớp dữ liệu hoàn chỉnh. src/api (client, types, hooks) + src/mocks (MSW giả lập đúng backend). Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/04-hop-dong-api-va-mock.md (TOÀN BỘ, đây là nguồn chân lý); docs/frontend/01-kien-truc.md mục 4; docs/PLAN.md mục 4–6; database/seed_data.sql; các DTO Java trong backend/.../dto/.

LÀM:
1. src/api/types.ts: chép đúng các kiểu ở tài liệu 04 mục 2 (giữ cả imageURL lẫn imageUrl; trường ◇ để optional).
2. src/api/client.ts: api<T>() gắn token, mở ApiResponse, ném ApiError {status, code, message}, xử lý 401 (xoá token, chuyển #/login?next=). normalizePage(). lib/messages.ts map đủ MessageKey ở PLAN mục 4.1 sang câu tiếng Việt.
3. src/api/endpoints/*.ts cho mọi endpoint ở tài liệu 04 mục 3: hàm gọi thuần + hook TanStack Query + key. Mutation giỏ hàng optimistic có rollback. Invalidate đúng key như tài liệu 04 mục 8.
4. src/api/adapters.ts: toSpeciesView, toProductView. lib/parseEnvironmentSpecs.ts kèm test cho đủ 9 chuỗi trong seed.
5. src/mocks/seed.ts: chép ĐÚNG seed_data.sql (7 user, 5 admin, 5 shop, 25 nút, 9 loài, 10 sản phẩm, 3 đơn + 5 dòng đơn, 2 giỏ + 4 món), gán id theo thứ tự xuất hiện. db.ts (lưu localStorage, resetDb), auth.ts (token giả, requireUser, requireAdmin), faults.ts, handlers/ cho mọi endpoint, theo ĐÚNG luật nghiệp vụ ở tài liệu 04 mục 4 (đăng nhập, khoá tài khoản, giỏ hàng, đặt hàng kiểu transaction, kiểm duyệt, phân trang, tìm không dấu). Thêm endpoint ◇ GET api/species?nodeId=&q=.
6. main.tsx: bật worker khi USE_MOCKS (src/lib/env.ts) là true (serviceWorker url './mockServiceWorker.js', onUnhandledRequest 'bypass'); `npx msw init public`.
7. AuthProvider hoàn chỉnh (token và user trong localStorage, login, adminLogin, register, logout, refetch me), RequireAuth, RequireRole, RequireSeller. Gắn vào router.
8. DevPanel › Tài khoản: nút đăng nhập nhanh cho 12 tài khoản seed (ghi kỳ vọng của từng tài khoản bên cạnh). DevPanel › Mock: thanh trượt độ trễ, nút giả lỗi (500, 401, 409, mạng chậm) cho request kế tiếp, nút "Reset dữ liệu".
9. Test (vitest + msw/node): các luật quan trọng: đăng nhập (đúng, sai, BANNED, INACTIVE), giỏ (cộng dồn, vượt kho, hàng của chính mình), đặt hàng (thành công trừ kho và xoá giỏ; phamthid nhận 409 và không đổi gì), kiểm duyệt (biologist1 bị 403; moderator duyệt xong thì sản phẩm hiện ở danh sách công khai), "đáp án" ở tài liệu 04 mục 6.

KHÔNG LÀM: không đổi tên trường so với DTO Java; không sửa backend; chưa làm giao diện các trang (chỉ cần một trang /dev/ui tạm in JSON để thử hook).

XONG KHI:
- toàn bộ test xanh; npm run check xanh;
- trong trình duyệt: đăng nhập nhanh levanc → GET api/cart ra 2 món, subtotal 2950000; phamthid → đặt hàng ra 409;
- walkthrough có bảng endpoint × trạng thái mock và kết quả test.
```

**Bạn kiểm tra:** đọc `src/api/types.ts` xem đã khớp DTO Java bạn đang viết chưa. Đây là chỗ bạn sẽ nối API sau này. Commit.

---

## Prompt 04 · Hệ thống thiết kế và thư viện component

```text
Nhiệm vụ: dựng toàn bộ thành phần nền và thành phần nghiệp vụ, kèm trang xem thử #/dev/ui. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/02-he-thong-thiet-ke.md (TOÀN BỘ); docs/frontend/05-3d-va-chuyen-dong.md mục 5; xem ảnh docs/frontend/reference/screens/ để bắt đúng thần thái (kính tối, chữ to, ảnh thật, viền mảnh, glow xanh ngọc).

LÀM:
1. components/ui (dựa trên shadcn + Radix, tự chỉnh theo token): Button (primary, secondary, ghost, danger, icon; sm/md/lg; loading), Input, Textarea, Select, Combobox, NumberStepper, Checkbox, RadioCard, Switch, Slider, Tabs, SegmentedControl (layoutId), Dialog, Sheet, Popover, Tooltip, DropdownMenu, Skeleton, Pagination, Breadcrumb, Badge, Kbd.
2. components/motion: BlurFade, MaskText (tách theo dòng), Ticker (animate(), không dùng spring), Reveal, Magnetic (tắt khi reduced motion), Beam (AnimatedBeam bằng SVG có gradient chạy), ZoomReveal, StickySteps, FlyToCart, Slideshow (Ken Burns + vòng tròn mở). Lấy Magic UI, Aceternity hoặc React Bits làm gốc nếu phù hợp, rồi chỉnh theo token.
3. components/domain: IucnBadge (chấm, mã, nhãn; cỡ sm/md/lg), StatusPill, Price (Intl vi-VN VND), TaxonPath (6 cấp; dọc, ngang, gọn; tên khoa học in nghiêng ở Chi và Loài), SpeciesCard, ProductCard (ảnh 4:5, đổi sang ảnh thứ 2 khi hover, SOLD_OUT thang xám, nút thêm nhanh), ShopChip, ClimateBar (dùng parseEnvironmentSpecs), StatTile (Ticker), SectionHeading, EmptyState (có ảnh mờ), ErrorState (nút thử lại), CommandPalette (khung giao diện; dữ liệu nối ở Prompt 05).
4. Trang #/dev/ui: mỗi component một khối, đủ biến thể và trạng thái (loading, disabled, lỗi, rỗng), dùng ảnh thật từ content/photos.
5. Truy cập: focus ring, aria, vùng bấm ≥ 44 px, kiểm tra tương phản bằng axe (@axe-core/playwright) trên #/dev/ui.

KHÔNG LÀM: không dùng màu hex trong component (chỉ token); không thêm hiệu ứng ngoài danh sách mẫu chuyển động của tài liệu 02.

XONG KHI:
- #/dev/ui đẹp và nhất quán ở 1440 và 390; axe không có lỗi mức serious hoặc critical; npm run check xanh;
- walkthrough có ảnh chụp toàn trang #/dev/ui.
```

**Bạn kiểm tra:** mở `#/dev/ui`, đây là "bảng màu" của cả web. Chỗ nào chưa hợp gu thì sửa ngay ở đây bằng S1, trước khi dựng trang. Commit.

---

## Prompt 05 · Khung trang: Navbar, Footer, ⌘K, chuyển trang, trang lỗi

```text
Nhiệm vụ: hoàn thiện khung chung của web. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/03-so-do-trang.md mục 0, 1, 14 (phần layout), 15; docs/frontend/02-he-thong-thiet-ke.md mục 6 (chuyển trang) và 10.

LÀM:
1. Navbar đúng tài liệu 03 mục 1:
   - nav dạng viên thuốc nổi (layoutId);
   - mega menu "Khám phá" có ảnh thật;
   - nút ⌘K, giỏ có số món (từ useCart), menu tài khoản theo vai trò;
   - trong suốt ở trang chủ và hồ sơ loài, thành kính mờ sau 80 px, ẩn khi cuộn xuống và hiện khi cuộn lên;
   - mobile: Sheet toàn màn hình, liệt kê mục bằng chữ to.
2. Footer 4 cột: chú giải IUCN, công tắc "Giảm chuyển động" và "Chất lượng 3D" (lưu localStorage), chữ BIONEXUS lớn (tạm là chữ gradient; Prompt 06 thay bằng hạt).
3. CommandPalette (⌘K / Ctrl K): tìm loài và sản phẩm không phân biệt dấu (dùng api/species và api/products); kết quả có ảnh nhỏ, IUCN, giá; có lối tắt tới trang; điều khiển được bằng bàn phím.
4. Chuyển trang: mẫu số 8 ở tài liệu 02. Khôi phục vị trí cuộn khi bấm back. Link "Bỏ qua tới nội dung chính".
5. AccountLayout và SellerLayout (sidebar desktop, tabs mobile), AdminLayout (sidebar ẩn mục theo vai trò, thanh trên có huy hiệu vai trò).
6. Trang 403, 404 (tạm là chữ lớn; Prompt 06 thay bằng hạt), errorElement (chi tiết lỗi chỉ hiện ở chế độ dev), băng offline.
7. Hook useDocumentTitle: mỗi route có tiêu đề tab "… · BioNexus".

XONG KHI:
- điều hướng toàn site mượt; ⌘K tìm "python" ra 2 loài + 1 sản phẩm; Tab đi hết navbar được;
- đăng nhập nhanh moderator1 thấy menu quản trị đúng, biologist1 không thấy mục duyệt;
- npm run check xanh; walkthrough có ảnh navbar ở 3 trạng thái và ảnh mobile menu.
```

**Bạn kiểm tra:** cảm giác điều hướng giữa các trang (chuyển cảnh, navbar ẩn/hiện). Commit.

---

## Prompt 06 · Engine 3D: chất lượng, SceneShell, hạt biến hình

```text
Nhiệm vụ: dựng nền tảng 3D dùng chung và engine hạt biến hình (Q nâng cấp). Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/05-3d-va-chuyen-dong.md mục 1, 2, 6; docs/frontend/reference/prototype-code.md mục 1 (Genesis.jsx, đọc kỹ shader và các bài học ở đầu file); ảnh screens/r-01 → r-05.

LÀM:
1. three/core: QualityProvider (nhận diện mức high, medium, low, static như bảng; PerformanceMonitor tự hạ mức; người dùng chọn tay ở footer và DevPanel), SceneShell (poster trước, mount khi vào khung nhìn và trình duyệt rảnh, unmount khi ra xa, mờ poster khi khung đầu đã vẽ), useSectionProgress (motion value + ref, không setState mỗi lần cuộn).
2. three/particles: ParticleMorph đúng API ở mục 2.1, shader đúng mục 2.2 (stagger, xoáy giữa chừng, thở, uPush tắt dần, sóng khi bấm, aLand, màu theo chương, mờ theo độ sâu), shapes.ts (galaxy, dnaHelix, leaf, text(word) chờ font). Stars (chỉ đặt phía sau, texture tròn). Rig (camera lệch theo chuột).
3. Trang #/dev/3d: thanh trượt tiến độ 0→3 để xem từng hình, chọn mức chất lượng, hiện FPS (stats-gl).
4. Footer: thay chữ BIONEXUS bằng ParticleMorph (một hình text, 6.000 hạt, chỉ ở mức high; mức khác giữ chữ gradient).
5. Trang 404: ParticleMorph với hình chữ "404" (mức high), đẩy hạt theo chuột.
6. DevPanel › 3D: mức chất lượng, FPS, bật hoặc tắt bloom.

XONG KHI:
- #/dev/3d chạy ≥ 58 FPS ở mức high trên Apple Silicon (ghi số đo vào walkthrough);
- đổi hình mượt, không có lỗ thủng khi chuột đứng yên, không có sao vuông;
- chunk three không bị tải ở #/products (kiểm tra tab Network); reduced motion hiện poster hoặc chữ tĩnh;
- npm run check xanh.
```

**Bạn kiểm tra:** mở `#/dev/3d`, kéo thanh tiến độ. Đây là "Q nâng cấp". Thử bật giảm chuyển động. Commit.

---

## Prompt 07 · Hành tinh BioNexus (ghép địa cầu hạt và địa cầu vẽ)

```text
Nhiệm vụ: dựng component BioEarth, quả địa cầu ghép giữa hạt (mẫu Q) và nét vẽ (mẫu K), dùng được ở trang chủ, bách khoa (chế độ bản đồ) và hồ sơ loài (bản mini). Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/05-3d-va-chuyen-dong.md mục 3 (TOÀN BỘ) và 6; docs/frontend/04-hop-dong-api-va-mock.md mục 7 (toạ độ nơi bản địa, vị trí shop); reference/prototype-code.md mục 5 (công thức lấy nét của cobe); ảnh screens/r-02 và r-07.

LÀM:
1. three/earth/geo.ts (latLngToVec3, slerp đường lớn, nâng cao cung), landMask.ts (world-atlas land-110m + topojson-client + d3-geo → mặt nạ; buildEarthPoints memo, mục tiêu < 60 ms).
2. Các lớp đúng bảng ở mục 3.1: Core (fresnel, che mặt sau), lớp hạt bề mặt (dùng chung shader ParticleMorph với aLand), Coastlines (tự vẽ dần qua uDraw), Graticule, Atmosphere, Markers (màu IUCN, vòng xung, cột sáng, Html ảnh nhỏ cho loài đang chọn, mờ khi ở mặt sau), Arcs (từ nơi bản địa tới shop đang bán loài đó, dải sáng chạy dọc; loài chưa có shop thì nét đứt), vành quỹ đạo (chỉ ở mức high).
3. EarthController đúng mục 3.4: xoay tới loài bằng quaternion, kéo để xoay (giới hạn pitch), không zoom bằng lăn chuột, tự đổi loài mỗi 5 s khi rảnh, có prop focusIndex và onSelect.
4. Hai biến thể: <BioEarth variant="full" species={...} focus=... /> và <BioEarth variant="mini" species={one} /> (12.000 hạt, 1 marker, 1 cung).
5. Nội dung chữ thay thế cho canvas (aria-hidden): danh sách loài kèm nơi bản địa, dạng DOM.
6. Trang #/dev/earth: chọn loài, bật hoặc tắt từng lớp, thanh trượt uDraw, đổi variant, FPS.

XONG KHI:
- nhìn rõ hình châu lục (Á, Phi, Mỹ, Úc, Âu) bằng cả hạt lẫn nét bờ biển; đúng vị trí 9 loài (axolotl ở Mexico, Rajah ở Borneo…); cung bay về TP.HCM và Đà Nẵng;
- chọn loài thì địa cầu xoay mượt tới loài đó; ≥ 58 FPS ở mức high;
- ảnh chụp đẹp hơn rõ so với screens/r-07 (quả cầu cobe cũ); npm run check xanh.
```

**Bạn kiểm tra:** mở `#/dev/earth`. Đây là điểm bạn yêu cầu ghép hai quả địa cầu. Góp ý màu và độ dày hạt ngay bây giờ. Commit.

---

## Prompt 08 · Trang chủ, phần 1: Khởi nguồn → Hành tinh BioNexus

```text
Nhiệm vụ: dựng khối 1–2 của trang chủ. Hạt biến hình chạy suốt 4 chương rồi trở thành Hành tinh BioNexus tương tác, trong cùng một canvas. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/03-so-do-trang.md mục 2 (bảng khối, mobile, xong khi); docs/frontend/05-3d-va-chuyen-dong.md mục 2, 3.3, 3.4; reference/prototype-code.md mục 1 và 3 (Mix.jsx: Genesis, header theo khối); ảnh screens/r-01 → r-05 và r-07.

LÀM:
1. features/home/sections/Genesis.tsx: khối dính 520vh + 300vh (tổng cộng như tài liệu 03), một SceneShell chứa ParticleMorph (galaxy → dnaHelix → leaf → earthSurface) và các lớp BioEarth hiện dần sau tiến độ 3.0 (mục 3.3).
2. Chữ theo chương ở bên trái (chương 0 là hero có H1 gradient, 2 nút, dòng gợi ý; các chương 1–3 như tài liệu 03). Số liệu (25 bậc, 9 loài) LẤY TỪ DỮ LIỆU, không viết cứng. Chấm tiến độ dọc bên phải. Dùng motion value, không setState mỗi frame.
3. Đoạn Hành tinh: danh sách 9 loài bên trái (ảnh nhỏ, tên, nơi bản địa, chấm IUCN, thanh tiến độ khi đang chọn), thẻ loài ảnh thật bên phải dưới (BlurFade khi đổi loài), câu dẫn "Nhân giống tại Việt Nam, gốc gác khắp thế giới". Cuộn chia đều cho 9 loài; bấm một loài thì cuộn tới đoạn của loài đó (lenis.scrollTo).
4. Header của trang chủ: nav đánh dấu khối đang xem (như Mix.jsx), navbar trong suốt.
5. Mobile và mức low: theo tài liệu 03 mục 2 (số hạt theo mức chất lượng, chữ dưới canvas, chip ngang, sheet ở đáy). Static: poster + nội dung chữ đầy đủ.

XONG KHI:
- cuộn từ đầu tới hết khối 2 mượt ≥ 55 FPS (Apple Silicon), không giật lúc hạt "đáp" xuống địa cầu;
- chữ không đè lên phần quan trọng của cảnh; ở 390 px vẫn đẹp;
- so với screens/r-01…r-05, r-07: cùng tinh thần, phần địa cầu đẹp hơn rõ; npm run check xanh;
- walkthrough có 8 ảnh chụp ở các mốc cuộn và số FPS.
```

**Bạn kiểm tra:** cuộn trang chủ thật chậm rồi thật nhanh. Thử rê chuột, bấm chuột tạo sóng, chọn loài. Commit.

---

## Prompt 09 · Trang chủ, phần 2: một loài → chuỗi xoắn → quy trình → mua sắm

```text
Nhiệm vụ: dựng khối 3–9 của trang chủ. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/03-so-do-trang.md mục 2 (khối 3–9); docs/frontend/05-3d-va-chuyen-dong.md mục 4, 5; reference/prototype-code.md mục 2 (Helix.jsx) và 4 (Story.jsx: ZoomReveal, StickySteps, Panel); ảnh screens/r-06, r-08 → r-12.

LÀM:
1. Khối 3 ZoomReveal: ảnh hero axolotl thật, dữ liệu loài lấy từ API (IUCN CR, mô tả, đường phân loại).
2. Khối 4 Khí hậu: ClimateBar cho 9 loài (parseEnvironmentSpecs), có ảnh nhỏ, màu theo nhóm, thanh mọc lệch nhau.
3. Khối 5 HelixScene (three/helix): đúng mục 4 (ảnh thật 960 WebP, sợi sáng, camera theo cuộn, loài đang xem, Suspense, lấy trước texture). Panel kính đổi theo loài (IUCN, 6 bậc, sản phẩm đang bán + nút thêm vào giỏ thật qua useAddToCart). Mức low hoặc mobile thì là carousel.
   QUAN TRỌNG: khối 1–2 và khối 5 không bao giờ cùng mount Canvas.
4. Khối 6 Quy trình (StickySteps): 5 bước. Panel "paper island" minh hoạ bằng DỮ LIỆU MOCK THẬT (cây phân loại của Nepenthes rajah; 4 shop với trạng thái thật; sản phẩm PENDING "Rồng Úc Hypo Baby (2 tháng tuổi)" chuyển sang APPROVED; giỏ có cảnh báo "Kho chỉ còn 3").
5. Khối 7 Đang bán (hàng ngang kéo được, chip lọc nhóm, ProductCard, FlyToCart), khối 8 Cửa hàng uy tín (2 shop ACTIVE, ghép 3 ảnh), khối 9 Kết (số liệu từ dữ liệu, ảnh so le, glow).

XONG KHI:
- cuộn toàn trang chủ mượt, đúng thứ tự 9 khối; thêm vào giỏ từ khối 5 và 7 thì icon giỏ tăng;
- so với screens/r-06, r-08…r-12: cùng tinh thần, nhiều ảnh thật hơn; mobile 390 đẹp;
- Lighthouse (bản preview): Accessibility ≥ 95; npm run check xanh; walkthrough có ảnh toàn trang.
```

**Bạn kiểm tra:** trang chủ là bộ mặt của đồ án. Xem trên cả máy Mac lẫn điện thoại. Commit.

---

## Prompt 10 · Cây phân loại và Bách khoa loài

```text
Nhiệm vụ: dựng /taxonomy, /taxonomy/:id và /species. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/03-so-do-trang.md mục 3 và 4; docs/frontend/04-hop-dong-api-va-mock.md (taxonomy, species ◇); docs/frontend/05-3d-va-chuyen-dong.md mục 3.4 (BioEarth chế độ rảnh) và 4.

LÀM:
1. Cây phân loại:
   - Miller columns có tia sáng Beam nối cột, chồng ảnh loài mỗi nhánh, panel tóm tắt dính;
   - URL #/taxonomy/:id đồng bộ, back được; công tắc chế độ "Chuỗi xoắn 3D" (HelixScene lọc theo nhánh);
   - quy ước in nghiêng: chỉ cấp Chi và Loài;
   - breadcrumbs lọc trùng chính nút đang xem; mobile kiểu drill-down.
2. Bách khoa loài:
   - hero có 5 ô IUCN (Ticker, bấm để lọc); thanh lọc dính (tìm không dấu, nhóm, IUCN, sắp xếp) đồng bộ với URL query;
   - lưới SpeciesCard; công tắc chế độ Bản đồ (BioEarth full, lazy, danh sách đồng bộ với marker); hỗ trợ ?node=.
3. Trạng thái rỗng, lỗi, 404 đúng tài liệu 03.

XONG KHI:
- Animalia → … → Python ra 2 loài; Squamata có 3 họ; lọc VU ra 3 loài; chế độ bản đồ đủ 9 marker;
- mobile 390 dùng được; npm run check xanh; walkthrough có ảnh 2 chế độ xem của mỗi trang.
```

**Bạn kiểm tra:** duyệt cây bằng chuột và bằng bàn phím. Commit.

---

## Prompt 11 · Hồ sơ loài

```text
Nhiệm vụ: dựng /species/:id, trang "tạp chí khoa học" của từng loài. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/03-so-do-trang.md mục 5; docs/frontend/02-he-thong-thiet-ke.md mục 3, 7; docs/frontend/05-3d-va-chuyen-dong.md mục 3.4 (variant mini); docs/frontend/06-anh-that.md mục 4.

LÀM:
1. Hero toàn màn hình bằng ảnh thật: MaskText cho tên, serif italic cho tên khoa học, IucnBadge lớn, TaxonPath gọn, parallax và mờ chữ khi cuộn, chip nguồn ảnh.
2. Bento: ClimateBar, độ ẩm, môi trường (kèm ảnh môi trường sống), Nơi bản địa (BioEarth mini, lazy; mức low thì là ảnh tĩnh), thang IUCN 7 mức, nguồn GBIF.
3. Mô tả kèm trích dẫn lớn; Gallery masonry + Lightbox; đường phân loại dọc có Beam (link từng nút); Đang bán (ProductCard hoặc rỗng); Cùng chi hoặc họ.
4. Navbar trong suốt trên hero; mobile đúng tài liệu.

XONG KHI:
- đủ 9 loài đẹp, không loài nào vỡ bố cục hay thiếu ảnh (chụp cả 9 ở 1440 và 390);
- Axolotl: nhiệt 14–18°C, CR, 1 sản phẩm; Trăn đất: không có sản phẩm (REJECTED) → trạng thái rỗng đẹp;
- npm run check xanh.
```

**Bạn kiểm tra:** đây là trang khoe ảnh thật nhiều nhất. Mở cả 9 loài. Commit.

---

## Prompt 12 · Cửa hàng và chi tiết sản phẩm

```text
Nhiệm vụ: dựng /products và /products/:id. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/03-so-do-trang.md mục 6, 7; docs/frontend/04-hop-dong-api-va-mock.md (products, cart, luật giỏ hàng).

LÀM:
1. Cửa hàng:
   - đầu trang có Ticker tổng số; dải nổi bật 3 sản phẩm (ken-burns);
   - cột lọc (Sheet trên mobile): q và speciesId gọi API, các lọc khác lọc ở client và đánh dấu TODO cho HANDOFF; đồng bộ URL;
   - lưới ProductCard, sắp xếp, phân trang (normalizePage; API trả mảng thì phân trang ở client).
2. Chi tiết sản phẩm:
   - gallery có Lens khi hover + Lightbox; panel mua dính (giá, trạng thái kho, NumberStepper giới hạn bởi tồn kho trừ số đã có trong giỏ);
   - "Thêm vào giỏ" có FlyToCart; "Mua ngay" chuyển tới /checkout với một món;
   - 3 cam kết; tabs Mô tả, Về loài này, Vận chuyển (văn bản mẫu có TODO); sản phẩm cùng loài và gợi ý.
3. Luật nút đúng tài liệu 03 mục 7: chưa đăng nhập thì mở Dialog đăng nhập; hàng của shop mình thì khoá; SOLD_OUT; 409 thì toast câu của server.
4. Mobile: thanh mua dính ở đáy, ảnh thành carousel vuốt.

XONG KHI:
- 7 sản phẩm; tìm "gecko" ra 2; nguyenvana mở sản phẩm BioGreen thì nút bị khoá; thêm vượt kho thì toast lỗi;
- FlyToCart mượt, có thay thế khi reduced motion; npm run check xanh; walkthrough có ảnh.
```

**Bạn kiểm tra:** mua thử như một khách hàng thật. Commit.

---

## Prompt 13 · Giỏ hàng, đặt hàng, đơn hàng

```text
Nhiệm vụ: dựng /cart, /checkout, /orders, /orders/:id. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/03-so-do-trang.md mục 8, 9, 10; docs/frontend/04-hop-dong-api-va-mock.md mục 3–4 (giỏ, đặt hàng kiểu transaction); docs/PLAN.md mục 4.4–4.5.

LÀM:
1. Giỏ hàng:
   - danh sách món có NumberStepper giới hạn maxQuantity; xoá có toast Hoàn tác;
   - cảnh báo available = false và vượt kho (nút "Giảm về N");
   - tóm tắt dính có Ticker, nút Đặt hàng bị khoá kèm lý do; xoá giỏ có xác nhận;
   - giỏ rỗng đẹp; AnimatePresence + layout khi xoá dòng.
2. Đặt hàng:
   - 2 bước (thanh bước dùng layoutId); địa chỉ điền sẵn từ api/me, validate bằng zod;
   - xác nhận và gửi (mua cả giỏ hoặc mua ngay một món);
   - 201 → /orders/:id?new=1; 409 → dialog liệt kê món lỗi; 401 → đăng nhập lại rồi quay về đúng bước.
3. Đơn hàng: tabs trạng thái, thẻ đơn (mã mono, chồng ảnh nhỏ), chi tiết có dòng thời gian, đơn giá lúc mua, "Mua lại"; ?new=1 có hoạt hình tick SVG + chùm hạt bằng Motion.

XONG KHI:
- levanc: giỏ 2 món 2.950.000 ₫ → đặt thành công, kho giảm, giỏ rỗng, đơn mới đứng đầu danh sách;
- phamthid: 2 cảnh báo, không đặt được (nếu cố gửi thì 409, giỏ giữ nguyên);
- levanc thấy ORD-2026-0001 và 0002 đúng tiền; e2e Playwright cho luồng mua hàng xanh; npm run check xanh.
```

**Bạn kiểm tra:** chạy đúng kịch bản demo ở PLAN mục 11.3, bước 1–3. Commit.

---

## Prompt 14 · Đăng nhập, tài khoản, người bán

```text
Nhiệm vụ: dựng /login, /register, /admin/login, /account, /seller/apply, /seller, /seller/products/new. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/03-so-do-trang.md mục 11, 12, 13; docs/frontend/04-hop-dong-api-va-mock.md (auth, me, seller, ma trận tài khoản).

LÀM:
1. Auth layout chia đôi: Slideshow ảnh thật (Ken Burns + vòng tròn mở, ghi tên loài và nguồn ảnh), form kính; biến thể admin.
   - Login: lỗi 401 chung, 403 riêng theo code, về đúng ?next.
   - Register: zod đúng tài liệu 03 mục 12, thanh độ mạnh mật khẩu, lỗi 409 gắn đúng ô, tự đăng nhập khi thành công.
2. Account: thẻ hồ sơ (chỉ đọc, TODO API sửa) + khối "Shop của bạn" theo 5 trạng thái.
3. Seller:
   - apply có xem trước thẻ shop (paper island) theo thời gian thực;
   - dashboard có 4 StatTile + bảng có tabs trạng thái (không vẽ biểu đồ doanh thu);
   - đăng sản phẩm: Combobox loài có ảnh, ô giá VND, chọn từ thư viện ảnh loài, ProductCard xem trước dính;
   - shop chưa ACTIVE thì hiện thẻ trạng thái.

XONG KHI:
- vuthif, dangvang ra đúng thông báo 403; đăng ký tài khoản mới thì tự đăng nhập;
- nguyenvana đăng sản phẩm thì vào PENDING và được tô sáng ở dashboard; tranthib thấy thẻ chờ duyệt;
- mobile 390 đẹp; npm run check xanh; walkthrough có ảnh.
```

**Bạn kiểm tra:** chạy kịch bản demo bước 4. Commit.

---

## Prompt 15 · Khu quản trị

```text
Nhiệm vụ: dựng /admin, /admin/sellers, /admin/products, /admin/species. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; docs/frontend/03-so-do-trang.md mục 14; docs/frontend/04-hop-dong-api-va-mock.md (admin, chuyển trạng thái, quyền).

LÀM:
1. Tổng quan: StatTile + hai hàng đợi xem nhanh.
2. Duyệt shop và duyệt sản phẩm:
   - danh sách trái, chi tiết phải; tabs trạng thái; dialog xác nhận;
   - thẻ bay ra khỏi hàng đợi (xanh sang phải, đỏ sang trái), tự chọn mục kế tiếp; phím tắt J/K/A/R có chú thích;
   - khối đối chiếu: ảnh sản phẩm đặt cạnh ảnh chuẩn của loài khai báo.
3. Quản lý loài: bảng + Sheet thêm loài (zod theo CreateSpeciesRequest).
4. Quyền đúng ma trận: biologist1 vào duyệt thì 403; moderator1 không thấy Quản lý loài; superadmin thấy tất cả.

XONG KHI:
- moderator1 duyệt "Rồng Úc Hypo Baby" thì /products có 8 sản phẩm; duyệt AquaTerra Shop thì tranthib đăng được sản phẩm;
- e2e Playwright cho luồng kiểm duyệt xanh; npm run check xanh; walkthrough có ảnh.
```

**Bạn kiểm tra:** chạy kịch bản demo bước 5–6 (gọi API admin bằng token USER thì bị 403). Commit.

---

## Prompt 16 · Hoàn thiện, kiểm định và bàn giao

```text
Nhiệm vụ: đánh bóng toàn bộ, đo đạc, và viết HANDOFF để chủ dự án nối API thật. Làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.

ĐỌC TRƯỚC: AGENTS.md; toàn bộ docs/frontend/ (đặc biệt 01 mục 1, 6, 7; 02 mục 10; 05 mục 1.2, 6); .agents/workflows/kiem-tra-ui.md.

LÀM:
1. Chạy workflow /kiem-tra-ui cho TẤT CẢ route; sửa mọi lỗi tìm thấy (bố cục 390/768/1440/1920, chữ đè, câu tiếng Anh sót, tương phản, 4 trạng thái).
2. Truy cập: axe trên mọi route (không có serious hoặc critical); đi hết bằng bàn phím trang chủ → sản phẩm → giỏ → đặt hàng; screen reader đọc được nội dung thay thế của các cảnh 3D.
3. Giảm chuyển động và mức static: chụp poster cho mọi cảnh 3D (scripts/shots.mjs --posters) vào public/posters/ (WebP), kiểm tra mọi trang vẫn đọc đủ nội dung.
4. Hiệu năng (bản preview): LCP và CLS theo tài liệu 01 mục 1; bundle khung chung ≤ 220 KB gzip; three chỉ tải ở 5 route cho phép; FPS ở trang 3D (Apple Silicon và giả lập CPU chậm 4×). Ghi bảng số đo.
5. Kiểm tra bản build: `npm run build` ra dist/ chạy được khi phục vụ dưới đường dẫn con (thử `npx serve` rồi mở /BioNexus/ bằng cách đặt dist vào thư mục con) để giả lập context path Tomcat.
6. Viết frontend/HANDOFF.md (tiếng Việt) gồm:
   - cách chạy (dev với mock, dev:api nối Tomcat 8081, build để nhúng WAR như PLAN mục 8.5 và 11);
   - BẢNG ENDPOINT giao diện đang dùng × trạng thái backend (✓, ◐, ✗, ◇) × file hook tương ứng;
   - các trường ◇ đề xuất (shopName, childCount…) và giao diện xử lý ra sao khi thiếu;
   - những chỗ đang lọc hoặc phân trang ở client, cần chuyển sang server;
   - chỗ ảnh đang dùng content/photos thay cho imageUrl giả trong seed và cách chuyển ảnh sang backend;
   - cách tắt MSW (VITE_USE_MOCKS=false) và checklist thử từng luồng với backend thật;
   - phần "Giải thích để vấn đáp": api() và token, HashRouter + base './', MSW, TanStack Query, transaction đặt hàng nhìn từ giao diện.
7. Cập nhật docs/frontend/README.md nếu có thay đổi so với kế hoạch (ghi rõ ở mục "Khác với tài liệu").

XONG KHI:
- npm run check + e2e xanh; bảng /kiem-tra-ui toàn đạt; HANDOFF.md đầy đủ;
- walkthrough có: bảng số đo hiệu năng, ảnh mọi route ở 1440 và 390 (ảnh nhỏ), danh sách việc còn lại (nếu có).
```

**Bạn kiểm tra:** đọc `HANDOFF.md`. Đó là "sách hướng dẫn" để bạn tự nối API và trả lời vấn đáp. Commit, tag `ui-v1`.

---

## Prompt dùng lúc cần

### S1 · Sửa theo ảnh chụp

Đính kèm ảnh chụp màn hình (hoặc ghi route và kích thước) rồi dán:

```text
Trang: <route>, kích thước <1440×900 | 390×844>. Ảnh chụp đính kèm.
Vấn đề:
1. <mô tả cụ thể: cái gì sai, ở đâu, muốn thế nào>
2. ...
Sửa theo đúng docs/frontend/02 và 03 (nếu yêu cầu của tôi khác tài liệu thì làm theo tôi và cập nhật tài liệu tương ứng). Chỉ sửa phạm vi liên quan. Sau khi sửa: npm run check, chụp lại cùng route và kích thước, đặt ảnh trước và sau cạnh nhau trong walkthrough.
```

### S2 · Review chất lượng một khu vực

```text
Hãy đóng vai design director khó tính và kỹ sư hiệu năng, review <route hoặc khu vực> so với docs/frontend/ và ảnh docs/frontend/reference/screens/.
Chấm theo các mục: thẩm mỹ (bố cục, nhịp, chữ, ảnh), chuyển động (có nghĩa, mượt, không thừa), dữ liệu (đúng hợp đồng, đủ 4 trạng thái), truy cập, hiệu năng, code (đúng kiến trúc 01).
Liệt kê vấn đề theo mức độ (nặng → nhẹ), mỗi vấn đề có ảnh chụp và cách sửa. Chưa sửa. Đợi tôi chọn mục cần sửa.
```

### S3 · Khi bị lỗi hoặc kẹt

```text
Đang gặp lỗi: <dán nguyên văn lỗi, lệnh đã chạy, route>.
Đừng đoán. Hãy: (1) tái hiện lỗi, (2) tìm nguyên nhân gốc (đọc code liên quan, log, console), (3) đề xuất cách sửa nhỏ nhất kèm lý do, (4) sửa, (5) chạy npm run check và chụp lại. Nếu nguyên nhân nằm ở backend hoặc hợp đồng API thì KHÔNG sửa backend, chỉ ghi vào HANDOFF.md mục "Đề xuất cho backend".
```

### S4 · Thêm trang hoặc tính năng mới cùng chuẩn

```text
Thêm <tính năng hoặc trang> cho BioNexus.
Trước khi code: bổ sung đặc tả vào docs/frontend/03-so-do-trang.md theo đúng mẫu (mục đích · quyền · dữ liệu · bố cục · hiệu ứng · trạng thái · mobile · xong khi); nếu cần API mới thì thêm vào docs/frontend/04 với ký hiệu ◇ và viết handler MSW. Cho tôi duyệt đặc tả rồi mới code. Sau đó làm theo "Quy trình mỗi nhiệm vụ" trong AGENTS.md.
```
