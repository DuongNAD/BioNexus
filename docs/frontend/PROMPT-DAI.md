# Một prompt dài: dựng toàn bộ giao diện trong một nhiệm vụ

Dùng khi model đủ mạnh để tự chạy nhiều giờ (ví dụ Gemini 4 Argon trong Antigravity). Prompt này gộp 17 prompt của [`PROMPTS.md`](PROMPTS.md) thành **6 mốc**. Mỗi mốc có cổng kiểm tra riêng. Agent ghi tiến độ vào `frontend/PROGRESS.md` sau mỗi mốc, nên nếu phiên bị ngắt thì dán **prompt tiếp tục** ở cuối file này là nó làm tiếp đúng chỗ.

## Trước khi dán

1. **Chuẩn bị máy:** repo đã clone về máy Mac (không dùng ổ exFAT), Node 22 LTS trở lên. Workspace là thư mục gốc `BioNexus/`, đang ở nhánh có `docs/frontend/`.
2. **Cài đặt Antigravity** (tên mục có thể khác tuỳ phiên bản):
   - Chế độ **Planning**.
   - Lệnh terminal: tự chạy những lệnh an toàn (npm, npx, node, git status/diff/add/commit), **hỏi trước** với lệnh xoá file hoặc `git push`.
   - Trình duyệt được vào `localhost`, `commons.wikimedia.org` và `upload.wikimedia.org`.
3. **Không cần ngồi canh.** Agent chỉ dừng hỏi khi bị chặn thật sự. Bảng duyệt ảnh được làm sẵn để bạn xem lúc cuối, không bắt bạn duyệt giữa chừng.

## Prompt chính (dán nguyên khối)

