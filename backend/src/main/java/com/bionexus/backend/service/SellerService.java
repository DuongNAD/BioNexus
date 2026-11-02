package com.bionexus.backend.service;

import com.bionexus.backend.dal.ProductDao;
import com.bionexus.backend.dal.SellerProfilesDao;
import com.bionexus.backend.dal.SpeciesDao;
import com.bionexus.backend.dto.ProductDto;
import com.bionexus.backend.dto.SellerDto;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.enums.SellerProfileStatus;
import com.bionexus.backend.model.Products;
import com.bionexus.backend.model.SellerProfiles;
import com.bionexus.backend.util.ApiException;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import static jdk.internal.org.jline.utils.Colors.s;

public class SellerService {
    private final SellerProfilesDao sellerProfilesDao = new SellerProfilesDao();
    private final ProductDao productDao = new ProductDao();
    private final SpeciesDao speciesDao = new SpeciesDao();

    public SellerDto getShopById(int userId) throws Exception {
        SellerProfiles profiles = sellerProfilesDao.getSellerProfileByUserId(userId);
        return profiles ==null ? null : SellerDto.fromEntity(profiles);
    }

    public SellerDto applyShop(int userId, String shopName, String businessLicenseUrl, String bio) throws Exception {
        if(shopName == null || shopName.isBlank()){
            throw new ApiException(MessageKey.SELLER_INVALID_SHOP_NAME);
        }

        if(sellerProfilesDao.getSellerProfileByUserId(userId) != null){
            throw new ApiException(MessageKey.SELLER_ALREADY_REGISTERED);
        }

        for(SellerProfiles sellerProfiles : sellerProfilesDao.getAllSellerProfiles()){
            if (sellerProfiles.getShopName().equalsIgnoreCase(shopName.trim())) {
                throw new ApiException(MessageKey.SELLER_SHOP_NAME_EXISTS);
            }
        }
        SellerProfiles newShop = new SellerProfiles(userId, shopName.trim(), businessLicenseUrl, bio);
        sellerProfilesDao.insertSellerProfile(newShop);
        return SellerDto.fromEntity(sellerProfilesDao.getSellerProfileByUserId(userId));
    }

    public List<ProductDto> getMyProducts(int userId) {
        SellerProfiles shop = sellerProfilesDao.getSellerProfileByUserId(userId);
        if (shop == null) {
            throw new ApiException(MessageKey.SELLER_NOT_FOUND);
        }
        List<ProductDto> result = new ArrayList<>();
        for (Products p : productDao.getAllProducts()) {
            if (p.getSellerProfileID() == shop.getSellerProfileID()) {
                result.add(ProductDto.fromEntity(p));
            }
        }
        return result;
    }


    public void createProduct(int userId, int speciesId, String productName, BigDecimal price, int stockQuantity, String description, String imageUrl) throws SQLException {
        SellerProfiles shop = sellerProfilesDao.getSellerProfileByUserId(userId);
        if (shop == null || shop.getStatus() != SellerProfileStatus.ACTIVE) {
            throw new ApiException(MessageKey.SELLER_NOT_ACTIVE);
        }
        if (productName == null || productName.isBlank()) {
            throw new ApiException(MessageKey.PRODUCT_INVALID_NAME);
        }
        if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(MessageKey.PRODUCT_INVALID_PRICE);
        }
        if (stockQuantity <= 0) {
            throw new ApiException(MessageKey.PRODUCT_INVALID_STOCK);
        }
        if (speciesDao.getSpeciesBySpeciesID(speciesId) == null) {
            throw new ApiException(MessageKey.SPECIES_NOT_FOUND);
        }
        Products product = new Products(shop.getSellerProfileID(), speciesId, productName.trim(), price, stockQuantity, description, imageUrl);
        productDao.insertProduct(product);
    }

    public List<SellerDto> getSellersByStatus(SellerProfileStatus status) {
        List<SellerDto> result = new ArrayList<>();
        for (SellerProfiles s : sellerProfilesDao.getAllSellerProfiles()) {
            if (status == null || s.getStatus() == status) {
                result.add(SellerDto.fromEntity(s));
            }
        }
        return result;
    }

    public SellerDto moderateSeller(int adminId, int sellerId, SellerProfileStatus newStatus) {
        SellerProfiles shop = sellerProfilesDao.getSellerProfileById(sellerId);
        if (shop == null) {
            throw new ApiException(MessageKey.SELLER_NOT_FOUND);
        }
        shop.setStatus(newStatus);
        shop.setApprovedByAdminID(adminId);
        sellerProfilesDao.updateSellerProfile(shop);
        return SellerDto.fromEntity(shop);
    }

    public List<ProductDto> getProductsByStatus(ProductStatus status) {
        List<ProductDto> result = new ArrayList<>();
        for (Products p : productDao.getAllProducts()) {
            if (status == null || p.getProductStatus() == status) {
                result.add(ProductDto.fromEntity(p));
            }
        }
        return result;
    }

    public ProductDto moderateProduct(int adminId, int productId, ProductStatus newStatus) {
        Products product = productDao.getProductById(productId);
        if (product == null) {
            throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
        }
        product.setProductStatus(newStatus);
        product.setModeratedByAdminID(adminId);
        productDao.updateProduct(product);
        productDao.updateProductStatus(productId, newStatus);
        return ProductDto.fromEntity(productDao.getProductById(productId));
    }
}
