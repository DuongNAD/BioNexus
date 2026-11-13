/**
 * BioNexus API Contract & DTO Types
 * Khớp 100% hợp đồng docs/frontend/04-hop-dong-api-va-mock.md và backend Java DTOs.
 */

// ==================== 1. Enums ====================
export type TaxonomyRank = 'KINGDOM' | 'PHYLUM' | 'CLASS' | 'ORDER' | 'FAMILY' | 'GENUS';
export type ConservationStatus = 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX';
export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD_OUT';
export type SellerStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BANNED';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
// export type PaymentMethod = 'COD' | 'BANK_TRANSFER'; // [TN-10]
// export type PaymentStatus = 'UNPAID' | 'PAID'; // [TN-11]
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
export type AccountType = 'USER' | 'ADMIN';
export type AdminRole = 'SUPER_ADMIN' | 'BIOLOGIST' | 'MODERATOR';

// 59+ enum codes từ com.bionexus.backend.enums.MessageKey
export type MessageKey =
  // COMMON
  | 'SUCCESS'
  | 'CREATED_SUCCESS'
  | 'UPDATED_SUCCESS'
  | 'DELETED_SUCCESS'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'INVALID_ID'
  | 'INVALID_JSON'
  | 'INVALID_PAGINATION'
  | 'INVALID_STATUS'
  | 'METHOD_NOT_ALLOWED'
  | 'CONFLICT'
  // AUTH
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_REGISTER_SUCCESS'
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_ACCOUNT_INACTIVE'
  | 'AUTH_ACCOUNT_BANNED'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_TOKEN_EXPIRED'
  | 'AUTH_TOKEN_INVALID'
  | 'AUTH_FORBIDDEN'
  | 'AUTH_TOO_MANY_ATTEMPTS'
  // USER
  | 'USER_NOT_FOUND'
  | 'USER_USERNAME_EXISTS'
  | 'USER_EMAIL_EXISTS'
  | 'USER_MISSING_FIELDS'
  | 'USER_INVALID_USERNAME'
  | 'USER_INVALID_EMAIL'
  | 'USER_INVALID_PASSWORD'
  | 'USER_INVALID_PHONE'
  // SELLER
  | 'SELLER_NOT_FOUND'
  | 'SELLER_ALREADY_REGISTERED'
  | 'SELLER_SHOP_NAME_EXISTS'
  | 'SELLER_NOT_ACTIVE'
  | 'SELLER_APPLY_SUCCESS'
  | 'SELLER_INVALID_SHOP_NAME'
  | 'SELLER_APPROVED_SUCCESS'
  | 'SELLER_REJECTED_SUCCESS'
  | 'SELLER_BANNED_SUCCESS'
  | 'SELLER_INVALID_STATUS_TRANSITION'
  // TAXONOMY & SPECIES
  | 'TAXONOMY_NOT_FOUND'
  | 'SPECIES_NOT_FOUND'
  | 'SPECIES_NAME_EXISTS'
  | 'TAXONOMY_NAME_EXISTS'
  | 'TAXONOMY_INVALID_PARENT'
  | 'TAXONOMY_INVALID_RANK'
  | 'SPECIES_INVALID_NODE'
  | 'SPECIES_INVALID_CONSERVATION_STATUS'
  // PRODUCT
  | 'PRODUCT_NOT_FOUND'
  | 'PRODUCT_OUT_OF_STOCK'
  | 'PRODUCT_INVALID_PRICE'
  | 'PRODUCT_SUBMITTED'
  | 'PRODUCT_APPROVED_SUCCESS'
  | 'PRODUCT_REJECTED_SUCCESS'
  | 'PRODUCT_INVALID_NAME'
  | 'PRODUCT_INVALID_STOCK'
  | 'PRODUCT_NOT_AVAILABLE'
  | 'PRODUCT_NOT_OWNED'
  | 'PRODUCT_INVALID_STATUS_TRANSITION'
  // ORDER
  | 'ORDER_NOT_FOUND'
  | 'ORDER_CREATE_SUCCESS'
  | 'ORDER_EMPTY_ITEMS'
  | 'ORDER_CANNOT_CANCEL'
  | 'ORDER_INVALID_QUANTITY'
  | 'ORDER_INVALID_SHIPPING_ADDRESS'
  | 'ORDER_DUPLICATE_ITEMS'
  | 'ORDER_OWN_PRODUCT'
  | 'ORDER_CANCEL_SUCCESS'
  // | 'ORDER_CANNOT_COMPLETE' // [TN-00]
  // | 'ORDER_COMPLETE_SUCCESS' // [TN-02]
  // | 'ORDER_QUANTITY_LIMIT' // [TN-08]
  // | 'COUPON_INVALID' // [TN-06]
  // | 'COUPON_MIN_ORDER_NOT_MET' // [TN-06]
  // | 'PAYMENT_INVALID_METHOD' // [TN-10]
  // | 'PAYMENT_CONFIRMED' // [TN-11]
  // | 'PAYMENT_CANNOT_CONFIRM' // [TN-11]
  // CART
  | 'CART_ITEM_ADDED'
  | 'CART_ITEM_UPDATED'
  | 'CART_ITEM_REMOVED'
  | 'CART_CLEARED'
  | 'CART_ITEM_NOT_FOUND'
  | 'CART_EMPTY'
  | 'CART_INVALID_QUANTITY'
  // | 'CART_UNAVAILABLE_REMOVED' // [TN-14]
  // | 'WISHLIST_ADDED' // [TN-15]
  // | 'WISHLIST_REMOVED' // [TN-15]
  // | 'REVIEW_CREATED' // [TN-16]
  // | 'REVIEW_INVALID_RATING' // [TN-16]
  // | 'REVIEW_INVALID_COMMENT' // [TN-16]
  // | 'REVIEW_NOT_PURCHASED' // [TN-16]
  // | 'REVIEW_ALREADY_EXISTS' // [TN-16]
  | 'CART_QUANTITY_EXCEEDS_STOCK';

