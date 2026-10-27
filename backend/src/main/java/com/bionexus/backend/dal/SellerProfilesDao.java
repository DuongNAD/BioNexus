package com.bionexus.backend.dal;

import com.bionexus.backend.enums.SellerProfileStatus;
import com.bionexus.backend.model.SellerProfiles;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/** Truy vấn bảng SellerProfiles (hồ sơ shop của người bán). */
public class SellerProfilesDao {
    private SellerProfiles mapRow(ResultSet rs) throws SQLException {
        return new SellerProfiles(
                rs.getInt("sellerProfileID"),
                rs.getInt("userID"),
                rs.getObject("approvedByAdminID", Integer.class),
                rs.getString("shopName"),
                rs.getString("businessLicenseUrl"),
                rs.getString("bio"),
                SellerProfileStatus.valueOf(rs.getString("status")),
                rs.getObject("createdAt", java.time.LocalDateTime.class),
                rs.getObject("updatedAt", java.time.LocalDateTime.class)
        );
    }

    public List<SellerProfiles> getAllSellerProfiles() {
        String sql = "SELECT * FROM SellerProfiles";
        List<SellerProfiles> sellerProfilesList = new java.util.ArrayList<>();
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
            int rowNum = 0;
            while (rs.next()) {
                sellerProfilesList.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return sellerProfilesList;
    }

    public SellerProfiles getSellerProfileById(int sellerProfileID) {
        String sql = "SELECT * FROM SellerProfiles WHERE sellerProfileID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, sellerProfileID);
            try (ResultSet rs = pts.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public SellerProfiles getSellerProfileByUserId(int userID) {
        String sql = "SELECT * FROM SellerProfiles WHERE userID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, userID);
            try (ResultSet rs = pts.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public boolean insertSellerProfile(SellerProfiles sellerProfile) {
        String sql = "INSERT INTO SellerProfiles (userID, shopName, businessLicenseUrl, bio, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, sellerProfile.getUserID());
            pts.setString(2, sellerProfile.getShopName());
            pts.setString(3, sellerProfile.getBusinessLicenseUrl());
            pts.setString(4, sellerProfile.getBio());
            pts.setString(5, sellerProfile.getStatus().name());
            pts.setObject(6, java.time.LocalDateTime.now());

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateSellerProfile(SellerProfiles sellerProfile) {
        String sql = "UPDATE SellerProfiles SET userID = ?, approvedByAdminID = ?, shopName = ?, businessLicenseUrl = ?, bio = ?, status = ?, updatedAt = ? WHERE sellerProfileID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, sellerProfile.getUserID());
            pts.setObject(2, sellerProfile.getApprovedByAdminID(), java.sql.Types.INTEGER);
            pts.setString(3, sellerProfile.getShopName());
            pts.setString(4, sellerProfile.getBusinessLicenseUrl());
            pts.setString(5, sellerProfile.getBio());
            pts.setString(6, sellerProfile.getStatus().name());
            pts.setObject(7, java.time.LocalDateTime.now());
            pts.setInt(8, sellerProfile.getSellerProfileID());

            int rowsAffected = pts.executeUpdate();
                return rowsAffected > 0;
            } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
