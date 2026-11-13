package com.bionexus.backend.dto;

// [TN-05] BẮT ĐẦU · Đơn hàng nhìn từ phía người bán
// import com.bionexus.backend.enums.OrderStatus;
// import com.bionexus.backend.model.Orders;
// import com.bionexus.backend.model.Users;

// import java.math.BigDecimal;
// import java.util.List;

// /**
 // * Một đơn có chứa hàng của shop. items chỉ gồm các món của shop này,
 // * shopTotal là tiền hàng của shop trong đơn (không phải tổng cả đơn).
 // */
// public record SellerOrderDto(
        // long id,
        // String orderCode,
        // OrderStatus status,
        // String createdAt,
        // String buyerFullName,
        // String shippingAddress,
        // List<OrderItemDto> items,
        // BigDecimal shopTotal
// ) {
    // public static SellerOrderDto fromEntity(Orders order, Users buyer, List<OrderItemDto> shopItems) {
        // String createdAt = null;
        // if (order.getOrderDate() != null) {
            // createdAt = order.getOrderDate().toString();
        // }
        // String buyerFullName = null;
        // if (buyer != null) {
            // buyerFullName = buyer.getFullName();
        // }
        // BigDecimal shopTotal = BigDecimal.ZERO;
        // for (OrderItemDto item : shopItems) {
            // shopTotal = shopTotal.add(item.lineTotal());
        // }
        // return new SellerOrderDto(order.getOrderId(), order.getOrderCode(), order.getStatus(), createdAt,
                // buyerFullName, order.getShippingAddress(), shopItems, shopTotal);
    // }
// }
// [TN-05] KẾT THÚC
