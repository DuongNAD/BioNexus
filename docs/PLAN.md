# BioNexus — Kế hoạch dự án

> **Dự án:** sàn mua bán sinh vật cảnh kèm bách khoa phân loại sinh vật (giới → ngành → lớp → bộ → họ → chi → loài).
> **Ràng buộc của cô:** Tomcat 10 + JDBC. Mọi thứ còn lại do mình chọn.
> **Hạn:** 02/11/2026 (thứ Hai), đã xác nhận.
> **Cách làm việc:** mình tự code; Claude chỉ gợi ý và review khi mình gửi code.
> **Cách đọc:** chỉ cần đọc **mục 0** và **mục 9** (việc của ngày hôm nay). Các mục còn lại để tra khi cần.

**Mục lục:** 0 Tóm tắt · 1 Bức tranh tổng thể · 2 Công nghệ · 3 Cấu trúc thư mục · 4 Các luồng · 5 API · 6 Dữ liệu và tài khoản test · 7 Bảo mật · 8 Giao diện · 9 Kế hoạch 7 ngày · 10 Test và tiêu chí xong · 11 Đóng gói và demo · 12 Rủi ro · 13 Từ điển và câu hỏi vấn đáp · 14 Dùng AI

---

## 0. Tóm tắt

| | |
|---|---|
| **Sản phẩm cuối** | 1 file `BioNexus.war` thả vào Tomcat 10.1 + 1 database SQL Server (chạy 2 file SQL). Trong WAR có API và giao diện React đã build. |
| **Công nghệ** | Java 17 · Maven · Tomcat 10.1 · Servlet + Filter · JDBC · Gson · BCrypt · JWT · React + Vite · CSS thuần |
| **5 thứ không được cắt** | ① Duyệt cây phân loại → loài → sản phẩm ② Đăng nhập JWT + phân quyền ③ Người bán đăng sản phẩm → kiểm duyệt viên duyệt ④ Đặt hàng có transaction ⑤ README và chạy được trên máy sạch |
| **3 luật sống còn** | Mỗi ngày demo được 1 thứ mới và có 1 commit · Kẹt quá 45 phút thì hỏi · Từ Ngày 6 chỉ sửa lỗi |
| **Hôm nay (Ngày 1)** | Commit seed → nối Tomcat vào IntelliJ (cổng 8081) → servlet `/api/ping` → API cây phân loại |

---

## 1. Bức tranh tổng thể

### 1.1 Hai chế độ chạy

```text
KHI CODE                                          KHI NỘP (máy cô)
┌────────────┐  /api   ┌────────────────┐         ┌────────────────────────────────┐
│ Vite :5173 │ ──────▶ │ Tomcat :8081   │         │ Tomcat 10.1 :8080              │
│ React, HMR │  proxy  │ (IntelliJ)     │         │ └─ BioNexus.war                │
└────────────┘         └───────┬────────┘         │    ├─ giao diện React đã build │
                               │ JDBC             │    └─ API  /api/*              │
                       ┌───────▼────────┐         └───────────────┬────────────────┘
                       │ SQL Server     │                         │ JDBC
                       │ Docker :1433   │                 ┌───────▼────────┐
                       └────────────────┘                 │ SQL Server     │
                                                          └────────────────┘
```

**Vì sao 2 chế độ?** Lúc code, Vite cập nhật giao diện tức thì (không phải build lại). Lúc nộp, cô chỉ cần Tomcat + SQL Server, không cần cài Node.

### 1.2 Các lớp trong backend

```text
Request HTTP
   │
   ▼
Filter     UTF-8 → kiểm tra JWT           chặn người chưa đăng nhập hoặc sai quyền
   ▼
Servlet    đọc request, kiểm tra đầu vào   trả JSON + mã HTTP
   ▼
Service    luật nghiệp vụ + transaction    (MỚI)
   ▼
DAO (dal)  chỉ SQL + ánh xạ dòng ↔ model   (đã có)
   ▼
SQL Server
```

| Lớp | Việc duy nhất | Vì sao tách |
|---|---|---|
| Filter | Việc chung cho nhiều request: UTF-8, kiểm tra JWT | Viết 1 lần, khỏi lặp ở mọi servlet |
| Servlet | Giao tiếp HTTP: đọc request, trả JSON và mã trạng thái | Servlet không chứa SQL hay luật nghiệp vụ |
| Service | Luật của dự án (ai được làm gì, trừ kho, tính tiền) và transaction | Luật nằm 1 chỗ nên dễ sửa, dễ test |
| DAO | Chỉ SQL cho từng bảng | Đổi SQL không ảnh hưởng chỗ khác |
| DTO | Hình dạng JSON gửi/nhận | Không lộ model (vd `passwordHash`), hợp đồng API ổn định |

**Luật:** mỗi lớp chỉ gọi lớp ngay bên dưới. Servlet không viết SQL. DAO không biết HTTP là gì.

---

## 2. Công nghệ: dùng gì, vì sao cần

| Thành phần | Dùng | Vì sao cần | Bẫy hay gặp |
|---|---|---|---|
| JDK | Java 17 | Dự án đặt `source/target 17`; bản LTS | Tomcat phải chạy bằng JDK từ 17 trở lên (IntelliJ: `ms-17`) |
| Build | Maven (`./mvnw`) | Tải thư viện và đóng gói WAR bằng 1 lệnh; wrapper để máy nào cũng cùng phiên bản | Sửa `pom.xml` xong phải reload Maven |
| Web server | Tomcat 10.1.60 (Servlet 6.0) | Cô yêu cầu; là nơi chạy servlet và filter | Dùng `jakarta.*` chứ không phải `javax.*`. Cổng 8080 đang bị dịch vụ `oxideswarm` chiếm, dùng 8081 |
| API | Servlet + Filter thuần | Hiểu bản chất HTTP (request, header, status) thay vì để framework giấu đi | Servlet không có `doPatch`, dùng `PUT`. Phải tự tách URL bằng `getPathInfo()` |
| JSON | Gson 2.10.1 (đã có) | Biến object ↔ JSON | Mặc định bỏ khóa `null`; lỗi với `LocalDateTime` (dùng DTO); escape dấu `'` thành `'` |
| CSDL | SQL Server (Docker, cổng 1433) | Cô yêu cầu; khóa ngoại và ràng buộc CHECK bảo vệ dữ liệu | Chạy 2 file SQL đúng thứ tự |
| Truy cập DB | JDBC thuần + `PreparedStatement` | Cô yêu cầu; dấu `?` chống SQL injection | Luôn try-with-resources. Giữ dòng `Class.forName` trong `DBContext` (đảm bảo driver đăng ký khi chạy trong Tomcat) |
| Mật khẩu | BCrypt (`org.mindrot:jbcrypt:0.4`) | Không bao giờ lưu mật khẩu thô; BCrypt cố tình chậm và có "muối" riêng | Phải sinh lại hash trong seed |
| Xác thực | JWT (`com.auth0:java-jwt`) | API không dùng session; token được ký nên server không cần nhớ ai đã đăng nhập | Bí mật dài từ 32 ký tự lấy từ biến môi trường; token hết hạn trả 401 |
| Cấu hình | `AppConfig` (biến môi trường → mặc định cho dev) | Mật khẩu DB và bí mật JWT không được nằm trong git | `DBContext` đang hard-code tài khoản `sa` |
| Log | `java.util.logging` | Biết lỗi ở đâu khi chạy trên máy cô; thay `printStackTrace()` | Không log mật khẩu hay token |
| Test | JUnit 5 (đã có) | Bắt lỗi sớm ở chỗ khó (JWT, giá tiền, transaction) | Test DAO chỉ ĐỌC để khỏi làm lệch seed |
| Giao diện | React + Vite + `react-router-dom` | Trang mượt như app; Vite cập nhật tức thì khi code | Cần `base: './'`, `HashRouter`, `fetch` đường dẫn tương đối (mục 8.5) |
| Kiểu dáng | CSS thuần + design tokens, font Inter, `lucide-react` | Giao diện kiểu Apple, ít thư viện, dễ giải thích khi vấn đáp | Chọn font có tiếng Việt (Inter có) |
| Công cụ | IntelliJ (Tomcat run config), Docker, Git + GitHub, IntelliJ HTTP Client | Chạy, gọi thử API, lưu lịch sử | Commit mỗi ngày |

