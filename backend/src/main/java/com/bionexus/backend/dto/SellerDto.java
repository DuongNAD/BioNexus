package com.bionexus.backend.dto;

import com.bionexus.backend.enums.SellerProfileStatus;

public record SellerDto(
        int id,
        int userId,
        String shopName,
        String businessLicenseUrl,
        String bio,
        SellerProfileStatus status,
        Integer approvedByAdminId
) {
    public static SellerDto fromEntity(com.bionexus.backend.model.SellerProfiles sellerProfiles) {
        return new SellerDto(
                sellerProfiles.getSellerProfileID(),
                sellerProfiles.getUserID(),
                sellerProfiles.getShopName(),
                sellerProfiles.getBusinessLicenseUrl(),
                sellerProfiles.getBio(),
                sellerProfiles.getStatus(),
                sellerProfiles.getApprovedByAdminID()
        );
    }
}
