#!/usr/bin/env node
// Bật hoặc tắt (comment / bỏ comment) các chức năng mua hàng làm thêm, đánh dấu [TN-xx] trong code.
// Hướng dẫn đầy đủ: CHUC-NANG-MUA-HANG-THEM.md ở thư mục gốc dự án.
//
// Cách dùng (chạy ở thư mục gốc dự án):
//   node tools/bat-tat-chuc-nang.mjs                 xem trạng thái từng chức năng
//   node tools/bat-tat-chuc-nang.mjs bat TN-01       bật một chức năng (tự bật luôn TN-00 nếu cần)
//   node tools/bat-tat-chuc-nang.mjs tat TN-01       tắt một chức năng
//   node tools/bat-tat-chuc-nang.mjs bat tat-ca      bật tất cả
//   node tools/bat-tat-chuc-nang.mjs tat tat-ca      tắt tất cả
//   node tools/bat-tat-chuc-nang.mjs vi-tri          in vị trí (file:dòng) của từng chức năng
//
// Ba kiểu đánh dấu trong code:
//   1. Khối thường (Java, TS):  dòng "// [TN-xx] BẮT ĐẦU" ... dòng "// [TN-xx] KẾT THÚC".
//      Khi tắt, mọi dòng ở giữa có thêm "// " ở đầu.
//   2. Khối JSX (trong giao diện): dòng "{/* [TN-xx] BẮT ĐẦU */}" ... dòng "{/* [TN-xx] KẾT THÚC */}".
//      Khi tắt, có thêm một dòng "{/*" ngay dưới BẮT ĐẦU và một dòng "*/}" ngay trên KẾT THÚC.
//   3. Một dòng lẻ: dòng kết thúc bằng "// [TN-xx]". Khi tắt, đầu dòng có thêm "// ".

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCAN_DIRS = ['backend/src/main/java', 'frontend/src'];
const SCAN_EXTENSIONS = ['.java', '.ts', '.tsx'];

const FEATURES = {
  'TN-00': { name: 'Nền chung cho đơn hàng (TN-01, TN-02, TN-03 cần cái này)', needs: [] },
  'TN-01': { name: 'Người mua hủy đơn, hoàn lại kho', needs: ['TN-00'] },
  'TN-02': { name: 'Người mua xác nhận đã nhận hàng', needs: ['TN-00'] },
  'TN-03': { name: 'Quản trị viên quản lý đơn hàng', needs: ['TN-00'] },
  'TN-04': { name: 'Thống kê doanh thu cho quản trị', needs: [] },
  'TN-05': { name: 'Người bán xem đơn hàng của shop', needs: [] },
  'TN-06': { name: 'Mã giảm giá khi đặt hàng', needs: [] },
  'TN-07': { name: 'Phí vận chuyển', needs: [] },
  'TN-08': { name: 'Giới hạn số lượng mỗi sản phẩm', needs: [] },
  'TN-09': { name: 'Tìm đơn hàng theo mã hoặc tên sản phẩm', needs: [] },
  'TN-10': { name: 'Lưu phương thức thanh toán (COD / chuyển khoản)', needs: [] },
  'TN-11': { name: 'Trạng thái thanh toán, quản trị xác nhận đã thu tiền', needs: ['TN-10'] },
  'TN-12': { name: 'In hóa đơn', needs: [] },
  'TN-13': { name: 'Chọn món trong giỏ để đặt hàng', needs: [] },
  'TN-14': { name: 'Xóa nhanh các món ngừng bán khỏi giỏ', needs: [] },
  'TN-15': { name: 'Danh sách yêu thích (lưu để mua sau)', needs: [] },
  'TN-16': { name: 'Đánh giá sản phẩm sau khi mua', needs: [] },
  'TN-17': { name: 'Giỏ hàng tạm cho khách chưa đăng nhập', needs: [] },
};

const START_PATTERN = /\[(TN-\d\d)\] BẮT ĐẦU/;
const SINGLE_LINE_PATTERN = /^(\s*)(.*?)\s*\/\/ \[(TN-\d\d)\]\s*$/;

// ===== Đọc file =====

function listSourceFiles() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    walk(path.join(ROOT, dir), files);
  }
  return files;
}

function walk(dir, files) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, files);
    } else if (SCAN_EXTENSIONS.includes(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }
}

