package com.bionexus.backend.model;

import com.bionexus.backend.enums.SellerProfileStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class SellerProfilesTest {
    @Test
    void fullConstructor_assignsEveryField() {
        LocalDateTime createdAt = LocalDateTime.of(2026, 1, 1, 8, 0);
        LocalDateTime updatedAt = LocalDateTime.of(2026, 2, 2, 9, 30);

        SellerProfiles sellerProfiles = new SellerProfiles(
                1,
                2,
                3,
                "GreenSM",
                "https://example.com.vn",
                "Chuyen bo sat",
                SellerProfileStatus.ACTIVE,
                createdAt,
                updatedAt
        );

        assertEquals(1, sellerProfiles.getSellerProfileID());
        assertEquals(2, sellerProfiles.getUserID());
        assertEquals(3, sellerProfiles.getApprovedByAdminID());
        assertEquals("GreenSM", sellerProfiles.getShopName());
        assertEquals("https://example.com.vn", sellerProfiles.getBusinessLicenseUrl());
        assertEquals("Chuyen bo sat", sellerProfiles.getBio());
        assertEquals(SellerProfileStatus.ACTIVE, sellerProfiles.getStatus());
        assertEquals(createdAt, sellerProfiles.getCreatedAt());
        assertEquals(updatedAt, sellerProfiles.getUpdatedAt());
    }

    @Test
    void registrationConstructor_startsPendingWithoutApprover() {
        SellerProfiles sellerProfiles = new SellerProfiles(
                2,
                "GreenSM",
                "https://example.com.vn",
                "Chuyen bo sat"
        );
        assertNull(sellerProfiles.getApprovedByAdminID());
        assertEquals(SellerProfileStatus.PENDING,sellerProfiles.getStatus());
    }

}