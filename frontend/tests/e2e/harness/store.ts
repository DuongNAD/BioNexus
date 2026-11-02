/**
 * BioNexus In-Memory Isolated Test Store & Contract Engine
 * Implements authoritative business rules defined in docs/frontend/04-hop-dong-api-va-mock.md
 */

import {
  SEED_USERS,
  SEED_ADMINS,
  SEED_SHOPS,
  SEED_TAXONOMY,
  SEED_SPECIES,
  SEED_PRODUCTS,
  SEED_CARTS,
  SEED_ORDERS,
  type SeedUser,
  type SeedAdmin,
  type SeedOrder,
} from './seed-data.ts';

import type {
  TaxonomyNodeDto,
  TaxonomyDetailDto,
  SpeciesDto,
  ProductDto,
  SellerDto,
  AuthResponse,
  CartDto,
  CartItemDto,
  OrderDto,
  UserStatus,
  SellerStatus,
  ProductStatus,
  AdminRole,
  AccountType,
} from './types.ts';

export interface DecodedToken {
  sub: number;
  username: string;
  accountType: AccountType;
  role: AdminRole | string | null;
  exp: number;
}

export class BioNexusTestStore {
  users: SeedUser[] = [];
  admins: SeedAdmin[] = [];
  shops: SellerDto[] = [];
  taxonomy: TaxonomyNodeDto[] = [];
  species: SpeciesDto[] = [];
  products: ProductDto[] = [];
  carts: Map<number, { productId: number; quantity: number }[]> = new Map();
  orders: SeedOrder[] = [];
  nextOrderId = 100;
  nextProductId = 100;
  nextShopId = 100;
  nextSpeciesId = 100;
  nextUserId = 100;

  constructor() {
    this.reset();
  }

  reset(): void {
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
    this.admins = JSON.parse(JSON.stringify(SEED_ADMINS));
    this.shops = JSON.parse(JSON.stringify(SEED_SHOPS));
    this.taxonomy = JSON.parse(JSON.stringify(SEED_TAXONOMY));
    this.species = JSON.parse(JSON.stringify(SEED_SPECIES));
    this.products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
    this.orders = JSON.parse(JSON.stringify(SEED_ORDERS));
    this.carts.clear();
    for (const [userIdStr, items] of Object.entries(SEED_CARTS)) {
      this.carts.set(Number(userIdStr), JSON.parse(JSON.stringify(items)));
    }
    this.nextOrderId = 100;
    this.nextProductId = 100;
    this.nextShopId = 100;
    this.nextSpeciesId = 100;
    this.nextUserId = 100;
  }

  // --- Auth Token Utilities ---
  createToken(payload: DecodedToken): string {
    const jsonStr = JSON.stringify(payload);
    const base64 = Buffer.from(jsonStr).toString('base64url');
    return `mock.${base64}.test-sig`;
  }

  decodeToken(token: string): DecodedToken | null {
    if (!token || !token.startsWith('mock.')) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    if (parts[2] !== 'test-sig') return null; // Corrupted / tampered signature check
    try {
      const jsonStr = Buffer.from(parts[1], 'base64url').toString('utf8');
      const decoded = JSON.parse(jsonStr) as DecodedToken;
      if (decoded.exp && decoded.exp < Date.now()) {
        return null; // Expired
      }
      return decoded;
    } catch {
      return null;
    }
  }

