package com.bionexus.backend.dal;

import com.bionexus.backend.enums.OrderStatus;
import com.bionexus.backend.model.Orders;
// import com.bionexus.backend.enums.PaymentMethod; // [TN-10]
// import com.bionexus.backend.enums.PaymentStatus; // [TN-11]

// import java.math.BigDecimal; // [TN-06]
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

/** Truy vấn bảng Orders (đơn hàng). Các dòng chi tiết của đơn nằm ở OrderDetailsDao. */
public class OrdersDao {
    private Orders mapRow(ResultSet rs) throws SQLException {
        Orders order = new Orders(
                rs.getLong("orderID"),
                rs.getString("orderCode"),
                rs.getInt("userID"),
                rs.getObject("orderDate", LocalDateTime.class),
                rs.getObject("updatedAt", LocalDateTime.class),
                rs.getBigDecimal("totalAmount"),
                OrderStatus.valueOf(rs.getString("status")),
                rs.getString("shippingAddress")
        );
        // [TN-10] BẮT ĐẦU · Đọc cột paymentMethod (cần chạy migrations/003_add_payment.sql)
        // order.setPaymentMethod(PaymentMethod.valueOf(rs.getString("paymentMethod")));
        // [TN-10] KẾT THÚC
        // [TN-11] BẮT ĐẦU · Đọc cột paymentStatus (cần chạy migrations/003_add_payment.sql)
        // order.setPaymentStatus(PaymentStatus.valueOf(rs.getString("paymentStatus")));
        // [TN-11] KẾT THÚC
        return order;
    }

