# 02 · Hệ thống thiết kế

Tên hướng thiết kế: **"Bio-Luxury tối"**. Không gian tối như đêm rừng mưa và bầu trời sao. Ánh sáng xanh ngọc phát ra từ sự sống. Ảnh thật chiếm diện tích lớn. Chữ to, chắc, ít mà đắt. Chuẩn so sánh: `reference/screens/r-*.jpg`.

## 1. Nguyên tắc

1. **Ảnh thật là nhân vật chính.** Trang nào có loài hay sản phẩm thì phải có ảnh thật lớn. Hiệu ứng chỉ để tôn ảnh lên, không thay ảnh.
2. **Một điểm nhấn mỗi khung nhìn.** Mỗi màn hình có tối đa một hiệu ứng "wow" (cảnh 3D, ảnh phóng to, quả địa cầu). Phần còn lại tĩnh và gọn.
3. **Chuyển động có nghĩa.** Hạt thành ADN là để nói về phân loại. Địa cầu xoay là để nói về nguồn gốc. Không có chuyển động chỉ để cho vui.
4. **Dữ liệu khoa học phải rõ.** Tên khoa học in nghiêng. Mức IUCN có màu chuẩn kèm chữ. Đường phân loại 6 cấp luôn đọc được.
5. **Chữ tiếng Việt đẹp.** Font có đủ dấu, đủ khoảng cách dòng để dấu không chạm dòng trên.

## 2. Token màu (`src/styles/tokens.css`)

Khai báo bằng CSS variable rồi map vào Tailwind bằng `@theme inline`. **Chỉ một chế độ: tối.** Sàn có tính "trình diễn", và mẫu R đã chốt nền tối.

| Token | Giá trị | Dùng cho |
|---|---|---|
| `--bg` | `#030807` | Nền trang |
| `--bg-deep` | `#020605` | Nền khối 3D, footer |
| `--bg-raised` | `#06110d` | Khối nổi lớn (finale, panel) |
| `--surface` | `rgb(255 255 255 / 0.03)` | Thẻ kính |
| `--surface-2` | `rgb(255 255 255 / 0.06)` | Thẻ khi hover, ô nhập |
| `--glass` | `rgb(0 0 0 / 0.45)` + `backdrop-blur-xl` | Panel nổi trên 3D hoặc ảnh |
| `--line` | `rgb(255 255 255 / 0.10)` | Viền, đường kẻ |
| `--line-strong` | `rgb(255 255 255 / 0.18)` | Viền khi focus hoặc hover |
| `--fg` | `rgb(255 255 255 / 0.95)` | Chữ chính |
| `--fg-2` | `rgb(255 255 255 / 0.68)` | Chữ phụ, đoạn văn |
| `--fg-3` | `rgb(255 255 255 / 0.52)` | Nhãn phụ. **Chỉ dùng cho chữ từ 14 px trở lên** |
| `--fg-mute` | `rgb(255 255 255 / 0.35)` | Chỉ để trang trí, không mang thông tin |
| `--accent` | `#6ee7b7` | Nhấn chính: nút chính, chữ nhấn, thanh tiến độ |
| `--accent-2` | `#5eead4` | Nhấn phụ (địa cầu, dữ liệu) |
| `--accent-ink` | `#03140d` | Chữ đặt trên nền accent |
| `--aurora` | `#c4b5fd` | Tím cực quang, rất ít: gradient chữ hero, hạt thiên hà |
| `--ocean` | `#38bdf8` | Biển trên Hành tinh BioNexus |
| `--warm` | `#fbbf24` | Nhóm bò sát trong biểu đồ, cảnh báo nhẹ |
| `--danger` | `#f87171` | Lỗi, từ chối |
| `--success` | `#4ade80` | Duyệt, hoàn tất |

**Màu IUCN** (huy hiệu luôn có chấm màu, mã và nhãn tiếng Việt):

| Mã | Màu | Nhãn |
|---|---|---|
| LC | `#60c659` | Ít quan tâm |
| NT | `#cce226` | Sắp bị đe dọa |
| VU | `#f9e814` | Sắp nguy cấp |
| EN | `#fc7f3f` | Nguy cấp |
| CR | `#d81e05` | Cực kỳ nguy cấp |
| EW | `#542344` | Tuyệt chủng ngoài tự nhiên |
| EX | `#000000` (viền trắng) | Tuyệt chủng |

