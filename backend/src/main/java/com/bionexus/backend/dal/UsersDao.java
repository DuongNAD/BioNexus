package com.bionexus.backend.dal;

import com.bionexus.backend.enums.UserStatus;
import com.bionexus.backend.model.Users;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class UsersDao {
    private Users mapRow(ResultSet rs) throws SQLException {
        return new Users(
                rs.getInt("userID"),
                rs.getString("username"),
                rs.getString("password_hash"),
                rs.getString("email"),
                rs.getString("fullName"),
                rs.getString("phone"),
                rs.getString("address"),
                UserStatus.valueOf(rs.getString("status")),
                rs.getObject("createdAt", LocalDateTime.class),
                rs.getObject("updatedAt", LocalDateTime.class)
        );
    }

    public List<Users> getAllUsers() {
        List<Users> list = new ArrayList<>();
        String sql = "SELECT * FROM Users";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return list;
    }

    public Users getUserById(int userID) {
        String sql = "SELECT * FROM Users WHERE userID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, userID);
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

    public Users getUserByUsername(String username) {
        String sql = "SELECT * FROM Users WHERE username = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, username);
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

    public boolean insertUser(Users user){
        String sql = "INSERT INTO Users (username, password_hash, email, fullName, phone, address, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try(
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
        ){
            pts.setString(1, user.getUsername());
            pts.setString(2, user.getPasswordHash());
            pts.setString(3, user.getEmail());
            pts.setString(4, user.getFullName());
            pts.setString(5, user.getPhone());
            pts.setString(6, user.getAddress());
            pts.setString(7, user.getUserStatus().name());
            pts.setObject(8, user.getCreatedAt());
            return pts.executeUpdate() > 0;
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return false;
    }
    public boolean updateUser(Users user){
        String sql = "UPDATE Users SET username = ?, password_hash = ?, email = ?, fullName = ?, phone = ?, address = ?, status = ?, updatedAt = ? WHERE userID = ?";
        try(
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
        ){
            pts.setString(1, user.getUsername());
            pts.setString(2, user.getPasswordHash());
            pts.setString(3, user.getEmail());
            pts.setString(4, user.getFullName());
            pts.setString(5, user.getPhone());
            pts.setString(6, user.getAddress());
            pts.setString(7, user.getUserStatus().name());
            pts.setObject(8, LocalDateTime.now());
            pts.setInt(9, user.getUserId());
            return pts.executeUpdate() > 0;
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return false;
    }
    public boolean updateUserStatus(int userID, UserStatus userStatus) {
        String sql = "UPDATE Users SET status = ?, updatedAt = ? WHERE userID = ?";
        try(
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
        ){
            pts.setString(1, userStatus.name());
            pts.setObject(2, LocalDateTime.now());
            pts.setInt(3, userID);
            return pts.executeUpdate() > 0;
        } catch (SQLException | ClassNotFoundException e) {
            e.printStackTrace();
        }
        return false;
    }
}

