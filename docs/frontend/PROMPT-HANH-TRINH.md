# Prompt bổ sung: sửa ảnh giả + Hành trình 9 loài

Dán **khối "Prompt chính"** vào một hội thoại mới của Antigravity:
- mở workspace ở thư mục gốc `BioNexus/`;
- bật chế độ Planning;
- cho phép trình duyệt vào `localhost` và `commons.wikimedia.org`, `upload.wikimedia.org`.

Chạy prompt này **sau khi phiên Antigravity hiện tại đã dừng**, để hai nhiệm vụ không cùng sửa `frontend/`. Prompt không giả định đang ở mốc nào: agent tự đọc `PROGRESS.md` và `git log`. Khi xong, agent làm tiếp mốc còn lại của [`PROMPT-DAI.md`](PROMPT-DAI.md), hoặc chạy lại cổng bàn giao nếu các mốc đã xong hết.

Vì sao có prompt này:
- Kiểm tra độc lập ngày 02/11/2026 cho thấy ảnh trong `frontend/public/photos/` là thẻ vẽ gradient (có ảnh còn lỗi dấu, kiểu "Trăn đấ t").
- Cả 45 link nguồn trong `frontend/src/content/photos.ts` đều trỏ tới file không tồn tại trên Wikimedia Commons, nhưng lại ghi tên các nhiếp ảnh gia có thật.
- Trong khi đó `PROGRESS.md` vẫn báo là "ảnh thật, credit đầy đủ".
- Chủ dự án đã duyệt thêm trang **Hành trình 9 loài** (mẫu S), kèm chuyến đi làm quen cho người mới đăng ký.

## Prompt chính

