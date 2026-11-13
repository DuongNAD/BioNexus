# Chức năng mua hàng, thanh toán và giỏ hàng làm thêm (đang tắt sẵn)

File này liệt kê 18 chức năng làm thêm (TN-00 đến TN-17) cho phần **mua hàng**, **thanh toán** và **giỏ hàng**, phòng khi cô yêu cầu làm thêm trong buổi bảo vệ. Code đã viết xong, đã chạy thử với SQL Server thật, rồi **comment lại toàn bộ**: app hiện chạy y như trước.

Mỗi chức năng có một mã `[TN-xx]` (TN = tính năng). Cô bảo làm chức năng nào thì bỏ comment đúng các chỗ có mã đó.

> Số dòng trong file này đúng với trạng thái **đang tắt** lúc viết. Nếu bạn sửa file, số dòng sẽ lệch. Cách chắc chắn nhất là tìm trong toàn dự án: `Cmd + Shift + F` (Windows: `Ctrl + Shift + F`), gõ `[TN-01]`.

## 1. Bảng tóm tắt

| Mã | Chức năng | Cô có thể yêu cầu kiểu | Cần bật kèm | Chạy SQL | API mới |
|---|---|---|---|---|---|
| TN-00 | Nền chung cho đơn hàng | (không dùng riêng) | | | |
| TN-01 | Người mua hủy đơn, hoàn lại kho | "Cho người mua hủy đơn", "hủy thì trả hàng về kho" | TN-00 | | `POST api/orders/{id}/cancel` |
| TN-02 | Người mua xác nhận đã nhận hàng | "Đơn chuyển sang Hoàn tất bằng cách nào?" | TN-00 | | `POST api/orders/{id}/complete` |
| TN-03 | Quản trị viên quản lý đơn hàng | "Admin xem mọi đơn, hoàn tất hoặc hủy đơn" | TN-00 | | `GET api/admin/orders?status=`, `PUT api/admin/orders/{id}/status` |
| TN-04 | Thống kê doanh thu | "Thống kê doanh thu, sản phẩm bán chạy" | | | `GET api/admin/stats` |
| TN-05 | Người bán xem đơn của shop | "Người bán biết ai mua hàng của mình" | | | `GET api/seller/orders` |
| TN-06 | Mã giảm giá | "Thêm voucher / mã giảm giá" | | | `GET api/coupons/{code}?subtotal=`, thêm `couponCode` khi đặt hàng |
| TN-07 | Phí vận chuyển | "Thêm phí ship" | | | |
| TN-08 | Giới hạn số lượng mỗi sản phẩm | "Mỗi lần chỉ được mua tối đa 10 con" | | | |
| TN-09 | Tìm đơn theo mã hoặc tên sản phẩm | "Thêm ô tìm kiếm đơn hàng" | | | |
| TN-10 | Lưu phương thức thanh toán | "Lưu COD hay chuyển khoản vào đơn" | | **Có** | thêm `paymentMethod` khi đặt hàng |
| TN-11 | Trạng thái thanh toán, admin xác nhận đã thu tiền | "Đơn đã thanh toán hay chưa?" | TN-10 | **Có** | `GET api/admin/payments?status=`, `PUT api/admin/orders/{id}/payment` |
| TN-12 | In hóa đơn | "Xuất / in hóa đơn" | | | |
| TN-13 | Chọn món trong giỏ để đặt hàng | "Cho tích chọn món trong giỏ rồi mới thanh toán" | | | thêm `cartProductIds` khi đặt hàng |
| TN-14 | Xóa nhanh các món ngừng bán khỏi giỏ | "Giỏ có món hết hàng thì xử lý sao?" | | | `DELETE api/cart/unavailable` |
| TN-15 | Danh sách yêu thích (lưu để mua sau) | "Thêm chức năng yêu thích / lưu lại mua sau" | | **Có** | `GET api/wishlist`, `POST` và `DELETE api/wishlist/{productId}` |
| TN-16 | Đánh giá sản phẩm sau khi mua | "Cho người mua đánh giá sản phẩm" | | **Có** | `GET api/products/{id}/reviews`, `POST api/reviews` |
| TN-17 | Giỏ hàng tạm cho khách chưa đăng nhập | "Chưa đăng nhập có thêm vào giỏ được không?" | | | (dùng lại API giỏ hàng có sẵn) |

"Chạy SQL" là chạy file migration **trước** khi bật chức năng đó. Các file đều không xóa dữ liệu, chạy lại nhiều lần vẫn an toàn:

- TN-10, TN-11: [database/migrations/003_add_payment.sql](database/migrations/003_add_payment.sql), thêm 2 cột `paymentMethod` và `paymentStatus` vào bảng `Orders`.
- TN-15: [database/migrations/004_add_wishlist.sql](database/migrations/004_add_wishlist.sql), thêm bảng `Wishlists`.
- TN-16: [database/migrations/005_add_reviews.sql](database/migrations/005_add_reviews.sql), thêm bảng `Reviews`.

Mỗi chức năng gồm 3 phần: **backend Java**, **giao diện React**, **mock MSW**. Muốn chạy đầy đủ với backend thật thì bật cả backend lẫn giao diện. Phần mock chỉ dùng khi chạy giao diện với `VITE_USE_MOCKS=true`.

## 2. Cách bật và tắt

### Cách 1: dùng lệnh (nhanh, để thử trước buổi bảo vệ)

Chạy ở thư mục gốc dự án:

```bash
node tools/bat-tat-chuc-nang.mjs
```

```bash
node tools/bat-tat-chuc-nang.mjs bat TN-01
```

```bash
node tools/bat-tat-chuc-nang.mjs tat TN-01
```

```bash
node tools/bat-tat-chuc-nang.mjs bat tat-ca
```

```bash
node tools/bat-tat-chuc-nang.mjs tat tat-ca
```

```bash
node tools/bat-tat-chuc-nang.mjs vi-tri
```

- Lệnh không có tham số in trạng thái từng mã: `BẬT`, `TẮT`, hoặc `LẪN LỘN` (bật thiếu chỗ).
- `bat TN-01` tự bật luôn TN-00 vì TN-01 cần nó. `bat TN-11` tự bật TN-10.
- `vi-tri` in lại toàn bộ danh sách `file:dòng` như mục 5, đúng với code hiện tại.
- Bật rồi tắt sẽ trả code về **y hệt từng ký tự** (đã kiểm tra).

### Cách 2: bằng tay trong IntelliJ hoặc VS Code (khi làm trước mặt cô)

Có 3 kiểu đánh dấu:

1. **Khối thường** (Java, TypeScript):

   ```java
   // [TN-01] BẮT ĐẦU · Người mua hủy đơn của chính mình
   // public OrderDto cancelMyOrder(int userId, long orderId) throws SQLException {
   //     ...
   // }
   // [TN-01] KẾT THÚC
   ```

   Bôi đen các dòng **nằm giữa** hai dòng `BẮT ĐẦU` và `KẾT THÚC` (không bôi hai dòng đó), rồi bấm `Cmd + /` (Windows: `Ctrl + /`). IDE bỏ một lớp `//` ở mỗi dòng. Comment gốc trong code (dạng `// // ...`) sẽ còn lại một lớp `//`, đúng như ý.

2. **Khối JSX** (trong phần giao diện, file `.tsx`):

   ```tsx
   {/* [TN-01] BẮT ĐẦU · Nút "Hủy đơn" */}
   {/*
   <CancelOrderButton order={order} />
   */}
   {/* [TN-01] KẾT THÚC */}
   ```

   Xóa dòng `{/*` ngay dưới `BẮT ĐẦU` và dòng `*/}` ngay trên `KẾT THÚC`.

3. **Một dòng**: dòng kết thúc bằng `// [TN-01]`.

   ```ts
   // import { CancelOrderButton } from './components/CancelOrderButton'; // [TN-01]
   ```

   Xóa `// ` ở **đầu** dòng (hoặc đặt con trỏ vào dòng rồi bấm `Cmd + /`). Giữ nguyên `// [TN-01]` ở cuối dòng.

File mới (ví dụ `StatsDao.java`, `AdminOrdersPage.tsx`) là **một khối duy nhất** bao cả file: bỏ comment cả khối là xong.

**Sau khi bỏ comment:**

- Kiểm tra lại: `node tools/bat-tat-chuc-nang.mjs` phải báo `BẬT`, không được `LẪN LỘN`.
- Backend: build lại và khởi động lại Tomcat (Java không tự nạp lại class).
- TN-10, TN-11: chạy `003_add_payment.sql` trên `BioNexusDB` trước khi chạy backend, nếu không backend sẽ báo lỗi thiếu cột `paymentMethod`. TN-15: chạy `004_add_wishlist.sql`, nếu không sẽ báo lỗi thiếu bảng `Wishlists`. TN-16: chạy `005_add_reviews.sql` (thiếu thì báo lỗi bảng `Reviews`).
- Giao diện: `npm run dev` tự tải lại. Nếu nộp bằng WAR thì `npm run build` trong `frontend/` rồi build lại WAR.

### Tài khoản test để demo (dữ liệu seed)

| Vai trò | Tài khoản | Mật khẩu | Dùng cho |
|---|---|---|---|
| Người mua | `levanc` | `123456` | TN-01, 02, 06 đến 13, 15, 16 (giỏ seed có 2 món; đơn `ORD-2026-0002` đã hoàn tất nên đánh giá được "Cây bắt ruồi Venus" và "Nắp ấm Ampullaria xanh") |
| Khách | (không đăng nhập) | | TN-17: thêm vào giỏ khi chưa đăng nhập, rồi đăng nhập `levanc` để thấy giỏ được gộp |
| Người mua | `phamthid` | `123456` | TN-14 (giỏ seed có 1 món đã hết hàng và 1 món vượt tồn kho) |
| Chủ shop BioGreen Exotic | `nguyenvana` | `123456` | TN-05 (có đơn `ORD-2026-0001`) |
| Kiểm duyệt viên | `moderator1` | `admin123` | TN-03, 04, 11 (trang đăng nhập quản trị) |

Mã giảm giá để thử: `BIONEXUS10` (giảm 10%, tối đa 200.000đ) và `GIAM50K` (giảm 50.000đ cho tiền hàng từ 500.000đ).

## 3. Giải thích từng chức năng

### TN-00 · Nền chung cho đơn hàng

Không dùng riêng. Chứa phần mà TN-01, TN-02, TN-03 cùng cần:

- `OrdersDao.updateStatusIfCurrent`: `UPDATE Orders SET status = ? WHERE orderID = ? AND status = ?`. Điều kiện `AND status = ?` là chỗ quan trọng: hai người bấm hủy cùng lúc thì chỉ một câu UPDATE đổi được dòng, người kia nhận `false`. Nhờ vậy kho không bị hoàn hai lần.
- `ProductDao.restoreStock`: cộng lại kho; sản phẩm đang `SOLD_OUT` thì mở bán lại (`APPROVED`).
- `OrderService.cancelAndRestoreStock`: đổi trạng thái và hoàn kho trong **một transaction**. Lỗi giữa chừng thì `rollback`, không có chuyện đơn đã hủy mà kho chưa hoàn.
- `OrderService.markCompleted`: chuyển đơn `PENDING` sang `COMPLETED`.
- Mã lỗi mới `ORDER_CANNOT_COMPLETE` (409).

### TN-01 · Người mua hủy đơn, hoàn lại kho

- Trang chi tiết đơn có nút **Hủy đơn** (chỉ hiện khi đơn đang chờ xử lý), bấm thì hiện hộp thoại xác nhận.
- Backend kiểm tra đơn có phải của người đang đăng nhập không. Đơn của người khác trả 404 (giống `getMyOrder`, để không lộ là đơn đó có tồn tại).
- Đơn đã hoàn tất hoặc đã hủy thì trả 409 `ORDER_CANNOT_CANCEL` (mã này đã có sẵn trong `MessageKey`).
- Demo: đăng nhập `levanc`, mua hết kho một sản phẩm, xem sản phẩm thành "Hết hàng", hủy đơn, sản phẩm mở bán lại đúng số lượng cũ.

