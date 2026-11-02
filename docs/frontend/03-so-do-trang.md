# 03 · Sơ đồ trang và đặc tả từng trang

Mỗi trang ghi theo mẫu: **mục đích · quyền · dữ liệu (endpoint ở tài liệu 04) · bố cục từng khối · hiệu ứng riêng · trạng thái · mobile · xong khi**. Các trạng thái chung (skeleton, rỗng, lỗi có nút "Thử lại") là bắt buộc ở mọi trang, nên chỉ ghi khi có điểm đặc biệt.

## 0. Sơ đồ route (HashRouter, `#/…`)

| Route | Trang | Quyền | Layout |
|---|---|---|---|
| `/` | Trang chủ | Mọi người | Root (navbar trong suốt) |
| `/taxonomy` | Cây phân loại (gốc) | Mọi người | Root |
| `/taxonomy/:id` | Một nút phân loại | Mọi người | Root |
| `/species` | Bách khoa loài | Mọi người | Root |
| `/species/:id` | Hồ sơ loài | Mọi người | Root (navbar trong suốt) |
| `/products` | Cửa hàng | Mọi người | Root |
| `/products/:id` | Chi tiết sản phẩm | Mọi người (mua cần đăng nhập) | Root |
| `/login` · `/register` | Đăng nhập · Đăng ký | Khách | Auth (chia đôi màn hình) |
| `/admin/login` | Đăng nhập quản trị | Khách | Auth (biến thể admin) |
| `/cart` | Giỏ hàng | USER | Root |
| `/checkout` | Đặt hàng | USER | Root (tối giản) |
| `/orders` · `/orders/:id` | Đơn của tôi · Chi tiết đơn | USER | Account |
| `/account` | Tài khoản | USER | Account |
| `/seller/apply` | Mở shop | USER chưa có shop | Account |
| `/seller` | Shop của tôi | USER có shop | Seller |
| `/seller/products/new` | Đăng sản phẩm | Shop ACTIVE | Seller |
| `/admin` | Tổng quan quản trị | ADMIN | Admin (sidebar) |
| `/admin/sellers` | Duyệt shop | MODERATOR, SUPER_ADMIN | Admin |
| `/admin/products` | Duyệt sản phẩm | MODERATOR, SUPER_ADMIN | Admin |
| `/admin/species` | Quản lý loài | BIOLOGIST, SUPER_ADMIN | Admin |
| `/credits` | Nguồn ảnh | Mọi người | Root |
| `*` | 404 | Mọi người | Root |
| `/dev/ui` | Bộ sưu tập component (chỉ ở chế độ dev) | — | Root |

**Chặn quyền:**
- Chưa đăng nhập vào trang cần USER thì chuyển về `#/login?next=<trang>`.
- Sai quyền thì hiện trang 403 trong layout ("Bạn không có quyền xem trang này"), không redirect im lặng.
- Shop chưa ACTIVE vào `/seller/products/new` thì hiện trạng thái shop kèm hướng dẫn.

## 1. Khung chung

**Navbar** (RootLayout):
- Trái: logo. Giữa: nav dạng viên thuốc nổi (`layoutId` trượt theo mục đang chọn).
- Các mục: **Khám phá** (mega menu gồm Cây phân loại, Bách khoa loài, Hành tinh nguồn gốc kèm ảnh nhỏ, và 3 loài nổi bật bằng ảnh thật), **Cửa hàng**, **Người bán**.
- Phải: nút tìm (⌘K), giỏ có số món (ẩn với admin), menu tài khoản (Đăng nhập, hoặc avatar chữ cái với Tài khoản, Đơn hàng, Shop của tôi, Đăng xuất).
- Ở trang chủ và hồ sơ loài, navbar trong suốt và thành kính mờ sau khi cuộn quá 80 px. Cuộn xuống thì thu gọn, cuộn lên thì hiện lại.

**Footer:**
- 4 cột: Khám phá, Cửa hàng, Người bán, Dự án (Đồ án Aptech 2026, Nguồn ảnh, GitHub).
- Có chú giải IUCN và công tắc "Giảm chuyển động".
- Dải chữ BIONEXUS lớn bằng hạt (`ParticleMorph`, chỉ một hình chữ, 6.000 hạt, chỉ chạy khi chất lượng 3D ở mức cao). Mức khác thì là chữ gradient tĩnh.

**CommandPalette (⌘K / Ctrl K):**
- Tìm loài (tên thường, tên khoa học, không phân biệt dấu) và sản phẩm.
- Mỗi kết quả có ảnh nhỏ, IUCN và giá. Có lối tắt tới các trang.
- Tìm kiếm chạy trên client, dựa vào dữ liệu đã có trong bộ đệm (tải danh sách loài và sản phẩm khi mở lần đầu).

