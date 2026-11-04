#!/usr/bin/env node
/**
 * scripts/build-trip-hires.mjs
 * Ảnh Hành trình 9 loài hiển thị tràn màn hình nhưng bản "gốc" trong docs/frontend/reference/trip-photos chỉ rộng 1920px
 * và đã nén mạnh, nén thêm lần nữa nên bị mờ. Script tải lại file gốc từ Wikimedia Commons (theo credits.json, cùng tác giả,
 * cùng giấy phép, cùng khung hình) rồi xuất lại với chất lượng cao hơn và thêm cỡ 2560px cho màn lớn hoặc màn mật độ cao:
 * - public/trip/<key>-{960,1600,1920,2560}.{avif,webp}
 * - public/trip/<key>.webp (1920px, ảnh dự phòng cho <img src>)
 * File gốc lưu tạm ở thư mục tạm của hệ điều hành, không đưa vào repo. Dùng: node scripts/build-trip-hires.mjs [key ...]
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_DIR = path.resolve(__dirname, '..');
const CREDITS = path.join(FRONTEND_DIR, '..', 'docs', 'frontend', 'reference', 'trip-photos', 'credits.json');
const OUT_DIR = path.join(FRONTEND_DIR, 'public', 'trip');
const CACHE_DIR = path.join(os.tmpdir(), 'bionexus-trip-originals');
const USER_AGENT = 'BioNexusStudentProject/1.0 (Aptech 2026; trip photo pipeline)';
const WIDTHS = [960, 1600, 1920, 2560];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchRetry(url, init = {}) {
  for (let attempt = 0, delay = 3000; attempt < 5; attempt++, delay *= 2) {
    const res = await fetch(url, { ...init, headers: { 'User-Agent': USER_AGENT, ...(init.headers ?? {}) } });
    if (res.ok) return res;
    if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status} ${url}`);
    // Tôn trọng Retry-After của Wikimedia khi bị giới hạn tốc độ (tối đa 2 phút mỗi lần)
    const retryAfter = Number(res.headers.get('retry-after'));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter * 1000, 120000) : delay);
  }
  throw new Error(`hết lượt thử ${url}`);
}

// Ảnh thay thế cho ảnh gốc kém (credits.json trong docs giữ nguyên). Ghi nguồn tương ứng sửa trong src/content/photos.ts
const REPLACEMENTS = {
  // Ảnh cũ trời âm u, thuyền nhỏ giữa khung nên mờ khi tràn màn hình; ảnh mới: ngã ba sông Tembeling và Jelai, bến vào Taman Negara
  boat: {
    title: 'Kuala Tembeling 3.jpg',
    author: 'Slleong',
    license: 'CC0',
    source: 'https://commons.wikimedia.org/wiki/File:Kuala_Tembeling_3.jpg',
  },
};
const credits = { ...JSON.parse(fs.readFileSync(CREDITS, 'utf8')), ...REPLACEMENTS };
const only = process.argv.slice(2);
const keys = Object.keys(credits).filter((k) => only.length === 0 || only.includes(k));
fs.mkdirSync(CACHE_DIR, { recursive: true });

// Một lượt API lấy link file gốc và kích thước của mọi ảnh
const titleOf = (k) => 'File:' + decodeURIComponent(credits[k].source.split('/File:')[1]).replace(/_/g, ' ');
const body = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', prop: 'imageinfo', iiprop: 'url|size', titles: keys.map(titleOf).join('|') });
const api = await (await fetchRetry('https://commons.wikimedia.org/w/api.php', { method: 'POST', body })).json();
const normalized = new Map((api.query.normalized ?? []).map((n) => [n.to, n.from]));
const info = new Map(api.query.pages.map((p) => [normalized.get(p.title) ?? p.title, p.imageinfo?.[0]]));

let totalBytes = 0;
const failed = [];
for (const key of keys) {
  const ii = info.get(titleOf(key));
  if (!ii) { console.warn(`[thiếu] ${key}`); continue; }
  const cached = path.join(CACHE_DIR, `${key}${path.extname(new URL(ii.url).pathname).toLowerCase() || '.jpg'}`);
  if (!fs.existsSync(cached)) {
    try {
      fs.writeFileSync(cached, Buffer.from(await (await fetchRetry(ii.url)).arrayBuffer()));
    } catch (e) {
      // Bị giới hạn tốc độ thì bỏ qua ảnh này, chạy lại script với tên ảnh sau
      console.warn(`[lỗi tải] ${key}: ${e.message.slice(0, 80)}`);
      failed.push(key);
      continue;
    }
    // Commons giới hạn tốc độ tải file gốc khá chặt
    await sleep(12000);
  }
  const src = sharp(cached, { limitInputPixels: false }).rotate();
  for (const w of WIDTHS) {
    const width = Math.min(w, ii.width);
    // Làm nét nhẹ sau khi thu nhỏ để bù độ mềm của lanczos
    const base = src.clone().resize({ width, withoutEnlargement: true, kernel: 'lanczos3' }).sharpen({ sigma: 0.6 });
    const webp = await base.clone().webp({ quality: 82, effort: 5 }).toFile(path.join(OUT_DIR, `${key}-${w}.webp`));
    const avif = await base.clone().avif({ quality: 58, effort: 4 }).toFile(path.join(OUT_DIR, `${key}-${w}.avif`));
    totalBytes += webp.size + avif.size;
  }
  const fallback = await src.clone().resize({ width: Math.min(1920, ii.width), withoutEnlargement: true, kernel: 'lanczos3' }).sharpen({ sigma: 0.6 }).webp({ quality: 82, effort: 5 }).toFile(path.join(OUT_DIR, `${key}.webp`));
  totalBytes += fallback.size;
  console.log(`${key.padEnd(12)} gốc ${ii.width}x${ii.height}`);
}
console.log(`Xong ${keys.length - failed.length}/${keys.length} ảnh, tổng ${(totalBytes / 1048576).toFixed(1)} MB${failed.length ? `. Chạy lại: node scripts/build-trip-hires.mjs ${failed.join(' ')}` : ''}`);
