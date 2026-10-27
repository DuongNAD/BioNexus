package com.bionexus.backend.dal;

import com.bionexus.backend.model.Carts;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;

/**
 * Giỏ hàng (bảng Carts): mỗi user tối đa 1 giỏ.
 * Khác các DAO cũ, DAO này KHÔNG nuốt lỗi: lỗi DB được ném lên (throws) để tầng service phân biệt
 * "không có giỏ" (trả về null) với "DB gặp sự cố". Khi gom DBContext về chỉ ném SQLException,
 * bạn chỉ cần bỏ ", ClassNotFoundException" ở các dòng throws.
 */
public class CartsDao {
    // Mã lỗi SQL Server khi vi phạm PRIMARY KEY / UNIQUE constraint
    private static final int DUPLICATE_KEY = 2627;

    private Carts mapRow(ResultSet rs) throws SQLException {
        return new Carts(
                rs.getInt("cartID"),
                rs.getInt("userID"),
                rs.getObject("createdAt", LocalDateTime.class),
                rs.getObject("updatedAt", LocalDateTime.class)
        );
    }

    /** Giỏ của user, hoặc null nếu user chưa có giỏ (giỏ chỉ được tạo khi thêm món đầu tiên). */
    public Carts getCartByUserId(int userID) throws SQLException, ClassNotFoundException {
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

    public Carts getCartById(int cartID) throws SQLException, ClassNotFoundException {
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

    /** Tạo giỏ mới cho user. Ném lỗi nếu user đã có giỏ (userID là UNIQUE). */
    public boolean insertCart(Carts cart) throws SQLException, ClassNotFoundException {
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
     * Giỏ của user, chưa có thì tạo. Dùng khi thêm món đầu tiên: hai request đến cùng lúc (bấm đúp)
     * không làm lỗi, bên đến sau chỉ đọc lại giỏ mà bên kia vừa tạo.
     */
    public Carts getOrCreateCartByUserId(int userID) throws SQLException, ClassNotFoundException {
        Carts cart = getCartByUserId(userID);
        if (cart != null) {
            return cart;
        }
        try {
            insertCart(new Carts(userID));
        } catch (SQLException e) {
            if (e.getErrorCode() != DUPLICATE_KEY) {
                throw e;
            }
        }
        return getCartByUserId(userID);
    }

    /** Ghi lại thời điểm giỏ vừa thay đổi (gọi sau khi thêm, sửa hoặc xóa món). */
    public boolean touchCart(int cartID) throws SQLException, ClassNotFoundException {
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
