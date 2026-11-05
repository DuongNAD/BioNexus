package com.bionexus.backend.dto;

import java.math.BigDecimal;

/** Một dòng của đơn hàng. unitPrice là giá đã chốt lúc mua, không phải giá hiện tại của sản phẩm. */
public record OrderItemDto(
        int productId,
        String productName,
        String imageUrl,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
}
