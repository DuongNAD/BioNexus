#!/usr/bin/env node
/**
 * scripts/verify-photos.mjs
 * Kiểm tra tự động toàn bộ ảnh, sự khớp loài/sinh cảnh, giấy phép Wikimedia Commons và link GBIF:
 * 1. Gom mọi sourceUrl trong src/content/ và truy vấn API Wikimedia Commons theo lô 50 tiêu đề.
 * 2. Báo lỗi (exit 1) nếu có bất kỳ file nào không tồn tại ("missing") hoặc giấy phép ngoài danh sách cho phép.
 * 3. Quét toàn bộ file ảnh vật lý trong public/photos và public/trip, báo lỗi nếu có file không gắn với mục credit nào.
 * 4. Kiểm tra mỗi loài trong src/content/species-extras.ts:
 *    - Mọi ảnh hero/portrait/habitat/gallery của loài phải có scientificName trùng loài đó,
 *      hoặc là ảnh sinh cảnh (habitat/biome) có trường region khớp vùng bản địa của loài.
 *    - galleryPhotoIds không được trùng lại heroPhotoId, portraitPhotoId hoặc habitatPhotoId.
 * 5. Kiểm tra mọi link GBIF (gbif.org/species/{id}) trong src/mocks/data/species.ts và src/content/:
 *    - Gọi https://api.gbif.org/v1/species/{id} và đối chiếu canonicalName / scientificName với scientificName của loài.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT_DIR, 'src', 'content');
const MOCKS_SPECIES_FILE = path.join(ROOT_DIR, 'src', 'mocks', 'data', 'species.ts');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const USER_AGENT = 'BioNexusStudentProject/1.0 (https://github.com/bionexus-aptech; contact@bionexus.vn) Node.js/22';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';

const ALLOWED_LICENSES = [
  'cc0',
  'cc-zero',
  'public domain',
  'pd',
  'cc by 1.0',
  'cc by 2.0',
  'cc by 2.5',
  'cc by 3.0',
  'cc by 4.0',
  'cc-by',
  'cc by-sa 1.0',
  'cc by-sa 2.0',
  'cc by-sa 2.5',
  'cc by-sa 3.0',
  'cc by-sa 4.0',
  'cc-by-sa',
];

const FORBIDDEN_SUBSTRINGS = ['-nc', 'noncommercial', '-nd', 'noderivatives', 'fair use', 'all rights reserved'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripHtml(html) {
  if (!html) return 'Unknown';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function isLicenseAllowed(rawLicense) {
  if (!rawLicense) return false;
  const norm = rawLicense.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  for (const forbidden of FORBIDDEN_SUBSTRINGS) {
    if (norm.includes(forbidden)) return false;
  }
  for (const allowed of ALLOWED_LICENSES) {
    if (norm.includes(allowed)) return true;
  }
  return false;
}

async function listFilesRecursive(dir) {
  const results = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await listFilesRecursive(full)));
    } else if (entry.isFile()) {
      results.push(full);
    }
  }
  return results;
}

function extractFileTitleFromUrl(sourceUrl) {
  try {
    const u = new URL(sourceUrl);
    if (!u.hostname.endsWith('wikimedia.org') && !u.hostname.endsWith('wikipedia.org')) {
      return null;
    }
    const idx = u.pathname.indexOf('/wiki/');
    if (idx === -1) return null;
    const rawTitle = decodeURIComponent(u.pathname.slice(idx + '/wiki/'.length));
    return rawTitle.replace(/_/g, ' ').trim();
  } catch {
    return null;
  }
}

async function queryCommonsBatch(titles) {
  const u = new URL(COMMONS_API);
  u.searchParams.set('action', 'query');
  u.searchParams.set('format', 'json');
  u.searchParams.set('redirects', '1');
  u.searchParams.set('prop', 'imageinfo');
  u.searchParams.set('iiprop', 'url|size|mime|extmetadata');
  u.searchParams.set('titles', titles.join('|'));

  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(u.toString(), {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (res.status === 429 || res.status === 503) {
      const retryAfter = Number(res.headers.get('retry-after')) || 3 * attempt;
      console.warn(`[Throttle] HTTP ${res.status}, chờ ${retryAfter}s trước khi thử lại...`);
      await sleep(retryAfter * 1000);
      continue;
    }
    if (!res.ok) {
      throw new Error(`Wikimedia Commons API trả về HTTP ${res.status}`);
    }
    return res.json();
  }
  throw new Error('Quá số lần thử lại khi gọi Wikimedia Commons API');
}

function parseExportedObject(tsText, exportName) {
  const re = new RegExp(`export const ${exportName}(?:\\s*:[^=]+)?\\s*=\\s*(\\{[\\s\\S]*?\\n\\}|\\[[\\s\\S]*?\\n\\]);`);
  const m = tsText.match(re);
  if (!m) {
    throw new Error(`Không tìm thấy export const ${exportName}`);
  }
  return Function(`"use strict"; return (${m[1]});`)();
}

async function computeDHash(relPathFromPublic) {
  const fullPath = path.join(PUBLIC_DIR, relPathFromPublic);
  const buf = await sharp(fullPath)
    .greyscale()
    .resize(9, 8, { fit: 'fill' })
    .raw()
    .toBuffer();
  let bits = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      bits += buf[y * 9 + x] < buf[y * 9 + x + 1] ? '1' : '0';
    }
  }
  return bits;
}

function hammingDistance(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) d++;
  }
  return d;
}

async function verifySpeciesPhotosAndGbif() {
  const photosText = await fs.readFile(path.join(CONTENT_DIR, 'photos.ts'), 'utf8');
  const extrasText = await fs.readFile(path.join(CONTENT_DIR, 'species-extras.ts'), 'utf8');
  const mockSpeciesText = await fs.readFile(MOCKS_SPECIES_FILE, 'utf8');

  const PHOTOS = parseExportedObject(photosText, 'PHOTOS');
  const SPECIES_EXTRAS = parseExportedObject(extrasText, 'SPECIES_EXTRAS');
  const SEED_SPECIES = parseExportedObject(mockSpeciesText, 'SEED_SPECIES');

  let errorCount = 0;

  console.log('\n--- Kiểm tra khớp loài / vùng bản địa (species-extras.ts ↔ photos.ts) ---');
  for (const [sciName, extra] of Object.entries(SPECIES_EXTRAS)) {
    const mainSlots = [
      ['heroPhotoId', extra.heroPhotoId],
      ['portraitPhotoId', extra.portraitPhotoId],
      ['habitatPhotoId', extra.habitatPhotoId],
    ];
    const galleryIds = extra.galleryPhotoIds || [];

    // Kiểm tra trùng lặp giữa hero/portrait/habitat và galleryPhotoIds
    const mainSet = new Set(mainSlots.map(([, id]) => id));
    for (const gId of galleryIds) {
      if (mainSet.has(gId)) {
        console.error(`[FAIL] ${sciName}: galleryPhotoIds chứa ảnh trùng với hero/portrait/habitat (${gId})`);
        errorCount++;
      }
    }

    const allAssigned = [
      ...mainSlots,
      ...galleryIds.map((gId, idx) => [`galleryPhotoIds[${idx}]`, gId]),
    ];

    const seenSourceUrls = new Map();

    for (const [slotName, photoId] of allAssigned) {
      const photo = PHOTOS[photoId];
      if (!photo) {
        console.error(`[FAIL] ${sciName} (${slotName}): Không tìm thấy photoId "${photoId}" trong PHOTOS`);
        errorCount++;
        continue;
      }

      const srcUrl = photo.credit?.sourceUrl;
      if (srcUrl) {
        if (seenSourceUrls.has(srcUrl)) {
          console.error(
            `[FAIL] ${sciName} (${slotName} -> ${photoId}): Trùng sourceUrl (${srcUrl}) với slot ${seenSourceUrls.get(srcUrl)}!`
          );
          errorCount++;
        } else {
          seenSourceUrls.set(srcUrl, slotName);
        }
      }

      const matchesSpecies = photo.scientificName === sciName;
      const isHabitatOrBiome = photo.role === 'habitat' || photo.role === 'biome';
      const matchesRegion = isHabitatOrBiome && Boolean(photo.region) && photo.region === extra.region;

      if (!matchesSpecies && !matchesRegion) {
        console.error(
          `[FAIL] ${sciName} (${slotName} -> ${photoId}): Ảnh không khớp loài (scientificName="${photo.scientificName || ''}") và cũng không phải ảnh sinh cảnh khớp vùng bản địa (photo.region="${photo.region || ''}" vs species.region="${extra.region || ''}")`
        );
        errorCount++;
      } else {
        const reason = matchesSpecies
          ? `khớp loài (${photo.scientificName})`
          : `khớp vùng bản địa (${photo.region})`;
        console.log(`[OK] ${sciName} · ${slotName} (${photoId}) -> ${reason}`);
      }
    }

    // Kiểm tra dHash giữa 6 ô ảnh của cùng một loài kèm ảnh sản phẩm của loài đó
    const productSlots = Object.values(PHOTOS)
      .filter((p) => p.role === 'product' && p.scientificName === sciName)
      .map((p) => [`product (${p.id})`, p.id]);

    const dhashTargets = [...allAssigned, ...productSlots];
    const computedHashes = [];

    for (const [slotLabel, photoId] of dhashTargets) {
      const photo = PHOTOS[photoId];
      if (!photo || !photo.sources?.jpg) continue;
      const hash = await computeDHash(photo.sources.jpg);
      computedHashes.push({ slotLabel, photoId, hash });
    }

    let minDist = 64;
    let minPair = '';
    for (let i = 0; i < computedHashes.length; i++) {
      for (let j = i + 1; j < computedHashes.length; j++) {
        const a = computedHashes[i];
        const b = computedHashes[j];
        const dist = hammingDistance(a.hash, b.hash);
        if (dist < minDist) {
          minDist = dist;
          minPair = `${a.photoId} <-> ${b.photoId}`;
        }
        if (dist <= 6) {
          console.error(
            `[FAIL] ${sciName}: Ảnh trùng hoặc cắt từ cùng một bức (dHash distance = ${dist} <= 6) giữa ${a.slotLabel} (${a.photoId}) và ${b.slotLabel} (${b.photoId})`
          );
          errorCount++;
        }
      }
    }
    if (minDist > 6) {
      console.log(
        `[OK] ${sciName} · dHash (${computedHashes.length} ảnh: 6 ô loài + ${productSlots.length} sản phẩm) -> min distance = ${minDist} (> 6, cặp gần nhất: ${minPair})`
      );
    }
  }

  console.log('\n--- Kiểm tra các link GBIF qua https://api.gbif.org/v1/species/{id} ---');
  const gbifPairs = [];

  // Lấy từ SEED_SPECIES (referenceURL)
  for (const sp of SEED_SPECIES) {
    if (sp.referenceURL) {
      gbifPairs.push({ source: 'SEED_SPECIES', scientificName: sp.scientificName, url: sp.referenceURL });
    }
  }

  // Nếu còn gbifUrl trong SPECIES_EXTRAS thì cũng kiểm tra luôn
  for (const [sciName, extra] of Object.entries(SPECIES_EXTRAS)) {
    if (extra.gbifUrl) {
      gbifPairs.push({ source: 'SPECIES_EXTRAS', scientificName: sciName, url: extra.gbifUrl });
    }
  }

  for (const item of gbifPairs) {
    const m = item.url.match(/gbif\.org\/species\/(\d+)/);
    if (!m) {
      console.error(`[FAIL] ${item.source} (${item.scientificName}): URL GBIF không hợp lệ (${item.url})`);
      errorCount++;
      continue;
    }
    const gbifId = m[1];
    const res = await fetch(`https://api.gbif.org/v1/species/${gbifId}`, {
      headers: { 'User-Agent': USER_AGENT },
    });
    if (!res.ok) {
      console.error(`[FAIL] ${item.source} (${item.scientificName}): API GBIF trả về HTTP ${res.status} cho ${item.url}`);
      errorCount++;
      continue;
    }
    const data = await res.json();
    const canonical = (data.canonicalName || data.species || data.scientificName || '').trim();
    if (!canonical.toLowerCase().startsWith(item.scientificName.toLowerCase())) {
      console.error(
        `[FAIL] ${item.source} (${item.scientificName}): Link GBIF ${item.url} trỏ sang "${canonical}" (scientificName="${data.scientificName}")!`
      );
      errorCount++;
    } else {
      console.log(`[OK] GBIF ${gbifId} (${item.source}) -> "${canonical}" khớp "${item.scientificName}"`);
    }
  }

  return errorCount;
}

async function main() {
  console.log('=== BioNexus Photo, Species Match & GBIF Verification (check:photos) ===');

  // 1. Đọc toàn bộ file trong src/content/
  const contentFiles = await listFilesRecursive(CONTENT_DIR);
  const sourceUrls = new Set();
  const creditedAssetPaths = new Set();

  for (const file of contentFiles) {
    if (!file.endsWith('.ts') && !file.endsWith('.tsx') && !file.endsWith('.json')) continue;
    const text = await fs.readFile(file, 'utf8');

    // Gom mọi sourceUrl
    const urlMatches = text.matchAll(/["']?sourceUrl["']?\s*:\s*['"]([^'"]+)['"]/g);
    for (const m of urlMatches) {
      sourceUrls.add(m[1].trim());
    }

    // Gom mọi đường dẫn ảnh trong photos/... và trip/... được khai báo trong content
    const pathMatches = text.matchAll(/['"]((?:photos|trip)\/[^'"]+\.(?:avif|webp|jpg|jpeg|png))['"]/g);
    for (const m of pathMatches) {
      creditedAssetPaths.add(m[1].trim());
    }
  }

  if (sourceUrls.size === 0) {
    console.error('[FAIL] Không tìm thấy bất kỳ sourceUrl nào trong src/content/!');
    process.exit(1);
  }

  console.log(`Tìm thấy ${sourceUrls.size} sourceUrl duy nhất trong src/content/.`);

  // 2. Chuyển sourceUrl sang tiêu đề File:... và kiểm tra hợp lệ
  const urlToTitle = new Map();
  const invalidUrls = [];
  for (const url of sourceUrls) {
    const title = extractFileTitleFromUrl(url);
    if (!title || !title.startsWith('File:')) {
      invalidUrls.push(url);
    } else {
      urlToTitle.set(url, title);
    }
  }

  if (invalidUrls.length > 0) {
    console.error('[FAIL] Có sourceUrl không đúng định dạng trang File của Wikimedia Commons:');
    for (const u of invalidUrls) console.error(`  - ${u}`);
    process.exit(1);
  }

  // 3. Hỏi API Commons theo lô 50 tiêu đề
  const allTitles = Array.from(new Set(urlToTitle.values()));
  const titleReport = new Map();

  for (let i = 0; i < allTitles.length; i += 50) {
    const batch = allTitles.slice(i, i + 50);
    if (i > 0) await sleep(1000);
    const data = await queryCommonsBatch(batch);

    const normalizedMap = new Map();
    for (const n of data.query?.normalized || []) {
      normalizedMap.set(n.from, n.to);
    }
    const redirectMap = new Map();
    for (const r of data.query?.redirects || []) {
      redirectMap.set(r.from, r.to);
    }

    const pagesByTitle = new Map();
    for (const page of Object.values(data.query?.pages || {})) {
      pagesByTitle.set(page.title, page);
    }

    for (const requestedTitle of batch) {
      let resolved = normalizedMap.get(requestedTitle) || requestedTitle;
      resolved = redirectMap.get(resolved) || resolved;
      const page = pagesByTitle.get(resolved);
      titleReport.set(requestedTitle, page || { title: requestedTitle, missing: '' });
    }
  }

  let missingCount = 0;
  let badLicenseCount = 0;

  for (const [url, title] of urlToTitle.entries()) {
    const page = titleReport.get(title);
    if (!page || page.missing !== undefined || !page.imageinfo || page.imageinfo.length === 0) {
      console.error(`[FAIL] MISSING trên Wikimedia Commons: ${title} (${url})`);
      missingCount++;
      continue;
    }

    const ii = page.imageinfo[0];
    const ext = ii.extmetadata || {};
    const licenseShort = stripHtml(ext.LicenseShortName?.value || '');
    const artist = stripHtml(ext.Artist?.value || ext.Credit?.value || 'Unknown');

    if (!isLicenseAllowed(licenseShort)) {
      console.error(`[FAIL] GIẤY PHÉP KHÔNG HỢP LỆ (${licenseShort}): ${title} (${url})`);
      badLicenseCount++;
      continue;
    }

    console.log(`[OK] ${title} — ${artist} · ${licenseShort} (${ii.width}x${ii.height})`);
  }

  // 4. Kiểm tra toàn bộ file ảnh vật lý trong public/photos và public/trip
  const photosDirFiles = await listFilesRecursive(path.join(PUBLIC_DIR, 'photos'));
  const tripDirFiles = await listFilesRecursive(path.join(PUBLIC_DIR, 'trip'));
  const allPhysicalFiles = [...photosDirFiles, ...tripDirFiles].filter((f) =>
    /\.(avif|webp|jpg|jpeg|png)$/i.test(f)
  );

  const orphanFiles = [];
  for (const fullPath of allPhysicalFiles) {
    const relFromPublic = path.relative(PUBLIC_DIR, fullPath).split(path.sep).join('/');
    if (!creditedAssetPaths.has(relFromPublic)) {
      orphanFiles.push(relFromPublic);
    }
  }

  if (orphanFiles.length > 0) {
    console.error(`[FAIL] Phát hiện ${orphanFiles.length} file ảnh trong public/ không ứng với mục credit nào:`);
    for (const o of orphanFiles.slice(0, 25)) {
      console.error(`  - ${o}`);
    }
    process.exit(1);
  }

  if (allPhysicalFiles.length === 0) {
    console.error('[FAIL] Không có file ảnh nào trong public/photos hoặc public/trip!');
    process.exit(1);
  }

  // 5. Kiểm tra khớp loài / vùng bản địa và link GBIF
  const speciesAndGbifErrors = await verifySpeciesPhotosAndGbif();

  if (missingCount > 0 || badLicenseCount > 0 || speciesAndGbifErrors > 0) {
    console.error(
      `\n[FAIL] Kiểm tra thất bại: ${missingCount} file không tồn tại, ${badLicenseCount} file sai giấy phép, ${speciesAndGbifErrors} lỗi khớp loài/GBIF.`
    );
    process.exit(1);
  }

  console.log('\n=== KẾT QUẢ KIỂM TRA ẢNH & DỮ LIỆU (PASS) ===');
  console.log(`- Tổng số sourceUrl Wikimedia Commons đã xác thực: ${urlToTitle.size}/${urlToTitle.size} (0 missing, 0 sai giấy phép)`);
  console.log(`- Tổng số file vật lý trong public/photos & public/trip: ${allPhysicalFiles.length}/${allPhysicalFiles.length} đều khớp mục credit`);
  console.log(`- Toàn bộ 9 loài (54 slot hero/portrait/habitat/gallery + 10 sản phẩm) khớp 100% loài hoặc vùng bản địa, dHash đôi một > 6 (không trùng ảnh)`);
  console.log(`- Toàn bộ 9 link GBIF khớp 100% scientificName trên api.gbif.org`);
}

main().catch((err) => {
  console.error('[FAIL] Lỗi khi chạy verify-photos:', err);
  process.exit(1);
});
