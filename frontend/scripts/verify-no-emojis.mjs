#!/usr/bin/env node
// frontend/scripts/verify-no-emojis.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SRC_DIR = path.resolve(__dirname, '../src');

// Regex quét ký tự biểu tượng Unicode và Pictograph mở rộng
const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
// Loại trừ các ký hiệu bản quyền và thương hiệu chuẩn văn bản
const ALLOWED_TYPOGRAPHY = /[\u00A9\u00AE\u2122]/g; // ©, ®, ™

const violations = [];

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(tsx?|jsx?|css|html|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        const strippedLine = line.replace(ALLOWED_TYPOGRAPHY, '');
        if (EMOJI_REGEX.test(strippedLine)) {
          violations.push({
            file: path.relative(path.resolve(__dirname, '..'), fullPath),
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    }
  }
}

console.log('🔍 BioNexus Quality Gate: Kiểm tra tuân thủ luật cứng "Không emoji" trong frontend/src/...');
scanDir(SRC_DIR);

if (violations.length > 0) {
  console.error(`\n❌ PHÁT HIỆN ${violations.length} VI PHẠM EMOJI TRONG frontend/src/:`);
  violations.forEach((v) => {
    console.error(`  - ${v.file}:${v.line} -> ${v.content}`);
  });
  console.error('\n⚠️ Quy định AGENTS.md: Cấm tuyệt đối emoji trong giao diện Bio-Luxury.');
  process.exit(1);
} else {
  console.log('✅ HOÀN HẢO: 0 emoji trong frontend/src/. Kiểm tra đạt chuẩn 100%!');
  process.exit(0);
}
