# 05 · 3D và chuyển động

Mọi cảnh 3D nằm trong `src/three/`. Code mẫu đã chạy ổn trong prototype nằm ở `reference/prototype-code.md`. Hãy đọc trước khi viết lại bằng TypeScript.

## 1. Khung chung

### 1.1 Mức chất lượng (`three/core/QualityProvider.tsx`)

| Mức | Khi nào | dpr | Hậu kỳ | Hạt (trang chủ) | Chuỗi xoắn |
|---|---|---|---|---|---|
| `high` | Apple Silicon, GPU rời (NVIDIA, AMD), Intel Iris Xe trở lên | [1, 2] | Bloom (mipmapBlur) + Vignette | 26.000 | 14 bậc, 28 ảnh |
| `medium` | Laptop iGPU cũ, máy tính bảng | [1, 1.5] | Bloom nhẹ hoặc tắt | 14.000 | 10 bậc |
| `low` | Điện thoại tầm trung, GPU yếu | 1 | Không | 8.000 | Thay bằng carousel |
| `static` | `prefers-reduced-motion`, không có WebGL2, SwiftShader hoặc llvmpipe, người dùng tự chọn | — | — | Ảnh poster | Ảnh poster |

**Cách nhận diện:**
- Đọc `WEBGL_debug_renderer_info` (`UNMASKED_RENDERER_WEBGL`), `navigator.hardwareConcurrency`, `navigator.deviceMemory`, kích thước màn hình và cờ giảm chuyển động.
- Khi đang chạy, dùng `PerformanceMonitor` của drei:
  - FPS trung bình < 45 trong 2 s thì hạ dpr, rồi tắt bloom.
  - FPS vẫn < 40 thì hạ một mức.
- Người dùng chọn tay ở footer hoặc DevPanel. Lựa chọn lưu trong `localStorage` và ưu tiên hơn mức tự nhận diện.

### 1.2 `SceneShell`

Lớp bọc chung cho mọi Canvas:

```tsx
<SceneShell poster="/posters/home-earth.webp" posterAlt="Hành tinh BioNexus với 9 điểm nơi bản địa" minTier="low" className="absolute inset-0">
  {(tier) => <HomeScene tier={tier} progress={progress} />}
</SceneShell>
```

- **Poster trước:** luôn render `<img>` poster trước. Canvas chỉ mount khi khối lọt vào màn hình (IntersectionObserver, `rootMargin: 200px`) **và** sau `requestIdleCallback`. Canvas vẽ xong khung đầu (`onCreated` + 1 frame) thì poster mờ đi trong 400 ms.
- **Ra khỏi màn hình:** cách hơn 1 màn hình thì unmount Canvas. Cảnh nặng không giữ GPU khi không ai nhìn.
- **Mức thấp:** `tier < minTier` hoặc `static` thì chỉ có poster.
- **Truy cập:** canvas gắn `aria-hidden`. Nội dung tương đương ở dạng chữ phải nằm cạnh trong DOM.

Ảnh poster được chụp tự động ở Prompt 15 (`scripts/shots.mjs --posters`).

### 1.3 Tiến độ cuộn cho khối dính

```ts
// three/core/useSectionProgress.ts: tiến độ 0..1 khi phần sticky chạy hết khối
export function useSectionProgress(ref: RefObject<HTMLElement>) {
  const progress = useRef(0)                       // cảnh 3D đọc ref này trong useFrame (không re-render)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => (progress.current = v))
  return { progress, scrollYProgress }             // scrollYProgress dùng cho chữ và chấm tiến độ (motion value)
}
```

- Lenis cuộn bằng `window.scroll` nên `useScroll` chạy đúng.
- **Không `setState` mỗi lần cuộn ở trang nặng.** Chữ chương, chấm tiến độ và panel dùng motion value (`useTransform`) hoặc chỉ `setState` khi chương thay đổi.

## 2. `ParticleMorph`: hạt biến hình (Q nâng cấp)

Mã nguồn tham khảo: `Genesis.jsx` trong `reference/prototype-code.md`.

### 2.1 API

