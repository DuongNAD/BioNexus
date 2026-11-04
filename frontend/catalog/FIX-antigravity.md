# Nhiệm vụ sửa cho Antigravity: lượt 2 của catalog BioNexus

Claude đã kiểm 624 loài bạn thu thập:
- Tên khoa học và `gbifKey` đúng 100% theo GBIF.
- Mức IUCN chỉ lệch 3 loài so với Wikidata.
- Mọi ảnh đều tồn tại trên Commons và có giấy phép hợp lệ.
- 98% ảnh nằm đúng thể loại Commons của loài.

Còn một số chỗ cần sửa, liệt kê theo từng loài trong `frontend/catalog/_fix-list.json`.

## Phạm vi

- Chỉ sửa các file `frontend/catalog/NN-x.json` đang có (sửa tại chỗ) và tạo các file tiến độ nêu ở mục cuối.
- **Không** sửa `DONE.json`, `_fix-list.json`, `PROMPT-antigravity.md` hay bất kỳ file nào ngoài `frontend/catalog/`.
- Mọi luật của `PROMPT-antigravity.md` vẫn áp dụng: kiểm tên qua API GBIF, kiểm ảnh qua API Commons, giấy phép CC0, PD, CC BY, CC BY-SA, giữ nguyên mẫu JSON, không bịa.
- Sau mỗi lần sửa, file vẫn phải là JSON hợp lệ. Không đổi thứ tự, không xoá trường.
- Không tải ảnh, không `npm install`, không `git commit`.

## Việc cần làm

1. Đọc `_fix-list.json`. Mỗi phần tử có `file` (file chứa loài), `scientificName` và `tasks` (danh sách việc bằng tiếng Việt). Làm hết `tasks` của từng loài.
2. **Thay ảnh:** ảnh mới phải nằm trong thể loại Commons của đúng loài hoặc tên đồng nghĩa của loài. Kiểm bằng:
   `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=categories|imageinfo&clshow=!hidden&iiprop=url|size|extmetadata&titles=File:<tên>`
   - Không có thể loại của loài thì không dùng.
   - Ảnh có nhiều loài (bể cá chung, chuồng chung) thì không dùng.
   - Không có ảnh thay đạt chuẩn thì xoá ảnh lỗi. Mỗi loài vẫn phải còn ít nhất 1 `hero` và 1 `portrait`. Thiếu portrait dọc thì chọn ảnh gallery dọc và đổi role.
3. **Soát lại toàn bộ ảnh `hero` của 624 loài bằng mắt.** Thay ảnh hero nếu:
   - chủ thể nhỏ, mờ, bị che hoặc nằm trong nước đục;
   - là cảnh bể hoặc chuồng chung;
   - có chữ, logo hoặc watermark đè lên;
   - với thực vật: chỉ có lá trong khi loài có hoa hay bình bẫy đặc trưng.

   Ảnh hero sẽ hiện to cả màn hình nên phải nét và đẹp.
4. **Tên tiếng Việt:** với loài chưa có tên phổ biến, dịch nghĩa tên tiếng Anh cho tự nhiên, theo cách gọi trong giới chơi Việt Nam nếu có. Ví dụ: "Cá thiên thần hoàng đế", "Vẹt đuôi dài xanh". Không để rỗng.

## Tiến độ và báo xong

- Sau mỗi file `NN-x.json` sửa xong, ghi đè `frontend/catalog/_fix-progress.json`:
  `{ "updatedAt": "<ISO>", "doneFiles": [...], "speciesFixed": 0 }`
- Bị ngắt thì đọc `_fix-progress.json` và làm tiếp.
- **Xong hết thì ghi `frontend/catalog/FIX-DONE.json` làm việc cuối cùng:**
  `{ "status": "done", "finishedAt": "<ISO>", "speciesFixed": 0, "photosReplaced": 0, "photosRemoved": 0, "heroesReplaced": 0, "speciesRemoved": [{ "scientificName": "...", "reasonVi": "...", "replacedBy": "..." }], "notesVi": "..." }`
- Buộc phải dừng hẳn thì ghi `frontend/catalog/FIX-FAILED.json` kèm `reasonVi`.
