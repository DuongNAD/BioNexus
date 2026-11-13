package com.bionexus.backend.dto;

import com.bionexus.backend.enums.OrderStatus;
// import com.bionexus.backend.enums.PaymentMethod; // [TN-10]
// import com.bionexus.backend.enums.PaymentStatus; // [TN-11]
import com.bionexus.backend.model.Orders;

import java.math.BigDecimal;
import java.util.List;

public record OrderDto(
        long id,
        String orderCode,
        OrderStatus status,
        BigDecimal totalAmount,
        String shippingAddress,
        String createdAt,
        List<OrderItemDto> items
        // , PaymentMethod paymentMethod // [TN-10]
        // , PaymentStatus paymentStatus // [TN-11]
) {
    /** createdAt là chuỗi ISO-8601: Gson không tự đổi LocalDateTime được trên JDK 17. */
    public static OrderDto fromEntity(Orders order, List<OrderItemDto> items) {
        return new OrderDto(
                order.getOrderId(),
                order.getOrderCode(),
                order.getStatus(),
                order.getOrderAmount(),
                order.getShippingAddress(),
                order.getOrderDate() == null ? null : order.getOrderDate().toString(),
                items
                // , order.getPaymentMethod() // [TN-10]
                // , order.getPaymentStatus() // [TN-11]
        );
    }
}