    public Orders getOrderById(long orderId) {
        String sql = "SELECT * FROM Orders WHERE orderID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setLong(1, orderId);
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

    public List<Orders> getOrderByUserId(int userId) {
        String sql = "SELECT * FROM Orders WHERE userID = ? ORDER BY orderDate DESC, orderID DESC";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, userId);
            try (ResultSet rs = pts.executeQuery()) {
                List<Orders> ordersList = new java.util.ArrayList<>();
                while (rs.next()) {
                    ordersList.add(mapRow(rs));
                }
                return ordersList;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return new java.util.ArrayList<>();
    }

    public List<Orders> getAllOrders() {
        String sql = "SELECT * FROM Orders";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            try (ResultSet rs = pts.executeQuery()) {
                List<Orders> ordersList = new java.util.ArrayList<>();
                while (rs.next()) {
                    ordersList.add(mapRow(rs));
                }
                return ordersList;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return new java.util.ArrayList<>();
    }

    public Orders getOrderByCode(String orderCode) {
        String sql = "SELECT * FROM Orders WHERE orderCode = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, orderCode);
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

    public boolean insertOrder(Orders order) {
        String sql = "INSERT INTO Orders (orderCode, userID, orderDate, updatedAt, totalAmount, status, shippingAddress) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, order.getOrderCode());
            pts.setInt(2, order.getUserId());
            pts.setObject(3, order.getOrderDate());
            pts.setObject(4, order.getUpdatedAt());
            pts.setBigDecimal(5, order.getOrderAmount());
            pts.setString(6, order.getStatus().name());
            pts.setString(7, order.getShippingAddress());

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }



    /**
     * Thêm đơn bằng Connection của transaction (OrderService quản lý commit/rollback) và trả về orderID mới.
     * Ngày giờ để DB tự điền (default sysdatetime()). Trùng orderCode thì ném SQLException mã 2627.
     */
    public long insertOrderReturnId(Connection conn, Orders order) throws SQLException {
        String sql = "INSERT INTO Orders (orderCode, userID, totalAmount, status, shippingAddress) VALUES (?, ?, ?, ?, ?)";
        try (PreparedStatement pts = conn.prepareStatement(sql, java.sql.Statement.RETURN_GENERATED_KEYS)) {
            pts.setString(1, order.getOrderCode());
            pts.setInt(2, order.getUserId());
            pts.setBigDecimal(3, order.getOrderAmount());
            pts.setString(4, order.getStatus().name());
            pts.setString(5, order.getShippingAddress());
            pts.executeUpdate();
            try (ResultSet keys = pts.getGeneratedKeys()) {
                if (keys.next()) {
                    return keys.getLong(1);
                }
            }
            throw new SQLException("Không lấy được orderID vừa tạo");
        }
    }

    public boolean updateOrder(Orders order) {
        String sql = "UPDATE Orders SET orderCode = ?, userID = ?, updatedAt = ?, totalAmount = ?, status = ?, shippingAddress = ? WHERE orderID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, order.getOrderCode());
            pts.setInt(2, order.getUserId());
            pts.setObject(3, LocalDateTime.now());
            pts.setBigDecimal(4, order.getOrderAmount());
            pts.setString(5, order.getStatus().name());
            pts.setString(6, order.getShippingAddress());
            pts.setLong(7, order.getOrderId());

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    // [TN-00] BẮT ĐẦU · Đổi trạng thái đơn bằng Connection của transaction
    // // Chỉ đổi khi đơn đang ở trạng thái "from". Hai người bấm cùng lúc thì chỉ một câu UPDATE
    // // đổi được dòng (trả true), người kia nhận false, nhờ vậy kho không bị hoàn hai lần.
    // public boolean updateStatusIfCurrent(Connection conn, long orderId, OrderStatus from, OrderStatus to) throws SQLException {
        // String sql = "UPDATE Orders SET status = ?, updatedAt = SYSDATETIME() WHERE orderID = ? AND status = ?";
        // try (PreparedStatement pts = conn.prepareStatement(sql)) {
            // pts.setString(1, to.name());
            // pts.setLong(2, orderId);
            // pts.setString(3, from.name());
            // int rowsAffected = pts.executeUpdate();
            // return rowsAffected > 0;
        // }
    // }
    // [TN-00] KẾT THÚC

    // [TN-03] BẮT ĐẦU · Danh sách đơn cho trang quản trị
    // // status null thì lấy mọi đơn. Đơn mới nhất lên trước.
    // public List<Orders> getOrdersForAdmin(OrderStatus status) throws SQLException {
        // String sql = "SELECT * FROM Orders";
        // if (status != null) {
            // sql = sql + " WHERE status = ?";
        // }
        // sql = sql + " ORDER BY orderDate DESC, orderID DESC";
        // try (
                // Connection conn = DBContext.getConnection();
                // PreparedStatement pts = conn.prepareStatement(sql)
        // ) {
            // if (status != null) {
                // pts.setString(1, status.name());
            // }
            // try (ResultSet rs = pts.executeQuery()) {
                // List<Orders> ordersList = new java.util.ArrayList<>();
                // while (rs.next()) {
                    // ordersList.add(mapRow(rs));
                // }
                // return ordersList;
            // }
        // }
    // }
    // [TN-03] KẾT THÚC

    // [TN-05] BẮT ĐẦU · Các đơn có chứa sản phẩm của một shop
    // // Một đơn có thể gồm hàng của nhiều shop và nhiều dòng của cùng shop,
    // // nên dùng DISTINCT để mỗi đơn chỉ xuất hiện một lần.
    // public List<Orders> getOrdersBySellerProfileId(int sellerProfileId) throws SQLException {
        // String sql = "SELECT DISTINCT o.* FROM Orders o "
                // + "JOIN OrderDetails d ON d.orderID = o.orderID "
                // + "JOIN Products p ON p.productID = d.productID "
                // + "WHERE p.sellerProfileID = ? "
                // + "ORDER BY o.orderDate DESC, o.orderID DESC";
        // try (
                // Connection conn = DBContext.getConnection();
                // PreparedStatement pts = conn.prepareStatement(sql)
        // ) {
            // pts.setInt(1, sellerProfileId);
            // try (ResultSet rs = pts.executeQuery()) {
                // List<Orders> ordersList = new java.util.ArrayList<>();
                // while (rs.next()) {
                    // ordersList.add(mapRow(rs));
                // }
                // return ordersList;
            // }
        // }
    // }
    // [TN-05] KẾT THÚC

    // [TN-10] BẮT ĐẦU · Lưu phương thức thanh toán cho đơn vừa tạo (trong transaction đặt hàng)
    // public void updatePaymentMethod(Connection conn, long orderId, PaymentMethod method) throws SQLException {
        // String sql = "UPDATE Orders SET paymentMethod = ? WHERE orderID = ?";
        // try (PreparedStatement pts = conn.prepareStatement(sql)) {
            // pts.setString(1, method.name());
            // pts.setLong(2, orderId);
            // pts.executeUpdate();
        // }
    // }
    // [TN-10] KẾT THÚC

    // [TN-11] BẮT ĐẦU · Danh sách đơn theo trạng thái thanh toán và xác nhận đã thu tiền
    // // status null thì lấy mọi đơn. Đơn mới nhất lên trước.
    // public List<Orders> getOrdersByPaymentStatus(PaymentStatus status) throws SQLException {
        // String sql = "SELECT * FROM Orders";
        // if (status != null) {
            // sql = sql + " WHERE paymentStatus = ?";
        // }
        // sql = sql + " ORDER BY orderDate DESC, orderID DESC";
        // try (
                // Connection conn = DBContext.getConnection();
                // PreparedStatement pts = conn.prepareStatement(sql)
        // ) {
            // if (status != null) {
                // pts.setString(1, status.name());
            // }
            // try (ResultSet rs = pts.executeQuery()) {
                // List<Orders> ordersList = new java.util.ArrayList<>();
                // while (rs.next()) {
                    // ordersList.add(mapRow(rs));
                // }
                // return ordersList;
            // }
        // }
    // }

    // // Chỉ đổi khi đơn chưa thanh toán và chưa bị hủy. Trả false nếu không đổi được dòng nào.
    // public boolean markPaid(long orderId) throws SQLException {
        // String sql = "UPDATE Orders SET paymentStatus = 'PAID', updatedAt = SYSDATETIME() "
                // + "WHERE orderID = ? AND paymentStatus = 'UNPAID' AND status <> 'CANCELLED'";
        // try (
                // Connection conn = DBContext.getConnection();
                // PreparedStatement pts = conn.prepareStatement(sql)
        // ) {
            // pts.setLong(1, orderId);
            // return pts.executeUpdate() > 0;
        // }
    // }
    // [TN-11] KẾT THÚC

    // [TN-06] BẮT ĐẦU · Trừ tiền giảm giá vào tổng đơn (trong transaction đặt hàng)
    // public void subtractFromTotal(Connection conn, long orderId, BigDecimal amount) throws SQLException {
        // String sql = "UPDATE Orders SET totalAmount = totalAmount - ? WHERE orderID = ?";
        // try (PreparedStatement pts = conn.prepareStatement(sql)) {
            // pts.setBigDecimal(1, amount);
            // pts.setLong(2, orderId);
            // pts.executeUpdate();
        // }
    // }
    // [TN-06] KẾT THÚC

}
