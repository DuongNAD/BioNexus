package com.bionexus.backend.dto;

public record SellerApplyRequest(
        String shopName,
        String businessLicenseUrl,
        String bio
) {
}
