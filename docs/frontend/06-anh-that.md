# 06 · Ảnh thật: nguồn, giấy phép, tối ưu

Chủ dự án muốn **dùng ảnh thật thật nhiều**. Ảnh là thứ làm giao diện "xịn" nhất, nên phải đúng loài, đẹp, và hợp pháp.

## 1. Luật

1. **Nguồn ưu tiên:** Wikimedia Commons. Dự phòng: iNaturalist (chỉ lấy ảnh có giấy phép CC), Flickr (chỉ lấy ảnh CC).
2. **Giấy phép được dùng:** CC0, Public Domain, CC BY (2.0/3.0/4.0), CC BY-SA (2.0/3.0/4.0).
   **Cấm:** NC (phi thương mại), ND (không phái sinh), "fair use", ảnh không rõ giấy phép, ảnh lấy từ Google Images.
3. **Ghi nguồn đầy đủ** ở 3 nơi:
   - Metadata `content/photos.generated.ts` (tác giả, giấy phép, link giấy phép, link gốc).
   - Chip nguồn ảnh trên giao diện (component `PhotoCredit`).
   - Trang `/credits`.
   - Ảnh CC BY-SA bị cắt hoặc chỉnh màu thì ghi thêm "đã chỉnh sửa".
4. **Không** dùng ảnh do AI tạo cho loài, sản phẩm hay môi trường sống. **Không** hotlink, phải tải về `public/photos/`. **Không** dùng ảnh có watermark, chữ đè lên, mặt người, hoặc cảnh nuôi nhốt tồi tệ.
5. **Đúng loài:** người hoặc agent phải **nhìn từng ảnh** và đối chiếu với tên khoa học. Ví dụ dễ nhầm:
   - *Nepenthes rajah* với các nắp ấm khác.
   - *Python bivittatus* với *P. molurus*.
   - Rùa Hermann với rùa Hy Lạp (*Testudo graeca*).
6. **9 ảnh hiện có** trong `docs/ui-mockups/assets/` **chưa kiểm tra giấy phép**. Chỉ dùng nếu tìm được đúng file gốc trên Commons kèm giấy phép. Không tìm được thì thay ảnh khác.

## 2. Danh sách ảnh cần có

**Theo loài** (9 loài, khoảng 6–8 ảnh mỗi loài):

| Vai trò | Số lượng | Yêu cầu |
|---|---|---|
| `hero` | 1 | Ngang 16:9 trở lên, cạnh dài ≥ 2.400 px. Con vật hoặc cây chiếm 30–60% khung, có khoảng trống để đặt chữ, nền gọn |
| `portrait` | 1 | Dọc (4:5 được). Dùng cho thẻ loài và chuỗi xoắn |
| `gallery` | 4–6 | Chi tiết (mắt, vảy, túi bẫy, mang), toàn thân, tư thế khác nhau |
| `habitat` | 1 | Môi trường sống thật: hồ Xochimilco, rừng mây Kinabalu, savan Tây Phi, bán hoang mạc Pakistan, đầm lầy Carolina, rừng ngập Đông Nam Á, vùng khô miền trung Úc, cây bụi Địa Trung Hải, rừng thấp Borneo |

**Theo sản phẩm:** cố tìm ảnh đúng biến thể (morph). Không có thì dùng ảnh `portrait` hoặc `gallery` của loài. Được lật ngang ảnh để hai sản phẩm cùng loài trông khác nhau.

| Sản phẩm | Từ khoá tìm trên Commons |
|---|---|
| Leopard Gecko High Yellow | "Eublepharis macularius" yellow, normal phase |
| Leopard Gecko Tangerine Baby | "Eublepharis macularius" tangerine / orange |
| Rồng Úc Hypo Baby | "Pogona vitticeps" juvenile / hypomelanistic |
| Trăn bóng Pastel | "Python regius" pastel morph |
| Trăn đất Albino | "Python bivittatus" albino |
| Rùa Hermann baby | "Testudo hermanni" juvenile / hatchling |
| Axolotl Leucistic | "Ambystoma mexicanum" leucistic |
| Cây bắt ruồi Venus | "Dionaea muscipula" (ảnh cây trồng chậu nếu có) |
| Nắp ấm Rajah cây con | "Nepenthes rajah" rosette / juvenile |
| Nắp ấm Ampullaria xanh | "Nepenthes ampullaria" green pitchers |

**Ảnh không khí** (6–10 ảnh): rừng mưa nhiệt đới, sương mù rừng mây, giọt nước trên lá, rêu và dương xỉ cận cảnh, cảnh đêm nhiều đom đóm. Dùng cho trang đăng nhập, trang trống, nền khối "Mở shop".

Tổng cộng khoảng 80–100 ảnh. Dung lượng `public/photos` sau khi tối ưu nên ≤ 30 MB.

## 3. Quy trình tự động có kiểm duyệt

### 3.1 `scripts/photo-plan.json`