// ==================== 2. Common Wrappers ====================
export interface ApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T | null;
}

export interface Page<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
}

// ==================== 3. Domain DTOs ====================

// 3.1 Taxonomy
export interface TaxonomyNodeDto {
  id: number;
  scientificName: string;
  commonName: string;
  rank: TaxonomyRank;
  parentId: number | null;
  childCount?: number;
  rankLevel?: TaxonomyRank;
}

export interface TaxonomyDetailDto {
  node: TaxonomyNodeDto;
  breadcrumbs: TaxonomyNodeDto[];
}

// 3.2 Species (BẮT BUỘC: imageURL và referenceURL viết hoa URL)
export interface SpeciesDto {
  id: number;
  nodeId: number;
  scientificName: string;
  commonName: string;
  conservationStatus: ConservationStatus;
  environmentSpecs: string;
  description: string;
  imageURL: string | null;
  referenceURL: string | null;
}

// 3.3 Product (BẮT BUỘC: imageUrl chữ u thường)
export interface ProductDto {
  id: number;
  sellerProfileId: number;
  speciesId: number;
  productName: string;
  price: number;
  stockQuantity: number;
  description: string;
  imageUrl: string | null;
  status: ProductStatus;
  shopName?: string;
  speciesCommonName?: string;
  speciesScientificName?: string;
  conservationStatus?: ConservationStatus;
}

// 3.4 Seller
export interface SellerDto {
  id: number;
  userId: number;
  shopName: string;
  businessLicenseUrl: string | null;
  bio: string | null;
  status: SellerStatus;
  approvedByAdminId: number | null;
  ownerFullName?: string;
  ownerUsername?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerAddress?: string;
  rejectionReason?: string;
  createdAt?: string;
}

// 3.5 Auth & User Profile
export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  fullName: string;
  accountType: AccountType;
  role: AdminRole | string | null;
}

export interface MeDto {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: UserStatus;
  shop: SellerDto | null;
}

// 3.6 Cart
export interface CartItemDto {
  productId: number;
  productName: string;
  imageUrl: string | null;
  price: number;
  quantity: number;
  available: boolean;
  maxQuantity: number;
  lineTotal: number;
  speciesId?: number;
}

