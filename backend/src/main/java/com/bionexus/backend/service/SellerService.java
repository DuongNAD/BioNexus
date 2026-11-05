package com.bionexus.backend.service;

import com.bionexus.backend.dal.ProductDao;
import com.bionexus.backend.dal.SellerProfilesDao;
import com.bionexus.backend.dal.SpeciesDao;
import com.bionexus.backend.dto.CreateProductRequest;
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

public class SellerService {
    private final SellerProfilesDao sellerProfilesDao = new SellerProfilesDao();
    private final ProductDao productDao = new ProductDao();
    private final SpeciesDao speciesDao = new SpeciesDao();
    private final DtoAssembler assembler = new DtoAssembler();

    public SellerDto getShopById(int userId) throws Exception {
        SellerProfiles profiles = sellerProfilesDao.getSellerProfileByUserId(userId);
        return profiles == null ? null : assembler.seller(profiles);
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
        if (!sellerProfilesDao.insertSellerProfile(newShop)) {
            throw new ApiException(MessageKey.INTERNAL_ERROR);
        }
        return assembler.seller(sellerProfilesDao.getSellerProfileByUserId(userId));
    }

    public List<ProductDto> getMyProducts(int userId) throws SQLException {
        SellerProfiles shop = sellerProfilesDao.getSellerProfileByUserId(userId);
        if (shop == null) {
            throw new ApiException(MessageKey.SELLER_NOT_ACTIVE);
        }
        List<Products> mine = new ArrayList<>();
        for (Products p : productDao.getAllProducts()) {
            if (p.getSellerProfileID() == shop.getSellerProfileID()) {
                mine.add(p);
            }
        }
        return assembler.products(mine);
    }


    public ProductDto createProduct(int userId, CreateProductRequest r) throws SQLException {
        SellerProfiles shop = sellerProfilesDao.getSellerProfileByUserId(userId);
        if (shop == null || shop.getStatus() != SellerProfileStatus.ACTIVE) {
            throw new ApiException(MessageKey.SELLER_NOT_ACTIVE);
        }
        if (r.productName() == null || r.productName().isBlank()) {
            throw new ApiException(MessageKey.PRODUCT_INVALID_NAME);
        }
        if (r.price() == null || r.price().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ApiException(MessageKey.PRODUCT_INVALID_PRICE);
        }
        if (r.stockQuantity() == null || r.stockQuantity() <= 0) {
            throw new ApiException(MessageKey.PRODUCT_INVALID_STOCK);
        }
        if (r.imageUrl() == null || r.imageUrl().isBlank()) {
            throw new ApiException(MessageKey.BAD_REQUEST);
        }
        if (r.speciesId() == null || speciesDao.getSpeciesBySpeciesID(r.speciesId()) == null) {
            throw new ApiException(MessageKey.SPECIES_NOT_FOUND);
        }
        Products product = new Products(shop.getSellerProfileID(), r.speciesId(), r.productName().trim(),
                r.price(), r.stockQuantity(), r.description(), r.imageUrl().trim());
        int newId = productDao.insertProductReturnId(product);
        return assembler.product(productDao.getProductById(newId));
    }

    public List<SellerDto> getSellersByStatus(SellerProfileStatus status) throws SQLException {
        List<SellerProfiles> matched = new ArrayList<>();
        for (SellerProfiles s : sellerProfilesDao.getAllSellerProfiles()) {
            if (status == null || s.getStatus() == status) {
                matched.add(s);
            }
        }
        return assembler.sellers(matched);
    }

    public List<ProductDto> getProductsByStatus(ProductStatus status) throws SQLException {
        List<Products> matched = new ArrayList<>();
        for (Products p : productDao.getAllProducts()) {
            if (status == null || p.getProductStatus() == status) {
                matched.add(p);
            }
        }
        return assembler.products(matched);
    }

    public SellerDto moderateSeller(int adminId, int sellerId, SellerProfileStatus newStatus) throws SQLException {
        SellerProfiles shop = sellerProfilesDao.getSellerProfileById(sellerId);
        if (shop == null) throw new ApiException(MessageKey.SELLER_NOT_FOUND);
        if (!sellerMoveAllowed(shop.getStatus(), newStatus))
            throw new ApiException(MessageKey.SELLER_INVALID_STATUS_TRANSITION);
        shop.setStatus(newStatus);
        shop.setApprovedByAdminID(adminId);
        if (!sellerProfilesDao.updateSellerProfile(shop))
            throw new ApiException(MessageKey.INTERNAL_ERROR);
        return assembler.seller(shop);
    }

    private static boolean sellerMoveAllowed(SellerProfileStatus from, SellerProfileStatus to) {
        return (from == SellerProfileStatus.PENDING
                && (to == SellerProfileStatus.ACTIVE || to == SellerProfileStatus.REJECTED))
                || (from == SellerProfileStatus.ACTIVE && to == SellerProfileStatus.BANNED);
    }

    public ProductDto moderateProduct(int adminId, int productId, ProductStatus newStatus) throws SQLException {
        Products product = productDao.getProductById(productId);
        if (product == null) throw new ApiException(MessageKey.PRODUCT_NOT_FOUND);
        boolean targetOk = newStatus == ProductStatus.APPROVED || newStatus == ProductStatus.REJECTED;
        if (!targetOk || !productDao.moderate(productId, newStatus, adminId))
            throw new ApiException(MessageKey.PRODUCT_INVALID_STATUS_TRANSITION);
        return assembler.product(productDao.getProductById(productId));
    }
}
