# Nhiệm vụ cho Antigravity: nhóm 13, thú cưng trên cạn (chó, mèo, thú nhỏ)

Bạn là agent nghiên cứu dữ liệu cho BioNexus: bách khoa sinh học kèm sàn sinh vật cảnh hợp pháp ở Việt Nam. Sàn đã có bò sát, lưỡng cư, cá, chim, cây; còn **thiếu thú cưng trên cạn**. Hãy thu thập dữ liệu **có thật, kiểm chứng được bằng API** và ghi thành file JSON.

Luật chung, cách kiểm tên qua GBIF, cách kiểm ảnh qua Commons và mẫu JSON gốc **giống hệt** `frontend/catalog/PROMPT-antigravity.md` (đọc kỹ file đó trước, nhất là mục 1, 4, 5, 6, 8). File này chỉ ghi phần khác.

## 1. Phạm vi

- Chỉ tạo file trong `frontend/catalog/`. Không sửa file nào khác, không tải ảnh, không `npm install`, không `git commit`.
- Ghi vào `13-a.json`, `13-b.json`..., mỗi file tối đa 20 loài.
- Sau mỗi file, ghi đè `frontend/catalog/_progress-13.json` dạng `{ "updatedAt": "<ISO>", "doneFiles": [...] }`. Bị ngắt thì đọc file này và làm tiếp.
- **Xong hết thì ghi `frontend/catalog/DONE-13.json` làm việc cuối cùng**, dạng `{ "status": "done", "finishedAt": "<ISO>", "files": [...], "speciesCount": 0, "productCount": 0, "photoCount": 0, "skipped": [...], "notesVi": "..." }`.
- Buộc phải dừng hẳn thì ghi `frontend/catalog/FAILED-13.json` kèm `reasonVi`.

## 2. Danh sách cần làm

**A. Chó và mèo: mỗi loài một mục, các giống là sản phẩm.** Giống (breed) không phải loài sinh học, nên không tạo mục loài riêng cho từng giống.
- `Canis lupus familiaris` (chó nhà): **25 giống phổ biến ở Việt Nam**, ví dụ Poodle, Phốc sóc (Pomeranian), Corgi, Shiba Inu, Husky, Alaska Malamute, Golden Retriever, Labrador, Becgie Đức, Pug, Chihuahua, Bulldog Pháp, Beagle, Samoyed, Dachshund, Shih Tzu, Maltese, Poodle Tiny, Border Collie, Doberman, Bắc Hà, Phú Quốc, H'Mông cộc đuôi... Ưu tiên có các giống chó Việt Nam.
- `Felis catus` (mèo nhà): **20 giống**, ví dụ Anh lông ngắn, Anh lông dài, Ba Tư, Ragdoll, Maine Coon, Xiêm, Bengal, Sphynx, Mướp Việt Nam, Mèo mướp vàng, Mèo Nga xanh (Russian Blue), Abyssinian, British Shorthair màu bicolor...
  - Không đưa giống có vấn đề phúc lợi nghiêm trọng do lai tạo (ví dụ Scottish Fold tai cụp, Munchkin chân ngắn). Ghi các giống đã bỏ vào `skipped` kèm lý do.

**B. Thú nhỏ, mỗi loài một mục: khoảng 20 loài.**
- Chuột hamster Syria (*Mesocricetus auratus*), hamster Campbell, hamster Winter White, hamster Roborovski.
- Chuột nhảy Mông Cổ (*Meriones unguiculatus*), degu, sóc bay úc (*Petaurus breviceps*), nhím kiểng châu Phi (*Atelerix albiventris*).
- Thỏ nhà (*Oryctolagus cuniculus domesticus*), chuột lang (*Cavia porcellus*), chồn sương (*Mustela furo*), sóc chuột (*Tamias sibiricus*), chinchilla.
- Thêm vài loài thú nhỏ khác hợp pháp và phổ biến.

**C. Gà, vịt, chim cảnh trên cạn chưa có ở nhóm 10:** khoảng 5 loài, ví dụ gà Serama, gà Ai Cập, chim cút Nhật. Chỉ làm nếu dư thời gian.

## 3. Luật riêng cho vật nuôi đã thuần hoá

- IUCN **không đánh giá** dạng thuần hoá (chó nhà, mèo nhà, thỏ nhà, chuột lang, chồn sương...).
  - Với các loài này: đặt `"domestic": true` và `"iucn": null`. **Không tự gán mức IUCN.**
  - Ghi loài hoang dã tổ tiên vào trường mới `wildAncestor`, ví dụ chó nhà là *Canis lupus*, chồn sương là *Mustela putorius*.
