import type { MockDatabaseState } from '../types';
import { SEED_USERS, SEED_ADMINS } from './users';
import { SEED_SHOPS } from './shops';
import { SEED_TAXONOMY } from './taxonomy';
import { SEED_SPECIES } from './species';
import { SEED_PRODUCTS } from './products';
import { SEED_ORDERS } from './orders';
import { SEED_CARTS } from './carts';
import { SEED_REVIEWS } from './reviews';

export * from './users';
export * from './shops';
export * from './taxonomy';
export * from './species';
export * from './products';
export * from './orders';
export * from './carts';
export * from './reviews';

export function createInitialSeedState(): MockDatabaseState {
  return {
    users: JSON.parse(JSON.stringify(SEED_USERS)),
    admins: JSON.parse(JSON.stringify(SEED_ADMINS)),
    shops: JSON.parse(JSON.stringify(SEED_SHOPS)),
    taxonomy: JSON.parse(JSON.stringify(SEED_TAXONOMY)),
    species: JSON.parse(JSON.stringify(SEED_SPECIES)),
    products: JSON.parse(JSON.stringify(SEED_PRODUCTS)),
    orders: JSON.parse(JSON.stringify(SEED_ORDERS)),
    carts: JSON.parse(JSON.stringify(SEED_CARTS)),
    reviews: JSON.parse(JSON.stringify(SEED_REVIEWS)),
    nextOrderId: 100,
    nextProductId: 100,
    nextShopId: 100,
    nextSpeciesId: 100,
    nextUserId: 100,
    nextReviewId: 100,
  };
}
