# 04 · Hợp đồng API và dữ liệu giả (MSW)

Tài liệu này là **nguồn chân lý** cho dữ liệu. Giao diện gọi đúng các endpoint dưới đây. MSW giả lập chúng **y hệt backend**: cùng đường dẫn, cùng hình dạng JSON, cùng mã HTTP, cùng `code` lỗi. Nhờ vậy khi chủ dự án tắt MSW (`VITE_USE_MOCKS=false`), component không phải sửa gì.

Nguồn đối chiếu: `docs/PLAN.md` mục 4–6, các DTO trong `backend/src/main/java/com/bionexus/backend/dto/`, và `database/seed_data.sql`.

Ký hiệu trạng thái backend (tính đến 02/11/2026):

- **✓ có:** đã có servlet trong code.
- **◐ có một phần:** đã có nhưng chưa đủ tham số.
- **✗ dự kiến:** có trong PLAN nhưng chưa code.
- **◇ đề xuất:** frontend cần thêm. Ghi vào HANDOFF để chủ dự án quyết định.

## 1. Quy ước chung

- Mọi response đều bọc trong `ApiResponse`:
  - Thành công: `{ "success": true, "code": "SUCCESS", "message": "…", "data": … }`.
  - Lỗi: `{ "success": false, "code": "AUTH_INVALID_CREDENTIALS", "message": "Sai tài khoản hoặc mật khẩu", "data": null }`.
- Khóa viết camelCase. Enum là chuỗi. Tiền là số (VND). Ngày giờ dùng ISO-8601. Gson giữ `null`.
- Danh sách phân trang có dạng `{ items, page, size, total }`. Danh sách nhỏ là mảng thường. Hàm `normalizePage()` nhận được cả hai dạng.
- **Lưu ý tên trường không đồng nhất ở backend:** `SpeciesDto` dùng `imageURL` và `referenceURL` (URL viết hoa), còn `ProductDto` dùng `imageUrl`. Giữ đúng như vậy trong type và trong mock. Chỗ chuẩn hoá duy nhất là các adapter ở `src/api/adapters.ts`.
- Token đi trong header `Authorization: Bearer <token>`. Đường dẫn luôn tương đối: `api/...`.

## 2. Kiểu TypeScript (`src/api/types.ts`)