// Tìm mọi khối và dòng lẻ có đánh dấu trong một file
function findMarks(lines, filePath) {
  const blocks = [];
  const singles = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const startMatch = line.match(START_PATTERN);
    if (startMatch) {
      const id = startMatch[1];
      const endIndex = findEnd(lines, i, id);
      if (endIndex === -1) {
        throw new Error(`${relative(filePath)}:${i + 1} có "[${id}] BẮT ĐẦU" nhưng thiếu "[${id}] KẾT THÚC"`);
      }
      const isJsx = line.trim().startsWith('{/*');
      const title = line.includes('·') ? line.split('·')[1].replace('*/}', '').trim() : '';
      blocks.push({ id, start: i, end: endIndex, isJsx, title });
      i = endIndex + 1;
      continue;
    }
    const singleMatch = line.match(SINGLE_LINE_PATTERN);
    if (singleMatch) {
      singles.push({ id: singleMatch[3], index: i });
    }
    i = i + 1;
  }
  return { blocks, singles };
}

function findEnd(lines, startIndex, id) {
  for (let j = startIndex + 1; j < lines.length; j++) {
    if (lines[j].includes(`[${id}] KẾT THÚC`)) {
      return j;
    }
    if (START_PATTERN.test(lines[j])) {
      return -1; // không cho lồng khối
    }
  }
  return -1;
}

// ===== Trạng thái =====

function isBlockOn(lines, block) {
  if (block.isJsx) {
    return lines[block.start + 1].trim() !== '{/*';
  }
  const inner = lines.slice(block.start + 1, block.end).filter((l) => l.trim() !== '');
  const allCommented = inner.every((l) => l.trimStart().startsWith('//'));
  return !allCommented;
}

function isSingleOn(lines, single) {
  const match = lines[single.index].match(SINGLE_LINE_PATTERN);
  return !match[2].startsWith('//');
}

// ===== Bật / tắt =====

function turnBlockOn(lines, block) {
  if (isBlockOn(lines, block)) {
    return;
  }
  if (block.isJsx) {
    // Xóa dòng "*/}" trước rồi mới xóa "{/*" để chỉ số dòng phía trên không bị lệch
    lines.splice(block.end - 1, 1);
    lines.splice(block.start + 1, 1);
    return;
  }
  for (let k = block.start + 1; k < block.end; k++) {
    if (lines[k].trim() !== '') {
      lines[k] = lines[k].replace(/^(\s*)\/\/ ?/, '$1');
    }
  }
}

function turnBlockOff(lines, block) {
  if (!isBlockOn(lines, block)) {
    return;
  }
  const indent = lines[block.start].match(/^\s*/)[0];
  if (block.isJsx) {
    // Trong khối JSX mà có "*/" thì comment {/* ... */} sẽ bị đóng sớm và làm hỏng file
    const inner = lines.slice(block.start + 1, block.end).join('\n');
    if (inner.includes('*/')) {
      throw new Error(`Khối JSX ${block.id} ở dòng ${block.start + 1} có chứa "*/", không comment được`);
    }
    lines.splice(block.end, 0, `${indent}*/}`);
    lines.splice(block.start + 1, 0, `${indent}{/*`);
    return;
  }
  for (let k = block.start + 1; k < block.end; k++) {
    if (lines[k].trim() !== '') {
      lines[k] = lines[k].replace(/^(\s*)/, '$1// ');
    }
  }
}

function turnSingle(lines, single, on) {
  const match = lines[single.index].match(SINGLE_LINE_PATTERN);
  const indent = match[1];
  const code = match[2];
  const isOn = !code.startsWith('//');
  if (on && !isOn) {
    lines[single.index] = `${indent}${code.replace(/^\/\/ ?/, '')} // [${single.id}]`;
  }
  if (!on && isOn) {
    lines[single.index] = `${indent}// ${code} // [${single.id}]`;
  }
}

function applyToFeatures(ids, on) {
  let changedFiles = 0;
  for (const filePath of listSourceFiles()) {
    const original = fs.readFileSync(filePath, 'utf8');
    if (!original.includes('[TN-')) {
      continue;
    }
    const lines = original.split('\n');
    const { blocks, singles } = findMarks(lines, filePath);

    for (const single of singles) {
      if (ids.includes(single.id)) {
        turnSingle(lines, single, on);
      }
    }
    // Duyệt khối từ dưới lên: thêm hoặc xóa dòng ở khối dưới không làm lệch vị trí khối trên
    const sortedBlocks = [...blocks].sort((a, b) => b.start - a.start);
    for (const block of sortedBlocks) {
      if (!ids.includes(block.id)) {
        continue;
      }
      if (on) {
        turnBlockOn(lines, block);
      } else {
        turnBlockOff(lines, block);
      }
    }

    const updated = lines.join('\n');
    if (updated !== original) {
      fs.writeFileSync(filePath, updated);
      changedFiles = changedFiles + 1;
    }
  }
  return changedFiles;
}

// ===== Báo cáo =====