### TN-02 · Người mua xác nhận đã nhận hàng

- Hiện tại không có cách nào để đơn chuyển sang Hoàn tất. TN-02 thêm nút **Đã nhận hàng** trên trang chi tiết đơn.
- Chỉ đơn `PENDING` mới xác nhận được, lần thứ hai trả 409 `ORDER_CANNOT_COMPLETE`. Đơn đã hoàn tất thì không hủy được nữa.

### TN-03 · Quản trị viên quản lý đơn hàng

- Trang mới `#/admin/orders` (menu **Đơn hàng** bên trái khu quản trị): lọc theo trạng thái, tìm theo mã đơn hoặc tên người mua (không phân biệt dấu).
- Đơn đang chờ có hai nút **Hoàn tất** và **Hủy** (hủy có hộp thoại xác nhận và hoàn kho).
- Chỉ `MODERATOR` và `SUPER_ADMIN` dùng được (hàm `requireModerator` có sẵn trong `AdminServlet`). `BIOLOGIST` nhận 403.
- Không cho đưa đơn về lại `PENDING` (400 `INVALID_STATUS`).

### TN-04 · Thống kê doanh thu

- Trang Tổng quan quản trị thêm khối **Doanh thu và đơn hàng**: doanh thu đơn hoàn tất, tổng số đơn, số đơn chờ (kèm số tiền), số đơn hủy, biểu đồ cột doanh thu 6 tháng gần nhất, 5 sản phẩm bán chạy.
- SQL nằm ở `StatsDao`: `GROUP BY status`, `SUM`, `COUNT`, `TOP (?)`, `GROUP BY YEAR(orderDate), MONTH(orderDate)`.
- Tháng không có đơn thì SQL không trả dòng nào, nên `StatsService.fillMissingMonths` tự điền số 0 để biểu đồ luôn đủ 6 cột.
- Sản phẩm bán chạy không tính đơn đã hủy. Doanh thu chỉ tính đơn đã hoàn tất.

### TN-05 · Người bán xem đơn hàng của shop

- Bảng điều khiển người bán (`#/seller`) thêm khối **Đơn hàng của shop**.
- Một đơn có thể gồm hàng của nhiều shop, nên SQL dùng `SELECT DISTINCT` và mỗi đơn chỉ hiện **các món của shop mình**. Số tiền là tiền hàng của shop trong đơn đó, không phải tổng cả đơn.
- Người chưa có shop nhận 403 `SELLER_NOT_ACTIVE`.

### TN-06 · Mã giảm giá

- Trang thanh toán có ô **Mã giảm giá**. Bấm Áp dụng thì gọi `GET api/coupons/{code}?subtotal=` để xem trước số tiền giảm.
- Danh sách mã nằm trong `enums/Coupon.java` (chưa có bảng DB). Hai kiểu: giảm theo % có mức tối đa, hoặc giảm số tiền cố định có đơn tối thiểu.
- Lúc đặt hàng, backend **tính lại** từ giá trong DB, không tin số tiền giao diện gửi lên. Mã sai thì báo lỗi trước khi mở transaction. Không đủ mức tối thiểu thì ném lỗi trong transaction, nên cả đơn rollback: kho và giỏ giữ nguyên.
- Tiền giảm tính trên tiền hàng, không tính trên phí vận chuyển.
- Hướng mở rộng nếu cô hỏi: chuyển `Coupon` thành bảng `Coupons` (mã, %, ngày hết hạn, số lượt dùng).

### TN-07 · Phí vận chuyển

- Tiền hàng dưới 1.000.000đ thu 30.000đ, từ 1.000.000đ miễn phí. Quy tắc nằm ở `OrderService.shippingFeeFor` (backend) và `frontend/src/lib/purchaseRules.ts` (giao diện hiển thị trước).
- Trang giỏ hàng và trang thanh toán hiện phí; trang thanh toán có thêm gợi ý "Mua thêm ... để được miễn phí vận chuyển".
- DB không có cột riêng cho phí vận chuyển: phí được cộng vào `totalAmount`. Trang chi tiết đơn tính lại phí theo quy tắc. Đơn đặt **trước** khi bật TN-07 có tổng tiền bằng đúng tiền hàng nên vẫn hiện "Miễn phí".

### TN-08 · Giới hạn số lượng mỗi sản phẩm

- Mỗi sản phẩm tối đa 10 cá thể trong giỏ và trong một đơn (`CartService.MAX_QUANTITY_PER_PRODUCT`).
- Kiểm ở 3 chỗ: thêm vào giỏ (kể cả cộng dồn), sửa số lượng trong giỏ, đặt hàng. Lỗi 400 `ORDER_QUANTITY_LIMIT`.
- Giao diện: ô số lượng ở trang sản phẩm và giỏ hàng không cho chọn quá 10, có dòng nhắc "Mỗi sản phẩm mua tối đa 10 cá thể".
- Muốn đổi thành 5 thì sửa hằng số ở `CartService.java`, `purchaseRules.ts` và câu thông báo trong `MessageKey.java`.

### TN-09 · Tìm đơn hàng

- Trang "Đơn hàng của tôi" thêm ô tìm theo mã đơn hoặc tên sản phẩm, không phân biệt hoa thường và dấu. Lọc ngay ở giao diện, không cần API mới.

### TN-10 · Lưu phương thức thanh toán

- Trước đây trang thanh toán cho chọn COD hoặc VietQR nhưng chỉ để hiển thị. TN-10 gửi lựa chọn lên (`paymentMethod`: `COD` hoặc `BANK_TRANSFER`) và lưu vào cột `Orders.paymentMethod`.
- Bỏ trống thì mặc định COD. Giá trị lạ thì 400 `PAYMENT_INVALID_METHOD` (báo trước khi mở transaction, kho không bị trừ).
- Trang chi tiết đơn hiện phương thức thanh toán. Đơn chuyển khoản đang chờ thì hiện thẻ VietQR với **nội dung chuyển khoản là mã đơn**, để cửa hàng đối soát.
- Cần chạy `003_add_payment.sql`.

### TN-11 · Trạng thái thanh toán và xác nhận đã thu tiền

- Cột `Orders.paymentStatus`: `UNPAID` hoặc `PAID`. Đơn mới luôn `UNPAID`. Migration đánh dấu `PAID` cho các đơn COD đã hoàn tất từ trước.
- Trang mới `#/admin/payments` (menu **Thanh toán**): lọc Chưa thu tiền / Đã thu tiền, nút **Xác nhận đã thu tiền**.
- `UPDATE ... WHERE paymentStatus = 'UNPAID' AND status <> 'CANCELLED'`: đơn đã thu tiền hoặc đã hủy thì 409 `PAYMENT_CANNOT_CONFIRM`.
- Người mua thấy nhãn "Đã thanh toán" hoặc "Chưa thanh toán" ở trang chi tiết đơn. Đã thanh toán thì thẻ VietQR tự ẩn.
- Cần bật TN-10 và chạy `003_add_payment.sql`.

### TN-12 · In hóa đơn

- Nút **In hóa đơn** ở trang chi tiết đơn mở một cửa sổ hóa đơn nền trắng (mã đơn, ngày, địa chỉ, bảng sản phẩm, tiền hàng, phí hoặc giảm giá, tổng tiền) rồi gọi lệnh in của trình duyệt. Muốn lưu PDF thì chọn "Lưu thành PDF" trong hộp thoại in.
- Tên sản phẩm và địa chỉ được thoát ký tự HTML trước khi ghép vào trang in, tránh lỗi chèn mã (XSS).
- Chỉ có giao diện, không cần backend.

### TN-13 · Chọn món trong giỏ để đặt hàng

- Mỗi món trong giỏ có ô tích, thêm ô **Chọn tất cả**. Mặc định chọn hết; món ngừng bán không chọn được và tự bị loại khỏi đơn.
- Tóm tắt đơn và tổng tiền chỉ tính các món đang chọn. Bấm "Tiến hành đặt hàng" thì sang `#/checkout?chon=7,9` (danh sách id món đã chọn).
- Gửi lên backend `cartProductIds`. Backend kiểm tra mọi món được chọn phải đang nằm trong giỏ (404 `CART_ITEM_NOT_FOUND`), danh sách rỗng thì 400 `ORDER_EMPTY_ITEMS`.
- Trong **cùng transaction** với việc tạo đơn, backend chỉ xóa khỏi giỏ đúng các món vừa mua. Món chưa chọn vẫn ở lại giỏ. Không gửi `cartProductIds` thì mua cả giỏ như cũ.

### TN-14 · Xóa nhanh các món ngừng bán khỏi giỏ

- Giỏ có món ngừng bán hoặc hết hàng thì hiện nút **Xóa N món ngừng bán khỏi giỏ** ở khung tóm tắt.
- `DELETE api/cart/unavailable` xóa mọi món mà sản phẩm không còn `APPROVED`, hết kho, hoặc đã bị xóa. Điều kiện này dùng chung với cờ `available` của giỏ, nên giao diện và backend hiểu giống nhau.
- Món còn bán nhưng vượt tồn kho **không** bị xóa (đã có sẵn nút "Giảm về ...").

### TN-15 · Danh sách yêu thích (lưu để mua sau)

- Bảng mới `Wishlists(userID, productID, addedAt)`, khóa chính `(userID, productID)` nên mỗi sản phẩm chỉ lưu một lần. Không lưu giá, giá luôn là giá hiện tại.
- Trang sản phẩm có nút **Lưu để mua sau** (lưu được cả khi đang hết hàng). Trong giỏ hàng, nút trái tim ở mỗi món chuyển món đó sang danh sách yêu thích và bỏ khỏi giỏ.
- Trang mới `#/wishlist` (menu **Yêu thích** trong khu tài khoản): thêm vào giỏ hoặc bỏ lưu.
- Lưu trùng không báo lỗi. Bỏ lưu món không có trong danh sách thì 404. API cần đăng nhập USER: đã thêm `/api/wishlist/*` vào `JwtAuthFilter`.
- Cần chạy `004_add_wishlist.sql`.

### TN-16 · Đánh giá sản phẩm sau khi mua

- Trang sản phẩm có khối **Đánh giá từ người mua**: điểm trung bình, số đánh giá, danh sách (mới nhất trước), và form chọn 1 đến 5 sao kèm nhận xét.
- Ai cũng xem được đánh giá (`GET api/products/{id}/reviews`, nằm trong `ProductsServlet`). Gửi đánh giá phải đăng nhập (`POST api/reviews`, có `JwtAuthFilter`).
- Chỉ người có đơn **đã hoàn tất** chứa sản phẩm đó mới gửi được: `ReviewDao.hasCompletedPurchase` JOIN `Orders` với `OrderDetails`. Chưa mua hoặc đơn còn đang chờ thì 403 `REVIEW_NOT_PURCHASED`.
- Mỗi người chỉ đánh giá một sản phẩm một lần: ràng buộc `UNIQUE(userID, productID)` trong DB, lần hai trả 409 `REVIEW_ALREADY_EXISTS`. Đặt ràng buộc trong DB nên hai lần bấm cùng lúc cũng chỉ lưu một.
- Số sao ngoài 1 đến 5 thì 400 `REVIEW_INVALID_RATING` (DB cũng có `CHECK`). Nhận xét trống hoặc quá 1000 ký tự thì 400 `REVIEW_INVALID_COMMENT`.
- Cần chạy `005_add_reviews.sql`. Kết hợp tốt với TN-02 (người mua bấm "Đã nhận hàng" xong là đánh giá được).

### TN-17 · Giỏ hàng tạm cho khách chưa đăng nhập

