package com.bionexus.backend.model;

import java.time.LocalDateTime;

/** Một món trong giỏ (bảng CartItems). Không có cột giá: giá lấy từ bảng Products. */
public class CartItems {
    private int cartID;
    private int productID;
    private int quantity;
    private LocalDateTime addedAt;

    public CartItems() {}

    public CartItems(int cartID, int productID, int quantity, LocalDateTime addedAt) {
        this.cartID = cartID;
        this.productID = productID;
        this.quantity = quantity;
        this.addedAt = addedAt;
    }

    public int getCartID() {
        return cartID;
    }

    public void setCartID(int cartID) {
        this.cartID = cartID;
    }

    public int getProductID() {
        return productID;
    }

    public void setProductID(int productID) {
        this.productID = productID;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }
}
