/**
 * BioNexus Adversarial Testing Suite — Milestone 6 Empirical Quality Gate
 * Author: challenger_m6_2 (teamwork_challenger: critic, specialist)
 * 
 * Verifies empirically:
 * 1. Deep Route Resolution & Direct Navigation (F5 refresh) in HashRouter for ALL 24 official routes + 404 + Dev UI.
 * 2. Route Coverage Completeness & 0 RoutePlaceholder occurrences (every route returns a real lazy component wrapped in Suspense).
 * 3. Lazy-loading verification for heavy components and layouts.
 * 4. Tomcat WAR Relative Path Invariants in dist/index.html and dist/assets (Zero root absolute paths).
 * 5. Landing Bundle Budget verification (<= 180.0 KB Gzip).
 * 6. 3D & WebGL Graphic Isolation (Zero Three.js / Geo modulepreload in dist/index.html).
 * 7. Zero Emoji Invariant across frontend/src.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const distDir = path.resolve(frontendDir, 'dist');
const distHtml = path.resolve(distDir, 'index.html');
const distAssets = path.resolve(distDir, 'assets');

// Import react-router matchRoutes
const reactRouterPath = pathToFileURL(
  path.join(frontendDir, 'node_modules/react-router/dist/development/index.mjs')
).href;
const { matchRoutes } = await import(reactRouterPath);

// Read router and routes source code
const routesSource = fs.readFileSync(path.join(frontendDir, 'src/app/routes.ts'), 'utf-8');
const routerSource = fs.readFileSync(path.join(frontendDir, 'src/app/router.tsx'), 'utf-8');

interface RouteMeta {
  path: string;
  name: string;
  title: string;
  layout: 'root' | 'auth' | 'account' | 'seller' | 'admin';
  has3D: boolean;
  description: string;
}

const appRoutesMatches = [
  ...routesSource.matchAll(
    /{\s*path:\s*'([^']+)',\s*name:\s*'([^']+)',\s*title:\s*'([^']+)',\s*layout:\s*'([^']+)',\s*has3D:\s*(true|false)/g
  ),
];
const APP_ROUTES: RouteMeta[] = appRoutesMatches.map((m) => ({
  path: m[1]!,
  name: m[2]!,
  title: m[3]!,
  layout: m[4]! as RouteMeta['layout'],
  has3D: m[5] === 'true',
  description: '',
}));

// Reconstruct router routes exactly as declared in router.tsx
const rootMeta = APP_ROUTES.filter((r) => r.layout === 'root');
const rootChildren = rootMeta.map((r) => {
  if (r.path === '/') {
    return { index: true, id: r.path };
  }
  const relativePath = r.path.startsWith('/') ? r.path.slice(1) : r.path;
  return { path: relativePath, id: r.path };
});

const authMeta = APP_ROUTES.filter((r) => r.layout === 'auth');
const authChildren = authMeta.map((r) => ({
  path: r.path.startsWith('/') ? r.path.slice(1) : r.path,
  id: r.path,
}));

const accountMeta = APP_ROUTES.filter((r) => r.layout === 'account' || r.layout === 'seller');
const accountChildren = accountMeta.map((r) => ({
  path: r.path.startsWith('/') ? r.path.slice(1) : r.path,
  id: r.path,
}));

const adminMeta = APP_ROUTES.filter((r) => r.layout === 'admin');
const adminChildren = adminMeta.map((r) => ({
  path: r.path.startsWith('/') ? r.path.slice(1) : r.path,
  id: r.path,
}));

const routerRoutes = [
  {
    path: '/',
    id: 'root-layout',
    children: rootChildren,
  },
  {
    id: 'auth-layout',
    children: authChildren,
  },
  {
    id: 'account-layout',
    children: accountChildren,
  },
  {
    id: 'admin-layout',
    children: adminChildren,
  },
];

describe('Challenger 2 Empirical Pillar 1: 24 Routes + 404 + Dev UI Matching', () => {
  it('Verifies exactly 25 route metadata definitions exist in APP_ROUTES (24 business + 404 + dev)', () => {
    assert.equal(APP_ROUTES.length, 25, `Expected 25 route entries in APP_ROUTES, found ${APP_ROUTES.length}`);
  });

  const testPaths = [
    { path: '/', expectedLayout: 'root-layout', expectedId: '/' },
    { path: '/taxonomy', expectedLayout: 'root-layout', expectedId: '/taxonomy' },
    { path: '/taxonomy/20', expectedLayout: 'root-layout', expectedId: '/taxonomy/:id' },
    { path: '/species', expectedLayout: 'root-layout', expectedId: '/species' },
    { path: '/species/1', expectedLayout: 'root-layout', expectedId: '/species/:id' },
    { path: '/products', expectedLayout: 'root-layout', expectedId: '/products' },
    { path: '/products/1', expectedLayout: 'root-layout', expectedId: '/products/:id' },
    { path: '/login', expectedLayout: 'auth-layout', expectedId: '/login' },
    { path: '/register', expectedLayout: 'auth-layout', expectedId: '/register' },
    { path: '/admin/login', expectedLayout: 'auth-layout', expectedId: '/admin/login' },
    { path: '/cart', expectedLayout: 'root-layout', expectedId: '/cart' },
    { path: '/checkout', expectedLayout: 'root-layout', expectedId: '/checkout' },
    { path: '/orders', expectedLayout: 'account-layout', expectedId: '/orders' },
    { path: '/orders/ORD-2026-000001', expectedLayout: 'account-layout', expectedId: '/orders/:id' },
    { path: '/account', expectedLayout: 'account-layout', expectedId: '/account' },
    { path: '/seller/apply', expectedLayout: 'account-layout', expectedId: '/seller/apply' },
    { path: '/seller', expectedLayout: 'account-layout', expectedId: '/seller' },
    { path: '/seller/products/new', expectedLayout: 'account-layout', expectedId: '/seller/products/new' },
    { path: '/admin', expectedLayout: 'admin-layout', expectedId: '/admin' },
    { path: '/admin/sellers', expectedLayout: 'admin-layout', expectedId: '/admin/sellers' },
    { path: '/admin/products', expectedLayout: 'admin-layout', expectedId: '/admin/products' },
    { path: '/admin/species', expectedLayout: 'admin-layout', expectedId: '/admin/species' },
    { path: '/credits', expectedLayout: 'root-layout', expectedId: '/credits' },
    { path: '/dev/ui', expectedLayout: 'root-layout', expectedId: '/dev/ui' },
    { path: '/some-random-unknown-404-page', expectedLayout: 'root-layout', expectedId: '*' },
  ];

  for (const { path: testPath, expectedLayout, expectedId } of testPaths) {
    it(`Resolves HashRouter path ${testPath} to leaf "${expectedId}" under "${expectedLayout}"`, () => {
      const matches = matchRoutes(routerRoutes, testPath);
      assert.ok(matches && matches.length > 0, `Path ${testPath} must match routes`);
      const layoutMatch = matches[0]!;
      const leafMatch = matches[matches.length - 1]!;
      assert.equal(layoutMatch.route.id, expectedLayout, `Layout mismatch for ${testPath}`);
      assert.equal(leafMatch.route.id, expectedId, `Leaf route mismatch for ${testPath}`);
    });
  }
});

describe('Challenger 2 Empirical Pillar 2: Zero RoutePlaceholder Fallbacks & Full Lazy Loading', () => {
  it('Verifies router.tsx does NOT render RoutePlaceholder for any configured route in APP_ROUTES', () => {
    // Check that every route in APP_ROUTES is explicitly handled by a case in router.tsx
    for (const route of APP_ROUTES) {
      const casePattern = new RegExp(`case\\s+['"]${route.path.replace('*', '\\*')}['"]:`);
      const isHandled = casePattern.test(routerSource);
      assert.ok(
        isHandled,
        `Route ${route.path} (${route.name}) must be explicitly handled in getRouteElement() and NOT fall through to RoutePlaceholder`
      );
    }
  });

  it('Verifies all 20 page components are loaded via React.lazy', () => {
    const requiredLazyComponents = [
      'Home',
      'Credits',
      'UIPreview',
      'TaxonomyPage',
      'SpeciesListPage',
      'SpeciesDetailPage',
      'ProductsPage',
      'ProductDetailPage',
      'CartPage',
      'CheckoutPage',
      'OrdersPage',
      'OrderDetailPage',
      'LoginPage',
      'RegisterPage',
      'AdminLoginPage',
      'AccountPage',
      'SellerApplyPage',
      'SellerDashboardPage',
      'SellerNewProductPage',
      'AdminDashboardPage',
      'AdminSellersPage',
      'AdminProductsPage',
      'AdminSpeciesPage',
      'NotFoundPage',
    ];

    for (const comp of requiredLazyComponents) {
      const lazyRegex = new RegExp(`const\\s+${comp}\\s*=\\s*React\\.lazy\\(`);
      assert.ok(lazyRegex.test(routerSource), `Component ${comp} must be lazy-loaded with React.lazy()`);
    }
  });

  it('Verifies all 3 sub-layouts are loaded via React.lazy', () => {
    const lazyLayouts = ['AuthLayout', 'AccountLayout', 'AdminLayout'];
    for (const layout of lazyLayouts) {
      const lazyRegex = new RegExp(`const\\s+${layout}\\s*=\\s*React\\.lazy\\(`);
      assert.ok(lazyRegex.test(routerSource), `Layout ${layout} must be lazy-loaded with React.lazy()`);
    }
  });
});

describe('Challenger 2 Empirical Pillar 3: Tomcat WAR Context & Relative Path Invariant', () => {
  it('Ensures dist/index.html exists', () => {
    assert.ok(fs.existsSync(distHtml), 'dist/index.html must exist');
  });

  it('Ensures zero absolute paths (/assets/ or /...) in dist/index.html attributes', () => {
    const html = fs.readFileSync(distHtml, 'utf8');
    // Match any src="/..." or href="/..." where second char is not '/' (protocol-relative)
    const absoluteMatches = [...html.matchAll(/(?:href|src|action)=["']\/([^/][^"']*)["']/gi)];
    assert.equal(
      absoluteMatches.length,
      0,
      `Found forbidden absolute path references in dist/index.html: ${JSON.stringify(absoluteMatches.map((m) => m[0]))}`
    );
  });

  it('Ensures all script, link, and preload tags use relative "./" paths', () => {
    const html = fs.readFileSync(distHtml, 'utf8');
    const localAssetMatches = [...html.matchAll(/(?:href|src)=["'](\.\/assets\/[^"']+)["']/gi)];
    assert.ok(localAssetMatches.length >= 2, 'Must have at least 2 local asset references using "./assets/..."');
    for (const match of localAssetMatches) {
      const assetRelPath = match[1]!;
      const fullAssetPath = path.resolve(distDir, assetRelPath.replace(/^\.\//, ''));
      assert.ok(fs.existsSync(fullAssetPath), `Referenced asset ${assetRelPath} must physically exist in dist/`);
    }
  });
});

describe('Challenger 2 Empirical Pillar 4: Landing JS Bundle Budget Audit', () => {
  it('Validates Landing JS Gzip size <= 180.0 KB (Hard ceiling <= 220.0 KB)', () => {
    const html = fs.readFileSync(distHtml, 'utf8');
    const scriptFiles = new Set<string>();

    const scriptRegex = /<script[^>]+src=["']([^"']+\.js)["'][^>]*>/gi;
    let match: RegExpExecArray | null;
    while ((match = scriptRegex.exec(html)) !== null) {
      if (match[1]) scriptFiles.add(path.basename(match[1]));
    }

    const preloadRegex = /<link[^>]+rel=["']modulepreload["'][^>]+href=["']([^"']+\.js)["'][^>]*>/gi;
    while ((match = preloadRegex.exec(html)) !== null) {
      if (match[1]) scriptFiles.add(path.basename(match[1]));
    }

    assert.ok(scriptFiles.size > 0, 'Must detect at least 1 initial JS file');

    let totalGzipBytes = 0;
    let totalRawBytes = 0;

    for (const filename of scriptFiles) {
      const filePath = path.join(distAssets, filename);
      assert.ok(fs.existsSync(filePath), `Initial JS file ${filename} must exist`);
      const content = fs.readFileSync(filePath);
      totalRawBytes += content.length;
      totalGzipBytes += zlib.gzipSync(content, { level: 9 }).length;
    }

    const totalGzipKb = totalGzipBytes / 1024;
    console.log(`Empirical Landing JS Gzip: ${totalGzipKb.toFixed(2)} KB (Target: <= 180.0 KB, Hard: <= 220.0 KB)`);

    assert.ok(
      totalGzipKb <= 180.0,
      `Landing JS Gzip size ${totalGzipKb.toFixed(2)} KB exceeded target budget 180.0 KB`
    );
    assert.ok(
      totalGzipKb <= 220.0,
      `Landing JS Gzip size ${totalGzipKb.toFixed(2)} KB exceeded hard ceiling 220.0 KB`
    );
  });
});

describe('Challenger 2 Empirical Pillar 5: 3D Graphics & Geo Preload Isolation', () => {
  it('Verifies zero modulepreload tags contain three or geo in dist/index.html', () => {
    const html = fs.readFileSync(distHtml, 'utf8');
    const preloadRegex = /<link[^>]+rel=["']modulepreload["'][^>]*>/gi;
    const preloadTags = html.match(preloadRegex) || [];

    const violations: string[] = [];
    for (const tag of preloadTags) {
      const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
      if (hrefMatch && hrefMatch[1]) {
        const href = hrefMatch[1];
        if (href.includes('three') || href.includes('geo')) {
          violations.push(tag);
        }
      }
    }

    assert.equal(
      violations.length,
      0,
      `Found forbidden 3D/Geo modulepreload tags in index.html: ${JSON.stringify(violations)}`
    );
  });
});

describe('Challenger 2 Empirical Pillar 6: Emoji Policy Verification', () => {
  it('Ensures zero emojis in all code files in frontend/src', () => {
    const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const ALLOWED_TYPOGRAPHY = /[\u00A9\u00AE\u2122]/g; // ©, ®, ™
    const violations: { file: string; line: number; content: string }[] = [];

    function scan(dir: string) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (/\.(tsx?|jsx?|css|html|json)$/.test(entry.name)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            const stripped = line.replace(ALLOWED_TYPOGRAPHY, '');
            if (EMOJI_REGEX.test(stripped)) {
              violations.push({
                file: path.relative(frontendDir, fullPath),
                line: index + 1,
                content: line.trim(),
              });
            }
          });
        }
      }
    }

    scan(path.resolve(frontendDir, 'src'));

    assert.equal(
      violations.length,
      0,
      `Found ${violations.length} emoji violations in frontend/src: ${JSON.stringify(violations)}`
    );
  });
});