**DevPanel** (chỉ ở chế độ dev, nút nổi góc dưới trái):
- Đăng nhập nhanh bằng 1 click theo tài khoản seed.
- Đổi độ trễ mock, giả lỗi (500, 401, 409), reset dữ liệu mock.
- Đổi mức chất lượng 3D, bật giảm chuyển động, xem FPS.

**Chuyển trang:** mẫu số 8 ở tài liệu 02. Route mới thì cuộn về đầu trang. Quay lại (back) thì khôi phục vị trí cuộn cũ.

---

## 2. Trang chủ `/`

**Mục đích:** gây ấn tượng mạnh và kể câu chuyện của sàn: sự sống → phân loại → nguồn gốc → quy trình kiểm duyệt → mua. Đây chính là mẫu R mở rộng.
**Dữ liệu:** taxonomy (đếm nút), danh sách loài (mock: `GET /api/species`, xem tài liệu 04), `GET /api/products` (7 sản phẩm APPROVED), extras (nơi bản địa, ảnh).

| # | Khối | Bố cục và nội dung | Hiệu ứng riêng (chi tiết ở tài liệu 05) |
|---|---|---|---|
| 1 | **Khởi nguồn** (dính 520vh) | Canvas toàn màn hình, chữ chạy bên trái theo chương. **Chương 0** (hero): eyebrow "Bách khoa sinh học · Sàn sinh vật cảnh", H1 "Mọi loài đều có *quỹ đạo riêng.*" (gradient), mô tả, 2 nút "Khám phá cây phân loại" và "Vào cửa hàng", gợi ý "Cuộn để hạt đổi hình · rê chuột để đẩy hạt · bấm để tạo sóng". **Chương 1:** "25 bậc phân loại, 6 cấp". **Chương 2:** "Cả động vật lẫn cây ăn thịt". **Chương 3:** "9 loài từ khắp các lục địa". Chấm tiến độ dọc bên phải | `ParticleMorph`: thiên hà → ADN → lá → **Hành tinh BioNexus** bằng hạt (hạt dày ở lục địa, thưa ở biển) |
| 2 | **Hành tinh BioNexus** (dính 300vh, cùng canvas với khối 1) | Hạt đã thành địa cầu. Đường bờ biển và kinh vĩ tuyến tự vẽ dần ra, marker các loài xuất hiện, các cung sáng bay từ nơi bản địa về Việt Nam. Trái: danh sách 9 loài (ảnh nhỏ, tên, nơi bản địa, chấm IUCN). Cuộn hoặc bấm để chọn loài, địa cầu xoay tới loài đó. Phải dưới: thẻ loài có **ảnh thật**, nơi bản địa, toạ độ, nhiệt độ, độ ẩm, nút "Xem hồ sơ". Câu dẫn: "Nhân giống tại Việt Nam, gốc gác khắp thế giới" | `BioEarth`: ghép địa cầu bằng hạt và bằng nét vẽ, tự xoay tới loài đang chọn, kéo chuột để xoay |
| 3 | **Một loài** | "Bắt đầu từ một loài…" Ảnh axolotl thật phóng to tràn màn hình. Hiện: IUCN CR, tên "Axolotl", mô tả trong DB, đường phân loại | `ZoomReveal` (dính 280vh) |
| 4 | **Khí hậu nuôi** | H2 "Mỗi loài cần một khoảng nhiệt riêng". Thanh nhiệt độ cho 9 loài (lấy từ `environmentSpecs` qua bộ phân tích, có ảnh nhỏ mỗi dòng), màu theo nhóm (bò sát `--warm`, lưỡng cư `--ocean`, cây ăn thịt `--success`) | Thanh mọc dài từ trái sang khi vào khung nhìn, lệch nhau 70 ms |
| 5 | **Chuỗi xoắn sự sống** (dính 460vh) | Chuỗi xoắn ảnh loài 3D bên phải. Trái trên: tiêu đề và tiến độ %. Trái dưới: panel kính đổi theo loài ở phía trước (IUCN, 6 bậc phân loại, sản phẩm đang bán kèm nút thêm vào giỏ). Cuối khối có nút "Mở cây phân loại" | `HelixScene` |
| 6 | **Quy trình** | H2 "Từ cây phân loại *đến giỏ hàng*". Trái: 5 bước (Bách khoa, Hồ sơ loài, Người bán, Kiểm duyệt, Giỏ hàng). Phải: panel "paper island" dính, minh hoạ bước đang xem (cây phân loại của nắp ấm Rajah; thẻ hồ sơ loài; 4 shop với trạng thái thật; thẻ sản phẩm PENDING thật "Rồng Úc Hypo Baby" chuyển sang APPROVED; giỏ hàng có cảnh báo vượt kho) | `StickySteps` |
| 7 | **Đang bán** | H2 "Nhân giống tại Việt Nam". Hàng thẻ sản phẩm ngang kéo được bằng chuột hoặc vuốt, có nút trước/sau. Chip lọc theo nhóm. Thẻ có ảnh thật, shop, giá, nút thêm vào giỏ | Thẻ hiện kiểu BlurFade; hover thì ảnh phóng nhẹ và đổi sang ảnh thứ 2 |
| 8 | **Cửa hàng uy tín** | 2 shop ACTIVE (BioGreen Exotic, Carnivora Garden). Mỗi thẻ: ghép 3 ảnh sản phẩm thật, tên shop, bio, số sản phẩm đang bán, huy hiệu "Đã kiểm duyệt" | Ảnh ghép lệch nhau khi vào khung nhìn |
| 9 | **Kết** | Panel lớn bo `--r-2xl`: 5 ảnh loài xếp so le, H2 "9 loài. 7 sản phẩm. *Một quy trình rõ ràng.*" (**số lấy từ dữ liệu**), nút "Bắt đầu mua sắm" | Glow hai góc; ảnh trượt lên lệch nhau |

