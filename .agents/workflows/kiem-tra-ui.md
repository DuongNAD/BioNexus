---
description: Kiểm tra giao diện BioNexus. Chạy cổng chất lượng, chụp mọi route ở 2 kích thước, soát console, FPS, tương phản và báo cáo.
---

# /kiem-tra-ui

Dùng sau mỗi nhiệm vụ giao diện, hoặc khi chủ dự án gõ `/kiem-tra-ui`. Có thể kèm tên route để chỉ kiểm vài trang, ví dụ `/kiem-tra-ui /species/:id /cart`.

1. Trong `frontend/`, chạy `npm run check`. Lỗi typecheck, lint, test hay build thì sửa trước rồi mới đi tiếp.
2. Chạy `npm run dev` (MSW bật, `VITE_USE_MOCKS=true`).
3. Chạy `npm run shots`. Script Playwright sẽ chụp mọi route trong `src/app/routes.ts` ở 1440×900 và 390×844, với 2 tài khoản `levanc` và `moderator1`, lưu vào `frontend/.shots/<ngày>/`. Script chưa có thì tự chụp bằng browser agent.
4. Với từng ảnh chụp, soát theo danh sách sau và ghi lỗi tìm được:
   - Bố cục đúng tài liệu `docs/frontend/03-so-do-trang.md`. Không tràn ngang, chữ không đè nhau, không bị header che.
   - Ảnh thật đã hiện, không có ô trống hay ảnh vỡ. Có chú thích nguồn ảnh ở nơi tài liệu 06 yêu cầu.
   - Chữ tiếng Việt đủ dấu, không còn câu tiếng Anh sót lại hay lorem ipsum.
   - Tương phản chữ đạt AA (dùng màu chữ đúng token, không tự hạ độ mờ).
   - Có đủ 4 trạng thái: đang tải, rỗng, lỗi, có dữ liệu. Thử bằng DevPanel: bật độ trễ, giả lỗi 500, giỏ rỗng.
5. Mở DevTools:
   - Console không có error hay warning của React.
   - Trang 3D đạt ít nhất 55 FPS trên Apple Silicon (đo bằng `stats-gl` hoặc `PerformanceMonitor` trong DevPanel).
   - Network: three.js không được tải ở các trang không cần 3D.
6. Bật `prefers-reduced-motion: reduce` (DevTools › Rendering). Các cảnh 3D phải chuyển sang ảnh tĩnh và nội dung vẫn đọc được đủ.
7. Dùng phím Tab đi hết trang chủ, trang sản phẩm và giỏ hàng. Focus luôn nhìn thấy, không bị kẹt, thao tác được hết.
8. Báo cáo bằng walkthrough gồm: bảng route × kết quả, ảnh chụp các lỗi, việc đã sửa ngay, việc còn tồn đọng. Không commit.