---

## 3. Cấu trúc thư mục

```text
BioNexus/
├─ backend/                      Maven, đóng gói WAR
│  └─ src/main/java/com/bionexus/backend/
│     ├─ model/     entity khớp bảng DB            (đã có)
│     ├─ enums/     trạng thái, vai trò, MessageKey (đã có)
│     ├─ dal/       DAO: SQL + ánh xạ              (đã có, cần sửa: ném lỗi)
│     ├─ service/   nghiệp vụ + transaction        (MỚI)
│     ├─ dto/       record cho JSON vào/ra         (MỚI)
│     ├─ servlet/   các endpoint /api/*            (MỚI)
│     ├─ filter/    EncodingFilter, JwtAuthFilter  (MỚI)
│     ├─ config/    AppConfig                      (MỚI)
│     └─ util/      JsonUtil, JwtUtil, PasswordUtil (đã có); ApiException, Validation (MỚI)
│  └─ src/main/webapp/           WEB-INF/web.xml; React build được nhúng vào đây khi đóng gói
│  └─ src/test/java/             JUnit
├─ frontend/                     Vite + React (cấu trúc ở mục 8.1)
├─ database/                     BioNexusDatabes.sql, seed_data.sql, migrations/
└─ docs/                         PLAN.md (file này), api.md, requests.http
```

**Vì sao DTO riêng?** Model khớp bảng DB (có `passwordHash`, `LocalDateTime`). DTO là thứ mình muốn người ngoài thấy. Tách ra thì đổi DB không làm vỡ giao diện và không vô tình lộ dữ liệu nhạy cảm.

---

## 4. Các luồng

### 4.1 Một request đi như thế nào

Ví dụ `GET /api/taxonomy/4/children`:

```text
Trình duyệt ──GET /api/taxonomy/4/children──▶ Tomcat
 1. EncodingFilter      đặt UTF-8
 2. (JwtAuthFilter)     đường này công khai → không áp dụng
 3. TaxonomyServlet     tách id=4 từ URL. Không phải số → 400
 4. TaxonomyService     nút 4 có tồn tại không? Không → 404
 5. TaxonomyNodesDao    SELECT ... WHERE parentNodeID = ?   (JDBC, PreparedStatement)
 6. Servlet             đổi sang DTO → Gson → 200 + JSON UTF-8
DB sập ở bước 5 → SQLException bay lên servlet → 500 ApiResponse.error(INTERNAL_ERROR) + ghi log
```

| Mã | Khi nào | Ví dụ |
|---|---|---|
| 200 | Thành công | GET danh sách |
| 201 | Tạo mới thành công | `POST /api/orders` |
| 400 | Dữ liệu gửi lên sai | id không phải số, thiếu trường bắt buộc |
| 401 | Chưa đăng nhập, token sai hoặc hết hạn | gọi `/api/me` không kèm token |
| 403 | Đã đăng nhập nhưng không đủ quyền hoặc tài khoản bị khóa | USER gọi `/api/admin/...` |
| 404 | Không có tài nguyên | `/api/taxonomy/9999` |
| 405 | Sai phương thức | `POST /api/taxonomy` |
| 409 | Xung đột trạng thái | hết hàng, username đã tồn tại |
| 500 | Lỗi server hoặc DB | DB sập |

**Ghép `MessageKey` với mã HTTP** (để mọi servlet trả nhất quán; `MessageKey` hiện có 69 key):

| Mã | Các `MessageKey` |
|---|---|
| 200 | `SUCCESS`, `UPDATED_SUCCESS`, `DELETED_SUCCESS`, `AUTH_LOGIN_SUCCESS`, `SELLER_APPROVED_SUCCESS`, `SELLER_REJECTED_SUCCESS`, `SELLER_BANNED_SUCCESS`, `PRODUCT_APPROVED_SUCCESS`, `PRODUCT_REJECTED_SUCCESS`, `ORDER_CANCEL_SUCCESS` |
| 201 | `CREATED_SUCCESS`, `AUTH_REGISTER_SUCCESS`, `SELLER_APPLY_SUCCESS`, `PRODUCT_SUBMITTED`, `ORDER_CREATE_SUCCESS` |
| 400 | `BAD_REQUEST`, `INVALID_ID`, `INVALID_JSON`, `INVALID_PAGINATION`, `INVALID_STATUS`, `USER_MISSING_FIELDS`, `USER_INVALID_USERNAME`, `USER_INVALID_EMAIL`, `USER_INVALID_PASSWORD`, `USER_INVALID_PHONE`, `SELLER_INVALID_SHOP_NAME`, `PRODUCT_INVALID_PRICE`, `PRODUCT_INVALID_NAME`, `PRODUCT_INVALID_STOCK`, `ORDER_EMPTY_ITEMS`, `ORDER_INVALID_QUANTITY`, `ORDER_INVALID_SHIPPING_ADDRESS`, `ORDER_DUPLICATE_ITEMS`, `TAXONOMY_INVALID_PARENT`, `TAXONOMY_INVALID_RANK`, `SPECIES_INVALID_NODE`, `SPECIES_INVALID_CONSERVATION_STATUS` |
| 401 | `AUTH_INVALID_CREDENTIALS`, `AUTH_UNAUTHORIZED`, `AUTH_TOKEN_EXPIRED`, `AUTH_TOKEN_INVALID` |
| 403 | `AUTH_FORBIDDEN`, `AUTH_ACCOUNT_INACTIVE`, `AUTH_ACCOUNT_BANNED`, `SELLER_NOT_ACTIVE`, `PRODUCT_NOT_OWNED`, `ORDER_OWN_PRODUCT` |
| 404 | `NOT_FOUND`, `USER_NOT_FOUND`, `SELLER_NOT_FOUND`, `TAXONOMY_NOT_FOUND`, `SPECIES_NOT_FOUND`, `PRODUCT_NOT_FOUND`, `ORDER_NOT_FOUND` |
| 405 | `METHOD_NOT_ALLOWED` |
| 409 | `CONFLICT`, `USER_USERNAME_EXISTS`, `USER_EMAIL_EXISTS`, `SELLER_ALREADY_REGISTERED`, `SELLER_SHOP_NAME_EXISTS`, `SELLER_INVALID_STATUS_TRANSITION`, `TAXONOMY_NAME_EXISTS`, `SPECIES_NAME_EXISTS`, `PRODUCT_OUT_OF_STOCK`, `PRODUCT_NOT_AVAILABLE`, `PRODUCT_INVALID_STATUS_TRANSITION`, `ORDER_CANNOT_CANCEL` |
| 429 | `AUTH_TOO_MANY_ATTEMPTS` (làm nếu còn thời gian) |
| 500 | `INTERNAL_ERROR` |

