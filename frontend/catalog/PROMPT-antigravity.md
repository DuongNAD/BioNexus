# Nhiệm vụ cho Antigravity: thu thập khoảng 300 loài mới cho BioNexus

Bạn là agent nghiên cứu dữ liệu. BioNexus là bách khoa sinh học (cây phân loại 6 cấp Giới → Ngành → Lớp → Bộ → Họ → Chi → Loài, kèm mức bảo tồn IUCN) và sàn sinh vật cảnh hợp pháp có kiểm duyệt tại Việt Nam. Nhiệm vụ: thu thập dữ liệu **có thật, kiểm chứng được bằng API** cho khoảng 300 loài mới và ghi thành file JSON. Một agent khác sẽ đọc các file này để sinh seed SQL, mock và tải ảnh.

## 1. Phạm vi (bắt buộc)

- **Chỉ tạo file trong `frontend/catalog/`.** Không sửa bất kỳ file nào khác trong repo, kể cả `AGENTS.md`, `database/`, `src/`.
- Script phụ trợ (gọi API) đặt ở thư mục tạm của hệ điều hành, **không** đặt trong repo.
- **Không** tải ảnh về, chỉ ghi metadata. **Không** chạy `npm install`. **Không** `git commit`, **không** `git push`.
- Gọi API có header `User-Agent: BioNexusStudentProject/1.0 (Aptech 2026)`, tối đa 1 request mỗi giây. Gặp lỗi 429 hoặc 503 thì chờ rồi thử lại.

## 2. Các nhóm loài

Làm lần lượt theo thứ tự. Mỗi file chứa **tối đa 20 loài**, đặt tên `<nhóm>-<lượt>.json`, ví dụ `01-a.json`, `01-b.json`.

Mục tiêu tổng khoảng **600 loài mới**. Số ở cột cuối là **mức tối thiểu cần nhắm tới**. Còn loài đạt chuẩn thì cứ làm thêm, nhưng **không hạ chuẩn kiểm API và xem ảnh** để lấy số lượng.

| Nhóm | Phạm vi | Số loài |
|---|---|---|
| 01 | Thằn lằn và tắc kè cảnh | 70 |
| 02 | Rắn cảnh | 50 |
| 03 | Rùa cạn và rùa nước (cẩn thận: nhiều loài rùa châu Á được bảo vệ ở Việt Nam) | 40 |
| 04 | Lưỡng cư: ếch, cóc, kỳ giông, sa giông | 60 |
| 05 | Cá cảnh nước ngọt (môi trường ghi nhiệt độ nước và pH) | 80 |
| 06 | Động vật không xương sống cảnh: nhện, bọ cạp, tôm, cua, ốc, côn trùng | 40 |
| 07 | Cây ăn thịt: Nepenthes, Drosera, Sarracenia, Pinguicula, Utricularia, Cephalotus... | 60 |
| 08 | Lan, xương rồng, mọng nước, dương xỉ, ráy, cây thuỷ sinh | 70 |
| 09 | Động vật và thực vật hoang dã Việt Nam: thú, chim, bò sát, lưỡng cư, cây bản địa. Chỉ đưa vào bách khoa, không bán | 60 |
| 10 | Chim cảnh (vẹt, sẻ, khướu, chim hót...) | 30 |
| 11 | Cá cảnh biển và san hô | 40 |
| 12 | Ảnh bổ sung cho 9 loài BioNexus đã có (mục 7) | 9 |

## 3. Tiến độ, làm tiếp và báo xong

- Sau mỗi file JSON, ghi đè `frontend/catalog/_progress.json`:
  `{ "updatedAt": "<ISO>", "doneFiles": ["01-a.json", ...], "nextGroup": "01", "speciesSoFar": 20 }`
- Nếu bị ngắt giữa chừng: đọc `_progress.json` và các file đã có, làm tiếp từ chỗ dừng, không làm lại.
- **Khi xong toàn bộ 12 nhóm, ghi `frontend/catalog/DONE.json` làm việc cuối cùng.** Trước đó không được tạo file này.
  `{ "status": "done", "finishedAt": "<ISO>", "files": [...], "speciesCount": 0, "productCount": 0, "photoCount": 0, "photosVerified": 0, "skipped": [{ "scientificName": "...", "reasonVi": "..." }], "notesVi": "..." }`