**Mobile:**
- Khối 1–2: số hạt theo mức chất lượng (mức `low` là 8.000, tài liệu 05). Chữ chương nằm dưới canvas, canvas chiếm 60vh phía trên.
- Danh sách loài ở khối 2 thành hàng chip cuộn ngang. Thẻ loài là sheet ở đáy.
- Khối 5 thay bằng carousel thẻ loài cuộn ngang có snap. Không dùng 3D trên mobile mức thấp.
- Khối 6: panel đặt dưới mỗi bước, không dính.

**Xong khi:**
- Cuộn hết trang mượt, đúng thứ tự khối.
- Chữ không đè lên phần quan trọng của cảnh 3D. So với `reference/screens/r-01…r-12` thì cùng tinh thần, và bản mới đẹp hơn ở khối 2 (địa cầu ghép) và khối 7–8 (ảnh thật).

---

## 3. Cây phân loại `/taxonomy` và `/taxonomy/:id`

**Mục đích:** duyệt Giới → Ngành → Lớp → Bộ → Họ → Chi → Loài, trực quan như mở thư mục, và thấy ảnh thật của các loài bên dưới mỗi nhánh.
**Dữ liệu:** `GET /api/taxonomy`, `/taxonomy/{id}` (nút và breadcrumbs), `/taxonomy/{id}/children`, `/taxonomy/{id}/species`.

**Bố cục desktop:**
1. **Đầu trang:** breadcrumb (có thể bấm), H1 là `scientificName` của nút (**in nghiêng chỉ ở cấp Chi và Loài**, theo quy ước danh pháp), dưới là `commonName`, chip cấp ("Bộ · ORDER"). Có một câu giải thích cấp đó, ví dụ "Bộ gom các họ có chung tổ tiên".
2. **Công tắc chế độ xem** (SegmentedControl): **Cột** (mặc định) | **Chuỗi xoắn 3D**.
3. **Chế độ Cột (Miller columns):**
   - Mỗi cột là một cấp, từ gốc tới nút đang chọn. Mỗi dòng có tên khoa học, tên thường, số nút con (khi đã biết), và chồng 3 ảnh nhỏ của các loài thuộc nhánh đó.
   - Dòng đang chọn sáng `--accent`. Một tia sáng (AnimatedBeam) nối từ dòng đó sang cột kế tiếp.
   - Cột cuối ở cấp Chi là các **thẻ loài**: ảnh 4:5, IUCN, tên, số sản phẩm đang bán.
   - Bấm một dòng thì cập nhật URL `#/taxonomy/:id` (lịch sử đúng, back được).
4. **Panel phải** (dính): tóm tắt nhánh gồm số loài, số sản phẩm đang bán, ghép ảnh các loài trong nhánh, và nút "Xem tất cả loài trong nhánh" dẫn tới `/species?node=:id`.
5. **Chế độ Chuỗi xoắn 3D:** `HelixScene` chỉ gồm các loài thuộc nhánh đang chọn (ít loài thì lặp lại cho đủ 14 bậc). Panel loài như khối 5 của trang chủ.

**Hiệu ứng:**
- Cột mới trượt vào từ phải (x 24→0, BlurFade).
- Tia sáng vẽ lại mỗi khi đổi lựa chọn.
- Ảnh trong chồng xoè nhẹ khi hover.

**Trạng thái:**
- Nút không tồn tại (404) thì hiện "Không tìm thấy nhánh này" kèm nút về gốc.
- Nút lá không có loài thì hiện "Chưa có loài nào ở nhánh này".

**Mobile:**
- Chỉ hiện một cột mỗi lúc, kiểu drill-down, có nút quay lại.
- Breadcrumb thu gọn thành "… › Squamata › Python".
- Chế độ 3D chuyển thành carousel.

