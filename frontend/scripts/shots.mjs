/**
 * scripts/shots.mjs
 * Tự động chụp ảnh toàn bộ 25 routes ở 1440×900 (Desktop) và 390×844 (Mobile)
 */
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const ROUTES = [
  '#/',
  '#/taxonomy',
  '#/taxonomy/1',
  '#/species',
  '#/species/1',
  '#/products',
  '#/products/1',
  '#/login',
  '#/register',
  '#/admin/login',
  '#/cart',
  '#/checkout',
  '#/orders',
  '#/orders/1',
  '#/account',
  '#/seller/apply',
  '#/seller',
  '#/seller/products/new',
  '#/admin',
  '#/admin/sellers',
  '#/admin/products',
  '#/admin/species',
  '#/credits',
  '#/not-found-random',
  '#/dev/ui',
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const OUTPUT_DIR = path.resolve('.shots', new Date().toISOString().replace(/[:.]/g, '-'));

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch();

  console.log(`Bắt đầu chụp ảnh ${ROUTES.length} routes vào thư mục: ${OUTPUT_DIR}`);

  // Chụp Desktop 1440x900
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.addInitScript(() => {
    try {
      window.localStorage.setItem(
        'bionexus_auth_session',
        JSON.stringify({
          token: 'mock-token-superadmin',
          user: { id: 1, username: 'admin', fullName: 'Lê Quản Trị Viên', role: 'SUPER_ADMIN', accountType: 'ADMIN' },
          accountType: 'ADMIN',
          role: 'SUPER_ADMIN',
        })
      );
    } catch (_) {}
  });

  for (const route of ROUTES) {
    const safeName = route.replace(/[^a-zA-Z0-9]/g, '_') || 'home';
    const url = `${BASE_URL}/${route}`;
    try {
      await desktopPage.goto(url, { waitUntil: 'networkidle' });
      await desktopPage.screenshot({
        path: path.join(OUTPUT_DIR, `desktop_${safeName}.png`),
        fullPage: false,
      });
      console.log(`✓ Đã chụp Desktop 1440: ${route}`);
    } catch (err) {
      console.error(`✗ Lỗi khi chụp ${url}:`, err.message);
    }
  }
  await desktopContext.close();

  // Chụp Mobile 390x844
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.addInitScript(() => {
    try {
      window.localStorage.setItem(
        'bionexus_auth_session',
        JSON.stringify({
          token: 'mock-token-superadmin',
          user: { id: 1, username: 'admin', fullName: 'Lê Quản Trị Viên', role: 'SUPER_ADMIN', accountType: 'ADMIN' },
          accountType: 'ADMIN',
          role: 'SUPER_ADMIN',
        })
      );
    } catch (_) {}
  });

  for (const route of ROUTES) {
    const safeName = route.replace(/[^a-zA-Z0-9]/g, '_') || 'home';
    const url = `${BASE_URL}/${route}`;
    try {
      await mobilePage.goto(url, { waitUntil: 'networkidle' });
      await mobilePage.screenshot({
        path: path.join(OUTPUT_DIR, `mobile_${safeName}.png`),
        fullPage: false,
      });
      console.log(`✓ Đã chụp Mobile 390: ${route}`);
    } catch (err) {
      console.error(`✗ Lỗi khi chụp ${url}:`, err.message);
    }
  }
  await mobileContext.close();

  await browser.close();
  console.log(`Hoàn tất chụp ảnh! Thư mục kết quả: ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
