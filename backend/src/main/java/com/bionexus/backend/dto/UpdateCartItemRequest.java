package com.bionexus.backend.dto;

/** Body của PUT /api/cart/items/{productId}: đặt số lượng mới (không cộng dồn). */
public record UpdateCartItemRequest(Integer quantity) {
}
