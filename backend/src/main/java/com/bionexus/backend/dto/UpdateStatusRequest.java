package com.bionexus.backend.dto;

public record UpdateStatusRequest(
        String status,
        String reason
) {
}