function collectReport() {
  const report = {};
  for (const id of Object.keys(FEATURES)) {
    report[id] = { on: 0, off: 0, places: [] };
  }
  for (const filePath of listSourceFiles()) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes('[TN-')) {
      continue;
    }
    const lines = content.split('\n');
    const { blocks, singles } = findMarks(lines, filePath);
    for (const block of blocks) {
      const entry = report[block.id];
      if (!entry) {
        throw new Error(`${relative(filePath)}:${block.start + 1} dùng mã lạ ${block.id}`);
      }
      if (isBlockOn(lines, block)) {
        entry.on = entry.on + 1;
      } else {
        entry.off = entry.off + 1;
      }
      const kind = block.isJsx ? 'khối JSX' : 'khối';
      entry.places.push({ file: relative(filePath), line: block.start + 1, endLine: block.end + 1, kind, text: block.title });
    }
    for (const single of singles) {
      const entry = report[single.id];
      if (!entry) {
        throw new Error(`${relative(filePath)}:${single.index + 1} dùng mã lạ ${single.id}`);
      }
      if (isSingleOn(lines, single)) {
        entry.on = entry.on + 1;
      } else {
        entry.off = entry.off + 1;
      }
      const code = lines[single.index].match(SINGLE_LINE_PATTERN)[2].replace(/^\/\/ ?/, '');
      entry.places.push({ file: relative(filePath), line: single.index + 1, endLine: single.index + 1, kind: 'một dòng', text: code });
    }
  }
  return report;
}

function stateLabel(entry) {
  if (entry.on > 0 && entry.off === 0) {
    return 'BẬT';
  }
  if (entry.off > 0 && entry.on === 0) {
    return 'TẮT';
  }
  if (entry.on === 0 && entry.off === 0) {
    return 'KHÔNG THẤY';
  }
  return `LẪN LỘN (${entry.on} chỗ bật, ${entry.off} chỗ tắt)`;
}

function printStatus() {
  const report = collectReport();
  for (const [id, feature] of Object.entries(FEATURES)) {
    const entry = report[id];
    console.log(`${id}  ${stateLabel(entry).padEnd(10)}  ${feature.name}  (${entry.places.length} chỗ)`);
  }
}

function printPlaces() {
  const report = collectReport();
  for (const [id, feature] of Object.entries(FEATURES)) {
    console.log(`\n${id} · ${feature.name}`);
    for (const place of report[id].places) {
      const range = place.endLine > place.line ? `${place.line}-${place.endLine}` : `${place.line}`;
      console.log(`  ${place.file}:${range}  [${place.kind}] ${place.text}`);
    }
  }
}

function relative(filePath) {
  return path.relative(ROOT, filePath);
}

// ===== Chạy =====

function resolveIds(args, on) {
  if (args.length === 0) {
    throw new Error('Thiếu mã chức năng. Ví dụ: bat TN-01');
  }
  if (args[0] === 'tat-ca') {
    return Object.keys(FEATURES);
  }
  const ids = [];
  for (const arg of args) {
    const id = arg.toUpperCase();
    if (!FEATURES[id]) {
      throw new Error(`Không có chức năng ${arg}. Các mã hợp lệ: ${Object.keys(FEATURES).join(', ')}`);
    }
    ids.push(id);
    // Bật TN-01 thì phải bật luôn phần nền TN-00 nó cần
    if (on) {
      for (const need of FEATURES[id].needs) {
        if (!ids.includes(need)) {
          ids.push(need);
        }
      }
    }
  }
  return ids;
}

// Tắt một chức năng nền (ví dụ TN-00) trong khi chức năng cần nó vẫn bật thì code sẽ không biên dịch được
function warnIfBaseTurnedOff(ids) {
  const report = collectReport();
  for (const [id, feature] of Object.entries(FEATURES)) {
    if (ids.includes(id) || report[id].on === 0) {
      continue;
    }
    for (const need of feature.needs) {
      if (ids.includes(need)) {
        console.log(`Cảnh báo: ${id} vẫn đang bật nhưng cần ${need}. Hãy tắt ${id} hoặc bật lại ${need}.`);
      }
    }
  }
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command || command === 'trang-thai') {
    printStatus();
    return;
  }
  if (command === 'vi-tri') {
    printPlaces();
    return;
  }
  if (command === 'bat' || command === 'tat') {
    const on = command === 'bat';
    const ids = resolveIds(args, on);
    const changedFiles = applyToFeatures(ids, on);
    console.log(`${on ? 'Đã bật' : 'Đã tắt'}: ${ids.join(', ')} (${changedFiles} file thay đổi)\n`);
    if (!on) {
      warnIfBaseTurnedOff(ids);
    }
    printStatus();
    return;
  }
  throw new Error(`Lệnh lạ "${command}". Dùng: trang-thai, vi-tri, bat, tat`);
}

try {
  main();
} catch (error) {
  console.error(`Lỗi: ${error.message}`);
  process.exit(1);
}
