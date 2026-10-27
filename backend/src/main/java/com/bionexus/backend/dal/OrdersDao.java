package com.bionexus.backend.dal;

import com.bionexus.backend.enums.OrderStatus;
import com.bionexus.backend.model.Orders;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;

/** Truy vấn bảng Orders (đơn hàng). Các dòng chi tiết của đơn nằm ở OrderDetailsDao. */
public class OrdersDao {
    private Orders mapRow(ResultSet rs) throws SQLException {
        return new Orders(
                rs.getLong("orderID"),
                rs.getString("orderCode"),
                rs.getInt("userID"),
                rs.getObject("orderDate", LocalDateTime.class),
                rs.getObject("updatedAt", LocalDateTime.class),
                rs.getBigDecimal("totalAmount"),
                OrderStatus.valueOf(rs.getString("status")),
                rs.getString("shippingAddress")
        );
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
        String sql = "SELECT * FROM Orders WHERE userID = ?";
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

}
