/**
 * BioNexus E2E Test Client (Opaque-Box Contract Client)
 * Supports testing against live HTTP servers or the authoritative contract engine.
 */

import { BioNexusTestStore, type DecodedToken } from './store.ts';
import type {
  ApiResponse,
  Page,
  TaxonomyNodeDto,
  TaxonomyDetailDto,
  SpeciesDto,
  ProductDto,
  SellerDto,
  AuthResponse,
  CartDto,
  OrderDto,
  LoginRequest,
  RegisterRequest,
  SellerApplyRequest,
  CreateProductRequest,
  PlaceOrderRequest,
  CreateSpeciesRequest,
  SellerStatus,
  ProductStatus,
} from './types.ts';

export class BioNexusTestClient {
  private store: BioNexusTestStore;
  private token: string | null = null;
  private currentSession: DecodedToken | null = null;

  constructor(store?: BioNexusTestStore) {
    this.store = store || new BioNexusTestStore();
  }

  getStore(): BioNexusTestStore {
    return this.store;
  }

  reset(): void {
    this.store.reset();
    this.token = null;
    this.currentSession = null;
  }

  setToken(token: string | null): void {
    this.token = token;
    this.currentSession = token ? this.store.decodeToken(token) : null;
  }

  getToken(): string | null {
    return this.token;
  }

  getSession(): DecodedToken | null {
    return this.currentSession;
  }

