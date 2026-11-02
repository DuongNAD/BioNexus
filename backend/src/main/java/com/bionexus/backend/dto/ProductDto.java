package com.bionexus.backend.dto;

import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.model.Products;

import java.math.BigDecimal;

public record ProductDto(
        int id,
        int sellerProfileId,
        int speciesId,
        String productName,
        BigDecimal price,
        int stockQuantity,
        String description,
        String imageUrl,
        ProductStatus status


        ) {
    public static ProductDto fromEntity(Products product) {
        return new ProductDto(
                product.getProductID(),
                product.getSellerProfileID(),
                product.getSpeciesID(),
                product.getProductName(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getDescription(),
                product.getImageUrl(),
                product.getProductStatus()
        );
    }
}