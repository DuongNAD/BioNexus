package com.bionexus.backend.dto;

import java.math.BigDecimal;

public record CreateProductRequest(
        Integer speciesId,
        String productName,
        BigDecimal price,
        Integer stockQuantity,
        String description,
        String imageUrl
) {
}
