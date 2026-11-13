package com.bionexus.backend.dal;

// [TN-16] BẮT ĐẦU · Truy vấn bảng Reviews (cần chạy migrations/005_add_reviews.sql)
// import com.bionexus.backend.dto.ReviewDto;

// import java.sql.Connection;
// import java.sql.PreparedStatement;
// import java.sql.ResultSet;
// import java.sql.SQLException;
// import java.sql.Statement;
// import java.time.LocalDateTime;
// import java.util.ArrayList;
// import java.util.List;

// /** Đánh giá sản phẩm. Trả thẳng ReviewDto vì luôn cần kèm tên người đánh giá (JOIN Users). */
// public class ReviewDao {
    // private static final int DUPLICATE_UNIQUE_CONSTRAINT = 2627; // trùng UNIQUE (userID, productID)
    // private static final int DUPLICATE_UNIQUE_INDEX = 2601;

    // private static final String SELECT_WITH_NAME = "SELECT r.reviewID, r.productID, r.userID, u.fullName, r.rating, r.comment, r.createdAt "
            // + "FROM Reviews r JOIN Users u ON u.userID = r.userID ";

    // private ReviewDto mapRow(ResultSet rs) throws SQLException {
        // LocalDateTime createdAt = rs.getObject("createdAt", LocalDateTime.class);
        // String createdAtText = null;
        // if (createdAt != null) {
            // createdAtText = createdAt.toString();
        // }
        // return new ReviewDto(
                // rs.getInt("reviewID"),
                // rs.getInt("productID"),
                // rs.getInt("userID"),
                // rs.getString("fullName"),
                // rs.getInt("rating"),
                // rs.getString("comment"),
                // createdAtText);
    // }

    // /** Các đánh giá của một sản phẩm, mới nhất lên trước. */
    // public List<ReviewDto> getByProductId(int productId) throws SQLException {
        // String sql = SELECT_WITH_NAME + "WHERE r.productID = ? ORDER BY r.createdAt DESC, r.reviewID DESC";
        // List<ReviewDto> result = new ArrayList<>();
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement ps = conn.prepareStatement(sql)) {
            // ps.setInt(1, productId);
            // try (ResultSet rs = ps.executeQuery()) {
                // while (rs.next()) {
                    // result.add(mapRow(rs));
                // }
            // }
        // }
        // return result;
    // }

    // public ReviewDto getById(int reviewId) throws SQLException {
        // String sql = SELECT_WITH_NAME + "WHERE r.reviewID = ?";
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement ps = conn.prepareStatement(sql)) {
            // ps.setInt(1, reviewId);
            // try (ResultSet rs = ps.executeQuery()) {
                // if (rs.next()) {
                    // return mapRow(rs);
                // }
            // }
        // }
        // return null;
    // }

    // /** Người dùng đã có đơn HOÀN TẤT chứa sản phẩm này chưa (đã mua và đã nhận hàng). */
    // public boolean hasCompletedPurchase(int userId, int productId) throws SQLException {
        // String sql = "SELECT TOP 1 1 FROM Orders o JOIN OrderDetails d ON d.orderID = o.orderID "
                // + "WHERE o.userID = ? AND d.productID = ? AND o.status = 'COMPLETED'";
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement ps = conn.prepareStatement(sql)) {
            // ps.setInt(1, userId);
            // ps.setInt(2, productId);
            // try (ResultSet rs = ps.executeQuery()) {
                // return rs.next();
            // }
        // }
    // }

    // /**
     // * Thêm đánh giá, trả về reviewID mới. Người này đã đánh giá sản phẩm rồi thì trả -1
     // * (dựa vào ràng buộc UNIQUE của DB nên hai lần bấm cùng lúc cũng chỉ lưu một lần).
     // */
    // public int insert(int userId, int productId, int rating, String comment) throws SQLException {
        // String sql = "INSERT INTO Reviews (productID, userID, rating, comment) VALUES (?, ?, ?, ?)";
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            // ps.setInt(1, productId);
            // ps.setInt(2, userId);
            // ps.setInt(3, rating);
            // ps.setString(4, comment);
            // ps.executeUpdate();
            // try (ResultSet keys = ps.getGeneratedKeys()) {
                // if (keys.next()) {
                    // return keys.getInt(1);
                // }
            // }
            // throw new SQLException("Không lấy được reviewID vừa tạo");
        // } catch (SQLException e) {
            // if (e.getErrorCode() == DUPLICATE_UNIQUE_CONSTRAINT || e.getErrorCode() == DUPLICATE_UNIQUE_INDEX) {
                // return -1;
            // }
            // throw e;
        // }
    // }
// }
// [TN-16] KẾT THÚC
