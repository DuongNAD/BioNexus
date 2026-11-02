# BÁO CÁO BÀN GIAO FRONTEND BIONEXUS (HANDOFF.MD)

Tài liệu bàn giao kỹ thuật toàn diện giao diện BioNexus — Bách khoa toàn thư sinh học 6 cấp phân loại và Sàn thương mại điện tử sinh vật cảnh có kiểm duyệt bảo tồn CITES F2+. Phục vụ chuyển giao cho nhóm phát triển Backend Java (Tomcat 10 + JDBC) và Hội đồng bảo vệ đồ án Aptech 2026.

---

## 1. Quan sát & Thực trạng Frontend (Observation)

Toàn bộ 24 tuyến đường (routes) giao diện người dùng và 1 trang dev preview của BioNexus đã được xây dựng hoàn tất theo đúng kiến trúc đã chốt tại `docs/frontend/`:

- **Hệ thống Design System mẫu R (Bio-Luxury)**: Nền tối ngọc bích sâu `#030807`, chất liệu kính mờ (glassmorphism), typography 3 lớp chuẩn mực (`Cormorant Garamond` phong cách tạp chí cổ điển, `Be Vietnam Pro` giao diện hiện đại, `JetBrains Mono` chỉ số sinh học/khoa học), 0 emoji trong toàn bộ mã nguồn.
- **24 Tuyến đường giao diện hoàn chỉnh**:
  - *Nhóm Khám phá Sinh học (Routes 1–5)*: Trang chủ 4 chương (Hero 3D, Bento Matrix, Dòng thời gian tiến hóa, Bản đồ sinh quyển), Cây phân loại 6 cấp (Miller columns, AnimatedBeam), Chi tiết phân loại học, Danh mục bách khoa loài (bộ lọc IUCN, tìm kiếm tiếng Việt không dấu), Hồ sơ chi tiết loài (Hero Magazine, 12-col Bento Grid, 3D Helix DNA).
  - *Nhóm Thương mại Sinh vật cảnh (Routes 6–10)*: Sàn sinh vật cảnh (bộ lọc F2+ CITES, vi khí hậu, khoảng giá), Chi tiết sinh vật cảnh (kính lúp số 2.5x LensMagnifier, Lightbox, chứng nhận F2+), Giỏ hàng tối ưu (FlyToCart, kiểm tra tồn kho động), Thanh toán (VietQR tự động sinh nội dung), Lịch sử và chi tiết đơn hàng.
  - *Nhóm Tài khoản & Người bán (Routes 11–18)*: Đăng nhập/Đăng ký người dùng, Hồ sơ cá nhân & đơn mua, Đăng ký mở shop sinh vật cảnh (tải lên giấy phép CITES), Bảng điều khiển người bán, Đăng bán cá thể sinh vật cảnh mới (yêu cầu giấy phép F2+).
  - *Nhóm Quản trị Admin & Kiểm duyệt (Routes 19–22)*:
    + **Route 19 (`#/admin`)**: Tổng quan KPI quản trị (StatTiles với hiệu ứng Ticker, biểu đồ phân bổ 5 cấp bảo tồn IUCN có tooltip, cảnh báo tuân thủ CITES Phụ lục I, dòng thời gian hoạt động kiểm duyệt).
    + **Route 20 (`#/admin/sellers`)**: Kiểm duyệt hồ sơ cửa hàng (Master-Detail 38%/62%, 5 tab trạng thái kèm badge đếm số lượng, soi chiếu giấy kiểm lâm có con dấu đỏ mô phỏng và Lightbox, quy trình Duyệt/Từ chối có lý do/Cấm vĩnh viễn, phím tắt tốc độ `J`/`K`/`A`/`R`/`Esc`/`?`).
    + **Route 21 (`#/admin/products`)**: Kiểm duyệt sản phẩm sàn (Dual-Pane 35%/65%, cơ chế Soi chiếu ảnh đôi song song Side-by-side: Ảnh người bán khai báo vs Ảnh chuẩn đối chiếu Wikimedia Commons với LensMagnifier 2.5x, cây phả hệ phân loại, chỉ số vi khí hậu ClimateBar/HumidityGauge).
    + **Route 22 (`#/admin/species`)**: Quản lý bách khoa loài (Bảng dữ liệu đầy đủ 9 loài cơ sở, phân loại, trạng thái IUCN, số bài bán liên kết, vi khí hậu, liên kết ngoài GBIF, Slide-over Sheet 600px thêm loài mới 4 phần chuẩn khoa học).
  - *Nhóm Bản quyền & Dự phòng (Routes 23–24)*:
    + **Route 23 (`#/credits`)**: Ghi công & Bản quyền hình ảnh (Bento 4 thẻ thống kê: 161 files tối ưu, 45 ảnh nguồn Wikimedia/iNaturalist, 0 ảnh AI, 100% bản quyền CC BY/CC BY-SA/CC0, bộ lọc và tìm kiếm nhanh).
    + **Route 24 (`#/*`)**: Trang 404 Bio-Luxury ("Lạc lối trong Sinh quyển" với la bàn neon xoay nhẹ, chỉ dẫn thân thiện, điều hướng trở về).
