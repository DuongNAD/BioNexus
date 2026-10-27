package com.bionexus.backend.dal;

import com.bionexus.backend.model.CartItems;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Truy vấn bảng CartItems (các món trong giỏ).
 * Một sản phẩm chỉ có 1 dòng trong 1 giỏ (khóa chính là cartID + productID).
 * Giỏ không lưu giá: muốn hiện giá thì đọc từ bảng Products.
 * Giống CartsDao: lỗi DB được ném lên (SQLException), không nuốt.
 */
public class CartItemsDao {
    // Mã lỗi của SQL Server khi ghi trùng giá trị ở cột PRIMARY KEY hoặc UNIQUE.
    private static final int DUPLICATE_KEY = 2627;

    private CartItems mapRow(ResultSet rs) throws SQLException {
        return new CartItems(
                rs.getInt("cartID"),
                rs.getInt("productID"),
                rs.getInt("quantity"),
                rs.getObject("addedAt", LocalDateTime.class)
        );
    }

    /** Các món trong giỏ, món thêm trước đứng trước. Giỏ rỗng thì trả danh sách rỗng. */
    public List<CartItems> getItemsByCartId(int cartID) throws SQLException {
        String sql = "SELECT * FROM CartItems WHERE cartID = ? ORDER BY addedAt, productID";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, cartID);
            try (ResultSet rs = pts.executeQuery()) {
                List<CartItems> items = new ArrayList<>();
                while (rs.next()) {
                    items.add(mapRow(rs));
                }
                return items;
            }
        }
    }

    /** Một món trong giỏ, hoặc null nếu giỏ chưa có sản phẩm này. */
    public CartItems getItem(int cartID, int productID) throws SQLException {
        String sql = "SELECT * FROM CartItems WHERE cartID = ? AND productID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, cartID);
            pts.setInt(2, productID);
            try (ResultSet rs = pts.executeQuery()) {
                return rs.next() ? mapRow(rs) : null;
            }
        }
    }

    /**
     * Thêm món vào giỏ: chưa có thì thêm dòng mới, đã có thì cộng dồn số lượng.
     * quantity phải > 0, nếu không ném IllegalArgumentException
     * (service nên kiểm trước và trả CART_INVALID_QUANTITY).
     * cartID hoặc productID không tồn tại thì DB ném SQLException (khóa ngoại).
     */
    public boolean addItem(int cartID, int productID, int quantity) throws SQLException {
        requirePositive(quantity);
        try (Connection conn = DBContext.getConnection()) {
            // Bước 1: món đã có trong giỏ thì cộng dồn số lượng.
            if (increaseQuantity(conn, cartID, productID, quantity)) {
                return true;
            }
            // Bước 2: chưa có thì thêm dòng mới.
            try {
                return insertItem(conn, cartID, productID, quantity);
            } catch (SQLException e) {
                if (e.getErrorCode() != DUPLICATE_KEY) {
                    throw e;
                }
                // Trùng khóa: request khác (bấm đúp) vừa thêm món này xen giữa bước 1 và bước 2.
                // Dòng đã có rồi nên chỉ cần cộng dồn vào dòng đó.
                return increaseQuantity(conn, cartID, productID, quantity);
            }
        }
    }

    // Cộng thêm quantity vào dòng đã có. Trả false nếu giỏ chưa có món này.
    private boolean increaseQuantity(Connection conn, int cartID, int productID, int quantity) throws SQLException {
        String sql = "UPDATE CartItems SET quantity = quantity + ? WHERE cartID = ? AND productID = ?";
        try (PreparedStatement pts = conn.prepareStatement(sql)) {
            pts.setInt(1, quantity);
            pts.setInt(2, cartID);
            pts.setInt(3, productID);
            return pts.executeUpdate() > 0;
        }
    }

    // Thêm 1 dòng mới vào giỏ.
    private boolean insertItem(Connection conn, int cartID, int productID, int quantity) throws SQLException {
        String sql = "INSERT INTO CartItems (cartID, productID, quantity) VALUES (?, ?, ?)";
        try (PreparedStatement pts = conn.prepareStatement(sql)) {
            pts.setInt(1, cartID);
            pts.setInt(2, productID);
            pts.setInt(3, quantity);
            return pts.executeUpdate() > 0;
        }
    }

    // Số lượng phải > 0. DB chỉ kiểm kết quả cuối nên không chặn được việc cộng số âm
    // vào món đã có, vì vậy phải kiểm ở đây.
    private void requirePositive(int quantity) {
        if (quantity <= 0) {
            throw new IllegalArgumentException("quantity phải lớn hơn 0 nhưng nhận được " + quantity);
        }
    }

    /**
     * Đặt số lượng của một món (thay vì cộng dồn). Trả false nếu món chưa có trong giỏ.
     * quantity phải > 0, nếu không ném IllegalArgumentException (muốn bỏ món khỏi giỏ thì gọi removeItem).
     */
    public boolean setItemQuantity(int cartID, int productID, int quantity) throws SQLException {
        requirePositive(quantity);
        String sql = "UPDATE CartItems SET quantity = ? WHERE cartID = ? AND productID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, quantity);
            pts.setInt(2, cartID);
            pts.setInt(3, productID);
            return pts.executeUpdate() > 0;
        }
    }

    /** Xóa một món khỏi giỏ. Trả false nếu món đó không có trong giỏ. */
    public boolean removeItem(int cartID, int productID) throws SQLException {
        String sql = "DELETE FROM CartItems WHERE cartID = ? AND productID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, cartID);
            pts.setInt(2, productID);
            return pts.executeUpdate() > 0;
        }
    }

    /** Xóa hết món trong giỏ (giỏ vẫn còn). Trả về số món đã xóa. */
    public int clearCart(int cartID) throws SQLException {
        String sql = "DELETE FROM CartItems WHERE cartID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, cartID);
            return pts.executeUpdate();
        }
    }
}
