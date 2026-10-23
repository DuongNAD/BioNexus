package com.bionexus.backend.model;

import com.bionexus.backend.enums.ProductStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class Products {
    private int productID;
    private int sellerProfileID;
    private int speciesID;
    private String productName;
    private BigDecimal price;
    private int stockQuantity;
    private String description;
    private String imageUrl;
    private ProductStatus productStatus;
    private Integer moderatedByAdminID;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Products() {}

    public Products(int productID, int sellerProfileID, int speciesID, String productName, BigDecimal price, int stockQuantity, String description, String imageUrl, ProductStatus productStatus, Integer moderatedByAdminID, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.productID = productID;
        this.sellerProfileID = sellerProfileID;
        this.speciesID = speciesID;
        this.productName = productName;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.description = description;
        this.imageUrl = imageUrl;
        this.productStatus = productStatus;
        this.moderatedByAdminID = moderatedByAdminID;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Products(int sellerProfileID, int speciesID, String productName, BigDecimal price, int stockQuantity, String description, String imageUrl) {
        this.sellerProfileID = sellerProfileID;
        this.speciesID = speciesID;
        this.productName = productName;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.description = description;
        this.imageUrl = imageUrl;
        this.productStatus = ProductStatus.PENDING;
        this.createdAt = LocalDateTime.now();
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    

    public int getProductID() {
        return productID;
    }

    public int getSellerProfileID() {
        return sellerProfileID;
    }

    public int getSpeciesID() {
        return speciesID;
    }

    public String getProductName() {
        return productName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public ProductStatus getProductStatus() {
        return productStatus;
    }

    public Integer getModeratedByAdminID() {
        return moderatedByAdminID;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setProductID(int productID) {
        this.productID = productID;
    }

    public void setSellerProfileID(int sellerProfileID) {
        this.sellerProfileID = sellerProfileID;
    }

    public void setSpeciesID(int speciesID) {
        this.speciesID = speciesID;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setProductStatus(ProductStatus productStatus) {
        this.productStatus = productStatus;
    }

    public void setModeratedByAdminID(Integer moderatedByAdminID) {
        this.moderatedByAdminID = moderatedByAdminID;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
