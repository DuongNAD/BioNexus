# BioNexus E2E Test Infrastructure & Test Philosophy

## 1. Test Philosophy: Opaque-Box & Requirement-Driven

The BioNexus E2E Testing Suite adheres strictly to an **Opaque-Box, Requirement-Driven, and Progressively Testable** paradigm:

1. **Opaque-Box Validation**:
   - Tests do NOT inspect or couple to internal UI component implementation details (no reliance on internal React hook state, component DOM class trees, or ephemeral variable names).
   - Tests validate the application exclusively through its external contracts:
     - **API & Mock Contracts**: `docs/frontend/04-hop-dong-api-va-mock.md` (HTTP methods, relative endpoints `api/...`, JSON shapes, HTTP status codes, and `MessageKey` enum codes).
     - **Route & Layout Architecture**: `docs/frontend/03-so-do-trang.md` (24 official routes, HashRouter `#/path`, 4 layout shells, and access control guards).
     - **Business State & Transitions**: `docs/PLAN.md` (Sections 4, 5, 6, and 11.3 demo scenarios) and `database/seed_data.sql`.
2. **Deterministic Expected Outputs**:
   - Every single test case derives its expected values from authoritative specification sources: `database/seed_data.sql`, `docs/frontend/04-hop-dong-api-va-mock.md`, and `docs/PLAN.md`.
   - Seed account matrices (e.g., `levanc` 2.950.000 ₫ cart, `phamthid` out-of-stock conflict, `nguyenvana` seller ownership prohibition, `moderator1` approval powers) are verified against the exact database seed constraints.
3. **Progressive Testability & Zero External Friction**:
   - The test infrastructure operates autonomously without external service dependencies, enabling instant verification in Node 22 (using native TypeScript stripping via `node --experimental-strip-types --test`).
   - Dual-mode capability: can run self-contained offline via the authoritative contract engine, or target any active dev server (`http://localhost:5173` or Tomcat `http://localhost:8081`).
   - Every test is self-contained, isolated, and automatically cleans up state between runs via store reset fixtures.

---

## 2. Feature Inventory Coverage Mapping

Mapping of all 47 features from `PROJECT.md` to the 4-Tier E2E Test Suite:

