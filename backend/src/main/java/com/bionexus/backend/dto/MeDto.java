package com.bionexus.backend.dto;

import com.bionexus.backend.enums.UserStatus;
import com.bionexus.backend.model.SellerProfiles;
import com.bionexus.backend.model.Users;

public record MeDto(
        int id,
        String username,
        String fullName,
        String email,
        String phone,
        String address,
        UserStatus status,
        SellerDto shop
) {
    public static MeDto fromEntity(Users user, SellerProfiles shop) {
        return new MeDto(
                user.getUserId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getUserStatus(),
                shop == null ? null : SellerDto.fromEntity(shop)
        );
    }
}
