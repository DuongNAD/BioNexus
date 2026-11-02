# 07 · Hành trình 9 loài `/tham-hiem`

Trang riêng (route thứ 25) dẫn người xem đi một vòng Trái Đất qua **4 chặng, 9 trạm**. Mỗi trạm là một loài trong seed và giới thiệu một tính năng của BioNexus. Trang có hai chế độ:

- **Khách:** mở từ trang chủ hoặc menu Khám phá.
- **Làm quen sau đăng ký:** đăng ký thành công thì tự chuyển tới `#/tham-hiem?chao-mung=1`. Có lời chào theo tên, nút bỏ qua ở mọi lúc, hộ chiếu gắn với tài khoản.

Mẫu đã duyệt là **mẫu S**:

| Tài liệu | Nội dung |
|---|---|
| [`reference/expedition-code.md`](reference/expedition-code.md) | Toàn bộ code prototype (JSX), là thuật toán và bố cục tham chiếu |
| `reference/screens/s-01…s-20.jpg` | Ảnh chụp 1440×900 theo thứ tự cuộn (chế độ người mới) |
| `reference/screens/s-m1…s-m9.jpg` | Ảnh chụp 390×844 |
| `reference/trip-photos/` | 28 ảnh thật đã kiểm tra + `credits.json` (tác giả, giấy phép, link gốc) |

Không dùng WebGL. Trang dựng bằng ảnh thật, CSS (biến CSS theo cuộn), SVG và canvas 2D, nên máy chấm yếu vẫn mượt. Prototype đo được 91–98 FPS ở mọi đoạn khi cuộn đều.

## 1. Thứ tự section

Mỗi section dính (sticky) cao `h` (đơn vị vh). Tiến độ cuộn `p` chạy 0→1 trong section và được chia thành các khoảng con (đã làm mượt bằng smoothstep). Hook `useScrub` ghi các khoảng này thành biến CSS `--tên`.