```text
VAI TRÒ
Bạn là trưởng nhóm frontend kiêm design director và kỹ sư đồ hoạ 3D của một studio sản phẩm hàng đầu. Bạn nhận trọn gói dựng TOÀN BỘ giao diện web BioNexus (bách khoa phân loại sinh vật + sàn sinh vật cảnh có kiểm duyệt), từ thư mục frontend/ trống tới bản hoàn chỉnh, đạt chất lượng của một sản phẩm thật được đầu tư lớn.

MỤC TIÊU CUỐI
- Đủ 24 route trong docs/frontend/03-so-do-trang.md, chạy bằng dữ liệu giả MSW khớp 100% hợp đồng ở docs/frontend/04-hop-dong-api-va-mock.md, để chủ dự án sau này chỉ cần tắt MSW là nối được backend Java thật.
- Thẩm mỹ theo hướng mẫu R (docs/frontend/reference/screens/) nhưng ĐẸP HƠN: nhiều ảnh thật hơn, Hành tinh BioNexus (ghép địa cầu hạt và địa cầu nét vẽ), mọi trang cùng một ngôn ngữ thiết kế.
- Đạt mọi cổng chất lượng ở docs/frontend/01-kien-truc.md mục 1 và 6.

NGUỒN CHÂN LÝ (đọc hết trước khi code; mâu thuẫn thì ưu tiên theo thứ tự)
AGENTS.md → docs/frontend/04 → 03 → 02 → 05 → 01 → 06 → docs/frontend/PROMPTS.md (chi tiết từng phần việc) → docs/frontend/reference/prototype-code.md (thuật toán đã chạy) → docs/PLAN.md mục 4–6, database/seed_data.sql, backend/.../dto/ (CHỈ ĐỌC).

CÁCH LÀM VIỆC
1. Bước 0, lập kế hoạch tổng: đọc toàn bộ nguồn chân lý, xem 12 ảnh mẫu, rồi viết artifact "Kế hoạch tổng" (các mốc, rủi ro, cách đo). Tạo frontend/PROGRESS.md theo mẫu ở cuối prompt này. Sau đó làm luôn, không chờ duyệt.
2. Làm lần lượt 6 MỐC bên dưới. Mỗi mốc gồm các "Prompt NN" trong docs/frontend/PROMPTS.md: hãy làm ĐỦ mục LÀM và đạt ĐỦ mục XONG KHI của từng prompt đó, như thể chúng được giao riêng.
3. Hết mỗi mốc phải qua CỔNG MỐC:
   a. npm run check xanh (typecheck, lint, test, build); e2e liên quan xanh;
   b. chạy workflow /kiem-tra-ui cho các route của mốc (1440×900 và 390×844), tự xem từng ảnh, sửa hết lỗi bố cục, chữ, tương phản, trạng thái;
   c. trang 3D: đo FPS (stats-gl) và ghi số; kiểm tra chunk three không bị tải ở trang không cần;
   d. cập nhật frontend/PROGRESS.md (việc xong, số đo, quyết định, việc tồn đọng);
   e. commit cục bộ trên nhánh feat/frontend-ui (tạo nhánh này ở mốc 1), message dạng "feat(ui): mốc N - <tóm tắt>". Chủ dự án CHO PHÉP commit cục bộ trong nhiệm vụ này. TUYỆT ĐỐI không push, không đổi nhánh khác, không sửa lịch sử.
   Cổng chưa đạt thì sửa tới khi đạt. Một lỗi đã thử 3 cách vẫn kẹt (hoặc quá 45 phút) thì ghi vào mục "Kẹt" của PROGRESS.md kèm lỗi nguyên văn, chuyển sang việc khác không phụ thuộc, rồi quay lại cuối mốc.
4. Tự chủ: không hỏi những gì tài liệu đã trả lời. Thiếu chi tiết thì chọn phương án đẹp và hợp lý nhất, ghi vào mục "Quyết định" của PROGRESS.md. Chỉ dừng hỏi khi: cần quyền mạng hoặc hệ thống, hoặc tài liệu mâu thuẫn tới mức làm sai nghiệp vụ.
5. Ranh giới: chỉ ghi file trong frontend/ (và cập nhật docs/frontend/ khi thật sự khác kế hoạch, kèm ghi chú). Không sửa backend/, database/, docs/PLAN.md, .gitignore ở gốc repo. Chữ hiển thị tiếng Việt có dấu. Không có ảnh AI. Ảnh thật nào cũng phải đúng loài, có giấy phép, có ghi nguồn.

CÁC MỐC
Mốc 1 · Nền móng: PROMPTS 01 → 03 → 04 → 05
  Khởi tạo dự án; lớp dữ liệu src/api + MSW chép đúng seed và đúng luật nghiệp vụ (có test); hệ thống thiết kế và trang #/dev/ui; khung trang (Navbar, Footer, ⌘K, chuyển trang, layout, 403/404/lỗi). Trong lúc chưa có ảnh thật, dùng tạm 9 ảnh trong docs/ui-mockups/assets/ và đánh dấu TODO-PHOTO.
Mốc 2 · Ảnh thật: PROMPTS 02
  Lấy ảnh từ Wikimedia Commons, tự xem và chọn, tối ưu, sinh photos.generated.ts, trang /credits. KHÔNG dừng chờ duyệt: tạo artifact "Bảng duyệt ảnh" (ảnh nhỏ, tác giả, giấy phép, link gốc, lý do chọn) để chủ dự án xem lúc cuối, rồi thay hết TODO-PHOTO.
Mốc 3 · Các trang nghiệp vụ: PROMPTS 12 → 13 → 14 → 15 → 10 → 11
  Cửa hàng, chi tiết sản phẩm, giỏ, đặt hàng, đơn; đăng nhập, đăng ký, tài khoản, người bán; quản trị; cây phân loại, bách khoa loài, hồ sơ loài. Những chỗ cần 3D (địa cầu mini, chế độ chuỗi xoắn, chế độ bản đồ) thì đặt SceneShell + poster tạm, gắn cảnh thật ở mốc 4–5. Chạy đủ kịch bản demo PLAN mục 11.3 bằng e2e.
Mốc 4 · Engine 3D: PROMPTS 06 → 07
  QualityProvider, SceneShell, useSectionProgress, ParticleMorph (Q nâng cấp), BioEarth (ghép hạt + nét vẽ, marker, cung về shop), các trang #/dev/3d và #/dev/earth; gắn BioEarth mini vào hồ sơ loài và chế độ bản đồ ở bách khoa; footer chữ hạt; 404 chữ hạt.
Mốc 5 · Trang chủ: PROMPTS 08 → 09
  9 khối theo tài liệu 03 mục 2: hạt biến hình đáp xuống thành Hành tinh BioNexus trong một canvas, ZoomReveal, khí hậu, chuỗi xoắn ảnh thật, quy trình StickySteps, đang bán, cửa hàng uy tín, kết. Gắn HelixScene vào chế độ 3D của cây phân loại. Không bao giờ có 2 canvas nặng cùng chạy.
Mốc 6 · Hoàn thiện và bàn giao: PROMPTS 16
  Rà toàn site bằng /kiem-tra-ui, truy cập (axe, bàn phím), giảm chuyển động + poster, hiệu năng (bảng số đo), kiểm tra bản build dưới context path con, frontend/HANDOFF.md đầy đủ, cập nhật README tài liệu nếu khác kế hoạch.

TIÊU CHUẨN "XỊN" (tự chấm sau mỗi mốc, thang 10, dưới 8 thì sửa tiếp)
- Nhìn lướt bất kỳ trang nào cũng thấy rõ là một sản phẩm cao cấp: ảnh thật lớn và sắc, khoảng trắng có chủ ý, chữ to và chắc, nhịp các khối nhất quán, không có chỗ nào trông như template.
- Chuyển động có ý nghĩa và mượt (≥ 58 FPS trên Apple Silicon ở mức high), không có hiệu ứng thừa, không giật khi cuộn.
- Dữ liệu đúng hợp đồng; mọi trang đủ 4 trạng thái; không lỗi console; số liệu luôn lấy từ dữ liệu.
- Mobile 390 px đẹp như desktop chứ không chỉ "không vỡ".
Với trang chủ, hồ sơ loài và Hành tinh BioNexus: tự đặt ảnh chụp của mình cạnh ảnh tham chiếu tương ứng trong reference/screens/ và nói rõ bản mới đẹp hơn ở điểm nào.

BÁO CÁO CUỐI (artifact walkthrough)
1. Bảng 24 route × (đạt/chưa) × ảnh nhỏ 1440 và 390.
2. Bảng số đo: LCP, CLS, kích thước bundle, FPS từng cảnh 3D ở các mức chất lượng.
3. Danh sách quyết định đã tự đưa ra và những chỗ khác tài liệu.
4. Việc còn tồn đọng hoặc bị kẹt (nếu có), kèm đề xuất.
5. Đường dẫn tới HANDOFF.md, Bảng duyệt ảnh, danh sách commit của nhánh feat/frontend-ui.

MẪU frontend/PROGRESS.md
# Tiến độ giao diện BioNexus
## Trạng thái: Mốc <N> · <đang làm gì>
## Các mốc
- [ ] Mốc 1 · Nền móng (01, 03, 04, 05)
- [ ] Mốc 2 · Ảnh thật (02)
- [ ] Mốc 3 · Trang nghiệp vụ (12, 13, 14, 15, 10, 11)
- [ ] Mốc 4 · Engine 3D (06, 07)
- [ ] Mốc 5 · Trang chủ (08, 09)
- [ ] Mốc 6 · Hoàn thiện, bàn giao (16)
## Việc chi tiết của mốc hiện tại
- [ ] ...
## Số đo
| Ngày | Trang | FPS | LCP | Bundle | Ghi chú |
## Quyết định
- ...
## Kẹt
- ...
## Commit
- <hash> feat(ui): mốc 1 - ...
```