### 4.2 Luồng đăng nhập JWT

```text
1. React  ──POST /api/auth/login {username, password}──▶ Servlet → AuthService
2. AuthService: UsersDao tìm user → BCrypt kiểm tra mật khẩu → trạng thái phải ACTIVE
3. Đúng → JwtUtil ký {sub: userId, accountType: "USER", role, exp} → 200 ApiResponse có data {token, ...}
4. React lưu token (localStorage). Mọi request sau gửi: Authorization: Bearer <token>
5. JwtAuthFilter: kiểm tra chữ ký + hạn → nạp "người đang gọi" vào request
6. Thiếu, sai hoặc hết hạn → 401. Đúng người nhưng thiếu quyền → 403
7. React nhận 401 → xóa token → chuyển về trang đăng nhập
```

- **Luật vàng: token chỉ chứng minh "tôi là ai". Quyền và trạng thái luôn lấy từ DB** (1 query mỗi request). Vì vậy tài khoản bị BANNED bị chặn ngay, không phải chờ token hết hạn.
- Sai tài khoản hoặc mật khẩu: luôn trả 401 với câu chung ("Sai tài khoản hoặc mật khẩu"). Chỉ nói "tài khoản bị khóa" (403) **sau khi mật khẩu đã đúng**.
- Filter chỉ gắn cho các đường cần bảo vệ: `/api/me`, `/api/seller/*`, `/api/orders/*`, `/api/admin/*`. Các đường đăng nhập nằm dưới `/api/auth/*` nên không bị chặn.

### 4.3 Trạng thái và quyền

```text
SHOP (SellerProfiles)
  USER ──xin mở shop──▶ PENDING ──MODERATOR duyệt──▶ ACTIVE ──vi phạm──▶ BANNED
                           └────MODERATOR từ chối───▶ REJECTED

SẢN PHẨM (Products)
  SELLER (shop ACTIVE) đăng ─▶ PENDING ──MODERATOR duyệt──▶ APPROVED ──hết hàng──▶ SOLD_OUT
                                  └────MODERATOR từ chối───▶ REJECTED

ĐƠN HÀNG (Orders)
  USER mua ─▶ PENDING ──(giao xong)──▶ COMPLETED
                 └──(người mua hủy)──▶ CANCELLED        ← làm nếu còn thời gian
```

| Hành động | Khách | USER | SELLER (shop ACTIVE) | MODERATOR | BIOLOGIST | SUPER_ADMIN |
|---|---|---|---|---|---|---|
| Xem cây, loài, sản phẩm APPROVED | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Đăng ký, đăng nhập | ✓ | | | | | |
| Xin mở shop | | ✓ | | | | |
| Đăng sản phẩm (vào PENDING) | | | ✓ | | | |
| Mua hàng, xem đơn của mình | | ✓ | ✓ (không mua hàng của chính mình) | | | |
| Duyệt shop, duyệt sản phẩm | | | | ✓ | | ✓ |
| Quản lý loài và phân loại | | | | | ✓ | ✓ |
| Khóa tài khoản | | | | | | ✓ |

"SELLER" không phải loại tài khoản riêng. Đó là USER có shop ACTIVE, nên quyền seller luôn kiểm tra bằng DB.

### 4.4 Luồng đặt hàng (một transaction)

1. Mở 1 `Connection`, `setAutoCommit(false)`.
2. Với từng món: `UPDATE Products SET stockQuantity = stockQuantity - ? WHERE productID = ? AND stockQuantity >= ? AND status = 'APPROVED'`. Không có dòng nào bị đổi → hết hàng → rollback → **409**.
3. Đọc giá hiện tại của sản phẩm từ DB. **Không bao giờ nhận giá từ client.**
4. Tạo `Orders` (lấy `orderID` bằng `RETURN_GENERATED_KEYS`; mã đơn dạng `ORD-<năm>-<6 ký tự>`), rồi các dòng `OrderDetails` với `unitPrice` là giá vừa đọc.
5. Tính `totalAmount` = tổng `quantity × unitPrice`. Hàng về 0 thì đổi sản phẩm sang `SOLD_OUT`.
6. `commit`. Có lỗi bất kỳ → `rollback`. Luôn trả `autoCommit` về `true` và đóng kết nối.

**Vì sao cần transaction?** Nếu trừ kho xong mà tạo đơn lỗi thì hàng "biến mất". Transaction bảo đảm cả nhóm thao tác cùng thành công hoặc không gì thay đổi. Câu `UPDATE ... WHERE stockQuantity >= ?` còn chặn bán lố khi 2 người mua cùng lúc.

---

## 5. API

### 5.1 Quy ước JSON