```tsx
<ParticleMorph
  shapes={[galaxy, dnaHelix, leaf, earthSurface]}      // tối đa 5 hình; mỗi hình (i, n) => [x, y, z]
  palettes={[['#c4b5fd', '#5eead4'], ['#34d399', '#a7f3d0'], ['#4ade80', '#d9f99d'], 'earth']}
  progress={progressRef}                               // 0 → shapes.length - 1 (đã nhân sẵn)
  count={tier.particles}
  interactive                                          // đẩy hạt theo chuột + sóng khi bấm
  layout={(stage) => ({ x: stage < 3 ? 1.9 : 0.6, spin: stage < 2.5 })}  // vị trí và có tự xoay không theo chương
/>
```

### 2.2 Shader (giữ nguyên phần đã chạy tốt, viết lại cho tổng quát)

- **Thuộc tính:** `aPos0..aPos4` (vị trí của từng hình), `aColor` (bảng IUCN hoặc bảng earth), `aRand`, `aLand` (1 nếu là hạt lục địa ở hình địa cầu).
- **Đổi hình so le:** `t_k = smoothstep(clamp((uProgress - k) * 1.6 - aRand * 0.6, 0, 1))`, lần lượt `mix(...)` theo k. Hạt bắt đầu lệch nhau nên hình mới hiện ra như sóng.
- **Xoáy giữa chừng:** `mid = Σ sin(π · t_k)`, cộng thêm `swirl(pos, uTime) * mid * 0.6`. Đổi hình xong là hạt đứng yên lại.
- **Thở:** dao động 0,035 đơn vị theo `aRand`.
- **Đẩy theo chuột:**
  - `f = smoothstep(1.5, 0, |d.xy|) * uPush`.
  - `uPush` giảm về 0 nếu chuột đứng yên quá 1,2 s, để hình không bị thủng một lỗ cố định (lỗi đã gặp trong prototype).
- **Sóng khi bấm:** vòng tròn lan với tốc độ 5 đơn vị/giây, tắt dần theo `exp(-1.2 · age)`, vừa đẩy hạt vừa làm sáng hạt.
- **Kích thước điểm:** `uSize * dpr * (0.5 + aRand) * twinkle / -mvPosition.z`. Hạt lục địa to hơn 1,4 lần.
- **Màu:**
  - Trộn theo chương bằng `uCA[k]`, `uCB[k]`. Hình cuối dùng `aColor`.
  - Hạt ở rìa mờ dần theo độ sâu: `clamp(1.5 - (-z - 6) * 0.15, 0.3, 1)`.
- **Hoà màu:** `AdditiveBlending`, `depthWrite: false`, `depthTest: true` (để lõi địa cầu che hạt phía sau). `frustumCulled = false`.
- **Fragment:** chấm tròn mềm `pow(smoothstep(0.5, 0, d), 1.6)`.

### 2.3 Các hình

| Hình | Cách tạo |
|---|---|
| `galaxy` | 3 nhánh xoắn ốc, 1/7 số hạt dồn vào lõi sáng, nghiêng 0,5 rad quanh trục x, bán kính 3,4 |
| `dnaHelix` | 2 sợi (bán kính 1,25, cao 7, 3,5 vòng) + các bậc liên kết. 1/3 số hạt nằm trên liên kết |
| `leaf` | Phiến lá có gân giữa, mép lượn, cong nhẹ theo z |
| `earthSurface` | Lấy từ `buildEarthPoints()` (mục 3.2): hạt lục địa trước, hạt biển sau. **Toạ độ trùng với lớp hạt của `BioEarth`** để chuyển sang địa cầu tương tác liền mạch |
| `text(word)` | Vẽ chữ lên canvas 2D (Be Vietnam Pro 700, **chờ `document.fonts.load` xong mới vẽ**), lấy mẫu pixel. Dùng cho chữ BIONEXUS ở footer và chữ "404" |

Hạt quay về mặt trước khi tới hình lá hoặc chữ: `rotation.y` tiến dần (damp) về bội số gần nhất của 2π, lá có thể đung đưa ±0,45 rad. Ở hình địa cầu thì `EarthController` (mục 3.4) điều khiển việc xoay.