| Feature Code | Feature Description | Tier 1 Coverage | Tier 2 Coverage | Tier 3 Coverage | Tier 4 Coverage |
|--------------|---------------------|-----------------|-----------------|-----------------|-----------------|
| `FEAT-CORE-01` | Vite + React 19 + TypeScript strict + Tailwind v4 + HashRouter | T1-NAV-01 | T2-REG-03 | T3-PAIR-01 | T4-SCN-01 |
| `FEAT-CORE-02` | Test ecosystem: Lucide, Sonner, Vitest/Node test runner | T1-DS-01..05 | T2-AUTH-06 | T3-PAIR-02 | T4-SCN-01..05 |
| `FEAT-DS-01` | Dark "Bio-Luxury" CSS tokens & IUCN 7-color scale | T1-DS-01, T1-DS-03 | T2-SPE-05 | T3-PAIR-07 | T4-SCN-01, T4-SCN-04 |
| `FEAT-DS-02` | Typography hierarchy (3 fonts) & formatting | T1-DS-02 | T2-SPE-04 | T3-PAIR-07 | T4-SCN-01 |
| `FEAT-DS-03` | 37 UI components (Buttons, Inputs, Cards, Badges, Modals) | T1-NAV-05 | T2-PROD-03 | T3-PAIR-01 | T4-SCN-01..05 |
| `FEAT-MEDIA-01` | Wikimedia Commons API free media license verification | T1-NAV-04 | T2-SPE-01 | T3-PAIR-07 | T4-SCN-01 |
| `FEAT-MEDIA-02` | Sharp media optimization (AVIF/WebP/JPG) | T1-SPE-03 | T2-PROD-05 | T3-PAIR-07 | T4-SCN-01 |
| `FEAT-MEDIA-03` | Photos metadata dictionary, photo approval table, `/credits` | T1-NAV-04 | T2-SPE-01 | T3-PAIR-07 | T4-SCN-04 |
| `FEAT-API-01` | Centralized HTTP Client `api<T>()`, 59 `MessageKey` error codes | T1-AUTH-01..05 | T2-AUTH-01..06 | T3-PAIR-01..08 | T4-SCN-01..05 |
| `FEAT-API-02` | 23 DTO TypeScript interfaces & `adapters.ts` (`normalizePage`) | T1-PROD-04 | T2-PROD-01..04 | T3-PAIR-07 | T4-SCN-01 |
| `FEAT-API-03` | TanStack Query v5 cache management & `queryKeys` | T1-CART-01..05 | T2-CART-01..05 | T3-PAIR-01..02 | T4-SCN-01 |
| `FEAT-MSW-01` | MSW 2 Service Worker & seed data 10 tables from `seed_data.sql` | T1-TAX-01..05 | T2-AUTH-02..05 | T3-PAIR-01..08 | T4-SCN-01..05 |
| `FEAT-MSW-02` | Mutable state store `db.ts` with local storage sync & reset | T1-CART-05 | T2-ORD-05 | T3-PAIR-04 | T4-SCN-01..05 |
| `FEAT-MSW-03` | 29 MSW Handlers (Auth, Taxonomy, Species, Products, Cart, Orders, Seller, Admin) | T1-TAX-01..T1-ADM-05 | T2-TAX-01..T2-REG-05 | T3-PAIR-01..08 | T4-SCN-01..05 |
| `FEAT-NAV-01` | 4 Layout Shells (`RootLayout`, `AuthLayout`, `AccountLayout`, `AdminLayout`) | T1-NAV-02 | T2-ADM-01 | T3-PAIR-01 | T4-SCN-01 |
| `FEAT-NAV-02` | Route guards: `RequireAuth`, `RequireRole`, `RequireSeller` with `?next=` | T1-AUTH-05 | T2-SEL-04, T2-ADM-01 | T3-PAIR-01, T3-PAIR-06 | T4-SCN-01 |
| `FEAT-3D-01` | 3D platform isolation, `QualityProvider` (4 tiers), `SceneShell` | T1-NAV-03 | T2-SPE-03 | T3-PAIR-07 | T4-SCN-04 |
| `FEAT-3D-02` | `ParticleMorph` 5 shapes and GLSL shaders | T1-NAV-03 | T2-SPE-04 | T3-PAIR-07 | T4-SCN-04 |
| `FEAT-3D-03` | `BioEarth` 3D globe with 9 IUCN markers & shop flight arcs | T1-SPE-01..02 | T2-SPE-03 | T3-PAIR-07 | T4-SCN-04 |
| `FEAT-3D-04` | `HelixScene` 14 DNA helix steps & synced scroll | T1-NAV-03 | T2-SPE-03 | T3-PAIR-07 | T4-SCN-01 |
| `FEAT-ROUTE-01` | Route 1: Home page (`/`) with 6 narrative biosphere segments | T1-NAV-01 | T2-SPE-03 | T3-PAIR-07 | T4-SCN-01 |
| `FEAT-ROUTE-02` | Route 2: Taxonomy tree (`/taxonomy`) with 6 taxonomic ranks | T1-TAX-01..04 | T2-TAX-01..03 | T3-PAIR-07 | T4-SCN-01 |
| `FEAT-ROUTE-03` | Route 3: Taxonomy node detail (`/taxonomy/:id`) & child nodes | T1-TAX-04..05 | T2-TAX-04..05 | T3-PAIR-07 | T4-SCN-01 |
| `FEAT-ROUTE-04` | Route 4: Species encyclopedia (`/species`) with IUCN filter | T1-SPE-01..02 | T2-SPE-03..04 | T3-PAIR-07 | T4-SCN-04 |
| `FEAT-ROUTE-05` | Route 5: Species profile (`/species/:id`) with 16:9 hero & habitat | T1-SPE-03..04 | T2-SPE-01..02 | T3-PAIR-07 | T4-SCN-01, T4-SCN-04 |
| `FEAT-UI-SEARCH` | Command Palette (`⌘K` / `Ctrl+K`) omni-search | T1-SPE-05 | T2-SPE-03..04 | T3-PAIR-07 | T4-SCN-04 |
| `FEAT-ROUTE-06` | Route 6: Marketplace catalog (`/products`) filtered by species/status | T1-PROD-01..04 | T2-PROD-01..04 | T3-PAIR-06..07 | T4-SCN-01 |
| `FEAT-ROUTE-07` | Route 7: Product detail (`/products/:id`) with origin & seller info | T1-PROD-02 | T2-PROD-05 | T3-PAIR-05 | T4-SCN-01 |
| `FEAT-ROUTE-08` | Route 8 & 9: Login (`/login`) & Register (`/register`) split layout | T1-AUTH-01..02 | T2-AUTH-01..03 | T3-PAIR-01 | T4-SCN-01, T4-SCN-02 |
| `FEAT-ROUTE-09` | Route 11: Shopping cart (`/cart`) with optimistic update & stock check | T1-CART-01..05 | T2-CART-01..05 | T3-PAIR-01..03 | T4-SCN-01, T4-SCN-03 |
| `FEAT-ROUTE-10` | Route 12: Checkout (`/checkout`) with atomic transaction deduction | T1-ORD-01..03 | T2-ORD-01..05 | T3-PAIR-03..04 | T4-SCN-01, T4-SCN-03 |
| `FEAT-ROUTE-11` | Route 13 & 14: Order history (`/orders`) & Detail (`/orders/:id`) | T1-ORD-04..05 | T2-AUTH-06 | T3-PAIR-02 | T4-SCN-01, T4-SCN-05 |
| `FEAT-ROUTE-12` | Route 15: User account center (`/account`) | T1-AUTH-03..04 | T2-AUTH-02..03 | T3-PAIR-02 | T4-SCN-01 |
| `FEAT-ROUTE-13` | Route 16: Seller registration application (`/seller/apply`) | T1-SEL-01 | T2-SEL-02..03 | T3-PAIR-06 | T4-SCN-02 |
| `FEAT-ROUTE-14` | Route 17: Seller dashboard & inventory (`/seller`) | T1-SEL-02 | T2-SEL-04 | T3-PAIR-06 | T4-SCN-02 |
| `FEAT-ROUTE-15` | Route 18: New product listing (`/seller/products/new`) | T1-SEL-03..04 | T2-SEL-05 | T3-PAIR-06 | T4-SCN-01, T4-SCN-02 |
| `FEAT-ROUTE-16` | Route 10: Dedicated admin login (`/admin/login`) | T1-ADM-01..05 | T2-AUTH-04..05 | T3-PAIR-08 | T4-SCN-01 |
| `FEAT-ROUTE-17` | Route 19: Admin dashboard (`/admin`) with biosphere KPIs | T1-ADM-01..05 | T2-ADM-01..02 | T3-PAIR-08 | T4-SCN-01 |
| `FEAT-ROUTE-18` | Route 20: Seller moderation (`/admin/sellers`) approve/reject | T1-ADM-01..02 | T2-ADM-04 | T3-PAIR-06 | T4-SCN-02 |
| `FEAT-ROUTE-19` | Route 21: Product moderation (`/admin/products`) approve/reject | T1-ADM-03 | T2-ADM-05 | T3-PAIR-06 | T4-SCN-01, T4-SCN-02 |
| `FEAT-ROUTE-20` | Route 22: Species catalog administration (`/admin/species`) | T1-ADM-04 | T2-REG-04..05 | T3-PAIR-08 | T4-SCN-01 |
| `FEAT-ROUTE-21` | Route 23: Image copyright credits (`/credits`) | T1-NAV-04 | T2-SPE-01 | T3-PAIR-07 | T4-SCN-04 |
| `FEAT-ROUTE-22` | Route 24: 404 Not Found (`*`) & Dev UI showcase (`/dev/ui`) | T1-NAV-01, T1-NAV-05 | T2-TAX-03, T2-PROD-05 | T3-PAIR-01 | T4-SCN-05 |
| `FEAT-QA-01` | Visual rendering verification across 24 routes | T1-NAV-01..05 | T2-TAX-01..05 | T3-PAIR-01..08 | T4-SCN-01..05 |
| `FEAT-QA-02` | WCAG 2.2 AA accessibility verification | T1-DS-01..03 | T2-SPE-04 | T3-PAIR-07 | T4-SCN-04 |
| `FEAT-QA-03` | 3D graphics performance measurement & poster fallback | T1-NAV-03 | T2-SPE-05 | T3-PAIR-07 | T4-SCN-01 |
| `FEAT-QA-04` | 5-Minute Grand Demo scenario rehearsed & confirmed | T1-ORD-01..05 | T2-ORD-03..05 | T3-PAIR-03..06 | T4-SCN-01 |

