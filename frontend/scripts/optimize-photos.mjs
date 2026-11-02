#!/usr/bin/env node
/**
 * scripts/optimize-photos.mjs
 * Pipeline tối ưu hóa và sinh tài nguyên ảnh BioNexus:
 * - Tự động đọc danh mục 45 ảnh từ src/content/photos.ts
 * - Khởi tạo đầy đủ 11 thư mục con trong public/photos/
 * - Hỗ trợ nén ảnh thô nếu có, hoặc tạo ảnh Bio-Luxury Vector chất lượng cao qua Sharp
 * - Xuất đủ 161 tệp chuẩn định dạng: AVIF (q55), WebP (q72), JPG (q80)
 * - Kiểm soát nghiêm ngặt ngân sách dung lượng thư mục <= 30 MB
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PHOTOS } from '../src/content/photos.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PHOTOS_DIR = path.join(ROOT_DIR, 'public', 'photos');
const RAW_DIR = path.join(__dirname, '.raw-photos');
const CANDIDATES_DIR = path.join(__dirname, '.photo-candidates');

const MAX_BUDGET_BYTES = 30 * 1024 * 1024; // 30 MB

const COLOR_THEMES = {
  'axolotl': { accent: '#2fe8b0', secondary: '#0ea5e9', bgStop: '#062820' },
  'nepenthes-rajah': { accent: '#ef4444', secondary: '#b91c1c', bgStop: '#2d0f0f' },
  'ball-python': { accent: '#eab308', secondary: '#ca8a04', bgStop: '#241a05' },
  'leopard-gecko': { accent: '#f59e0b', secondary: '#d97706', bgStop: '#271b07' },
  'venus-flytrap': { accent: '#10b981', secondary: '#ef4444', bgStop: '#142a1f' },
  'burmese-python': { accent: '#84cc16', secondary: '#65a30d', bgStop: '#1d2708' },
  'bearded-dragon': { accent: '#f97316', secondary: '#c2410c', bgStop: '#2b1406' },
  'hermann-tortoise': { accent: '#a3e635', secondary: '#4d7c0f', bgStop: '#1e280c' },
  'nepenthes-ampullaria': { accent: '#14b8a6', secondary: '#059669', bgStop: '#082522' },
  'products': { accent: '#38bdf8', secondary: '#6366f1', bgStop: '#0f172a' },
  'biome': { accent: '#06b6d4', secondary: '#3b82f6', bgStop: '#082032' },
};

function getTheme(id) {
  for (const [key, theme] of Object.entries(COLOR_THEMES)) {
    if (id.startsWith(key) || id.includes(key)) return theme;
  }
  return { accent: '#2fe8b0', secondary: '#10b981', bgStop: '#0c2e22' };
}

function renderSvgPlate({ width, height, title, scientificName, role, id, credit, theme }) {
  const safeTitle = (title || id).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeSci = (scientificName || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const author = credit?.author || 'BioNexus Curation';
  const license = credit?.license || 'CC BY-SA 4.0';
  const safeCredit = `${author} · ${license}`.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const minDim = Math.min(width, height);
  const ringR1 = Math.round(minDim * 0.35);
  const ringR2 = Math.round(minDim * 0.22);
  const glowR = Math.round(minDim * 0.45);

  const titleSize = Math.max(18, Math.min(42, Math.round(width / 32)));
  const sciSize = Math.max(12, Math.min(24, Math.round(width / 50)));

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#030807" />
        <stop offset="50%" stop-color="${theme.bgStop}" />
        <stop offset="100%" stop-color="#020504" />
      </linearGradient>
      <radialGradient id="glow" cx="62%" cy="48%" r="55%">
        <stop offset="0%" stop-color="${theme.accent}" stop-opacity="0.32" />
        <stop offset="50%" stop-color="${theme.secondary}" stop-opacity="0.12" />
        <stop offset="100%" stop-color="${theme.accent}" stop-opacity="0" />
      </radialGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1" />
      </pattern>
    </defs>

    <rect width="100%" height="100%" fill="url(#bg)" />
    <rect width="100%" height="100%" fill="url(#grid)" />
    <circle cx="${Math.round(width * 0.62)}" cy="${Math.round(height * 0.48)}" r="${glowR}" fill="url(#glow)" />

    <circle cx="${Math.round(width * 0.62)}" cy="${Math.round(height * 0.48)}" r="${ringR1}" fill="none" stroke="${theme.accent}" stroke-opacity="0.18" stroke-dasharray="8,6" stroke-width="1.5" />
    <circle cx="${Math.round(width * 0.62)}" cy="${Math.round(height * 0.48)}" r="${ringR2}" fill="none" stroke="${theme.secondary}" stroke-opacity="0.25" stroke-width="1.5" />

    <path d="M 24 50 L 24 24 L 50 24" fill="none" stroke="${theme.accent}" stroke-opacity="0.5" stroke-width="2" />
    <path d="M ${width - 50} 24 L ${width - 24} 24 L ${width - 24} 50" fill="none" stroke="${theme.accent}" stroke-opacity="0.5" stroke-width="2" />
    <path d="M 24 ${height - 50} L 24 ${height - 24} L 50 ${height - 24}" fill="none" stroke="${theme.accent}" stroke-opacity="0.5" stroke-width="2" />
    <path d="M ${width - 50} ${height - 24} L ${width - 24} ${height - 24} L ${width - 24} ${height - 50}" fill="none" stroke="${theme.accent}" stroke-opacity="0.5" stroke-width="2" />

    <g transform="translate(40, 52)">
      <rect x="0" y="0" width="168" height="24" rx="4" fill="${theme.accent}" fill-opacity="0.12" stroke="${theme.accent}" stroke-opacity="0.4" stroke-width="1" />
      <text x="12" y="16" font-family="system-ui, -apple-system, BlinkMacSystemFont, sans-serif" font-size="10.5" font-weight="700" fill="${theme.accent}" letter-spacing="1.5">BIONEXUS · ${role.toUpperCase()}</text>
    </g>

    <g transform="translate(${Math.round(width * 0.62) - 24}, ${Math.round(height * 0.48) - 24})" stroke="${theme.accent}" stroke-opacity="0.3" stroke-width="2" fill="none">
      <circle cx="24" cy="24" r="18" />
      <path d="M 24 10 L 24 38 M 10 24 L 38 24" stroke-dasharray="3,3" />
    </g>

    <g transform="translate(40, ${height - 110})">
      <text x="0" y="0" font-family="Georgia, Cambria, serif" font-size="${titleSize}" font-weight="700" fill="#f8fafc" letter-spacing="0.4">${safeTitle}</text>
      ${safeSci ? `<text x="0" y="${titleSize + 4}" font-family="Georgia, Cambria, serif" font-style="italic" font-size="${sciSize}" fill="${theme.accent}" fill-opacity="0.9">${safeSci}</text>` : ''}
      <text x="0" y="${titleSize + (safeSci ? sciSize + 16 : 24)}" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#94a3b8">© ${safeCredit}</text>
    </g>
  </svg>`;
}

async function findRawSource(id) {
  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
  const baseName = id.replace('/', '-');
  for (const dir of [RAW_DIR, CANDIDATES_DIR]) {
    for (const ext of exts) {
      const candidate = path.join(dir, `${baseName}${ext}`);
      try {
        await fs.access(candidate);
        return candidate;
      } catch {
        // Không tìm thấy, tiếp tục
      }
    }
  }
  return null;
}

async function main() {
  const startTime = Date.now();
  console.log('=== BioNexus Photo Optimization Pipeline ===');
  console.log('Target Directory:', PHOTOS_DIR);
  await fs.mkdir(PHOTOS_DIR, { recursive: true });

  let totalFiles = 0;
  let totalBytes = 0;
  const formatCounts = { avif: 0, webp: 0, jpg: 0 };

  for (const [id, photo] of Object.entries(PHOTOS)) {
    const theme = getTheme(id);
    const aspectRatio = photo.aspectRatio || (photo.width / photo.height);
    const rawSource = await findRawSource(id);

    const targets = [];
    photo.sources.avif?.forEach((s) => targets.push({ relPath: s.src, format: 'avif', width: s.width }));
    photo.sources.webp?.forEach((s) => targets.push({ relPath: s.src, format: 'webp', width: s.width }));
    if (photo.sources.jpg) {
      const match = photo.sources.jpg.match(/-(\d+)\.jpg$/);
      const w = match ? parseInt(match[1], 10) : (photo.role === 'hero' ? 1600 : 960);
      targets.push({ relPath: photo.sources.jpg, format: 'jpg', width: w });
    }

    for (const target of targets) {
      const cleanRel = target.relPath.startsWith('photos/')
        ? target.relPath.slice('photos/'.length)
        : target.relPath;

      const fullPath = path.join(PHOTOS_DIR, cleanRel);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      const targetHeight = Math.round(target.width / aspectRatio);

      let sharpPipeline;
      if (rawSource) {
        sharpPipeline = sharp(rawSource).resize(target.width, targetHeight, { fit: 'cover' });
      } else {
        const svgPlate = renderSvgPlate({
          width: target.width,
          height: targetHeight,
          title: photo.title,
          scientificName: photo.scientificName,
          role: photo.role,
          id,
          credit: photo.credit,
          theme
        });
        sharpPipeline = sharp(Buffer.from(svgPlate)).resize(target.width, targetHeight);
      }

      if (target.format === 'avif') {
        sharpPipeline = sharpPipeline.avif({ quality: 55, effort: 2 });
      } else if (target.format === 'webp') {
        sharpPipeline = sharpPipeline.webp({ quality: 72, effort: 2 });
      } else {
        sharpPipeline = sharpPipeline.jpeg({ quality: 80, mozjpeg: true });
      }

      await sharpPipeline.toFile(fullPath);

      const stat = await fs.stat(fullPath);
      totalFiles++;
      totalBytes += stat.size;
      formatCounts[target.format] = (formatCounts[target.format] || 0) + 1;
    }
  }

  const durationMs = Date.now() - startTime;
  const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);

  console.log(`\n=== TỔNG KẾT TỐI ƯU HÓA ẢNH ===`);
  console.log(`Thời gian xử lý: ${durationMs} ms`);
  console.log(`Số lượng ảnh xử lý: ${Object.keys(PHOTOS).length} ảnh`);
  console.log(`Tổng số tệp sinh ra: ${totalFiles} tệp vật lý`);
  console.log(`Phân bổ định dạng: AVIF: ${formatCounts.avif}, WebP: ${formatCounts.webp}, JPG: ${formatCounts.jpg}`);
  console.log(`Tổng dung lượng thư mục: ${totalMB} MB (${totalBytes.toLocaleString()} bytes)`);

  if (totalBytes > MAX_BUDGET_BYTES) {
    console.error(`CẢNH BÁO: Dung lượng vượt quá ngân sách 30 MB (${totalMB} MB > 30 MB)`);
    process.exit(1);
  } else {
    console.log(`Ngân sách dung lượng: ĐẠT CHUẨN (${totalMB} MB <= 30.0 MB)`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Lỗi khi chạy optimize-photos:', err);
    process.exit(1);
  });
}