- Khóa camelCase; id luôn tên `id`; khóa ngoại dạng `speciesId`.
- Enum là chuỗi (`"VU"`, `"APPROVED"`). Tiền là số (VND). Ngày giờ là chuỗi ISO-8601.
- `null` giữ nguyên (`serializeNulls`), ví dụ nút gốc có `"parentId": null`.
- Danh sách phân trang: `{ "items": [...], "page": 1, "size": 12, "total": 7 }`. Danh sách nhỏ: mảng thường. Cả hai nằm trong `data`.
- **Mọi response bọc trong `ApiResponse`** (đã có trong code): thành công `{ "success": true, "message": "...", "data": ... }`; lỗi `{ "success": false, "code": "AUTH_INVALID_CREDENTIALS", "message": "Sai tài khoản hoặc mật khẩu", "data": null }`. `code` là tên `MessageKey` (cần thêm field `code` vào `ApiResponse`), `message` lấy từ `MessageKey` (mặc định tiếng Việt). Mã HTTP vẫn phải đặt đúng; `success` chỉ để giao diện tiện kiểm tra.
- Ví dụ DTO nút phân loại: `{ "id": 4, "scientificName": "Squamata", "commonName": "Bộ Có vảy", "rank": "ORDER", "parentId": 3 }`.

### 5.2 Danh sách endpoint

**Công khai**

| Method | URL | Làm gì |
|---|---|---|
| GET | `/api/ping` | Kiểm tra server sống |
| GET | `/api/taxonomy` | Các nút gốc (giới) |
| GET | `/api/taxonomy/{id}` | 1 nút + đường dẫn từ gốc (breadcrumb) |
| GET | `/api/taxonomy/{id}/children` | Các nút con |
| GET | `/api/taxonomy/{id}/species` | Loài gắn vào nút |
| GET | `/api/species/{id}` | Chi tiết loài |
| GET | `/api/products?speciesId=&q=&page=&size=` | Sản phẩm APPROVED, có phân trang |
| GET | `/api/products/{id}` | Chi tiết sản phẩm |
| POST | `/api/auth/register` | Tạo tài khoản USER |
| POST | `/api/auth/login` | Đăng nhập USER → token |
| POST | `/api/auth/admin/login` | Đăng nhập ADMIN → token |

**Cần token USER** (`/api/me`, `/api/seller/*`, `/api/orders/*`)

| Method | URL | Làm gì |
|---|---|---|
| GET | `/api/me` | Thông tin của tôi (kèm shop nếu có) |
| POST | `/api/seller/apply` | Xin mở shop → PENDING |
| GET | `/api/seller/products` | Sản phẩm của shop tôi (mọi trạng thái) |
| POST | `/api/seller/products` | Đăng sản phẩm → PENDING (chỉ shop ACTIVE) |
| POST | `/api/orders` | Mua: `{ items: [{productId, quantity}], shippingAddress }` → 201 |
| GET | `/api/orders/mine` | Đơn của tôi |
| GET | `/api/orders/{id}` | Chi tiết 1 đơn của tôi |

**Cần token ADMIN** (`/api/admin/*`)

| Method | URL | Ai | Làm gì |
|---|---|---|---|
| GET | `/api/admin/sellers?status=PENDING` | MODERATOR | Shop chờ duyệt |
| PUT | `/api/admin/sellers/{id}/status` | MODERATOR | `{ status: ACTIVE, REJECTED hoặc BANNED }` |
| GET | `/api/admin/products?status=PENDING` | MODERATOR | Sản phẩm chờ duyệt |
| PUT | `/api/admin/products/{id}/status` | MODERATOR | `{ status: APPROVED hoặc REJECTED }` |
| POST | `/api/admin/species` | BIOLOGIST | Thêm loài (làm nếu còn thời gian) |

Gọi thử bằng IntelliJ HTTP Client, lưu ở `docs/requests.http`:

```http
@base = http://localhost:8081

GET {{base}}/api/taxonomy

###
POST {{base}}/api/auth/login
Content-Type: application/json

{"username": "levanc", "password": "123456"}
```

---

## 6. Dữ liệu và tài khoản test

| Bảng | Là gì | Quan hệ chính |
|---|---|---|
| `Users` | Người dùng thường | 1–1 `SellerProfiles`; 1–N `Orders` |
| `Admins` | Quản trị (SUPER_ADMIN, BIOLOGIST, MODERATOR) | duyệt shop, duyệt sản phẩm, quản lý loài |
| `SellerProfiles` | Hồ sơ shop (PENDING → ACTIVE...) | thuộc 1 User; 1–N `Products`; `approvedByAdminID` |
| `TaxonomyNodes` | Cây phân loại 6 cấp | tự tham chiếu qua `parentNodeID` |
| `Species` | Loài, gắn vào node cấp chi (GENUS) | 1–N `Products`; `managedByAdminID` |
| `Products` | Sản phẩm đang bán | thuộc `SellerProfiles` + `Species`; `moderatedByAdminID` |
| `Orders` | Đơn hàng | thuộc User; 1–N `OrderDetails` |
| `OrderDetails` | Dòng đơn, giá chụp lúc mua | khóa chính (`orderID`, `productID`) |

**Tài khoản có sẵn trong seed** (mật khẩu user: `123456`, admin: `admin123`; sau khi đổi sang BCrypt vẫn là các mật khẩu này):

| Tài khoản | Trạng thái | Dùng để test | Kết quả mong đợi |
|---|---|---|---|
| `levanc` | USER, có 2 đơn | mua hàng, xem đơn | mua được; `/orders/mine` có 2 đơn (PENDING, COMPLETED) |
| `nguyenvana` | shop BioGreen Exotic ACTIVE | đăng sản phẩm | thành công, vào PENDING |
| `phamthid` | shop Carnivora Garden ACTIVE | shop thứ 2 | thành công |
| `tranthib` | shop PENDING | đăng sản phẩm | 403 (shop chưa duyệt) |
| `hoangvane` | shop REJECTED | đăng sản phẩm | 403 |
| `vuthif` | user BANNED | đăng nhập | 403 (sau khi nhập đúng mật khẩu) |
| `dangvang` | user INACTIVE | đăng nhập | 403 |
| `moderator1` | MODERATOR ACTIVE | duyệt shop, sản phẩm | thành công |
| `moderator2` | MODERATOR INACTIVE | đăng nhập admin | 403 |
| `biologist1` | BIOLOGIST ACTIVE | quản lý loài | được; duyệt sản phẩm thì 403 |
| `biologist2` | BIOLOGIST BANNED | đăng nhập admin | 403 |
| `superadmin` | SUPER_ADMIN | mọi việc của admin | thành công |

**"Đáp án" từ seed** (dùng làm tiêu chí xong khi test):

- `GET /api/taxonomy` → 2 nút (Animalia, Plantae). Con của Squamata → 3 họ. Loài của chi Python → 2 loài (NT và VU).
- `GET /api/products` → đúng **7** sản phẩm (chỉ APPROVED; seed có 10: 7 APPROVED, 1 PENDING, 1 REJECTED, 1 SOLD_OUT).
- Đơn trong seed: `ORD-2026-0001` PENDING 2.050.000; `ORD-2026-0002` COMPLETED 590.000; `ORD-2026-0003` CANCELLED 3.500.000.
- **Đặt lại dữ liệu sau khi test:** chạy lại `BioNexusDatabes.sql` rồi `seed_data.sql` (seed tự dừng nếu DB còn dữ liệu, nên luôn chạy file schema trước).

