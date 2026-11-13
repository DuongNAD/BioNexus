// Quy tắc mua hàng dùng chung cho các trang (giỏ hàng, sản phẩm, thanh toán) và cho mock.
// Khi các khối [TN-..] đang tắt, hai hàm dưới đây giữ đúng hành vi cũ:
// chỉ giới hạn theo tồn kho và miễn phí vận chuyển cho mọi đơn.
// Backend tính lại cùng quy tắc (CartService, OrderService), giao diện chỉ hiển thị trước.

// [TN-08] BẮT ĐẦU · Mỗi sản phẩm mua tối đa 10 cá thể (khớp CartService.MAX_QUANTITY_PER_PRODUCT)
// export const MAX_QUANTITY_PER_PRODUCT = 10;
// [TN-08] KẾT THÚC

// [TN-07] BẮT ĐẦU · Phí vận chuyển 30.000đ, miễn phí cho tiền hàng từ 1.000.000đ (khớp OrderService)
// export const SHIPPING_FEE = 30000;
// export const FREE_SHIPPING_FROM = 1000000;
// [TN-07] KẾT THÚC

/** Số cá thể tối đa người mua được chọn cho một sản phẩm. */
export function maxQuantityPerProduct(stock: number): number {
  let max = stock;
  // [TN-08] BẮT ĐẦU · Còn nhiều trong kho cũng chỉ cho chọn tối đa 10
  // max = Math.min(stock, MAX_QUANTITY_PER_PRODUCT);
  // [TN-08] KẾT THÚC
  return max;
}

/** Phí vận chuyển cho một mức tiền hàng. */
export function shippingFeeFor(itemsTotal: number): number {
  // Mặc định: mức miễn phí là 0đ, tức đơn nào cũng được miễn phí vận chuyển
  let fee = 0;
  let freeFrom = 0;
  // [TN-07] BẮT ĐẦU · Đơn dưới 1.000.000đ phải trả phí vận chuyển
  // fee = SHIPPING_FEE;
  // freeFrom = FREE_SHIPPING_FROM;
  // [TN-07] KẾT THÚC
  if (itemsTotal >= freeFrom) {
    return 0;
  }
  return fee;
}