---

## 3. Test Architecture & Runner Invocation

### 3.1 Test Directory Structure

```text
frontend/tests/e2e/
├── harness/
│   ├── types.ts          # Core DTOs, Enums, Models, Request/Response contracts
│   ├── seed-data.ts      # Exact authoritative seed data from seed_data.sql & docs 04
│   ├── store.ts          # Isolated in-memory state engine & business rule validator
│   ├── client.ts         # High-level Opaque-Box client with session & auth tracking
│   └── specs.ts          # 24 routes catalog, IUCN colors, environment parser, VND formatter
├── tier1-features.test.ts    # Tier 1: 50 Feature Coverage test cases (>=5 per feature)
├── tier2-boundaries.test.ts  # Tier 2: 46 Boundary, limits, and error test cases
├── tier3-pairwise.test.ts    # Tier 3: 8 Pairwise cross-feature integration test cases
└── tier4-realworld.test.ts   # Tier 4: 5 End-to-end real-world workload scenarios (PLAN 11.3)
```

### 3.2 Runner Commands

The test suite requires Node 22 (LTS) and executes natively without external build steps or heavy dependencies:

```powershell
# 1. Execute all 4 tiers in a single run:
node --experimental-strip-types --test frontend/tests/e2e/*.test.ts

# 2. Execute individual tiers:
node --experimental-strip-types --test frontend/tests/e2e/tier1-features.test.ts
node --experimental-strip-types --test frontend/tests/e2e/tier2-boundaries.test.ts
node --experimental-strip-types --test frontend/tests/e2e/tier3-pairwise.test.ts
node --experimental-strip-types --test frontend/tests/e2e/tier4-realworld.test.ts

# 3. Compatible with Vitest once configured in package.json:
npm run test:e2e
# or
npx vitest run tests/e2e/
```