| id | h | Nội dung | Cách lộ loài / hiệu ứng | Khoảng con chính |
|---|---|---|---|---|
| `mo-dau` | 220 | Hộ chiếu mở bìa + lời chào | Bìa xoay `rotateY` sang trái, lộ trang thông tin (tên, tên đăng nhập, ngày cấp, dòng mã MRZ trang trí) | open .16–.5 |
| `tong-quan` | 260 | **BioNexus là gì?** 3 trụ cột + bản đồ lộ trình | Bản đồ chấm, lộ trình vẽ dần theo `--draw` | draw .05–.7 |
| `cua-rung` | 260 | Chặng 1 mở đầu "Bước vào rừng mưa" (Cúc Phương) | Ảnh đường mòn phóng dần, mép ảnh mờ phóng nhanh hơn (đi xuyên lá), tia nắng, bụi phấn; thẻ lịch trình chặng 1 | walk 0–.95 |
| `tram-1` | 400 | Trạm 01 · Cát Tiên · **Trăn đất** | **Ống nhòm**: vòng tròn `clip-path` dò theo đường soạn sẵn, khóa vào đầu trăn, mở toàn cảnh | search .2–.5, open .58–.74 |
| `song` | 280 | Quá cảnh Taman Negara | Trượt ngang 2 ảnh (thuyền, cầu treo) + vé hành trình có thuyền chạy | pan .12–.88 |
| `tram-2` | 360 | Trạm 02 · Borneo · **Nắp ấm Ampullaria** | **Lấy nét**: cúi nhìn xuống, ảnh mờ dần nét, khung lấy nét co lại | focus .42–.6 |
| `tram-3` | 440 | Trạm 03 · Kinabalu · **Nắp ấm Rajah** | **Đồng hồ độ cao** 1.500→2.650 m (thước băng chạy), vào rừng mây, **sương tan** lộ ảnh | climb 0–.34, clear .5–.7 |
| `bay-2` | 260 | Chuyển chặng 2 | Máy bay bay theo cung trên bản đồ, **thẻ lên máy bay** BKI→ILM, hạ cánh hiện tiêu đề chặng | fly .18–.66 |
| `tram-4` | 340 | Trạm 04 · Carolina · **Cây bắt ruồi Venus** | **Hàm bẫy** răng cưa mở ra; nút "Chạm lông cảm ứng" (2 lần thì bẫy sập, mở lại sau 1,9 s) | jaws .3–.5 |
| `tram-5` | 360 | Trạm 05 · Xochimilco · **Axolotl** | **Lặn xuống kênh**: lớp dưới nước dâng từ đáy (`clip-path inset`), vệt sáng mặt nước, ánh nước (caustics), bọt | dive .2–.46 |
| `bay-3` | 260 | Chuyển chặng 3 (MEX→ACC) | như `bay-2` | |
| `tram-6` | 340 | Trạm 06 · Ghana · **Trăn bóng** | **Bẫy ảnh**: khung ngắm, chấm đỏ ghi hình, ảnh hồng ngoại đen trắng → chớp đèn → màu | ir .26–.4, color .52–.58 |
| `tram-7` | 360 | Trạm 07 · Balochistan · **Thằn lằn da báo** | **Đèn pin ban đêm**: vệt sáng mép mềm theo chuột (nếu vừa di chuột), không thì tự quét và dừng ở đầu thằn lằn | torch .26–.34, full .62–.7 |
| `tram-8` | 340 | Trạm 08 · Trung Úc · **Rồng Úc** | **Nắng gắt**: số nhiệt độ chạy 26→42°C, thanh nhiệt, hơi nóng bốc ở dải sát đất (SVG displacement) | heat .04–.32 |
| `bay-4` | 260 | Chuyển chặng 4 (ASP→FCO) | như `bay-2` | |
| `tram-9` | 340 | Trạm 09 · Địa Trung Hải · **Rùa Hermann** | **Bưu thiếp** lật 3D: mặt trước ảnh + tem răng cưa, mặt sau lời nhắn ký tên người dùng + dấu bưu điện | flip .38–.56 |
| `ket` | 220 | "Mười ngày, chín loài" | Bản đồ cả hành trình, sao, tổng quãng đường | |
| `ho-chieu` | 240 | Hộ chiếu mở 2 trang | 9 con dấu đóng lần lượt theo cuộn (hình và màu mực khác nhau), chỗ chưa gặp là ô gạch đứt | stamps .14–.72 |
| `ho-hang` | 300 | **Chín loài, một cây họ hàng** (mục 1a) | Cây nhánh vẽ dần từ "Sự sống" qua Giới → Chi tới 9 loài; rồi làm nổi lần lượt 4 nhánh kèm câu giải thích | grow .04–.38, 4 nhánh .45–.9 |
| (thường) | — | Chứng nhận "Nhà thám hiểm BioNexus" + gợi ý mua + ghi nguồn ảnh | | |

Mỗi trạm loài có thêm:
- **Tiêu đề trạm** (StationTitle): ngày, số trạm, tên nơi, tọa độ, "bay từ … · N km".
- **Sổ tay thực địa** (Journal): tên, tên khoa học, IUCN, 4 ô Nhiệt độ / Độ ẩm / Sinh cảnh / Bản địa, mô tả, ảnh của ai, link hồ sơ loài.
- **Con dấu** đóng lên sổ tay khi qua ngưỡng (khoảng `journal` + 0,1).
- **Thẻ "Trên BioNexus"** (mục 3).
- Lớp tối dần ở cuối (`--exit`) để chuyển section mượt.

### 1a. Cây họ hàng (`ho-hang`)

Cho người xem thấy 9 loài vừa gặp liên quan với nhau thế nào. Cảnh này đồng thời giới thiệu tính năng lõi là cây phân loại. Ảnh mẫu: `s-20-ho-hang.jpg`, `s-m9-ho-hang.jpg`.

