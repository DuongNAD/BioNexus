# BioNexus: luật cho agent

Bách khoa sinh học (cây phân loại 6 cấp → loài, mức bảo tồn IUCN) kèm sàn sinh vật cảnh có kiểm duyệt. Đồ án Aptech 2026: backend Java (Tomcat 10 + JDBC) do chủ dự án tự code. **Agent chỉ làm giao diện trong `frontend/`.**

## Phạm vi

- Chỉ tạo và sửa file trong `frontend/`. Khi được yêu cầu rõ thì được sửa thêm `docs/frontend/` và `.agents/`.
- **Không sửa** `backend/`, `database/`, `docs/PLAN.md`, `docs/ERD.md`. Thấy hợp đồng API cần đổi thì ghi vào `frontend/HANDOFF.md`, mục "Đề xuất cho backend". Không tự đổi.
- Giai đoạn hiện tại: **giao diện trước, nối API sau.** Mọi dữ liệu đi qua `src/api/`. Khi chạy dev, MSW (Mock Service Worker) trả dữ liệu giả **đúng hợp đồng** ở `docs/frontend/04-hop-dong-api-va-mock.md`. Sau này chủ dự án chỉ việc tắt MSW là chạy với backend thật.

## Tài liệu phải đọc (theo thứ tự, trước khi bắt tay vào việc)

1. `docs/frontend/README.md`: cách dùng bộ tài liệu
2. `docs/frontend/01-kien-truc.md`: stack, cấu trúc thư mục, quy ước, cổng chất lượng
3. `docs/frontend/02-he-thong-thiet-ke.md`: màu, chữ, khoảng cách, chuyển động, ảnh
4. `docs/frontend/03-so-do-trang.md`: từng trang (route, bố cục, trạng thái, hiệu ứng)
5. `docs/frontend/04-hop-dong-api-va-mock.md`: kiểu dữ liệu, endpoint, MSW, dữ liệu giả từ seed
6. `docs/frontend/05-3d-va-chuyen-dong.md`: hạt biến hình, Hành tinh BioNexus, chuỗi xoắn, cuộn dính
7. `docs/frontend/06-anh-that.md`: lấy ảnh thật, giấy phép, tối ưu ảnh
8. `docs/frontend/reference/`: code prototype đã duyệt và ảnh chụp mẫu R (hướng thiết kế đã chốt)

Tài liệu mâu thuẫn với nhau thì ưu tiên theo thứ tự: tài liệu 04 (hợp đồng API) > 03 > 02 > 05 > code mẫu.

## Luật cứng

- **Ngôn ngữ:** mọi chữ hiển thị là tiếng Việt có dấu đầy đủ. Tên biến, hàm, file bằng tiếng Anh. Comment ngắn, bằng tiếng Việt, chỉ giải thích "vì sao".
- **Stack đã chốt** (lý do ở tài liệu 01): Vite + React 19 + TypeScript strict, Tailwind v4, React Router (HashRouter), TanStack Query, MSW 2, react-hook-form + zod, Motion, Lenis, three.js qua React Three Fiber + drei + postprocessing, lucide-react, sonner. Muốn thêm thư viện thì nêu lý do trong kế hoạch trước.
- **Đường dẫn:** `base: './'`, `HashRouter`, gọi API bằng đường dẫn tương đối `api/...` (không có `/` đầu). Bản build sẽ được nhúng vào WAR với context `/BioNexus`.
- **Dữ liệu:** component không gọi `fetch` trực tiếp, chỉ dùng hook trong `src/api/`. Không hard-code id (id trong DB thật có thể khác): tra theo `scientificName` hoặc lấy từ dữ liệu. Không tự thêm trường ngoài hợp đồng; trường "đề xuất" phải để optional và giao diện vẫn chạy khi thiếu nó.
- **Ảnh:** dùng ảnh thật, có giấy phép tự do (CC0, CC BY, CC BY-SA, public domain) và ghi đủ tác giả, giấy phép, link gốc. **Cấm** ảnh AI cho loài hoặc sản phẩm, cấm hotlink, cấm ảnh có watermark.
- **Thiết kế:** bám hướng mẫu R (nền tối xanh ngọc, kính mờ, ảnh thật lớn, hạt sáng). Không emoji, không gradient lòe loẹt, không chữ xám mờ dưới mức tương phản AA.
- **3D:** three.js chỉ được tải ở route cần nó (lazy). Mỗi màn hình có tối đa một cảnh WebGL nặng đang chạy. Canvas ra khỏi màn hình thì gỡ (unmount) hoặc dừng vẽ. Bắt buộc có chế độ giảm chuyển động và ảnh tĩnh thay thế cho máy yếu.
- **Truy cập (a11y):** WCAG 2.2 AA, điều khiển được bằng bàn phím, focus nhìn thấy rõ, `alt` cho mọi ảnh. Canvas trang trí gắn `aria-hidden` và phải có chữ thay thế mang cùng thông tin.
- **Bảo mật:** không đưa mật khẩu hay token thật vào code. Tài khoản trong seed (`levanc` / `123456`...) là dữ liệu test, chỉ dùng trong mock.

## Quy trình mỗi nhiệm vụ

1. Đọc các tài liệu liên quan. Lập kế hoạch ngắn: file sẽ tạo hoặc sửa, rủi ro, cách kiểm tra.
2. Code theo từng bước nhỏ. Chạy `npm run check` (typecheck + lint + test + build) sau mỗi bước lớn.
3. Mở trình duyệt, chụp các route vừa làm ở **1440×900** và **390×844**. So với tài liệu 02 và 03 và với ảnh trong `docs/frontend/reference/screens/`. Xem console (không được có lỗi) và FPS ở trang 3D. Có thể chạy workflow `/kiem-tra-ui`.
4. Báo cáo bằng walkthrough: đã làm gì, ảnh chụp, điều gì chưa xong hoặc chưa kiểm được.
   - **Mặc định không tự `git commit`**, chỉ ghi lệnh commit gợi ý. Chỉ được commit cục bộ khi prompt của chủ dự án cho phép rõ ràng (ví dụ `docs/frontend/PROMPT-DAI.md`).
   - **Không bao giờ `git push`.**

## Môi trường

- Node 22 LTS trở lên. Chạy tốt nhất trên macOS (Apple Silicon).
- Repo nằm trên ổ exFAT (ổ D: trên Windows) thì **không chạy `npm install` ở đó**: exFAT không có symlink và cluster 512 KB làm `node_modules` phình rất lớn. Hãy clone repo sang ổ hệ thống hoặc sang máy Mac.