```json
[
  { "slug": "axolotl", "scientificName": "Ambystoma mexicanum",
    "queries": ["Ambystoma mexicanum", "axolotl"], "categories": ["Ambystoma mexicanum"],
    "want": { "hero": 1, "portrait": 1, "gallery": 6, "habitat": 1 },
    "habitatQueries": ["Xochimilco canal", "Xochimilco chinampas"] }
]
```

### 3.2 `scripts/fetch-photos.mjs`

Tìm ứng viên qua Commons API (không cần khoá API):

```text
https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*
  &generator=search&gsrnamespace=6&gsrlimit=30&gsrsearch=<query> filetype:bitmap
  &prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=2400
```

Hoặc lấy theo category: `generator=categorymembers&gcmtitle=Category:<Tên>&gcmtype=file`.

**Lọc tự động:**
- mime `image/jpeg` hoặc `image/png`, cạnh ngắn ≥ 1.200 px.
- `extmetadata.LicenseShortName` nằm trong danh sách được phép.
- Bỏ ảnh có `Restrictions` hoặc có chữ "watermark" trong mô tả.

**Ghi lại:**
- Tải 3–4 ứng viên cho mỗi vai trò vào `scripts/.photo-candidates/<slug>/`.
- Ghi `candidates.json` gồm: tiêu đề, tác giả (`Artist`, bỏ thẻ HTML), giấy phép, `LicenseUrl`, link trang gốc (`descriptionurl`), kích thước.

**Lịch sự với Commons:**
- Header `User-Agent: BioNexusStudentProject/1.0 (<email liên hệ của chủ dự án>)`.
- Tối đa 1 request mỗi giây, có thử lại khi gặp 429.

### 3.3 Chọn ảnh

Agent mở các ứng viên, xem bằng mắt, chọn ảnh tốt nhất cho từng vai trò rồi ghi vào `scripts/photo-selection.json`. Mỗi ảnh có:
- `focus`: điểm lấy nét, ví dụ "60% 45%".
- `alt`: mô tả ngắn, tiếng Việt.
- `flip`: true hoặc false.

Ảnh bị loại thì ghi lý do (sai loài, mờ, có watermark…). **Chủ dự án duyệt lại** danh sách này ở Prompt 02.

### 3.4 `scripts/optimize-photos.mjs` (sharp)

- Mỗi ảnh xuất ra AVIF (q 55) và WebP (q 72) ở 3 cạnh dài 480, 960 và 1600 (hero thêm 2400), cộng một JPEG 1600 dự phòng.
- Tạo ảnh mờ tạm 16 px dạng base64 (hoặc blurhash).
- Đặt tên: `public/photos/<slug>/<role>-<n>-<w>.<ext>`.
- Sinh `src/content/photos.generated.ts`:

```ts
export const PHOTOS = {
  'axolotl/hero-1': {
    width: 2400, height: 1350, focus: '62% 50%', alt: 'Axolotl hồng nhạt dưới nước, nhìn nghiêng',
    sources: { avif: [...], webp: [...], jpg: '...' }, placeholder: 'data:image/webp;base64,…',
    credit: { author: '…', license: 'CC BY-SA 4.0', licenseUrl: '…', sourceUrl: 'https://commons.wikimedia.org/wiki/File:…', modified: true },
  },
} as const
```

## 4. Hiển thị

- `<Photo id="axolotl/hero-1" sizes="100vw" priority />`:
  - Tự dựng `<picture>`, `srcset`, ảnh mờ tạm, `objectPosition`, `alt`.
  - Ảnh chưa tải xong thì hiện lớp mờ, xong thì mờ dần sang ảnh thật (300 ms).
- `PhotoCredit`:
  - Desktop: chip "© Tác giả · CC BY-SA 4.0" hiện ở góc khi hover.
  - Mobile: nút "i" mở popover.
  - Ảnh nền to (hero, đăng nhập) luôn hiện chip ở góc dưới, chữ nhỏ.
- `/credits` liệt kê toàn bộ `PHOTOS`, nhóm theo loài.
- Ảnh cho cảnh 3D (chuỗi xoắn, marker) lấy bản WebP 960 hoặc 480.

## 5. Khi nối API thật

`SpeciesDto.imageURL` và `ProductDto.imageUrl` trong seed đang là URL giả (`https://bionexus.vn/images/...`). Giao diện **ưu tiên ảnh trong `content/photos`** (tra theo `scientificName` và tên sản phẩm). Chỉ dùng URL từ API khi đó là URL thật và tải được. Có thể kiểm tra trước bằng `HEAD` request, hoặc chỉ dùng khi URL bắt đầu bằng đường dẫn `images/` cùng nguồn với trang. Ghi rõ trong HANDOFF: chủ dự án nên chép ảnh đã tối ưu sang `backend/src/main/webapp/images/` và sửa `imageUrl` trong seed (PLAN, Ngày 2).
