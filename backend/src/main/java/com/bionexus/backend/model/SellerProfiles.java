package com.bionexus.backend.model;

import java.time.LocalDateTime;

public class SellerProfiles {
    private int sellerProfileID;
    private int userID;
    private String shopName;
    private String businessLicenseUrl;
    private String bio;
    private String status;
    private LocalDateTime createdAt;

    // Constructors
    public SellerProfiles() {}

    public SellerProfiles(int userID, String shopName, String businessLicenseUrl, String bio, String status) {
        this.userID = userID;
        this.shopName = shopName;
        this.businessLicenseUrl = businessLicenseUrl;
        this.bio = bio;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getSellerProfileID() {
        return sellerProfileID;
    }

    public void setSellerProfileID(int sellerProfileID) {
        this.sellerProfileID = sellerProfileID;
    }

    public int getUserID() {
        return userID;
    }

    public void setUserID(int userID) {
        this.userID = userID;
    }

    public String getShopName() {
        return shopName;
    }

    public void setShopName(String shopName) {
        this.shopName = shopName;
    }

    public String getBusinessLicenseUrl() {
        return businessLicenseUrl;
    }

    public void setBusinessLicenseUrl(String businessLicenseUrl) {
        this.businessLicenseUrl = businessLicenseUrl;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