**Xong khi:** duyệt Animalia → Chordata → Reptilia → Squamata → Pythonidae → Python thì thấy 2 loài: Trăn bóng (NT) và Trăn đất (VU). Con của Squamata có 3 họ.

---

## 4. Bách khoa loài `/species`

**Mục đích:** xem toàn bộ loài, lọc nhanh, và đi tới hồ sơ loài.
**Dữ liệu:** `GET /api/species` (endpoint **đề xuất**, xem tài liệu 04). Query `?node=` lọc theo nhánh (mock tính bằng cây phân loại).

**Bố cục:**
1. **Hero ngắn:** H1 "Bách khoa loài". Dải 5 ô IUCN, mỗi ô có số loài chạy bằng Ticker và màu chuẩn. Bấm ô nào thì lọc theo mức đó.
2. **Thanh lọc dính:**
   - Ô tìm (không phân biệt dấu).
   - Chip nhóm: Tất cả, Bò sát, Lưỡng cư, Cây ăn thịt. Nhóm suy ra từ lớp hoặc bộ trong breadcrumbs, có dự phòng bằng extras.
   - Chọn nhiều mức IUCN.
   - Sắp xếp: A→Z, nguy cấp nhất trước.
   - Công tắc **Lưới** | **Bản đồ**.
3. **Lưới:** `SpeciesCard`, 4 cột desktop, 2 cột mobile.
   - Ảnh 4:5 thật, phủ gradient dưới.
   - Tên thường, tên khoa học in nghiêng, IUCN, nơi bản địa, "N sản phẩm đang bán".
   - Hover: ảnh phóng nhẹ, hiện đường phân loại rút gọn.
4. **Bản đồ:** `BioEarth` hiện đủ 9 marker. Hover marker thì hiện ảnh. Bên cạnh có danh sách đồng bộ với marker. Chỉ tải 3D khi bật chế độ này.

**Trạng thái:** lọc ra rỗng thì hiện "Không có loài nào khớp", gợi ý bỏ bớt bộ lọc, nút "Xoá lọc". Bộ lọc lưu trên URL query.

**Xong khi:** 9 loài hiện đúng. Lọc VU ra 3 loài (Trăn đất, Rùa Hermann, Cây bắt ruồi Venus).

---

## 5. Hồ sơ loài `/species/:id`

**Mục đích:** trang "tạp chí khoa học" của từng loài. Ảnh thật lớn, dữ liệu rõ ràng, nối tới sản phẩm đang bán.
**Dữ liệu:** `GET /api/species/{id}`, `GET /api/taxonomy/{nodeId}` (lấy breadcrumbs làm đường phân loại), `GET /api/products?speciesId=`, `GET /api/taxonomy/{nodeId}/species` (loài cùng chi), extras.

**Bố cục:**
1. **Hero toàn màn hình:**
   - Ảnh thật lớn nhất của loài, có `objectPosition` riêng.
   - Phủ gradient trái và dưới để đọc chữ.
   - Chữ dùng MaskText: eyebrow là nhóm và nơi bản địa, H1 là `commonName` bỏ phần ngoặc tiếng Anh (Display XL), dòng tên khoa học bằng serif italic, IucnBadge lớn.
   - Dưới cùng là `TaxonPath` gọn, 6 cấp có link.
   - Cuộn thì ảnh phóng nhẹ và chữ mờ dần (parallax). Góc ảnh có chip nguồn ảnh.
2. **Bento thông tin** (lưới 12 cột):
   - **Nhiệt độ:** `ClimateBar` cho khoảng nhiệt chính, có điểm sưởi nếu có.
   - **Độ ẩm:** vòng tiến độ.
   - **Môi trường:** chữ, kèm ảnh môi trường sống thật nếu có.
   - **Nơi bản địa:** `BioEarth` mini (chỉ 1 marker, 1 cung về Việt Nam, 12.000 hạt), tên nơi và toạ độ.
   - **Mức bảo tồn:** thang 7 mức IUCN, mức của loài sáng lên, kèm một câu giải thích.
   - **Nguồn tham khảo:** link GBIF (`referenceURL`).
3. **Mô tả:** đoạn `description` in to (Body L), có một trích dẫn lớn bằng serif.
4. **Bộ ảnh:** masonry 6–8 ảnh thật, bấm mở lightbox (phím ←/→/Esc), mỗi ảnh có nguồn.
5. **Đường phân loại:** chuỗi dọc 6 nút nối bằng tia sáng chạy, mỗi nút dẫn tới trang phân loại tương ứng.
6. **Đang bán:** thẻ sản phẩm của loài. Rỗng thì hiện "Chưa có cửa hàng nào bán loài này" kèm các loài gợi ý.
7. **Cùng chi hoặc cùng họ:** 2–4 `SpeciesCard`.