export interface CartDto {
  items: CartItemDto[];
  itemCount: number;
  subtotal: number;
}

// 3.7 Order
export interface OrderItemDto {
  productId: number;
  productName: string;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderDto {
  id: number;
  orderCode: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: OrderItemDto[];
  // paymentMethod?: PaymentMethod; // [TN-10]
  // paymentStatus?: PaymentStatus; // [TN-11]
}

// [TN-03] BẮT ĐẦU · Đơn hàng cho trang quản trị (AdminOrderDto.java)
// export interface AdminOrderDto extends OrderDto {
  // buyerUsername: string | null;
  // buyerFullName: string | null;
// }
// [TN-03] KẾT THÚC

// [TN-04] BẮT ĐẦU · Thống kê doanh thu (SalesStatsDto.java)
// export interface SalesStatsDto {
  // completedRevenue: number;
  // pendingAmount: number;
  // totalOrders: number;
  // pendingOrders: number;
  // completedOrders: number;
  // cancelledOrders: number;
  // topProducts: { productId: number; productName: string; quantitySold: number; revenue: number }[];
  // revenueByMonth: { month: string; revenue: number; orderCount: number }[];
// }
// [TN-04] KẾT THÚC

// [TN-05] BẮT ĐẦU · Đơn hàng nhìn từ phía người bán (SellerOrderDto.java)
// export interface SellerOrderDto {
  // id: number;
  // orderCode: string;
  // status: OrderStatus;
  // createdAt: string;
  // buyerFullName: string | null;
  // shippingAddress: string;
  // items: OrderItemDto[];
  // shopTotal: number;
// }
// [TN-05] KẾT THÚC

// [TN-06] BẮT ĐẦU · Kết quả kiểm tra mã giảm giá (CouponDto.java)
// export interface CouponDto {
  // code: string;
  // description: string;
  // discountAmount: number;
  // minOrderAmount: number;
// }
// [TN-06] KẾT THÚC

// 3.8 Review
export interface ReviewDto {
  id: number;
  productId: number;
  userId: number;
  userFullName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ==================== 4. Request Payloads ====================
export interface LoginRequest {
  // Đăng nhập admin cũng gửi cột account qua trường username (khớp LoginRequest.java)
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
}

export interface SellerApplyRequest {
  shopName: string;
  businessLicenseUrl?: string | null;
  bio?: string | null;
}

export interface UpdateSellerProfileRequest {
  shopName?: string;
  businessLicenseUrl?: string | null;
  bio?: string | null;
}

export interface CreateProductRequest {
  speciesId: number;
  productName: string;
  price: number;
  stockQuantity: number;
  description: string;
  imageUrl: string;
}

export interface AddCartItemRequest {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface PlaceOrderRequest {
  items?: { productId: number; quantity: number }[];
  shippingAddress: string;
  // couponCode?: string; // [TN-06]
  // paymentMethod?: PaymentMethod; // [TN-10]
  // cartProductIds?: number[]; // [TN-13]
}

export interface UpdateStatusRequest {
  status: SellerStatus | ProductStatus;
  reason?: string;
}

export interface CreateSpeciesRequest {
  nodeId: number;
  scientificName: string;
  commonName: string;
  conservationStatus: ConservationStatus;
  environmentSpecs: string;
  description: string;
  imageURL: string;
  referenceURL: string;
}

export interface CreateReviewRequest {
  productId: number;
  rating: number;
  comment: string;
}

// ==================== 5. Domain Value Objects ====================
export interface ParsedEnvironmentSpecs {
  tempMin: number | null;
  tempMax: number | null;
  waterTempMin?: number | null;
  waterTempMax?: number | null;
  baskMin?: number | null;
  baskMax?: number | null;
  humidMin?: number | null;
  humidMax?: number | null;
  nightTempMin?: number | null;
  nightTempMax?: number | null;
  /** true khi chuỗi ghi "Độ ẩm: không áp dụng" (loài thủy sinh) */
  humidityNotApplicable?: boolean;
  /** Phần sau "Môi trường:" */
  habitat?: string;
  raw: string;
}
