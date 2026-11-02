# Tài liệu frontend BioNexus

Bộ tài liệu này để giao cho **Google Antigravity** (hoặc agent bất kỳ) dựng toàn bộ giao diện BioNexus, theo hướng **mẫu R** đã chốt: hạt sáng biến hình, Hành tinh BioNexus, chuỗi xoắn ảnh loài, cuộn kể chuyện, ảnh thật.

**Phạm vi giai đoạn này: chỉ giao diện.** Dữ liệu là dữ liệu giả, do MSW trả về đúng hình dạng API thật. Sau đó chủ dự án tự nối API thật (tắt MSW) và hoàn thiện. Agent cần để lại `frontend/HANDOFF.md` ghi rõ chỗ cần làm tiếp.

## Các file

| File | Nội dung | Ai đọc |
|---|---|---|
| [`../../AGENTS.md`](../../AGENTS.md) | Luật luôn bật cho agent: phạm vi, luật cứng, quy trình | Antigravity tự nạp |
| [`01-kien-truc.md`](01-kien-truc.md) | Stack và lý do chọn, cấu trúc thư mục, quy ước code, cổng chất lượng, ngân sách hiệu năng | Agent, người review |
| [`02-he-thong-thiet-ke.md`](02-he-thong-thiet-ke.md) | Token màu, chữ, khoảng cách, bo góc, hiệu ứng nổi, chuyển động, ảnh, icon, truy cập | Agent |
| [`03-so-do-trang.md`](03-so-do-trang.md) | 24 route: mục đích, bố cục từng khối, dữ liệu, trạng thái, hiệu ứng riêng, bản mobile | Agent |
| [`04-hop-dong-api-va-mock.md`](04-hop-dong-api-va-mock.md) | Kiểu TypeScript khớp DTO Java, danh sách endpoint, MSW, dữ liệu giả lấy từ `seed_data.sql`, ma trận tài khoản test | Agent, **chủ dự án lúc nối API** |
| [`05-3d-va-chuyen-dong.md`](05-3d-va-chuyen-dong.md) | Hạt biến hình (Q nâng cấp), Hành tinh BioNexus (ghép quả địa cầu bằng hạt và bằng nét vẽ), chuỗi xoắn, cuộn dính, mức chất lượng 3D | Agent |
| [`06-anh-that.md`](06-anh-that.md) | Lấy ảnh từ Wikimedia Commons, giấy phép, danh sách ảnh cần có, tối ưu ảnh, ghi nguồn | Agent |
| [`PROMPTS.md`](PROMPTS.md) | **17 prompt (00 → 16)** chạy lần lượt từ đầu đến cuối, kèm 4 prompt dùng lúc cần (sửa theo ảnh, review, gỡ lỗi, thêm tính năng) | **Chủ dự án** dán vào Antigravity |
| [`reference/prototype-code.md`](reference/prototype-code.md) | Code đã chạy ổn trong prototype: shader hạt, chuỗi xoắn, quả địa cầu, cuộn dính | Agent |
| [`reference/screens/`](reference/screens/) | 12 ảnh chụp mẫu R ở 1440×900, là chuẩn để so sánh khi tự kiểm tra | Agent |
| [`../../.agents/workflows/kiem-tra-ui.md`](../../.agents/workflows/kiem-tra-ui.md) | Workflow `/kiem-tra-ui`: chụp mọi route, soát lỗi, báo cáo | Antigravity |

## Cách dùng với Antigravity

1. **Chuẩn bị máy:** clone repo về ổ hệ thống (máy Mac là tốt nhất). Không chạy `npm install` trên ổ exFAT. Cài Node 22 LTS trở lên.
2. **Mở workspace** là thư mục gốc repo `BioNexus/` (để Antigravity nạp `AGENTS.md` và `.agents/`).
3. **Chạy lần lượt** các prompt trong [`PROMPTS.md`](PROMPTS.md), mỗi prompt một cuộc hội thoại mới. Đặt Antigravity ở chế độ lập kế hoạch trước (planning), đọc kế hoạch nó đề xuất rồi mới cho chạy.
4. **Sau mỗi prompt:**
   - Xem walkthrough và ảnh chụp.
   - Tự mở `npm run dev` xem bằng mắt.
   - Chỗ nào chưa ổn thì dùng "Prompt S1: sửa theo ảnh chụp" ở cuối file prompt.
   - Ổn thì tự commit. Agent không tự commit.
5. **Cuối cùng:** chạy Prompt 16 (đóng gói và bàn giao). Agent sẽ viết `frontend/HANDOFF.md` hướng dẫn tắt MSW, nối API thật và liệt kê các trường API cần chốt.

## Hướng thiết kế đã chốt

Chủ dự án đánh giá cao nhất 4 mẫu và muốn ghép chúng lại. Cả 4 đã có trong mẫu R:

- **L · Cuộn kể chuyện:** ảnh phóng to theo cuộn, các bước có khung minh hoạ dính bên phải.
- **K · Địa cầu:** quả địa cầu xoay về nơi bản địa của loài, kèm biểu đồ khoảng nhiệt độ.
- **P · Xoắn ADN 3D:** chuỗi xoắn ảnh loài, thẻ thông tin đổi theo loài đang ở phía trước.
- **Q · Hạt biến hình:** hạt sáng xếp thành thiên hà, hành tinh, ADN, lá, chữ.

Phần nâng cấp cho bản thật:

- **Hành tinh BioNexus:** ghép quả địa cầu bằng hạt (Q) với quả địa cầu bằng nét vẽ (K, kiểu cobe) thành một.
- **Dùng ảnh thật nhiều hơn** ở mọi trang.
- **Mở rộng phong cách ra tất cả các trang của web**, không chỉ trang chủ.

Ảnh chuẩn để so sánh nằm ở `reference/screens/r-*.jpg`.