---

## 4. 4-Tier Test Design & Coverage Matrices

### Tier 1: Feature Coverage (50 Test Cases)
- **Taxonomy Navigation**: 5 tests covering root kingdoms, chordata/tracheophyta child nodes, Squamata families, full 6-rank breadcrumb resolution, and Genus species attachment.
- **Species Encyclopedia**: 5 tests covering baseline 9 species, IUCN rating filters (LC: 3, NT: 1, VU: 3, EN: 1, CR: 1), individual profile fetching, climate string parser, and query search.
- **Marketplace Products**: 5 tests covering 7 approved products baseline, product details with shop/species linkages, species filtering, pagination (page, size, total), and keyword queries.
- **User Authentication**: 5 tests covering `levanc` login, new user registration, `/api/me` profile retrieval, active seller profile linkage, and session logout rejection.
- **Shopping Cart**: 5 tests covering `levanc` seed cart (2 items, 2.950.000 ₫), adding products with stock check, cumulative additions, updating quantities, and single/full cart deletion.
- **Checkout & Orders**: 5 tests covering cart checkout with stock deduction, direct purchase without cart, `ORD-YYYY-XXXXXX` code format verification, user order history, and order detail retrieval.
- **Seller Management**: 5 tests covering seller application (PENDING), seller inventory inspection, product creation (PENDING), catalog invisibility check, and merchant metadata verification.
- **Admin Moderation**: 5 tests covering moderator login, seller approval (ACTIVE), product approval (APPROVED), biologist species creation, and superadmin global privileges.
- **Navigation Shells & Route Registry**: 5 tests covering 24 route registrations, 4 layout shells, 3D route isolation, `/credits` public route, and `/dev/ui` component showcase.
- **Design System & Media**: 5 tests covering 7-color IUCN scale tokens, VND currency formatting (₫), IUCN severity hierarchy, environment parser edge cases, and positive integer prices.