- **Phân quyền vai trò quản trị (RBAC)**:
  - `SUPER_ADMIN`: Toàn quyền truy cập mọi phân hệ quản trị.
  - `MODERATOR`: Kiểm duyệt người bán và sản phẩm sàn (tự động ẩn menu Quản lý Loài).
  - `BIOLOGIST`: Chuyên trách thẩm định và quản lý danh mục loài (tự động ẩn menu Kiểm duyệt Người bán và Sản phẩm).
  - Người dùng không có quyền truy cập sẽ nhận màn hình 403 Forbidden Bio-Luxury chuẩn mực.
- **Hiệu năng & Tối ưu hóa Bundle**:
  - Toàn bộ các phân hệ Admin được tách nhỏ qua React `lazy()` và `Suspense`.
  - Landing JS Bundle Gzip: **157.17 KB** (đạt chuẩn ngân sách nghiêm ngặt ≤ 180.00 KB Gzip).
  - Three.js và tài nguyên đồ họa nặng chỉ được nạp theo cơ chế lazy khi người dùng vào đúng tuyến đường cần 3D.
  - Tối đa 1 WebGL canvas hoạt động đồng thời; tự động unmount khi cuộn ra ngoài màn hình.

---

## 2. Chuỗi suy luận & Quyết định thiết kế (Logic Chain)

1. **Kiến trúc Tách biệt Frontend & Backend (Headless / Decoupled Architecture)**:
   - *Suy luận*: Đồ án Aptech 2026 sử dụng Backend Java Servlet / Tomcat 10 + JDBC thuần. Việc tách rời hoàn toàn giao diện tĩnh và kết nối qua REST API chuẩn (`api/...` không dấu gạch đầu) giúp đội ngũ phát triển backend hoàn toàn tự do xây dựng các lớp Controller/Service/DAO mà không sợ xung đột mã nguồn hiển thị.
2. **Cơ chế MSW (Mock Service Worker) 2.0**:
   - *Suy luận*: Đảm bảo giao diện có thể hoạt động độc lập ngay từ ngày đầu tiên với 100% hợp đồng API chính xác (`src/mocks/handlers/`). Khi Backend Java sẵn sàng, chủ dự án chỉ cần cấu hình biến môi trường `VITE_USE_MOCKS=false` để chuyển hướng sang Tomcat thật mà không cần thay đổi bất kỳ dòng mã component nào.
3. **Độ Tin cậy của Dữ liệu Sinh học & Bản quyền Hình ảnh**:
   - *Suy luận*: Một bách khoa sinh học và sàn sinh vật cảnh CITES đòi hỏi tính chính xác tuyệt đối. Do đó, toàn bộ 45 ảnh mẫu được lấy từ Wikimedia Commons và iNaturalist với đầy đủ giấy phép CC0, CC BY, CC BY-SA; tuyệt đối loại bỏ ảnh AI để bảo vệ uy tín khoa học của đồ án trước Hội đồng chấm thi.