```ts
// ===== Khớp DTO Java đang có =====
export interface ApiResponse<T> {
  success: boolean
  code: string                     // tên MessageKey, ví dụ "SUCCESS", "PRODUCT_OUT_OF_STOCK"
  message: string                  // câu tiếng Việt do server trả
  data: T | null
}
export interface Page<T> { items: T[]; page: number; size: number; total: number }

export type TaxonomyRank = 'KINGDOM' | 'PHYLUM' | 'CLASS' | 'ORDER' | 'FAMILY' | 'GENUS'
export type ConservationStatus = 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX'
export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD_OUT'
export type SellerStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BANNED'
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED'
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED'
export type AccountType = 'USER' | 'ADMIN'
export type AdminRole = 'SUPER_ADMIN' | 'BIOLOGIST' | 'MODERATOR'

export interface TaxonomyNodeDto {          // dto/TaxonomyNodeDto.java ✓
  id: number
  scientificName: string
  commonName: string
  rank: TaxonomyRank
  parentId: number | null
  childCount?: number                        // ◇ đề xuất: hiện số nhánh con khi chưa mở nhánh
}
export interface TaxonomyDetailDto {        // dto/TaxonomyDetailDto.java ✓
  node: TaxonomyNodeDto
  breadcrumbs: TaxonomyNodeDto[]             // từ gốc xuống. Có thể đã gồm chính node, nên UI phải lọc trùng theo id
}
export interface SpeciesDto {               // dto/SpeciesDto.java ✓
  id: number
  nodeId: number                             // nút cấp GENUS
  scientificName: string
  commonName: string                         // ví dụ "Trăn bóng (Ball Python)"
  conservationStatus: ConservationStatus
  environmentSpecs: string                   // chuỗi tự do: "Nhiệt độ: 26-32°C, Độ ẩm: 50-60%, Môi trường: …"
  description: string
  imageURL: string | null                    // seed đang là URL giả bionexus.vn → UI dùng ảnh trong content/photos
  referenceURL: string | null                // link GBIF
}
export interface ProductDto {               // dto/ProductDto.java ✓
  id: number
  sellerProfileId: number
  speciesId: number
  productName: string
  price: number
  stockQuantity: number
  description: string
  imageUrl: string | null
  status: ProductStatus
  shopName?: string                          // ◇ đề xuất (thẻ sản phẩm cần tên shop)
  speciesCommonName?: string                 // ◇ đề xuất (đỡ phải gọi thêm API)
  speciesScientificName?: string             // ◇ đề xuất
  conservationStatus?: ConservationStatus    // ◇ đề xuất
}
export interface SellerDto {                // dto/SellerDto.java ✓
  id: number
  userId: number
  shopName: string
  businessLicenseUrl: string | null
  bio: string | null
  status: SellerStatus
  approvedByAdminId: number | null
  ownerFullName?: string                     // ◇ đề xuất (trang duyệt shop)
  ownerUsername?: string                     // ◇ đề xuất
}
export interface AuthResponse {             // dto/AuthResponse.java ✓
  token: string
  id: number
  username: string                           // với admin là cột `account`
  fullName: string
  accountType: AccountType
  role: AdminRole | string | null            // admin: vai trò; user: chưa chốt (có thể null)
}
export interface LoginRequest { username: string; password: string }
export interface RegisterRequest {          // dto/RegisterRequest.java ✓
  username: string; password: string; email: string; fullName: string; phone: string; address: string
}

// ===== Dự kiến theo PLAN mục 5.2 (✗ chưa code; tên trường cần chốt với backend) =====
export interface MeDto {
  id: number; username: string; fullName: string; email: string; phone: string; address: string
  status: UserStatus
  shop: SellerDto | null
}
export interface CartItemDto {
  productId: number
  productName: string
  imageUrl: string | null
  price: number                              // giá hiện tại, đọc từ Products
  quantity: number
  available: boolean                         // APPROVED và còn hàng
  maxQuantity: number                        // tồn kho hiện tại
  lineTotal: number                          // chỉ tính khi available
  speciesId?: number
}
export interface CartDto { items: CartItemDto[]; itemCount: number; subtotal: number }
export interface OrderItemDto { productId: number; productName: string; imageUrl?: string | null; quantity: number; unitPrice: number; lineTotal: number }
export interface OrderDto {
  id: number; orderCode: string; status: OrderStatus; totalAmount: number
  shippingAddress: string; createdAt: string
  items: OrderItemDto[]                      // danh sách /orders/mine có thể trả items rỗng; UI chịu được
}
export interface SellerApplyRequest { shopName: string; businessLicenseUrl: string; bio: string }
export interface CreateProductRequest { speciesId: number; productName: string; price: number; stockQuantity: number; description: string; imageUrl: string }
export interface AddCartItemRequest { productId: number; quantity: number }
export interface UpdateCartItemRequest { quantity: number }
export interface PlaceOrderRequest { items?: { productId: number; quantity: number }[]; shippingAddress: string }
export interface UpdateStatusRequest { status: SellerStatus | ProductStatus }
export interface CreateSpeciesRequest {
  nodeId: number; scientificName: string; commonName: string; conservationStatus: ConservationStatus
  environmentSpecs: string; description: string; imageURL: string; referenceURL: string
}
```

## 3. Danh sách endpoint

### Công khai