**Đổi sang BCrypt (Ngày 3):** viết 1 hàm `main` hoặc test in ra hash của `123456` và `admin123` → dán vào cột `password_hash` trong `seed_data.sql` → chạy lại 2 file SQL.

---

## 7. Bảo mật

| Nguy cơ | Cách phòng | Ở đâu |
|---|---|---|
| SQL injection | Luôn `PreparedStatement` với `?`, không nối chuỗi | DAO (đã làm) |
| Lộ mật khẩu | BCrypt; DTO không có `passwordHash`; không log mật khẩu | PasswordUtil, DTO |
| Giả mạo token | Ký HS256; khi verify chỉ định thuật toán; bí mật từ biến môi trường (không hard-code, không đưa lên git); hạn ngắn: 30 phút đến 24 giờ (chưa có refresh token thì chọn vài giờ) | JwtUtil |
| Leo quyền | Kiểm quyền ở server (filter + service), không tin giao diện; quyền và trạng thái lấy từ DB | Filter, Service |
| Gian lận đơn hàng | Giá lấy từ DB trong transaction; số lượng phải > 0; không tự mua hàng của mình | OrderService |
| XSS | React tự escape; không dùng `dangerouslySetInnerHTML` | Giao diện |
| Lộ bí mật qua git | Chuyển tài khoản DB và bí mật JWT sang `AppConfig` (biến môi trường); `.env` đã nằm trong `.gitignore` | DBContext, AppConfig |
| Lộ lỗi nội bộ | Không trả stack trace; trả `ApiResponse.error` + ghi log ở server | Servlet |
| CORS | Không cần: lúc dev dùng proxy của Vite, lúc nộp cùng một nguồn | Vite, WAR |
| Dò mật khẩu | Giới hạn số lần đăng nhập sai (làm nếu còn thời gian) | AuthService |

---

## 8. Giao diện (React + Vite)

### 8.1 Cấu trúc `frontend/src`

```text
frontend/src/
├─ main.jsx               vào app, bọc HashRouter
├─ App.jsx                khai báo các route
├─ api/client.js          hàm api(): gắn token, đọc JSON, xử lý lỗi và 401
├─ auth/AuthContext.jsx   lưu token + vai trò; RequireAuth, RequireRole
├─ hooks/useFetch.js      trả { data, loading, error }
├─ pages/                 Home, Taxonomy, Species, Product, Login, Register, Orders, Seller, Admin
├─ components/            Navbar, Breadcrumb, Card, SpeciesCard, ProductCard, IucnBadge,
│                         Button, Input, Skeleton, EmptyState, StatusPill, Toast
├─ styles/tokens.css      biến màu, bo góc, bóng (mục 8.3)
└─ mocks/                 JSON giả theo docs/api.md, dùng khi backend chưa xong
```

**Vì sao làm mock trước?** Giao diện không phải chờ backend. Khi backend xong chỉ đổi nguồn dữ liệu. Và bạn phát hiện sớm nếu hợp đồng API chưa hợp lý.

### 8.2 Các trang

| Route (`#/...`) | Trang | Ai vào | API dùng |
|---|---|---|---|
| `/` | Trang chủ: tiêu đề lớn, ô tìm, thẻ các giới | Mọi người | `GET /api/taxonomy` |
| `/taxonomy/:id` | Duyệt cây: breadcrumb, nút con, loài | Mọi người | `/taxonomy/{id}`, `/children`, `/species` |
| `/species/:id` | Chi tiết loài (lưới "bento") + sản phẩm | Mọi người | `/species/{id}`, `/products?speciesId=` |
| `/products/:id` | Chi tiết sản phẩm + Mua ngay | Mọi người (mua cần đăng nhập) | `/products/{id}`, `POST /orders` |
| `/login`, `/register` | Đăng nhập, đăng ký | Khách | `/auth/*` |
| `/orders` | Đơn của tôi | USER | `/orders/mine` |
| `/seller` | Shop của tôi + đăng sản phẩm | SELLER | `/seller/*` |
| `/admin` | Kiểm duyệt shop và sản phẩm | MODERATOR | `/admin/*` |

### 8.3 Phong cách kiểu Apple

| Mục | Quy tắc |
|---|---|
| Màu | Nền xám nhạt, thẻ trắng, chữ gần đen, **một** màu nhấn xanh; có dark mode |
| Chữ | Font hệ thống Apple, dự phòng Inter; tiêu đề lớn (32–48px), đậm vừa (600), khoảng cách chữ hơi sít |
| Hình khối | Bo góc 16–20px, không viền hoặc viền cực mảnh, bóng rất nhẹ, nhiều khoảng trắng |
| Điểm nhấn | Navbar dính trên cùng và mờ kính (`backdrop-filter: blur`), thẻ nổi nhẹ khi di chuột |
| Chuyển động | Ngắn 200–300 ms, `ease-out`; tắt khi `prefers-reduced-motion` |
| Ảnh | Ảnh lớn, bo góc, nền sạch, `object-fit: cover`, có `alt` |
| Cấm | Logo, ảnh, font độc quyền của Apple; màu chói; đổ bóng nặng |

```css
:root {
  --bg: #f5f5f7; --surface: #ffffff; --text: #1d1d1f; --muted: #6e6e73;
  --accent: #0071e3; --hairline: rgba(0,0,0,.08);
  --radius: 18px; --shadow: 0 6px 30px rgba(0,0,0,.06);
  --font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", "Segoe UI", sans-serif;
}
@media (prefers-color-scheme: dark) {
  :root { --bg: #000; --surface: #1d1d1f; --text: #f5f5f7; --muted: #a1a1a6;
          --accent: #2997ff; --hairline: rgba(255,255,255,.12); --shadow: none; }
}
```

Huy hiệu mức bảo tồn IUCN (màu gợi ý theo bảng màu thường dùng của IUCN, chỉnh cho hợp giao diện): LC `#60c659` · NT `#cce226` · VU `#f9e814` · EN `#fc7f3f` · CR `#d81e05`. Hiển thị chấm màu + chữ viết tắt.

### 8.4 Quy tắc dữ liệu và trạng thái

- Trang lo gọi API (`useFetch`). Thành phần chỉ nhận props → sửa giao diện không đụng logic.
- **Mọi trang có đủ 4 trạng thái:** đang tải (skeleton), rỗng (`EmptyState`), lỗi (có nút thử lại), có dữ liệu.
- Nút gửi form bị khóa khi đang gửi để không bấm 2 lần.
- Tiền hiển thị bằng `new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Token lưu `localStorage`. Hàm `api()` là nơi duy nhất gắn `Authorization` và xử lý 401 (xóa token, về `#/login`).

