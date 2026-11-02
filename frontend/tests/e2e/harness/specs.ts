/**
 * BioNexus E2E Specifications & Domain Rules
 * Sourced from docs/frontend/01-kien-truc.md, 02-he-thong-thiet-ke.md, 03-so-do-trang.md, 04-hop-dong-api-va-mock.md
 */

import type { RouteDefinition, ParsedEnvironmentSpecs } from './types.ts';

export const OFFICIAL_24_ROUTES: RouteDefinition[] = [
  { route: '#/', pageName: 'Home', permission: 'ALL', layout: 'Root', is3D: true },
  { route: '#/taxonomy', pageName: 'TaxonomyRoot', permission: 'ALL', layout: 'Root' },
  { route: '#/taxonomy/:id', pageName: 'TaxonomyDetail', permission: 'ALL', layout: 'Root' },
  { route: '#/species', pageName: 'SpeciesList', permission: 'ALL', layout: 'Root' },
  { route: '#/species/:id', pageName: 'SpeciesDetail', permission: 'ALL', layout: 'Root' },
  { route: '#/products', pageName: 'ProductList', permission: 'ALL', layout: 'Root' },
  { route: '#/products/:id', pageName: 'ProductDetail', permission: 'ALL', layout: 'Root' },
  { route: '#/login', pageName: 'Login', permission: 'GUEST', layout: 'Auth' },
  { route: '#/register', pageName: 'Register', permission: 'GUEST', layout: 'Auth' },
  { route: '#/admin/login', pageName: 'AdminLogin', permission: 'GUEST', layout: 'Auth' },
  { route: '#/cart', pageName: 'Cart', permission: 'USER', layout: 'Root' },
  { route: '#/checkout', pageName: 'Checkout', permission: 'USER', layout: 'Root' },
  { route: '#/orders', pageName: 'OrderList', permission: 'USER', layout: 'Account' },
  { route: '#/orders/:id', pageName: 'OrderDetail', permission: 'USER', layout: 'Account' },
  { route: '#/account', pageName: 'Account', permission: 'USER', layout: 'Account' },
  { route: '#/seller/apply', pageName: 'SellerApply', permission: 'USER', layout: 'Account' },
  { route: '#/seller', pageName: 'SellerDashboard', permission: 'SELLER_ACTIVE', layout: 'Seller' },
  { route: '#/seller/products/new', pageName: 'SellerProductCreate', permission: 'SELLER_ACTIVE', layout: 'Seller' },
  { route: '#/admin', pageName: 'AdminDashboard', permission: 'ADMIN', layout: 'Admin' },
  { route: '#/admin/sellers', pageName: 'AdminSellers', permission: 'MODERATOR', layout: 'Admin' },
  { route: '#/admin/products', pageName: 'AdminProducts', permission: 'MODERATOR', layout: 'Admin' },
  { route: '#/admin/species', pageName: 'AdminSpecies', permission: 'BIOLOGIST', layout: 'Admin' },
  { route: '#/credits', pageName: 'Credits', permission: 'ALL', layout: 'Root' },
  { route: '#/dev/ui', pageName: 'UIPreview', permission: 'ALL', layout: 'Root' },
];

export const IUCN_RATINGS = ['LC', 'NT', 'VU', 'EN', 'CR', 'EW', 'EX'] as const;

export const IUCN_COLORS: Record<string, string> = {
  LC: '#48c774',
  NT: '#29b6f6',
  VU: '#ffdd57',
  EN: '#ff9800',
  CR: '#f14668',
  EW: '#363636',
  EX: '#000000',
};

/**
 * Parses biological climate/environment specifications string.
 * Example strings from seed_data.sql:
 * - "Nhiệt độ: 26-32°C (điểm sưởi 32-34°C), Độ ẩm: 55-65%"
 * - "Nhiệt độ nước: 14-18°C, pH: 7.4-7.6, Môi trường: Nước ngọt hoàn toàn"
 * - "Nhiệt độ: ngày 20-25°C, đêm 10-15°C, Độ ẩm: 75-90%"
 */
export function parseEnvironmentSpecs(s: string): ParsedEnvironmentSpecs {
  const result: ParsedEnvironmentSpecs = {
    tempMin: null,
    tempMax: null,
    raw: s,
  };

  if (!s || s.trim().length === 0) return result;

  // Water temperature
  const waterMatch = s.match(/Nhiệt độ nước:\s*(\d+)-(\d+)°C/i);
  if (waterMatch) {
    result.waterTempMin = parseInt(waterMatch[1]!, 10);
    result.waterTempMax = parseInt(waterMatch[2]!, 10);
    result.tempMin = result.waterTempMin;
    result.tempMax = result.waterTempMax;
  }

  // General air temperature
  const tempMatch = s.match(/Nhiệt độ:\s*(?:ngày\s*)?(\d+)-(\d+)°C/i);
  if (tempMatch && result.tempMin === null) {
    result.tempMin = parseInt(tempMatch[1]!, 10);
    result.tempMax = parseInt(tempMatch[2]!, 10);
  }

  // Basking temperature (điểm sưởi)
  const baskMatch = s.match(/điểm sưởi\s*(\d+)-(\d+)°C/i);
  if (baskMatch) {
    result.baskMin = parseInt(baskMatch[1]!, 10);
    result.baskMax = parseInt(baskMatch[2]!, 10);
  }

  // Humidity (Độ ẩm)
  const humidMatch = s.match(/Độ ẩm:\s*(\d+)-(\d+)%/i);
  if (humidMatch) {
    result.humidMin = parseInt(humidMatch[1]!, 10);
    result.humidMax = parseInt(humidMatch[2]!, 10);
  }

  return result;
}

/**
 * Validates order code format: ORD-YYYY-<6 char alphanumeric>
 * Example: ORD-2026-0001, ORD-2026-A1B2C3
 */
export function isValidOrderCode(code: string): boolean {
  return /^ORD-\d{4}-[A-Za-z0-9]{4,8}$/.test(code);
}

/**
 * Currency formatter VND specification: e.g. 1.200.000 ₫
 */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}
