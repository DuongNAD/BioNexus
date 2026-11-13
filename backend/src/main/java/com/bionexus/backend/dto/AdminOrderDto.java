package com.bionexus.backend.dto;

// [TN-03] BẮT ĐẦU · Đơn hàng kèm thông tin người mua, cho trang quản trị
// import com.bionexus.backend.enums.OrderStatus;
// import com.bionexus.backend.model.Orders;
// import com.bionexus.backend.model.Users;

// import java.math.BigDecimal;
// import java.util.List;

// /** Giống OrderDto nhưng thêm tên người mua để quản trị viên biết đơn của ai. */
// public record AdminOrderDto(
        // long id,
        // String orderCode,
        // OrderStatus status,
        // BigDecimal totalAmount,
        // String shippingAddress,
        // String createdAt,
        // String buyerUsername,
        // String buyerFullName,
        // List<OrderItemDto> items
// ) {
    // /** buyer có thể null nếu tài khoản không còn; khi đó hai trường tên để null. */
    // public static AdminOrderDto fromEntity(Orders order, Users buyer, List<OrderItemDto> items) {
        // String createdAt = null;
        // if (order.getOrderDate() != null) {
            // createdAt = order.getOrderDate().toString();
        // }
        // String buyerUsername = null;
        // String buyerFullName = null;
        // if (buyer != null) {
            // buyerUsername = buyer.getUsername();
            // buyerFullName = buyer.getFullName();
        // }
        // return new AdminOrderDto(order.getOrderId(), order.getOrderCode(), order.getStatus(), order.getOrderAmount(),
                // order.getShippingAddress(), createdAt, buyerUsername, buyerFullName, items);
    // }
// }
// [TN-03] KẾT THÚC
