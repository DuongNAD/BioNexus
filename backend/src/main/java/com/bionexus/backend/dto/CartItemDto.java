package com.bionexus.backend.dto;

import java.math.BigDecimal;

/**
 * Một món trong giỏ. Giỏ không lưu giá nên price là giá HIỆN TẠI của sản phẩm.
 * available: sản phẩm đang bán (APPROVED) và còn hàng; maxQuantity: tồn kho hiện tại;
 * lineTotal: quantity x price nếu available, ngược lại 0.
 */
public record CartItemDto(
        int productId,
        String productName,
        String imageUrl,
        BigDecimal price,
        int quantity,
        boolean available,
        int maxQuantity,
        BigDecimal lineTotal,
        int speciesId
) {
}
