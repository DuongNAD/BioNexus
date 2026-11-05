package com.bionexus.backend.dto;

import com.bionexus.backend.enums.ConservationStatus;
import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.model.Products;
import com.bionexus.backend.model.Species;

import java.math.BigDecimal;

/**
 * Sản phẩm trả cho giao diện. Bốn trường cuối (shopName và thông tin loài) là trường bổ sung của hợp đồng:
 * để thẻ sản phẩm có tên shop và tên loài mà không phải gọi thêm API; giao diện vẫn chạy nếu thiếu chúng.
 */
public record ProductDto(
        int id,
        int sellerProfileId,
        int speciesId,
        String productName,
        BigDecimal price,
        int stockQuantity,
        String description,
        String imageUrl,
        ProductStatus status,
        String shopName,
        String speciesCommonName,
        String speciesScientificName,
        ConservationStatus conservationStatus
) {
    /** species và shopName có thể là null (không tra được thì để trống, không làm hỏng cả danh sách). */
    public static ProductDto fromEntity(Products product, String shopName, Species species) {
        return new ProductDto(
                product.getProductID(),
                product.getSellerProfileID(),
                product.getSpeciesID(),
                product.getProductName(),
                product.getPrice(),
                product.getStockQuantity(),
                product.getDescription(),
                product.getImageUrl(),
                product.getProductStatus(),
                shopName,
                species == null ? null : species.getCommonName(),
                species == null ? null : species.getScientificName(),
                species == null ? null : species.getConservationStatus()
        );
    }
}