**Nền sao:** 1.800 điểm, **chỉ đặt phía sau cảnh** (z từ -6 đến -28) và dùng texture tròn. Prototype từng có sao sát camera thành ô vuông to, phải tránh.

## 3. `BioEarth`: Hành tinh BioNexus (ghép địa cầu hạt và địa cầu vẽ)

**Ý tưởng:** quả địa cầu của mẫu K (cobe, chấm và nét) và hành tinh hạt của mẫu Q gộp làm một. Lớp hạt tạo khối và ánh sáng. Lớp nét vẽ (bờ biển, kinh vĩ tuyến) cho hình châu lục rõ ràng. Marker và cung sáng kể chuyện "gốc gác khắp thế giới, nhân giống tại Việt Nam".

### 3.1 Các lớp (từ trong ra ngoài, bán kính R = 2,2)

| Lớp | Cách làm | Ghi chú |
|---|---|---|
| **Lõi** | `sphereGeometry(R × 0.985, 96, 64)`, shader màu `#04100c`, viền fresnel `--accent-2` 25% | `depthWrite: true` để che hạt và nét ở mặt sau |
| **Hạt bề mặt** | Lấy từ `buildEarthPoints()`. Hạt lục địa: màu `mix(#6ee7b7, #d9f99d, noise)`, cỡ ×1.4, nổi cao 0,6% R. Hạt biển: chỉ giữ 18%, màu `#38bdf8` mờ 35%, cỡ ×0.6 | Cùng shader `ParticleMorph` (`aLand`) |
| **Bờ biển** | `world-atlas/land-110m.json` → `topojson.mesh` → các đường [lng, lat] → điểm 3D ở R × 1.003 → `LineSegments`. Shader có `uDraw` 0→1 để **tự vẽ dần** (thuộc tính `aT` là độ dài tích luỹ đã chuẩn hoá) | Màu `#a7f3d0`, mờ 55%, `toneMapped: false` để ăn bloom |
| **Kinh vĩ tuyến** | `d3.geoGraticule10()` → `LineSegments` ở R × 1.001 | Mờ 7%, vẽ dần cùng `uDraw` |
| **Khí quyển** | Cầu R × 1.15, `BackSide`, fresnel cộng sáng `--accent-2` → trong suốt | Tạo viền phát sáng như mẫu K |
| **Marker** | Mỗi loài một chấm màu IUCN, vòng xung toả ra (shader hoặc scale), cột sáng mảnh cao 0,25. Loài đang chọn có thêm `Html` của drei: ảnh nhỏ 64 px, tên, nơi bản địa | Mờ dần khi điểm quay ra mặt sau: `dot(normal, toCamera) < 0.1` |
| **Cung sáng** | Từ nơi bản địa tới shop đang bán loài đó (tài liệu 04 mục 7). Đường lớn (slerp giữa 2 vector đơn vị), nâng cao `0.15 + 0.35 · góc/π`. Dùng `TubeGeometry` mảnh hoặc `Line2` có dải sáng chạy dọc (`uDash` lặp 0→1) | Màu chuyển từ màu IUCN của loài sang `--accent`. Loài chưa có shop bán thì cung là nét đứt |
| **Vành quỹ đạo** (tuỳ chọn) | Vòng hạt mảnh nghiêng 0,38 rad như hình hành tinh trong prototype | Chỉ ở mức `high` |

### 3.2 Mặt nạ lục địa và điểm bề mặt (`three/earth/landMask.ts`, `geo.ts`)

