#!/usr/bin/env node
/**
 * scripts/fetch-catalog-photos.mjs
 * Tải 2 ảnh cho mỗi loài catalog (hero + portrait) từ Wikimedia Commons, chuyển sang webp một cỡ:
 * - public/photos/c/<slug>/hero.webp      rộng 1280, giữ tỉ lệ gốc
 * - public/photos/c/<slug>/portrait.webp  cắt 4:5, 640×800
 * - public/photos/p/<loài>--<giống>.webp  ảnh riêng của sản phẩm có ảnh (nhóm 13 thú cưng), cắt 4:5, 720×900
 * Ghi nguồn vào catalog/_photos-manifest.json và _product-photos-manifest.json (tác giả, giấy phép, link gốc, màu nền)
 * để build-catalog.mjs sinh credit.
 * Chỉ một cỡ mỗi ảnh vì bản build nhúng vào WAR và ảnh nằm trong git (chủ dự án chọn 2 ảnh mỗi loài, khoảng 130 MB).
 * Chạy lại an toàn: ảnh đã có trong manifest thì bỏ qua. Dùng: node scripts/fetch-catalog-photos.mjs [--limit N] [--group NN]
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(__dirname, '..');
const CATALOG_DIR = path.join(FRONTEND_DIR, 'catalog');
const OUT_DIR = path.join(FRONTEND_DIR, 'public', 'photos', 'c');
const MANIFEST = path.join(CATALOG_DIR, '_photos-manifest.json');
const PRODUCT_MANIFEST = path.join(CATALOG_DIR, '_product-photos-manifest.json');
const USER_AGENT = 'BioNexusStudentProject/1.0 (Aptech 2026; photo pipeline)';
const RATE_LIMIT_MS = 1100;
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;
// --group 13: chỉ tải một nhóm, để ảnh lỗi cũ của nhóm khác (đang bị giới hạn tốc độ) không chặn nhóm mới
const groupArg = process.argv.indexOf('--group');
const GROUP = groupArg > 0 ? process.argv[groupArg + 1] : null;

const SPECS = {
  hero: { width: 1280, quality: 68 },
  portrait: { width: 640, height: 800, quality: 72 },
  // Ảnh sản phẩm (giống chó, mèo...): cắt 4:5 như thẻ sản phẩm, đủ nét cho trang chi tiết
  product: { width: 720, height: 900, quality: 72 },
};
const ALLOWED = /^(cc0|cc-zero|public domain|pd|cc by(-sa)? \d(\.\d)?)/i;

const slugOf = (sci) => sci.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
// Khoá ảnh sản phẩm: slug loài + slug giống bỏ dấu tiếng Việt (khớp scripts/build-catalog.mjs)
const asciiSlug = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const productKeyOf = (s, p) => `${slugOf(s.scientificName)}--${asciiSlug(p.breedEn || p.breedVi || p.nameVi)}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Ổ exFAT trên Windows thỉnh thoảng khoá file vừa ghi (lỗi UNKNOWN): thử lại vài lần thay vì dừng cả lượt tải
async function saveJson(file, data) {
  for (let attempt = 0; ; attempt++) {
    try {
      fs.writeFileSync(file, JSON.stringify(data, null, 1));
      return;
    } catch (e) {
      if (attempt >= 8) throw e;
      await sleep(500 * (attempt + 1));
    }
  }
}
let last = 0;
async function fetchThrottled(url) {
  const wait = RATE_LIMIT_MS - (Date.now() - last);
  if (wait > 0) await sleep(wait);
  last = Date.now();
  for (let attempt = 0, delay = 3000; attempt < 5; attempt++, delay *= 2) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (res.status === 429 || res.status >= 500) {
        // Tôn trọng Retry-After của Wikimedia (tối đa 2 phút mỗi lần), không có thì lùi dần
        const retryAfter = Number(res.headers.get('retry-after'));
        await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 120000) : delay);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return Buffer.from(await res.arrayBuffer());
    } catch (e) {
      if (attempt === 4) throw e;
      await sleep(delay);
    }
  }
  throw new Error('hết lượt thử');
}

// Lấy thumbnail cỡ chuẩn của Commons thay vì tải file gốc (có file vài chục MB)
const thumbUrl = (file, width) =>
  `https://commons.wikimedia.org/w/index.php?title=Special:FilePath/${encodeURIComponent(file.replace(/^File:/, ''))}&width=${width}`;

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
// Nhóm 12 là ảnh bổ sung cho 9 loài gốc, không phải loài catalog
const files = fs.readdirSync(CATALOG_DIR).filter((f) => /^(0\d|1[013])-[a-z]\.json$/.test(f) && (!GROUP || f.startsWith(`${GROUP}-`))).sort();
const species = files.flatMap((f) => JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, f), 'utf8')));

let done = 0;
let failed = 0;

// Tải một ảnh Commons, cắt theo SPECS[kind], ghi webp và trả về mục manifest (nguồn, giấy phép, màu nền)
async function download(photo, kind, relPath) {
  const spec = SPECS[kind];
  const buf = await fetchThrottled(thumbUrl(photo.file, spec.width));
  const out = path.join(FRONTEND_DIR, 'public', relPath);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  let img = sharp(buf).rotate();
  const meta = await img.metadata();
  // Ảnh cắt về 4:5: ảnh gốc khác tỉ lệ đó thì coi là đã chỉnh sửa (CC BY-SA bắt buộc ghi)
  const ratio = spec.height ? spec.width / spec.height : 0;
  const cropped = !!spec.height && Math.abs(meta.width / meta.height - ratio) > 0.02;
  if (spec.height && photo.focus) {
    // Điểm lấy nét chọn bằng mắt (x, y theo tỉ lệ 0..1): thuật toán attention hay bám vân gỗ, song lồng thay vì con vật
    const [fx, fy] = photo.focus;
    const w = meta.width, h = meta.height;
    const cw = w / h > ratio ? Math.round(h * ratio) : w;
    const ch = w / h > ratio ? h : Math.round(w / ratio);
    const left = Math.min(Math.max(Math.round(fx * w - cw / 2), 0), w - cw);
    const top = Math.min(Math.max(Math.round(fy * h - ch / 2), 0), h - ch);
    img = img.extract({ left, top, width: cw, height: ch }).resize(spec.width, spec.height);
  } else {
    img = spec.height
      ? img.resize(spec.width, spec.height, { fit: 'cover', position: sharp.strategy.attention })
      : img.resize({ width: spec.width, withoutEnlargement: true });
  }
  const info = await img.webp({ quality: spec.quality }).toFile(out);
  const { dominant } = await sharp(out).stats();
  done++;
  return {
    file: photo.file,
    src: relPath,
    width: info.width,
    height: info.height,
    bytes: info.size,
    color: `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`,
    author: photo.author,
    license: photo.license,
    licenseUrl: photo.licenseUrl,
    sourceUrl: photo.pageUrl,
    modified: cropped || undefined,
    focus: photo.focus,
  };
}

for (const s of species) {
  if (done >= LIMIT) break;
  const slug = slugOf(s.scientificName);
  const entry = (manifest[s.scientificName] ??= { slug });
  for (const role of ['hero', 'portrait']) {
    const photo = s.photos?.find((p) => p.role === role) ?? (role === 'portrait' ? s.photos?.find((p) => p.role === 'gallery' && p.height >= p.width) : undefined);
    if (!photo) { console.warn(`[thiếu ${role}] ${s.scientificName}`); continue; }
    if (entry[role]?.file === photo.file && fs.existsSync(path.join(OUT_DIR, slug, `${role}.webp`))) continue;
    if (!ALLOWED.test(photo.license ?? '')) { console.warn(`[giấy phép] ${s.scientificName}: ${photo.license}`); continue; }
    try {
      entry[role] = await download(photo, role, `photos/c/${slug}/${role}.webp`);
      // Ghi sau mỗi ảnh để dừng giữa chừng không mất ảnh đã tải
      await saveJson(MANIFEST, manifest);
      if (done % 25 === 0) console.log(`... ${done} ảnh`);
    } catch (e) {
      failed++;
      console.warn(`[lỗi] ${s.scientificName} ${role}: ${e.message}`);
    }
  }
}
await saveJson(MANIFEST, manifest);

// Ảnh riêng của từng sản phẩm (nhóm thú cưng: mỗi giống chó, mèo một ảnh) để các thẻ trên sàn không trùng ảnh loài
const productManifest = fs.existsSync(PRODUCT_MANIFEST) ? JSON.parse(fs.readFileSync(PRODUCT_MANIFEST, 'utf8')) : {};
for (const s of species) {
  for (const p of s.products ?? []) {
    if (done >= LIMIT) break;
    const photo = p.photos?.[0];
    if (!photo) continue;
    const key = productKeyOf(s, p);
    const same = productManifest[key]?.file === photo.file && String(productManifest[key]?.focus) === String(photo.focus);
    if (same && fs.existsSync(path.join(OUT_DIR, '..', 'p', `${key}.webp`))) continue;
    if (!ALLOWED.test(photo.license ?? '')) { console.warn(`[giấy phép] ${key}: ${photo.license}`); continue; }
    try {
      productManifest[key] = { productName: p.nameVi, ...(await download(photo, 'product', `photos/p/${key}.webp`)) };
      await saveJson(PRODUCT_MANIFEST, productManifest);
    } catch (e) {
      failed++;
      console.warn(`[lỗi] sản phẩm ${key}: ${e.message}`);
    }
  }
}
await saveJson(PRODUCT_MANIFEST, productManifest);

const sum = (m) => Object.values(m).reduce((n, x) => n + (x.hero?.bytes ?? 0) + (x.portrait?.bytes ?? 0) + (x.bytes ?? 0), 0);
console.log(`Xong: ${done} ảnh mới, ${failed} lỗi. Ảnh catalog: ${(sum(manifest) / 1048576).toFixed(1)} MB, ảnh sản phẩm: ${(sum(productManifest) / 1048576).toFixed(1)} MB`);
