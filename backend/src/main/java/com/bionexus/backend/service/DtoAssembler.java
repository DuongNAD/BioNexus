package com.bionexus.backend.service;

import com.bionexus.backend.dal.SellerProfilesDao;
import com.bionexus.backend.dal.SpeciesDao;
import com.bionexus.backend.dal.UsersDao;
import com.bionexus.backend.dto.ProductDto;
import com.bionexus.backend.dto.SellerDto;
import com.bionexus.backend.model.Products;
import com.bionexus.backend.model.SellerProfiles;
import com.bionexus.backend.model.Species;
import com.bionexus.backend.model.Users;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Lắp DTO có kèm dữ liệu của bảng liên quan (tên shop, tên loài, chủ shop).
 * Luôn tra theo lô: cả danh sách chỉ tốn 1 đến 2 truy vấn thêm (IN (...)), không phải mỗi dòng một truy vấn.
 */
public class DtoAssembler {
    private final SellerProfilesDao sellerProfilesDao = new SellerProfilesDao();
    private final SpeciesDao speciesDao = new SpeciesDao();
    private final UsersDao usersDao = new UsersDao();

    public List<ProductDto> products(List<Products> products) throws SQLException {
        List<ProductDto> result = new ArrayList<>();
        if (products.isEmpty()) {
            return result;
        }
        Set<Integer> shopIds = new HashSet<>();
        Set<Integer> speciesIds = new HashSet<>();
        for (Products p : products) {
            shopIds.add(p.getSellerProfileID());
            speciesIds.add(p.getSpeciesID());
        }
        Map<Integer, String> shopNames = sellerProfilesDao.getShopNamesByIds(shopIds);
        Map<Integer, Species> species = speciesDao.getSpeciesByIds(speciesIds);
        for (Products p : products) {
            result.add(ProductDto.fromEntity(p, shopNames.get(p.getSellerProfileID()), species.get(p.getSpeciesID())));
        }
        return result;
    }

    public ProductDto product(Products product) throws SQLException {
        return products(List.of(product)).get(0);
    }

    public List<SellerDto> sellers(List<SellerProfiles> shops) throws SQLException {
        List<SellerDto> result = new ArrayList<>();
        if (shops.isEmpty()) {
            return result;
        }
        Set<Integer> userIds = new HashSet<>();
        for (SellerProfiles s : shops) {
            userIds.add(s.getUserID());
        }
        Map<Integer, Users> owners = usersDao.getUsersByIds(userIds);
        for (SellerProfiles s : shops) {
            result.add(SellerDto.fromEntity(s, owners.get(s.getUserID())));
        }
        return result;
    }

    public SellerDto seller(SellerProfiles shop) throws SQLException {
        return sellers(List.of(shop)).get(0);
    }
}