### 8.5 Chỗ dễ sai khi nối với Tomcat

```js
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  base: './',                                          // đường dẫn tài nguyên tương đối
  server: { proxy: { '/api': 'http://localhost:8081' } } // lúc dev, /api chạy sang Tomcat
})
```

- **`fetch('api/taxonomy')` (không có `/` đầu).** App nằm dưới context path như `/BioNexus`; đường dẫn tương đối đúng ở cả lúc dev lẫn khi nộp.
- **`HashRouter`.** Với `BrowserRouter`, F5 ở `/species/12` làm Tomcat báo 404 vì không có file đó. `#/species/12` thì không.
- **Nhúng bản build vào WAR** (trong `backend/pom.xml`, thêm vào `maven-war-plugin` đang có):

```xml
<configuration>
  <webResources>
    <resource><directory>../frontend/dist</directory></resource>
  </webResources>
</configuration>
```

Phải `npm run build` trước khi `./mvnw package`. IntelliJ "war exploded" **không** tự lấy `frontend/dist`; lúc dev dùng proxy, còn bản nộp build bằng Maven.

---

## 9. Kế hoạch 7 ngày

Giả định 6–8 giờ mỗi ngày. Hạn là Thứ Hai 02/11 nên Ngày 7 là ngày nộp, đừng để việc dồn sang đó. Mỗi ngày có: việc, "xong khi" (đáp án kiểm tra), và vì sao làm hôm nay.

**Báo cáo cuối ngày (gửi Claude để review):** ① đã xong mục nào trong danh sách ② kẹt ở đâu (kèm lỗi nguyên văn) ③ kết quả `git status`.

### Tiến độ (cập nhật 27/10, theo code chưa commit sau `dba0c4d`)

| Hạng mục | Trạng thái | Ghi chú |
|---|---|---|
| Schema, seed, model, enum, 8 DAO | ✓ xong | Seed đã commit (`cd420c4`), DB đã nạp, DAO đã kiểm chứng |
| Tomcat nối IntelliJ, `/api/ping` | ✗ chưa | Chưa có servlet nào; `index.jsp` và `web.xml` vẫn là mẫu |
| `DBContext` đọc cấu hình, DAO ném lỗi, `getRootNodes()` | ✗ chưa | File DAO chưa đổi |
| API taxonomy, `docs/api.md`, `docs/requests.http` | ✗ chưa | |
| `ApiResponse`, `JsonUtil`, `MessageKey` | ◐ có | `MessageKey` đã đủ 69 key cho toàn bộ API (kể cả phần làm nếu còn thời gian); `JsonUtil` chưa `serializeNulls` và `disableHtmlEscaping`; `ApiResponse` thiếu `code` |
| `PasswordUtil` (BCrypt) | ✓ chạy đúng | Seed vẫn là mật khẩu thô nên chưa đăng nhập được bằng tài khoản seed |
| `JwtUtil` | ◐ chạy đúng | Bí mật hard-code và **đã lên GitHub công khai**; hạn 24 giờ; chưa có test |
| `AuthService.loginUser`, `AuthResponse`, `AccountType`, `ApiException` | ✓ chạy đúng | Đã thử trên DB tạm: đăng nhập đúng/sai, BANNED, INACTIVE đều đúng; JSON không còn `password`. Còn thiếu: `register`, `loginAdmin`, servlet |
| Giao diện React | ✗ chưa | `frontend/` còn `.gitkeep` |

### Ngày 1: Thứ Ba 27/10: Đường ống chạy

- [x] Commit `database/seed_data.sql` (xong: `cd420c4`)
- [ ] IntelliJ: Run → Edit Configurations → Tomcat Server → Local → trỏ `~/apache-tomcat-10.1.60`, **HTTP port 8081**; Deployment: `backend:war exploded`, context `/`
- [ ] Xóa `index.jsp` mẫu; servlet `/api/ping` trả `{"status":"ok","message":"Xin chào"}` (UTF-8)
- [ ] `DBContext`: gom `ClassNotFoundException` thành `SQLException`; đọc DB_URL, DB_USER, DB_PASSWORD từ biến môi trường (có mặc định cho dev); giữ `Class.forName`
- [ ] `TaxonomyNodesDao`, `SpeciesDao`: ném lỗi thay vì nuốt; thêm `getRootNodes()` (`parentNodeID IS NULL`)
- [ ] `util/Json` (1 `Gson` dùng chung: `serializeNulls`, `disableHtmlEscaping`) + DTO bằng `record`
- [ ] 4 endpoint taxonomy (mục 5.2) + `docs/requests.http`
- [ ] Bắt đầu `docs/api.md` (từ mục 5, sửa theo thực tế)

**Xong khi:** `GET /api/ping` ra tiếng Việt đúng dấu; `GET /api/taxonomy` ra 2 nút; con của Squamata ra 3 nút; `/api/taxonomy/abc` → 400; `/api/taxonomy/9999` → 404 (đều là JSON); sai tên database trong URL tạm thời → 500.
**Vì sao hôm nay:** tách "lỗi môi trường" khỏi "lỗi code". DAO ném lỗi để API phân biệt được 404 với 500. Nếu hết ngày chưa xong, dời breadcrumb và `species` sang Ngày 2.

### Ngày 2: Thứ Tư 28/10: Dữ liệu công khai + giao diện đầu tiên

- [ ] `GET /api/species/{id}`; `GET /api/products` (APPROVED, lọc `speciesId`, phân trang bằng `OFFSET ... FETCH`); `GET /api/products/{id}`
- [ ] Ảnh trong seed là địa chỉ giả (`bionexus.vn/...`): tải ảnh có giấy phép (vd Wikimedia Commons) vào `backend/src/main/webapp/images/`, sửa `imageUrl`, ghi nguồn trong README
- [ ] `npm create vite@latest frontend -- --template react` (nếu hỏi thư mục không rỗng, chọn bỏ qua file hiện có); cài `react-router-dom`; `vite.config.js` (mục 8.5)
- [ ] `tokens.css`, `Navbar`, `Breadcrumb`, `Card`, `IucnBadge`, `Skeleton`; trang Home, Taxonomy, Species (có danh sách sản phẩm). Dùng `mocks/` nếu API chưa xong

**Xong khi:** duyệt Animalia → … → Python → thấy 2 loài → bấm loài thấy sản phẩm; danh sách công khai có đúng 7 sản phẩm.
**Vì sao hôm nay:** thấy sản phẩm chạy sớm giữ động lực và lộ ngay chỗ hợp đồng API chưa hợp lý.