| Method | URL | Response `data` | Lỗi chính | Backend |
|---|---|---|---|---|
| GET | `api/ping` | `{status, message}` | | ✓ |
| GET | `api/taxonomy` | `TaxonomyNodeDto[]` (2 nút gốc) | 500 | ✓ |
| GET | `api/taxonomy/{id}` | `TaxonomyDetailDto` | 400 `INVALID_ID`, 404 `TAXONOMY_NOT_FOUND` | ✓ |
| GET | `api/taxonomy/{id}/children` | `TaxonomyNodeDto[]` | 400, 404 | ✓ |
| GET | `api/taxonomy/{id}/species` | `SpeciesDto[]` | 400, 404 | ✓ |
| GET | `api/species/{id}` | `SpeciesDto` | 400, 404 `SPECIES_NOT_FOUND` | ✓ |
| GET | `api/species?nodeId=&q=` | `SpeciesDto[]`: mọi loài, hoặc các loài nằm dưới một nhánh | | ◇ đề xuất (trang Bách khoa, ⌘K, trang chủ) |
| GET | `api/products?speciesId=&q=&page=&size=` | `Page<ProductDto>` (chỉ APPROVED) | 400 `INVALID_PAGINATION` | ◐ hiện trả `ProductDto[]`, chưa có `q`, `page` |
| GET | `api/products/{id}` | `ProductDto` | 400, 404 `PRODUCT_NOT_FOUND` | ✓ |
| POST | `api/auth/login` | `AuthResponse` | 401 `AUTH_INVALID_CREDENTIALS`, 403 `AUTH_ACCOUNT_BANNED` hoặc `AUTH_ACCOUNT_INACTIVE` | ✓ |
| POST | `api/auth/admin/login` | `AuthResponse` | như trên | ✓ |
| POST | `api/auth/register` | `AuthResponse` (201) | 400 `USER_*`, 409 `USER_USERNAME_EXISTS` hoặc `USER_EMAIL_EXISTS` | ✓ |

### Cần token USER

| Method | URL | Request → `data` | Lỗi chính | Backend |
|---|---|---|---|---|
| GET | `api/me` | → `MeDto` | 401 | ✗ |
| POST | `api/seller/apply` | `SellerApplyRequest` → `SellerDto` (201, PENDING) | 409 `SELLER_ALREADY_REGISTERED`, `SELLER_SHOP_NAME_EXISTS`; 400 `SELLER_INVALID_SHOP_NAME` | ✗ |
| GET | `api/seller/products` | → `ProductDto[]` (mọi trạng thái của shop tôi) | 403 `SELLER_NOT_ACTIVE` | ✗ |
| POST | `api/seller/products` | `CreateProductRequest` → `ProductDto` (201, PENDING) | 403 `SELLER_NOT_ACTIVE`; 400 `PRODUCT_INVALID_*` | ✗ |
| GET | `api/cart` | → `CartDto` (giỏ chưa tạo thì trả giỏ rỗng) | | ✗ |
| POST | `api/cart/items` | `AddCartItemRequest` → `CartDto` | 409 `PRODUCT_NOT_AVAILABLE`, `PRODUCT_OUT_OF_STOCK`, `CART_QUANTITY_EXCEEDS_STOCK`; 403 `ORDER_OWN_PRODUCT`; 400 `CART_INVALID_QUANTITY` | ✗ |
| PUT | `api/cart/items/{productId}` | `UpdateCartItemRequest` → `CartDto` | 404 `CART_ITEM_NOT_FOUND`; 400; 409 | ✗ |
| DELETE | `api/cart/items/{productId}` | → `CartDto` | 404 | ✗ |
| DELETE | `api/cart` | → `CartDto` (rỗng) | | ✗ |
| POST | `api/orders` | `PlaceOrderRequest` → `OrderDto` (201). Bỏ `items` thì mua cả giỏ | 400 `ORDER_*`, `CART_EMPTY`; 403 `ORDER_OWN_PRODUCT`; 409 `PRODUCT_OUT_OF_STOCK`, `PRODUCT_NOT_AVAILABLE` | ✗ |
| GET | `api/orders/mine` | → `OrderDto[]` | | ✗ |
| GET | `api/orders/{id}` | → `OrderDto` | 404 `ORDER_NOT_FOUND` (đơn của người khác cũng trả 404) | ✗ |

### Cần token ADMIN