- **Chỉ dựng từ dữ liệu phân loại** (breadcrumbs Giới → Chi của từng loài). Không thêm mốc thời gian, tuổi địa chất hay quan hệ tiến hóa nào ngoài dữ liệu. Câu dẫn phải nói rõ: "Đây là họ hàng theo phân loại, không phải lịch sử tiến hóa."
- **Bố cục:** gốc "Sự sống" bên trái, mỗi cấp một cột, 9 lá xếp dọc bên phải (ảnh tròn, tên, tên khoa học). Con theo thứ tự tên khoa học để không có nhánh cắt nhau. Nút cha nằm giữa con đầu và con cuối. Cạnh là đường cong S. Hàng tên cấp (Giới … Loài) ở trên.
- **Vẽ dần theo cuộn:** cạnh vẽ bằng `pathLength=1` + `stroke-dashoffset`, mỗi cấp một đoạn của `--grow`; nhãn nút hiện sau cạnh; lá trượt vào ở cuối.
- **4 nhánh nổi lần lượt.** Section có `data-hl="1…4"`; phần ngoài nhánh mờ còn 14%, cạnh trong nhánh đổi màu ngọc. Tổ tiên chung lấy theo tên khoa học: Caryophyllales, Python, Squamata, Amphibia.
  - Câu giải thích **tự sinh từ dữ liệu**: "{các loài} cùng thuộc {tên tổ tiên}", hoặc "{loài} là loài duy nhất thuộc {tên} trong chín loài" khi nhánh chỉ có một loài.
  - Thẻ chú thích ở đáy có nút "Mở cây phân loại" (`/taxonomy/:id` của tổ tiên đang nổi).
- **Loài chưa gặp** (người dùng đã bỏ qua trạm) hiện ảnh xám, viền mờ.
- **Mobile:** cây dồn sang trái (cột lá ở 54% bề rộng), nét cây dày hơn theo tỉ lệ co, chỉ hiện nhãn của tổ tiên đang nổi.
- **Giảm chuyển động:** vẽ sẵn cả cây; 4 câu giải thích hiện thành danh sách bên dưới.

**Phần cố định trên màn hình:**
- **Header:** logo, "Hành trình 9 loài", nút "Bỏ qua chuyến đi" (chỉ ở chế độ người mới), viên hộ chiếu hiện 9 chấm và `n/9`.
- **Bảng thông số (HUD)**, chỉ hiện ở các trạm:
  - ngày, trạm, giờ địa phương thật (`Intl.DateTimeFormat` với `timeZone`);
  - tên nơi; tọa độ chạy dần khi đổi trạm;
  - nhiệt độ, độ ẩm, độ cao (lấy từ `environmentSpecs`);
  - thanh tiến độ cả trang.
- **Thanh chặng** bên trái (desktop): 4 chặng, mỗi trạm một chấm, bấm để nhảy tới; tên chặng chỉ hiện khi hover hoặc focus.

## 2. Dữ liệu

**Loài:**
- Lấy từ `useSpeciesList()`, tra theo `scientificName`. Không hard-code id.
- Nhiệt độ, độ ẩm, sinh cảnh: parse `environmentSpecs` bằng `parseEnvironmentSpecs` (đã có).
- Mô tả lấy từ `description`.
- Vùng bản địa và tọa độ lấy từ `species-extras.ts`.

**Cấu hình trạm** nằm ở `src/content/journey.ts`, khóa theo `scientificName`. Mỗi trạm gồm: chặng, số trạm, ngày, id section, tên nơi hiển thị, tọa độ, múi giờ, ảnh (nền + loài), kiểu hiệu ứng, khóa thẻ "Trên BioNexus", câu dẫn. Các giá trị cụ thể (tên nơi, tọa độ, múi giờ, câu chữ) lấy đúng từ `reference/expedition-code.md` (`data.jsx`, các file chặng).

**Thiếu loài:** loài nào không có trong dữ liệu API thì bỏ trạm đó, không vỡ trang. Tổng số dấu bằng số trạm thực có.

**Số liệu phải là số thật hoặc tính được, không bịa:**
- Quãng đường tính bằng công thức vòng lớn từ tọa độ.
- Giờ địa phương và ngày cấp lấy theo ngày hôm nay.
- Độ cao 1.500–2.650 m và điểm sưởi 38–42°C lấy từ `environmentSpecs` trong seed.
- Không thêm số EXIF, độ sâu, số hiệu chuyến bay.
- Mã sân bay (BKI, ILM, MEX, ACC, ASP, FCO) là mã thật.

**Sản phẩm:** `useProducts()` lọc `APPROVED`, gắn ảnh theo loài.

**Người dùng:** `useMe()` cho họ tên và tên đăng nhập. Khách thì hiện "Khách thám hiểm".

## 3. Thẻ "Trên BioNexus" (giới thiệu web)

