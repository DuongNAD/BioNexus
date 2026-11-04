/**
 * BioNexus TanStack Query Key Factory
 * Phân cấp query keys chống xung đột và quản lý cache granular.
 */
export const queryKeys = {
  all: ['bionexus'] as const,

  // 1. Auth & Me
  auth: {
    all: () => [...queryKeys.all, 'auth'] as const,
    me: () => [...queryKeys.auth.all(), 'me'] as const,
  },

  // 2. Taxonomy
  taxonomy: {
    all: () => [...queryKeys.all, 'taxonomy'] as const,
    root: () => [...queryKeys.taxonomy.all(), 'root'] as const,
    detail: (id: number | string) => [...queryKeys.taxonomy.all(), 'detail', Number(id)] as const,
    children: (id: number | string) => [...queryKeys.taxonomy.all(), 'children', Number(id)] as const,
    species: (id: number | string) => [...queryKeys.taxonomy.all(), 'species', Number(id)] as const,
  },

  // Hồ sơ mở rộng tĩnh của loài catalog (public/catalog)
  catalog: {
    all: () => [...queryKeys.all, 'catalog'] as const,
    shard: (shard: number) => [...queryKeys.catalog.all(), 'shard', shard] as const,
    credits: () => [...queryKeys.catalog.all(), 'credits'] as const,
  },

  // 3. Species
  species: {
    all: () => [...queryKeys.all, 'species'] as const,
    list: (filters?: { nodeId?: number; q?: string; iucn?: string }) =>
      [...queryKeys.species.all(), 'list', filters] as const,
    detail: (id: number | string) => [...queryKeys.species.all(), 'detail', Number(id)] as const,
    products: (id: number | string) => [...queryKeys.species.all(), 'products', Number(id)] as const,
  },

  // 4. Products
  products: {
    all: () => [...queryKeys.all, 'products'] as const,
    list: (params?: { speciesId?: number; q?: string; page?: number; size?: number }) =>
      [...queryKeys.products.all(), 'list', params] as const,
    allApproved: () => [...queryKeys.products.all(), 'all-approved'] as const,
    detail: (id: number | string) => [...queryKeys.products.all(), 'detail', Number(id)] as const,
    reviews: (id: number | string) => [...queryKeys.products.all(), 'reviews', Number(id)] as const,
  },

  // 5. Cart
  cart: {
    all: () => [...queryKeys.all, 'cart'] as const,
    current: () => [...queryKeys.cart.all(), 'current'] as const,
  },

  // 6. Orders
  orders: {
    all: () => [...queryKeys.all, 'orders'] as const,
    mine: () => [...queryKeys.orders.all(), 'mine'] as const,
    detail: (id: number | string) => [...queryKeys.orders.all(), 'detail', Number(id)] as const,
  },

  // 7. Seller
  seller: {
    all: () => [...queryKeys.all, 'seller'] as const,
    profile: () => [...queryKeys.seller.all(), 'profile'] as const,
    products: () => [...queryKeys.seller.all(), 'products'] as const,
  },

  // 8. Admin Moderation
  admin: {
    all: () => [...queryKeys.all, 'admin'] as const,
    sellers: (status?: string) => [...queryKeys.admin.all(), 'sellers', status ?? 'ALL'] as const,
    pendingSellers: () => [...queryKeys.admin.all(), 'sellers', 'pending'] as const,
    products: (status?: string) => [...queryKeys.admin.all(), 'products', status ?? 'ALL'] as const,
    pendingProducts: () => [...queryKeys.admin.all(), 'products', 'pending'] as const,
  },
};