| Method | URL | Vai trò | Request → `data` | Backend |
|---|---|---|---|---|
| GET | `api/admin/sellers?status=PENDING` | MODERATOR, SUPER_ADMIN | → `SellerDto[]` | ✗ |
| PUT | `api/admin/sellers/{id}/status` | MODERATOR, SUPER_ADMIN | `{status: ACTIVE, REJECTED hoặc BANNED}` → `SellerDto` (409 `SELLER_INVALID_STATUS_TRANSITION`) | ✗ |
| GET | `api/admin/products?status=PENDING` | MODERATOR, SUPER_ADMIN | → `ProductDto[]` | ✗ |
| PUT | `api/admin/products/{id}/status` | MODERATOR, SUPER_ADMIN | `{status: APPROVED hoặc REJECTED}` → `ProductDto` (409 `PRODUCT_INVALID_STATUS_TRANSITION`) | ✗ |
| POST | `api/admin/species` | BIOLOGIST, SUPER_ADMIN | `CreateSpeciesRequest` → `SpeciesDto` (201; 409 `SPECIES_NAME_EXISTS`) | ✗ (làm nếu còn thời gian) |

Gọi sai vai trò trả **403 `AUTH_FORBIDDEN`**. Không có token hoặc token sai trả **401** (`AUTH_UNAUTHORIZED`, `AUTH_TOKEN_INVALID`, `AUTH_TOKEN_EXPIRED`).

**Chuyển trạng thái hợp lệ** (PLAN mục 4.3):
- Shop: PENDING → ACTIVE hoặc REJECTED; ACTIVE → BANNED.
- Sản phẩm: PENDING → APPROVED hoặc REJECTED; APPROVED → SOLD_OUT (tự động khi kho về 0).

## 4. Luật nghiệp vụ MSW phải mô phỏng (theo PLAN mục 4.3–4.5)

1. **Đăng nhập:**
   - Sai username hoặc mật khẩu: 401 kèm câu chung.
   - Đúng mật khẩu nhưng tài khoản BANNED hoặc INACTIVE: 403.
   - Admin đăng nhập qua `auth/admin/login` bằng cột `account`.
2. **Mỗi request cần token:** đọc người gọi từ token, rồi **đọc lại trạng thái và vai trò từ db** (bị khoá thì 403 ngay).
3. **Giỏ hàng:**
   - Chỉ thêm được sản phẩm APPROVED và còn hàng, không phải của shop mình, `quantity ≥ 1`.
   - Thêm món đã có thì cộng dồn. Tổng số lượng của một món ≤ tồn kho.
   - PUT đặt lại số lượng (≥ 1, ≤ tồn kho).
   - GET tính `available`, `maxQuantity`, `lineTotal` và `subtotal` theo giá **hiện tại**.
   - Giỏ không lưu giá.
4. **Đặt hàng (mô phỏng transaction):**
   - Kiểm tra **tất cả** món trước. Có món nào hỏng thì trả 409 và **không đổi gì** (cả kho lẫn giỏ).
   - Đủ điều kiện thì trừ kho, chốt `unitPrice` theo giá hiện tại, sinh `orderCode` dạng `ORD-<năm>-<6 ký tự>`.
   - Kho về 0 thì chuyển sản phẩm sang `SOLD_OUT`.
   - Mua từ giỏ thì xoá giỏ. Trả 201.
5. **Người bán:**
   - Chỉ shop ACTIVE được đăng sản phẩm. Sản phẩm mới vào trạng thái PENDING.
   - `seller/products` trả mọi trạng thái của shop mình.
6. **Kiểm duyệt:**
   - Chỉ MODERATOR và SUPER_ADMIN được duyệt.
   - Chuyển trạng thái sai luật thì 409.
   - Ghi `approvedByAdminId` hoặc `moderatedByAdminId`.
   - Sản phẩm vừa APPROVED xuất hiện ngay ở `GET products`.
7. **Phân trang:**
   - `page` bắt đầu từ 1, `size` từ 1 đến 48, mặc định 12. Ngoài khoảng thì 400 `INVALID_PAGINATION`.
   - `q` tìm không phân biệt hoa thường và dấu, trong `productName` và tên loài.

## 5. Kiến trúc mock (`src/mocks/`)

- **`seed.ts`:** chép **đúng** dữ liệu từ `database/seed_data.sql`: 7 user, 5 admin, 5 shop, 25 nút phân loại, 9 loài, 10 sản phẩm, 3 đơn, 5 dòng đơn, 2 giỏ, 4 món trong giỏ.
  - Gán id theo thứ tự xuất hiện trong file SQL, bắt đầu từ 1 cho mỗi bảng.
  - Mật khẩu: user `123456`, admin `admin123` (chỉ là dữ liệu test).
  - **Giao diện không được dựa vào id cụ thể** (id thật trong SQL Server có thể khác).
