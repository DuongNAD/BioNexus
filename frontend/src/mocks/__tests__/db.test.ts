import { describe, it, expect, beforeEach } from 'vitest';
import { db, normalizeSearchString } from '../db';

describe('MockDatabase In-Memory Engine', () => {
  beforeEach(() => {
    db.resetDb();
  });

  it('khởi tạo đầy đủ số lượng bản ghi gốc từ seed data', () => {
    const raw = db.getRawState();
    expect(raw.users).toHaveLength(7);
    expect(raw.admins).toHaveLength(5);
    expect(raw.shops).toHaveLength(5);
    expect(raw.species).toHaveLength(9);
    expect(raw.products).toHaveLength(10);
    expect(raw.orders).toHaveLength(3);
  });

  it('lấy 2 giới gốc của cây phân loại (Animalia, Plantae)', () => {
    const roots = db.getRootTaxonomy();
    expect(roots).toHaveLength(2);
    expect(roots.map((r) => r.scientificName).sort()).toEqual(['Animalia', 'Plantae']);
  });

  it('lấy chi tiết nút phân loại và tạo đúng mảng breadcrumbs từ KINGDOM', () => {
    // Chi Eublepharis (id: 21)
    const detail = db.getTaxonomyDetail(21);
    expect(detail).not.toBeNull();
    expect(detail!.node.scientificName).toBe('Eublepharis');
    expect(detail!.breadcrumbs.length).toBeGreaterThanOrEqual(5);
    expect(detail!.breadcrumbs[0]!.scientificName).toBe('Animalia');
  });

  it('lấy danh sách sản phẩm công khai chỉ trả về các sản phẩm APPROVED', () => {
    const res = db.getProducts();
    expect(res.total).toBe(7);
    expect(res.items.every((p) => p.status === 'APPROVED')).toBe(true);
  });

  it('tìm kiếm không dấu trên tên sản phẩm và tên loài', () => {
    expect(normalizeSearchString('Trăn bóng')).toBe('tran bong');
    const res = db.getProducts({ q: 'tran bong' });
    expect(res.items.length).toBeGreaterThan(0);
    expect(res.items[0]!.productName).toContain('Trăn bóng');
  });

  it('tính toán giỏ hàng động từ Products table cho levanc (userId: 3)', () => {
    const cart = db.getCart(3);
    expect(cart.items).toHaveLength(2);
    // Axolotl (450k) + Trăn bóng Pastel (2.500k) = 2.950.000
    expect(cart.subtotal).toBe(2950000);
    expect(cart.items[0]!.available).toBe(true);
  });

  it('ngăn chặn người bán tự mua sản phẩm của chính shop mình', () => {
    // nguyenvana (userId: 1) sở hữu BioGreen Exotic (sellerProfileId: 1)
    // Product 1 thuộc shop 1
    const res = db.addToCart(1, 1, 1);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('ORDER_OWN_PRODUCT');
  });

  it('thực thi transaction đặt hàng nguyên tử: trừ tồn kho và làm sạch giỏ hàng', () => {
    // levanc đặt hàng từ giỏ (gồm prod 7 x1, prod 4 x1)
    const initialProd4 = db.getProductById(4)!;
    const initialStock4 = initialProd4.stockQuantity;

    const orderRes = db.placeOrder(3, { shippingAddress: 'Hải Châu, Đà Nẵng' });
    expect(orderRes.status).toBe(201);
    expect(orderRes.body.success).toBe(true);
    expect(orderRes.body.data!.orderCode).toMatch(/^ORD-2026-\d{4}$/);

    // Tồn kho sản phẩm 4 giảm 1
    const updatedProd4 = db.getProductById(4)!;
    expect(updatedProd4.stockQuantity).toBe(initialStock4 - 1);

    // Giỏ hàng của levanc trở về rỗng
    const cartAfter = db.getCart(3);
    expect(cartAfter.items).toHaveLength(0);
    expect(cartAfter.subtotal).toBe(0);
  });

  it('rollback hoàn toàn nếu có một món không đủ tồn kho (ví dụ giỏ của phamthid)', () => {
    // phamthid (userId: 4) có Tangerine x5 (kho 3) và Rùa Hermann x1 (SOLD_OUT)
    const orderRes = db.placeOrder(4, { shippingAddress: 'Thanh Khê, Đà Nẵng' });
    expect(orderRes.status).toBe(409);
    expect(orderRes.body.success).toBe(false);

    // Giỏ hàng của phamthid vẫn nguyên vẹn
    const cartAfter = db.getCart(4);
    expect(cartAfter.items).toHaveLength(2);
  });

  it('tự động chuyển trạng thái sang SOLD_OUT khi tồn kho về 0', () => {
    // Trăn bóng Pastel (prod 4) có tồn kho 2
    // levanc mua cả 2 con
    const orderRes = db.placeOrder(3, {
      shippingAddress: 'Hải Châu, Đà Nẵng',
      items: [{ productId: 4, quantity: 2 }],
    });
    expect(orderRes.status).toBe(201);

    const updatedProd = db.getProductById(4)!;
    expect(updatedProd.stockQuantity).toBe(0);
    expect(updatedProd.status).toBe('SOLD_OUT');
  });

  it('hàm resetDb hoàn nguyên dữ liệu về seed sạch ban đầu', () => {
    db.placeOrder(3, { shippingAddress: 'Hải Châu, Đà Nẵng' });
    expect(db.getCart(3).items).toHaveLength(0);

    db.resetDb();
    expect(db.getCart(3).items).toHaveLength(2);
  });
});
