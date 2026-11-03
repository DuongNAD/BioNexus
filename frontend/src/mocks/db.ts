import { createInitialSeedState } from './data';
import type {
  MockDatabaseState,
  MockUser,
  MockSellerProfile,
  MockTaxonomyNode,
  MockSpecies,
  MockProduct,

  MockOrder,
  MockReview,
} from './types';
import type {
  TaxonomyNodeDto,
  TaxonomyDetailDto,
  SpeciesDto,
  ProductDto,
  SellerDto,
  CartDto,
  CartItemDto,
  OrderDto,
  ReviewDto,
  MeDto,
  Page,
  RegisterRequest,
  SellerApplyRequest,
  UpdateSellerProfileRequest,
  CreateProductRequest,
  PlaceOrderRequest,
  CreateSpeciesRequest,
  CreateReviewRequest,
  SellerStatus,
  ProductStatus,
} from '@/types/api';
import { createMockToken } from './auth';

const STORAGE_KEY = 'bionexus.mock.v1';
// Tăng khi đổi dữ liệu trong mocks/data để trình duyệt đã lưu bản cũ tự nạp lại seed
export const SEED_VERSION = 3;

const ORDER_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/**
 * Loại bỏ dấu tiếng Việt phục vụ tìm kiếm mờ không phân biệt hoa thường và dấu
 */
export function normalizeSearchString(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (match) => (match === 'đ' ? 'd' : 'D'))
    .toLowerCase()
    .trim();
}