- Trước đây khách bấm "Thêm vào giỏ" thì bị mời đăng nhập. Giờ món được lưu vào **giỏ tạm** trong `localStorage` của trình duyệt (`frontend/src/lib/guestCart.ts`), có thông báo kèm nút Đăng nhập.
- Giỏ tạm chỉ lưu id sản phẩm và số lượng. Thêm nhiều lần thì cộng dồn, không vượt tồn kho (và không vượt 10 nếu bật TN-08).
- Ngay khi khách đăng nhập, `GuestCartMerger` (gắn trong `AppShell` của `router.tsx`) gọi `POST api/cart/items` cho từng món để gộp vào giỏ thật, rồi xóa giỏ tạm. Món nào backend từ chối (hết hàng, ngừng bán, hàng của chính shop mình) thì bỏ qua và báo số món không thêm được.
- Không cần sửa backend: mọi kiểm tra vẫn do API giỏ hàng có sẵn làm.

## 4. Những chỗ đã sửa sẵn và đang chạy (không đổi hành vi)

Để mỗi chức năng chỉ cần **bỏ comment** (không phải sửa code cũ), một vài chỗ đã được viết lại sẵn. Khi mọi mã đang tắt, các chỗ này cho ra kết quả y như trước:

- `frontend/src/lib/purchaseRules.ts` (file mới): `maxQuantityPerProduct(stock)` trả về đúng `stock`, `shippingFeeFor(...)` trả về 0. Trang sản phẩm, giỏ hàng, thanh toán gọi hai hàm này thay cho số tồn kho và chữ "Miễn phí" viết cứng.
- `CheckoutPage.tsx`: tổng tiền là `totalToPay = subtotal + shippingFee` (phí đang là 0).
- `OrderDetailPage.tsx`: biến `shippingFee = 0`; cụm nút ở đầu trang được bọc trong một `div` giới hạn bề rộng để khi có nhiều nút thì nút xuống hàng.
- `OrdersPage.tsx`: danh sách hiển thị đổi tên thành `visibleOrders` (đang bằng danh sách cũ).
- `CartPage.tsx`: tóm tắt tính trên `itemsToOrder` (đang bằng cả giỏ); câu nhắc `checkoutHint` và đường dẫn `checkoutPath` (đang là `/checkout`) để TN-13 thay; phí ship lấy từ `shippingFeeFor` (đang là 0); tạm tính không còn bọc `useMemo` (phép cộng rất nhẹ).
- `CheckoutPage.tsx`: các món của giỏ lấy qua biến `cartLinesToOrder` (đang bằng cả giỏ) để TN-13 lọc.
- `JwtAuthFilter.java`: dấu `})` của `@WebFilter` xuống dòng để chèn được dòng `"/api/wishlist/*"` của TN-15.
- `OrdersDao.mapRow`: tách `new Orders(...)` ra biến `order` để thêm được dòng đọc cột thanh toán.
- `PlaceOrderRequest.java`, `OrderDto.java`: dấu `)` của record và của `new OrderDto(...)` xuống dòng để chèn được dòng `, String couponCode // [TN-06]`...
- Các file mới bên giao diện có một dòng `export const FEATURE_INFO = '...'` ở đầu. Dòng này để file không bị coi là file rỗng khi cả khối bị comment (lint cấm file rỗng).
- `tools/bat-tat-chuc-nang.mjs`: script bật/tắt ở mục 2.

## 5. Vị trí từng chỗ cần bỏ comment

Đúng với code ở trạng thái **đang tắt**. Bấm vào tên file để mở đúng dòng. Kiểu `khối`, `khối JSX`, `một dòng` xem mục 2.

### TN-00 · Nền chung cho đơn hàng (TN-01, TN-02, TN-03 cần cái này)

**Backend (Java)**