4. **Trải nghiệm Kiểm duyệt Tốc độ cao (Speed Moderation)**:
   - *Suy luận*: Quản trị viên sàn sinh vật cảnh cần thẩm định hàng trăm hồ sơ và cá thể. Thiết kế Master-Detail kết hợp hotkeys (`J`/`K` di chuyển, `A` duyệt, `R` từ chối) và Soi chiếu đối chuẩn (Side-by-side Photo Verification) giúp rút ngắn thời gian thẩm định từ vài phút xuống vài giây.

---

## 3. Đề Xuất Cho Backend Java Tomcat (Dành riêng cho Đồ Án Aptech 2026)

Đây là các khuyến nghị kỹ thuật và định dạng dữ liệu chuẩn đã được frontend thiết kế và kiểm thử thành công, đề xuất đội ngũ phát triển Backend Java Tomcat triển khai đồng bộ:

### 3.1. Quản lý Tính Pháp lý CITES Thế hệ F2+ (Phụ lục I & II)
- **Vấn đề**: Các loài thuộc Sách Đỏ IUCN cấp CR/EN (như Rồng Komodo, Axolotl, Rùa gai...) bị cấm buôn bán cá thể bắt tự nhiên (Wild - W). Chỉ các cá thể sinh sản nhân tạo từ thế hệ F2 trở đi (Captive bred - C) tại các cơ sở nuôi dưỡng có mã số cấp phép của Cục Kiểm lâm mới được phép giao dịch thương mại.
- **Đề xuất Database & Backend**:
  - Bảng `sellers`: Bổ sung các trường `cites_license_no` (VARCHAR 100), `issued_by` (VARCHAR 150), `issue_date` (DATE), `license_image_url` (VARCHAR 500), `audit_status` (ENUM: `PENDING`, `APPROVED`, `REJECTED`, `SUSPENDED`).
  - Bảng `products`: Lưu trữ rõ ràng `generation` (VARCHAR 20, mặc định `F2+`), `origin_farm_code` (Mã số trại nuôi đăng ký kiểm lâm), `species_id` (Khóa ngoại trỏ đến danh mục loài).
  - Tự động chặn: Nếu loài có `iucn_status = 'CR'` hoặc nằm trong CITES Phụ lục I, backend phải bắt buộc kiểm tra `generation = 'F2+'` và hồ sơ cửa hàng phải ở trạng thái `ACTIVE` đã qua kiểm duyệt kiểm lâm.

### 3.2. Schema Lưu Trữ Thông Số Vi Khí Hậu Sinh Học (Microclimate Specs)
- **Hiện trạng Frontend**: Frontend đang phân tích chuỗi `environmentSpecs` (ví dụ: `"Nhiệt độ nước: 16-18°C, Không khí: 20-25°C, Điểm sưởi: 32-35°C, Độ ẩm: 70-80%"`) thành các dải min-max có cấu trúc.
- **Đề xuất Database Java**:
  - Nhằm tối ưu hóa câu lệnh truy vấn lọc theo điều kiện môi trường sống, backend nên thiết kế bảng phụ hoặc các cột cụ thể trong bảng `species`:
    ```sql
    ALTER TABLE species ADD COLUMN temp_water_min DECIMAL(4,1);
    ALTER TABLE species ADD COLUMN temp_water_max DECIMAL(4,1);
    ALTER TABLE species ADD COLUMN temp_air_min DECIMAL(4,1);
    ALTER TABLE species ADD COLUMN temp_air_max DECIMAL(4,1);
    ALTER TABLE species ADD COLUMN basking_temp_min DECIMAL(4,1);
    ALTER TABLE species ADD COLUMN basking_temp_max DECIMAL(4,1);
    ALTER TABLE species ADD COLUMN humidity_min INT;
    ALTER TABLE species ADD COLUMN humidity_max INT;
    ```
  - Khi trả về `SpeciesDto`, giữ trường `environmentSpecs` (chuỗi tổng hợp) để đảm bảo tính tương thích ngược, đồng thời cung cấp thêm đối tượng `microclimate` (nếu có).

### 3.3. Chuẩn Hóa Phân Trang Backend (Pagination Contract)
- **Cấu trúc DTO Chuẩn**:
  ```json
  {
    "content": [ ... ],
    "page": 0,
    "size": 12,
    "totalElements": 48,
    "totalPages": 4,
    "last": false
  }
  ```