```ts
const DEG = Math.PI / 180
export function latLngToVec3(lat: number, lng: number, r: number): [number, number, number] {
  const phi = (90 - lat) * DEG, theta = (lng + 180) * DEG
  return [-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta)]
}

// Vẽ lục địa (Natural Earth 1:110m, public domain) lên canvas equirectangular rồi đọc pixel
export async function buildLandMask(width = 1024) {
  const topo = (await import('world-atlas/land-110m.json')).default
  const land = feature(topo, topo.objects.land)
  const canvas = new OffscreenCanvas(width, width / 2), ctx = canvas.getContext('2d')!
  const projection = geoEquirectangular().fitSize([width, width / 2], { type: 'Sphere' })
  ctx.fillStyle = '#fff'; ctx.beginPath(); geoPath(projection, ctx)(land); ctx.fill()
  const { data } = ctx.getImageData(0, 0, width, width / 2)
  return (lat: number, lng: number) => {
    const x = Math.floor(((lng + 180) / 360) * width), y = Math.floor(((90 - lat) / 180) * (width / 2))
    return data[(y * width + x) * 4] > 127
  }
}
```

- `buildEarthPoints({ count, isLand })`:
  - Lấy mẫu cầu Fibonacci với số điểm gấp khoảng 2,2 lần `count`.
  - Giữ mọi điểm lục địa và 18% điểm biển, cắt còn đúng `count`.
  - Trả `Float32Array` vị trí + `Float32Array` aLand.
- Tính một lần rồi giữ trong module (memo). Có thể sinh sẵn bằng script `scripts/build-earth-points.mjs` thành file nhị phân nếu thấy chậm (mục tiêu < 60 ms).

### 3.3 Ở trang chủ: chuyển từ hạt sang địa cầu

1. Chương 0–2: `ParticleMorph` chạy thiên hà → ADN → lá như mẫu R.
2. Chương 3 (tiến độ 2→3): hạt bay về `earthSurface`. Nhờ trùng toạ độ nên khi tới 3.0, hạt **chính là** lớp bề mặt của địa cầu.
3. Tiến độ 3.0 → 3.3:
   - Lõi và khí quyển hiện dần (opacity).
   - `uDraw` bờ biển 0→1 (vẽ dần trong khoảng 1,2 s khi cuộn qua).
   - Marker nảy lên lần lượt, lệch nhau 80 ms.
4. Tiến độ 3.3 → 4.0 (phần dính thêm 300vh):
   - Chia đều cho 9 loài. Cuộn tới đâu thì `EarthController` xoay địa cầu tới loài đó và cung sáng của loài đó chạy.
   - Danh sách bên trái và thẻ ảnh bên phải cập nhật theo.
   - Bấm một loài trong danh sách thì nhảy tới đúng đoạn cuộn của loài đó (`lenis.scrollTo`).
5. Toàn bộ nằm trong **một Canvas** và một `group`. Lớp hạt và các lớp vẽ dùng chung hệ toạ độ.

### 3.4 `EarthController`

- **Xoay tới một điểm:** `qTarget = setFromUnitVectors(normalize(latLngToVec3(lat, lng, 1)), (0, 0.18, 1).normalize())`. Điểm cần xem sẽ nằm hơi cao hơn tâm.
- **Mỗi frame:** `quaternion.slerp(qTarget, 1 - exp(-4 · dt))`.
- **Kéo chuột** (pointer capture trên canvas): cộng thêm yaw và pitch tạm (pitch giới hạn ±0,6 rad). Thả chuột thì phần cộng thêm giảm dần về 0 trong 1,5 s nếu đang ở chế độ tự lấy nét.
- **Lăn chuột:** không zoom (để trang vẫn cuộn được).
- **Khi rảnh:** nếu không ở chế độ cuộn (trang Bách khoa, hồ sơ loài) thì tự đổi loài mỗi 5 s, dừng khi người dùng tương tác.
- **Biến thể nhỏ** (hồ sơ loài): 12.000 hạt, 1 marker, 1 cung, không có danh sách, camera gần hơn.

## 4. `HelixScene`: chuỗi xoắn ảnh loài (P)

Mã nguồn tham khảo: `Helix.jsx`.

- **Thông số:** `LEVELS = 14`, `R = 3.3`, `DY = 1.05`, `STEP = 0.62`, mỗi bậc 2 ảnh đối nhau. Đặt `group` lệch phải x = 2.4 để chừa chỗ cho chữ.
- **Ảnh:**
  - Dùng `Image` của drei với **ảnh thật cỡ 960 WebP**, bo góc 0,08. Ảnh đặt ở R + 0,75 để sợi sáng chạy phía sau ảnh.
  - Ảnh đang ở trước camera thì to lên và có màu. Các ảnh khác thang xám 55%.
  - Hover thì zoom 1,15.
