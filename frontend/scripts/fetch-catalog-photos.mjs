#!/usr/bin/env node
/**
 * scripts/fetch-catalog-photos.mjs
 * Tải 2 ảnh cho mỗi loài catalog (hero + portrait) từ Wikimedia Commons, chuyển sang webp một cỡ:
 * - public/photos/c/<slug>/hero.webp      rộng 1280, giữ tỉ lệ gốc
 * - public/photos/c/<slug>/portrait.webp  cắt 4:5, 640×800
 * Ghi nguồn vào catalog/_photos-manifest.json (tác giả, giấy phép, link gốc, màu nền) để build-catalog.mjs sinh credit.
 * Chỉ một cỡ mỗi ảnh vì bản build nhúng vào WAR và ảnh nằm trong git (chủ dự án chọn 2 ảnh mỗi loài, khoảng 130 MB).
 * Chạy lại an toàn: ảnh đã có trong manifest thì bỏ qua. Dùng: node scripts/fetch-catalog-photos.mjs [--limit N]
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
const USER_AGENT = 'BioNexusStudentProject/1.0 (Aptech 2026; photo pipeline)';
const RATE_LIMIT_MS = 1100;
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;

const SPECS = {
  hero: { width: 1280, quality: 68 },
  portrait: { width: 640, height: 800, quality: 72 },
};
const ALLOWED = /^(cc0|cc-zero|public domain|pd|cc by(-sa)? \d(\.\d)?)/i;

const slugOf = (sci) => sci.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;
async function fetchThrottled(url) {
  const wait = RATE_LIMIT_MS - (Date.now() - last);
  if (wait > 0) await sleep(wait);
  last = Date.now();
  for (let attempt = 0, delay = 3000; attempt < 5; attempt++, delay *= 2) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (res.status === 429 || res.status >= 500) { await sleep(delay); continue; }
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
const files = fs.readdirSync(CATALOG_DIR).filter((f) => /^(0\d|1[01])-[a-z]\.json$/.test(f)).sort();
const species = files.flatMap((f) => JSON.parse(fs.readFileSync(path.join(CATALOG_DIR, f), 'utf8')));

let done = 0;
let failed = 0;
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
      const spec = SPECS[role];
      const buf = await fetchThrottled(thumbUrl(photo.file, spec.width));
      fs.mkdirSync(path.join(OUT_DIR, slug), { recursive: true });
      let img = sharp(buf).rotate();
      const meta = await img.metadata();
      // Portrait cắt về 4:5: ảnh gốc khác tỉ lệ đó thì coi là đã chỉnh sửa (CC BY-SA bắt buộc ghi)
      const cropped = role === 'portrait' && Math.abs(meta.width / meta.height - 0.8) > 0.02;
      img = role === 'portrait'
        ? img.resize(spec.width, spec.height, { fit: 'cover', position: sharp.strategy.attention })
        : img.resize({ width: spec.width, withoutEnlargement: true });
      const out = path.join(OUT_DIR, slug, `${role}.webp`);
      const info = await img.webp({ quality: spec.quality }).toFile(out);
      const { dominant } = await sharp(out).stats();
      entry[role] = {
        file: photo.file,
        src: `photos/c/${slug}/${role}.webp`,
        width: info.width,
        height: info.height,
        bytes: info.size,
        color: `#${[dominant.r, dominant.g, dominant.b].map((v) => v.toString(16).padStart(2, '0')).join('')}`,
        author: photo.author,
        license: photo.license,
        licenseUrl: photo.licenseUrl,
        sourceUrl: photo.pageUrl,
        modified: cropped || undefined,
      };
      done++;
      if (done % 25 === 0) {
        fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
        console.log(`... ${done} ảnh`);
      }
    } catch (e) {
      failed++;
      console.warn(`[lỗi] ${s.scientificName} ${role}: ${e.message}`);
    }
  }
}
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1));
const total = Object.values(manifest).reduce((n, m) => n + (m.hero?.bytes ?? 0) + (m.portrait?.bytes ?? 0), 0);
console.log(`Xong: ${done} ảnh mới, ${failed} lỗi. Tổng dung lượng ảnh catalog: ${(total / 1048576).toFixed(1)} MB`);