**Lưu ý:**
- `environmentSpecs` là chuỗi (ví dụ "Nhiệt độ: 26-32°C (điểm sưởi 38-42°C), Độ ẩm: 30-40%, Môi trường: …").
- Phân tích bằng `lib/parseEnvironmentSpecs.ts`, có test cho đủ 9 chuỗi trong seed.
- Không phân tích được thì hiện nguyên chuỗi, không vỡ giao diện.

**Mobile:** hero cao 78vh, bento xếp 1 cột, địa cầu mini thay bằng ảnh tĩnh ở mức chất lượng thấp.

**Xong khi:** đủ 9 loài hiện đẹp, không loài nào thiếu ảnh. Axolotl có thanh nhiệt 14–18°C, IUCN CR, 1 sản phẩm.

---

## 6. Cửa hàng `/products`

**Mục đích:** mua sắm nhanh, lọc tốt, ảnh đẹp.
**Dữ liệu:** `GET /api/products?speciesId=&q=&page=&size=12`. Giao diện chịu được cả khi API trả mảng (khi đó phân trang ở client).

**Bố cục:**
1. **Đầu trang:** H1 "Cửa hàng", câu phụ "Mọi cá thể đều nhân giống nhân tạo và đã qua kiểm duyệt", tổng số sản phẩm (Ticker).
2. **Dải nổi bật:** 3 sản phẩm ảnh lớn (tỉ lệ 2:1:1), hiệu ứng ken-burns nhẹ.
3. **Cột lọc** (desktop, dính; mobile là Sheet):
   - Ô tìm.
   - Nhóm.
   - Loài (Combobox có ảnh nhỏ).
   - Khoảng giá (Slider, hiển thị VND).
   - "Chỉ còn hàng".
   - Mức IUCN.
   - Lọc theo loài và từ khoá thì gọi API. Các lọc khác lọc ở client và ghi chú trong HANDOFF.
4. **Lưới** `ProductCard`, 3 cột desktop, 2 cột mobile:
   - Ảnh 4:5. Hover đổi sang ảnh thứ 2.
   - Chấm IUCN, tên, shop (`shopName` nếu có, không thì "Cửa hàng #id"), giá, "Còn N".
   - Nút thêm nhanh: icon +, có animation bay vào giỏ.
5. **Sắp xếp:** mới nhất, giá tăng dần, giá giảm dần.
6. **Phân trang** (Pagination): trang hiện tại ghi lên URL.

**Trạng thái:**
- Không có kết quả thì hiện gợi ý loài phổ biến.
- Sản phẩm SOLD_OUT không xuất hiện ở đây (API chỉ trả APPROVED).

**Xong khi:** đúng 7 sản phẩm. Tìm "gecko" ra 2 sản phẩm. Lọc loài Trăn bóng ra 1 sản phẩm.

---

## 7. Chi tiết sản phẩm `/products/:id`

**Mục đích:** chốt mua.
**Dữ liệu:** `GET /api/products/{id}`, `GET /api/species/{speciesId}`, `GET /api/products?speciesId=`, giỏ hàng (để biết đã có trong giỏ bao nhiêu).

**Bố cục:**
1. **Trái 7/12:** ảnh chính lớn, có kính lúp khi hover (component Lens) và nút mở lightbox. Bên dưới là hàng ảnh nhỏ (ảnh sản phẩm và ảnh loài).
2. **Phải 5/12, dính:**
   - Breadcrumb (Cửa hàng › Nhóm › Loài), H1 `productName`.
   - Shop (ShopChip, huy hiệu "Đã kiểm duyệt"), giá lớn.
   - Trạng thái kho: "Còn 5 cá thể", "Chỉ còn 2" (màu `--warm`) hoặc "Hết hàng".
   - NumberStepper (1 đến tồn kho trừ số đã có trong giỏ).
   - Nút "Thêm vào giỏ" (chính) và "Mua ngay" (phụ, dẫn tới `/checkout` với một món).
   - 3 cam kết có icon: Nhân giống nhân tạo, Có giấy tờ nguồn gốc, Đã qua kiểm duyệt.
3. **Tabs:**
   - **Mô tả:** `description`.
   - **Về loài này:** thẻ loài (ảnh, IUCN, khí hậu, link hồ sơ).
   - **Vận chuyển và chăm sóc:** văn bản mẫu, đánh dấu `TODO: chủ dự án duyệt` trong `content/copy.ts`. **Không tự viết hướng dẫn nuôi.**
4. **Sản phẩm khác cùng loài**, rồi "Có thể bạn thích" (cùng nhóm).

