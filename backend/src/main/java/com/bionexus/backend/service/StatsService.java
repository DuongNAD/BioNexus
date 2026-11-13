package com.bionexus.backend.service;

// [TN-04] BẮT ĐẦU · Ghép số liệu thống kê doanh thu
// import com.bionexus.backend.dal.StatsDao;
// import com.bionexus.backend.dto.SalesStatsDto;
// import com.bionexus.backend.enums.OrderStatus;

// import java.math.BigDecimal;
// import java.sql.SQLException;
// import java.time.YearMonth;
// import java.util.ArrayList;
// import java.util.List;

// /** Thống kê bán hàng cho trang tổng quan quản trị (GET /api/admin/stats). */
// public class StatsService {
    // private static final int TOP_PRODUCT_LIMIT = 5; // số sản phẩm bán chạy hiển thị
    // private static final int MONTHS_TO_SHOW = 6;    // số tháng gần nhất trong biểu đồ doanh thu

    // private final StatsDao statsDao = new StatsDao();

    // public SalesStatsDto getSalesStats() throws SQLException {
        // BigDecimal completedRevenue = BigDecimal.ZERO;
        // BigDecimal pendingAmount = BigDecimal.ZERO;
        // int pendingOrders = 0;
        // int completedOrders = 0;
        // int cancelledOrders = 0;

        // // Mỗi dòng là một trạng thái: cộng vào đúng ô của nó
        // for (StatsDao.StatusTotal row : statsDao.totalsByStatus()) {
            // if (row.status() == OrderStatus.COMPLETED) {
                // completedOrders = row.orderCount();
                // completedRevenue = row.amount();
            // } else if (row.status() == OrderStatus.PENDING) {
                // pendingOrders = row.orderCount();
                // pendingAmount = row.amount();
            // } else if (row.status() == OrderStatus.CANCELLED) {
                // cancelledOrders = row.orderCount();
            // }
        // }
        // int totalOrders = pendingOrders + completedOrders + cancelledOrders;

        // List<SalesStatsDto.TopProduct> topProducts = statsDao.topProducts(TOP_PRODUCT_LIMIT);
        // List<SalesStatsDto.MonthRevenue> revenueByMonth = fillMissingMonths(statsDao.completedRevenueByMonth(MONTHS_TO_SHOW));

        // return new SalesStatsDto(completedRevenue, pendingAmount, totalOrders, pendingOrders, completedOrders,
                // cancelledOrders, topProducts, revenueByMonth);
    // }

    // /** SQL chỉ trả tháng có đơn. Ở đây dựng đủ 6 tháng gần nhất, tháng không có đơn thì doanh thu 0. */
    // private List<SalesStatsDto.MonthRevenue> fillMissingMonths(List<SalesStatsDto.MonthRevenue> fromDb) {
        // List<SalesStatsDto.MonthRevenue> result = new ArrayList<>();
        // YearMonth firstMonth = YearMonth.now().minusMonths(MONTHS_TO_SHOW - 1);
        // for (int i = 0; i < MONTHS_TO_SHOW; i++) {
            // String month = firstMonth.plusMonths(i).toString(); // dạng "2026-11"
            // SalesStatsDto.MonthRevenue found = null;
            // for (SalesStatsDto.MonthRevenue row : fromDb) {
                // if (row.month().equals(month)) {
                    // found = row;
                // }
            // }
            // if (found == null) {
                // found = new SalesStatsDto.MonthRevenue(month, BigDecimal.ZERO, 0);
            // }
            // result.add(found);
        // }
        // return result;
    // }
// }
// [TN-04] KẾT THÚC