- Loài hoang dã nuôi làm cảnh (hamster, nhím kiểng, sóc bay...): `"domestic": false`, `iucn` lấy theo Sách Đỏ như luật cũ. Chỉ nhận LC, NT, VU, EN, CR, EW, EX.
- GBIF: dạng thuần hoá có thể là phân loài hoặc tên đồng nghĩa.
  - Ghi `gbifKey` của chính tên đó nếu GBIF có, kèm `gbifStatus` (`ACCEPTED`, `SYNONYM`...) và `gbifRank` (`SPECIES`, `SUBSPECIES`).
  - Không bắt buộc `ACCEPTED`/`SPECIES` như luật cũ, nhưng phải kiểm qua API thật.
- Buôn bán:
  - Chó, mèo, thú nhỏ phổ biến: `tradeable: true`, nguồn là trại nhân giống đăng ký.
  - Loài hoang dã thuộc CITES I (ví dụ chinchilla hoang dã) chỉ bán được dạng nhân nuôi nhiều thế hệ. Khi đó đặt `"trade.needsReview": true` và giải thích trong `reasonVi`.

## 4. Sản phẩm (giống, biến thể) kèm ảnh riêng

Mỗi sản phẩm có ảnh **riêng của giống đó**. Không dùng chung ảnh loài, để các thẻ trên sàn không trùng ảnh. Mẫu:

```json
{
  "nameVi": "Chó Corgi Pembroke thuần chủng (2 tháng tuổi)",
  "breedVi": "Corgi Pembroke",
  "breedEn": "Pembroke Welsh Corgi",
  "priceVnd": 18000000,
  "descriptionVi": "Chó con đã tiêm 2 mũi, tẩy giun, có sổ theo dõi sức khoẻ từ trại.",
  "temperamentVi": "Thông minh, quấn chủ, hợp căn hộ nếu được đi dạo đều",
  "sizeVi": "Cao 25–30 cm, nặng 10–14 kg khi trưởng thành",
  "lifespanVi": "12–15 năm",
  "careVi": "Rụng lông nhiều, chải lông 2–3 lần mỗi tuần; dễ béo nên chia nhỏ bữa ăn",
  "originVi": "Xứ Wales, Anh",
  "photos": [
    {
      "file": "File:...",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:...",
      "originalUrl": "https://upload.wikimedia.org/...",
      "width": 0, "height": 0,
      "license": "CC BY-SA 4.0", "licenseUrl": "...", "author": "...",
      "verified": true, "visualChecked": true
    }
  ]
}
```

- **Giá:** tham khảo thị trường Việt Nam 2025–2026, VND, số nguyên. Chó, mèo thuần chủng thường từ 3 đến 40 triệu tuỳ giống.
- **Ảnh mỗi sản phẩm:** 1–2 ảnh đúng giống. Kiểm qua API Commons:
  - Ảnh phải thuộc thể loại của giống, ví dụ `Category:Pembroke Welsh Corgis`.
  - Mở xem từng ảnh: đúng giống, rõ con vật.
  - Không có mặt người, không watermark hay chữ đè, không ảnh AI.
  - Ưu tiên ảnh con non và ảnh chụp ngang.
- **Ảnh mục loài:** chó nhà và mèo nhà vẫn cần 4–8 ảnh như luật cũ, chọn ảnh đẹp đại diện cho loài.

## 5. Trường bổ sung so với mẫu gốc

Thêm vào mỗi loài, ngoài các trường của mục 8 trong `PROMPT-antigravity.md`:

- `"group": "Thú cưng"`: giá trị nhóm mới cho cả mục 2A, 2B, 2C.
- `"domestic"`: `true` hoặc `false`.
- `"wildAncestor"`: `{ "scientificName": "Canis lupus", "commonNameVi": "Sói xám", "iucn": "LC", "gbifKey": 0 }`, hoặc `null` nếu không phải dạng thuần hoá.
- `"gbifStatus"`, `"gbifRank"`: theo mục 3.
- `"trade.needsReview"`: `true` hoặc `false`.
- `"vaccinationVi"`: lịch tiêm phòng cơ bản ở Việt Nam (chỉ chó, mèo, thỏ, chồn).
- `"legalNoteVi"`: lưu ý pháp lý khi nuôi hoặc bán ở Việt Nam, ví dụ chó phải tiêm phòng dại và đăng ký với địa phương.

Các trường `care`, `size`, `funFactsVi`, `threatsVi`... vẫn điền như mẫu gốc. Với vật nuôi, `threatsVi` nói về mối đe doạ của loài hoang dã tổ tiên, hoặc để `[]`.
