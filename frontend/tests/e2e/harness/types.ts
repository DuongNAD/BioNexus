/**
 * BioNexus E2E Test Suite — Core Types and DTO Interfaces
 * Authoritative source: docs/frontend/04-hop-dong-api-va-mock.md & PROJECT.md
 */

export type TaxonomyRank = 'KINGDOM' | 'PHYLUM' | 'CLASS' | 'ORDER' | 'FAMILY' | 'GENUS';
export type ConservationStatus = 'LC' | 'NT' | 'VU' | 'EN' | 'CR' | 'EW' | 'EX';
export type ProductStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SOLD_OUT';
export type SellerStatus = 'PENDING' | 'ACTIVE' | 'REJECTED' | 'BANNED';
export type OrderStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
export type AccountType = 'USER' | 'ADMIN';
export type AdminRole = 'SUPER_ADMIN' | 'BIOLOGIST' | 'MODERATOR';

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

export interface TaxonomyNodeDto {
  id: number;
  scientificName: string;
  commonName: string;
  rank: TaxonomyRank;
  parentId: number | null;
  childCount?: number;
}

export interface TaxonomyDetailDto {
  node: TaxonomyNodeDto;
  breadcrumbs: TaxonomyNodeDto[];
}

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
}

export interface AuthResponse {
  token: string;
  id: number;
  username: string;
  fullName: string;
  accountType: AccountType;
  role: AdminRole | string | null;
}

export interface LoginRequest {
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
}

export interface SellerApplyRequest {
  shopName: string;
  businessLicenseUrl: string;
  bio: string;
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
}

export interface UpdateStatusRequest {
  status: SellerStatus | ProductStatus;
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

export interface ParsedEnvironmentSpecs {
  tempMin: number | null;
  tempMax: number | null;
  waterTempMin?: number | null;
  waterTempMax?: number | null;
  baskMin?: number | null;
  baskMax?: number | null;
  humidMin?: number | null;
  humidMax?: number | null;
  raw: string;
}

export interface RouteDefinition {
  route: string;
  pageName: string;
  permission: 'ALL' | 'GUEST' | 'USER' | 'SELLER_ACTIVE' | 'ADMIN' | 'MODERATOR' | 'BIOLOGIST';
  layout: 'Root' | 'Auth' | 'Account' | 'Seller' | 'Admin';
  is3D?: boolean;
}
