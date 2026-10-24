package com.bionexus.backend.dal;

import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.model.Products;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

public class ProductDao {
    private Products mapRow(ResultSet rs) throws SQLException {
        return new Products(
                rs.getInt("productID"),
                rs.getInt("sellerProfileID"),
                rs.getInt("speciesID"),
                rs.getString("productName"),
                rs.getBigDecimal("price"),
                rs.getInt("stockQuantity"),
                rs.getString("description"),
                rs.getString("imageUrl"),
                ProductStatus.valueOf(rs.getString("status")),
                rs.getObject("moderatedByAdminID", Integer.class),
                rs.getObject("createdAt", java.time.LocalDateTime.class),
                rs.getObject("updatedAt", java.time.LocalDateTime.class)
        );
    }

    public List<Products> getAllProducts() {
        String sql = "SELECT * FROM Products";
        List<Products> productsList = new java.util.ArrayList<>();
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
            while (rs.next()) {
                productsList.add(mapRow(rs));
            }
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return productsList;
    }

    public Products getProductById(int productID) {
        String sql = "SELECT * FROM Products WHERE productID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, productID);
            try (ResultSet rs = pts.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean insertProduct(Products product) {
        String sql = "INSERT INTO Products (sellerProfileID, speciesID, productName, price, stockQuantity, description, imageUrl, moderatedByAdminID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, product.getSellerProfileID());
            pts.setInt(2, product.getSpeciesID());
            pts.setString(3, product.getProductName());
            pts.setBigDecimal(4, product.getPrice());
            pts.setInt(5, product.getStockQuantity());
            pts.setString(6, product.getDescription());
            pts.setString(7, product.getImageUrl());
            pts.setObject(8, product.getModeratedByAdminID(), java.sql.Types.INTEGER);
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateProduct(Products product) {
        String sql = "UPDATE Products SET sellerProfileID = ?, speciesID = ?, productName = ?, price = ?, stockQuantity = ?, description = ?, imageUrl = ?, moderatedByAdminID = ? WHERE productID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, product.getSellerProfileID());
            pts.setInt(2, product.getSpeciesID());
            pts.setString(3, product.getProductName());
            pts.setBigDecimal(4, product.getPrice());
            pts.setInt(5, product.getStockQuantity());
            pts.setString(6, product.getDescription());
            pts.setString(7, product.getImageUrl());
            if (product.getModeratedByAdminID() != null) {
                pts.setInt(8, product.getModeratedByAdminID());
            } else {
                pts.setNull(8, java.sql.Types.INTEGER);
            }
            pts.setInt(9, product.getProductID());

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateProductStatus(int productID, ProductStatus status) {
        String sql = "UPDATE Products SET status = ?, updatedAt = ? WHERE productID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, status.name());
            pts.setObject(2, java.time.LocalDateTime.now());
            pts.setInt(3, productID);

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return false;
    }
}