- Nếu buộc phải dừng hẳn (hết quota, bị chặn API, lỗi không tự xử lý được), ghi `frontend/catalog/FAILED.json`:
  `{ "status": "failed", "at": "<ISO>", "lastFile": "...", "reasonVi": "..." }`

## 4. Luật chọn loài

1. Chỉ chọn loài đã được IUCN đánh giá với mức thuộc **LC, NT, VU, EN, CR, EW, EX**. Database chỉ nhận 7 giá trị này. **Loại** loài DD, NE hoặc không có trên Sách Đỏ.
2. Tên được chấp nhận theo **GBIF Backbone Taxonomy**. Gọi `https://api.gbif.org/v1/species/match?name=<tên khoa học>&strict=true`:
   - Chỉ nhận khi `status` là `ACCEPTED` và `rank` là `SPECIES`.
   - Lấy `usageKey` làm `gbifKey`.
   - Lấy `kingdom`, `phylum`, `class`, `order`, `family`, `genus` từ chính kết quả API này.
3. **Không** chọn 9 loài đã có: Eublepharis macularius, Pogona vitticeps, Python regius, Python bivittatus, Testudo hermanni, Ambystoma mexicanum, Nepenthes rajah, Nepenthes ampullaria, Dionaea muscipula. Không trùng loài giữa các nhóm.
4. Nhóm sinh vật cảnh: ưu tiên loài **phổ biến trong giới chơi**, có trại nhân giống và có ảnh đẹp trên Commons. Trộn thêm vài loài nguy cấp để bách khoa có đủ các mức bảo tồn.
5. Không đủ loài đạt chuẩn thì làm ít hơn và ghi lý do vào `skipped` trong `DONE.json`. Không hạ chuẩn.

## 5. Luật buôn bán (trường `trade`)

`tradeable` là `false` nếu loài thuộc **một** trong các trường hợp:
- CITES Phụ lục I;
- nhóm IB Nghị định 06/2019/NĐ-CP hoặc nhóm I Nghị định 84/2021/NĐ-CP;
- mức EW hoặc EX;
- chỉ có nguồn bắt từ tự nhiên, không có trại nhân giống hay nuôi cấy mô.

Khi đó `products` là `[]`. Nhóm 09 luôn là `false`.

## 6. Luật nội dung và ảnh

- Tiếng Việt có dấu đầy đủ. Không emoji. Không bịa: không chắc thì để `null`.
- `descriptionVi`: 2–3 câu, tối đa 350 ký tự. Nêu nét nhận dạng, tập tính hoặc điều đáng chú ý. Không chép nguyên văn Wikipedia.
- `conservationNoteVi`: 1 câu nói vì sao loài ở mức IUCN đó.
- `pullQuoteVi`: 1 câu gây tò mò, đúng sự thật, dùng làm câu trích lớn trên trang loài.
- `environment`: **điều kiện nuôi** với sinh vật cảnh, **điều kiện tự nhiên** với nhóm 09. Đơn vị °C và %. Không áp dụng thì `null`.
- `origin`: một điểm tiêu biểu trong vùng phân bố tự nhiên, toạ độ thập phân 2 chữ số.
- Sản phẩm: 1–3 cho mỗi loài bán được, mỗi sản phẩm một biến thể (morph), tuổi hoặc kích thước khác nhau. Giá tham khảo thị trường Việt Nam 2025–2026, VND, số nguyên.
- Mọi trường mô tả (kích thước, sinh sản, mối đe doạ, sự thật thú vị, cách nuôi...) phải có nguồn trong `sources`. Không tìm được nguồn thì để `null` hoặc `[]`.
- **Ảnh:** mỗi loài 4–8 ảnh trên Wikimedia Commons: 1 `hero` (ngang, rộng ≥ 2000 px), 1 `portrait` (dọc), 2–5 `gallery` (cận cảnh, toàn thân, tư thế hoặc biến thể khác nhau), 0–1 `habitat` (môi trường sống thật).
  - **Kiểm từng ảnh bằng API:** `https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size|extmetadata&titles=File:<tên>`. Lấy `width`, `height`, `extmetadata.LicenseShortName`, `extmetadata.LicenseUrl`, `extmetadata.Artist` (bỏ thẻ HTML).
  - Chỉ nhận giấy phép **CC0, Public Domain, CC BY, CC BY-SA**. Cấm NC, ND.
  - **Mở xem ảnh** (thumbnail là đủ) để chắc chắn đúng loài, không watermark, không chữ đè, không mặt người, không phải ảnh AI, không phải cảnh nuôi nhốt tồi tệ. Xem rồi thì đặt `visualChecked: true`.
  - Ảnh không qua được API thì bỏ, không ghi vào file.