### Ngày 3: Thứ Năm 29/10: Danh tính (đăng nhập)

- [ ] `PasswordUtil` (BCrypt) **đã có**; còn lại: in hash của `123456` và `admin123` → sửa seed → chạy lại 2 file SQL
- [ ] `JwtUtil` **đã có**; còn lại: 4 test JUnit (token hợp lệ / hết hạn / sai chữ ký / sửa payload thành ADMIN thì bị từ chối) và **chuyển bí mật sang biến môi trường, đổi bí mật mới vì cái cũ đã lộ trên GitHub**
- [ ] `POST /api/auth/register`, `/api/auth/login`, `/api/auth/admin/login`, `GET /api/me`
- [ ] `JwtAuthFilter` cho `/api/me`, `/api/seller/*`, `/api/orders/*`, `/api/admin/*`; khai báo thứ tự filter trong `web.xml`
- [ ] Giao diện: Login, Register, `AuthContext`, `api()` gắn token, `RequireAuth`, Navbar hiện tên người dùng
- [ ] **Thử đóng gói một lần:** `npm run build` → `./mvnw package` → WAR có cả giao diện (mục 11)

**Xong khi:** `levanc` đăng nhập được và gọi `/api/me` ra đúng người; không kèm token → 401; `vuthif`, `dangvang`, `moderator2` đăng nhập → 403 (sau khi nhập đúng mật khẩu); sai mật khẩu → 401 với câu chung.
**Vì sao hôm nay:** mọi tính năng sau đều cần biết "ai đang gọi". Thử đóng gói sớm để lỗi đường dẫn lộ ra khi còn nhiều thời gian.

### Ngày 4: Thứ Sáu 30/10: Người bán + kiểm duyệt

- [ ] `POST /api/seller/apply`; `GET` và `POST /api/seller/products` (chỉ shop ACTIVE)
- [ ] `GET /api/admin/sellers|products?status=PENDING`; `PUT .../{id}/status` (MODERATOR); ghi `approvedByAdminID` / `moderatedByAdminID`
- [ ] Filter kiểm tra trạng thái tài khoản và vai trò từ DB (bị khóa → 403)
- [ ] Giao diện: trang Seller (form đăng sản phẩm + danh sách), trang Admin (bảng + nút Duyệt / Từ chối)

**Xong khi:** `nguyenvana` đăng sản phẩm → PENDING; `tranthib` đăng → 403; `moderator1` duyệt → sản phẩm hiện ở trang công khai (lên 8 sản phẩm); `biologist1` duyệt → 403.
**Vì sao hôm nay:** đây là luồng nghiệp vụ "ăn tiền" nhất của sàn và dùng đủ các trạng thái trong DB.

### Ngày 5: Thứ Bảy 31/10: Đặt hàng (transaction)

- [ ] DAO nhận `Connection` từ ngoài (để chung 1 transaction); `insertOrder` trả `orderID` (generated keys)
- [ ] `OrderService.placeOrder` theo mục 4.4; `POST /api/orders`, `GET /api/orders/mine`, `GET /api/orders/{id}`
- [ ] Giao diện: nút Mua ngay (số lượng + địa chỉ), trang Đơn của tôi

**Xong khi:** mua hàng → kho giảm, đơn hiện trong "Đơn của tôi", tổng tiền đúng; mua quá số lượng → 409 và kho không đổi; mua món cuối → sản phẩm thành SOLD_OUT; `levanc` thấy 2 đơn cũ + đơn mới; tự mua hàng của shop mình → bị từ chối.
**Vì sao hôm nay:** transaction là phần khó nhất, cần đầu óc tỉnh táo và còn thời gian sửa.

### Ngày 6: Chủ nhật 01/11: Đóng băng + chất lượng

- [ ] **Không thêm tính năng.** Rà validation và thông báo lỗi tiếng Việt cho mọi form
- [ ] Log thay `printStackTrace`; không log mật khẩu hay token
- [ ] Test: `JwtUtil`, vài DAO (chỉ đọc); chạy hết ma trận tài khoản ở mục 6
- [ ] Giao diện: 4 trạng thái cho mọi trang, responsive, dark mode
- [ ] README (người lạ chạy được trong 5 phút), `docs/api.md` đầy đủ, ERD, ảnh chụp màn hình

**Xong khi:** một người chưa từng thấy dự án làm theo README là chạy được.

### Ngày 7: Thứ Hai 02/11: Diễn tập và nộp

- [ ] Máy sạch: DB mới → 2 file SQL → WAR vào Tomcat 10.1 sạch → chạy đúng kịch bản demo (mục 11)
- [ ] Sửa lỗi phát hiện được; tag `v1.0`; đính kèm WAR build sẵn
- [ ] Soạn câu trả lời vấn đáp (mục 13) và kịch bản demo 5 phút

**Nếu thừa thời gian (chọn tối đa 2):** nhập loài thông minh từ GBIF (gõ tên khoa học, tự điền phả hệ và mức IUCN) · tìm kiếm tiếng Việt không dấu · hủy đơn và hoàn kho · HikariCP · GitHub Actions chạy build và test · Swagger UI.

---

## 10. Test và tiêu chí xong

| Loại | Test gì | Công cụ |
|---|---|---|
| Unit | `JwtUtil`, tính tiền, validation | JUnit 5 |
| DAO (chỉ đọc) | Số dòng và quan hệ khớp "đáp án" ở mục 6 | JUnit + DB đã seed |
| API | Mọi endpoint ở mục 5 theo ma trận tài khoản | `docs/requests.http` |
| Giao diện | Chạy hết kịch bản demo bằng tay | Trình duyệt |

**Một tính năng chỉ tính là XONG khi:** (1) API đúng hợp đồng, kể cả mã lỗi; (2) có test hoặc có request mẫu trong `requests.http`; (3) giao diện có 4 trạng thái; (4) có trong `docs/api.md`; (5) đã commit.

---

## 11. Đóng gói và demo

### 11.1 Đóng gói WAR

Thêm `<finalName>BioNexus</finalName>` vào `<build>` của `backend/pom.xml` để file ra tên `BioNexus.war` và context là `/BioNexus`.

```bash
cd frontend && npm install && npm run build
```

```bash
cd backend && ./mvnw clean package
```

Kết quả: `backend/target/BioNexus.war`.

### 11.2 Chạy trên máy cô (đưa vào README)

1. Có SQL Server. Chạy `database/BioNexusDatabes.sql` rồi `database/seed_data.sql`.
2. Đặt biến môi trường `DB_URL`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET` (trong `bin/setenv.sh`, hoặc `setenv.bat` trên Windows, của Tomcat).
3. Chép `BioNexus.war` vào `webapps/` của Tomcat 10.1, khởi động Tomcat.
4. Mở `http://localhost:8080/BioNexus/`.