  // --- Auth & Profile ---
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const res = this.store.loginUser(credentials.username, credentials.password);
    if (res.status === 200 && res.body.data) {
      this.setToken(res.body.data.token);
    }
    return res.body as ApiResponse<AuthResponse>;
  }

  async loginAdmin(credentials: { account: string; password: string }): Promise<ApiResponse<AuthResponse>> {
    const res = this.store.loginAdmin(credentials.account, credentials.password);
    if (res.status === 200 && res.body.data) {
      this.setToken(res.body.data.token);
    }
    return res.body as ApiResponse<AuthResponse>;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const res = this.store.registerUser(data);
    if (res.status === 201 && res.body.data) {
      this.setToken(res.body.data.token);
    }
    return res.body as ApiResponse<AuthResponse>;
  }

  async getMe(): Promise<ApiResponse<any>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded) {
      return { success: false, code: 'AUTH_TOKEN_INVALID', message: 'Token không hợp lệ hoặc đã hết hạn', data: null };
    }
    return this.store.getMe(decoded.sub).body as ApiResponse<any>;
  }

  logout(): void {
    this.setToken(null);
  }

  // --- Taxonomy ---
  async getRootTaxonomy(): Promise<ApiResponse<TaxonomyNodeDto[]>> {
    const data = this.store.getRootTaxonomy();
    return { success: true, code: 'SUCCESS', message: 'Lấy danh sách nút gốc thành công', data };
  }

  async getTaxonomyDetail(id: number | string): Promise<ApiResponse<TaxonomyDetailDto>> {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      return { success: false, code: 'INVALID_ID', message: 'ID không hợp lệ', data: null };
    }
    const data = this.store.getTaxonomyDetail(numId);
    if (!data) {
      return { success: false, code: 'TAXONOMY_NOT_FOUND', message: 'Không tìm thấy nút phân loại', data: null };
    }
    return { success: true, code: 'SUCCESS', message: 'Lấy thông tin nút phân loại thành công', data };
  }

  async getTaxonomyChildren(id: number | string): Promise<ApiResponse<TaxonomyNodeDto[]>> {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      return { success: false, code: 'INVALID_ID', message: 'ID không hợp lệ', data: null };
    }
    const node = this.store.taxonomy.find((n) => n.id === numId);
    if (!node) {
      return { success: false, code: 'TAXONOMY_NOT_FOUND', message: 'Không tìm thấy nút phân loại', data: null };
    }
    const data = this.store.getTaxonomyChildren(numId);
    return { success: true, code: 'SUCCESS', message: 'Lấy danh sách nút con thành công', data };
  }

  async getTaxonomySpecies(id: number | string): Promise<ApiResponse<SpeciesDto[]>> {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      return { success: false, code: 'INVALID_ID', message: 'ID không hợp lệ', data: null };
    }
    const node = this.store.taxonomy.find((n) => n.id === numId);
    if (!node) {
      return { success: false, code: 'TAXONOMY_NOT_FOUND', message: 'Không tìm thấy nút phân loại', data: null };
    }
    const data = this.store.getTaxonomySpecies(numId);
    return { success: true, code: 'SUCCESS', message: 'Lấy danh sách loài thuộc nút thành công', data };
  }

  // --- Species ---
  async getSpeciesList(query?: { nodeId?: number; q?: string }): Promise<ApiResponse<SpeciesDto[]>> {
    const data = this.store.getSpeciesList(query);
    return { success: true, code: 'SUCCESS', message: 'Lấy danh sách loài thành công', data };
  }

  async getSpeciesDetail(id: number | string): Promise<ApiResponse<SpeciesDto>> {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      return { success: false, code: 'INVALID_ID', message: 'ID không hợp lệ', data: null };
    }
    const data = this.store.getSpeciesById(numId);
    if (!data) {
      return { success: false, code: 'SPECIES_NOT_FOUND', message: 'Không tìm thấy loài sinh vật', data: null };
    }
    return { success: true, code: 'SUCCESS', message: 'Lấy thông tin chi tiết loài thành công', data };
  }

  // --- Products ---
  async getProducts(query?: { speciesId?: number; q?: string; page?: number; size?: number }): Promise<ApiResponse<Page<ProductDto>>> {
    if (query?.page !== undefined && query.page <= 0) {
      return { success: false, code: 'INVALID_PAGINATION', message: 'Số trang phải lớn hơn hoặc bằng 1', data: null };
    }
    if (query?.size !== undefined && (query.size <= 0 || query.size > 48)) {
      return { success: false, code: 'INVALID_PAGINATION', message: 'Kích thước trang phải trong khoảng 1 đến 48', data: null };
    }
    const pageData = this.store.getProducts(query);
    return { success: true, code: 'SUCCESS', message: 'Lấy danh sách sản phẩm thành công', data: pageData };
  }

  async getProductDetail(id: number | string): Promise<ApiResponse<ProductDto>> {
    const numId = Number(id);
    if (isNaN(numId) || numId <= 0) {
      return { success: false, code: 'INVALID_ID', message: 'ID không hợp lệ', data: null };
    }
    const data = this.store.getProductById(numId);
    if (!data) {
      return { success: false, code: 'PRODUCT_NOT_FOUND', message: 'Không tìm thấy sản phẩm', data: null };
    }
    return { success: true, code: 'SUCCESS', message: 'Lấy thông tin sản phẩm thành công', data };
  }

  // --- Cart ---
  async getCart(): Promise<ApiResponse<CartDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'USER') {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Chỉ khách hàng mới có giỏ hàng', data: null };
    }
    const data = this.store.getCart(decoded.sub);
    return { success: true, code: 'SUCCESS', message: 'Lấy thông tin giỏ hàng thành công', data };
  }

  async addToCart(productId: number, quantity: number): Promise<ApiResponse<CartDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'USER') {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Chỉ khách hàng mới có quyền thao tác giỏ hàng', data: null };
    }
    const res = this.store.addToCart(decoded.sub, productId, quantity);
    return res.body as ApiResponse<CartDto>;
  }

  async updateCartItem(productId: number, quantity: number): Promise<ApiResponse<CartDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'USER') {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Chỉ khách hàng mới có quyền thao tác giỏ hàng', data: null };
    }
    const res = this.store.updateCartItem(decoded.sub, productId, quantity);
    return res.body as ApiResponse<CartDto>;
  }

  async removeCartItem(productId: number): Promise<ApiResponse<CartDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const res = this.store.removeCartItem(decoded.sub, productId);
    return res.body as ApiResponse<CartDto>;
  }

  async clearCart(): Promise<ApiResponse<CartDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const res = this.store.clearCart(decoded.sub);
    return res.body as ApiResponse<CartDto>;
  }

  // --- Orders & Checkout ---
  async placeOrder(req: PlaceOrderRequest): Promise<ApiResponse<OrderDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'USER') {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Chỉ khách hàng mới có quyền đặt hàng', data: null };
    }
    const res = this.store.placeOrder(decoded.sub, req);
    return res.body as ApiResponse<OrderDto>;
  }

  async getMyOrders(): Promise<ApiResponse<OrderDto[]>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'USER') {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Chưa đăng nhập', data: null };
    }
    const data = this.store.getUserOrders(decoded.sub);
    return { success: true, code: 'SUCCESS', message: 'Lấy lịch sử đơn hàng thành công', data };
  }

  async getOrderDetail(orderId: number): Promise<ApiResponse<OrderDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const data = this.store.getOrderById(decoded.sub, orderId);
    if (!data) {
      return { success: false, code: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng', data: null };
    }
    return { success: true, code: 'SUCCESS', message: 'Lấy chi tiết đơn hàng thành công', data };
  }

  // --- Seller Operations ---
  async applySeller(req: SellerApplyRequest): Promise<ApiResponse<SellerDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'USER') {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Chỉ người dùng mới được nộp hồ sơ mở shop', data: null };
    }
    const res = this.store.applySeller(decoded.sub, req);
    return res.body as ApiResponse<SellerDto>;
  }

  async getSellerProducts(): Promise<ApiResponse<ProductDto[]>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const res = this.store.getSellerProducts(decoded.sub);
    return res.body as ApiResponse<ProductDto[]>;
  }

  async createSellerProduct(req: CreateProductRequest): Promise<ApiResponse<ProductDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const res = this.store.createSellerProduct(decoded.sub, req);
    return res.body as ApiResponse<ProductDto>;
  }

  // --- Admin Moderation ---
  async getPendingSellers(): Promise<ApiResponse<SellerDto[]>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'ADMIN' || (decoded.role !== 'MODERATOR' && decoded.role !== 'SUPER_ADMIN')) {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền kiểm duyệt shop', data: null };
    }
    const data = this.store.getPendingSellers();
    return { success: true, code: 'SUCCESS', message: 'Lấy danh sách shop chờ duyệt thành công', data };
  }

  async moderateSeller(shopId: number, status: SellerStatus): Promise<ApiResponse<SellerDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'ADMIN' || (decoded.role !== 'MODERATOR' && decoded.role !== 'SUPER_ADMIN')) {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền kiểm duyệt shop', data: null };
    }
    const res = this.store.moderateSeller(decoded.sub, shopId, status);
    return res.body as ApiResponse<SellerDto>;
  }

  async getPendingProducts(): Promise<ApiResponse<ProductDto[]>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'ADMIN' || (decoded.role !== 'MODERATOR' && decoded.role !== 'SUPER_ADMIN')) {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền kiểm duyệt sản phẩm', data: null };
    }
    const data = this.store.getPendingProducts();
    return { success: true, code: 'SUCCESS', message: 'Lấy danh sách sản phẩm chờ duyệt thành công', data };
  }

  async moderateProduct(productId: number, status: ProductStatus): Promise<ApiResponse<ProductDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'ADMIN' || (decoded.role !== 'MODERATOR' && decoded.role !== 'SUPER_ADMIN')) {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền kiểm duyệt sản phẩm', data: null };
    }
    const res = this.store.moderateProduct(decoded.sub, productId, status);
    return res.body as ApiResponse<ProductDto>;
  }

  async createSpecies(req: CreateSpeciesRequest): Promise<ApiResponse<SpeciesDto>> {
    if (!this.token) {
      return { success: false, code: 'AUTH_UNAUTHORIZED', message: 'Chưa đăng nhập', data: null };
    }
    const decoded = this.store.decodeToken(this.token);
    if (!decoded || decoded.accountType !== 'ADMIN' || (decoded.role !== 'BIOLOGIST' && decoded.role !== 'SUPER_ADMIN')) {
      return { success: false, code: 'AUTH_FORBIDDEN', message: 'Bạn không có quyền quản lý loài', data: null };
    }
    const res = this.store.createSpecies(decoded.sub, req);
    return res.body as ApiResponse<SpeciesDto>;
  }
}