## 7. Nhóm 12: ảnh bổ sung cho 9 loài đã có

Mỗi loài thêm **tối đa 8 ảnh**: 5 `gallery` (cận cảnh mắt, vảy, mang, túi bẫy, toàn thân, tư thế khác nhau), 1 `habitat`, 2 `hero` (ngang, rộng ≥ 2400 px, chủ thể chiếm 30–60% khung, nền gọn). Áp dụng cùng luật ảnh ở mục 6.

Cẩn thận các cặp dễ nhầm:
- *Nepenthes rajah* với các nắp ấm khác;
- *Python bivittatus* với *P. molurus*;
- *Testudo hermanni* với *Testudo graeca*.

Ghi vào `12-a.json` dạng: `[{ "scientificName": "...", "photos": [ <mẫu ảnh ở mục 8, thêm "subjectVi"> ] }]`.

## 8. Mẫu JSON (nhóm 01–11)

Mỗi file là **một mảng JSON hợp lệ**: nháy kép, không dấu phẩy thừa, không comment. Mỗi phần tử theo mẫu:

```json
{
  "scientificName": "Correlophus ciliatus",
  "commonNameVi": "Tắc kè mào",
  "commonNameEn": "Crested gecko",
  "group": "Bò sát",
  "taxonomy": {
    "kingdom": "Animalia", "phylum": "Chordata", "class": "Reptilia",
    "order": "Squamata", "family": "Diplodactylidae", "genus": "Correlophus"
  },
  "taxonomyVi": { "order": "Bộ Có vảy", "family": "Họ Diplodactylidae", "genus": "Chi Correlophus" },
  "iucn": "VU",
  "iucnUrl": "https://www.iucnredlist.org/species/...",
  "gbifKey": 0,
  "environment": {
    "tempMin": 22, "tempMax": 26,
    "baskMin": null, "baskMax": null,
    "humidMin": 60, "humidMax": 80,
    "waterTempMin": null, "waterTempMax": null,
    "phMin": null, "phMax": null,
    "habitatVi": "Rừng mưa nhiệt đới New Caledonia"
  },
  "descriptionVi": "...",
  "conservationNoteVi": "...",
  "pullQuoteVi": "...",
  "dietVi": "Ăn tạp: côn trùng, quả chín",
  "lifespanVi": "15–20 năm",
  "activityTimeVi": "Đêm",
  "origin": { "place": "Đảo Grande Terre, New Caledonia", "lat": -21.5, "lng": 165.5 },
  "regionVi": "New Caledonia",
  "otherNamesVi": ["Thạch sùng mào"],
  "synonyms": ["Rhacodactylus ciliatus"],
  "wikidataId": "Q2722263",
  "wikipediaVi": null,
  "wikipediaEn": "https://en.wikipedia.org/wiki/Crested_gecko",
  "iucnAssessedYear": 2021,
  "populationTrend": "Stable",
  "size": {
    "lengthCmMin": 15, "lengthCmMax": 20,
    "weightGMin": 35, "weightGMax": 55,
    "heightCmMax": null,
    "noteVi": "Tính cả đuôi"
  },
  "distribution": {
    "countries": ["NC"],
    "nativeRangeVi": "Phía nam đảo Grande Terre và đảo Isle of Pines, New Caledonia",
    "elevationM": { "min": 0, "max": 1000 }
  },
  "habitatTypesVi": ["Rừng mưa nhiệt đới", "Tán cây thấp"],
  "identificationVi": "Gờ da có gai chạy từ trên mắt dọc hai bên lưng, ngón chân có giác bám, đuôi bám được.",
  "behaviorVi": "...",
  "reproductionVi": "Đẻ 2 trứng mỗi lứa, ấp 60–90 ngày.",
  "threatsVi": ["Kiến lửa ngoại lai Wasmannia auropunctata", "Mất rừng do cháy"],
  "funFactsVi": ["Từng bị coi là đã tuyệt chủng cho tới năm 1994."],
  "similarSpecies": ["Rhacodactylus auriculatus"],
  "care": {
    "difficulty": "Dễ",
    "beginnerFriendly": true,
    "enclosureVi": "Chuồng đứng tối thiểu 45×45×60 cm cho một con trưởng thành",
    "lightingVi": "Không bắt buộc UVB, UVB 2–5% giúp ích",
    "feedingVi": "Thức ăn dạng sệt cho tắc kè ăn quả, dế bổ sung 1–2 lần mỗi tuần",
    "socialVi": "Nuôi riêng con đực",
    "commonProblemsVi": ["Rụng đuôi khi bị stress (không mọc lại)"]
  },
  "trade": { "tradeable": true, "cites": null, "vnProtected": null, "reasonVi": "Nhân giống trong nuôi nhốt rất phổ biến" },
  "products": [
    { "nameVi": "Tắc kè mào Harlequin (4 tháng tuổi)", "priceVnd": 1500000, "descriptionVi": "Cá thể nhân giống trong nước, ăn thức ăn dạng sệt tốt." }
  ],
  "photos": [
    {
      "role": "hero",
      "file": "File:Tên file chính xác.jpg",
      "pageUrl": "https://commons.wikimedia.org/wiki/File:...",
      "originalUrl": "https://upload.wikimedia.org/...",
      "width": 4000, "height": 2667,
      "license": "CC BY-SA 4.0",
      "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0",
      "author": "Tên tác giả",
      "verified": true,
      "visualChecked": true
    }
  ],
  "sources": ["https://www.gbif.org/species/...", "https://..."]
}
```

