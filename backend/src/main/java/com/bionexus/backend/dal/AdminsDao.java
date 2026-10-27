package com.bionexus.backend.dal;

import com.bionexus.backend.enums.AdminRole;
import com.bionexus.backend.enums.AdminStatus;
import com.bionexus.backend.model.Admins;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** Truy vấn bảng Admins (tài khoản quản trị: MODERATOR, BIOLOGIST, SUPER_ADMIN). */
public class AdminsDao {
    private Admins mapRow(ResultSet rs) throws SQLException {
        return new Admins(
                rs.getInt("adminID"),
                rs.getString("fullName"),
                rs.getString("account"),
                rs.getString("password_hash"),
                AdminRole.valueOf(rs.getString("adminRole")),
                AdminStatus.valueOf(rs.getString("status")),
                rs.getObject("createdAt", java.time.LocalDateTime.class),
                rs.getObject("updatedAt", java.time.LocalDateTime.class)
        );

    }

    public List<Admins> getAllAdmins() {
        String sql = "SELECT * FROM Admins";
        List<Admins> adminsList = new ArrayList<>();
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
            int rowNum = 0;
            while (rs.next()) {
                adminsList.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return adminsList;
    }

    public Admins getAdminById(int adminID){
        String sql = "SELECT * FROM Admins WHERE adminID = ?";
        try(
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
        ) {
            pts.setInt(1, adminID);
            try(ResultSet rs = pts.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }

        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public Admins getAdminByAccount(String account) {
        String sql = "SELECT * FROM Admins WHERE account = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, account);
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

    public boolean insertAdmin(Admins admin) {
        String sql = "INSERT INTO Admins (fullName, account, password_hash, adminRole, createdAt) VALUES (?, ?, ?, ?, ?)";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, admin.getFullName());
            pts.setString(2, admin.getAccount());
            pts.setString(3, admin.getPasswordHash());
            pts.setString(4, admin.getAdminRole().name());
            pts.setObject(5, admin.getCreatedAt());

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateAdmin(Admins admin) {
        String sql = "UPDATE Admins SET fullName = ?, account = ?, password_hash = ?, adminRole = ?, updatedAt = ? WHERE adminID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, admin.getFullName());
            pts.setString(2, admin.getAccount());
            pts.setString(3, admin.getPasswordHash());
            pts.setString(4, admin.getAdminRole().name());
            pts.setObject(5, LocalDateTime.now());
            pts.setInt(6, admin.getAdminID());

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateAdminStatus(int adminID, AdminStatus adminStatus) {
        String sql = "UPDATE Admins SET status = ?, updatedAt = ? WHERE adminID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, adminStatus.name());
            pts.setObject(2, java.time.LocalDateTime.now());
            pts.setInt(3, adminID);

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
