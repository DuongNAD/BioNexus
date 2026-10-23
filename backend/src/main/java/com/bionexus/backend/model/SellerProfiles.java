package com.bionexus.backend.model;

import com.bionexus.backend.enums.SellerProfileStatus;

import java.time.LocalDateTime;

public class SellerProfiles {
    private int sellerProfileID;
    private int userID;
    private Integer approvedByAdminID;
    private String shopName;
    private String businessLicenseUrl;
    private String bio;
    private SellerProfileStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public SellerProfiles() {}

    public SellerProfiles(int sellerProfileID, int userID, Integer approvedByAdminID, String shopName, String businessLicenseUrl, String bio, SellerProfileStatus status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.sellerProfileID = sellerProfileID;
        this.userID = userID;
        this.approvedByAdminID = approvedByAdminID;
        this.shopName = shopName;
        this.businessLicenseUrl = businessLicenseUrl;
        this.bio = bio;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    

    public SellerProfiles(int userID, String shopName, String businessLicenseUrl, String bio) {
        this.userID = userID;
        this.shopName = shopName;
        this.businessLicenseUrl = businessLicenseUrl;
        this.bio = bio;
        this.status = SellerProfileStatus.PENDING;
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

    public Integer getApprovedByAdminID() {
        return approvedByAdminID;
    }

    public void setApprovedByAdminID(Integer approvedByAdminID) {
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

    public SellerProfileStatus getStatus() {
        return status;
    }
    public void setStatus(SellerProfileStatus status) {
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
