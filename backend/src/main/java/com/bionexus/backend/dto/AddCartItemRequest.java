package com.bionexus.backend.dto;

/** Body của POST /api/cart/items. Dùng Integer để phân biệt "thiếu trường" với giá trị 0. */
public record AddCartItemRequest(Integer productId, Integer quantity) {
}