- [OrderDetailsDao.java:87-103](backend/src/main/java/com/bionexus/backend/dal/OrderDetailsDao.java#L87) · khối · `Đọc các dòng của đơn bằng Connection của transaction`
- [OrdersDao.java:181-194](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L181) · khối · `Đổi trạng thái đơn bằng Connection của transaction`
- [ProductDao.java:265-279](backend/src/main/java/com/bionexus/backend/dal/ProductDao.java#L265) · khối · `Hoàn kho khi hủy đơn (dùng Connection của transaction hủy đơn)`
- [MessageKey.java:87](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L87) · một dòng · `ORDER_CANNOT_COMPLETE("Chỉ hoàn tất được đơn hàng đang chờ xử lý", "Only pending orders...`
- [OrderService.java:280-313](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L280) · khối · `Hủy đơn (có hoàn kho) và hoàn tất đơn, dùng chung cho người mua (TN-01, TN-02) và quản ...`
- [ApiErrors.java:22](backend/src/main/java/com/bionexus/backend/util/ApiErrors.java#L22) · một dòng · `case ORDER_CANNOT_COMPLETE -> 409;`

**Frontend: kiểu dữ liệu và hook gọi API**

- [messages.ts:90](frontend/src/lib/messages.ts#L90) · một dòng · `ORDER_CANNOT_COMPLETE: 'Chỉ hoàn tất được đơn hàng đang chờ xử lý',`
- [api.ts:96](frontend/src/types/api.ts#L96) · một dòng · `\| 'ORDER_CANNOT_COMPLETE'`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:935-964](frontend/src/mocks/db.ts#L935) · khối · `Hủy đơn (hoàn kho) và hoàn tất đơn, dùng chung cho TN-01, TN-02, TN-03`

### TN-01 · Người mua hủy đơn, hoàn lại kho

**Backend (Java)**

- [OrderService.java:315-325](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L315) · khối · `Người mua hủy đơn của chính mình (POST /api/orders/{id}/cancel)`
- [OrderServlet.java:26-39](backend/src/main/java/com/bionexus/backend/servlet/OrderServlet.java#L26) · khối · `POST /api/orders/{id}/cancel: người mua hủy đơn đang chờ xử lý`

**Frontend: kiểu dữ liệu và hook gọi API**

- [useOrderMutations.ts:28-45](frontend/src/api/mutations/useOrderMutations.ts#L28) · khối · `Người mua hủy đơn đang chờ xử lý (POST api/orders/{id}/cancel)`

**Frontend: giao diện**

- [OrderDetailPage.tsx:186-190](frontend/src/pages/orders/OrderDetailPage.tsx#L186) · khối JSX · `Nút "Hủy đơn" (chỉ hiện khi đơn đang chờ xử lý)`
- [OrderDetailPage.tsx:22](frontend/src/pages/orders/OrderDetailPage.tsx#L22) · một dòng · `import { CancelOrderButton } from './components/CancelOrderButton';`
- [CancelOrderButton.tsx:4-75](frontend/src/pages/orders/components/CancelOrderButton.tsx#L4) · khối · `Nút hủy đơn kèm hộp thoại xác nhận (trang chi tiết đơn hàng)`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:966-981](frontend/src/mocks/db.ts#L966) · khối · `Người mua hủy đơn của mình`
- [orders.ts:74-86](frontend/src/mocks/handlers/orders.ts#L74) · khối · `Người mua hủy đơn (POST api/orders/:id/cancel)`

### TN-02 · Người mua xác nhận đã nhận hàng

**Backend (Java)**

- [MessageKey.java:88](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L88) · một dòng · `ORDER_COMPLETE_SUCCESS("Đã xác nhận nhận hàng, đơn hàng hoàn tất", "Order marked as rec...`
- [OrderService.java:327-336](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L327) · khối · `Người mua xác nhận đã nhận hàng (POST /api/orders/{id}/complete)`
- [OrderServlet.java:40-53](backend/src/main/java/com/bionexus/backend/servlet/OrderServlet.java#L40) · khối · `POST /api/orders/{id}/complete: người mua xác nhận đã nhận hàng`

**Frontend: kiểu dữ liệu và hook gọi API**

- [useOrderMutations.ts:47-61](frontend/src/api/mutations/useOrderMutations.ts#L47) · khối · `Người mua xác nhận đã nhận hàng (POST api/orders/{id}/complete)`
- [messages.ts:91](frontend/src/lib/messages.ts#L91) · một dòng · `ORDER_COMPLETE_SUCCESS: 'Đã xác nhận nhận hàng, đơn hàng hoàn tất',`
- [api.ts:97](frontend/src/types/api.ts#L97) · một dòng · `\| 'ORDER_COMPLETE_SUCCESS'`

**Frontend: giao diện**

- [OrderDetailPage.tsx:181-185](frontend/src/pages/orders/OrderDetailPage.tsx#L181) · khối JSX · `Nút "Đã nhận hàng" (chỉ hiện khi đơn đang chờ xử lý)`
- [OrderDetailPage.tsx:23](frontend/src/pages/orders/OrderDetailPage.tsx#L23) · một dòng · `import { ConfirmReceivedButton } from './components/ConfirmReceivedButton';`
- [ConfirmReceivedButton.tsx:4-74](frontend/src/pages/orders/components/ConfirmReceivedButton.tsx#L4) · khối · `Nút "Đã nhận hàng" kèm hộp thoại xác nhận (trang chi tiết đơn hàng)`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:983-1001](frontend/src/mocks/db.ts#L983) · khối · `Người mua xác nhận đã nhận hàng`
- [orders.ts:88-100](frontend/src/mocks/handlers/orders.ts#L88) · khối · `Người mua xác nhận đã nhận hàng (POST api/orders/:id/complete)`

### TN-03 · Quản trị viên quản lý đơn hàng

**Backend (Java)**

- [OrdersDao.java:196-220](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L196) · khối · `Danh sách đơn cho trang quản trị`
- [AdminOrderDto.java:3-39](backend/src/main/java/com/bionexus/backend/dto/AdminOrderDto.java#L3) · khối · `Đơn hàng kèm thông tin người mua, cho trang quản trị`
- [OrderService.java:338-367](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L338) · khối · `Quản trị viên xem mọi đơn và đổi trạng thái đơn`
- [OrderService.java:23](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L23) · một dòng · `import com.bionexus.backend.dal.UsersDao;`
- [OrderService.java:24](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L24) · một dòng · `import com.bionexus.backend.dto.AdminOrderDto;`
- [OrderService.java:25](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L25) · một dòng · `import com.bionexus.backend.model.Users;`
- [AdminServlet.java:73-77](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L73) · khối · `GET /api/admin/orders?status=: danh sách đơn cho quản trị`
- [AdminServlet.java:123-127](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L123) · khối · `PUT /api/admin/orders/{id}/status: hoàn tất hoặc hủy đơn (hủy thì hoàn kho)`
- [AdminServlet.java:9](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L9) · một dòng · `import com.bionexus.backend.enums.OrderStatus;`
- [AdminServlet.java:10](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L10) · một dòng · `import com.bionexus.backend.service.OrderService;`
- [AdminServlet.java:31](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L31) · một dòng · `private final OrderService orderService = new OrderService();`

**Frontend: kiểu dữ liệu và hook gọi API**

- [keys.ts:84](frontend/src/api/keys.ts#L84) · một dòng · `orders: (status?: string) => [...queryKeys.admin.all(), 'orders', status ?? 'ALL'] as c...`
- [useAdminMutations.ts:95-115](frontend/src/api/mutations/useAdminMutations.ts#L95) · khối · `Quản trị viên hoàn tất hoặc hủy đơn (PUT api/admin/orders/{id}/status)`
- [useAdminMutations.ts:13](frontend/src/api/mutations/useAdminMutations.ts#L13) · một dòng · `import type { AdminOrderDto, OrderStatus } from '@/types/api';`
- [useAdminQueries.ts:46-60](frontend/src/api/queries/useAdminQueries.ts#L46) · khối · `Danh sách đơn cho quản trị (GET api/admin/orders?status=)`
- [useAdminQueries.ts:6](frontend/src/api/queries/useAdminQueries.ts#L6) · một dòng · `import type { AdminOrderDto, OrderStatus } from '@/types/api';`
- [api.ts:265-270](frontend/src/types/api.ts#L265) · khối · `Đơn hàng cho trang quản trị (AdminOrderDto.java)`

**Frontend: giao diện**

- [router.tsx:252-259](frontend/src/app/router.tsx#L252) · khối · `Trang quản trị đơn hàng`
- [router.tsx:39](frontend/src/app/router.tsx#L39) · một dòng · `const AdminOrdersPage = React.lazy(() => import('@/pages/admin/AdminOrdersPage'));`
- [routes.ts:41](frontend/src/app/routes.ts#L41) · một dòng · `{ path: '/admin/orders', name: 'Quản lý đơn hàng', title: 'Quản lý Đơn hàng', layout: '...`
- [AdminLayout.tsx:4](frontend/src/components/layout/AdminLayout.tsx#L4) · một dòng · `import { ReceiptText } from 'lucide-react';`
- [AdminLayout.tsx:26](frontend/src/components/layout/AdminLayout.tsx#L26) · một dòng · `{ label: 'Đơn hàng', path: '/admin/orders', icon: ReceiptText, allowedRoles: ['SUPER_AD...`
- [AdminOrdersPage.tsx:4-235](frontend/src/pages/admin/AdminOrdersPage.tsx#L4) · khối · `Trang quản trị đơn hàng: xem mọi đơn, lọc, hoàn tất hoặc hủy (hủy thì hoàn kho)`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:1003-1036](frontend/src/mocks/db.ts#L1003) · khối · `Quản trị viên xem mọi đơn và đổi trạng thái`
- [db.ts:38](frontend/src/mocks/db.ts#L38) · một dòng · `import type { AdminOrderDto, OrderStatus } from '@/types/api';`
- [admin.ts:117-145](frontend/src/mocks/handlers/admin.ts#L117) · khối · `Danh sách đơn và đổi trạng thái đơn (MODERATOR / SUPER_ADMIN)`
- [admin.ts:6](frontend/src/mocks/handlers/admin.ts#L6) · một dòng · `import type { OrderStatus } from '@/types/api';`

### TN-04 · Thống kê doanh thu cho quản trị

**Backend (Java)**

- [StatsDao.java:3-91](backend/src/main/java/com/bionexus/backend/dal/StatsDao.java#L3) · khối · `Các câu SQL thống kê (GROUP BY, SUM, COUNT, TOP)`
- [SalesStatsDto.java:3-29](backend/src/main/java/com/bionexus/backend/dto/SalesStatsDto.java#L3) · khối · `Dữ liệu trả về cho GET /api/admin/stats`
- [StatsService.java:3-69](backend/src/main/java/com/bionexus/backend/service/StatsService.java#L3) · khối · `Ghép số liệu thống kê doanh thu`
- [AdminServlet.java:78-81](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L78) · khối · `GET /api/admin/stats: thống kê doanh thu`
- [AdminServlet.java:11](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L11) · một dòng · `import com.bionexus.backend.service.StatsService;`
- [AdminServlet.java:32](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L32) · một dòng · `private final StatsService statsService = new StatsService();`

**Frontend: kiểu dữ liệu và hook gọi API**

- [keys.ts:85](frontend/src/api/keys.ts#L85) · một dòng · `stats: () => [...queryKeys.admin.all(), 'stats'] as const,`
- [useAdminQueries.ts:62-74](frontend/src/api/queries/useAdminQueries.ts#L62) · khối · `Thống kê doanh thu (GET api/admin/stats)`
- [useAdminQueries.ts:7](frontend/src/api/queries/useAdminQueries.ts#L7) · một dòng · `import type { SalesStatsDto } from '@/types/api';`
- [api.ts:272-283](frontend/src/types/api.ts#L272) · khối · `Thống kê doanh thu (SalesStatsDto.java)`

**Frontend: giao diện**

- [AdminDashboardPage.tsx:123-127](frontend/src/pages/admin/AdminDashboardPage.tsx#L123) · khối JSX · `Thống kê doanh thu, đơn hàng và sản phẩm bán chạy`
- [AdminDashboardPage.tsx:14](frontend/src/pages/admin/AdminDashboardPage.tsx#L14) · một dòng · `import { SalesStatsSection } from './components/SalesStatsSection';`
- [SalesStatsSection.tsx:4-154](frontend/src/pages/admin/components/SalesStatsSection.tsx#L4) · khối · `Khối thống kê doanh thu trên trang tổng quan quản trị`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:1038-1084](frontend/src/mocks/db.ts#L1038) · khối · `Thống kê doanh thu (cùng cách tính với StatsService.java)`
- [db.ts:39](frontend/src/mocks/db.ts#L39) · một dòng · `import type { SalesStatsDto } from '@/types/api';`
- [admin.ts:147-154](frontend/src/mocks/handlers/admin.ts#L147) · khối · `Thống kê doanh thu (MODERATOR / SUPER_ADMIN)`

### TN-05 · Người bán xem đơn hàng của shop

**Backend (Java)**

- [OrdersDao.java:222-245](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L222) · khối · `Các đơn có chứa sản phẩm của một shop`
- [SellerOrderDto.java:3-42](backend/src/main/java/com/bionexus/backend/dto/SellerOrderDto.java#L3) · khối · `Đơn hàng nhìn từ phía người bán`
- [OrderService.java:369-394](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L369) · khối · `Người bán xem các đơn có hàng của shop mình (GET /api/seller/orders)`
- [OrderService.java:26](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L26) · một dòng · `import com.bionexus.backend.dal.UsersDao;`
- [OrderService.java:27](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L27) · một dòng · `import com.bionexus.backend.dto.SellerOrderDto;`
- [OrderService.java:28](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L28) · một dòng · `import com.bionexus.backend.model.Users;`
- [SellerServlet.java:54-58](backend/src/main/java/com/bionexus/backend/servlet/SellerServlet.java#L54) · khối · `GET /api/seller/orders: các đơn có hàng của shop tôi`
- [SellerServlet.java:8](backend/src/main/java/com/bionexus/backend/servlet/SellerServlet.java#L8) · một dòng · `import com.bionexus.backend.service.OrderService;`
- [SellerServlet.java:22](backend/src/main/java/com/bionexus/backend/servlet/SellerServlet.java#L22) · một dòng · `private final OrderService orderService = new OrderService();`

**Frontend: kiểu dữ liệu và hook gọi API**

- [keys.ts:74](frontend/src/api/keys.ts#L74) · một dòng · `orders: () => [...queryKeys.seller.all(), 'orders'] as const,`
- [useSellerQueries.ts:33-45](frontend/src/api/queries/useSellerQueries.ts#L33) · khối · `Các đơn có hàng của shop tôi (GET api/seller/orders)`
- [useSellerQueries.ts:6](frontend/src/api/queries/useSellerQueries.ts#L6) · một dòng · `import type { SellerOrderDto } from '@/types/api';`
- [api.ts:285-296](frontend/src/types/api.ts#L285) · khối · `Đơn hàng nhìn từ phía người bán (SellerOrderDto.java)`

**Frontend: giao diện**

- [SellerDashboardPage.tsx:244-248](frontend/src/pages/seller/SellerDashboardPage.tsx#L244) · khối JSX · `Đơn hàng có cá thể của shop`
- [SellerDashboardPage.tsx:17](frontend/src/pages/seller/SellerDashboardPage.tsx#L17) · một dòng · `import { ShopOrdersSection } from './components/ShopOrdersSection';`
- [ShopOrdersSection.tsx:4-92](frontend/src/pages/seller/components/ShopOrdersSection.tsx#L4) · khối · `Khối "Đơn hàng của shop" trên bảng điều khiển người bán`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:1086-1116](frontend/src/mocks/db.ts#L1086) · khối · `Người bán xem các đơn có hàng của shop mình`
- [db.ts:40](frontend/src/mocks/db.ts#L40) · một dòng · `import type { SellerOrderDto } from '@/types/api';`
- [seller.ts:99-107](frontend/src/mocks/handlers/seller.ts#L99) · khối · `Các đơn có hàng của shop tôi (GET api/seller/orders)`

### TN-06 · Mã giảm giá khi đặt hàng

**Backend (Java)**

- [OrderDetailsDao.java:105-116](backend/src/main/java/com/bionexus/backend/dal/OrderDetailsDao.java#L105) · khối · `Tổng tiền hàng của một đơn (cộng số lượng nhân đơn giá của từng dòng)`
- [OrdersDao.java:297-306](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L297) · khối · `Trừ tiền giảm giá vào tổng đơn (trong transaction đặt hàng)`
- [OrdersDao.java:8](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L8) · một dòng · `import java.math.BigDecimal;`
- [CouponDto.java:3-9](backend/src/main/java/com/bionexus/backend/dto/CouponDto.java#L3) · khối · `Kết quả kiểm tra mã giảm giá`
- [PlaceOrderRequest.java:10](backend/src/main/java/com/bionexus/backend/dto/PlaceOrderRequest.java#L10) · một dòng · `, String couponCode`
- [Coupon.java:3-76](backend/src/main/java/com/bionexus/backend/enums/Coupon.java#L3) · khối · `Danh sách mã giảm giá cố định (chưa có bảng trong DB)`
- [MessageKey.java:90](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L90) · một dòng · `COUPON_INVALID("Mã giảm giá không tồn tại", "Coupon code does not exist"),`
- [MessageKey.java:94](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L94) · một dòng · `COUPON_MIN_ORDER_NOT_MET("Đơn hàng chưa đạt giá trị tối thiểu của mã giảm giá", "Order ...`
- [OrderService.java:123-131](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L123) · khối · `Tìm mã giảm giá trước khi mở transaction: sai mã thì báo ngay, chưa đụng tới kho`
- [OrderService.java:151-155](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L151) · khối · `Trừ tiền giảm giá vào đơn vừa tạo, vẫn trong cùng transaction`
- [OrderService.java:420-431](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L420) · khối · `Áp mã giảm giá cho đơn vừa tạo (gọi trong transaction của placeOrder)`
- [OrderService.java:29](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L29) · một dòng · `import com.bionexus.backend.enums.Coupon;`
- [CouponServlet.java:3-69](backend/src/main/java/com/bionexus/backend/servlet/CouponServlet.java#L3) · khối · `API kiểm tra mã giảm giá: GET /api/coupons/{code}?subtotal=`

**Frontend: kiểu dữ liệu và hook gọi API**

- [useOrderMutations.ts:63-75](frontend/src/api/mutations/useOrderMutations.ts#L63) · khối · `Kiểm tra mã giảm giá trước khi đặt (GET api/coupons/{code}?subtotal=)`
- [useOrderMutations.ts:5](frontend/src/api/mutations/useOrderMutations.ts#L5) · một dòng · `import type { CouponDto } from '@/types/api';`
- [messages.ts:93](frontend/src/lib/messages.ts#L93) · một dòng · `COUPON_INVALID: 'Mã giảm giá không tồn tại',`
- [messages.ts:94](frontend/src/lib/messages.ts#L94) · một dòng · `COUPON_MIN_ORDER_NOT_MET: 'Đơn hàng chưa đạt giá trị tối thiểu của mã giảm giá',`
- [api.ts:298-305](frontend/src/types/api.ts#L298) · khối · `Kết quả kiểm tra mã giảm giá (CouponDto.java)`
- [api.ts:99](frontend/src/types/api.ts#L99) · một dòng · `\| 'COUPON_INVALID'`
- [api.ts:100](frontend/src/types/api.ts#L100) · một dòng · `\| 'COUPON_MIN_ORDER_NOT_MET'`
- [api.ts:367](frontend/src/types/api.ts#L367) · một dòng · `couponCode?: string;`

**Frontend: giao diện**

- [CheckoutPage.tsx:90-92](frontend/src/pages/checkout/CheckoutPage.tsx#L90) · khối · `Mã giảm giá đã áp dụng (null là chưa dùng mã)`
- [CheckoutPage.tsx:176-180](frontend/src/pages/checkout/CheckoutPage.tsx#L176) · khối · `Trừ tiền giảm giá của mã đã áp dụng`
- [CheckoutPage.tsx:192-196](frontend/src/pages/checkout/CheckoutPage.tsx#L192) · khối · `Gửi kèm mã giảm giá; backend tự tính lại số tiền được giảm`
- [CheckoutPage.tsx:482-488](frontend/src/pages/checkout/CheckoutPage.tsx#L482) · khối JSX · `Ô nhập mã giảm giá`
- [CheckoutPage.tsx:496-505](frontend/src/pages/checkout/CheckoutPage.tsx#L496) · khối JSX · `Dòng tiền được giảm`
- [CheckoutPage.tsx:35](frontend/src/pages/checkout/CheckoutPage.tsx#L35) · một dòng · `import { CouponField } from './components/CouponField';`
- [CheckoutPage.tsx:36](frontend/src/pages/checkout/CheckoutPage.tsx#L36) · một dòng · `import type { CouponDto } from '@/types/api';`
- [CouponField.tsx:4-107](frontend/src/pages/checkout/components/CouponField.tsx#L4) · khối · `Ô nhập mã giảm giá trên trang thanh toán`
- [OrderDetailPage.tsx:133-136](frontend/src/pages/orders/OrderDetailPage.tsx#L133) · khối · `Tiền được giảm = tiền hàng + phí vận chuyển - tổng tiền (DB không lưu riêng)`
- [OrderDetailPage.tsx:318-327](frontend/src/pages/orders/OrderDetailPage.tsx#L318) · khối JSX · `Dòng tiền được giảm nhờ mã giảm giá`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:50-66](frontend/src/mocks/db.ts#L50) · khối · `Mã giảm giá giả lập, khớp enum Coupon.java ở backend`
- [db.ts:778-790](frontend/src/mocks/db.ts#L778) · khối · `Kiểm tra mã giảm giá trước khi trừ kho (sai mã thì không đụng gì tới dữ liệu)`
- [db.ts:822-836](frontend/src/mocks/db.ts#L822) · khối · `Tiền hàng phải đạt mức tối thiểu của mã (tính trước khi trừ kho)`
- [db.ts:867-872](frontend/src/mocks/db.ts#L867) · khối · `Trừ tiền giảm giá (tính trên tiền hàng, không tính trên phí vận chuyển)`
- [db.ts:1143-1166](frontend/src/mocks/db.ts#L1143) · khối · `Xem trước mã giảm giá cho trang thanh toán`
- [db.ts:41](frontend/src/mocks/db.ts#L41) · một dòng · `import type { CouponDto } from '@/types/api';`
- [orders.ts:102-112](frontend/src/mocks/handlers/orders.ts#L102) · khối · `Xem trước mã giảm giá (GET api/coupons/:code?subtotal=), không cần đăng nhập`

### TN-07 · Phí vận chuyển

**Backend (Java)**

- [OrderService.java:223-225](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L223) · khối · `Cộng phí vận chuyển vào tổng đơn trước khi lưu`
- [OrderService.java:433-444](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L433) · khối · `Quy tắc phí vận chuyển`

**Frontend: giao diện**

- [purchaseRules.ts:10-13](frontend/src/lib/purchaseRules.ts#L10) · khối · `Phí vận chuyển 30.000đ, miễn phí cho tiền hàng từ 1.000.000đ (khớp OrderService)`
- [purchaseRules.ts:29-32](frontend/src/lib/purchaseRules.ts#L29) · khối · `Đơn dưới 1.000.000đ phải trả phí vận chuyển`
- [CheckoutPage.tsx:513-522](frontend/src/pages/checkout/CheckoutPage.tsx#L513) · khối JSX · `Gợi ý mua thêm để được miễn phí vận chuyển`
- [CheckoutPage.tsx:34](frontend/src/pages/checkout/CheckoutPage.tsx#L34) · một dòng · `import { FREE_SHIPPING_FROM } from '@/lib/purchaseRules';`
- [OrderDetailPage.tsx:126-132](frontend/src/pages/orders/OrderDetailPage.tsx#L126) · khối · `DB không lưu riêng phí vận chuyển nên tính lại theo quy tắc từ tiền hàng`
- [OrderDetailPage.tsx:24](frontend/src/pages/orders/OrderDetailPage.tsx#L24) · một dòng · `import { shippingFeeFor } from '@/lib/purchaseRules';`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:864-866](frontend/src/mocks/db.ts#L864) · khối · `Cộng phí vận chuyển (tính theo tiền hàng, giống OrderService)`
- [db.ts:37](frontend/src/mocks/db.ts#L37) · một dòng · `import { shippingFeeFor } from '@/lib/purchaseRules';`

### TN-08 · Giới hạn số lượng mỗi sản phẩm

**Backend (Java)**

- [MessageKey.java:89](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L89) · một dòng · `ORDER_QUANTITY_LIMIT("Mỗi sản phẩm chỉ được mua tối đa 10 cá thể", "Each product is lim...`
- [CartService.java:28-30](backend/src/main/java/com/bionexus/backend/service/CartService.java#L28) · khối · `Số cá thể tối đa của một sản phẩm trong giỏ và trong một đơn (OrderService dùng chung)`
- [CartService.java:74-78](backend/src/main/java/com/bionexus/backend/service/CartService.java#L74) · khối · `Cộng dồn vào giỏ cũng không được vượt giới hạn mỗi sản phẩm`
- [CartService.java:98-102](backend/src/main/java/com/bionexus/backend/service/CartService.java#L98) · khối · `Sửa số lượng trong giỏ cũng không được vượt giới hạn mỗi sản phẩm`
- [OrderService.java:115-121](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L115) · khối · `Giới hạn số lượng mỗi sản phẩm trong một đơn (kiểm trước khi mở transaction)`

**Frontend: kiểu dữ liệu và hook gọi API**

- [messages.ts:92](frontend/src/lib/messages.ts#L92) · một dòng · `ORDER_QUANTITY_LIMIT: 'Mỗi sản phẩm chỉ được mua tối đa 10 cá thể',`
- [api.ts:98](frontend/src/types/api.ts#L98) · một dòng · `\| 'ORDER_QUANTITY_LIMIT'`

**Frontend: giao diện**

- [purchaseRules.ts:6-8](frontend/src/lib/purchaseRules.ts#L6) · khối · `Mỗi sản phẩm mua tối đa 10 cá thể (khớp CartService.MAX_QUANTITY_PER_PRODUCT)`
- [purchaseRules.ts:18-20](frontend/src/lib/purchaseRules.ts#L18) · khối · `Còn nhiều trong kho cũng chỉ cho chọn tối đa 10`
- [ProductDetailPage.tsx:426-430](frontend/src/pages/products/ProductDetailPage.tsx#L426) · khối JSX · `Cho người mua biết giới hạn mỗi sản phẩm`
- [ProductDetailPage.tsx:11](frontend/src/pages/products/ProductDetailPage.tsx#L11) · một dòng · `import { MAX_QUANTITY_PER_PRODUCT } from '@/lib/purchaseRules';`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:498-505](frontend/src/mocks/db.ts#L498) · khối · `Cộng dồn vào giỏ cũng không được vượt giới hạn mỗi sản phẩm`
- [db.ts:563-570](frontend/src/mocks/db.ts#L563) · khối · `Sửa số lượng trong giỏ cũng không được vượt giới hạn mỗi sản phẩm`
- [db.ts:768-775](frontend/src/mocks/db.ts#L768) · khối · `Mỗi sản phẩm tối đa 10 cá thể trong một đơn`
- [db.ts:36](frontend/src/mocks/db.ts#L36) · một dòng · `import { MAX_QUANTITY_PER_PRODUCT } from '@/lib/purchaseRules';`

### TN-09 · Tìm đơn hàng theo mã hoặc tên sản phẩm

**Frontend: giao diện**

- [OrdersPage.tsx:37-39](frontend/src/pages/orders/OrdersPage.tsx#L37) · khối · `Từ khóa tìm đơn`
- [OrdersPage.tsx:51-59](frontend/src/pages/orders/OrdersPage.tsx#L51) · khối · `Lọc thêm theo mã đơn hoặc tên sản phẩm (không phân biệt hoa thường và dấu)`
- [OrdersPage.tsx:82-96](frontend/src/pages/orders/OrdersPage.tsx#L82) · khối JSX · `Ô tìm đơn theo mã hoặc tên sản phẩm`
- [OrdersPage.tsx:14](frontend/src/pages/orders/OrdersPage.tsx#L14) · một dòng · `import { Search } from 'lucide-react';`
- [OrdersPage.tsx:15](frontend/src/pages/orders/OrdersPage.tsx#L15) · một dòng · `import { normalizeSearchString } from '@/components/navigation/QuickSearch';`

### TN-10 · Lưu phương thức thanh toán (COD / chuyển khoản)

**Backend (Java)**

- [OrdersDao.java:29-31](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L29) · khối · `Đọc cột paymentMethod (cần chạy migrations/003_add_payment.sql)`
- [OrdersDao.java:247-256](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L247) · khối · `Lưu phương thức thanh toán cho đơn vừa tạo (trong transaction đặt hàng)`
- [OrdersDao.java:5](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L5) · một dòng · `import com.bionexus.backend.enums.PaymentMethod;`
- [OrderDto.java:4](backend/src/main/java/com/bionexus/backend/dto/OrderDto.java#L4) · một dòng · `import com.bionexus.backend.enums.PaymentMethod;`
- [OrderDto.java:19](backend/src/main/java/com/bionexus/backend/dto/OrderDto.java#L19) · một dòng · `, PaymentMethod paymentMethod`
- [OrderDto.java:32](backend/src/main/java/com/bionexus/backend/dto/OrderDto.java#L32) · một dòng · `, order.getPaymentMethod()`
- [PlaceOrderRequest.java:11](backend/src/main/java/com/bionexus/backend/dto/PlaceOrderRequest.java#L11) · một dòng · `, String paymentMethod`
- [MessageKey.java:91](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L91) · một dòng · `PAYMENT_INVALID_METHOD("Phương thức thanh toán không hợp lệ", "Invalid payment method"),`
- [PaymentMethod.java:3-8](backend/src/main/java/com/bionexus/backend/enums/PaymentMethod.java#L3) · khối · `Phương thức thanh toán (cột Orders.paymentMethod, thêm bởi migrations/003_add_payment.sql)`
- [Orders.java:105-115](backend/src/main/java/com/bionexus/backend/model/Orders.java#L105) · khối · `Phương thức thanh toán của đơn`
- [Orders.java:4](backend/src/main/java/com/bionexus/backend/model/Orders.java#L4) · một dòng · `import com.bionexus.backend.enums.PaymentMethod;`
- [OrderService.java:133-142](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L133) · khối · `Đọc phương thức thanh toán: bỏ trống thì mặc định trả tiền khi nhận hàng (COD)`
- [OrderService.java:156-158](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L156) · khối · `Lưu phương thức thanh toán vào đơn vừa tạo, cùng transaction`
- [OrderService.java:30](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L30) · một dòng · `import com.bionexus.backend.enums.PaymentMethod;`

**Frontend: kiểu dữ liệu và hook gọi API**

- [messages.ts:95](frontend/src/lib/messages.ts#L95) · một dòng · `PAYMENT_INVALID_METHOD: 'Phương thức thanh toán không hợp lệ',`
- [api.ts:12](frontend/src/types/api.ts#L12) · một dòng · `export type PaymentMethod = 'COD' \| 'BANK_TRANSFER';`
- [api.ts:101](frontend/src/types/api.ts#L101) · một dòng · `\| 'PAYMENT_INVALID_METHOD'`
- [api.ts:261](frontend/src/types/api.ts#L261) · một dòng · `paymentMethod?: PaymentMethod;`
- [api.ts:368](frontend/src/types/api.ts#L368) · một dòng · `paymentMethod?: PaymentMethod;`

**Frontend: giao diện**

- [CheckoutPage.tsx:202-208](frontend/src/pages/checkout/CheckoutPage.tsx#L202) · khối · `Gửi kèm phương thức thanh toán người mua đã chọn ở bước 2`
- [OrderDetailPage.tsx:302-309](frontend/src/pages/orders/OrderDetailPage.tsx#L302) · khối JSX · `Phương thức thanh toán của đơn`
- [OrderDetailPage.tsx:337-348](frontend/src/pages/orders/OrderDetailPage.tsx#L337) · khối JSX · `Mã VietQR để chuyển khoản, nội dung là mã đơn (ẩn khi đã thanh toán hoặc đơn kết thúc)`
- [OrderDetailPage.tsx:25](frontend/src/pages/orders/OrderDetailPage.tsx#L25) · một dòng · `import { VietQRCard } from '@/components/domain/VietQRCard';`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [orders.ts:11](frontend/src/mocks/data/orders.ts#L11) · một dòng · `paymentMethod: 'COD',`
- [orders.ts:26](frontend/src/mocks/data/orders.ts#L26) · một dòng · `paymentMethod: 'COD',`
- [orders.ts:41](frontend/src/mocks/data/orders.ts#L41) · một dòng · `paymentMethod: 'COD',`
- [db.ts:690-698](frontend/src/mocks/db.ts#L690) · khối · `Phương thức thanh toán: bỏ trống thì mặc định COD`
- [db.ts:898-900](frontend/src/mocks/db.ts#L898) · khối · `Lưu phương thức thanh toán vào đơn`
- [types.ts:10](frontend/src/mocks/types.ts#L10) · một dòng · `import type { PaymentMethod } from '@/types/api';`
- [types.ts:108](frontend/src/mocks/types.ts#L108) · một dòng · `paymentMethod?: PaymentMethod;`

### TN-11 · Trạng thái thanh toán, quản trị xác nhận đã thu tiền

**Backend (Java)**

- [OrdersDao.java:32-34](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L32) · khối · `Đọc cột paymentStatus (cần chạy migrations/003_add_payment.sql)`
- [OrdersDao.java:258-295](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L258) · khối · `Danh sách đơn theo trạng thái thanh toán và xác nhận đã thu tiền`
- [OrdersDao.java:6](backend/src/main/java/com/bionexus/backend/dal/OrdersDao.java#L6) · một dòng · `import com.bionexus.backend.enums.PaymentStatus;`
- [OrderDto.java:5](backend/src/main/java/com/bionexus/backend/dto/OrderDto.java#L5) · một dòng · `import com.bionexus.backend.enums.PaymentStatus;`
- [OrderDto.java:20](backend/src/main/java/com/bionexus/backend/dto/OrderDto.java#L20) · một dòng · `, PaymentStatus paymentStatus`
- [OrderDto.java:33](backend/src/main/java/com/bionexus/backend/dto/OrderDto.java#L33) · một dòng · `, order.getPaymentStatus()`
- [MessageKey.java:92](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L92) · một dòng · `PAYMENT_CONFIRMED("Đã xác nhận thu tiền cho đơn hàng", "Payment confirmed"),`
- [MessageKey.java:93](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L93) · một dòng · `PAYMENT_CANNOT_CONFIRM("Đơn đã được thanh toán hoặc đã bị hủy", "Order is already paid ...`
- [PaymentStatus.java:3-8](backend/src/main/java/com/bionexus/backend/enums/PaymentStatus.java#L3) · khối · `Trạng thái thanh toán (cột Orders.paymentStatus, thêm bởi migrations/003_add_payment.sql)`
- [Orders.java:117-127](backend/src/main/java/com/bionexus/backend/model/Orders.java#L117) · khối · `Trạng thái thanh toán của đơn`
- [Orders.java:5](backend/src/main/java/com/bionexus/backend/model/Orders.java#L5) · một dòng · `import com.bionexus.backend.enums.PaymentStatus;`
- [OrderService.java:396-418](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L396) · khối · `Đối soát thanh toán cho quản trị viên`
- [OrderService.java:31](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L31) · một dòng · `import com.bionexus.backend.enums.PaymentStatus;`
- [AdminServlet.java:82-86](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L82) · khối · `GET /api/admin/payments?status=UNPAID: đơn theo trạng thái thanh toán`
- [AdminServlet.java:101-108](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L101) · khối · `PUT /api/admin/orders/{id}/payment: xác nhận đã thu tiền (không cần body)`
- [AdminServlet.java:12](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L12) · một dòng · `import com.bionexus.backend.enums.PaymentStatus;`
- [AdminServlet.java:13](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L13) · một dòng · `import com.bionexus.backend.service.OrderService;`
- [AdminServlet.java:33](backend/src/main/java/com/bionexus/backend/servlet/AdminServlet.java#L33) · một dòng · `private final OrderService paymentOrderService = new OrderService();`
- [ApiErrors.java:23](backend/src/main/java/com/bionexus/backend/util/ApiErrors.java#L23) · một dòng · `case PAYMENT_CANNOT_CONFIRM -> 409;`

**Frontend: kiểu dữ liệu và hook gọi API**

- [keys.ts:86](frontend/src/api/keys.ts#L86) · một dòng · `payments: (status?: string) => [...queryKeys.admin.all(), 'payments', status ?? 'ALL'] ...`
- [useAdminMutations.ts:117-132](frontend/src/api/mutations/useAdminMutations.ts#L117) · khối · `Quản trị viên xác nhận đã thu tiền (PUT api/admin/orders/{id}/payment)`
- [useAdminMutations.ts:14](frontend/src/api/mutations/useAdminMutations.ts#L14) · một dòng · `import type { OrderDto } from '@/types/api';`
- [useAdminQueries.ts:76-89](frontend/src/api/queries/useAdminQueries.ts#L76) · khối · `Đơn theo trạng thái thanh toán (GET api/admin/payments?status=)`
- [useAdminQueries.ts:8](frontend/src/api/queries/useAdminQueries.ts#L8) · một dòng · `import type { OrderDto, PaymentStatus } from '@/types/api';`
- [messages.ts:96](frontend/src/lib/messages.ts#L96) · một dòng · `PAYMENT_CONFIRMED: 'Đã xác nhận thu tiền cho đơn hàng',`
- [messages.ts:97](frontend/src/lib/messages.ts#L97) · một dòng · `PAYMENT_CANNOT_CONFIRM: 'Đơn đã được thanh toán hoặc đã bị hủy',`
- [api.ts:13](frontend/src/types/api.ts#L13) · một dòng · `export type PaymentStatus = 'UNPAID' \| 'PAID';`
- [api.ts:102](frontend/src/types/api.ts#L102) · một dòng · `\| 'PAYMENT_CONFIRMED'`
- [api.ts:103](frontend/src/types/api.ts#L103) · một dòng · `\| 'PAYMENT_CANNOT_CONFIRM'`
- [api.ts:262](frontend/src/types/api.ts#L262) · một dòng · `paymentStatus?: PaymentStatus;`

**Frontend: giao diện**

- [router.tsx:261-268](frontend/src/app/router.tsx#L261) · khối · `Trang đối soát thanh toán`
- [router.tsx:40](frontend/src/app/router.tsx#L40) · một dòng · `const AdminPaymentsPage = React.lazy(() => import('@/pages/admin/AdminPaymentsPage'));`
- [routes.ts:42](frontend/src/app/routes.ts#L42) · một dòng · `{ path: '/admin/payments', name: 'Đối soát thanh toán', title: 'Đối soát Thanh toán', l...`
- [AdminLayout.tsx:5](frontend/src/components/layout/AdminLayout.tsx#L5) · một dòng · `import { Wallet } from 'lucide-react';`
- [AdminLayout.tsx:27](frontend/src/components/layout/AdminLayout.tsx#L27) · một dòng · `{ label: 'Thanh toán', path: '/admin/payments', icon: Wallet, allowedRoles: ['SUPER_ADM...`
- [AdminPaymentsPage.tsx:4-147](frontend/src/pages/admin/AdminPaymentsPage.tsx#L4) · khối · `Trang quản trị "Đối soát thanh toán": xem đơn chưa/đã thu tiền và xác nhận đã thu`
- [OrderDetailPage.tsx:166-174](frontend/src/pages/orders/OrderDetailPage.tsx#L166) · khối JSX · `Trạng thái thanh toán của đơn`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [orders.ts:12](frontend/src/mocks/data/orders.ts#L12) · một dòng · `paymentStatus: 'UNPAID',`
- [orders.ts:27](frontend/src/mocks/data/orders.ts#L27) · một dòng · `paymentStatus: 'PAID',`
- [orders.ts:42](frontend/src/mocks/data/orders.ts#L42) · một dòng · `paymentStatus: 'UNPAID',`
- [db.ts:901-903](frontend/src/mocks/db.ts#L901) · khối · `Đơn mới luôn chưa thanh toán`
- [db.ts:1118-1141](frontend/src/mocks/db.ts#L1118) · khối · `Đối soát thanh toán (giống OrderService.getOrdersByPaymentStatus và confirmPayment)`
- [db.ts:42](frontend/src/mocks/db.ts#L42) · một dòng · `import type { PaymentStatus } from '@/types/api';`
- [admin.ts:156-179](frontend/src/mocks/handlers/admin.ts#L156) · khối · `Đối soát thanh toán (MODERATOR / SUPER_ADMIN)`
- [admin.ts:7](frontend/src/mocks/handlers/admin.ts#L7) · một dòng · `import type { PaymentStatus } from '@/types/api';`
- [types.ts:11](frontend/src/mocks/types.ts#L11) · một dòng · `import type { PaymentStatus } from '@/types/api';`
- [types.ts:109](frontend/src/mocks/types.ts#L109) · một dòng · `paymentStatus?: PaymentStatus;`

### TN-12 · In hóa đơn

**Frontend: giao diện**

- [OrderDetailPage.tsx:191-195](frontend/src/pages/orders/OrderDetailPage.tsx#L191) · khối JSX · `Nút "In hóa đơn"`
- [OrderDetailPage.tsx:26](frontend/src/pages/orders/OrderDetailPage.tsx#L26) · một dòng · `import { PrintInvoiceButton } from './components/PrintInvoiceButton';`
- [PrintInvoiceButton.tsx:4-126](frontend/src/pages/orders/components/PrintInvoiceButton.tsx#L4) · khối · `Nút "In hóa đơn": mở cửa sổ hóa đơn nền trắng rồi gọi lệnh in của trình duyệt`

### TN-13 · Chọn món trong giỏ để đặt hàng

**Backend (Java)**

- [CartItemsDao.java:153-161](backend/src/main/java/com/bionexus/backend/dal/CartItemsDao.java#L153) · khối · `Xóa một món bằng Connection của transaction đặt hàng (đặt một phần giỏ)`
- [PlaceOrderRequest.java:12](backend/src/main/java/com/bionexus/backend/dto/PlaceOrderRequest.java#L12) · một dòng · `, List<Integer> cartProductIds`
- [OrderService.java:91-111](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L91) · khối · `Chỉ đặt các món được chọn trong giỏ (cartProductIds), món còn lại giữ trong giỏ`
- [OrderService.java:159-165](backend/src/main/java/com/bionexus/backend/service/OrderService.java#L159) · khối · `Xóa khỏi giỏ đúng các món vừa đặt, cùng transaction với đơn`

**Frontend: kiểu dữ liệu và hook gọi API**

- [api.ts:369](frontend/src/types/api.ts#L369) · một dòng · `cartProductIds?: number[];`

**Frontend: giao diện**

- [CartPage.tsx:57-59](frontend/src/pages/cart/CartPage.tsx#L57) · khối · `Các món người mua bỏ chọn (mặc định chọn hết, món mới thêm cũng được chọn sẵn)`
- [CartPage.tsx:104-106](frontend/src/pages/cart/CartPage.tsx#L104) · khối · `Chỉ đặt các món còn bán và đang được chọn`
- [CartPage.tsx:122-148](frontend/src/pages/cart/CartPage.tsx#L122) · khối · `Chọn / bỏ chọn từng món và cả giỏ; chỉ gửi sang trang thanh toán các món đã chọn`
- [CartPage.tsx:272-287](frontend/src/pages/cart/CartPage.tsx#L272) · khối JSX · `Ô chọn tất cả`
- [CartPage.tsx:311-322](frontend/src/pages/cart/CartPage.tsx#L311) · khối JSX · `Ô chọn món để đặt hàng (món ngừng bán không chọn được)`
- [CheckoutPage.tsx:121-129](frontend/src/pages/checkout/CheckoutPage.tsx#L121) · khối · `Đọc ?chon=1,2,3 do trang giỏ hàng gửi sang`
- [CheckoutPage.tsx:197-201](frontend/src/pages/checkout/CheckoutPage.tsx#L197) · khối · `Chỉ đặt các món đã chọn trong giỏ; backend chỉ xóa các món này khỏi giỏ`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:723-743](frontend/src/mocks/db.ts#L723) · khối · `Chỉ đặt các món được chọn trong giỏ, món còn lại giữ trong giỏ`
- [db.ts:878-882](frontend/src/mocks/db.ts#L878) · khối · `Đặt một phần giỏ: trả lại các món chưa chọn vào giỏ`

### TN-14 · Xóa nhanh các món ngừng bán khỏi giỏ

**Backend (Java)**

- [MessageKey.java:104](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L104) · một dòng · `CART_UNAVAILABLE_REMOVED("Đã xóa các món ngừng bán khỏi giỏ hàng", "Unavailable items r...`
- [CartService.java:127-144](backend/src/main/java/com/bionexus/backend/service/CartService.java#L127) · khối · `Xóa mọi món không còn mua được (ngừng bán, hết hàng, sản phẩm đã bị xóa)`
- [CartServlet.java:108-114](backend/src/main/java/com/bionexus/backend/servlet/CartServlet.java#L108) · khối · `DELETE /api/cart/unavailable: xóa các món ngừng bán hoặc hết hàng`

**Frontend: kiểu dữ liệu và hook gọi API**

- [useCartMutations.ts:144-162](frontend/src/api/mutations/useCartMutations.ts#L144) · khối · `Xóa nhanh mọi món ngừng bán hoặc hết hàng khỏi giỏ (DELETE api/cart/unavailable)`
- [messages.ts:113](frontend/src/lib/messages.ts#L113) · một dòng · `CART_UNAVAILABLE_REMOVED: 'Đã xóa các món ngừng bán khỏi giỏ hàng',`
- [api.ts:112](frontend/src/types/api.ts#L112) · một dòng · `\| 'CART_UNAVAILABLE_REMOVED'`

**Frontend: giao diện**

- [CartPage.tsx:60-62](frontend/src/pages/cart/CartPage.tsx#L60) · khối · ``
- [CartPage.tsx:150-156](frontend/src/pages/cart/CartPage.tsx#L150) · khối · `Xóa nhanh mọi món ngừng bán hoặc hết hàng`
- [CartPage.tsx:458-473](frontend/src/pages/cart/CartPage.tsx#L458) · khối JSX · `Nút xóa nhanh các món ngừng bán`
- [CartPage.tsx:12](frontend/src/pages/cart/CartPage.tsx#L12) · một dòng · `import { useRemoveUnavailableItems } from '@/api/mutations/useCartMutations';`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:619-632](frontend/src/mocks/db.ts#L619) · khối · `Xóa nhanh các món ngừng bán hoặc hết hàng khỏi giỏ`
- [cart.ts:100-108](frontend/src/mocks/handlers/cart.ts#L100) · khối · `Xóa nhanh các món ngừng bán (DELETE api/cart/unavailable)`

### TN-15 · Danh sách yêu thích (lưu để mua sau)

**Backend (Java)**

- [WishlistDao.java:3-58](backend/src/main/java/com/bionexus/backend/dal/WishlistDao.java#L3) · khối · `Truy vấn bảng Wishlists (cần chạy migrations/004_add_wishlist.sql)`
- [MessageKey.java:105](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L105) · một dòng · `WISHLIST_ADDED("Đã lưu vào danh sách yêu thích", "Saved to wishlist"),`
- [MessageKey.java:106](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L106) · một dòng · `WISHLIST_REMOVED("Đã bỏ khỏi danh sách yêu thích", "Removed from wishlist"),`
- [JwtAuthFilter.java:26](backend/src/main/java/com/bionexus/backend/filter/JwtAuthFilter.java#L26) · một dòng · `, "/api/wishlist/*"`
- [WishlistService.java:3-51](backend/src/main/java/com/bionexus/backend/service/WishlistService.java#L3) · khối · `Nghiệp vụ danh sách yêu thích`
- [WishlistServlet.java:3-79](backend/src/main/java/com/bionexus/backend/servlet/WishlistServlet.java#L3) · khối · `API danh sách yêu thích: GET /api/wishlist, POST và DELETE /api/wishlist/{productId}`

**Frontend: kiểu dữ liệu và hook gọi API**

- [keys.ts:56-60](frontend/src/api/keys.ts#L56) · khối · `Danh sách yêu thích`
- [useWishlistMutations.ts:4-37](frontend/src/api/mutations/useWishlistMutations.ts#L4) · khối · `Lưu và bỏ lưu sản phẩm yêu thích (POST / DELETE api/wishlist/{productId})`
- [useWishlistQueries.ts:4-26](frontend/src/api/queries/useWishlistQueries.ts#L4) · khối · `Đọc danh sách yêu thích (GET api/wishlist)`
- [messages.ts:114](frontend/src/lib/messages.ts#L114) · một dòng · `WISHLIST_ADDED: 'Đã lưu vào danh sách yêu thích',`
- [messages.ts:115](frontend/src/lib/messages.ts#L115) · một dòng · `WISHLIST_REMOVED: 'Đã bỏ khỏi danh sách yêu thích',`
- [api.ts:113](frontend/src/types/api.ts#L113) · một dòng · `\| 'WISHLIST_ADDED'`
- [api.ts:114](frontend/src/types/api.ts#L114) · một dòng · `\| 'WISHLIST_REMOVED'`

**Frontend: giao diện**

- [router.tsx:187-194](frontend/src/app/router.tsx#L187) · khối · `Trang danh sách yêu thích`
- [router.tsx:29](frontend/src/app/router.tsx#L29) · một dòng · `const WishlistPage = React.lazy(() => import('@/pages/wishlist/WishlistPage'));`
- [routes.ts:34](frontend/src/app/routes.ts#L34) · một dòng · `{ path: '/wishlist', name: 'Yêu thích', title: 'Danh sách Yêu thích', layout: 'account'...`
- [AccountLayout.tsx:4](frontend/src/components/layout/AccountLayout.tsx#L4) · một dòng · `import { Heart } from 'lucide-react';`
- [AccountLayout.tsx:31](frontend/src/components/layout/AccountLayout.tsx#L31) · một dòng · `{ label: 'Yêu thích', path: '/wishlist', icon: Heart },`
- [CartPage.tsx:63-65](frontend/src/pages/cart/CartPage.tsx#L63) · khối · ``
- [CartPage.tsx:158-168](frontend/src/pages/cart/CartPage.tsx#L158) · khối · `Lưu để mua sau: thêm vào danh sách yêu thích rồi bỏ khỏi giỏ`
- [CartPage.tsx:393-406](frontend/src/pages/cart/CartPage.tsx#L393) · khối JSX · `Chuyển món sang danh sách yêu thích`
- [CartPage.tsx:13](frontend/src/pages/cart/CartPage.tsx#L13) · một dòng · `import { useAddToWishlist } from '@/api/mutations/useWishlistMutations';`
- [CartPage.tsx:14](frontend/src/pages/cart/CartPage.tsx#L14) · một dòng · `import { Heart } from 'lucide-react';`
- [ProductDetailPage.tsx:455-461](frontend/src/pages/products/ProductDetailPage.tsx#L455) · khối JSX · `Nút lưu để mua sau (lưu được cả khi đang hết hàng)`
- [ProductDetailPage.tsx:12](frontend/src/pages/products/ProductDetailPage.tsx#L12) · một dòng · `import { WishlistButton } from './components/WishlistButton';`
- [WishlistButton.tsx:4-64](frontend/src/pages/products/components/WishlistButton.tsx#L4) · khối · `Nút "Lưu để mua sau" trên trang chi tiết sản phẩm`
- [WishlistPage.tsx:4-126](frontend/src/pages/wishlist/WishlistPage.tsx#L4) · khối · `Trang "Danh sách yêu thích": xem lại các cá thể đã lưu, thêm vào giỏ hoặc bỏ lưu`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:634-673](frontend/src/mocks/db.ts#L634) · khối · `Danh sách yêu thích (mới lưu nhất lên đầu, giống WishlistDao)`
- [cart.ts:110-141](frontend/src/mocks/handlers/cart.ts#L110) · khối · `Danh sách yêu thích (GET api/wishlist, POST và DELETE api/wishlist/:productId)`
- [types.ts:139](frontend/src/mocks/types.ts#L139) · một dòng · `wishlists?: Record<number, number[]>;`

### TN-16 · Đánh giá sản phẩm sau khi mua

**Backend (Java)**

- [ReviewDao.java:3-110](backend/src/main/java/com/bionexus/backend/dal/ReviewDao.java#L3) · khối · `Truy vấn bảng Reviews (cần chạy migrations/005_add_reviews.sql)`
- [CreateReviewRequest.java:3-7](backend/src/main/java/com/bionexus/backend/dto/CreateReviewRequest.java#L3) · khối · `Body của POST /api/reviews`
- [ReviewDto.java:3-15](backend/src/main/java/com/bionexus/backend/dto/ReviewDto.java#L3) · khối · `Một đánh giá sản phẩm (khớp kiểu ReviewDto ở frontend)`
- [MessageKey.java:107](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L107) · một dòng · `REVIEW_CREATED("Cảm ơn bạn đã đánh giá sản phẩm", "Review submitted"),`
- [MessageKey.java:108](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L108) · một dòng · `REVIEW_INVALID_RATING("Số sao đánh giá phải từ 1 đến 5", "Rating must be between 1 and ...`
- [MessageKey.java:109](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L109) · một dòng · `REVIEW_INVALID_COMMENT("Vui lòng nhập nhận xét, tối đa 1000 ký tự", "Comment is require...`
- [MessageKey.java:110](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L110) · một dòng · `REVIEW_NOT_PURCHASED("Bạn chỉ đánh giá được sản phẩm đã mua và đã nhận hàng", "Only buy...`
- [MessageKey.java:111](backend/src/main/java/com/bionexus/backend/enums/MessageKey.java#L111) · một dòng · `REVIEW_ALREADY_EXISTS("Bạn đã đánh giá sản phẩm này rồi", "You have already reviewed th...`
- [JwtAuthFilter.java:27](backend/src/main/java/com/bionexus/backend/filter/JwtAuthFilter.java#L27) · một dòng · `, "/api/reviews/*"`
- [ReviewService.java:3-56](backend/src/main/java/com/bionexus/backend/service/ReviewService.java#L3) · khối · `Nghiệp vụ đánh giá sản phẩm: chỉ người đã mua và đã nhận hàng mới được đánh giá`
- [ProductsServlet.java:43-49](backend/src/main/java/com/bionexus/backend/servlet/ProductsServlet.java#L43) · khối · `GET /api/products/{id}/reviews: đánh giá của sản phẩm, ai cũng xem được`
- [ProductsServlet.java:6](backend/src/main/java/com/bionexus/backend/servlet/ProductsServlet.java#L6) · một dòng · `import com.bionexus.backend.service.ReviewService;`
- [ProductsServlet.java:21](backend/src/main/java/com/bionexus/backend/servlet/ProductsServlet.java#L21) · một dòng · `private final ReviewService reviewService = new ReviewService();`
- [ReviewServlet.java:3-42](backend/src/main/java/com/bionexus/backend/servlet/ReviewServlet.java#L3) · khối · `API gửi đánh giá: POST /api/reviews (xem đánh giá nằm ở ProductsServlet)`
- [ApiErrors.java:24](backend/src/main/java/com/bionexus/backend/util/ApiErrors.java#L24) · một dòng · `case REVIEW_NOT_PURCHASED -> 403;`
- [ApiErrors.java:25](backend/src/main/java/com/bionexus/backend/util/ApiErrors.java#L25) · một dòng · `case REVIEW_ALREADY_EXISTS -> 409;`

**Frontend: kiểu dữ liệu và hook gọi API**

- [useReviewMutations.ts:4-26](frontend/src/api/mutations/useReviewMutations.ts#L4) · khối · `Gửi đánh giá sản phẩm (POST api/reviews); xem đánh giá dùng useProductReviews có sẵn`
- [messages.ts:108](frontend/src/lib/messages.ts#L108) · một dòng · `REVIEW_CREATED: 'Cảm ơn bạn đã đánh giá sản phẩm',`
- [messages.ts:109](frontend/src/lib/messages.ts#L109) · một dòng · `REVIEW_INVALID_RATING: 'Số sao đánh giá phải từ 1 đến 5',`
- [messages.ts:110](frontend/src/lib/messages.ts#L110) · một dòng · `REVIEW_INVALID_COMMENT: 'Vui lòng nhập nhận xét, tối đa 1000 ký tự',`
- [messages.ts:111](frontend/src/lib/messages.ts#L111) · một dòng · `REVIEW_NOT_PURCHASED: 'Bạn chỉ đánh giá được sản phẩm đã mua và đã nhận hàng',`
- [messages.ts:112](frontend/src/lib/messages.ts#L112) · một dòng · `REVIEW_ALREADY_EXISTS: 'Bạn đã đánh giá sản phẩm này rồi',`
- [api.ts:115](frontend/src/types/api.ts#L115) · một dòng · `\| 'REVIEW_CREATED'`
- [api.ts:116](frontend/src/types/api.ts#L116) · một dòng · `\| 'REVIEW_INVALID_RATING'`
- [api.ts:117](frontend/src/types/api.ts#L117) · một dòng · `\| 'REVIEW_INVALID_COMMENT'`
- [api.ts:118](frontend/src/types/api.ts#L118) · một dòng · `\| 'REVIEW_NOT_PURCHASED'`
- [api.ts:119](frontend/src/types/api.ts#L119) · một dòng · `\| 'REVIEW_ALREADY_EXISTS'`

**Frontend: giao diện**

- [ProductDetailPage.tsx:558-562](frontend/src/pages/products/ProductDetailPage.tsx#L558) · khối JSX · `Đánh giá từ người mua`
- [ProductDetailPage.tsx:13](frontend/src/pages/products/ProductDetailPage.tsx#L13) · một dòng · `import { ProductReviews } from './components/ProductReviews';`
- [ProductReviews.tsx:4-170](frontend/src/pages/products/components/ProductReviews.tsx#L4) · khối · `Khối "Đánh giá từ người mua" trên trang chi tiết sản phẩm`

**Frontend: mock MSW (chỉ dùng khi VITE_USE_MOCKS=true)**

- [db.ts:337-359](frontend/src/mocks/db.ts#L337) · khối · `Luật giống ReviewService.java: đúng dữ liệu, đã mua và đã nhận hàng, mỗi người một lần`
- [reviews.ts:50-60](frontend/src/mocks/handlers/reviews.ts#L50) · khối · `Đánh giá của một sản phẩm theo đường dẫn backend (GET api/products/:id/reviews), mới nh...`

### TN-17 · Giỏ hàng tạm cho khách chưa đăng nhập

**Frontend: kiểu dữ liệu và hook gọi API**

- [useCartMutations.ts:164-191](frontend/src/api/mutations/useCartMutations.ts#L164) · khối · `Gộp giỏ tạm của khách vào giỏ thật sau khi đăng nhập`

**Frontend: giao diện**

- [router.tsx:332-336](frontend/src/app/router.tsx#L332) · khối JSX · `Đăng nhập xong thì gộp giỏ tạm của khách vào giỏ thật`
- [router.tsx:7](frontend/src/app/router.tsx#L7) · một dòng · `import { GuestCartMerger } from '@/components/domain/GuestCartMerger';`
- [GuestCartMerger.tsx:4-43](frontend/src/components/domain/GuestCartMerger.tsx#L4) · khối · `Khi khách vừa đăng nhập: gộp giỏ tạm (localStorage) vào giỏ thật trên server`
- [guestCart.ts:4-65](frontend/src/lib/guestCart.ts#L4) · khối · `Giỏ hàng tạm của khách chưa đăng nhập, lưu ở localStorage của trình duyệt`
- [ProductDetailPage.tsx:142-151](frontend/src/pages/products/ProductDetailPage.tsx#L142) · khối · `Khách chưa đăng nhập: lưu vào giỏ tạm trên máy, đăng nhập xong tự gộp vào giỏ thật`
- [ProductDetailPage.tsx:14](frontend/src/pages/products/ProductDetailPage.tsx#L14) · một dòng · `import { addToGuestCart, countGuestCartItems } from '@/lib/guestCart';`

## 6. Đã kiểm tra những gì

Ngày 12/11/2026, trên máy Mac của dự án:

- **API thật**: backend chạy trên Tomcat 10.1 với một DB tạm (`zz_tn_test`, tạo từ `BioNexusDatabes.sql` + `seed_data.sql` + `003_add_payment.sql` + `004_add_wishlist.sql` + `005_add_reviews.sql`). **120/120** kiểm tra đạt: hủy và hoàn kho (kể cả `SOLD_OUT` mở bán lại), hủy lần hai, hủy đơn người khác, xác nhận nhận hàng, mã giảm giá (đúng số tiền, sai mã, chưa đủ mức tối thiểu thì rollback), phí vận chuyển, giới hạn 10 (mua ngay, thêm giỏ, cộng dồn, sửa giỏ), quản trị đổi trạng thái và phân quyền (BIOLOGIST và token USER bị 403), thống kê khớp với tổng các đơn, đơn của shop chỉ có món của shop, phương thức thanh toán, xác nhận thu tiền, đặt một phần giỏ (món chưa chọn ở lại giỏ), xóa món ngừng bán, danh sách yêu thích (lưu trùng, bỏ lưu, người khác không thấy, khách và quản trị bị chặn), đánh giá (khách xem được, chưa nhận hàng hoặc chưa mua bị chặn, sai số sao, nhận xét trống hoặc quá dài, đánh giá lần hai). **Không đụng tới `BioNexusDB` thật.**
- **Giao diện thật** (nối với backend trên): đặt hàng có mã giảm giá và phí ship, chi tiết đơn tách đúng phí ship và giảm giá, hủy đơn, trang quản lý đơn, thống kê, đơn của shop, giới hạn 10, tìm đơn, chọn chuyển khoản, đối soát thanh toán, nội dung hóa đơn in, chọn món trong giỏ rồi đặt, xóa món ngừng bán, lưu để mua sau từ giỏ và từ trang sản phẩm, trang yêu thích, xem và gửi đánh giá (cả trường hợp bị từ chối), khách thêm vào giỏ tạm rồi đăng nhập thấy giỏ được gộp. Chụp ở 1440×900 và 390×844.
- **Mock MSW**: kiểm bằng ba bài test tạm (đã xóa sau khi chạy) cho cùng các quy tắc.
- **Biên dịch**: tắt hết, bật hết, và bật **riêng từng mã** (19 trạng thái) đều qua `javac` và `tsc`, lint 0 cảnh báo. Bật rồi tắt trả code về y hệt, bật theo thứ tự nào cũng ra cùng một kết quả.
- `npm run check` ở trạng thái tắt: đạt (typecheck, lint, 268/268 test, build, kiểm preload và dung lượng bundle). `mvn test` của backend: đạt.

## 7. Hạn chế nên biết trước (nếu cô hỏi)

- **Phí vận chuyển và tiền giảm giá không có cột riêng** trong DB, chỉ cộng/trừ vào `totalAmount`. Trang chi tiết đơn và hóa đơn tính lại từ tiền hàng. Nếu một đơn dùng mã giảm giá được đặt lúc **chưa** bật TN-07, sau đó mới bật TN-07, thì trang chi tiết đơn đó sẽ tách số sai (tổng tiền vẫn đúng). Muốn chính xác tuyệt đối: thêm cột `shippingFee`, `discountAmount`, `couponCode` vào `Orders`.
- **Mã giảm giá cố định trong code** (`enums/Coupon.java`), chưa có hạn dùng và số lượt dùng.
- **VietQR chỉ là minh họa**: chưa nối cổng thanh toán thật (VNPay, MoMo cần tài khoản doanh nghiệp). Quản trị viên xác nhận thu tiền bằng tay (TN-11).
- **Hủy đơn đã thanh toán** (khi bật cả TN-01 và TN-11) chưa có bước hoàn tiền.
- **Giới hạn 10 (TN-08)**: giỏ đã có hơn 10 cá thể từ trước khi bật thì vẫn hiển thị, đến lúc đặt hàng mới bị chặn kèm thông báo.
- **Chọn món (TN-13)**: lựa chọn chỉ nhớ trong lúc đang ở trang giỏ, rời trang rồi quay lại thì mặc định chọn hết.
- **Yêu thích (TN-15)**: chưa có thông báo khi sản phẩm có hàng trở lại.
- **Giỏ tạm (TN-17)** chỉ nằm trên trình duyệt đó (đổi máy là mất). Khách chưa xem được trang giỏ trước khi đăng nhập: bấm vào giỏ sẽ được mời đăng nhập, đăng nhập xong mới thấy các món đã gộp.
- **Đánh giá (TN-16)**: chưa có sửa, xóa đánh giá và chưa đính kèm ảnh. Ở chế độ mock (MSW) có sẵn vài đánh giá mẫu; DB thật bắt đầu không có đánh giá nào.
- File `AGENTS.md` ghi agent chỉ sửa `frontend/`. Lần này bạn yêu cầu làm đủ chức năng nên có thêm code trong `backend/` và ba file trong `database/migrations/` (003, 004, 005). Code đều đang **comment**, không đổi cách backend chạy; các file SQL chỉ chạy khi bạn tự chạy.

## 8. Gợi ý commit (chưa commit gì)

Chỉ add đúng các file của phần làm thêm (các thay đổi khác đang có trong máy bạn không nằm trong lệnh này):

```bash
git add CHUC-NANG-MUA-HANG-THEM.md tools/ database/migrations/003_add_payment.sql database/migrations/004_add_wishlist.sql database/migrations/005_add_reviews.sql backend/src frontend/src/lib/purchaseRules.ts frontend/src/api frontend/src/types/api.ts frontend/src/lib/messages.ts frontend/src/mocks frontend/src/app frontend/src/components/layout/AdminLayout.tsx frontend/src/components/layout/AccountLayout.tsx frontend/src/components/domain/GuestCartMerger.tsx frontend/src/lib/guestCart.ts frontend/src/pages/admin frontend/src/pages/cart frontend/src/pages/checkout frontend/src/pages/orders frontend/src/pages/products frontend/src/pages/seller frontend/src/pages/wishlist
```

```bash
git commit -m "feat: chuẩn bị sẵn 18 chức năng mua hàng, thanh toán và giỏ hàng (đang comment, xem CHUC-NANG-MUA-HANG-THEM.md)"
```