**Trạng thái nghiệp vụ** (`StatusPill`): PENDING → `--warm`, APPROVED/ACTIVE/COMPLETED → `--success`, REJECTED/BANNED/CANCELLED → `--danger`, SOLD_OUT → `--fg-3`. Pill có nền là chính màu đó ở độ đậm 12% và chữ cùng màu.

**Gradient được phép** (chỉ 3 loại):
- Chữ hero: `--aurora → --accent-2 → --accent`.
- Quầng sáng (glow) mờ sau khối lớn: hình tròn `--accent` 25%, blur 120 px.
- Lớp phủ ảnh: `from-black/80 via-black/10 to-transparent`, để chữ trên ảnh đọc được.

## 3. Chữ

| Vai | Font | Cỡ desktop / mobile | Độ đậm | Tracking | Line-height |
|---|---|---|---|---|---|
| Display XL (hero) | Be Vietnam Pro | 84 / 44 | 600 | -0.05em | 0.95 |
| Display | Be Vietnam Pro | 64 / 38 | 600 | -0.05em | 0.98 |
| H1 trang | Be Vietnam Pro | 56 / 34 | 600 | -0.045em | 1.0 |
| H2 khối | Be Vietnam Pro | 44 / 30 | 600 | -0.04em | 1.05 |
| H3 thẻ | Be Vietnam Pro | 24 / 20 | 600 | -0.02em | 1.2 |
| Body L | Be Vietnam Pro | 18 / 17 | 400 | 0 | 1.65 |
| Body | Be Vietnam Pro | 16 / 15 | 400 | 0 | 1.6 |
| Nhãn nhỏ (eyebrow) | Be Vietnam Pro | 12 | 600 | 0.3em, in hoa | 1.2 |
| Chữ nghiêng nhấn | Cormorant Garamond Italic | bằng dòng chứa nó + 8% | 500 | -0.01em | — |
| Số liệu, mã | JetBrains Mono | 12–14 | 500 | 0 | — |

- **Tên khoa học** luôn in nghiêng: `<i className="font-serif italic">Python regius</i>` trong đoạn văn, hoặc dùng Be Vietnam Pro italic trong UI nhỏ.
- **Nhãn tiếng Việt in hoa** dùng Be Vietnam Pro (JetBrains Mono thiếu một số dấu). Chỉ dùng mono cho số, mã đơn (`ORD-2026-0001`), toạ độ.
- Tiêu đề lớn có thể có **một cụm chữ nhấn**: gradient hero, hoặc Cormorant italic màu `--accent`. Ví dụ: "Từ cây phân loại *đến giỏ hàng*".
- Độ dài dòng của đoạn văn 60–72 ký tự (`max-w-xl` hoặc `max-w-2xl`).

## 4. Khoảng cách, lưới, bo góc

- Lưới 4 px. Khoảng cách hay dùng: 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.
- Container: `max-w-7xl` (1280) cho trang nội dung, `max-w-6xl` cho trang đọc, `px-6` mobile / `px-8` tablet / `px-10 → px-14` desktop rộng.
- Khoảng giữa các khối lớn: 128–160 px trên desktop, 80–96 px trên mobile.
- Bo góc: `--r-sm 10px` (ô nhập, chip), `--r-md 16px` (thẻ nhỏ), `--r-lg 24px` (thẻ lớn, ảnh), `--r-xl 36px` (panel lớn), `--r-2xl 44px` (finale), nút dạng viên thuốc `9999px`.
- Breakpoint: 390 (mobile chuẩn), 640, 768, 1024, 1280, 1440, 1920. Thiết kế ưu tiên desktop 1440, nhưng **mọi trang phải dùng được ở 390**.

## 5. Bề mặt và chiều sâu

