package com.bionexus.backend.model;

import java.time.LocalDateTime;

public class Carts {
    private int cartID;
    private int userID;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Carts() {}

    // Dùng khi tạo giỏ mới cho user (cartID và thời gian do DB tự điền)
    public Carts(int userID) {
        this.userID = userID;
    }

    public Carts(int cartID, int userID, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.cartID = cartID;
        this.userID = userID;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public int getCartID() {
        return cartID;
    }

    public void setCartID(int cartID) {
        this.cartID = cartID;
    }

    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
