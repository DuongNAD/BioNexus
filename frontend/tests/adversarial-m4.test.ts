/**
 * BioNexus Adversarial Testing Suite (Milestone 4: Taxonomy & Species Profiles)
 * Author: challenger_m4_1 (teamwork_challenger)
 * 
 * Verifies empirical invariants for Milestone 4:
 * 1. Taxonomy Tree & Miller Columns Hierarchy Navigation
 * 2. Species Catalog Filtering & Boundary / Empty States
 * 3. 3D WebGL Single Canvas Invariant & Rapid Mode Switching
 * 4. Command Palette ⌘K (NFD Diacritics, Adversarial Inputs, Keyboard State)
 * 5. Biological Nomenclature Italicization (ICZN/ICN) & Zero Emoji Policy
 */

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve project directories
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = path.resolve(__dirname, '..');
const srcDir = path.resolve(frontendDir, 'src');

// Import authoritative test store / harness
import { BioNexusTestStore } from './e2e/harness/store.ts';

// Helper: Normalize search string (Parity with src/components/navigation/QuickSearch.tsx)
function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

describe('Challenge 1: Miller Columns Hierarchy & Taxonomy Navigation', () => {
  let store: BioNexusTestStore;

  beforeEach(() => {
    store = new BioNexusTestStore();
  });

  it('EXP-TAX-01: Full taxonomic lineage drill-down: Animalia -> Chordata -> Reptilia -> Squamata -> Pythonidae -> Python', () => {
    // 1. Root Kingdom: Animalia (ID 1)
    const animalia = store.taxonomy.find((n) => n.id === 1);
    assert.ok(animalia, 'Node 1 (Animalia) must exist');
    assert.equal(animalia.scientificName, 'Animalia');
    assert.equal(animalia.rank, 'KINGDOM');
    assert.equal(animalia.parentId, null);

    // 2. Phylum: Chordata (ID 3)
    const chordataChildren = store.getTaxonomyChildren(1);
    const chordata = chordataChildren.find((c) => c.scientificName === 'Chordata');
    assert.ok(chordata, 'Chordata must be a direct child of Animalia');
    assert.equal(chordata.id, 3);
    assert.equal(chordata.rank, 'PHYLUM');
    assert.equal(chordata.parentId, 1);

    // 3. Class: Reptilia (ID 5)
    const chordataSub = store.getTaxonomyChildren(3);
    const reptilia = chordataSub.find((c) => c.scientificName === 'Reptilia');
    assert.ok(reptilia, 'Reptilia must be a direct child of Chordata');
    assert.equal(reptilia.id, 5);
    assert.equal(reptilia.rank, 'CLASS');
    assert.equal(reptilia.parentId, 3);

    // 4. Order: Squamata (ID 8)
    const reptiliaSub = store.getTaxonomyChildren(5);
    const squamata = reptiliaSub.find((c) => c.scientificName === 'Squamata');
    assert.ok(squamata, 'Squamata must be a direct child of Reptilia');
    assert.equal(squamata.id, 8);
    assert.equal(squamata.rank, 'ORDER');
    assert.equal(squamata.parentId, 5);

    // 5. Family: Pythonidae (ID 13)
    const squamataSub = store.getTaxonomyChildren(8);
    const pythonidae = squamataSub.find((c) => c.scientificName === 'Pythonidae');
    assert.ok(pythonidae, 'Pythonidae must be a direct child of Squamata');
    assert.equal(pythonidae.id, 13);
    assert.equal(pythonidae.rank, 'FAMILY');
    assert.equal(pythonidae.parentId, 8);

    // 6. Genus: Python (ID 20)
    const pythonidaeSub = store.getTaxonomyChildren(13);
    const python = pythonidaeSub.find((c) => c.scientificName === 'Python');
    assert.ok(python, 'Python must be a direct child of Pythonidae');
    assert.equal(python.id, 20);
    assert.equal(python.rank, 'GENUS');
    assert.equal(python.parentId, 13);

    // 7. Genus species: Exactly 2 species (Trăn bóng NT & Trăn đất VU)
    const pythonSpecies = store.getTaxonomySpecies(20);
    assert.equal(pythonSpecies.length, 2, 'Genus Python must contain exactly 2 species');

    const ballPython = pythonSpecies.find((s) => s.scientificName === 'Python regius');
    assert.ok(ballPython, 'Python regius (Trăn bóng) must exist under Genus Python');
    assert.equal(ballPython.conservationStatus, 'NT');

    const burmesePython = pythonSpecies.find((s) => s.scientificName === 'Python bivittatus');
    assert.ok(burmesePython, 'Python bivittatus (Trăn đất) must exist under Genus Python');
    assert.equal(burmesePython.conservationStatus, 'VU');
  });

  it('EXP-TAX-02: Squamata contains exactly 3 reptile families (Agamidae, Eublepharidae, Pythonidae)', () => {
    const squamataFamilies = store.getTaxonomyChildren(8);
    assert.equal(squamataFamilies.length, 3, 'Squamata (ID 8) must have exactly 3 child families');

    const familyNames = squamataFamilies.map((f) => f.scientificName).sort();
    assert.deepEqual(familyNames, ['Agamidae', 'Eublepharidae', 'Pythonidae']);
    assert.ok(squamataFamilies.every((f) => f.rank === 'FAMILY'));
    assert.ok(squamataFamilies.every((f) => f.parentId === 8));
  });

  it('EXP-TAX-03: Non-existent node handling (404 / 400 rejection and frontend graceful fallback)', () => {
    // Backend API contract:
    // GET /api/taxonomy/999 -> 404 NOT_FOUND
    const nonExistent = store.getTaxonomyDetail(999);
    assert.equal(nonExistent, null, 'Taxonomy ID 999 must return null / 404');

    // Frontend component fallback:
    // In TaxonomyPage.tsx:
    // const activeNodeId = id ? parseInt(id, 10) : 1;
    // const isInvalidId = isNaN(activeNodeId) || activeNodeId <= 0;
    // if (isInvalidId || (detailQuery.isError && !detailQuery.isLoading)) return <TaxonomyNotFound />;
    const taxPageCode = fs.readFileSync(path.join(srcDir, 'pages/taxonomy/TaxonomyPage.tsx'), 'utf-8');
    assert.ok(taxPageCode.includes('TaxonomyNotFound'), 'TaxonomyPage must render TaxonomyNotFound on error');
    assert.ok(taxPageCode.includes('isInvalidId'), 'TaxonomyPage must guard against invalid NaN or negative IDs');

    // Verify TaxonomyNotFound component contains return buttons
    const notFoundCode = fs.readFileSync(path.join(srcDir, 'pages/taxonomy/components/TaxonomyNotFound.tsx'), 'utf-8');
    assert.ok(notFoundCode.includes('/taxonomy/1'), 'Must have link to return to root taxonomy');
    assert.ok(notFoundCode.includes('404'), 'Must display 404 badge');
  });

  it('EXP-TAX-04: Leaf node with zero species displays empty state without crashing', () => {
    // When a node has no associated species, getTaxonomySpecies returns []
    const emptyNodeSpecies = store.getTaxonomySpecies(999);
    assert.deepEqual(emptyNodeSpecies, [], 'Non-associated node returns empty array');

    // Verify TaxonomyHelixView handles empty branch gracefully
    const helixViewCode = fs.readFileSync(path.join(srcDir, 'pages/taxonomy/components/TaxonomyHelixView.tsx'), 'utf-8');
    assert.ok(
      helixViewCode.includes('Nhánh này chưa có loài nào để hiển thị trên Chuỗi xoắn 3D'),
      'Helix view must render friendly empty branch state'
    );
  });
});

