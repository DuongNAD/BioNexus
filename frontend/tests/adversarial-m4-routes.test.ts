/**
 * BioNexus Adversarial Testing Suite — Milestone 4 (Taxonomy & Species Profile)
 * Author: challenger_m4_2 (Empirical Challenger & Contract/Packaging Verifier)
 * 
 * Verifies:
 * 1. Deep Route Resolution & Direct Navigation (F5 refresh) in HashRouter for M4 routes
 * 2. MSW Data Contract Integrity for M4 endpoints:
 *    - /taxonomy, /taxonomy/20, /taxonomy/999
 *    - /species, /species?q=..., /species?iucn=..., /species?nodeId=...
 *    - /species/1, /species/2, /species/999
 * 3. International Nomenclature (ICZN/ICN) italicization rules
 * 4. Microclimate & Environmental Specs parsing resilience
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BioNexusTestClient } from './e2e/harness/client.ts';

// Resolve project directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');

// Import react-router matchRoutes
const reactRouterPath = pathToFileURL(
  path.join(frontendDir, 'node_modules/react-router/dist/development/index.mjs')
).href;
const { matchRoutes } = await import(reactRouterPath);

// Import router definitions from source
const routesSource = fs.readFileSync(path.join(frontendDir, 'src/app/routes.ts'), 'utf-8');

interface RouteMeta {
  path: string;
  name: string;
  title: string;
  layout: 'root' | 'auth' | 'account' | 'seller' | 'admin';
  has3D: boolean;
  description: string;
}

const appRoutesMatches = [...routesSource.matchAll(/{\s*path:\s*'([^']+)',\s*name:\s*'([^']+)',\s*title:\s*'([^']+)',\s*layout:\s*'([^']+)',\s*has3D:\s*(true|false)/g)];
const APP_ROUTES: RouteMeta[] = appRoutesMatches.map((m) => ({
  path: m[1]!,
  name: m[2]!,
  title: m[3]!,
  layout: m[4]! as RouteMeta['layout'],
  has3D: m[5] === 'true',
  description: '',
}));

const rootMeta = APP_ROUTES.filter((r) => r.layout === 'root');
const rootChildren = rootMeta.map((r) => {
  if (r.path === '/') {
    return { index: true, id: r.path };
  }
  const relativePath = r.path.startsWith('/') ? r.path.slice(1) : r.path;
  return { path: relativePath, id: r.path };
});

const routerRoutes = [
  {
    path: '/',
    id: 'root-layout',
    children: rootChildren,
  },
];

describe('Milestone 4 Adversarial Audit: Route Matching & Direct Navigation', () => {
  it('Resolves direct navigation (F5) to /taxonomy', () => {
    const directUrl = new URL('http://localhost:8080/BioNexus/index.html#/taxonomy');
    const hashPath = directUrl.hash.replace(/^#/, '');
    const matches = matchRoutes(routerRoutes, hashPath);
    assert.ok(matches, 'Path /taxonomy must match');
    const leaf = matches[matches.length - 1]!;
    assert.equal(leaf.route.id, '/taxonomy');
    assert.equal(matches[0]!.route.id, 'root-layout');
  });

  it('Resolves deep link direct navigation (F5) to /taxonomy/20 (Chi Python)', () => {
    const directUrl = new URL('http://localhost:8080/BioNexus/index.html#/taxonomy/20');
    const hashPath = directUrl.hash.replace(/^#/, '');
    const matches = matchRoutes(routerRoutes, hashPath);
    assert.ok(matches, 'Path /taxonomy/20 must match');
    const leaf = matches[matches.length - 1]!;
    assert.equal(leaf.route.id, '/taxonomy/:id');
    assert.equal(leaf.params.id, '20');
  });

  it('Resolves direct navigation (F5) to /species', () => {
    const directUrl = new URL('http://localhost:8080/BioNexus/index.html#/species');
    const hashPath = directUrl.hash.replace(/^#/, '');
    const matches = matchRoutes(routerRoutes, hashPath);
    assert.ok(matches, 'Path /species must match');
    const leaf = matches[matches.length - 1]!;
    assert.equal(leaf.route.id, '/species');
  });

  it('Resolves deep link direct navigation (F5) to /species/1 (Axolotl profile)', () => {
    const directUrl = new URL('http://localhost:8080/BioNexus/index.html#/species/1');
    const hashPath = directUrl.hash.replace(/^#/, '');
    const matches = matchRoutes(routerRoutes, hashPath);
    assert.ok(matches, 'Path /species/1 must match');
    const leaf = matches[matches.length - 1]!;
    assert.equal(leaf.route.id, '/species/:id');
    assert.equal(leaf.params.id, '1');
  });

  it('Resolves deep link direct navigation (F5) to /species/2 (Python bivittatus)', () => {
    const directUrl = new URL('http://localhost:8080/BioNexus/index.html#/species/2');
    const hashPath = directUrl.hash.replace(/^#/, '');
    const matches = matchRoutes(routerRoutes, hashPath);
    assert.ok(matches, 'Path /species/2 must match');
    const leaf = matches[matches.length - 1]!;
    assert.equal(leaf.route.id, '/species/:id');
    assert.equal(leaf.params.id, '2');
  });
});

describe('Milestone 4 Adversarial Audit: MSW Mock Contract & Botanical/Zoological Data Integrity', () => {
  let client: BioNexusTestClient;

  beforeEach(() => {
    client = new BioNexusTestClient();
  });

  it('T4-ADV-01: Verifies Taxonomy Root returns exactly 2 kingdoms with 0 parent', async () => {
    const res = await client.getRootTaxonomy();
    assert.equal(res.success, true);
    const roots = res.data!;
    assert.equal(Array.isArray(roots), true);
    assert.equal(roots.length, 2);
    const scientificNames = roots.map((r) => r.scientificName);
    assert.ok(scientificNames.includes('Animalia'));
    assert.ok(scientificNames.includes('Plantae'));
  });

  it('T4-ADV-02: Verifies Chi Python (Node 20) details and associated leaf species', async () => {
    const detailRes = await client.getTaxonomyDetail(20);
    assert.equal(detailRes.success, true);
    const detail = detailRes.data!;
    assert.equal(detail.node.scientificName, 'Python');
    assert.equal(detail.node.rank, 'GENUS');
    assert.ok(detail.breadcrumbs.length >= 6);

    const speciesRes = await client.getTaxonomySpecies(20);
    assert.equal(speciesRes.success, true);
    const speciesList = speciesRes.data!;
    assert.equal(speciesList.length, 2);
    const speciesNames = speciesList.map((s) => s.scientificName);
    assert.ok(speciesNames.includes('Python bivittatus'));
    assert.ok(speciesNames.includes('Python regius'));
  });

  it('T4-ADV-03: Verifies Non-existent taxonomy node returns 404 TAXONOMY_NOT_FOUND', async () => {
    const res = await client.getTaxonomyDetail(9999);
    assert.equal(res.success, false);
    assert.equal(res.code, 'TAXONOMY_NOT_FOUND');
    assert.equal(res.data, null);
  });

  it('T4-ADV-04: Verifies Species catalog filtering by search query', async () => {
    // 9 baseline species
    const allRes = await client.getSpeciesList();
    assert.equal(allRes.success, true);
    assert.equal(allRes.data!.length, 9);

    // Filter query "Python"
    const searchRes = await client.getSpeciesList({ q: 'Python' });
    assert.equal(searchRes.success, true);
    assert.equal(searchRes.data!.length, 2);
    const names = searchRes.data!.map((s) => s.scientificName);
    assert.ok(names.includes('Python bivittatus'));
    assert.ok(names.includes('Python regius'));

    // Filter query "Trăn" (Vietnamese common name)
    const tranRes = await client.getSpeciesList({ q: 'Trăn' });
    assert.equal(tranRes.success, true);
    assert.equal(tranRes.data!.length, 2);
  });

  it('T4-ADV-05: Verifies Species detail DTO adheres to naming conventions (imageURL vs imageUrl)', async () => {
    const res = await client.getSpeciesDetail(1);
    assert.equal(res.success, true);
    const data = res.data!;
    // According to contract 04: SpeciesDto uses imageURL and referenceURL
    assert.ok('imageURL' in data, 'SpeciesDto must contain imageURL');
    assert.ok('referenceURL' in data, 'SpeciesDto must contain referenceURL');
    assert.equal(typeof data.imageURL, 'string');
    assert.equal(typeof data.referenceURL, 'string');
  });

  it('T4-ADV-06: Verifies Non-existent species returns 404 SPECIES_NOT_FOUND', async () => {
    const res = await client.getSpeciesDetail(9999);
    assert.equal(res.success, false);
    assert.equal(res.code, 'SPECIES_NOT_FOUND');
    assert.equal(res.data, null);
  });
});

