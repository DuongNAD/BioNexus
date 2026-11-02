#!/usr/bin/env node
// frontend/scripts/verify-no-three-preload.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_INDEX_HTML = path.resolve(__dirname, '../dist/index.html');

console.log('Kiem tra tuan thu khong tai truoc Three.js/Geo (No Three/Geo Modulepreload) trong dist/index.html...');

if (!fs.existsSync(DIST_INDEX_HTML)) {
  console.error('\nLOI: Khong tim thay tep frontend/dist/index.html!');
  console.error('Vui long chay "npm run build" truoc khi kiem tra modulepreload.');
  process.exit(1);
}

const htmlContent = fs.readFileSync(DIST_INDEX_HTML, 'utf8');

// Regex quet tat ca cac the <link rel="modulepreload" ...>
const preloadLinkRegex = /<link[^>]+rel=["']modulepreload["'][^>]*>/gi;
const matchedLinks = htmlContent.match(preloadLinkRegex) || [];

const violations = [];

matchedLinks.forEach((linkTag) => {
  // Trich xuat thuoc tinh href
  const hrefMatch = linkTag.match(/href=["']([^"']+)["']/i);
  if (hrefMatch && hrefMatch[1]) {
    const href = hrefMatch[1];
    // Kiem tra xem href co chua chunk three hoac geo hay khong
    if (href.includes('three') || href.includes('geo')) {
      violations.push({
        tag: linkTag,
        href,
      });
    }
  }
});

if (violations.length > 0) {
  console.error(`\nPHAT HIEN ${violations.length} VI PHAM MODULEPRELOAD CHUNK THREE/GEO TRONG dist/index.html:`);
  violations.forEach((v) => {
    console.error(`  - The vi pham: ${v.tag}`);
    console.error(`    Tap tin dich: ${v.href}`);
  });
  console.error('\nQuy dinh AGENTS.md: Three.js chi duoc tai o route can no (lazy), cam tai truoc trong index.html ban dau.');
  console.error('Khac phuc: Cau hinh build.modulePreload.resolveDependencies trong vite.config.ts de loai bo chunk "three" va "geo".\n');
  process.exit(1);
} else {
  console.log(`HOAN HAO: 0 the modulepreload lien quan toi Three.js hoac Geo trong dist/index.html.`);
  console.log(`Tong so the modulepreload hop le: ${matchedLinks.length}`);
  matchedLinks.forEach((l) => console.log(`   * ${l.trim()}`));
  console.log('Kiem tra dat chuan 100%!\n');
  process.exit(0);
}
