import type { MockOrder } from '../types';

// Chép đúng database/seed_data.sql mục 7-8: totalAmount = tổng quantity * unitPrice.
// imageUrl của dòng đơn là ảnh sản phẩm (backend JOIN Products), adapter đổi URL seed sang ảnh thật
export const SEED_ORDERS: MockOrder[] = [
  {
    id: 1,
    orderCode: 'ORD-2026-0001',
    userId: 3, // levanc
    status: 'PENDING',
    totalAmount: 2050000,
    shippingAddress: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    createdAt: '2026-10-25T14:30:00Z',
    items: [
      { productId: 1, imageUrl: 'https://bionexus.vn/images/prod-gecko-1.jpg', productName: 'Leopard Gecko High Yellow (3 tháng tuổi)', quantity: 1, unitPrice: 850000, lineTotal: 850000 },
      { productId: 2, imageUrl: 'https://bionexus.vn/images/prod-gecko-2.jpg', productName: 'Leopard Gecko Tangerine Baby', quantity: 1, unitPrice: 1200000, lineTotal: 1200000 },
    ],
  },
  {
    id: 2,
    orderCode: 'ORD-2026-0002',
    userId: 3, // levanc
    status: 'COMPLETED',
    totalAmount: 590000,
    shippingAddress: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    createdAt: '2026-10-26T09:15:00Z',
    items: [
      { productId: 8, imageUrl: 'https://bionexus.vn/images/prod-venus-flytrap-1.jpg', productName: 'Cây bắt ruồi Venus (Venus Flytrap)', quantity: 2, unitPrice: 120000, lineTotal: 240000 },
      { productId: 10, imageUrl: 'https://bionexus.vn/images/prod-nepenthes-ampullaria-1.jpg', productName: 'Nắp ấm Ampullaria xanh', quantity: 1, unitPrice: 350000, lineTotal: 350000 },
    ],
  },
  {
    id: 3,
    orderCode: 'ORD-2026-0003',
    userId: 7, // dangvang
    status: 'CANCELLED',
    totalAmount: 3500000,
    shippingAddress: '45 Lê Lợi, Nha Trang, Khánh Hòa',
    createdAt: '2026-10-26T16:45:00Z',
    items: [
      { productId: 6, imageUrl: 'https://bionexus.vn/images/prod-hermann-tortoise-1.jpg', productName: 'Rùa Hermann baby', quantity: 1, unitPrice: 3500000, lineTotal: 3500000 },
    ],
  },
];