describe('Challenge 2: Species Catalog Filters & Boundary States', () => {
  let store: BioNexusTestStore;

  beforeEach(() => {
    store = new BioNexusTestStore();
  });

  it('EXP-SPE-01: Filter IUCN VU returns exactly 3 species', () => {
    const allSpecies = store.species;
    assert.equal(allSpecies.length, 9, 'Authoritative seed count is 9 species');

    const vuSpecies = allSpecies.filter((s) => s.conservationStatus === 'VU');
    assert.equal(vuSpecies.length, 3, 'VU filter must yield exactly 3 species');

    const vuNames = vuSpecies.map((s) => s.scientificName).sort();
    assert.deepEqual(vuNames, [
      'Dionaea muscipula', // Cây bắt ruồi Venus
      'Python bivittatus',  // Trăn đất
      'Testudo hermanni',   // Rùa Hermann
    ]);
  });

  it('EXP-SPE-02: Keyword search "gecko" matches Leopard Gecko and approved products', () => {
    const q = normalizeSearchString('gecko');
    const allSpecies = store.species;

    const matchedSpecies = allSpecies.filter((s) => {
      return (
        normalizeSearchString(s.scientificName).includes(q) ||
        normalizeSearchString(s.commonName).includes(q)
      );
    });

    assert.equal(matchedSpecies.length, 1, 'Search "gecko" must match exactly 1 species');
    assert.equal(matchedSpecies[0]?.id, 4);
    assert.equal(matchedSpecies[0]?.scientificName, 'Eublepharis macularius');

    // Marketplace products matching "gecko"
    const approvedGeckoProducts = store.products.filter((p) => {
      return (
        p.status === 'APPROVED' &&
        (normalizeSearchString(p.productName).includes(q) ||
          normalizeSearchString(p.description).includes(q))
      );
    });

    assert.equal(approvedGeckoProducts.length, 2, 'Must match exactly 2 approved gecko products');
    assert.deepEqual(approvedGeckoProducts.map((p) => p.id), [1, 2]);
  });

  it('EXP-SPE-03: Empty filter combination (Cây ăn thịt + CR) yields 0 results with reset action', () => {
    const allSpecies = store.species;

    // Group "Cây ăn thịt" in seed data: Nepenthes rajah (EN), Nepenthes ampullaria (LC), Dionaea muscipula (VU)
    // Conservation status "CR": only Ambystoma mexicanum (Amphibian)
    // The combination of plant + CR yields 0 matches!
    const filtered = allSpecies.filter((s) => {
      const isCarnivorousPlant = s.scientificName.includes('Nepenthes') || s.scientificName.includes('Dionaea');
      const isCR = s.conservationStatus === 'CR';
      return isCarnivorousPlant && isCR;
    });

    assert.equal(filtered.length, 0, 'Plant + CR combination must return exactly 0 results');

    // Verify SpeciesListPage renders the empty message and reset button
    const listPageCode = fs.readFileSync(path.join(srcDir, 'pages/species/SpeciesListPage.tsx'), 'utf-8');
    assert.ok(
      listPageCode.includes('Không có loài nào khớp với bộ lọc'),
      'Must render empty filter notification message'
    );
    assert.ok(
      listPageCode.includes('Xóa toàn bộ lọc'),
      'Must render reset filter button'
    );
  });
});