class MockDatabase {
  private state: MockDatabaseState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): MockDatabaseState {
    if (typeof window === 'undefined') {
      return createInitialSeedState();
    }
    let parsed: Partial<MockDatabaseState> | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      parsed = raw ? (JSON.parse(raw) as Partial<MockDatabaseState>) : null;
    } catch {
      parsed = null;
    }
    // Dữ liệu cũ trong trình duyệt từ bản seed trước (hoặc thiếu bảng) thì nạp lại seed mới
    const isCurrent =
      parsed?.seedVersion === SEED_VERSION &&
      Array.isArray(parsed.users) &&
      Array.isArray(parsed.products) &&
      Array.isArray(parsed.orders) &&
      Array.isArray(parsed.reviews);
    if (isCurrent) return parsed as MockDatabaseState;

    const initial = createInitialSeedState();
    this.persist(initial);
    return initial;
  }

  // localStorage có thể ném lỗi (đầy, chế độ riêng tư): kho vẫn chạy trong bộ nhớ, chỉ mất khi F5
  private persist(state: MockDatabaseState): void {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Bỏ qua
    }
  }

  private saveState(): void {
    this.persist(this.state);
  }

  public resetDb(): void {
    this.state = createInitialSeedState();
    this.saveState();
  }

  public getRawState(): MockDatabaseState {
    return this.state;
  }

  // ==========================================
  // 1. Phân loại sinh học (Taxonomy)
  // ==========================================

  public getRootTaxonomy(): TaxonomyNodeDto[] {
    return this.state.taxonomy
      .filter((n) => n.parentId === null)
      .map((n) => ({
        id: n.id,
        scientificName: n.scientificName,
        commonName: n.commonName,
        rank: n.rank,
        parentId: n.parentId,
        childCount: this.state.taxonomy.filter((c) => c.parentId === n.id).length,
      }));
  }

  public getTaxonomyDetail(id: number): TaxonomyDetailDto | null {
    const node = this.state.taxonomy.find((n) => n.id === id);
    if (!node) return null;

    const breadcrumbs: TaxonomyNodeDto[] = [];
    let curr: MockTaxonomyNode | undefined = node;
    while (curr) {
      breadcrumbs.unshift({
        id: curr.id,
        scientificName: curr.scientificName,
        commonName: curr.commonName,
        rank: curr.rank,
        parentId: curr.parentId,
      });
      if (curr.parentId === null) break;
      curr = this.state.taxonomy.find((n) => n.id === curr?.parentId);
    }

    return {
      node: {
        id: node.id,
        scientificName: node.scientificName,
        commonName: node.commonName,
        rank: node.rank,
        parentId: node.parentId,
        childCount: this.state.taxonomy.filter((c) => c.parentId === node.id).length,
      },
      breadcrumbs,
    };
  }

  public getTaxonomyChildren(id: number): TaxonomyNodeDto[] {
    return this.state.taxonomy
      .filter((n) => n.parentId === id)
      .map((n) => ({
        id: n.id,
        scientificName: n.scientificName,
        commonName: n.commonName,
        rank: n.rank,
        parentId: n.parentId,
        childCount: this.state.taxonomy.filter((c) => c.parentId === n.id).length,
      }));
  }

  public getTaxonomySpecies(id: number): SpeciesDto[] {
    const node = this.state.taxonomy.find((n) => n.id === id);
    if (!node || node.rank !== 'GENUS') return [];
    return this.state.species.filter((s) => s.nodeId === id);
  }

  private getDescendantGenusIds(nodeId: number): number[] {
    const node = this.state.taxonomy.find((n) => n.id === nodeId);
    if (!node) return [];
    if (node.rank === 'GENUS') return [node.id];

    let genusIds: number[] = [];
    const children = this.state.taxonomy.filter((n) => n.parentId === nodeId);
    for (const child of children) {
      genusIds = genusIds.concat(this.getDescendantGenusIds(child.id));
    }
    return genusIds;
  }

  // ==========================================
  // 2. Bách khoa loài (Species)
  // ==========================================

  public getSpeciesList(query?: { nodeId?: number; q?: string; iucn?: string }): SpeciesDto[] {
    let result = [...this.state.species];

    if (query?.nodeId) {
      const genusIds = this.getDescendantGenusIds(query.nodeId);
      result = result.filter((s) => genusIds.includes(s.nodeId));
    }

    if (query?.iucn) {
      result = result.filter((s) => s.conservationStatus === query.iucn);
    }

    if (query?.q && query.q.trim().length > 0) {
      const normQ = normalizeSearchString(query.q);
      result = result.filter((s) => {
        const normSci = normalizeSearchString(s.scientificName);
        const normCom = normalizeSearchString(s.commonName);
        const normDesc = normalizeSearchString(s.description);
        return normSci.includes(normQ) || normCom.includes(normQ) || normDesc.includes(normQ);
      });
    }

    return result;
  }

  public getSpeciesById(id: number): SpeciesDto | null {
    return this.state.species.find((s) => s.id === id) || null;
  }

  // ==========================================
  // 3. Sàn sinh vật cảnh & Sản phẩm (Products)
  // ==========================================

  private enrichProduct(p: MockProduct): ProductDto {
    const shop = this.state.shops.find((s) => s.id === p.sellerProfileId);
    const spec = this.state.species.find((s) => s.id === p.speciesId);

    return {
      id: p.id,
      sellerProfileId: p.sellerProfileId,
      speciesId: p.speciesId,
      productName: p.productName,
      price: p.price,
      stockQuantity: p.stockQuantity,
      description: p.description,
      imageUrl: p.imageUrl,
      status: p.status,
      shopName: shop ? shop.shopName : p.shopName || undefined,
      speciesCommonName: spec ? spec.commonName : p.speciesCommonName || undefined,
      speciesScientificName: spec ? spec.scientificName : p.speciesScientificName || undefined,
      conservationStatus: spec ? spec.conservationStatus : p.conservationStatus || undefined,
    };
  }

  public getProducts(params?: {
    speciesId?: number;
    q?: string;
    page?: number;
    size?: number;
  }): Page<ProductDto> {
    let filtered = this.state.products
      .filter((p) => p.status === 'APPROVED')
      .map((p) => this.enrichProduct(p));

    if (params?.speciesId) {
      filtered = filtered.filter((p) => p.speciesId === params.speciesId);
    }

    if (params?.q && params.q.trim().length > 0) {
      const normQ = normalizeSearchString(params.q);
      // Tài liệu 04 mục 4.7: chỉ tìm trong productName và tên loài (mô tả, tên shop thì backend không tìm)
      filtered = filtered.filter((p) => {
        const normName = normalizeSearchString(p.productName);
        const normSci = normalizeSearchString(p.speciesScientificName || '');
        const normCom = normalizeSearchString(p.speciesCommonName || '');
        return normName.includes(normQ) || normSci.includes(normQ) || normCom.includes(normQ);
      });
    }

    const page = params?.page ?? 1;
    const size = params?.size ?? 12;

    const offset = (page - 1) * size;
    const items = filtered.slice(offset, offset + size);

    return {
      items,
      page,
      size,
      total: filtered.length,
    };
  }

  public getProductById(id: number): ProductDto | null {
    const prod = this.state.products.find((p) => p.id === id);
    if (!prod) return null;
    return this.enrichProduct(prod);
  }

  public getProductsBySpeciesId(speciesId: number): ProductDto[] {
    return this.state.products
      .filter((p) => p.speciesId === speciesId && p.status === 'APPROVED')
      .map((p) => this.enrichProduct(p));
  }

  // ==========================================
  // 4. Đánh giá sản phẩm (Reviews)
  // ==========================================

  public getReviewsByProductId(productId: number): ReviewDto[] {
    return this.state.reviews.filter((r) => r.productId === productId);
  }

  public addReview(
    userId: number,
    data: CreateReviewRequest
  ): { status: number; body: { success: boolean; code: string; message: string; data: ReviewDto | null } } {
    const product = this.state.products.find((p) => p.id === data.productId);
    if (!product) {
      return {
        status: 404,
        body: { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm', data: null },
      };
    }
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) {
      return {
        status: 404,
        body: { success: false, code: 'USER_NOT_FOUND', message: 'Không tìm thấy người dùng', data: null },
      };
    }
    if (data.rating < 1 || data.rating > 5 || !data.comment || data.comment.trim().length === 0) {
      return {
        status: 400,
        body: { success: false, code: 'BAD_REQUEST', message: 'Đánh giá không hợp lệ', data: null },
      };
    }

    const newReview: MockReview = {
      id: this.state.nextReviewId++,
      productId: data.productId,
      userId,
      userFullName: user.fullName,
      rating: data.rating,
      comment: data.comment.trim(),
      createdAt: new Date().toISOString(),
    };

    this.state.reviews.push(newReview);
    this.saveState();

    return {
      status: 201,
      body: { success: true, code: 'CREATED_SUCCESS', message: 'Đánh giá sản phẩm thành công', data: newReview },
    };
  }

  // ==========================================
  // 5. Giỏ hàng (Cart)
  // ==========================================

  public getCart(userId: number): CartDto {
    const rawItems = this.state.carts[userId] || [];
    const items: CartItemDto[] = [];
    let subtotal = 0;

    for (const item of rawItems) {
      const product = this.state.products.find((p) => p.id === item.productId);
      if (!product) continue;

      const available = product.status === 'APPROVED' && product.stockQuantity > 0;
      const maxQuantity = product.stockQuantity;
      const lineTotal = available ? item.quantity * product.price : 0;

      if (available) {
        subtotal += lineTotal;
      }

      items.push({
        productId: product.id,
        productName: product.productName,
        imageUrl: product.imageUrl,
        price: product.price,
        quantity: item.quantity,
        available,
        maxQuantity,
        lineTotal,
        speciesId: product.speciesId,
      });
    }

    return {
      items,
      itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
      subtotal,
    };
  }

  public addToCart(
    userId: number,
    productId: number,
    quantity: number
  ): { status: number; body: { success: boolean; code: string; message: string; data: CartDto | null } } {
    // Số lượng phải là số nguyên dương (1.5 hoặc thiếu trường đều là dữ liệu sai)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return {
        status: 400,
        body: { success: false, code: 'CART_INVALID_QUANTITY', message: 'Số lượng phải là số nguyên lớn hơn 0', data: null },
      };
    }

    const product = this.state.products.find((p) => p.id === productId);
    if (!product) {
      return {
        status: 404,
        body: { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm', data: null },
      };
    }

    // Không được mua sản phẩm của shop mình
    const userShop = this.state.shops.find((s) => s.userId === userId);
    if (userShop && product.sellerProfileId === userShop.id) {
      return {
        status: 403,
        body: { success: false, code: 'ORDER_OWN_PRODUCT', message: 'Bạn không thể mua sản phẩm của chính shop mình', data: null },
      };
    }

    if (product.status !== 'APPROVED') {
      return {
        status: 409,
        body: { success: false, code: 'PRODUCT_NOT_AVAILABLE', message: 'Sản phẩm hiện không mở bán', data: null },
      };
    }

    if (product.stockQuantity <= 0) {
      return {
        status: 409,
        body: { success: false, code: 'PRODUCT_OUT_OF_STOCK', message: 'Sản phẩm đã hết hàng', data: null },
      };
    }

    if (!this.state.carts[userId]) {
      this.state.carts[userId] = [];
    }

    const existing = this.state.carts[userId].find((i) => i.productId === productId);
    const newQty = (existing ? existing.quantity : 0) + quantity;

    if (newQty > product.stockQuantity) {
      return {
        status: 409,
        body: { success: false, code: 'CART_QUANTITY_EXCEEDS_STOCK', message: 'Số lượng vượt quá tồn kho hiện có', data: null },
      };
    }

    if (existing) {
      existing.quantity = newQty;
    } else {
      this.state.carts[userId].push({ productId, quantity: newQty });
    }

    this.saveState();
    return {
      status: 200,
      body: { success: true, code: 'CART_ITEM_ADDED', message: 'Đã thêm vào giỏ hàng', data: this.getCart(userId) },
    };
  }

  public updateCartItem(
    userId: number,
    productId: number,
    quantity: number
  ): { status: number; body: { success: boolean; code: string; message: string; data: CartDto | null } } {
    // Số lượng phải là số nguyên dương (1.5 hoặc thiếu trường đều là dữ liệu sai)
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return {
        status: 400,
        body: { success: false, code: 'CART_INVALID_QUANTITY', message: 'Số lượng phải là số nguyên lớn hơn 0', data: null },
      };
    }

    const userCart = this.state.carts[userId];
    if (!userCart) {
      return {
        status: 404,
        body: { success: false, code: 'CART_ITEM_NOT_FOUND', message: 'Sản phẩm không có trong giỏ hàng', data: null },
      };
    }

    const existing = userCart.find((i) => i.productId === productId);
    if (!existing) {
      return {
        status: 404,
        body: { success: false, code: 'CART_ITEM_NOT_FOUND', message: 'Sản phẩm không có trong giỏ hàng', data: null },
      };
    }

    const product = this.state.products.find((p) => p.id === productId);
    if (!product) {
      return {
        status: 404,
        body: { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm', data: null },
      };
    }

    if (quantity > product.stockQuantity) {
      return {
        status: 409,
        body: { success: false, code: 'CART_QUANTITY_EXCEEDS_STOCK', message: 'Số lượng vượt quá tồn kho', data: null },
      };
    }

    existing.quantity = quantity;
    this.saveState();

    return {
      status: 200,
      body: { success: true, code: 'CART_ITEM_UPDATED', message: 'Đã cập nhật giỏ hàng', data: this.getCart(userId) },
    };
  }

  public removeCartItem(
    userId: number,
    productId: number
  ): { status: number; body: { success: boolean; code: string; message: string; data: CartDto | null } } {
    const userCart = this.state.carts[userId];
    if (!userCart) {
      return {
        status: 404,
        body: { success: false, code: 'CART_ITEM_NOT_FOUND', message: 'Sản phẩm không có trong giỏ hàng', data: null },
      };
    }

    const index = userCart.findIndex((i) => i.productId === productId);
    if (index === -1) {
      return {
        status: 404,
        body: { success: false, code: 'CART_ITEM_NOT_FOUND', message: 'Sản phẩm không có trong giỏ hàng', data: null },
      };
    }

    userCart.splice(index, 1);
    this.saveState();

    return {
      status: 200,
      body: { success: true, code: 'CART_ITEM_REMOVED', message: 'Đã xóa sản phẩm khỏi giỏ hàng', data: this.getCart(userId) },
    };
  }

  public clearCart(userId: number): { status: number; body: { success: boolean; code: string; message: string; data: CartDto } } {
    this.state.carts[userId] = [];
    this.saveState();
    return {
      status: 200,
      body: { success: true, code: 'CART_CLEARED', message: 'Đã xóa toàn bộ giỏ hàng', data: this.getCart(userId) },
    };
  }

  // ==========================================
  // 6. Đơn hàng & Thanh toán (Orders Transaction)
  // ==========================================

  public placeOrder(
    userId: number,
    body: PlaceOrderRequest
  ): { status: number; body: { success: boolean; code: string; message: string; data: OrderDto | null } } {
    const shippingAddress = body.shippingAddress ? body.shippingAddress.trim() : '';
    if (!shippingAddress) {
      return {
        status: 400,
        body: { success: false, code: 'ORDER_INVALID_SHIPPING_ADDRESS', message: 'Vui lòng nhập địa chỉ giao hàng', data: null },
      };
    }

    // Xác định danh sách món cần đặt
    let buyList: { productId: number; quantity: number }[] = [];
    // Gửi items: [] là yêu cầu sai, không được hiểu thành mua cả giỏ
    if (Array.isArray(body.items) && body.items.length === 0) {
      return {
        status: 400,
        body: { success: false, code: 'ORDER_EMPTY_ITEMS', message: 'Đơn hàng phải có ít nhất một sản phẩm', data: null },
      };
    }
    if (body.items?.some((i) => !Number.isInteger(i.quantity) || i.quantity <= 0)) {
      return {
        status: 400,
        body: { success: false, code: 'ORDER_INVALID_QUANTITY', message: 'Số lượng phải là số nguyên lớn hơn 0', data: null },
      };
    }
    const isDirectBuy = body.items && body.items.length > 0;

    if (isDirectBuy) {
      buyList = body.items!;
    } else {
      const userCart = this.state.carts[userId] || [];
      buyList = userCart.map((i) => ({ productId: i.productId, quantity: i.quantity }));
    }

    if (buyList.length === 0) {
      return {
        status: 400,
        body: { success: false, code: 'CART_EMPTY', message: 'Giỏ hàng của bạn đang trống', data: null },
      };
    }

    // Kiểm tra trùng lặp món trong đơn
    const seenProdIds = new Set<number>();
    for (const item of buyList) {
      if (item.quantity <= 0) {
        return {
          status: 400,
          body: { success: false, code: 'ORDER_INVALID_QUANTITY', message: 'Số lượng phải lớn hơn 0', data: null },
        };
      }
      if (seenProdIds.has(item.productId)) {
        return {
          status: 400,
          body: { success: false, code: 'ORDER_DUPLICATE_ITEMS', message: 'Mỗi sản phẩm chỉ được xuất hiện một lần trong đơn hàng', data: null },
        };
      }
      seenProdIds.add(item.productId);
    }

    // 1. Validation Phase (Không thay đổi dữ liệu)
    const userShop = this.state.shops.find((s) => s.userId === userId);
    for (const item of buyList) {
      const product = this.state.products.find((p) => p.id === item.productId);
      if (!product) {
        return {
          status: 404,
          body: { success: false, code: 'PRODUCT_NOT_FOUND', message: `Sản phẩm #${item.productId} không tồn tại`, data: null },
        };
      }
      if (userShop && product.sellerProfileId === userShop.id) {
        return {
          status: 403,
          body: { success: false, code: 'ORDER_OWN_PRODUCT', message: 'Bạn không thể mua sản phẩm của chính shop mình', data: null },
        };
      }
      if (product.status !== 'APPROVED') {
        return {
          status: 409,
          body: { success: false, code: 'PRODUCT_NOT_AVAILABLE', message: `Sản phẩm "${product.productName}" hiện không còn mở bán`, data: null },
        };
      }
      if (product.stockQuantity < item.quantity) {
        return {
          status: 409,
          body: { success: false, code: 'PRODUCT_OUT_OF_STOCK', message: `Sản phẩm "${product.productName}" không đủ số lượng tồn kho (còn ${product.stockQuantity})`, data: null },
        };
      }
    }

    // 2. Execution Phase (Atomic Transaction)
    let totalAmount = 0;
    const orderItems: OrderDto['items'] = [];

    for (const item of buyList) {
      const product = this.state.products.find((p) => p.id === item.productId)!;

      // Trừ tồn kho
      product.stockQuantity -= item.quantity;
      if (product.stockQuantity === 0) {
        product.status = 'SOLD_OUT';
      }

      const lineTotal = item.quantity * product.price;
      totalAmount += lineTotal;

      orderItems.push({
        productId: product.id,
        productName: product.productName,
        imageUrl: product.imageUrl,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal,
      });
    }

    // Nếu mua từ giỏ hàng -> Xóa giỏ hàng
    if (!isDirectBuy) {
      this.state.carts[userId] = [];
    }

    const newId = this.state.nextOrderId++;
    const orderCode = this.generateOrderCode();

    const newOrder: MockOrder = {
      id: newId,
      orderCode,
      userId,
      status: 'PENDING',
      totalAmount,
      shippingAddress,
      createdAt: new Date().toISOString(),
      items: orderItems,
    };

    this.state.orders.unshift(newOrder);
    this.saveState();

    return {
      status: 201,
      body: { success: true, code: 'ORDER_CREATE_SUCCESS', message: 'Đặt hàng thành công', data: newOrder },
    };
  }

  // Tài liệu 04 mục 4: mã đơn dạng ORD-<năm>-<6 ký tự>, không trùng
  private generateOrderCode(): string {
    const year = new Date().getFullYear();
    for (;;) {
      let suffix = '';
      for (let i = 0; i < 6; i++) {
        suffix += ORDER_CODE_CHARS[Math.floor(Math.random() * ORDER_CODE_CHARS.length)];
      }
      const code = `ORD-${year}-${suffix}`;
      if (!this.state.orders.some((o) => o.orderCode === code)) return code;
    }
  }

  public getUserOrders(userId: number): OrderDto[] {
    return this.state.orders.filter((o) => o.userId === userId);
  }

  public getOrderById(userId: number, orderId: number): OrderDto | null {
    return this.state.orders.find((o) => o.id === orderId && o.userId === userId) || null;
  }

  // ==========================================
  // 7. Người bán / Shop (Seller)
  // ==========================================

  public getSellerProfile(userId: number): SellerDto | null {
    return this.state.shops.find((s) => s.userId === userId) || null;
  }

  public applySeller(
    userId: number,
    body: SellerApplyRequest
  ): { status: number; body: { success: boolean; code: string; message: string; data: SellerDto | null } } {
    const shopName = body.shopName ? body.shopName.trim() : '';
    if (!shopName) {
      return {
        status: 400,
        body: { success: false, code: 'SELLER_INVALID_SHOP_NAME', message: 'Tên cửa hàng không hợp lệ', data: null },
      };
    }

    const existingShop = this.state.shops.find((s) => s.userId === userId);
    if (existingShop) {
      return {
        status: 409,
        body: { success: false, code: 'SELLER_ALREADY_REGISTERED', message: 'Tài khoản này đã đăng ký cửa hàng', data: null },
      };
    }

    const duplicateName = this.state.shops.find(
      (s) => normalizeSearchString(s.shopName) === normalizeSearchString(shopName)
    );
    if (duplicateName) {
      return {
        status: 409,
        body: { success: false, code: 'SELLER_SHOP_NAME_EXISTS', message: 'Tên cửa hàng đã tồn tại', data: null },
      };
    }

    const user = this.state.users.find((u) => u.id === userId);

    const newShop: MockSellerProfile = {
      id: this.state.nextShopId++,
      userId,
      shopName,
      businessLicenseUrl: body.businessLicenseUrl || null,
      bio: body.bio || null,
      status: 'PENDING',
      approvedByAdminId: null,
      ownerFullName: user ? user.fullName : undefined,
      ownerUsername: user ? user.username : undefined,
    };

    this.state.shops.push(newShop);
    this.saveState();

    return {
      status: 201,
      body: { success: true, code: 'SELLER_APPLY_SUCCESS', message: 'Đã gửi yêu cầu mở cửa hàng, vui lòng chờ duyệt', data: newShop },
    };
  }

  public updateSellerProfile(
    userId: number,
    body: UpdateSellerProfileRequest
  ): { status: number; body: { success: boolean; code: string; message: string; data: SellerDto | null } } {
    const shop = this.state.shops.find((s) => s.userId === userId);
    if (!shop) {
      return {
        status: 404,
        body: { success: false, code: 'SELLER_NOT_FOUND', message: 'Không tìm thấy thông tin cửa hàng', data: null },
      };
    }

    if (body.shopName && body.shopName.trim().length > 0) {
      const newName = body.shopName.trim();
      const duplicate = this.state.shops.find(
        (s) => s.id !== shop.id && normalizeSearchString(s.shopName) === normalizeSearchString(newName)
      );
      if (duplicate) {
        return {
          status: 409,
          body: { success: false, code: 'SELLER_SHOP_NAME_EXISTS', message: 'Tên cửa hàng đã tồn tại', data: null },
        };
      }
      shop.shopName = newName;
    }

    if (body.bio !== undefined) shop.bio = body.bio;
    if (body.businessLicenseUrl !== undefined) shop.businessLicenseUrl = body.businessLicenseUrl;

    this.saveState();
    return {
      status: 200,
      body: { success: true, code: 'UPDATED_SUCCESS', message: 'Cập nhật thành công', data: shop },
    };
  }

  public getSellerProducts(userId: number): { status: number; body: { success: boolean; code: string; message: string; data: ProductDto[] | null } } {
    const shop = this.state.shops.find((s) => s.userId === userId);
    // Tài liệu 04: chỉ shop ACTIVE dùng được seller/products, còn lại là 403 SELLER_NOT_ACTIVE
    if (!shop || shop.status !== 'ACTIVE') {
      return {
        status: 403,
        body: { success: false, code: 'SELLER_NOT_ACTIVE', message: 'Cửa hàng chưa được duyệt hoặc đang bị khóa', data: null },
      };
    }

    const prods = this.state.products
      .filter((p) => p.sellerProfileId === shop.id)
      .map((p) => this.enrichProduct(p));

    return {
      status: 200,
      body: { success: true, code: 'SUCCESS', message: 'Lấy danh sách sản phẩm của cửa hàng thành công', data: prods },
    };
  }

  public createSellerProduct(
    userId: number,
    body: CreateProductRequest
  ): { status: number; body: { success: boolean; code: string; message: string; data: ProductDto | null } } {
    const shop = this.state.shops.find((s) => s.userId === userId);
    if (!shop || shop.status !== 'ACTIVE') {
      return {
        status: 403,
        body: { success: false, code: 'SELLER_NOT_ACTIVE', message: 'Cửa hàng chưa được duyệt hoặc đang bị khóa', data: null },
      };
    }

    if (!body.productName || body.productName.trim().length === 0) {
      return {
        status: 400,
        body: { success: false, code: 'PRODUCT_INVALID_NAME', message: 'Tên sản phẩm không hợp lệ', data: null },
      };
    }

    if (body.price <= 0) {
      return {
        status: 400,
        body: { success: false, code: 'PRODUCT_INVALID_PRICE', message: 'Giá sản phẩm không hợp lệ', data: null },
      };
    }

    if (body.stockQuantity <= 0) {
      return {
        status: 400,
        body: { success: false, code: 'PRODUCT_INVALID_STOCK', message: 'Số lượng tồn kho không hợp lệ', data: null },
      };
    }

    const species = this.state.species.find((s) => s.id === body.speciesId);
    if (!species) {
      return {
        status: 400,
        body: { success: false, code: 'SPECIES_NOT_FOUND', message: 'Không tìm thấy thông tin loài sinh vật', data: null },
      };
    }

    const newProd: MockProduct = {
      id: this.state.nextProductId++,
      sellerProfileId: shop.id,
      speciesId: body.speciesId,
      productName: body.productName.trim(),
      price: body.price,
      stockQuantity: body.stockQuantity,
      description: body.description || '',
      imageUrl: body.imageUrl || null,
      status: 'PENDING',
      shopName: shop.shopName,
      speciesCommonName: species.commonName,
      speciesScientificName: species.scientificName,
      conservationStatus: species.conservationStatus,
    };

    this.state.products.push(newProd);
    this.saveState();

    return {
      status: 201,
      body: { success: true, code: 'PRODUCT_SUBMITTED', message: 'Đã gửi sản phẩm, vui lòng chờ kiểm duyệt', data: this.enrichProduct(newProd) },
    };
  }

  // ==========================================
  // 8. Quản trị viên (Admin Moderation)
  // ==========================================

  public enrichSeller(shop: MockSellerProfile): SellerDto {
    const user = this.state.users.find((u) => u.id === shop.userId);
    return {
      ...shop,
      ownerFullName: shop.ownerFullName || user?.fullName || 'Chủ cơ sở',
      ownerUsername: shop.ownerUsername || user?.username || 'user',
      ownerEmail: shop.ownerEmail || user?.email || 'contact@bionexus.vn',
      ownerPhone: shop.ownerPhone || user?.phone || '0912345678',
      ownerAddress: shop.ownerAddress || user?.address || 'Việt Nam',
      createdAt: shop.createdAt || '2026-03-01T08:00:00Z',
    };
  }

  public getSellers(status?: string): SellerDto[] {
    let list = this.state.shops;
    if (status && status !== 'ALL') {
      list = list.filter((s) => s.status === status);
    }
    return list.map((s) => this.enrichSeller(s));
  }

  public getPendingSellers(): SellerDto[] {
    return this.getSellers('PENDING');
  }

  public moderateSeller(
    adminId: number,
    sellerId: number,
    newStatus: SellerStatus,
    reason?: string
  ): { status: number; body: { success: boolean; code: string; message: string; data: SellerDto | null } } {
    const shop = this.state.shops.find((s) => s.id === sellerId);
    if (!shop) {
      return {
        status: 404,
        body: { success: false, code: 'SELLER_NOT_FOUND', message: 'Không tìm thấy thông tin cửa hàng', data: null },
      };
    }

    // State machine:
    // PENDING -> ACTIVE hoặc REJECTED
    // ACTIVE -> BANNED
    const valid =
      (shop.status === 'PENDING' && (newStatus === 'ACTIVE' || newStatus === 'REJECTED')) ||
      (shop.status === 'ACTIVE' && newStatus === 'BANNED');

    if (!valid) {
      return {
        status: 409,
        body: { success: false, code: 'SELLER_INVALID_STATUS_TRANSITION', message: 'Không thể chuyển cửa hàng sang trạng thái này', data: null },
      };
    }

    shop.status = newStatus;
    if (newStatus === 'ACTIVE' || newStatus === 'BANNED') {
      shop.approvedByAdminId = adminId;
    }
    if (reason) {
      shop.rejectionReason = reason;
    }
    this.saveState();

    const code =
      newStatus === 'ACTIVE'
        ? 'SELLER_APPROVED_SUCCESS'
        : newStatus === 'REJECTED'
          ? 'SELLER_REJECTED_SUCCESS'
          : 'SELLER_BANNED_SUCCESS';

    return {
      status: 200,
      body: { success: true, code, message: 'Cập nhật trạng thái cửa hàng thành công', data: this.enrichSeller(shop) },
    };
  }

  public getAdminProducts(status?: string): ProductDto[] {
    let list = this.state.products;
    if (status && status !== 'ALL') {
      list = list.filter((p) => p.status === status);
    }
    return list.map((p) => this.enrichProduct(p));
  }

  public getPendingProducts(): ProductDto[] {
    return this.getAdminProducts('PENDING');
  }

  public moderateProduct(
    _adminId: number,
    productId: number,
    newStatus: ProductStatus,
    _reason?: string
  ): { status: number; body: { success: boolean; code: string; message: string; data: ProductDto | null } } {
    const prod = this.state.products.find((p) => p.id === productId);
    if (!prod) {
      return {
        status: 404,
        body: { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm', data: null },
      };
    }

    if (prod.status !== 'PENDING' || (newStatus !== 'APPROVED' && newStatus !== 'REJECTED')) {
      return {
        status: 409,
        body: { success: false, code: 'PRODUCT_INVALID_STATUS_TRANSITION', message: 'Không thể chuyển sản phẩm sang trạng thái này', data: null },
      };
    }

    prod.status = newStatus;
    this.saveState();

    const code = newStatus === 'APPROVED' ? 'PRODUCT_APPROVED_SUCCESS' : 'PRODUCT_REJECTED_SUCCESS';

    return {
      status: 200,
      body: { success: true, code, message: 'Cập nhật trạng thái sản phẩm thành công', data: this.enrichProduct(prod) },
    };
  }

  public createSpecies(
    _adminId: number,
    body: CreateSpeciesRequest
  ): { status: number; body: { success: boolean; code: string; message: string; data: SpeciesDto | null } } {
    const parentNode = this.state.taxonomy.find((n) => n.id === body.nodeId);
    if (!parentNode || parentNode.rank !== 'GENUS') {
      return {
        status: 400,
        body: { success: false, code: 'TAXONOMY_NOT_GENUS', message: 'Loài phải được gắn vào nhánh phân loại cấp chi (GENUS)', data: null },
      };
    }

    const duplicate = this.state.species.find(
      (s) => normalizeSearchString(s.scientificName) === normalizeSearchString(body.scientificName)
    );
    if (duplicate) {
      return {
        status: 409,
        body: { success: false, code: 'SPECIES_NAME_EXISTS', message: 'Tên khoa học của loài đã tồn tại', data: null },
      };
    }

    const newSpecies: MockSpecies = {
      id: this.state.nextSpeciesId++,
      nodeId: body.nodeId,
      scientificName: body.scientificName.trim(),
      commonName: body.commonName.trim(),
      conservationStatus: body.conservationStatus,
      environmentSpecs: body.environmentSpecs,
      description: body.description,
      imageURL: body.imageURL,
      referenceURL: body.referenceURL,
    };

    this.state.species.push(newSpecies);
    this.saveState();

    return {
      status: 201,
      body: { success: true, code: 'CREATED_SUCCESS', message: 'Tạo mới loài sinh vật thành công', data: newSpecies },
    };
  }

  // ==========================================
  // 9. Xác thực & Hồ sơ (Auth & Profile)
  // ==========================================

  public loginUser(
    username: string,
    password: string
  ): { status: number; body: { success: boolean; code: string; message: string; data: any } } {
    const user = this.state.users.find((u) => u.username === username);
    if (!user || user.passwordHash !== password) {
      return {
        status: 401,
        body: { success: false, code: 'AUTH_INVALID_CREDENTIALS', message: 'Sai tài khoản hoặc mật khẩu', data: null },
      };
    }

    if (user.status === 'BANNED') {
      return {
        status: 403,
        body: { success: false, code: 'AUTH_ACCOUNT_BANNED', message: 'Tài khoản của bạn đã bị khóa vĩnh viễn', data: null },
      };
    }

    if (user.status === 'INACTIVE') {
      return {
        status: 403,
        body: { success: false, code: 'AUTH_ACCOUNT_INACTIVE', message: 'Tài khoản chưa được kích hoạt hoặc đang tạm khóa', data: null },
      };
    }

    const token = createMockToken({
      sub: user.id,
      username: user.username,
      accountType: 'USER',
      role: null,
    });

    return {
      status: 200,
      body: {
        success: true,
        code: 'SUCCESS',
        message: 'Đăng nhập thành công',
        data: {
          token,
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          accountType: 'USER',
          role: null,
        },
      },
    };
  }

  public loginAdmin(
    account: string,
    password: string
  ): { status: number; body: { success: boolean; code: string; message: string; data: any } } {
    const admin = this.state.admins.find((a) => a.account === account);
    if (!admin || admin.passwordHash !== password) {
      return {
        status: 401,
        body: { success: false, code: 'AUTH_INVALID_CREDENTIALS', message: 'Sai tài khoản hoặc mật khẩu', data: null },
      };
    }

    if (admin.status === 'BANNED') {
      return {
        status: 403,
        body: { success: false, code: 'AUTH_ACCOUNT_BANNED', message: 'Tài khoản của bạn đã bị khóa vĩnh viễn', data: null },
      };
    }

    if (admin.status === 'INACTIVE') {
      return {
        status: 403,
        body: { success: false, code: 'AUTH_ACCOUNT_INACTIVE', message: 'Tài khoản chưa được kích hoạt hoặc đang tạm khóa', data: null },
      };
    }

    const token = createMockToken({
      sub: admin.id,
      username: admin.account,
      accountType: 'ADMIN',
      role: admin.adminRole,
    });

    return {
      status: 200,
      body: {
        success: true,
        code: 'SUCCESS',
        message: 'Đăng nhập thành công',
        data: {
          token,
          id: admin.id,
          username: admin.account,
          fullName: admin.fullName,
          accountType: 'ADMIN',
          role: admin.adminRole,
        },
      },
    };
  }

  public registerUser(
    data: RegisterRequest
  ): { status: number; body: { success: boolean; code: string; message: string; data: any } } {
    if (!data.username || !data.password || !data.email || !data.fullName) {
      return {
        status: 400,
        body: { success: false, code: 'USER_MISSING_FIELDS', message: 'Vui lòng điền đầy đủ thông tin bắt buộc', data: null },
      };
    }

    const duplicateUsername = this.state.users.find(
      (u) => normalizeSearchString(u.username) === normalizeSearchString(data.username)
    );
    if (duplicateUsername) {
      return {
        status: 409,
        body: { success: false, code: 'USER_USERNAME_EXISTS', message: 'Tên đăng nhập đã tồn tại', data: null },
      };
    }

    const duplicateEmail = this.state.users.find(
      (u) => normalizeSearchString(u.email) === normalizeSearchString(data.email)
    );
    if (duplicateEmail) {
      return {
        status: 409,
        body: { success: false, code: 'USER_EMAIL_EXISTS', message: 'Email đã được sử dụng', data: null },
      };
    }

    const newUser: MockUser = {
      id: this.state.nextUserId++,
      username: data.username,
      passwordHash: data.password,
      email: data.email,
      fullName: data.fullName,
      phone: data.phone || '',
      address: data.address || '',
      status: 'ACTIVE',
    };

    this.state.users.push(newUser);
    this.saveState();

    const token = createMockToken({
      sub: newUser.id,
      username: newUser.username,
      accountType: 'USER',
      role: null,
    });

    return {
      status: 201,
      body: {
        success: true,
        code: 'AUTH_REGISTER_SUCCESS',
        message: 'Đăng ký tài khoản thành công',
        data: {
          token,
          id: newUser.id,
          username: newUser.username,
          fullName: newUser.fullName,
          accountType: 'USER',
          role: null,
        },
      },
    };
  }

  public getMe(userId: number): MeDto | null {
    const user = this.state.users.find((u) => u.id === userId);
    if (!user) return null;

    const shop = this.state.shops.find((s) => s.userId === userId) || null;

    return {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      address: user.address,
      status: user.status,
      shop,
    };
  }
}

export const db = new MockDatabase();