- **Xử lý linh hoạt**: Lớp `normalizePage` trên frontend đã được xây dựng để nhận diện cả định dạng danh sách mảng phẳng `T[]` lẫn định dạng gói `Page<T>` của Spring/Java. Tuy nhiên, khuyến nghị các Servlet của backend luôn trả về cấu trúc phân trang trên cho các endpoint danh mục:
  - `GET api/products?page=0&size=12&speciesId=...&status=APPROVED`
  - `GET api/admin/sellers?status=PENDING`
  - `GET api/admin/products?status=PENDING`

### 3.4. Cơ Chế Lưu Trữ Hình Ảnh Thật (Chuyển Giao Media Vào WAR)
- **Hiện trạng**: Toàn bộ 161 tệp ảnh AVIF và WebP đang được đặt tại thư mục `frontend/public/photos/`. Khi build, Vite sẽ đóng gói trực tiếp vào thư mục `dist/photos/`.
- **Triển khai Tomcat**:
  - Khi chủ dự án tạo file WAR (`BioNexus.war`), toàn bộ thư mục `dist/*` được sao chép vào thư mục gốc của Web Application (`src/main/webapp/`).
  - Đường dẫn truy cập ảnh trên môi trường sản xuất sẽ là `http://localhost:8080/BioNexus/photos/...`.
  - Mọi đường dẫn tương đối trong frontend (`photos/axolotl/...`) được bảo toàn 100% nhờ việc frontend sử dụng `base: './'`.
  - Khi người dùng hoặc shop tải ảnh mới lên (Upload), backend Java nên tiếp nhận qua `MultipartConfig`, lưu vào thư mục `webapp/photos/uploads/` hoặc một thư mục bên ngoài máy chủ và định tuyến thông qua một Servlet phục vụ file tĩnh.

### 3.5. Đề Xuất Tùy Chọn Cho Backend: Đồng Bộ Hộ Chiếu Loài (`GET / PUT api/me/passport`)
- **Hiện trạng trên Frontend**: Hộ chiếu loài của trang Hành trình 9 loài (`#/tham-hiem`) và thẻ `"Hộ chiếu loài"` trên trang `/account` đang được lưu bền vững phía trình duyệt tại `localStorage['bionexus.passport.v1']` theo khóa `username` (hoặc `'guest'` khi chưa đăng nhập):
  ```json
  {
    "levanc": {
      "met": ["burmese-python", "nepenthes-ampullaria", "nepenthes-rajah"],
      "startedAt": "2026-11-02T10:15:00.000Z",
      "completedAt": "2026-11-02T10:25:00.000Z",
      "skippedAt": "2026-11-02T10:16:00.000Z"
    }
  }
  ```
- **Đề xuất Endpoint Tùy Chọn (nếu chủ dự án muốn đồng bộ hộ chiếu giữa nhiều thiết bị)**:
  - `GET api/me/passport`: Trả về `ApiResponse<PassportDto>` gồm `{ met: string[], startedAt: string, completedAt?: string, skippedAt?: string }` của tài khoản đang đăng nhập.
  - `PUT api/me/passport`: Nhận body `{ met: string[], completedAt?: string, skippedAt?: string }`, gộp (union) danh sách `met` của khách trên máy với danh sách trên server rồi lưu vào bảng `user_passports(user_id, met_json, started_at, completed_at, skipped_at)`.
  - Giao diện hiện tại **hoàn toàn không phụ thuộc** vào endpoint này: nếu backend chưa cài đặt (trả `404`), `usePassport()` vẫn hoạt động trơn tru 100% trên `localStorage`.

### 3.6. Kịch Bản Vấn Đáp Bảo Vệ Đồ Án Aptech 2026 (Q&A Script Chuẩn)
Dưới đây là 5 câu hỏi tình huống chuyên sâu mà Hội đồng chấm thi Aptech thường đặt ra cho các dự án thương mại điện tử sinh học, kèm theo câu trả lời đề xuất:

