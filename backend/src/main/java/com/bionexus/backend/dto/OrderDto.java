package com.bionexus.backend.dto;

import com.bionexus.backend.enums.OrderStatus;
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
        );
    }
}