### Tier 2: Boundary & Corner Cases (46 Test Cases)
- **Taxonomy Boundaries**: Non-numeric IDs (400), negative/zero IDs (400), non-existent ID 9999 (404), leaf Genus children (empty array), non-leaf direct species (empty array).
- **Species Boundaries**: Non-existent species 9999 (404), malformed IDs (400), empty query handling, zero-match searches, malformed climate strings without errors.
- **Product Boundaries**: Page <= 0 (400), page size <= 0 or > 48 (400), boundary sizes 1 and 48, page beyond total count, non-existent product ID (404).
- **Auth & Security Boundaries**: Invalid password (401), BANNED user login (403), INACTIVE user login (403), INACTIVE admin login (403), BANNED biologist login (403), tampered JWT signature (401).
- **Cart Limits**: Quantity <= 0 (400), quantity > stock (409), cumulative addition > stock (409), adding SOLD_OUT product (409), adding PENDING product (409).
- **Checkout Concurrency**: Empty cart checkout (400), blank/whitespace shipping address (400), cart item exceeding stock atomic rollback (409), cart item SOLD_OUT rollback (409), automatic SOLD_OUT transition when stock reaches 0.
- **Seller Lifecycle**: Buying own shop product blocked (403), duplicate seller application (409), duplicate shop name (409), non-ACTIVE seller product creation blocked (403), non-existent species ID (400).
- **Admin Privileges**: Regular user calling admin endpoints (403), Biologist moderating shop/product (403), Moderator creating species (403), illegal shop status transition (409), illegal product status transition (409).
- **Registration Constraints**: Duplicate username (409), duplicate email (409), missing required fields (400), species under non-GENUS node (400), duplicate species scientific name (409).

### Tier 3: Cross-Feature Combinations (8 Test Cases)
- **T3-PAIR-01**: Cart + Auth lifecycle (guest access blocked, target preserved in `?next=`, restored on login).
- **T3-PAIR-02**: Account switching (swaps cart items and order histories with strict tenant separation).
- **T3-PAIR-03**: Checkout + Inventory contention (concurrent stock depletion triggers atomic rollback without partial deductions).
- **T3-PAIR-04**: Stock depletion (last unit purchase automatically sets status to SOLD_OUT and blocks concurrent buyers).
- **T3-PAIR-05**: Shop ownership (merchant blocked from buying own shop product, other users allowed).
- **T3-PAIR-06**: End-to-end merchant pipeline (user registers -> applies for shop -> shop approved -> product created -> product approved -> appears in public catalog).
- **T3-PAIR-07**: Taxonomy to Species to Marketplace pipeline (drill down Animalia to Python genus -> select Ball Python -> retrieve linked shop products).
- **T3-PAIR-08**: Role privilege isolation (Moderator cannot manage species, Biologist cannot moderate products).

### Tier 4: Real-World Workload Scenarios (5 Comprehensive Scenarios)
- **T4-SCN-01: PLAN.md Section 11.3 — The 5-Minute Grand Demo Flow**:
  1. Browse Taxonomy: Animalia -> Chordata -> Reptilia -> Squamata -> Python -> 2 species with IUCN badges NT & VU.
  2. Open species profile (Ball Python) -> view habitat & climate -> attempt unauthenticated purchase -> blocked with 401.
  3. Login as `levanc` (`123456`) -> inspect cart (2 items, 2.950.000 ₫) -> checkout -> verify order in "Đơn của tôi".
  4. Login as `nguyenvana` (`123456`) -> access seller dashboard -> create new product (PENDING) -> verify hidden from public store.
  5. Login as `moderator1` (`admin123`) -> view pending queue -> approve product -> verify it immediately appears on public store.
  6. Security demonstration: call admin endpoint with user token -> 403; tamper with token signature -> 401.
- **T4-SCN-02: New Merchant Onboarding & Multi-Product Launch Flow**:
  - Full merchant onboarding journey from registration, license submission, admin approval, multiple product listings (approved & rejected), and first customer purchase.
- **T4-SCN-03: Cart Recovery & Inventory Conflict Resolution (phamthid)**:
  - User `phamthid` recovers from an invalid cart containing an item exceeding stock (5 > 3) and a SOLD_OUT item, corrects quantities, and successfully completes checkout.
- **T4-SCN-04: Scientific Biodiversity Discovery & Command Palette Flow**:
  - Visitor uses Command Palette (`⌘K`) to query "axolotl", inspects CR status and aquatic specs (14-18°C), traces taxonomy to Amphibia, and filters all critically endangered taxa.
- **T4-SCN-05: Multi-Tenant Security & Privilege Audit Workflow**:
  - Exhaustive security sweep validating defenses against inactive user/admin logins, banned user/admin logins, privilege escalation, and cross-user order enumeration leaks.