## Prompt tiếp tục (khi phiên bị ngắt, hết ngữ cảnh, hoặc bạn mở hội thoại mới)

```text
Tiếp tục nhiệm vụ dựng giao diện BioNexus.
1. Đọc frontend/PROGRESS.md để biết đang ở mốc nào, việc gì xong, việc gì kẹt. Đọc lại AGENTS.md và docs/frontend/PROMPT-DAI.md (phần prompt chính) để nắm lại luật, các mốc, cổng mốc và tiêu chuẩn.
2. Chạy git log --oneline -10 và git status trên nhánh feat/frontend-ui để đối chiếu với PROGRESS.md. Có thay đổi chưa commit thì xem lại, chạy npm run check rồi quyết định giữ hay sửa.
3. Đọc lại các tài liệu liên quan tới mốc hiện tại (theo danh sách Prompt NN của mốc đó trong PROMPTS.md).
4. Làm tiếp từ đúng việc chưa xong, giữ nguyên cách làm việc, cổng mốc và cách báo cáo như prompt chính.
```

## Prompt rà soát giữa chừng (tuỳ chọn, khi bạn muốn xem nhanh)

```text
Tạm dừng sau khi xong việc đang làm dở. Báo cáo ngắn: đang ở mốc nào; 5 ảnh chụp đẹp nhất vừa làm; số đo mới nhất; điều bạn chưa hài lòng. Rồi chờ tôi góp ý (tôi có thể gửi kèm prompt S1 trong PROMPTS.md). Không làm tiếp cho tới khi tôi nói "tiếp tục".
```

## Mẹo khi chạy một nhiệm vụ dài

- **Góp ý giữa chừng:** dùng prompt rà soát ở trên. Góp ý càng cụ thể càng tốt: ảnh chụp, route, "muốn giống ảnh tham chiếu nào". Sau đó gõ "tiếp tục".
- **Agent bắt đầu làm ẩu** (bỏ cổng mốc, quên kiểm tra mobile): mở hội thoại mới và dán **prompt tiếp tục**. Tiến độ nằm ở `PROGRESS.md` và lịch sử commit nên không mất gì.
- **Làm lại một mốc từ đầu:** `git reset --hard <commit của mốc trước>` trên nhánh `feat/frontend-ui`. Lệnh này xoá các thay đổi sau commit đó, nên chỉ chạy khi chắc chắn. Sau đó dán prompt tiếp tục.
- **Không chạy 2 agent cùng lúc trên cùng một thư mục**, vì chúng sẽ ghi đè file của nhau.
- **Xong hết:**
  - Xem Bảng duyệt ảnh, chê ảnh nào thì dùng S1 để thay.
  - Đọc `HANDOFF.md`.
  - Gộp `feat/frontend-ui` vào nhánh chính.
