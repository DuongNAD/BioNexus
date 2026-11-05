package com.bionexus.backend.dto;

import java.util.List;

/**
 * Body của POST /api/orders. Bỏ "items" (null) thì mua cả giỏ hàng.
 * Dùng Integer để phân biệt "thiếu trường" với giá trị 0.
 */
public record PlaceOrderRequest(List<Item> items, String shippingAddress) {
    public record Item(Integer productId, Integer quantity) {
    }
}
