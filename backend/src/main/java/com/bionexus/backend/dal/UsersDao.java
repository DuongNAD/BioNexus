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
}
