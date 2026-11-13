package com.bionexus.backend.dal;

// [TN-04] BẮT ĐẦU · Các câu SQL thống kê (GROUP BY, SUM, COUNT, TOP)
// import com.bionexus.backend.dto.SalesStatsDto;
// import com.bionexus.backend.enums.OrderStatus;

// import java.math.BigDecimal;
// import java.sql.Connection;
// import java.sql.PreparedStatement;
// import java.sql.ResultSet;
// import java.sql.SQLException;
// import java.util.ArrayList;
// import java.util.List;

// /** Truy vấn thống kê bán hàng. Chỉ đọc, không sửa dữ liệu. */
// public class StatsDao {

    // /** Một dòng kết quả của totalsByStatus: số đơn và tổng tiền của một trạng thái. */
    // public record StatusTotal(OrderStatus status, int orderCount, BigDecimal amount) {
    // }

    // /** Đếm đơn và cộng tiền theo từng trạng thái (PENDING, COMPLETED, CANCELLED). */
    // public List<StatusTotal> totalsByStatus() throws SQLException {
        // String sql = "SELECT status, COUNT(*) AS orderCount, SUM(totalAmount) AS amount "
                // + "FROM Orders GROUP BY status";
        // List<StatusTotal> result = new ArrayList<>();
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement ps = conn.prepareStatement(sql);
             // ResultSet rs = ps.executeQuery()) {
            // while (rs.next()) {
                // OrderStatus status = OrderStatus.valueOf(rs.getString("status"));
                // result.add(new StatusTotal(status, rs.getInt("orderCount"), rs.getBigDecimal("amount")));
            // }
        // }
        // return result;
    // }

    // /** Các sản phẩm bán được nhiều cá thể nhất, bỏ qua đơn đã hủy. */
    // public List<SalesStatsDto.TopProduct> topProducts(int limit) throws SQLException {
        // String sql = "SELECT TOP (?) p.productID, p.productName, "
                // + "SUM(d.quantity) AS quantitySold, SUM(d.quantity * d.unitPrice) AS revenue "
                // + "FROM OrderDetails d "
                // + "JOIN Orders o ON o.orderID = d.orderID "
                // + "JOIN Products p ON p.productID = d.productID "
                // + "WHERE o.status <> 'CANCELLED' "
                // + "GROUP BY p.productID, p.productName "
                // + "ORDER BY quantitySold DESC, revenue DESC";
        // List<SalesStatsDto.TopProduct> result = new ArrayList<>();
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement ps = conn.prepareStatement(sql)) {
            // ps.setInt(1, limit);
            // try (ResultSet rs = ps.executeQuery()) {
                // while (rs.next()) {
                    // result.add(new SalesStatsDto.TopProduct(
                            // rs.getInt("productID"),
                            // rs.getString("productName"),
                            // rs.getInt("quantitySold"),
                            // rs.getBigDecimal("revenue")));
                // }
            // }
        // }
        // return result;
    // }

    // /**
     // * Doanh thu đơn COMPLETED theo tháng, tính từ ngày 1 của tháng cách đây (months - 1) tháng.
     // * Tháng không có đơn sẽ không có dòng nào; StatsService tự điền số 0 cho tháng đó.
     // */
    // public List<SalesStatsDto.MonthRevenue> completedRevenueByMonth(int months) throws SQLException {
        // String sql = "SELECT YEAR(orderDate) AS y, MONTH(orderDate) AS m, "
                // + "SUM(totalAmount) AS revenue, COUNT(*) AS orderCount "
                // + "FROM Orders "
                // + "WHERE status = 'COMPLETED' "
                // + "AND orderDate >= DATEADD(MONTH, -(? - 1), DATEFROMPARTS(YEAR(SYSDATETIME()), MONTH(SYSDATETIME()), 1)) "
                // + "GROUP BY YEAR(orderDate), MONTH(orderDate) "
                // + "ORDER BY y, m";
        // List<SalesStatsDto.MonthRevenue> result = new ArrayList<>();
        // try (Connection conn = DBContext.getConnection();
             // PreparedStatement ps = conn.prepareStatement(sql)) {
            // ps.setInt(1, months);
            // try (ResultSet rs = ps.executeQuery()) {
                // while (rs.next()) {
                    // String month = String.format("%04d-%02d", rs.getInt("y"), rs.getInt("m"));
                    // result.add(new SalesStatsDto.MonthRevenue(month, rs.getBigDecimal("revenue"), rs.getInt("orderCount")));
                // }
            // }
        // }
        // return result;
    // }
// }
// [TN-04] KẾT THÚC
