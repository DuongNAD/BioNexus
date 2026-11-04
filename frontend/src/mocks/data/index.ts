import type { MockDatabaseState } from '../types';
import { SEED_USERS, SEED_ADMINS } from './users';
import { SEED_SHOPS } from './shops';
import { SEED_TAXONOMY } from './taxonomy';
import { SEED_SPECIES } from './species';
import { SEED_PRODUCTS } from './products';
import { SEED_ORDERS } from './orders';
import { SEED_CARTS } from './carts';
import { SEED_REVIEWS } from './reviews';
import { CATALOG_USERS, CATALOG_SHOPS, CATALOG_TAXONOMY, CATALOG_SPECIES, CATALOG_PRODUCTS } from './catalog.generated';

export * from './users';
export * from './shops';
export * from './taxonomy';
export * from './species';
export * from './products';
export * from './orders';
export * from './carts';
export * from './reviews';
export * from './catalog.generated';

// Seed gốc chép tay + khối CATALOG sinh tự động, đúng thứ tự INSERT trong seed_data.sql
const ALL_USERS = [...SEED_USERS, ...CATALOG_USERS];
const ALL_SHOPS = [...SEED_SHOPS, ...CATALOG_SHOPS];
const ALL_TAXONOMY = [...SEED_TAXONOMY, ...CATALOG_TAXONOMY];
const ALL_SPECIES = [...SEED_SPECIES, ...CATALOG_SPECIES];
const ALL_PRODUCTS = [...SEED_PRODUCTS, ...CATALOG_PRODUCTS];

// Id mới phải lớn hơn mọi id trong seed, nếu không bản ghi tạo trong lúc chạy sẽ trùng id catalog
const nextId = (rows: { id: number }[]) => Math.max(100, ...rows.map((r) => r.id)) + 1;

export function createInitialSeedState(): MockDatabaseState {
  return {
    seedVersion: 4, // khớp SEED_VERSION trong mocks/db.ts
    users: JSON.parse(JSON.stringify(ALL_USERS)),
    admins: JSON.parse(JSON.stringify(SEED_ADMINS)),
    shops: JSON.parse(JSON.stringify(ALL_SHOPS)),
    taxonomy: JSON.parse(JSON.stringify(ALL_TAXONOMY)),
    species: JSON.parse(JSON.stringify(ALL_SPECIES)),
    products: JSON.parse(JSON.stringify(ALL_PRODUCTS)),
    orders: JSON.parse(JSON.stringify(SEED_ORDERS)),
    carts: JSON.parse(JSON.stringify(SEED_CARTS)),
    reviews: JSON.parse(JSON.stringify(SEED_REVIEWS)),
    nextOrderId: 100,
    nextProductId: nextId(ALL_PRODUCTS),
    nextShopId: nextId(ALL_SHOPS),
    nextSpeciesId: nextId(ALL_SPECIES),
    nextUserId: nextId(ALL_USERS),
    nextReviewId: 100,
  };
}