**Luật nút mua:**
- Chưa đăng nhập: bấm thì mở Dialog "Đăng nhập để mua", sau khi đăng nhập quay lại đúng trang.
- Sản phẩm của chính shop mình: nút bị khoá, ghi chú "Đây là sản phẩm của shop bạn" (theo `ORDER_OWN_PRODUCT`).
- SOLD_OUT: ảnh thang xám, nút "Hết hàng" bị khoá.
- Lỗi 409 khi thêm: toast có câu của server, rồi tải lại sản phẩm.

**Mobile:** thanh mua dính ở đáy (giá và nút thêm). Ảnh thành carousel vuốt.

**Xong khi:**
- Thêm vào giỏ thì icon giỏ tăng số, có animation bay.
- Thêm vượt kho thì toast lỗi đúng câu.
- Đăng nhập `nguyenvana` mở sản phẩm của BioGreen thì nút bị khoá.

---

## 8. Giỏ hàng `/cart`

**Dữ liệu:** `GET /api/cart`, `PUT` và `DELETE /api/cart/items/{productId}`, `DELETE /api/cart`.

**Bố cục:**
1. **Trái:** danh sách món. Mỗi dòng có:
   - Ảnh 1:1, tên, link loài, đơn giá hiện tại.
   - NumberStepper (giới hạn bởi `maxQuantity`), thành tiền.
   - Nút xoá, có toast "Đã bỏ … · Hoàn tác".
2. **Cảnh báo trên từng dòng:**
   - `available = false`: dòng mờ, nhãn đỏ "Sản phẩm không còn bán", không tính vào tổng.
   - `quantity > maxQuantity`: viền `--warm`, dòng chữ "Kho chỉ còn N cá thể", nút "Giảm về N".
3. **Phải, dính:** tóm tắt gồm tạm tính (Ticker), số món, ghi chú "Giá được chốt khi đặt hàng", nút "Đặt hàng".
   - Nút bị khoá khi còn cảnh báo, kèm lý do ngay dưới nút.
   - Có link "Xoá giỏ hàng" (mở dialog xác nhận).
4. **Gợi ý:** "Có thể bạn cũng thích".

**Giỏ rỗng:** ghép ảnh mờ của 3 loài, câu "Giỏ hàng đang trống", nút "Vào cửa hàng".

**Hiệu ứng:**
- Đổi số lượng thì tổng chạy số.
- Xoá dòng thì dòng co lại (`AnimatePresence` + `layout`).

**Xong khi:**
- `levanc` thấy 2 món, tạm tính 2.950.000 ₫.
- `phamthid` thấy 2 cảnh báo và không đặt được.

---

## 9. Đặt hàng `/checkout`

**Dữ liệu:** `GET /api/me` (lấy địa chỉ có sẵn), `GET /api/cart`, `POST /api/orders`.

**Luồng 2 bước** (thanh bước trên cùng, `layoutId`):
1. **Địa chỉ giao:**
   - Textarea điền sẵn `address` của tài khoản.
   - Validate: tối thiểu 10 ký tự (`ORDER_INVALID_SHIPPING_ADDRESS`).
   - Có lựa chọn "Dùng địa chỉ mặc định".
2. **Xác nhận:**
   - Danh sách món, tổng tiền.
   - Lưu ý: "Kho được kiểm tra lại khi đặt. Nếu một món đã hết, đơn sẽ không được tạo và giỏ giữ nguyên".
   - Nút "Đặt hàng". Đang gửi thì khoá nút và hiện spinner.
   - Mua ngay: gửi `items: [{productId, quantity}]`. Mua cả giỏ: bỏ `items`.

**Kết quả:**
- **201:** chuyển tới `/orders/:id?new=1`.
- **409:** dialog liệt kê món lỗi, nút "Về giỏ hàng".
- **401:** đăng nhập lại rồi quay về đúng bước đang làm.

**Xong khi:**
- `levanc` đặt cả giỏ thành công: kho giảm (thấy được ở trang sản phẩm), giỏ rỗng, đơn mới xuất hiện.
- `phamthid` đặt hàng nhận 409, giỏ giữ nguyên.

---

## 10. Đơn của tôi `/orders` và chi tiết `/orders/:id`

**Dữ liệu:** `GET /api/orders/mine`, `GET /api/orders/{id}`.

**Danh sách:**
- Tabs lọc: Tất cả, Đang xử lý (PENDING), Hoàn tất, Đã huỷ.
- Mỗi thẻ đơn có: mã đơn (mono), ngày, StatusPill, chồng ảnh nhỏ của các món, tổng tiền, nút "Xem".

**Chi tiết:**
- Đầu trang: mã đơn và trạng thái.
- **Dòng thời gian trạng thái**: Đã đặt → Đang xử lý → Hoàn tất, hoặc nhánh Đã huỷ.
- Danh sách món với **đơn giá lúc mua** (`unitPrice`), địa chỉ, tổng tiền.
- Nút "Mua lại": thêm lại các món còn bán vào giỏ.