Giải thích các trường:
- `group`: một trong `Bò sát`, `Lưỡng cư`, `Cá cảnh`, `Động vật không xương sống`, `Cây ăn thịt`, `Cây cảnh`, `Thú`, `Chim`.
- `taxonomyVi`: tên tiếng Việt có tiền tố "Bộ", "Họ", "Chi". Chưa có tên Việt phổ biến thì ghi tiền tố cộng tên khoa học. Tối đa 100 ký tự.
- `activityTimeVi`: `Ngày`, `Đêm` hoặc `Chạng vạng`. Thực vật thì `null`.
- `trade.cites`: `"I"`, `"II"`, `"III"` hoặc `null`.
- `trade.vnProtected`: `"IB"`, `"IIB"`, `"I"`, `"II"` hoặc `null`.
- `verified`: `true` khi đã kiểm qua API Commons ở mục 6.
- `wikidataId`, `synonyms`, `wikipediaVi`, `wikipediaEn`: lấy từ Wikidata hoặc GBIF. Tên đồng nghĩa giúp ô tìm kiếm khớp cả tên cũ.
- `iucnAssessedYear`: năm IUCN đánh giá gần nhất.
- `populationTrend`: `Increasing`, `Stable`, `Decreasing` hoặc `Unknown`, theo IUCN.
- `size`: số đo con trưởng thành. Thực vật dùng `heightCmMax` (cây) hoặc ghi kích thước bình, hoa trong `noteVi`.
- `distribution.countries`: mã ISO 3166-1 alpha-2 các nước có phân bố tự nhiên.
- `funFactsVi`: 1–3 điều thú vị, đúng sự thật, có nguồn.
- `similarSpecies`: tên khoa học các loài dễ nhầm.
- `care`: chỉ điền với loài bán được. `difficulty` là `Dễ`, `Trung bình` hoặc `Khó`. Nhóm 09 thì `care: null`.