- **Sợi:**
  - `TubeGeometry` theo `CatmullRomCurve3`, `#6ee7b7` / `#5eead4`, `toneMapped: false`.
  - Bloom (threshold 0,55) chỉ làm sáng sợi, không làm loá ảnh.
- **Camera:** y đi theo tiến độ cuộn, x lệch theo chuột 0,8. Có sương mù (fog) 11–24 và hạt lấp lánh (`Sparkles`) 260.
- **Loài đang xem:** ảnh có z thế giới lớn nhất trong khoảng `|y - camY| < DY × 0.9`. Hàm `onActive(index)` chỉ gọi khi loài đổi.
- **Ảnh tải sau:** ảnh nằm trong `Suspense` riêng để sợi hiện trước. Lấy trước (preload) texture lúc trình duyệt rảnh khi người dùng còn ở khối trên.
- **Mức `low` hoặc mobile:** thay bằng carousel thẻ loài ngang có snap. Thẻ loài và panel dùng chung component với bản 3D.

## 5. Mẫu chuyển động DOM

| Mẫu | Component | Thông số |
|---|---|---|
| ZoomReveal | `motion/ZoomReveal` | Khối 280vh. `clipPath: inset(i% i·1.25% round r)` với i: 28→0 và r: 40→0 trong khoảng tiến độ 0→0.55. Ảnh scale 1.25→1. Chữ y 60→0 và opacity 0→1 ở tiến độ 0.45→0.75. Câu dẫn mờ dần ở 0→0.2 |
| StickySteps | `motion/StickySteps` | Mỗi bước có `min-h-[78vh]`. Bước được kích hoạt khi chạm dải giữa màn hình (`useInView` với margin `-45% 0 -45% 0`). Panel dính `top-[14vh] h-[72vh]`, đổi nội dung bằng `AnimatePresence mode="wait"` với blur 6 px |
| BlurFade | `motion/BlurFade` | Xem tài liệu 02 mục 6 |
| MaskText | `motion/MaskText` | Tách theo dòng (không theo chữ cái, để tiếng Việt không vỡ dấu) |
| Ticker | `motion/Ticker` | Dùng `animate(from, to)` của Motion, **không dùng spring** (prototype từng dừng ở 24 thay vì 25) |
| AnimatedBeam | `components/motion/Beam` | SVG path cong giữa 2 phần tử, có gradient chạy dọc. Dùng ở cây phân loại và đường phân loại |
| FlyToCart | `motion/FlyToCart` | Bản sao ảnh bay theo đường bezier tới icon giỏ, 600 ms, rồi biến mất |
| Ken Burns + vòng tròn mở | `media/Slideshow` | Dùng ở trang đăng nhập: `clipPath: circle(0% → 150%)` 1,4 s `ease.inOut`, ảnh scale 1.3→1.1 |

## 6. Ngân sách hiệu năng cho 3D

- Ở mức `high` trên Apple Silicon: ≥ 58 FPS. Đo bằng `stats-gl` trong DevPanel.
- Mỗi lúc chỉ có **1 Canvas đang vẽ**. Trên trang chủ, khối hạt/địa cầu và khối chuỗi xoắn không bao giờ cùng mount.
- Texture: ảnh dùng cho 3D tối đa 960 px, có mipmap, `colorSpace = SRGBColorSpace`.
- Gỡ texture và geometry khi unmount (R3F tự gỡ phần do JSX tạo; phần tự `new` thì phải tự `dispose`).
- Không tạo object mới trong `useFrame`. Dùng `useMemo` cho Vector3 và Quaternion tạm.
- Chunk `three` tách riêng, chỉ tải ở các route: `/`, `/taxonomy` (chế độ 3D), `/species` (chế độ bản đồ), `/species/:id` (địa cầu mini), 404.