- **`db.ts`:** kho trong bộ nhớ, có các hàm truy vấn và thay đổi. Lưu vào `localStorage` (key `bionexus.mock.v1`) để giỏ và đơn còn sau khi F5. Có `resetDb()` (nút trong DevPanel).
- **`auth.ts`:**
  - Token giả: `mock.<base64url(JSON {sub, accountType, role, exp})>`, hạn 8 giờ.
  - Hàm `requireUser` và `requireAdmin(roles)` trả lỗi đúng code.
- **`handlers/*.ts`:** `taxonomy`, `species`, `products`, `auth`, `me`, `seller`, `cart`, `orders`, `admin`.
  - Khớp đường dẫn bằng mẫu `*/api/...` (để chạy được dưới mọi base path).
  - Mỗi handler gọi `await delay(latency())` (mặc định 350 ms ±40%).
- **`faults.ts`:** DevPanel đặt lỗi giả cho request kế tiếp khớp mẫu đường dẫn (500, 401, 409 hoặc mạng chậm 3 s) để thử trạng thái lỗi.
- **`messages.ts`** (dùng chung với `lib/messages.ts`): map `MessageKey` → câu tiếng Việt cho mọi code ở PLAN mục 4.1. Khi chạy thật, giao diện vẫn ưu tiên `message` do server trả.
- **Khởi động:** trong `main.tsx`, nếu `USE_MOCKS` (từ `src/lib/env.ts`, xem tài liệu 01 mục 8) đúng thì `await worker.start({ serviceWorker: { url: './mockServiceWorker.js' }, onUnhandledRequest: 'bypass' })` trước khi render.

## 6. Ma trận tài khoản test (mock phải cho kết quả giống PLAN mục 6)

| Tài khoản | Mật khẩu | Kỳ vọng trong giao diện |
|---|---|---|
| `levanc` | 123456 | Giỏ 2 món, tạm tính **2.950.000 ₫**. Đơn ORD-2026-0001 (PENDING, 2.050.000 ₫) và ORD-2026-0002 (COMPLETED, 590.000 ₫). Đặt cả giỏ thành công |
| `nguyenvana` | 123456 | Shop **BioGreen Exotic** ACTIVE. Đăng sản phẩm thì vào PENDING. Không mua được hàng của shop mình |
| `phamthid` | 123456 | Shop **Carnivora Garden** ACTIVE. Giỏ có Leopard Gecko Tangerine ×5 (kho 3, vượt kho) và Rùa Hermann baby ×1 (SOLD_OUT). Đặt từ giỏ thì 409 |
| `tranthib` | 123456 | Shop **AquaTerra Shop** PENDING. Vào trang đăng sản phẩm thì thấy trạng thái chờ duyệt (403) |
| `hoangvane` | 123456 | Shop **Exotic Reptile Hub** REJECTED |
| `vuthif` | 123456 | Đăng nhập: 403 `AUTH_ACCOUNT_BANNED` |
| `dangvang` | 123456 | Đăng nhập: 403 `AUTH_ACCOUNT_INACTIVE` |
| `moderator1` | admin123 | Duyệt shop và sản phẩm. Hàng đợi có AquaTerra Shop và "Rồng Úc Hypo Baby (2 tháng tuổi)" |
| `moderator2` | admin123 | Đăng nhập admin: 403 |
| `biologist1` | admin123 | Quản lý loài được. Duyệt sản phẩm thì 403 |
| `biologist2` | admin123 | Đăng nhập admin: 403 |
| `superadmin` | admin123 | Mọi trang quản trị |

**Đáp án kiểm tra nhanh:**
- 2 nút gốc. Squamata có 3 họ. Chi Python có 2 loài (NT và VU).
- `GET products` ra **7** sản phẩm (seed có 10: 7 APPROVED, 1 PENDING, 1 REJECTED, 1 SOLD_OUT).
- Mức IUCN: LC 3 · NT 1 · VU 3 · EN 1 · CR 1.

