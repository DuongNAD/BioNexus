package com.bionexus.backend.service;

import com.bionexus.backend.dal.ProductDao;
import com.bionexus.backend.dto.PageDto;
import com.bionexus.backend.dto.ProductDto;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.model.Products;
import com.bionexus.backend.util.ApiException;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

public class ProductService {
    public static final int DEFAULT_PAGE_SIZE = 12;
    public static final int MAX_PAGE_SIZE = 48;

    private final ProductDao productDao = new ProductDao();
    private final DtoAssembler assembler = new DtoAssembler();

    public List<ProductDto> getApprovedProducts(Integer speciesID) throws Exception{
        return assembler.products(productDao.getApprovedProducts(speciesID));
    }

    /**
     * Danh sách công khai có lọc theo loài, từ khóa q (không phân biệt hoa thường và dấu) và phân trang.
     * page từ 1; size từ 1 đến 48; ngoài khoảng thì INVALID_PAGINATION.
     */
    public PageDto<ProductDto> searchApprovedProducts(Integer speciesId, String q, int page, int size) throws Exception {
        if (page < 1 || size < 1 || size > MAX_PAGE_SIZE) {
            throw new ApiException(MessageKey.INVALID_PAGINATION);
        }
        String keyword = (q == null || q.isBlank()) ? null : q.trim();
        int total = productDao.countApproved(speciesId, keyword);
        // page * size có thể tràn int nếu người gọi gửi page rất lớn: tính bằng long rồi cắt về int
        long offsetLong = (long) (page - 1) * size;
        List<ProductDto> items = new ArrayList<>();
        if (offsetLong < total) {
            items = assembler.products(productDao.searchApproved(speciesId, keyword, (int) offsetLong, size));
        }
        return new PageDto<>(items, page, size, total);
    }

    public ProductDto getProductDetail(int productId) throws SQLException {
        Products product = productDao.getProductById(productId);
        if (product == null || product.getProductStatus() != ProductStatus.APPROVED) {
            throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
        }
        return assembler.product(product);
    }

}
