package com.bionexus.backend.model;

import java.time.LocalDateTime;

public class SellerProfiles {
    private int sellerProfileID;
    private int userID;
    private int approvedByAdminID;
    private String shopName;
    private String businessLicenseUrl;
    private String bio;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public SellerProfiles() {}

    public SellerProfiles(int sellerProfileID, int userID, int approvedByAdminID, String shopName, String businessLicenseUrl, String bio, String status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.sellerProfileID = sellerProfileID;
        this.userID = userID;
        this.shopName = shopName;
        this.businessLicenseUrl = businessLicenseUrl;
        this.bio = bio;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    

    public SellerProfiles(int userID, int approvedByAdminID, String shopName, String businessLicenseUrl, String bio, String status) {
        this.userID = userID;
        this.approvedByAdminID = approvedByAdminID;
        this.shopName = shopName;
        this.businessLicenseUrl = businessLicenseUrl;
        this.bio = bio;
        this.status = status;
        this.createdAt = LocalDateTime.now();
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public int getSellerProfileID() {
        return sellerProfileID;
    }

    public void setSellerProfileID(int sellerProfileID) {
        this.sellerProfileID = sellerProfileID;
    }

    public int getUserID() {
        return userID;
    }

    public int getApprovedByAdminID() {
        return approvedByAdminID;
    }

    public void setApprovedByAdminID(int approvedByAdminID) {
        this.approvedByAdminID = approvedByAdminID;
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

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