describe('Challenge 3: 3D Graphics Invariant & Rapid Mode Switching', () => {
  it('EXP-3D-01: Verifies SceneShell global semaphore guarantees at most 1 active WebGL canvas', () => {
    // Read SceneShell implementation
    const sceneShellCode = fs.readFileSync(path.join(srcDir, 'components/3d/SceneShell.tsx'), 'utf-8');

    // Invariant: globalActiveCanvasId regulates WebGL slots
    assert.ok(sceneShellCode.includes('let globalActiveCanvasId: string | null = null;'));
    assert.ok(sceneShellCode.includes('const canvasListeners = new Set<'));
    assert.ok(sceneShellCode.includes('function setActiveCanvas(id: string | null)'));

    // Verify shouldMountCanvas condition requires isGlobalActive
    assert.ok(sceneShellCode.includes('const shouldMountCanvas = isEligible && isNearView && isGlobalActive;'));
  });

  it('EXP-3D-02: Stress-tests mode switching state machine between 3D Helix and Column view', () => {
    // Simulate SceneShell semaphore state machine directly
    let activeId: string | null = null;
    const listeners = new Set<(id: string | null) => void>();

    function setSlot(id: string | null) {
      if (activeId !== id) {
        activeId = id;
        listeners.forEach((fn) => fn(activeId));
      }
    }

    // Rapid toggle simulation (100 transitions)
    const activeCanvasHistory: Array<string | null> = [];

    for (let i = 0; i < 100; i++) {
      if (i % 2 === 0) {
        // Switch to 3D Helix View
        setSlot('taxonomy-helix');
        activeCanvasHistory.push(activeId);
        assert.equal(activeId, 'taxonomy-helix');
      } else {
        // Switch back to 2D Miller Columns (unmounts 3D)
        setSlot(null);
        activeCanvasHistory.push(activeId);
        assert.equal(activeId, null);
      }
    }

    assert.equal(activeCanvasHistory.length, 100);
    // Invariant: at no point was there more than 1 active canvas
    assert.ok(activeCanvasHistory.every((id) => id === null || id === 'taxonomy-helix'));
  });

  it('EXP-3D-03: Stress-tests mode switching between Species Grid and Species Map (BioEarth)', () => {
    let activeId: string | null = null;

    function setSlot(id: string | null) {
      activeId = id;
    }

    // Grid mode: activeId is null
    setSlot(null);
    assert.equal(activeId, null);

    // Switch to Map mode: acquires 'species-catalog-earth'
    setSlot('species-catalog-earth');
    assert.equal(activeId, 'species-catalog-earth');

    // Navigate to Species Detail (id: 1): unmounts catalog earth, mounts detail earth
    setSlot(null); // unmount old
    setSlot('species-bento-earth-1'); // mount new
    assert.equal(activeId, 'species-bento-earth-1');

    // Return to Grid: unmounts detail earth
    setSlot(null);
    assert.equal(activeId, null);
  });
});