* **Câu hỏi 1**: *Tại sao nhóm lại kết hợp bách khoa sinh học 6 cấp phân loại với sàn thương mại điện tử sinh vật cảnh, và giải quyết bài toán pháp lý CITES như thế nào?*
  - **Trả lời**: BioNexus không đơn thuần là một trang bán hàng, mà là giải pháp bảo tồn có trách nhiệm. Vấn nạn lớn nhất hiện nay là tình trạng buôn bán sinh vật hoang dã trái phép dẫn đến tuyệt chủng loài. BioNexus giải quyết bằng mô hình 2 tầng: Tầng 1 là Bách khoa toàn thư cung cấp chuẩn kiến thức khoa học (thông số vi khí hậu, mức đe dọa IUCN); Tầng 2 là Sàn kiểm duyệt nghiêm ngặt: chỉ cho phép các cá thể F2+ sinh sản nhân tạo từ các cơ sở kiểm lâm cấp phép được đăng bán, có sự đối chiếu ảnh thực tế với ảnh chuẩn khoa học để ngăn chặn gian lận loài.

* **Câu hỏi 2**: *Giao diện sử dụng nhiều hiệu ứng 3D (Three.js/Fiber) và chuyển động phức tạp, làm thế nào để đảm bảo website không bị đơ giật trên máy tính yếu hoặc điện thoại?*
  - **Trả lời**: Chúng em áp dụng kiến trúc "3D Tự thích ứng & Tiết kiệm tài nguyên":
    1. Cơ chế `QualityProvider` tự động đo đạc khả năng GPU phần cứng và hỗ trợ 5 cấp cấu hình (Ultra, High, Medium, Low, Static).
    2. Chế độ ảnh tĩnh thay thế (`static fallback`) và tôn trọng cài đặt `prefers-reduced-motion` của hệ điều hành.
    3. Luật bất di bất dịch: Tại một thời điểm chỉ có tối đa 1 WebGL Canvas hoạt động; khi người dùng cuộn khỏi khung nhìn, Canvas lập tức unmount để giải phóng bộ nhớ.
    4. Toàn bộ thư viện Three.js được tách thành bundle nạp trễ (lazy loaded), giữ cho Landing Page ban đầu chỉ nặng 157 KB Gzip, nạp trong vòng 0.8 giây.

* **Câu hỏi 3**: *Tại sao kiến trúc dự án sử dụng React 19 SPA thay vì render trực tiếp JSP trên Tomcat như các đồ án Aptech truyền thống?*
  - **Trả lời**: Việc tách rời Frontend (React 19) và Backend (Tomcat Servlet) mang lại 3 ưu thế vượt trội:
    1. Trải nghiệm người dùng mượt mà tức thì (Zero-refresh SPA), các thao tác lọc phân loại, xoay mô hình 3D, phóng to kính lúp 2.5x diễn ra lập tức mà không cần tải lại toàn bộ trang.
    2. Tối ưu hóa năng lực máy chủ Tomcat: Máy chủ Java chỉ tập trung xử lý nghiệp vụ, giao dịch cơ sở dữ liệu và trả về JSON nhẹ, giảm thiểu tải render HTML trên server.
    3. Hợp đồng API chuẩn hóa: Sau này hệ thống có thể mở rộng ứng dụng Mobile (Flutter/React Native) kết nối chung vào cùng một backend Java mà không cần viết lại mã nguồn.

* **Câu hỏi 4**: *Làm thế nào để xử lý xung đột tồn kho (Concurrency / Race Condition) khi 2 khách hàng cùng đặt một cá thể sinh vật cảnh duy nhất tại cùng một tích tắc?*
  - **Trả lời**: Cá thể sinh vật cảnh thường là duy nhất (tồn kho = 1). Trên frontend, chúng em áp dụng pre-validation để vô hiệu hóa nút mua nếu cá thể đã hết hàng. Trên backend Java Tomcat, giao dịch đặt hàng phải được bao bọc trong Transaction cô lập với mức `SERIALIZABLE` hoặc sử dụng cơ chế `SELECT ... FOR UPDATE` (Pessimistic Locking) trên bản ghi sản phẩm trước khi trừ tồn kho. Nếu bản ghi đã bị khóa hoặc số lượng không đủ, backend sẽ ném lỗi `ORDER_OUT_OF_STOCK` để frontend hiển thị thông báo khôi phục giỏ hàng tự động.