| Trạm | Tính năng | Đi tới |
|---|---|---|
| 01 Trăn đất | Hồ sơ loài | `/species/:id` của loài |
| 02 Ampullaria | Cây phân loại 6 cấp (chip Giới → Chi lấy từ breadcrumbs) | `/taxonomy/:id` của chi |
| 03 Rajah | Mức bảo tồn IUCN (thang 5 mức, đánh dấu EN) | `/species?iucn=EN` |
| 04 Venus | Tìm nhanh ⌘K / Ctrl K, gõ không dấu | mở CommandPalette |
| 05 Axolotl | Sàn sinh vật cảnh (một dòng sản phẩm thật của loài) | `/products` |
| 06 Trăn bóng | Kiểm duyệt trước khi lên sàn (Chờ duyệt → Đã duyệt) | `/seller/apply` |
| 07 Thằn lằn da báo | Giỏ hàng và đặt hàng (kho tự trừ, hết thì Hết hàng) | `/cart` |
| 08 Rồng Úc | Mở cửa hàng của bạn | `/seller/apply` |
| 09 Rùa Hermann | Đơn hàng và đánh giá | `/orders` |

- Desktop: thẻ kính ở góc dưới trái.
- Mobile: thu thành một dòng "Trên BioNexus: …" trong sổ tay.

## 4. Luồng làm quen sau đăng ký

1. **Đăng ký thành công** (201, đã tự đăng nhập) thì chuyển tới `#/tham-hiem?chao-mung=1` thay vì về trang chủ. Đăng nhập bình thường không tự mở trang này.
2. **Lời chào:** chế độ `chao-mung` hiện "Chào mừng, {họ tên}" ở `mo-dau`. Tên người dùng còn xuất hiện trên thẻ lên máy bay, lời nhắn bưu thiếp, trang hộ chiếu và chứng nhận.
3. **Bỏ qua:**
   - Nút "Bỏ qua, vào trang chủ" ở `mo-dau`, và "Bỏ qua chuyến đi" trên header luôn bấm được.
   - Bấm thì về `#/` và ghi `skippedAt`.
4. **Không ép:** không chặn cuộn, không modal, không tự phát âm thanh.
5. **Lưu hộ chiếu:**
   - Nằm ở `localStorage['bionexus.passport.v1']`, dạng `{ [username | 'guest']: { met: string[] /* scientificName */, startedAt, completedAt?, skippedAt? } }`.
   - Đọc và ghi qua một hook `usePassport()`. Bọc try/catch, vì storage có thể bị chặn.
   - Ghi vào `HANDOFF.md`, mục "Đề xuất cho backend": `GET/PUT api/me/passport` (tùy chọn) để lưu trên server.
6. **Mở lại:** `/account` có thẻ "Hộ chiếu loài" (n/9, nút "Đi tiếp hành trình" về trạm đầu chưa gặp).
7. **Lối vào khác:**
   - Menu Khám phá có mục "Hành trình 9 loài".
   - Trang chủ thêm một khối mời (ảnh đường mòn, nút "Bắt đầu hành trình") ngay trước khối kết.
8. **DevPanel:** nút "Xem như người mới đăng ký" mở `#/tham-hiem?chao-mung=1` với tài khoản seed `levanc`.

## 5. Ảnh

- **Dùng 28 ảnh trong `reference/trip-photos/`** (đã kiểm tra qua API Commons: file tồn tại, giấy phép CC0 / CC BY / CC BY-SA / phạm vi công cộng).
  - Dùng `sharp` sinh biến thể AVIF và WebP 960 / 1600 / 1920 vào `public/trip/`, dùng `srcset`.
  - Ảnh của section kế tiếp được preload khi section hiện tại đi được 60%.
- **Các ảnh này cũng dùng được cho trang loài.** Mỗi loài trong seed đã có ít nhất một ảnh thật:

  | Loài | Ảnh |
  |---|---|
  | Trăn đất | `python` |
  | Nắp ấm Ampullaria | `ampullaria`, `ampullaria2` |
  | Nắp ấm Rajah | `rajah`, `rajah2` |
  | Cây bắt ruồi Venus | `venus`, `venus2` |
  | Axolotl | `axolotl`, `axolotl2` |
  | Trăn bóng | `ballpython` |
  | Thằn lằn da báo | `gecko`, `gecko2` |
  | Rồng Úc | `dragon` |
  | Rùa Hermann | `hermann` |

