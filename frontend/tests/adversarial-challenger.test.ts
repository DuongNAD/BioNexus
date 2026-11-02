/**
 * BioNexus Adversarial Testing Suite (Milestone 1)
 * Author: challenger_m1_2 (teamwork_challenger)
 * 
 * Tests empirical invariants:
 * 1. HashRouter Route Matching & Tomcat WAR Deep Route Invariants
 * 2. Static Build Relative Paths & Zero Root Assets Invariant
 * 3. Environment & Mock Toggle Resilience Permutations
 * 4. MSW Bootstrap Error Handling & Promise Rejection Behavior
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Resolve project directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const distDir = path.resolve(frontendDir, 'dist');

// We import matchRoutes from react-router installed in frontend/node_modules
const reactRouterPath = pathToFileURL(
  path.join(frontendDir, 'node_modules/react-router/dist/development/index.mjs')
).href;
const { matchRoutes } = await import(reactRouterPath);

// Read routes definition from src/app/routes.ts
const routesSource = fs.readFileSync(path.join(frontendDir, 'src/app/routes.ts'), 'utf-8');
const routerSource = fs.readFileSync(path.join(frontendDir, 'src/app/router.tsx'), 'utf-8');

// Parse APP_ROUTES metadata from source for exact parity
interface RouteMeta {
  path: string;
  name: string;
  title: string;
  layout: 'root' | 'auth' | 'account' | 'seller' | 'admin';
  has3D: boolean;
  description: string;
}

// Extract APP_ROUTES list
const appRoutesMatches = [...routesSource.matchAll(/{\s*path:\s*'([^']+)',\s*name:\s*'([^']+)',\s*title:\s*'([^']+)',\s*layout:\s*'([^']+)',\s*has3D:\s*(true|false)/g)];
const APP_ROUTES: RouteMeta[] = appRoutesMatches.map((m) => ({
  path: m[1]!,
  name: m[2]!,
  title: m[3]!,
  layout: m[4]! as RouteMeta['layout'],
  has3D: m[5] === 'true',
  description: '',
}));

describe('Adversarial Challenge 1: HashRouter & Deep Route Path Invariants', () => {
  // Construct the exact router tree as declared in src/app/router.tsx
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

  // Exactly as written in frontend/src/app/router.tsx
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
      path: 'admin',
      id: 'admin-layout',
      children: adminChildren,
    },
  ];

  it('Verifies deep route /credits matches Credits page under RootLayout', () => {
    const matches = matchRoutes(routerRoutes, '/credits');
    assert.ok(matches, 'Path /credits must match');
    const leaf = matches[matches.length - 1]!;
    assert.equal(leaf.route.id, '/credits');
    assert.equal(matches[0]!.route.id, 'root-layout');
  });

  it('Verifies deep route /dev/ui matches UIPreview page under RootLayout', () => {
    const matches = matchRoutes(routerRoutes, '/dev/ui');
    assert.ok(matches, 'Path /dev/ui must match');
    const leaf = matches[matches.length - 1]!;
    assert.equal(leaf.route.id, '/dev/ui');
  });

  it('Verifies deep route /species/1 matches SpeciesDetail route under RootLayout', () => {
    const matches = matchRoutes(routerRoutes, '/species/1');
    assert.ok(matches, 'Path /species/1 must match');
    const leaf = matches[matches.length - 1]!;
    assert.equal(leaf.route.id, '/species/:id');
  });

  it('Verifies deep route /orders and /seller routes under AccountLayout', () => {
    const ordersMatch = matchRoutes(routerRoutes, '/orders');
    assert.ok(ordersMatch, 'Path /orders must match');
    assert.equal(ordersMatch[ordersMatch.length - 1]!.route.id, '/orders');

    const sellerMatch = matchRoutes(routerRoutes, '/seller');
    assert.ok(sellerMatch, 'Path /seller must match');
    assert.equal(sellerMatch[sellerMatch.length - 1]!.route.id, '/seller');

    const sellerNewMatch = matchRoutes(routerRoutes, '/seller/products/new');
    assert.ok(sellerNewMatch, 'Path /seller/products/new must match');
    assert.equal(sellerNewMatch[sellerNewMatch.length - 1]!.route.id, '/seller/products/new');
  });

  it('CRITICAL BUG CHECK: verifies whether /admin and /admin/sellers match properly or 404', () => {
    // Test /admin
    const adminMatch = matchRoutes(routerRoutes, '/admin');
    console.log('Admin route match result for /admin:', adminMatch?.map(m => ({ id: m.route.id, path: m.route.path })));
    
    // In router.tsx: path: 'admin' parent + child path: 'admin' makes the route 'admin/admin'!
    // When visiting '/admin', leaf is 'admin-layout' with NO child component mounted!
    const adminLeaf = adminMatch ? adminMatch[adminMatch.length - 1]! : null;
    const adminMatchesChild = adminLeaf?.route.id === '/admin';

    // Test /admin/sellers
    const sellersMatch = matchRoutes(routerRoutes, '/admin/sellers');
    console.log('Admin route match result for /admin/sellers:', sellersMatch?.map(m => ({ id: m.route.id, path: m.route.path })));
    
    // In router.tsx: child path is 'admin/sellers' nested under parent 'admin' => 'admin/admin/sellers'!
    // Therefore '/admin/sellers' matches '*' (404) under RootLayout!
    const sellersLeaf = sellersMatch ? sellersMatch[sellersMatch.length - 1]! : null;
    const isSellers404 = sellersLeaf?.route.id === '*';

    console.log('Empirical discovery: /admin child matched?', adminMatchesChild);
    console.log('Empirical discovery: /admin/sellers fell back to 404 (*)?', isSellers404);

    // This documents the exact bug found:
    if (isSellers404) {
      console.warn('⚠️ ROUTING BUG CONFIRMED: /admin/sellers resolves to 404 (*) instead of AdminLayout child!');
    }
    if (!adminMatchesChild) {
      console.warn('⚠️ ROUTING BUG CONFIRMED: /admin resolves to layout container without child component!');
    }

    // Verify whether the bug exists
    assert.equal(isSellers404, true, 'Confirmed that current router.tsx produces 404 for /admin/sellers');
  });

  it('Verifies pathless AdminLayout fix resolves all 4 admin routes flawlessly', () => {
    // Proposed fix: remove path: 'admin' from parent AdminLayout route
    const fixedRoutes = [
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
        children: adminChildren, // now pathless, matching /admin, /admin/sellers, /admin/products, /admin/species
      },
    ];

    const adminPaths = ['/admin', '/admin/sellers', '/admin/products', '/admin/species'];
    for (const p of adminPaths) {
      const match = matchRoutes(fixedRoutes, p);
      assert.ok(match, `Fixed route tree must match ${p}`);
      const leaf = match[match.length - 1]!;
      assert.equal(leaf.route.id, p, `Leaf route must be ${p}`);
      assert.equal(match[0]!.route.id, 'admin-layout');
    }
  });

  it('Verifies all 24 official routes + 1 dev route with the pathless AdminLayout fix', () => {
    const fixedRoutes = [
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

    for (const r of APP_ROUTES) {
      if (r.path === '*') continue;
      const testPath = r.path.replace(':id', '1');
      const matches = matchRoutes(fixedRoutes, testPath);
      assert.ok(matches, `Route ${r.path} must match`);
      const leaf = matches[matches.length - 1]!;
      assert.equal(leaf.route.id, r.path, `Route ${r.path} must match its route definition`);
    }
  });

  it('Simulates Tomcat WAR context: /BioNexus/index.html#/credits URL resolution', () => {
    // In Tomcat deployment, the browser URL is:
    // http://localhost:8080/BioNexus/index.html#/credits
    const simulatedUrl = new URL('http://localhost:8080/BioNexus/index.html#/credits');
    assert.equal(simulatedUrl.pathname, '/BioNexus/index.html');
    assert.equal(simulatedUrl.hash, '#/credits');

    // HashRouter strips the hash leading '#' and matches '/credits'
    const hashPath = simulatedUrl.hash.replace(/^#/, '');
    const matches = matchRoutes(routerRoutes, hashPath);
    assert.ok(matches, 'Hash path from Tomcat WAR must match route');
    assert.equal(matches[matches.length - 1]!.route.id, '/credits');
  });
});

describe('Adversarial Challenge 2: Static Build Relative Paths & Zero Root Assets', () => {
  it('Verifies frontend/dist/index.html exists', () => {
    const indexPath = path.join(distDir, 'index.html');
    assert.ok(fs.existsSync(indexPath), 'dist/index.html must exist after build');
  });

  it('Verifies all src and href attributes in dist/index.html are strictly relative or absolute CDN', () => {
    const indexPath = path.join(distDir, 'index.html');
    const html = fs.readFileSync(indexPath, 'utf-8');

    // Extract all src and href attributes
    const attrRegex = /(?:src|href)=["']([^"']+)["']/g;
    const matches = [...html.matchAll(attrRegex)].map((m) => m[1]!);

    console.log('All link/script references in dist/index.html:');
    for (const ref of matches) {
      console.log('  -', ref);
      // Must not be root-relative like /assets/...
      assert.ok(
        !ref.startsWith('/assets/'),
        `Forbidden absolute root path found: ${ref}`
      );
      assert.ok(
        !ref.startsWith('/') || ref.startsWith('//'),
        `Forbidden root path found: ${ref}`
      );
      // Valid references are either relative (./assets/...), data:, or https://
      const isValid =
        ref.startsWith('./') ||
        ref.startsWith('data:') ||
        ref.startsWith('https://') ||
        ref.startsWith('http://');
      assert.ok(isValid, `Reference must be relative or external CDN: ${ref}`);
    }
  });

  it('Scans all JS and CSS bundles in dist/assets for illegal absolute "/assets/" strings', () => {
    const assetsDir = path.join(distDir, 'assets');
    assert.ok(fs.existsSync(assetsDir), 'dist/assets directory must exist');

    const files = fs.readdirSync(assetsDir);
    let violations = 0;

    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.css')) continue;
      const content = fs.readFileSync(path.join(assetsDir, file), 'utf-8');
      
      // Look for literal "/assets/" occurrences that are not part of a larger relative path
      // Regex looks for quotes followed by /assets/
      const matches = [...content.matchAll(/["']\/assets\/[^"']+["']/g)];
      if (matches.length > 0) {
        console.warn(`File ${file} contains root-relative asset strings:`, matches.map(m => m[0]));
        violations += matches.length;
      }
    }

    assert.equal(violations, 0, 'Found zero root-relative /assets/ references in build output');
  });
});

describe('Adversarial Challenge 3: Environment & Mock Toggle Resilience', () => {
  // Evaluates USE_MOCKS logic from src/lib/env.ts:
  // export const USE_MOCKS: boolean =
  //   import.meta.env.VITE_USE_MOCKS != null
  //     ? import.meta.env.VITE_USE_MOCKS === 'true'
  //     : import.meta.env.DEV;
  function evalUseMocks(val: unknown, dev: boolean): boolean {
    return val != null ? val === 'true' : dev;
  }

  it('Correctly resolves standard truthy and falsy values', () => {
    assert.equal(evalUseMocks('true', true), true);
    assert.equal(evalUseMocks('true', false), true);
    assert.equal(evalUseMocks('false', true), false);
    assert.equal(evalUseMocks('false', false), false);
  });

  it('Falls back to DEV when undefined or null', () => {
    assert.equal(evalUseMocks(undefined, true), true);
    assert.equal(evalUseMocks(undefined, false), false);
    assert.equal(evalUseMocks(null, true), true);
    assert.equal(evalUseMocks(null, false), false);
  });

  it('Adversarial input: empty string VITE_USE_MOCKS=""', () => {
    // In .env files or CI scripts, an empty variable VITE_USE_MOCKS=
    // produces an empty string "".
    // Because "" != null is true, it evaluates "" === 'true' which is false!
    const resultDev = evalUseMocks('', true);
    assert.equal(resultDev, false, 'Empty string disables mocks even in DEV');
  });

  it('Adversarial input: casing variations ("TRUE", "True")', () => {
    // Strict comparison === 'true' makes uppercase 'TRUE' evaluate to false
    assert.equal(evalUseMocks('TRUE', true), false);
    assert.equal(evalUseMocks('True', true), false);
  });

  it('Adversarial input: numeric boolean strings ("1", "0")', () => {
    // Some environment systems use 1 for true
    assert.equal(evalUseMocks('1', true), false);
    assert.equal(evalUseMocks('0', true), false);
  });

  it('Adversarial input: whitespace strings (" true ", " false ")', () => {
    assert.equal(evalUseMocks(' true ', true), false);
  });
});

describe('Adversarial Challenge 4: MSW Bootstrap Error Handling Behavior', () => {
  it('Analyzes enableMocking().finally(...) behavior when worker.start() rejects', async () => {
    // In src/main.tsx:
    // async function enableMocking(): Promise<void> {
    //   if (!USE_MOCKS) return;
    //   const { worker } = await import('./mocks/browser');
    //   await worker.start({ ... });
    // }
    // enableMocking().finally(() => { ReactDOM.createRoot(...).render(...) });

    let finallyExecuted = false;
    let unhandledError: Error | null = null;

    async function mockEnableMockingFails(): Promise<void> {
      throw new Error('ServiceWorker registration blocked: InsecureContext');
    }

    const promise = mockEnableMockingFails().finally(() => {
      finallyExecuted = true;
    });

    // The promise returned by .finally() STILL rejects with the original error!
    try {
      await promise;
    } catch (err) {
      unhandledError = err as Error;
    }

    assert.equal(finallyExecuted, true, 'finally block still mounts the application DOM');
    assert.ok(unhandledError, 'Promise rejected with error');
    assert.equal(unhandledError.message, 'ServiceWorker registration blocked: InsecureContext');

    // Without a .catch() attached before .finally(), browsers fire window.onunhandledrejection
  });
});