| Triệu chứng | Nguyên nhân hay gặp |
|---|---|
| 404 | Sai context path (tên file WAR), hoặc chưa deploy xong; đọc `logs/catalina.out` |
| 500 + `Login failed for user` | Sai `DB_USER` / `DB_PASSWORD` |
| `No suitable driver` | Thiếu `Class.forName` trong `DBContext` hoặc driver không nằm trong WAR |
| Chữ thành `?` hoặc `Ã¡` | Thiếu charset UTF-8 ở response hoặc file SQL |
| Tomcat không lên | Cổng 8080 đang bị chương trình khác dùng |

### 11.3 Kịch bản demo 5 phút

1. Trang chủ → duyệt Animalia → Chordata → Reptilia → Squamata → Python → 2 loài với huy hiệu IUCN.
2. Mở loài → thấy sản phẩm → thử đặt hàng khi chưa đăng nhập (bị yêu cầu đăng nhập).
3. Đăng nhập `levanc` → mua 1 sản phẩm → xem "Đơn của tôi".
4. Đăng nhập `nguyenvana` → đăng sản phẩm mới (PENDING).
5. Đăng nhập `moderator1` → duyệt → sản phẩm hiện ở trang công khai.
6. Chứng minh bảo mật: gọi API admin bằng token USER → 403; sửa 1 ký tự của token → 401.

---

## 12. Rủi ro và thứ tự cắt

| Rủi ro | Cách giảm |
|---|---|
| Tomcat hoặc IntelliJ không chạy | Làm ngay sáng Ngày 1; kẹt quá 45 phút thì hỏi |
| Trễ lịch | Cắt theo thứ tự: ① điểm nhấn ② CI, pool, Swagger ③ tìm kiếm không dấu ④ giỏ hàng (chỉ giữ "mua ngay") ⑤ trang admin đẹp (chỉ giữ bảng) |
| JSON không khớp giữa backend và frontend | Viết `docs/api.md` từ Ngày 1; dùng DTO |
| Lỗi 401 khó đoán | Viết test `JwtUtil` trước khi gắn filter; log lý do từ chối (không log token) |
| Nhúng WAR lỗi đường dẫn | Thử đóng gói từ Ngày 3, không đợi Ngày 6 |
| Máy cô khác máy mình | Hỏi cô phiên bản Tomcat (10.0 hay 10.1; nếu 10.0 thì `jakarta.servlet-api` 5.0.0 và `version="5.0"` trong `web.xml`); ghi phiên bản trong README; thử trên Tomcat sạch ở Ngày 7 |
| Làm hỏng dữ liệu seed khi test | Chạy lại 2 file SQL |
| Kiệt sức | Mỗi ngày dừng đúng giờ, ngủ đủ; Ngày 6 và 7 cần đầu óc tỉnh |

---

## 13. Từ điển và câu hỏi vấn đáp

| Thuật ngữ | Nghĩa (1 câu) | Vì sao dự án cần |
|---|---|---|
| HTTP status code | Con số server trả để nói kết quả (200, 401, 404...) | Để giao diện biết nên hiện gì |
| REST API | Đặt URL theo "tài nguyên" (`/api/products/5`) và dùng GET/POST/PUT đúng nghĩa | Frontend và backend nói chuyện bằng hợp đồng rõ ràng |
| JSON | Chữ dạng `{"khóa": "giá trị"}` | Định dạng trao đổi duy nhất giữa React và Java |
| Servlet | Class Java nhận 1 HTTP request và trả response | "Cửa vào" của mỗi endpoint |
| Filter | Đoạn code chạy trước servlet cho nhiều request | Kiểm tra token 1 lần thay vì lặp ở mọi servlet |
| DAO | Class chỉ chứa SQL cho 1 bảng | Tách SQL khỏi nghiệp vụ |
| DTO | Object chỉ để chứa JSON vào/ra | Không lộ `passwordHash`; đổi DB không vỡ API |
| Service | Class chứa luật nghiệp vụ | Luật nằm 1 chỗ, dễ test |
| JDBC, PreparedStatement | API Java nói chuyện với DB; câu lệnh có chỗ trống `?` | Cô yêu cầu; chống SQL injection |
| SQL injection | Kẻ xấu chèn SQL qua ô nhập | Luôn dùng `?`, không nối chuỗi |
| Transaction | Nhóm thao tác "được cả nhóm hoặc không gì cả" | Đặt hàng: trừ kho và tạo đơn phải cùng thành công |
| Connection pool | Kho kết nối DB dùng lại | Mở kết nối mới mỗi lần rất chậm (làm nếu còn thời gian) |
| BCrypt (hash + salt) | Biến mật khẩu thành chuỗi không đảo ngược, mỗi lần một khác | DB bị lộ cũng không lộ mật khẩu |
| JWT | Chuỗi gồm thông tin người dùng + chữ ký + hạn | Server không cần nhớ phiên; sửa token là bị phát hiện |
| CORS | Luật trình duyệt chặn web gọi API khác "nguồn" | Dự án tránh bằng proxy lúc dev, cùng nguồn lúc nộp |
| SPA | Web 1 trang, React tự đổi nội dung | Mượt; cần `HashRouter` khi chạy trong Tomcat |
| WAR | File đóng gói web Java | Cô chỉ cần thả vào Tomcat |
| Context path | Phần đầu URL của app (`/BioNexus`) | Sai là 404, nên dùng đường dẫn tương đối |
| Phân trang | Chỉ lấy 12 dòng mỗi lần | Danh sách dài không làm chậm |

**Bạn phải trả lời được (tra bảng trên):** Vì sao dùng `PreparedStatement`? JWT khác session thế nào? Vì sao BCrypt chứ không phải mã hóa thường? Transaction để làm gì, nếu lỗi giữa chừng thì sao? DAO khác Service ở đâu? Vì sao không nhận giá từ client? Filter khác Servlet thế nào? Vì sao không cần CORS?

---

## 14. Dùng AI cho đúng

- Đưa đủ ngữ cảnh: file liên quan, thông báo lỗi nguyên văn, và bạn đã thử gì.
- Hỏi "vì sao" trước khi xin code; bảo AI giải thích từng dòng bạn chưa hiểu.
- Đọc lại và tự chạy mọi đoạn AI viết. Phần nào chưa giải thích được thì viết lại bằng lời của mình (cô có thể hỏi vấn đáp).
- Không dán mật khẩu hay token thật vào AI.
- Với giao diện: đưa AI bộ quy tắc ở mục 8.3 và xin từng thành phần một, rồi tự nối dữ liệu.
- Ghi các quyết định quan trọng vào commit hoặc `docs/` để lúc vấn đáp nhớ vì sao.
