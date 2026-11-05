package com.bionexus.backend.dto;

import java.math.BigDecimal;
import java.util.List;

/** itemCount là tổng số lượng của mọi món (không phải số dòng); subtotal chỉ cộng các món còn available. */
public record CartDto(List<CartItemDto> items, int itemCount, BigDecimal subtotal) {
    public static CartDto empty() {
        return new CartDto(List.of(), 0, BigDecimal.ZERO);
    }
}
