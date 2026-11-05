# BioNexus

Bách khoa sinh học (cây phân loại 6 cấp, loài, mức bảo tồn IUCN) kèm sàn sinh vật cảnh có kiểm duyệt. Đồ án Aptech 2026.

- **Backend:** Java 17, Maven, Servlet + Filter, JDBC thuần (SQL Server), Gson, BCrypt, JWT. Chạy trên Tomcat 10.1.
- **Giao diện:** React + Vite (thư mục `frontend/`), được nhúng vào WAR khi đóng gói.

## Chạy trên máy mới (5 bước)

**1. Tạo database.** Cần SQL Server (cổng 1433). Chạy hai file theo đúng thứ tự, từ thư mục gốc repo:

```bash
sqlcmd -S localhost,1433 -U sa -P <mật khẩu> -C -b -f 65001 -i database/BioNexusDatabes.sql
sqlcmd -S localhost,1433 -U sa -P <mật khẩu> -C -b -f 65001 -i database/seed_data.sql
```

- Cờ `-f 65001` để đọc file UTF-8, thiếu cờ này chữ tiếng Việt bị hỏng.
- File thứ nhất **xóa và tạo lại** database `BioNexusDB`. Muốn đặt lại dữ liệu sau khi thử, chạy lại cả hai file.
- Sau khi nạp: 568 nút phân loại, 664 loài, 14 shop, 590 sản phẩm (485 đang bán), 16 user, 5 admin.

**2. Đặt biến môi trường cho Tomcat** (trong `bin/setenv.bat` hoặc `bin/setenv.sh`):

| Biến | Ý nghĩa | Mặc định khi không đặt (chỉ để dev) |
|---|---|---|
| `DB_URL` | chuỗi JDBC | `jdbc:sqlserver://localhost:1433;databaseName=BioNexusDB;encrypt=true;trustServerCertificate=true` |
| `DB_USERNAME` | tài khoản SQL Server | `sa` |
| `DB_PASSWORD` | mật khẩu SQL Server | có giá trị mặc định trong code, **hãy tự đặt** |
| `JWT_SECRET` | bí mật ký token, **từ 32 ký tự** | không đặt thì sinh khóa ngẫu nhiên, token mất hiệu lực khi restart |

Tên biến tài khoản là `DB_USERNAME` (không phải `DB_USER`).

**3. Build giao diện** (cần Node 22 trở lên):

```bash
cd frontend && npm install && npm run build
```

**4. Đóng gói WAR** (Java 17 trở lên):

```bash
cd backend && ./mvnw clean package
```

Kết quả: `backend/target/BioNexus.war`, đã gồm giao diện từ `frontend/dist`. Chưa build giao diện thì WAR vẫn tạo được nhưng chỉ có API.

**5. Triển khai.** Chép `BioNexus.war` vào `webapps/` của Tomcat 10.1, khởi động Tomcat, mở `http://localhost:8080/BioNexus/`.

## Tài khoản test (dữ liệu seed)

Mật khẩu user: `123456`. Mật khẩu admin: `admin123`.

| Tài khoản | Vai trò |
|---|---|
| `levanc` | user thường, không có shop, giỏ hàng có sẵn 2 món |
| `nguyenvana` | chủ shop đã duyệt (ACTIVE) |
| `tranthib` | shop chờ duyệt (PENDING), đăng sản phẩm bị từ chối |
| `vuthif` | user bị khóa (BANNED) |
| `moderator1` | admin kiểm duyệt: duyệt shop và sản phẩm |
| `biologist1` | admin sinh học: không duyệt được shop và sản phẩm |
| `superadmin` | admin cao nhất |

## Gọi thử API

Mở `docs/requests.http` trong IntelliJ, đổi `@base` theo địa chỉ Tomcat, rồi bấm chạy từng request. Hợp đồng đầy đủ của API: `docs/frontend/04-hop-dong-api-va-mock.md`.

## Khi đang code

- Backend: chạy cấu hình Tomcat trong IntelliJ, cổng 8081, ô **Application context** (tab Deployment) đặt là `/` để proxy của Vite chạy đúng.
- Giao diện: `cd frontend && npm run dev` (Vite cổng 5173), proxy `/api` sang Tomcat theo `vite.config`.

## Chạy test

```bash
cd backend && ./mvnw test
```

Có test cho JWT (token hợp lệ, hết hạn, sai chữ ký, sửa payload).

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân hay gặp |
|---|---|
| 404 | Sai context path (tên file WAR hoặc context của IntelliJ), hoặc chưa deploy xong; xem `logs/catalina.out` |
| 500 và `Login failed for user` | Sai `DB_USERNAME` hoặc `DB_PASSWORD` |
| Chữ thành `?` hoặc `Ã¡` | Chạy file SQL thiếu cờ `-f 65001` |
| Token mất hiệu lực sau khi restart | Chưa đặt `JWT_SECRET` |
| Tomcat không lên | Cổng 8080 đang bị chương trình khác dùng |
