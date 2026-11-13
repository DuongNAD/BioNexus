package com.bionexus.backend.dal;

// [TN-15] BẮT ĐẦU · Truy vấn bảng Wishlists (cần chạy migrations/004_add_wishlist.sql)
// import java.sql.Connection;
// import java.sql.PreparedStatement;
// import java.sql.ResultSet;
// import java.sql.SQLException;
// import java.util.ArrayList;
// import java.util.List;

// /** Danh sách yêu thích: mỗi dòng là một sản phẩm một người đã lưu. */
// public class WishlistDao {
    // private static final int DUPLICATE_KEY = 2627; // mã lỗi SQL Server khi trùng khóa chính

    // /** Id các sản phẩm người dùng đã lưu, mới lưu nhất lên trước. */
    // public List<Integer> getProductIds(int userId) throws SQLException {
        // String sql = "SELECT productID FROM Wishlists WHERE userID = ? ORDER BY addedAt DESC, productID DESC";
        // List<Integer> ids = new ArrayList<>();
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement pts = conn.prepareStatement(sql)) {
            // pts.setInt(1, userId);
            // try (ResultSet rs = pts.executeQuery()) {
                // while (rs.next()) {
                    // ids.add(rs.getInt("productID"));
                // }
            // }
        // }
        // return ids;
    // }

    // /** Lưu một sản phẩm. Đã lưu từ trước thì không lỗi, chỉ trả false. */
    // public boolean add(int userId, int productId) throws SQLException {
        // String sql = "INSERT INTO Wishlists (userID, productID) VALUES (?, ?)";
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement pts = conn.prepareStatement(sql)) {
            // pts.setInt(1, userId);
            // pts.setInt(2, productId);
            // return pts.executeUpdate() > 0;
        // } catch (SQLException e) {
            // if (e.getErrorCode() == DUPLICATE_KEY) {
                // return false;
            // }
            // throw e;
        // }
    // }

    // /** Bỏ lưu. Trả false nếu sản phẩm không có trong danh sách. */
    // public boolean remove(int userId, int productId) throws SQLException {
        // String sql = "DELETE FROM Wishlists WHERE userID = ? AND productID = ?";
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement pts = conn.prepareStatement(sql)) {
            // pts.setInt(1, userId);
            // pts.setInt(2, productId);
            // return pts.executeUpdate() > 0;
        // }
    // }
// }
// [TN-15] KẾT THÚC