```text
VAI TRÒ
Bạn là trưởng nhóm frontend kiêm design director của BioNexus, tiếp tục dự án đang làm dở trong frontend/. Nhiệm vụ này có 3 phần, làm theo đúng thứ tự: A (sửa ảnh giả), B (trang Hành trình 9 loài), C (chuyến đi làm quen sau đăng ký). Xong cả 3 phần thì: nếu docs/frontend/PROMPT-DAI.md còn mốc chưa xong thì làm tiếp; nếu đã xong hết thì chạy lại cổng bàn giao (Prompt 16 trong PROMPTS.md) cho toàn site với bộ ảnh mới và cập nhật HANDOFF.md.

BỐI CẢNH (đọc kỹ)
- Đọc frontend/PROGRESS.md, frontend/HANDOFF.md và git log --oneline -15 để biết đã làm tới đâu. Code frontend hiện nằm trên nhánh docs/frontend-spec (commit gần đây có thể đã tới quản trị và bàn giao).
- Kiểm tra độc lập phát hiện: ảnh trong frontend/public/photos/ KHÔNG phải ảnh chụp mà là thẻ gradient vẽ tên loài; 45/45 sourceUrl trong src/content/photos.ts trỏ tới file không tồn tại trên Wikimedia Commons, lại gắn tên các nhiếp ảnh gia có thật. Đây là vi phạm nặng luật cứng về ảnh trong AGENTS.md (ảnh thật, đúng loài, đúng giấy phép, ghi đúng nguồn). PROGRESS.md đang báo sai điều này.
- Từ nay: KHÔNG BAO GIỜ tạo ảnh giả, ảnh vẽ, ảnh AI hay credit bịa để thay ảnh thật. Nếu không tải được ảnh (không có mạng, bị chặn, hết quota) thì DỪNG và hỏi chủ dự án. Không báo "đã xong" cho việc chưa kiểm chứng được.

NGUỒN CHÂN LÝ (đọc hết trước khi code; mâu thuẫn thì ưu tiên theo thứ tự)
AGENTS.md → docs/frontend/07-hanh-trinh.md → 04-hop-dong-api-va-mock.md → 03-so-do-trang.md → 02-he-thong-thiet-ke.md → 06-anh-that.md → docs/frontend/reference/expedition-code.md (code prototype mẫu S đã duyệt) → docs/frontend/reference/screens/s-*.jpg và s-m*.jpg (ảnh chuẩn để so sánh) → docs/frontend/reference/trip-photos/credits.json (28 ảnh đã kiểm tra).

CÁCH LÀM VIỆC
1. Đọc hết nguồn chân lý, xem toàn bộ ảnh s-*.jpg, rồi viết artifact "Kế hoạch" (việc, file, rủi ro, cách đo). Làm luôn, không chờ duyệt.
2. Tự chủ: không hỏi những gì tài liệu đã trả lời; thiếu chi tiết thì chọn phương án đẹp và hợp lý nhất, ghi vào mục "Quyết định" của frontend/PROGRESS.md. Chỉ dừng hỏi khi cần quyền mạng/hệ thống, hoặc khi không lấy được ảnh thật.
3. Ranh giới: chỉ ghi file trong frontend/ (và docs/frontend/ khi thật sự khác kế hoạch, kèm ghi chú). Không sửa backend/, database/, docs/PLAN.md, .gitignore gốc. Chữ hiển thị tiếng Việt có dấu, không emoji.
4. Repo nằm trên ổ exFAT thì không chạy npm install trên ổ đó (AGENTS.md mục Môi trường). Nếu node_modules đang nằm trên ổ exFAT, ghi rõ vào báo cáo.
5. Commit: chủ dự án CHO PHÉP commit cục bộ trong nhiệm vụ này, chỉ trên nhánh feat/frontend-ui, chỉ các file trong frontend/ (và docs/frontend/ nếu bạn sửa). TUYỆT ĐỐI không push, không sửa lịch sử, không commit file ngoài phạm vi (ví dụ PROJECT.md, TEST_*.md ở gốc: để nguyên và liệt kê trong báo cáo).

BƯỚC 0 · LƯU MỐC HIỆN TẠI
- git status. Nếu chưa có nhánh feat/frontend-ui thì tạo từ HEAD hiện tại và chuyển sang đó; từ đây mọi commit của nhiệm vụ nằm trên feat/frontend-ui.
- Kiểm tra frontend/.gitignore loại node_modules, dist, .env*, .vite. Nếu frontend/ còn thay đổi chưa commit thì commit nguyên trạng: "chore(ui): lưu các mốc đã làm trước khi sửa ảnh".

PHẦN A · SỬA ẢNH (làm trước mọi việc khác)
A1. Xoá toàn bộ ảnh giả trong frontend/public/photos/ và mọi mục credit bịa trong src/content/photos.ts. Không giữ lại ảnh nào không có link Commons kiểm chứng được.
A2. Chép 28 ảnh trong docs/frontend/reference/trip-photos/ vào pipeline ảnh (sharp → AVIF + WebP 960/1600/1920). Dùng credits.json làm credit (tác giả, giấy phép, link gốc). Bảng ảnh theo loài ở 07-hanh-trinh.md mục 5 cho thấy loài nào dùng ảnh nào; dùng các ảnh này cho hồ sơ loài, thẻ loài, sản phẩm.
A3. Ảnh còn thiếu (thư viện 6–8 ảnh mỗi hồ sơ loài, ảnh sinh cảnh, ảnh màn đăng nhập) thì lấy thêm từ Wikimedia Commons qua API:
    - tìm bằng generator=search trong namespace File; lấy imageinfo + extmetadata (Artist, LicenseShortName);
    - chỉ nhận CC0, CC BY, CC BY-SA, phạm vi công cộng; ảnh ≥ 1600 px; đúng loài; không watermark;
    - đặt User-Agent có tên dự án; nghỉ khoảng 1 giây giữa các lần gọi; gặp HTTP 429 thì chờ theo Retry-After rồi thử lại;
    - tự mở xem từng ảnh trước khi dùng; ghi lý do chọn vào artifact "Bảng duyệt ảnh".
A4. Viết frontend/scripts/verify-photos.mjs: gom mọi sourceUrl trong src/content/, hỏi API Commons theo lô 50 tiêu đề, FAIL nếu có file không tồn tại ("missing") hoặc giấy phép ngoài danh sách cho phép; đồng thời FAIL nếu có file ảnh trong public/photos hoặc public/trip không ứng với mục credit nào. Thêm script "check:photos" (cần mạng, không gộp vào npm run check) và chạy nó; dán kết quả vào PROGRESS.md.
A5. Cập nhật /credits và PROGRESS.md: ghi rõ sự cố ảnh giả, cách đã sửa, kết quả check:photos. Bảng duyệt ảnh cập nhật lại toàn bộ.
Cổng phần A: check:photos xanh; npm run check xanh; /kiem-tra-ui cho trang chủ, /species, /species/:id ở 1440 và 390 (ảnh thật, đúng loài, không vỡ bố cục).
Commit: "fix(ui): thay ảnh giả bằng ảnh Wikimedia Commons đã kiểm chứng".

PHẦN B · TRANG HÀNH TRÌNH 9 LOÀI (/tham-hiem)
Làm đúng docs/frontend/07-hanh-trinh.md. Bám bố cục, nhịp, chữ và hiệu ứng của mẫu S (reference/expedition-code.md + screens/s-*.jpg); port sang TypeScript strict, dữ liệu qua hook src/api/ (tra loài theo scientificName, không hard-code id), route thật thay cho các link giữ chỗ.
Phải có đủ:
- 19 section theo bảng ở mục 1 của tài liệu 07, đúng thứ tự và đúng cách lộ loài của từng trạm (ống nhòm, lấy nét, độ cao + sương tan, hàm bẫy có nút chạm 2 lần, lặn xuống kênh, bẫy ảnh hồng ngoại → màu, đèn pin theo chuột, nắng gắt + hơi nóng, bưu thiếp lật 3D).
- Sổ tay thực địa, con dấu, thẻ "Trên BioNexus" (9 tính năng, link route thật), tiêu đề trạm có "bay từ … · N km" (tính vòng lớn).
- Bản đồ chấm d3-geo + land-110m (một path SVG), 3 cảnh bay có thẻ lên máy bay, bản đồ tổng quan và bản đồ kết.
- HUD (giờ địa phương thật, tọa độ chạy dần, khí hậu từ environmentSpecs), thanh chặng bên trái, viên hộ chiếu n/9 trên header.
- Hộ chiếu mở bìa ở đầu trang, hộ chiếu 2 trang đóng dấu lần lượt ở cuối, chứng nhận, dải sản phẩm APPROVED, ghi nguồn ảnh.
- Không three.js ở trang này (chunk riêng, lazy; check:preload xanh). Cuộn ghi biến CSS bằng requestAnimationFrame, không setState mỗi khung.
- Giảm chuyển động / mức static: phiên bản tĩnh như mục 6 tài liệu 07. Truy cập: alt, aria-hidden cho trang trí, aria-live khi đóng dấu, bàn phím.
- Unit test và e2e theo mục 7 tài liệu 07.
Cổng phần B:
- npm run check xanh; e2e xanh; console sạch.
- /kiem-tra-ui cho /tham-hiem ở 1440×900 và 390×844, cả chế độ khách và ?chao-mung=1; đặt ảnh của bạn cạnh s-*.jpg / s-m*.jpg tương ứng, sửa tới khi không kém mẫu, và nói rõ chỗ nào bạn làm đẹp hơn.
- Đo FPS (stats-gl hoặc đo khung hình khi cuộn đều) từng section, ghi bảng vào PROGRESS.md; mục tiêu ≥ 58 FPS trên Apple Silicon. Ghi kích thước chunk của trang.
- Chụp bản giảm chuyển động.
Commit: "feat(ui): trang Hành trình 9 loài".

PHẦN C · CHUYẾN ĐI LÀM QUEN SAU ĐĂNG KÝ
Làm đúng mục 4 tài liệu 07:
- Đăng ký thành công → #/tham-hiem?chao-mung=1 (đăng nhập thường thì không). Lời chào theo họ tên từ useMe; tên xuất hiện ở thẻ lên máy bay, bưu thiếp, hộ chiếu, chứng nhận.
- Nút bỏ qua ở đầu trang và trên header, luôn bấm được, về #/ và ghi skippedAt. Không modal, không chặn cuộn.
- usePassport lưu localStorage 'bionexus.passport.v1' theo username (khách dùng 'guest'), có try/catch.
- /account có thẻ "Hộ chiếu loài" (n/9, "Đi tiếp hành trình"); menu Khám phá có "Hành trình 9 loài"; trang chủ có khối mời trước khối kết; DevPanel có "Xem như người mới đăng ký".
- HANDOFF.md, mục "Đề xuất cho backend": GET/PUT api/me/passport (tùy chọn).
Cổng phần C: e2e "đăng ký → hành trình → bỏ qua" và "đóng dấu → tải lại vẫn còn" xanh; ảnh chụp luồng đăng ký ở 1440 và 390.
Commit: "feat(ui): chuyến đi làm quen cho người mới đăng ký".

TIÊU CHUẨN (tự chấm sau mỗi phần, thang 10, dưới 8 thì sửa tiếp)
- Ảnh: 100% ảnh thật, kiểm chứng được bằng check:photos; không một credit bịa.
- Trang Hành trình nhìn và cảm giác như mẫu S hoặc đẹp hơn; mượt khi cuộn; mobile 390 đẹp như desktop.
- Dữ liệu đúng hợp đồng; số liệu đều lấy từ dữ liệu hoặc tính được; không lỗi console.

BÁO CÁO CUỐI (artifact walkthrough)
1. Phần A: số ảnh đã xoá, số ảnh thật đang dùng, kết quả check:photos (dán nguyên văn), link Bảng duyệt ảnh.
2. Phần B: ảnh của bạn đặt cạnh ảnh mẫu S cho ít nhất 10 cảnh desktop và 4 cảnh mobile; bảng FPS từng section; kích thước chunk.
3. Phần C: ảnh chụp luồng đăng ký → hành trình → bỏ qua; kết quả e2e.
4. Quyết định đã tự đưa ra, chỗ khác tài liệu, việc tồn đọng.
5. Danh sách commit trên feat/frontend-ui; các file ngoài phạm vi bạn đã để nguyên.
Sau đó cập nhật frontend/PROGRESS.md và tiếp tục mốc kế tiếp theo docs/frontend/PROMPT-DAI.md.
```

## Prompt tiếp tục (khi phiên bị ngắt)

```text
Tiếp tục nhiệm vụ trong docs/frontend/PROMPT-HANH-TRINH.md (phần "Prompt chính").
1. Đọc frontend/PROGRESS.md và git log --oneline -10 trên nhánh feat/frontend-ui để biết đang ở phần nào (A, B hay C), việc gì xong, việc gì kẹt.
2. Đọc lại AGENTS.md và docs/frontend/07-hanh-trinh.md.
3. Có thay đổi chưa commit thì xem lại, chạy npm run check rồi quyết định giữ hay sửa.
4. Làm tiếp đúng việc chưa xong, giữ nguyên cổng kiểm tra, cách commit và cách báo cáo. Nhớ: không bao giờ tạo ảnh giả hay credit bịa; không tải được ảnh thật thì dừng và hỏi.
```