## 7. Dữ liệu riêng của frontend (`src/content/species-extras.ts`)

DB không có những thông tin này, nhưng giao diện cần. Khóa theo `scientificName` (ổn định, không phụ thuộc id).

```ts
export interface SpeciesExtra {
  slug: string                         // 'ball-python' → thư mục ảnh public/photos/ball-python
  group: 'Bò sát' | 'Lưỡng cư' | 'Cây ăn thịt'
  origin: { lat: number; lng: number; place: string }   // gần đúng, chỉ để minh hoạ. Có thể tinh chỉnh theo GBIF
  hero: PhotoId                        // ảnh chính
  gallery: PhotoId[]                   // 4–8 ảnh
  habitat?: PhotoId                    // ảnh môi trường sống
  focus?: string                       // objectPosition của ảnh hero, ví dụ '62% 50%'
}
```

| scientificName | slug | Nhóm | Nơi bản địa (lat, lng) |
|---|---|---|---|
| Ambystoma mexicanum | axolotl | Lưỡng cư | Hồ Xochimilco, Mexico (19.26, -99.10) |
| Nepenthes rajah | nepenthes-rajah | Cây ăn thịt | Núi Kinabalu, Borneo (6.08, 116.56) |
| Python regius | ball-python | Bò sát | Savan Tây Phi (8.00, -1.00) |
| Eublepharis macularius | leopard-gecko | Bò sát | Pakistan, Afghanistan (30.00, 67.00) |
| Dionaea muscipula | venus-flytrap | Cây ăn thịt | Ven biển Carolina, Mỹ (34.20, -77.90) |
| Python bivittatus | burmese-python | Bò sát | Nam và Đông Nam Á (21.90, 95.90) |
| Pogona vitticeps | bearded-dragon | Bò sát | Miền trung nước Úc (-25.00, 134.00) |
| Testudo hermanni | hermann-tortoise | Bò sát | Nam Âu, Địa Trung Hải (41.90, 15.00) |
| Nepenthes ampullaria | nepenthes-ampullaria | Cây ăn thịt | Rừng thấp Borneo, Sumatra (1.50, 110.30) |

**Điểm đến của các cung sáng trên Hành tinh BioNexus** (nơi các shop nhân giống, suy từ địa chỉ chủ shop trong seed):
- BioGreen Exotic: Quận 1, TP.HCM (10.78, 106.70).
- Carnivora Garden: Thanh Khê, Đà Nẵng (16.07, 108.19).

Mỗi loài có cung bay tới shop đang bán loài đó. Loài chưa có shop nào bán thì bay tới TP.HCM, nét đứt.

**Bộ phân tích `parseEnvironmentSpecs(s)`** trả `{ tempMin, tempMax, baskMin?, baskMax?, humidMin?, humidMax?, habitat, raw }`. Bắt các mẫu "Nhiệt độ: 26-32°C", "Nhiệt độ nước: 14-18°C", "(điểm sưởi 38-42°C)", "ngày 18-26°C, đêm 10-15°C", "Độ ẩm: 30-40%", "không áp dụng". Viết test cho đủ 9 chuỗi trong seed.

## 8. Adapter và hook (`src/api/`)

- `adapters.ts`:
  - `toSpeciesView(dto, extras, photos)` ra `{ …dto, displayName, englishName, slug, group, origin, hero, gallery }`. `displayName` là phần trước dấu ngoặc của `commonName`.
  - `toProductView(dto, speciesMap, sellerMap?)` dùng `shopName` khi API có trả về. Không có thì "Cửa hàng #id".
- Mỗi file trong `endpoints/` xuất: hàm gọi thuần (`getSpecies(id)`), hook (`useSpecies(id)`) và key query.
- Mutation:
  - `useAddToCart`: optimistic, rollback khi lỗi, invalidate `['cart']` và `['product', id]`.
  - `usePlaceOrder`: invalidate cart, orders, products.
  - `useModerateProduct`: invalidate admin queue và products.
- `HANDOFF.md` (Prompt 16) liệt kê: những endpoint ✗/◇ mà giao diện đang dùng, những trường ◇, những chỗ đang lọc hoặc phân trang ở client.
