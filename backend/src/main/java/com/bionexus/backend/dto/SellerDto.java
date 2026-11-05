package com.bionexus.backend.dto;

import com.bionexus.backend.enums.SellerProfileStatus;
import com.bionexus.backend.model.SellerProfiles;
import com.bionexus.backend.model.Users;

/**
 * Hồ sơ shop. Các trường owner* và createdAt là trường bổ sung để trang duyệt shop hiện được chủ shop là ai
 * và liên hệ thế nào. SellerDto chỉ đến tay chủ shop (api/me, seller/apply) và admin, không có ở API công khai.
 */
public record SellerDto(
        int id,
        int userId,
        String shopName,
        String businessLicenseUrl,
        String bio,
        SellerProfileStatus status,
        Integer approvedByAdminId,
        String ownerFullName,
        String ownerUsername,
        String ownerEmail,
        String ownerPhone,
        String ownerAddress,
        String createdAt
) {
    /** owner có thể là null (không tra được thì để trống các trường owner*). createdAt là chuỗi ISO-8601. */
    public static SellerDto fromEntity(SellerProfiles sellerProfiles, Users owner) {
        return new SellerDto(
                sellerProfiles.getSellerProfileID(),
                sellerProfiles.getUserID(),
                sellerProfiles.getShopName(),
                sellerProfiles.getBusinessLicenseUrl(),
                sellerProfiles.getBio(),
                sellerProfiles.getStatus(),
                sellerProfiles.getApprovedByAdminID(),
                owner == null ? null : owner.getFullName(),
                owner == null ? null : owner.getUsername(),
                owner == null ? null : owner.getEmail(),
                owner == null ? null : owner.getPhone(),
                owner == null ? null : owner.getAddress(),
                sellerProfiles.getCreatedAt() == null ? null : sellerProfiles.getCreatedAt().toString()
        );
    }
}
