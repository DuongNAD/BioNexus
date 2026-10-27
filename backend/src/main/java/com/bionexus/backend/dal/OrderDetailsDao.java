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