- **Thẻ kính:** `bg-surface border border-line rounded-lg`, hover sang `bg-surface-2 border-line-strong`. Không đổ bóng đen.
- **Panel nổi trên 3D hoặc ảnh:** `bg-black/45 backdrop-blur-xl border-white/10 rounded-3xl`.
- **Chiều sâu dùng ánh sáng, không dùng bóng:** quầng `0 40px 120px -30px rgb(110 231 183 / .35)` sau khối quan trọng (panel quy trình, nút chính khi hover).
- **Hạt nhiễu (noise) mờ 3%** phủ toàn trang (SVG turbulence, `pointer-events-none`) cho bớt phẳng.
- **"Paper island":** một số panel minh hoạ quy trình (trang chủ, khối 5) dùng nền giấy sáng `#e9eee5` với chữ `#0f1f17`, như một màn hình app nổi trên nền tối. Chỉ dùng ở khối này và trong trang "Mở shop" để minh hoạ.

## 6. Chuyển động

**Token** (`src/lib/motion.ts`):

| Token | Giá trị | Dùng |
|---|---|---|
| `dur.fast` | 150 ms | Hover, focus |
| `dur.base` | 250 ms | Mở menu, đổi tab |
| `dur.slow` | 450 ms | Panel, thẻ đổi nội dung |
| `dur.scene` | 800–1000 ms | Chữ hero, ảnh lộ dần |
| `ease.out` | `[0.16, 1, 0.3, 1]` | Mặc định |
| `ease.inOut` | `[0.76, 0, 0.24, 1]` | Chuyển cảnh lớn, che hoặc mở ảnh |
| `spring.ui` | `{ stiffness: 380, damping: 32 }` | `layoutId` (nav pill, tab, danh sách) |
| `spring.soft` | `{ stiffness: 160, damping: 18 }` | Thẻ nảy nhẹ khi hover |

**Mẫu chuyển động chuẩn** (dùng lại, không tự chế thêm):

1. **BlurFade:** vào khung nhìn thì opacity 0→1, y 24→0, blur 8→0 px, 450 ms. Phần tử trong danh sách lệch nhau 60 ms.
2. **MaskText:** dòng chữ trượt lên từ khe (`overflow-hidden`, y 105%→0, `ease.inOut`, 1 s). Dùng cho tiêu đề hero của từng trang.
3. **Cuộn dính (scroll-pin):** khối cao N×100vh, có phần dính `sticky top-0 h-screen`, đọc tiến độ cuộn 0→1 để điều khiển cảnh. Dùng cho hạt biến hình, chuỗi xoắn và ảnh phóng to.
4. **ZoomReveal:** ảnh từ khung `inset(28% 35% round 40px)` mở dần ra toàn màn hình theo tiến độ cuộn, kèm scale 1.25→1. Chữ hiện lên ở 45–75% tiến độ.
5. **StickySteps:** cột trái là các bước (bước đang xem sáng, các bước khác mờ 15%), cột phải là panel dính đổi nội dung bằng blur cross-fade.
6. **Ticker:** số chạy từ 0 lên khi vào khung nhìn (1,8 s, `ease.out`, định dạng `vi-VN`).
7. **Nav pill:** nền mục đang chọn trượt bằng `layoutId` (`spring.ui`).
8. **Chuyển trang:** trang cũ mờ dần (200 ms), trang mới BlurFade (350 ms). Mỗi lần đổi trang đưa cuộn về đầu (Lenis `scrollTo(0, { immediate: true })`).
9. **Ảnh hover:** scale 1→1.05, 700 ms `ease.out`. Ảnh sản phẩm hết hàng chuyển sang thang xám.
10. **Thêm vào giỏ:** ảnh thu nhỏ bay theo đường cong tới icon giỏ (600 ms), con số trên giỏ nảy lên (`spring.soft`), kèm toast.

**Giảm chuyển động** (`prefers-reduced-motion` hoặc công tắc trong DevPanel hay footer):
- Tắt cuộn mượt Lenis, tắt parallax và nghiêng thẻ.
- Cảnh 3D thay bằng poster tĩnh. Cuộn dính vẫn giữ để đọc nội dung, nhưng đổi bằng cross-fade.
- BlurFade chỉ còn đổi opacity.

## 7. Ảnh

- Mọi ảnh đi qua component `<Photo>`:
  - `<picture>` với AVIF, WebP và JPEG, kèm `srcset` 480/960/1600.
  - Ảnh mờ tạm (blurhash hoặc base64 16 px) hiện trước khi ảnh thật tải xong.
  - Khai báo `width` và `height` để không nhảy bố cục.
  - `objectPosition` lấy theo điểm lấy nét của ảnh.
  - `alt` tiếng Việt.
  - `credit` hiện một chip nhỏ khi hover (desktop) hoặc nút "i" (mobile).