  // --- User / Admin Auth ---
  loginUser(username: string, password: string): { status: number; body: Record<string, any> } {
    const user = this.users.find((u) => u.username === username);
    if (!user || user.passwordHash !== password) {
      return {
        status: 401,
        body: { success: false, code: 'AUTH_INVALID_CREDENTIALS', message: 'Sai tài khoản hoặc mật khẩu', data: null },
      };
    }
    if (user.status === 'BANNED') {
      return {
        status: 403,
        body: { success: false, code: 'AUTH_ACCOUNT_BANNED', message: 'Tài khoản đã bị khóa', data: null },
      };
    }
    if (user.status === 'INACTIVE') {
      return {
        status: 403,
        body: { success: false, code: 'AUTH_ACCOUNT_INACTIVE', message: 'Tài khoản chưa được kích hoạt', data: null },
      };
    }

    const tokenPayload: DecodedToken = {
      sub: user.id,
      username: user.username,
      accountType: 'USER',
      role: null,
      exp: Date.now() + 8 * 3600 * 1000,
    };
    const token = this.createToken(tokenPayload);

    const authResp: AuthResponse = {
      token,
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      accountType: 'USER',
      role: null,
    };

    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Đăng nhập thành công', data: authResp },
    };
  }

  loginAdmin(account: string, password: string): { status: number; body: Record<string, any> } {
    const admin = this.admins.find((a) => a.account === account);
    if (!admin || admin.passwordHash !== password) {
      return {
        status: 401,
        body: { success: false, code: 'AUTH_INVALID_CREDENTIALS', message: 'Sai tài khoản hoặc mật khẩu', data: null },
      };
    }
    if (admin.status === 'BANNED') {
      return {
        status: 403,
        body: { success: false, code: 'AUTH_ACCOUNT_BANNED', message: 'Tài khoản quản trị đã bị khóa', data: null },
      };
    }
    if (admin.status === 'INACTIVE') {
      return {
        status: 403,
        body: { success: false, code: 'AUTH_ACCOUNT_INACTIVE', message: 'Tài khoản quản trị chưa kích hoạt', data: null },
      };
    }

    const tokenPayload: DecodedToken = {
      sub: admin.id,
      username: admin.account,
      accountType: 'ADMIN',
      role: admin.adminRole,
      exp: Date.now() + 8 * 3600 * 1000,
    };
    const token = this.createToken(tokenPayload);

    const authResp: AuthResponse = {
      token,
      id: admin.id,
      username: admin.account,
      fullName: admin.fullName,
      accountType: 'ADMIN',
      role: admin.adminRole,
    };

    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Đăng nhập quản trị thành công', data: authResp },
    };
  }

  registerUser(req: { username: string; password: string; email: string; fullName: string; phone: string; address: string }): { status: number; body: Record<string, any> } {
    if (!req.username || !req.password || !req.email) {
      return {
        status: 400,
        body: { success: false, code: 'USER_INVALID_INPUT', message: 'Thiếu thông tin đăng ký', data: null },
      };
    }
    if (this.users.some((u) => u.username === req.username)) {
      return {
        status: 409,
        body: { success: false, code: 'USER_USERNAME_EXISTS', message: 'Tên đăng nhập đã tồn tại', data: null },
      };
    }
    if (this.users.some((u) => u.email === req.email)) {
      return {
        status: 409,
        body: { success: false, code: 'USER_EMAIL_EXISTS', message: 'Email đã tồn tại', data: null },
      };
    }

    const newUser: SeedUser = {
      id: this.nextUserId++,
      username: req.username,
      passwordHash: req.password,
      email: req.email,
      fullName: req.fullName || req.username,
      phone: req.phone || '',
      address: req.address || '',
      status: 'ACTIVE',
    };
    this.users.push(newUser);

    const token = this.createToken({
      sub: newUser.id,
      username: newUser.username,
      accountType: 'USER',
      role: null,
      exp: Date.now() + 8 * 3600 * 1000,
    });

    const authResp: AuthResponse = {
      token,
      id: newUser.id,
      username: newUser.username,
      fullName: newUser.fullName,
      accountType: 'USER',
      role: null,
    };

    return {
      status: 201,
      body: { success: true, code: 'SUCCESS', message: 'Đăng ký tài khoản thành công', data: authResp },
    };
  }

  getMe(userId: number): { status: number; body: Record<string, any> } {
    const user = this.users.find((u) => u.id === userId);
    if (!user) {
      return {
        status: 401,
        body: { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Không tìm thấy người dùng', data: null },
      };
    }
    const shop = this.shops.find((s) => s.userId === user.id) || null;
    return {
      status: 200,
      body: {
        success: true,
        code: 'SUCCESS',
        message: 'Lấy thông tin cá nhân thành công',
        data: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          address: user.address,
          status: user.status,
          shop,
        },
      },
    };
  }

  // --- Taxonomy & Species ---
  getRootTaxonomy(): TaxonomyNodeDto[] {
    return this.taxonomy.filter((n) => n.parentId === null);
  }

  getTaxonomyDetail(id: number): TaxonomyDetailDto | null {
    const node = this.taxonomy.find((n) => n.id === id);
    if (!node) return null;
    const breadcrumbs: TaxonomyNodeDto[] = [];
    let curr: TaxonomyNodeDto | undefined = node;
    while (curr) {
      breadcrumbs.unshift(curr);
      curr = this.taxonomy.find((n) => n.id === curr?.parentId);
    }
    return { node, breadcrumbs };
  }

  getTaxonomyChildren(id: number): TaxonomyNodeDto[] {
    return this.taxonomy.filter((n) => n.parentId === id);
  }

  getTaxonomySpecies(id: number): SpeciesDto[] {
    return this.species.filter((s) => s.nodeId === id);
  }

  getSpeciesList(query?: { nodeId?: number; q?: string }): SpeciesDto[] {
    let result = [...this.species];
    if (query?.nodeId) {
      result = result.filter((s) => s.nodeId === query.nodeId);
    }
    if (query?.q) {
      const lower = query.q.toLowerCase().trim();
      result = result.filter(
        (s) => s.scientificName.toLowerCase().includes(lower) || s.commonName.toLowerCase().includes(lower)
      );
    }
    return result;
  }

  getSpeciesById(id: number): SpeciesDto | null {
    return this.species.find((s) => s.id === id) || null;
  }

  // --- Products ---
  getProducts(query?: { speciesId?: number; q?: string; page?: number; size?: number }): { items: ProductDto[]; page: number; size: number; total: number } {
    let list = this.products.filter((p) => p.status === 'APPROVED');
    if (query?.speciesId) {
      list = list.filter((p) => p.speciesId === query.speciesId);
    }
    if (query?.q) {
      const lower = query.q.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.productName.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          (p.speciesCommonName && p.speciesCommonName.toLowerCase().includes(lower))
      );
    }
    const page = query?.page ?? 1;
    const size = query?.size ?? 12;
    const total = list.length;
    const start = (page - 1) * size;
    const items = list.slice(start, start + size);
    return { items, page, size, total };
  }

  getProductById(id: number): ProductDto | null {
    return this.products.find((p) => p.id === id) || null;
  }

  // --- Cart Management ---
  getCart(userId: number): CartDto {
    const rawItems = this.carts.get(userId) || [];
    const items: CartItemDto[] = [];
    let subtotal = 0;

    for (const raw of rawItems) {
      const prod = this.products.find((p) => p.id === raw.productId);
      if (!prod) continue;
      const isAvailable = prod.status === 'APPROVED' && prod.stockQuantity >= raw.quantity;
      const lineTotal = isAvailable ? prod.price * raw.quantity : 0;
      if (isAvailable) {
        subtotal += lineTotal;
      }
      items.push({
        productId: prod.id,
        productName: prod.productName,
        imageUrl: prod.imageUrl,
        price: prod.price,
        quantity: raw.quantity,
        available: isAvailable,
        maxQuantity: prod.stockQuantity,
        lineTotal,
        speciesId: prod.speciesId,
      });
    }

    return {
      items,
      itemCount: items.reduce((acc, it) => acc + (it.available ? it.quantity : 0), 0),
      subtotal,
    };
  }

  addToCart(userId: number, productId: number, quantity: number): { status: number; body: Record<string, any> } {
    if (quantity <= 0) {
      return {
        status: 400,
        body: { success: false, code: 'CART_INVALID_QUANTITY', message: 'Số lượng phải lớn hơn 0', data: null },
      };
    }
    const prod = this.products.find((p) => p.id === productId);
    if (!prod) {
      return {
        status: 404,
        body: { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Sản phẩm không tồn tại', data: null },
      };
    }
    // Business Rule: Cannot purchase own shop's product
    const userShop = this.shops.find((s) => s.userId === userId);
    if (userShop && userShop.id === prod.sellerProfileId) {
      return {
        status: 403,
        body: { success: false, code: 'ORDER_OWN_PRODUCT', message: 'Không thể mua sản phẩm của chính mình', data: null },
      };
    }
    if (prod.status === 'SOLD_OUT' || prod.stockQuantity <= 0) {
      return {
        status: 409,
        body: { success: false, code: 'PRODUCT_OUT_OF_STOCK', message: 'Sản phẩm đã hết hàng', data: null },
      };
    }
    if (prod.status !== 'APPROVED') {
      return {
        status: 409,
        body: { success: false, code: 'PRODUCT_NOT_AVAILABLE', message: 'Sản phẩm chưa sẵn sàng bán', data: null },
      };
    }

    let userCart = this.carts.get(userId);
    if (!userCart) {
      userCart = [];
      this.carts.set(userId, userCart);
    }

    const existing = userCart.find((i) => i.productId === productId);
    const totalRequested = (existing ? existing.quantity : 0) + quantity;
    if (totalRequested > prod.stockQuantity) {
      return {
        status: 409,
        body: { success: false, code: 'CART_QUANTITY_EXCEEDS_STOCK', message: 'Số lượng yêu cầu vượt quá tồn kho', data: null },
      };
    }

    if (existing) {
      existing.quantity = totalRequested;
    } else {
      userCart.push({ productId, quantity });
    }

    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Đã thêm vào giỏ hàng', data: this.getCart(userId) },
    };
  }

  updateCartItem(userId: number, productId: number, quantity: number): { status: number; body: Record<string, any> } {
    if (quantity <= 0) {
      return {
        status: 400,
        body: { success: false, code: 'CART_INVALID_QUANTITY', message: 'Số lượng phải lớn hơn 0', data: null },
      };
    }
    const userCart = this.carts.get(userId);
    if (!userCart) {
      return {
        status: 404,
        body: { success: false, code: 'CART_ITEM_NOT_FOUND', message: 'Món hàng không có trong giỏ', data: null },
      };
    }
    const item = userCart.find((i) => i.productId === productId);
    if (!item) {
      return {
        status: 404,
        body: { success: false, code: 'CART_ITEM_NOT_FOUND', message: 'Món hàng không có trong giỏ', data: null },
      };
    }
    const prod = this.products.find((p) => p.id === productId);
    if (!prod) {
      return {
        status: 404,
        body: { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Sản phẩm không tồn tại', data: null },
      };
    }
    if (quantity > prod.stockQuantity) {
      return {
        status: 409,
        body: { success: false, code: 'CART_QUANTITY_EXCEEDS_STOCK', message: 'Vượt quá tồn kho', data: null },
      };
    }
    item.quantity = quantity;
    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Cập nhật giỏ hàng thành công', data: this.getCart(userId) },
    };
  }

  removeCartItem(userId: number, productId: number): { status: number; body: Record<string, any> } {
    const userCart = this.carts.get(userId);
    if (userCart) {
      const idx = userCart.findIndex((i) => i.productId === productId);
      if (idx >= 0) userCart.splice(idx, 1);
    }
    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Đã xóa khỏi giỏ hàng', data: this.getCart(userId) },
    };
  }

  clearCart(userId: number): { status: number; body: Record<string, any> } {
    this.carts.set(userId, []);
    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Đã làm trống giỏ hàng', data: this.getCart(userId) },
    };
  }

  // --- Orders & Checkout (Atomic Transaction Simulation) ---
  placeOrder(userId: number, req: { items?: { productId: number; quantity: number }[]; shippingAddress: string }): { status: number; body: Record<string, any> } {
    if (!req.shippingAddress || req.shippingAddress.trim().length === 0) {
      return {
        status: 400,
        body: { success: false, code: 'ORDER_INVALID_ADDRESS', message: 'Địa chỉ giao hàng không được trống', data: null },
      };
    }

    let orderItemsToProcess: { productId: number; quantity: number }[] = [];
    let isFromCart = false;

    if (req.items && req.items.length > 0) {
      orderItemsToProcess = req.items;
    } else {
      isFromCart = true;
      const userCart = this.carts.get(userId) || [];
      if (userCart.length === 0) {
        return {
          status: 400,
          body: { success: false, code: 'CART_EMPTY', message: 'Giỏ hàng đang trống', data: null },
        };
      }
      orderItemsToProcess = [...userCart];
    }

    const userShop = this.shops.find((s) => s.userId === userId);

    // Validation Phase (Atomic Check: all or nothing)
    for (const reqItem of orderItemsToProcess) {
      const prod = this.products.find((p) => p.id === reqItem.productId);
      if (!prod) {
        return {
          status: 404,
          body: { success: false, code: 'PRODUCT_NOT_FOUND', message: `Sản phẩm #${reqItem.productId} không tồn tại`, data: null },
        };
      }
      if (userShop && userShop.id === prod.sellerProfileId) {
        return {
          status: 403,
          body: { success: false, code: 'ORDER_OWN_PRODUCT', message: 'Không thể đặt mua sản phẩm của chính shop mình', data: null },
        };
      }
      if (prod.status === 'SOLD_OUT' || prod.stockQuantity <= 0) {
        return {
          status: 409,
          body: { success: false, code: 'PRODUCT_OUT_OF_STOCK', message: `Sản phẩm ${prod.productName} đã hết hàng`, data: null },
        };
      }
      if (prod.status !== 'APPROVED') {
        return {
          status: 409,
          body: { success: false, code: 'PRODUCT_NOT_AVAILABLE', message: `Sản phẩm ${prod.productName} chưa được duyệt`, data: null },
        };
      }
      if (reqItem.quantity > prod.stockQuantity) {
        return {
          status: 409,
          body: { success: false, code: 'PRODUCT_OUT_OF_STOCK', message: `Số lượng tồn kho không đủ cho ${prod.productName}`, data: null },
        };
      }
    }

    // Execution Phase (Deduct Stock & Create Order)
    const orderDetails: SeedOrder['items'] = [];
    let totalAmount = 0;

    for (const reqItem of orderItemsToProcess) {
      const prod = this.products.find((p) => p.id === reqItem.productId)!;
      prod.stockQuantity -= reqItem.quantity;
      if (prod.stockQuantity === 0) {
        prod.status = 'SOLD_OUT';
      }
      const lineTotal = prod.price * reqItem.quantity;
      totalAmount += lineTotal;
      orderDetails.push({
        productId: prod.id,
        productName: prod.productName,
        quantity: reqItem.quantity,
        unitPrice: prod.price,
        lineTotal,
      });
    }

    if (isFromCart) {
      this.carts.set(userId, []);
    }

    const orderId = this.nextOrderId++;
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    const orderCode = `ORD-2026-${randomHex}`;

    const newOrder: SeedOrder = {
      id: orderId,
      orderCode,
      userId,
      status: 'PENDING',
      totalAmount,
      shippingAddress: req.shippingAddress.trim(),
      createdAt: new Date().toISOString(),
      items: orderDetails,
    };
    this.orders.push(newOrder);

    const orderDto: OrderDto = {
      id: newOrder.id,
      orderCode: newOrder.orderCode,
      status: newOrder.status,
      totalAmount: newOrder.totalAmount,
      shippingAddress: newOrder.shippingAddress,
      createdAt: newOrder.createdAt,
      items: newOrder.items.map((it) => ({
        productId: it.productId,
        productName: it.productName,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        lineTotal: it.lineTotal,
      })),
    };

    return {
      status: 201,
      body: { success: true, code: 'SUCCESS', message: 'Đặt hàng thành công', data: orderDto },
    };
  }

  getUserOrders(userId: number): OrderDto[] {
    return this.orders
      .filter((o) => o.userId === userId)
      .map((o) => ({
        id: o.id,
        orderCode: o.orderCode,
        status: o.status,
        totalAmount: o.totalAmount,
        shippingAddress: o.shippingAddress,
        createdAt: o.createdAt,
        items: o.items,
      }));
  }

  getOrderById(userId: number, orderId: number): OrderDto | null {
    const ord = this.orders.find((o) => o.id === orderId && o.userId === userId);
    if (!ord) return null;
    return {
      id: ord.id,
      orderCode: ord.orderCode,
      status: ord.status,
      totalAmount: ord.totalAmount,
      shippingAddress: ord.shippingAddress,
      createdAt: ord.createdAt,
      items: ord.items,
    };
  }

  // --- Seller Lifecycle ---
  applySeller(userId: number, req: { shopName: string; businessLicenseUrl: string; bio: string }): { status: number; body: Record<string, any> } {
    if (!req.shopName || req.shopName.trim().length === 0) {
      return {
        status: 400,
        body: { success: false, code: 'SELLER_INVALID_SHOP_NAME', message: 'Tên cửa hàng không hợp lệ', data: null },
      };
    }
    const existing = this.shops.find((s) => s.userId === userId);
    if (existing) {
      return {
        status: 409,
        body: { success: false, code: 'SELLER_ALREADY_REGISTERED', message: 'Người dùng đã có hồ sơ cửa hàng', data: null },
      };
    }
    if (this.shops.some((s) => s.shopName.toLowerCase() === req.shopName.trim().toLowerCase())) {
      return {
        status: 409,
        body: { success: false, code: 'SELLER_SHOP_NAME_EXISTS', message: 'Tên cửa hàng đã được sử dụng', data: null },
      };
    }

    const user = this.users.find((u) => u.id === userId);
    const newShop: SellerDto = {
      id: this.nextShopId++,
      userId,
      shopName: req.shopName.trim(),
      businessLicenseUrl: req.businessLicenseUrl || null,
      bio: req.bio || null,
      status: 'PENDING',
      approvedByAdminId: null,
      ownerFullName: user?.fullName,
      ownerUsername: user?.username,
    };
    this.shops.push(newShop);

    return {
      status: 201,
      body: { success: true, code: 'SUCCESS', message: 'Nộp hồ sơ mở shop thành công', data: newShop },
    };
  }

  getSellerProducts(userId: number): { status: number; body: Record<string, any> } {
    const shop = this.shops.find((s) => s.userId === userId);
    if (!shop || shop.status !== 'ACTIVE') {
      return {
        status: 403,
        body: { success: false, code: 'SELLER_NOT_ACTIVE', message: 'Cửa hàng chưa được kích hoạt', data: null },
      };
    }
    const prods = this.products.filter((p) => p.sellerProfileId === shop.id);
    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Lấy danh sách sản phẩm shop thành công', data: prods },
    };
  }

  createSellerProduct(userId: number, req: { speciesId: number; productName: string; price: number; stockQuantity: number; description: string; imageUrl: string }): { status: number; body: Record<string, any> } {
    const shop = this.shops.find((s) => s.userId === userId);
    if (!shop || shop.status !== 'ACTIVE') {
      return {
        status: 403,
        body: { success: false, code: 'SELLER_NOT_ACTIVE', message: 'Chỉ shop ACTIVE mới có quyền đăng sản phẩm', data: null },
      };
    }
    if (!req.productName || req.price <= 0 || req.stockQuantity < 0) {
      return {
        status: 400,
        body: { success: false, code: 'PRODUCT_INVALID_INPUT', message: 'Thông tin sản phẩm không hợp lệ', data: null },
      };
    }
    const species = this.species.find((s) => s.id === req.speciesId);
    if (!species) {
      return {
        status: 400,
        body: { success: false, code: 'SPECIES_NOT_FOUND', message: 'Mã loài không tồn tại', data: null },
      };
    }

    const newProd: ProductDto = {
      id: this.nextProductId++,
      sellerProfileId: shop.id,
      speciesId: req.speciesId,
      productName: req.productName.trim(),
      price: req.price,
      stockQuantity: req.stockQuantity,
      description: req.description || '',
      imageUrl: req.imageUrl || null,
      status: 'PENDING',
      shopName: shop.shopName,
      speciesCommonName: species.commonName,
      speciesScientificName: species.scientificName,
      conservationStatus: species.conservationStatus,
    };
    this.products.push(newProd);

    return {
      status: 201,
      body: { success: true, code: 'SUCCESS', message: 'Tạo sản phẩm mới thành công (chờ duyệt)', data: newProd },
    };
  }

  // --- Admin Moderation ---
  getPendingSellers(): SellerDto[] {
    return this.shops.filter((s) => s.status === 'PENDING');
  }

  moderateSeller(adminId: number, shopId: number, newStatus: SellerStatus): { status: number; body: Record<string, any> } {
    const shop = this.shops.find((s) => s.id === shopId);
    if (!shop) {
      return {
        status: 404,
        body: { success: false, code: 'SELLER_NOT_FOUND', message: 'Không tìm thấy shop', data: null },
      };
    }
    // Legal transitions: PENDING -> ACTIVE / REJECTED; ACTIVE -> BANNED
    const valid =
      (shop.status === 'PENDING' && (newStatus === 'ACTIVE' || newStatus === 'REJECTED')) ||
      (shop.status === 'ACTIVE' && newStatus === 'BANNED');
    if (!valid) {
      return {
        status: 409,
        body: { success: false, code: 'SELLER_INVALID_STATUS_TRANSITION', message: 'Chuyển trạng thái shop không hợp lệ', data: null },
      };
    }
    shop.status = newStatus;
    if (newStatus === 'ACTIVE') {
      shop.approvedByAdminId = adminId;
    }
    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Cập nhật trạng thái shop thành công', data: shop },
    };
  }

  getPendingProducts(): ProductDto[] {
    return this.products.filter((p) => p.status === 'PENDING');
  }

  moderateProduct(adminId: number, productId: number, newStatus: ProductStatus): { status: number; body: Record<string, any> } {
    const prod = this.products.find((p) => p.id === productId);
    if (!prod) {
      return {
        status: 404,
        body: { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm', data: null },
      };
    }
    // Legal transitions: PENDING -> APPROVED / REJECTED
    if (prod.status !== 'PENDING' || (newStatus !== 'APPROVED' && newStatus !== 'REJECTED')) {
      return {
        status: 409,
        body: { success: false, code: 'PRODUCT_INVALID_STATUS_TRANSITION', message: 'Chuyển trạng thái sản phẩm không hợp lệ', data: null },
      };
    }
    prod.status = newStatus;
    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Kiểm duyệt sản phẩm thành công', data: prod },
    };
  }

  createSpecies(adminId: number, req: { nodeId: number; scientificName: string; commonName: string; conservationStatus: any; environmentSpecs: string; description: string; imageURL: string; referenceURL: string }): { status: number; body: Record<string, any> } {
    const node = this.taxonomy.find((n) => n.id === req.nodeId);
    if (!node || node.rank !== 'GENUS') {
      return {
        status: 400,
        body: { success: false, code: 'TAXONOMY_NOT_GENUS', message: 'Loài phải gắn vào nút cấp Chi (GENUS)', data: null },
      };
    }
    if (this.species.some((s) => s.scientificName.toLowerCase() === req.scientificName.toLowerCase())) {
      return {
        status: 409,
        body: { success: false, code: 'SPECIES_NAME_EXISTS', message: 'Tên khoa học loài đã tồn tại', data: null },
      };
    }
    const newSpecies: SpeciesDto = {
      id: this.nextSpeciesId++,
      nodeId: req.nodeId,
      scientificName: req.scientificName.trim(),
      commonName: req.commonName.trim(),
      conservationStatus: req.conservationStatus,
      environmentSpecs: req.environmentSpecs || '',
      description: req.description || '',
      imageURL: req.imageURL || null,
      referenceURL: req.referenceURL || null,
    };
    this.species.push(newSpecies);
    return {
      status: 201,
      body: { success: true, code: 'SUCCESS', message: 'Thêm loài mới thành công', data: newSpecies },
    };
  }
}
