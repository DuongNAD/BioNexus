package com.bionexus.backend.dto;

public record RegisterRequest(
        String username,
        String password,
        String email,
        String fullName,
        String phone,
        String address
) {
}