- **Ghi nguồn:** chân trang hành trình liệt kê đủ tác giả, giấy phép, link gốc; trang `/credits` gộp cùng danh sách.
- **Câu "Ảnh: …"** trong sổ tay ghi nơi chụp hoặc tác giả đúng như `credits.json`. Ví dụ ảnh trăn đất chụp ở VQG Bardiya, Nepal, không phải Cát Tiên.

## 6. Kỹ thuật

**Cấu trúc file:**

| Đường dẫn | Nội dung |
|---|---|
| `src/pages/journey/` | Trang và các chặng |
| `src/components/journey/` | `useScrub`, `Motes`, `Journal`, `Tip`, `StampMark`, `WorldMap`, `Hud`, `ChapterRail` |
| `src/content/journey.ts` | Cấu hình trạm |
| `src/lib/geo.ts` | `distanceKm`, `fmtLL` |

**Tải trang:**
- Lazy route, chunk riêng.
- `d3-geo`, `topojson-client`, `world-atlas/land-110m.json` chỉ nằm trong chunk này.
- **Không tải three.js** ở trang này. `check:preload` phải xanh.

**Cuộn:**
- Tiến độ ghi thẳng vào biến CSS của section bằng `requestAnimationFrame`, không `setState` mỗi khung.
- React chỉ render lại khi đổi trạm hoặc đóng dấu.

**Canvas 2D** (bụi phấn, đom đóm, bọt, sao):
- Chỉ vẽ khi section trong khung nhìn (IntersectionObserver).
- DPR tối đa 2.

**Bản đồ:**
- Phép chiếu `geoNaturalEarth1`.
- Đất liền vẽ ra canvas ẩn, lấy mẫu thành lưới chấm, gộp thành **một** `path` SVG.
- Đường bay là cung bậc hai trong mặt phẳng bản đồ (tránh bị cắt ở kinh tuyến 180), vẽ bằng `pathLength=1` + `stroke-dashoffset`.

**Biến CSS có chuyển động:** `--snap` (hàm bẫy) đăng ký bằng `@property` để chuyển tiếp được.

**Giảm chuyển động / mức `static`:**
- Bỏ sticky. Mỗi section hiện thẳng trạng thái cuối: ảnh rõ, sổ tay, dấu đóng khi vào khung nhìn.
- Bưu thiếp hiện hai mặt cạnh nhau. Đèn pin hiện toàn ảnh. Không canvas hạt. Bản đồ vẽ sẵn cả lộ trình.

**Truy cập:**
- `alt` cho mọi ảnh. Canvas và lớp trang trí gắn `aria-hidden`.
- Lời "Đã đóng dấu {loài}" phát qua `aria-live="polite"`.
- Nút bỏ qua nằm đầu thứ tự tab.
- Thanh chặng và nút "chạm lông cảm ứng" dùng được bằng bàn phím.
- Tương phản AA trên ảnh nhờ lớp gradient tối.

**Mobile 390:**
- Sổ tay thành tấm đáy màn hình. HUD thu gọn ở trên.
- Hộ chiếu cuối hiển thị 2 trang xếp dọc. Bản đồ rộng 140–150vw, dịch trái để thấy lộ trình.
- Theo ảnh `s-m*.jpg`.

## 7. Kiểm thử

**Unit:**
- `distanceKm`, `fmtLL`, dòng MRZ (bỏ dấu, `Đ` → `D`).
- `journey.ts` đủ 9 loài của seed, mỗi ảnh có mục credit.
- Cây họ hàng: dựng đúng 9 lá; tổ tiên chung của nắp ấm và bắt ruồi Venus là Caryophyllales; câu giải thích sinh đúng cho nhánh 1 loài và nhánh nhiều loài.
- `usePassport`: thêm dấu không trùng; storage lỗi thì không vỡ.

**E2E (MSW):**
- Đăng ký → tới `/tham-hiem?chao-mung=1` → thấy tên → bỏ qua về `/`.
- Cuộn tới trạm 01 → hộ chiếu 1/9 → tải lại trang vẫn 1/9.
- Khách vào `/tham-hiem` → thấy "Khách thám hiểm".

**Ảnh chụp** 1440 và 390 ở hai chế độ: đặt cạnh `s-*.jpg`, nói rõ chỗ khác và vì sao.