- **Tỉ lệ khung chuẩn:** hero 16:9 hoặc toàn màn hình, thẻ loài 4:5, thẻ sản phẩm 1:1 hoặc 4:5, gallery tự do (masonry), ảnh nhỏ (thumbnail) 1:1.
- **Xử lý ảnh:** không đổi màu loài. Được phép phủ gradient đen để đọc chữ, giảm sáng ảnh nền 10–20%, và làm xám ảnh của sản phẩm hết hàng.
- **Lật ảnh:** chỉ khi tài liệu 06 cho phép (ví dụ để hai sản phẩm cùng loài trông khác nhau). Không lật ảnh có chữ.

## 8. Icon và hình minh hoạ

- `lucide-react`: nét mặc định, kích thước 16 / 20 / 24. Icon chỉ có hình (không chữ) phải có `aria-label`.
- Logo BioNexus: SVG tự vẽ, hai sợi xoắn cách điệu, một màu `--accent`. Không dùng emoji.
- Không dùng ảnh clip-art. Minh hoạ sơ đồ (cây phân loại, quy trình) dựng bằng component và SVG.

## 9. Thành phần nền cần có (`components/ui` và `components/domain`)

Button (primary / secondary / ghost / danger / icon; cỡ sm / md / lg; trạng thái loading), Input, Textarea, Select, Combobox (chọn loài), NumberStepper, Checkbox, RadioCard, Switch, Slider (khoảng giá), Tabs, SegmentedControl, Dialog, Sheet (mobile), Popover, Tooltip, DropdownMenu, Toast, Skeleton, EmptyState, ErrorState, Pagination, Breadcrumb, Badge, **IucnBadge**, **StatusPill**, **Price** (VND), **TaxonPath** (6 cấp, có chế độ gọn), **SpeciesCard**, **ProductCard**, **ShopChip**, **ClimateBar**, **StatTile**, **Photo**, **Gallery**, **Lightbox**, **PhotoCredit**, **SectionHeading** (eyebrow + tiêu đề + mô tả), **CommandPalette** (⌘K tìm loài và sản phẩm).

Mọi component có trang xem thử ở `#/dev/ui` (chỉ có ở chế độ dev), mỗi component đủ biến thể và trạng thái.

## 10. Truy cập (a11y)

- Tương phản: chữ thường ≥ 4.5:1, chữ lớn ≥ 3:1. Dùng `--fg-3` thì chữ phải từ 14 px trở lên và đậm 500 trở lên. Không dùng `--fg-mute` cho thông tin.
- Focus: vòng `outline: 2px solid var(--accent); outline-offset: 3px` ở mọi phần tử tương tác. Không bỏ outline.
- Vùng bấm tối thiểu 44×44 px.
- Có link "Bỏ qua tới nội dung chính" ở đầu trang. Mỗi trang có đúng một `<h1>`. Dùng landmark `header`, `nav`, `main`, `footer`.
- Cảnh 3D: `aria-hidden="true"`. Nội dung mà cảnh truyền tải (danh sách loài, nơi bản địa, số liệu) **phải có bản chữ** ngay trong DOM.
- Form: label luôn hiện (không chỉ dùng placeholder), lỗi gắn `aria-describedby`, toast lỗi đọc được bằng `role="status"`.
- Màu không phải kênh duy nhất: IUCN và trạng thái luôn kèm chữ.

## 11. Giọng văn

- Xưng "bạn", ngắn, rõ, ấm, chính xác về khoa học. Ví dụ: "Kho chỉ còn 3 cá thể", "Cửa hàng đang chờ duyệt".
- Không phóng đại, không bịa số liệu. Số liệu phải lấy từ dữ liệu (ví dụ "9 loài · 25 bậc phân loại").
- Tên loài lấy đúng `commonName` trong DB. Phần trong ngoặc tiếng Anh có thể ẩn ở thẻ nhỏ: ví dụ "Trăn bóng (Ball Python)" hiển thị "Trăn bóng" ở thẻ, tên đầy đủ ở trang chi tiết.
- Mọi cá thể bán trên sàn là nhân giống nhân tạo, có giấy tờ. Nhắc điều này ở trang sản phẩm và trang chủ, không lặp lại quá nhiều.
