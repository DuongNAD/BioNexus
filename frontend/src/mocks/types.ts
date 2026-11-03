import type {
  TaxonomyRank,
  ConservationStatus,
  ProductStatus,
  SellerStatus,
  OrderStatus,
  UserStatus,
  AdminRole,
} from '@/types/api';

export interface MockUser {
  id: number;
  username: string;
  passwordHash: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  status: UserStatus;
}

export interface MockAdmin {
  id: number;
  account: string;
  fullName: string;
  passwordHash: string;
  adminRole: AdminRole;
  status: UserStatus;
}

export interface MockSellerProfile {
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

export interface MockTaxonomyNode {
  id: number;
  scientificName: string;
  commonName: string;
  rank: TaxonomyRank;
  parentId: number | null;
  childCount?: number;
}

export interface MockSpecies {
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

export interface MockProduct {
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

export interface MockCartItem {
  productId: number;
  quantity: number;
}

export interface MockOrder {
  id: number;
  orderCode: string;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  items: {
    productId: number;
    productName: string;
    imageUrl?: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
}

export interface MockReview {
  id: number;
  productId: number;
  userId: number;
  userFullName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface MockDatabaseState {
  seedVersion?: number;
  users: MockUser[];
  admins: MockAdmin[];
  shops: MockSellerProfile[];
  taxonomy: MockTaxonomyNode[];
  species: MockSpecies[];
  products: MockProduct[];
  carts: Record<number, MockCartItem[]>; // Keyed by userId
  orders: MockOrder[];
  reviews: MockReview[];
  nextOrderId: number;
  nextProductId: number;
  nextShopId: number;
  nextSpeciesId: number;
  nextUserId: number;
  nextReviewId: number;
}
