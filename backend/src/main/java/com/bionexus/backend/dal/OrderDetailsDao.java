package com.bionexus.backend.dal;

import com.bionexus.backend.model.OrderDetails;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

/** Truy vấn bảng OrderDetails (các dòng chi tiết của đơn hàng). */
public class OrderDetailsDao {
    private OrderDetails mapRow(ResultSet rs) throws SQLException {
        return new OrderDetails(
                rs.getLong("orderID"),
                rs.getInt("productID"),
                rs.getInt("quantity"),
                rs.getBigDecimal("unitPrice")
        );
    }

    public List<OrderDetails> getOrderDetailsByOrderId(long orderId) {
        String sql = "SELECT * FROM OrderDetails WHERE orderID = ?";
        List<OrderDetails> orderDetailsList = new java.util.ArrayList<>();
        try (
                var conn = DBContext.getConnection();
                var pts = conn.prepareStatement(sql)
        ) {
            pts.setLong(1, orderId);
            try (ResultSet rs = pts.executeQuery()) {
                while (rs.next()) {
                    orderDetailsList.add(mapRow(rs));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return orderDetailsList;
    }

    public List<OrderDetails> getAllOrderDetails() {
        String sql = "SELECT * FROM OrderDetails";
        List<OrderDetails> orderDetailsList = new java.util.ArrayList<>();
        try (
                var conn = DBContext.getConnection();
                var pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
            while (rs.next()) {
                orderDetailsList.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return orderDetailsList;
    }

    public boolean insertOrderDetail(OrderDetails orderDetail) {
        String sql = "INSERT INTO OrderDetails (orderID, productID, quantity, unitPrice) VALUES (?, ?, ?, ?)";
        try (
                var conn = DBContext.getConnection();
                var pts = conn.prepareStatement(sql)
        ) {
            pts.setLong(1, orderDetail.getOrderID());
            pts.setInt(2, orderDetail.getProductID());
            pts.setInt(3, orderDetail.getQuantity());
            pts.setBigDecimal(4, orderDetail.getUnitPrice());

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /** Thêm một dòng đơn bằng Connection của transaction đặt hàng. Lỗi DB được ném lên để service rollback. */
    public void insertOrderDetail(java.sql.Connection conn, OrderDetails orderDetail) throws SQLException {
        String sql = "INSERT INTO OrderDetails (orderID, productID, quantity, unitPrice) VALUES (?, ?, ?, ?)";
        try (var pts = conn.prepareStatement(sql)) {
            pts.setLong(1, orderDetail.getOrderID());
            pts.setInt(2, orderDetail.getProductID());
            pts.setInt(3, orderDetail.getQuantity());
            pts.setBigDecimal(4, orderDetail.getUnitPrice());
            pts.executeUpdate();
        }
    }

    // [TN-00] BẮT ĐẦU · Đọc các dòng của đơn bằng Connection của transaction
    // // Khác bản không có Connection ở trên: lỗi DB được ném lên (không nuốt lỗi rồi trả danh sách rỗng),
    // // để lúc hủy đơn không có chuyện đơn đã hủy mà kho chưa được hoàn.
    // public List<OrderDetails> getOrderDetailsByOrderId(java.sql.Connection conn, long orderId) throws SQLException {
        // String sql = "SELECT * FROM OrderDetails WHERE orderID = ?";
        // List<OrderDetails> orderDetailsList = new java.util.ArrayList<>();
        // try (var pts = conn.prepareStatement(sql)) {
            // pts.setLong(1, orderId);
            // try (ResultSet rs = pts.executeQuery()) {
                // while (rs.next()) {
                    // orderDetailsList.add(mapRow(rs));
                // }
            // }
        // }
        // return orderDetailsList;
    // }
    // [TN-00] KẾT THÚC

    // [TN-06] BẮT ĐẦU · Tổng tiền hàng của một đơn (cộng số lượng nhân đơn giá của từng dòng)
    // public java.math.BigDecimal sumLineTotals(java.sql.Connection conn, long orderId) throws SQLException {
        // String sql = "SELECT COALESCE(SUM(quantity * unitPrice), 0) FROM OrderDetails WHERE orderID = ?";
        // try (var pts = conn.prepareStatement(sql)) {
            // pts.setLong(1, orderId);
            // try (ResultSet rs = pts.executeQuery()) {
                // rs.next();
                // return rs.getBigDecimal(1);
            // }
        // }
    // }
    // [TN-06] KẾT THÚC

    public boolean updateOrderDetail(OrderDetails orderDetail) {
        String sql = "UPDATE OrderDetails SET productID = ?, quantity = ?, unitPrice = ? WHERE orderID = ? AND productID = ?";
        try (
                var conn = DBContext.getConnection();
                var pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, orderDetail.getProductID());
            pts.setInt(2, orderDetail.getQuantity());
            pts.setBigDecimal(3, orderDetail.getUnitPrice());
            pts.setLong(4, orderDetail.getOrderID());
            pts.setInt(5, orderDetail.getProductID());
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
