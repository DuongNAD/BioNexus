#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const distHtml = path.resolve(distDir, 'index.html');
const distAssets = path.resolve(distDir, 'assets');

// Nguong ngan sach nghiem ngat Milestone 5 Iteration 2
const BUDGET_GZIP_KB = 180.0;
const HARD_CEILING_GZIP_KB = 220.0;

console.log('=== BioNexus Landing Bundle Budget Guard ===');

if (!fs.existsSync(distHtml) || !fs.existsSync(distAssets)) {
  console.error('\nLOI: Khong tim thay thu muc frontend/dist hoac dist/assets!');
  console.error('Vui long chay "npm run build" truoc khi kiem tra budget bundle.\n');
  process.exit(1);
}

const html = fs.readFileSync(distHtml, 'utf8');
const scriptFiles = new Set();

// 1. Quet the <script type="module" src="..."> nap ban dau trong index.html
const scriptRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  if (match[1]) {
    scriptFiles.add(path.basename(match[1]));
  }
}

// 2. Quet the <link rel="modulepreload" href="..."> duoc trinh duyet nap truoc
const preloadRegex = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+\.js)["'][^>]*>/gi;
while ((match = preloadRegex.exec(html)) !== null) {
  if (match[1]) {
    scriptFiles.add(path.basename(match[1]));
  }
}

// 3. Fallback du phong: neu khong quet duoc the nao thi tim tep index-* va react-vendor-*
if (scriptFiles.size === 0) {
  const files = fs.readdirSync(distAssets);
  const indexJs = files.find((f) => f.startsWith('index-') && f.endsWith('.js'));
  const reactVendorJs = files.find((f) => f.startsWith('react-vendor-') && f.endsWith('.js'));
  if (indexJs) scriptFiles.add(indexJs);
  if (reactVendorJs) scriptFiles.add(reactVendorJs);
}

if (scriptFiles.size === 0) {
  console.error('\nLOI: Khong xac dinh duoc tap tin JS nap ban dau trong dist/index.html hoac dist/assets!\n');
  process.exit(1);
}

console.log(`Phat hien ${scriptFiles.size} tap tin JS duoc nap ban dau trong Landing Page:`);

let totalRawBytes = 0;
let totalGzipBytes = 0;

for (const filename of scriptFiles) {
  const filePath = path.join(distAssets, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`LOI: Khong tim thay tap tin ${filename} trong dist/assets!`);
    process.exit(1);
  }
  const content = fs.readFileSync(filePath);
  const rawBytes = content.length;
  const gzipBytes = zlib.gzipSync(content, { level: 9 }).length;
  totalRawBytes += rawBytes;
  totalGzipBytes += gzipBytes;

  const rawKb = (rawBytes / 1024).toFixed(2);
  const gzipKb = (gzipBytes / 1024).toFixed(2);
  console.log(`  - ${filename}: ${rawKb} KB raw | ${gzipKb} KB gzip`);
}

const totalRawKb = (totalRawBytes / 1024).toFixed(2);
const totalGzipKb = (totalGzipBytes / 1024).toFixed(2);

console.log('--------------------------------------------');
console.log(`TONG Landing JS (Raw) : ${totalRawKb} KB`);
console.log(`TONG Landing JS (Gzip): ${totalGzipKb} KB`);
console.log(`NGAN SACH MUC TIEU    : <= ${BUDGET_GZIP_KB.toFixed(2)} KB Gzip`);
console.log(`NGUONG TRAN BAT BUOC  : <= ${HARD_CEILING_GZIP_KB.toFixed(2)} KB Gzip`);

const isPassed = parseFloat(totalGzipKb) <= BUDGET_GZIP_KB;
console.log(`KET QUA KIEM TRA      : ${isPassed ? 'DAT CHUAN (PASSED)' : 'THAT BAI (FAILED)'}`);
console.log('--------------------------------------------');

if (!isPassed) {
  console.error(`\nLOI: Dung luong Landing JS (${totalGzipKb} KB gzip) vuot qua nguon ngan sach ${BUDGET_GZIP_KB} KB gzip!\n`);
  process.exit(1);
}

console.log('\nHOAN HAO: Toan bo Landing JS nam trong nguong ngan sach an toan.\n');
process.exit(0);
