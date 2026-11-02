package com.bionexus.backend.service;

import com.bionexus.backend.dal.ProductDao;
import com.bionexus.backend.dto.ProductDto;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.model.Products;
import com.bionexus.backend.util.ApiException;

import java.util.ArrayList;
import java.util.List;

public class ProductService {
    private final ProductDao productDao = new ProductDao();

    public List<ProductDto> getApprovedProducts(Integer speciesID) throws Exception{
        List<Products> products = productDao.getApprovedProducts(speciesID);
        List<ProductDto> productDtos = new ArrayList<>();
        for (Products product : products) {
            productDtos.add(ProductDto.fromEntity(product));
        }
        return productDtos;
    }

    public ProductDto getProductDetail(int productId){
        Products product = productDao.getProductById(productId);
        if (product == null || product.getProductStatus() != ProductStatus.APPROVED) {
            throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
        }
        return ProductDto.fromEntity(product);
    }

}
