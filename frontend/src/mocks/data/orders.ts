import type { MockOrder } from '../types';

export const SEED_ORDERS: MockOrder[] = [
  {
    id: 1,
    orderCode: 'ORD-2026-0001',
    userId: 3, // levanc
    status: 'PENDING',
    totalAmount: 2050000,
    shippingAddress: 'Hải Châu, Đà Nẵng',
    createdAt: '2026-10-25T14:30:00Z',
    items: [
      { productId: 1, productName: 'Trăn bóng Normal F1 (3 tháng tuổi)', quantity: 1, unitPrice: 1200000, lineTotal: 1200000 },
      { productId: 3, productName: 'Leopard Gecko Tangerine Tremper Albino', quantity: 1, unitPrice: 850000, lineTotal: 850000 },
    ],
  },
  {
    id: 2,
    orderCode: 'ORD-2026-0002',
    userId: 3, // levanc
    status: 'COMPLETED',
    totalAmount: 590000,
    shippingAddress: 'Hải Châu, Đà Nẵng',
    createdAt: '2026-10-26T09:15:00Z',
    items: [
      { productId: 7, productName: 'Nắp ấm Ampullaria chùm ấm xanh đốm đỏ', quantity: 1, unitPrice: 320000, lineTotal: 320000 },
      { productId: 5, productName: 'Cây bắt ruồi Venus Akai Ryu (Red Dragon)', quantity: 1, unitPrice: 180000, lineTotal: 180000 },
    ],
  },
  {
    id: 3,
    orderCode: 'ORD-2026-0003',
    userId: 2, // tranthib
    status: 'COMPLETED',
    totalAmount: 1800000,
    shippingAddress: 'Cầu Giấy, Hà Nội',
    createdAt: '2026-10-26T16:45:00Z',
    items: [
      { productId: 5, productName: 'Cây bắt ruồi Venus Akai Ryu (Red Dragon)', quantity: 10, unitPrice: 180000, lineTotal: 1800000 },
    ],
  },
];