**Trạng thái `?new=1`:**
- Có lời chúc mừng: vòng tròn tick vẽ dần (SVG stroke) và một chùm hạt nhỏ bằng Motion (không dùng WebGL).
- Dòng chữ "Đặt hàng thành công · ORD-2026-xxxxxx".

**Xong khi:** `levanc` thấy ORD-2026-0001 (PENDING, 2.050.000 ₫) và ORD-2026-0002 (COMPLETED, 590.000 ₫).

---

## 11. Tài khoản `/account`

**Dữ liệu:** `GET /api/me`.

**Bố cục:**
1. **Thẻ hồ sơ:** avatar chữ cái trên nền gradient, họ tên, username, email, điện thoại, địa chỉ, trạng thái.
   - Chỉ đọc. API sửa hồ sơ chưa có nên ghi vào HANDOFF.
2. **Khối "Shop của bạn"**, theo trạng thái:
   - Chưa có shop: thẻ mời "Mở shop" (ảnh thật nền), nút tới `/seller/apply`.
   - **PENDING:** dòng thời gian "Đã gửi → Chờ duyệt → Hoạt động", bước giữa nhấp nháy.
   - **ACTIVE:** tên shop, số sản phẩm, nút "Vào shop".
   - **REJECTED:** thông báo, hướng dẫn liên hệ quản trị.
   - **BANNED:** thông báo khoá.
3. Lối tắt: Đơn hàng, Giỏ hàng, Đăng xuất.

**Account layout:** sidebar trái (Tài khoản, Đơn hàng, Shop) trên desktop, tabs trên mobile.

---

## 12. Đăng nhập, đăng ký, đăng nhập quản trị

**Bố cục chung:** chia đôi màn hình.
- **Trái 55%:** trình chiếu ảnh loài thật toàn khung, mỗi ảnh hiện 6 s, zoom chậm kiểu Ken Burns, chuyển cảnh bằng vòng tròn mở rộng (kiểu mẫu N). Góc ảnh ghi tên loài và nguồn ảnh.
- **Phải:** form trên nền kính.
- **Mobile:** ảnh thu thành dải 30vh phía trên.

**Đăng nhập `/login`:**
- Ô username, password (nút hiện/ẩn mật khẩu), nút "Đăng nhập". Có link "Tạo tài khoản" và "Đăng nhập quản trị".
- Lỗi 401: một câu chung ngay trên form ("Sai tài khoản hoặc mật khẩu").
- Lỗi 403: câu riêng cho tài khoản bị khoá và tài khoản chưa kích hoạt.
- Thành công: về `next` hoặc trang chủ, toast "Chào mừng trở lại, Lê Văn C".
- DevPanel có các nút điền nhanh tài khoản seed.

**Đăng ký `/register`:**
- Các trường theo `RegisterRequest`: username, password (có thanh độ mạnh), xác nhận mật khẩu, họ tên, email, điện thoại, địa chỉ.
- Luật zod:
  - username 4–30 ký tự `[a-z0-9_]`
  - mật khẩu ≥ 6 ký tự
  - email hợp lệ
  - số điện thoại Việt Nam `^(0|\+84)\d{9}$`
- Lỗi 409 gắn đúng ô: `USER_USERNAME_EXISTS` vào ô username, `USER_EMAIL_EXISTS` vào ô email.
- Thành công (201, có token): tự đăng nhập luôn.

**Quản trị `/admin/login`:**
- Cùng bố cục nhưng ảnh trái là thảm thực vật tối và có huy hiệu "Khu vực quản trị".
- Gọi `POST /api/auth/admin/login`. Thành công thì vào `/admin`.

---

## 13. Người bán

**Mở shop `/seller/apply`:**
- Đã có shop thì chuyển về `/account`.
- Trái: form gồm tên shop, link giấy phép kinh doanh (URL, có ghi chú "Bản này nhận đường dẫn, chưa có tải file"), giới thiệu.
- Phải: **xem trước thẻ shop** dạng paper island, cập nhật theo từng ký tự gõ.
- Gửi thành công (201): màn hình trạng thái PENDING có dòng thời gian.
- Lỗi 409: `SELLER_ALREADY_REGISTERED`, `SELLER_SHOP_NAME_EXISTS`.

**Shop của tôi `/seller`:**
- Đầu trang: tên shop, StatusPill, bio.
- 4 `StatTile` (Ticker): Đang bán, Chờ duyệt, Bị từ chối, Hết hàng.
- Bảng sản phẩm, có tabs theo trạng thái: ảnh, tên, loài, giá, kho, trạng thái. Dòng PENDING có nhãn "Đang chờ kiểm duyệt".
- Nút "Đăng sản phẩm".
- Shop chưa ACTIVE: thay bảng bằng thẻ giải thích trạng thái.
- **Không vẽ biểu đồ doanh thu** (chưa có dữ liệu thật, không bịa).