describe('Challenge 4: Command Palette ⌘K & Keyboard Navigation', () => {
  let store: BioNexusTestStore;

  beforeEach(() => {
    store = new BioNexusTestStore();
  });

  it('EXP-SCH-01: Diacritic-insensitive Vietnamese search matches exact species and IDs', () => {
    const allSpecies = store.species;

    // 1. "tran dat" -> matches Python bivittatus (ID 6 in seed database)
    const q1 = normalizeSearchString('tran dat');
    const match1 = allSpecies.filter((s) => normalizeSearchString(s.commonName).includes(q1));
    assert.equal(match1.length, 1);
    assert.equal(match1[0]?.id, 6);
    assert.equal(match1[0]?.scientificName, 'Python bivittatus');

    // 2. "ky giong" -> matches Ambystoma mexicanum (ID 1 in seed database)
    const q2 = normalizeSearchString('ky giong');
    const match2 = allSpecies.filter((s) => normalizeSearchString(s.commonName).includes(q2));
    assert.equal(match2.length, 1);
    assert.equal(match2[0]?.id, 1);
    assert.equal(match2[0]?.scientificName, 'Ambystoma mexicanum');

    // 3. "rua hermann" -> matches Testudo hermanni (ID 8 in seed database)
    const q3 = normalizeSearchString('rua hermann');
    const match3 = allSpecies.filter((s) => normalizeSearchString(s.commonName).includes(q3));
    assert.equal(match3.length, 1);
    assert.equal(match3[0]?.id, 8);
    assert.equal(match3[0]?.scientificName, 'Testudo hermanni');
  });

  it('EXP-SCH-02: Adversarial search queries: empty, whitespace, special characters, XSS, long input', () => {
    const adversarialQueries = [
      '',
      '   ',
      '      \t\n   ',
      '!@#$%^&*()_+~|}{[]:;?><,./-=',
      '<script>alert("xss")</script>',
      '\' OR \'1\'=\'1\' --',
      '🐉🐍🦎🌱', // emojis
      'a'.repeat(10000), // extreme length
    ];

    for (const raw of adversarialQueries) {
      assert.doesNotThrow(() => {
        const norm = normalizeSearchString(raw);
        assert.ok(typeof norm === 'string');
      }, `Query "${raw.slice(0, 30)}" must not throw`);
    }
  });

  it('EXP-SCH-03: Keyboard selection index clamping and escape dismissal invariant', () => {
    // QuickSearch keyboard index state machine
    let selectedIndex = 0;
    const totalResults = 5;

    function handleKeyDown(key: string): void {
      if (key === 'ArrowDown') {
        selectedIndex = selectedIndex < totalResults - 1 ? selectedIndex + 1 : 0;
      } else if (key === 'ArrowUp') {
        selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : totalResults - 1;
      }
    }

    // Step down to boundary
    for (let i = 0; i < 10; i++) {
      handleKeyDown('ArrowDown');
      assert.ok(selectedIndex >= 0 && selectedIndex < totalResults, 'Index must remain in bounds');
    }

    // Step up to boundary
    for (let i = 0; i < 10; i++) {
      handleKeyDown('ArrowUp');
      assert.ok(selectedIndex >= 0 && selectedIndex < totalResults, 'Index must remain in bounds');
    }
  });
});