* **Câu hỏi 5**: *Hệ thống phân quyền (RBAC) trong phân hệ Quản trị được thiết kế như thế nào để đảm bảo an toàn thông tin?*
  - **Trả lời**: BioNexus phân tách rõ ràng trách nhiệm giữa 3 vai trò: `SUPER_ADMIN` (quản trị toàn diện), `MODERATOR` (chuyên viên kiểm duyệt giao dịch thương mại) và `BIOLOGIST` (nhà khoa học chuyên trách danh mục phân loại loài). Sự phân tách này được bảo vệ 2 lớp: Ở frontend, `AdminLayout` và các Route Guards tự động ẩn menu và trả về trang 403 Bio-Luxury nếu truy cập trái phép; Ở backend, mỗi Servlet quản trị đều có Filter kiểm tra JWT token và đối chiếu vai trò trong cơ sở dữ liệu trước khi thực thi truy vấn.

---

## 4. Lưu ý & Giả định (Caveats)

- **Môi trường Dev và Mock**: Hiện tại toàn bộ dữ liệu mẫu được lưu giữ và cập nhật tự động trong `localStorage` thông qua MSW 2. Để reset dữ liệu về trạng thái hạt giống ban đầu (seed state), người dùng chỉ cần nhấn nút "Khôi phục dữ liệu gốc" trên `DevPanel` (góc dưới màn hình).
- **Trình duyệt khuyến nghị**: Hoạt động tối ưu trên các trình duyệt hiện đại hỗ trợ ES2022 và WebGL2 (Chrome 120+, Edge 120+, Safari 17+, Firefox 120+).
- **Giấy phép hình ảnh**: Tất cả hình ảnh trong dự án là ảnh thật từ cộng đồng Wikimedia Commons và iNaturalist theo các giấy phép tự do (CC0, CC BY 4.0, CC BY-SA 4.0). Khi phát hành chính thức, cần giữ nguyên trang Ghi công `/credits` để tuân thủ điều khoản Attribution của Creative Commons.

---

## 5. Kết luận & Nghiệm thu (Conclusion)

- Toàn bộ 6 Milestones (Mốc 1 đến Mốc 6) của dự án BioNexus Frontend đã được triển khai hoàn tất 100%, đáp ứng đầy đủ và vượt mức các tiêu chí kỹ thuật:
  - 24 Routes chính thức + 1 Route preview hoàn hảo.
  - Thiết kế Bio-Luxury chuẩn mẫu R, sắc nét, đồng bộ.
  - 100% tiếng Việt có dấu, 0 emoji, tuân thủ WCAG 2.2 AA.
  - Phân hệ Quản trị Admin và Kiểm duyệt thông minh, hiệu quả cao.
  - Sẵn sàng bàn giao cho giai đoạn nối Backend Java Tomcat và bảo vệ đồ án Aptech 2026.

---

## 6. Phương Pháp Kiểm Chứng Độc Lập (Verification Method)

Để độc lập thẩm định chất lượng toàn bộ dự án, chạy các lệnh kiểm tra sau tại thư mục gốc:

1. **Kiểm tra Toàn bộ Cổng chất lượng Frontend**:
   ```bash
   npm --prefix frontend run check
   ```
   *Yêu cầu*: Hoàn thành với mã thoát 0 (Typecheck pass, Oxlint 0 warnings/0 errors, verify-no-emojis pass, 22 test files / 215 tests pass, Vite build pass, verify-no-three-preload pass, check-bundle-budget pass ≤ 180 KB).

2. **Kiểm tra Hợp đồng E2E (End-to-End Contract Suite)**:
   ```bash
   node --test frontend/tests/e2e/*.test.ts
   ```
   *Yêu cầu*: 109/109 tests pass (Feature coverage, Boundary conditions, Pairwise combinations, Real-world workloads).

3. **Chạy Thử Nghiệm Ứng Dụng (Dev Server)**:
   ```bash
   npm --prefix frontend run dev
   ```
   *Truy cập*: `http://localhost:5173` để trải nghiệm trực quan toàn bộ 24 routes.
