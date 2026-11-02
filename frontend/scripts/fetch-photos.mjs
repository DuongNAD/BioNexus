#!/usr/bin/env node
/**
 * scripts/fetch-photos.mjs
 * Pipeline tự động tìm kiếm, kiểm tra giấy phép tự do và tải ảnh từ Wikimedia Commons API.
 * Tuân thủ quy định: User-Agent, Rate limit 1 req/s, License Whitelist CC0/CC-BY/CC-BY-SA.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CANDIDATES_DIR = path.join(__dirname, '.photo-candidates');

const USER_AGENT = 'BioNexusStudentProject/1.0 (contact: bionexus.project2026@gmail.com; Aptech 2026)';
const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
const RATE_LIMIT_MS = 1100;

const ALLOWED_LICENSES = [
  'cc0', 'cc-zero', 'public domain', 'pd',
  'cc by 2.0', 'cc by 2.5', 'cc by 3.0', 'cc by 4.0',
  'cc by-sa 2.0', 'cc by-sa 2.5', 'cc by-sa 3.0', 'cc by-sa 4.0'
];

const FORBIDDEN_SUBSTRINGS = ['-nc', 'noncommercial', '-nd', 'noderivatives', 'fair use', 'all rights reserved'];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let lastRequestTime = 0;
async function fetchWithThrottle(url, options = {}) {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await sleep(RATE_LIMIT_MS - elapsed);
  }
  lastRequestTime = Date.now();

  const mergedHeaders = {
    'User-Agent': USER_AGENT,
    ...(options.headers || {})
  };

  let retries = 3;
  let delay = 2500;
  while (retries > 0) {
    try {
      const res = await fetch(url, { ...options, headers: mergedHeaders });
      if (res.status === 429 || res.status === 503) {
        console.warn(`[API Throttle] Nhận mã ${res.status}. Tạm dừng ${delay}ms...`);
        await sleep(delay);
        retries--;
        delay *= 2;
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }
      return res;
    } catch (err) {
      retries--;
      if (retries === 0) throw err;
      console.warn(`[Network Retry] Lỗi: ${err.message}. Thử lại sau ${delay}ms...`);
      await sleep(delay);
      delay *= 2;
    }
  }
}

function stripHtml(html) {
  if (!html) return 'Không rõ';
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

function normalizeLicense(raw) {
  if (!raw) return '';
  return raw.toLowerCase().replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

export function isLicenseAllowed(licenseStr) {
  const norm = normalizeLicense(licenseStr);
  if (!norm) return false;
  for (const forbidden of FORBIDDEN_SUBSTRINGS) {
    if (norm.includes(forbidden)) return false;
  }
  for (const allowed of ALLOWED_LICENSES) {
    if (norm.includes(allowed)) return true;
  }
  return false;
}

export async function searchCommons(query, limit = 10) {
  const url = new URL(COMMONS_API);
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrnamespace', '6');
  url.searchParams.set('gsrlimit', String(limit));
  url.searchParams.set('gsrsearch', `${query} filetype:bitmap`);
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|size|mime|extmetadata');
  url.searchParams.set('iiurlwidth', '2400');

  const res = await fetchWithThrottle(url.toString());
  const json = await res.json();
  if (!json.query || !json.query.pages) return [];
  return Object.values(json.query.pages);
}

async function main() {
  console.log('=== BioNexus Wikimedia Commons Photo Fetcher ===');
  await fs.mkdir(CANDIDATES_DIR, { recursive: true });
  console.log('Thư mục lưu trữ ứng viên:', CANDIDATES_DIR);
  console.log('User-Agent:', USER_AGENT);
  console.log('Kiểm tra giấy phép hợp lệ: CC0, CC BY, CC BY-SA (Không có -NC- hoặc -ND-)');
  console.log('Fetcher sẵn sàng cho quy trình tìm kiếm ảnh.');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error('Lỗi khi chạy fetch-photos:', err);
    process.exit(1);
  });
}