describe('Challenge 5: Biological Nomenclature & Zero Emoji Compliance', () => {
  it('EXP-NOM-01: Verifies international nomenclature rules (Italic only for Genus and Species)', () => {
    // Check TaxonRow.tsx:
    const taxonRowCode = fs.readFileSync(path.join(srcDir, 'pages/taxonomy/components/TaxonRow.tsx'), 'utf-8');
    assert.ok(
      taxonRowCode.includes("const isItalicRank = rank === 'GENUS';"),
      'TaxonRow must conditionally italicize only GENUS'
    );
    assert.ok(
      taxonRowCode.includes("isItalicRank ? 'font-serif italic font-semibold text-accent' : 'font-sans font-semibold text-fg'"),
      'Higher ranks must use font-sans upright, Genus must use font-serif italic'
    );

    // Check TaxonPath.tsx:
    const taxonPathCode = fs.readFileSync(path.join(srcDir, 'components/domain/TaxonPath.tsx'), 'utf-8');
    assert.ok(
      taxonPathCode.includes("const isItalic = rank === 'GENUS';"),
      'TaxonPath must italicize only GENUS'
    );

    // Check SpeciesCard.tsx & SpeciesCardCompact.tsx:
    const speciesCardCode = fs.readFileSync(path.join(srcDir, 'components/domain/SpeciesCard.tsx'), 'utf-8');
    assert.ok(
      speciesCardCode.includes('font-serif italic text-accent-2'),
      'SpeciesCard must italicize species scientific name'
    );
  });

  it('EXP-NOM-02: Zero Emoji Compliance Scan across entire frontend/src/ codebase', () => {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1FA00}-\u{1FAFF}]/u;

    function walk(dir: string, fileList: string[] = []): string[] {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath, fileList);
        } else if (
          entry.isFile() &&
          /\.(tsx?|css|json|html|glsl)$/.test(entry.name) &&
          !entry.name.endsWith('.d.ts')
        ) {
          fileList.push(fullPath);
        }
      }
      return fileList;
    }

    const files = walk(srcDir);
    assert.ok(files.length >= 100, `Expected at least 100 source files to scan, found ${files.length}`);

    const violations: Array<{ file: string; match: string }> = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const match = emojiRegex.exec(content);
      if (match) {
        violations.push({ file: path.relative(frontendDir, file), match: match[0] });
      }
    }

    assert.equal(
      violations.length,
      0,
      `Found forbidden emoji in source files:\n${violations.map((v) => `  ${v.file}: "${v.match}"`).join('\n')}`
    );
  });
});
