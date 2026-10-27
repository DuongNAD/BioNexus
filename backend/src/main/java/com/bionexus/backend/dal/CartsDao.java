package com.bionexus.backend.dal;

import com.bionexus.backend.model.Carts;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

/**
 * Truy vấn bảng Carts (giỏ hàng). Mỗi user có tối đa 1 giỏ.
 * Khác các DAO cũ: các hàm không tự bắt lỗi DB mà ném SQLException lên cho service,
 * để phân biệt "chưa có giỏ" (trả về null) với "DB bị lỗi" (ném lỗi).
 */
public class CartsDao {
    // Mã lỗi của SQL Server khi ghi trùng giá trị ở cột PRIMARY KEY hoặc UNIQUE.
    private static final int DUPLICATE_KEY = 2627;

    private Carts mapRow(ResultSet rs) throws SQLException {
        return new Carts(
                rs.getInt("cartID"),
                rs.getInt("userID"),
                rs.getObject("createdAt", LocalDateTime.class),
                rs.getObject("updatedAt", LocalDateTime.class)
        );
    }

    /** Giỏ của user, hoặc null nếu chưa có (giỏ chỉ được tạo khi thêm món đầu tiên). */
    public Carts getCartByUserId(int userID) throws SQLException {
        String sql = "SELECT * FROM Carts WHERE userID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, userID);
            try (ResultSet rs = pts.executeQuery()) {
                return rs.next() ? mapRow(rs) : null;
            }
        }
    }

    /** Giỏ theo cartID, hoặc null nếu không tìm thấy. */
    public Carts getCartById(int cartID) throws SQLException {
        String sql = "SELECT * FROM Carts WHERE cartID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, cartID);
            try (ResultSet rs = pts.executeQuery()) {
                return rs.next() ? mapRow(rs) : null;
            }
        }
    }

    /** Tạo giỏ mới cho user. User đã có giỏ rồi thì DB ném lỗi (userID là UNIQUE). */
    public boolean insertCart(Carts cart) throws SQLException {
        String sql = "INSERT INTO Carts (userID) VALUES (?)";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, cart.getUserID());
            return pts.executeUpdate() > 0;
        }
    }

    /**
     * Lấy giỏ của user, chưa có thì tạo (dùng khi thêm món đầu tiên).
     * Bấm đúp (2 request cùng lúc) cũng không lỗi: bên chậm hơn chỉ đọc lại giỏ mà bên kia vừa tạo.
     */
    public Carts getOrCreateCartByUserId(int userID) throws SQLException {
        Carts cart = getCartByUserId(userID);
        if (cart != null) {
            return cart;
        }
        try {
            insertCart(new Carts(userID));
        } catch (SQLException e) {
            // Trùng khóa nghĩa là request khác vừa tạo giỏ này rồi: không phải lỗi, cứ đọc lại ở dưới.
            // Các lỗi khác thì ném lên.
            if (e.getErrorCode() != DUPLICATE_KEY) {
                throw e;
            }
        }
        return getCartByUserId(userID);
    }

    /** Cập nhật thời điểm sửa giỏ (updatedAt). Gọi sau khi thêm, sửa hoặc xóa món. */
    public boolean touchCart(int cartID) throws SQLException {
        String sql = "UPDATE Carts SET updatedAt = SYSDATETIME() WHERE cartID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, cartID);
            return pts.executeUpdate() > 0;
        }
    }
}