**Đăng sản phẩm `/seller/products/new`:**
- Trái là form:
  - Loài (Combobox có ảnh, IUCN, tên khoa học).
  - Tên sản phẩm, giá (ô nhập định dạng VND), số lượng, mô tả.
  - Ảnh: URL kèm xem trước. Thêm nút "Chọn từ thư viện ảnh loài" (dùng ảnh trong `public/photos` cho demo).
- Phải, dính: `ProductCard` xem trước cập nhật trực tiếp, có thẻ "PENDING".
- Gửi thành công (201): toast "Đã gửi, đang chờ kiểm duyệt", về `/seller` và tô sáng dòng mới.
- Lỗi 403 `SELLER_NOT_ACTIVE`: hiện thẻ trạng thái shop.

**Xong khi:**
- `nguyenvana` đăng được, sản phẩm vào PENDING.
- `tranthib` (shop PENDING) thấy trạng thái chờ duyệt, không thấy form.

---

## 14. Quản trị (Admin layout)

**Layout:**
- Sidebar trái: Tổng quan, Duyệt shop, Duyệt sản phẩm, Quản lý loài. Mục nào không đủ quyền thì ẩn.
- Thanh trên: tên admin, huy hiệu vai trò, nút đăng xuất.
- Phong cách đặc hơn, nhiều dữ liệu hơn nhưng vẫn cùng token màu. Ít hiệu ứng.

**Tổng quan `/admin`:**
- 3 StatTile: Shop chờ duyệt, Sản phẩm chờ duyệt, Loài trong bách khoa.
- Hai hàng đợi xem nhanh, mỗi hàng 3 mục. Có lối tắt.

**Duyệt shop `/admin/sellers`:**
- Tabs trạng thái (mặc định PENDING).
- Bố cục danh sách trái, chi tiết phải.
- Chi tiết gồm: tên shop, chủ shop, bio, link giấy phép (nút "Mở giấy phép"; không có thì cảnh báo "Thiếu giấy phép").
- Nút "Duyệt" (ACTIVE), "Từ chối" (REJECTED), "Khoá" (với shop ACTIVE → BANNED), có dialog xác nhận.
- Hiệu ứng: thẻ bay ra khỏi hàng đợi (duyệt thì trượt phải và xanh, từ chối thì trượt trái và đỏ). Mục kế tiếp tự được chọn.
- Phím tắt: `J`/`K` di chuyển, `A` duyệt, `R` từ chối (có chú thích phím trên màn hình).

**Duyệt sản phẩm `/admin/products`:**
- Cùng mẫu với duyệt shop.
- Phần chi tiết có **khối đối chiếu**: ảnh sản phẩm đặt cạnh ảnh chuẩn của loài khai báo, kèm tên khoa học, IUCN, giá, kho, shop. Mục đích là giúp kiểm duyệt viên thấy sản phẩm có đúng loài không.
- Ví dụ: "Rồng Úc Hypo Baby" (PENDING) duyệt xong thì xuất hiện ở trang Cửa hàng (8 sản phẩm).

**Quản lý loài `/admin/species`** (BIOLOGIST, SUPER_ADMIN):
- Bảng 9 loài (ảnh, tên, chi, IUCN).
- Nút "Thêm loài" mở Sheet chứa form: chọn chi, tên khoa học, tên thường, IUCN, môi trường, mô tả, URL ảnh, URL tham khảo.
- Endpoint `POST /api/admin/species` thuộc loại "làm nếu còn thời gian", mock vẫn hỗ trợ.

**Quyền:**
- `biologist1` vào duyệt sản phẩm thì thấy trang 403.
- `moderator1` không thấy mục Quản lý loài.

---

## 15. Trang phụ

- **Nguồn ảnh `/credits`:**
  - Nhóm theo loài.
  - Mỗi ảnh có: ảnh nhỏ, tiêu đề, tác giả, giấy phép (có link), link gốc.
  - Đầu trang có một câu cảm ơn Wikimedia Commons và các tác giả.
- **404:**
  - Mức chất lượng cao: dùng `ParticleMorph` với một hình là chữ "404" bằng hạt, rê chuột để đẩy hạt.
  - Mức khác: chữ lớn gradient.
  - Câu "Nhánh này chưa có trên cây phân loại", kèm các nút Trang chủ, Cửa hàng, Tìm (⌘K).
- **403:** câu giải thích và nút về trang phù hợp với vai trò.
- **Lỗi chung (errorElement):** "Có lỗi xảy ra", nút "Tải lại", chi tiết lỗi chỉ hiện ở chế độ dev.
- **Mất mạng:** băng mỏng phía trên "Bạn đang offline".
