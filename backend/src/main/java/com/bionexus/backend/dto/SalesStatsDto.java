package com.bionexus.backend.dto;

// [TN-04] BẮT ĐẦU · Dữ liệu trả về cho GET /api/admin/stats
// import java.math.BigDecimal;
// import java.util.List;

// /**
 // * Số liệu bán hàng cho trang tổng quan quản trị.
 // * Doanh thu chỉ tính đơn COMPLETED; đơn PENDING tính riêng là tiền đang chờ.
 // */
// public record SalesStatsDto(
        // BigDecimal completedRevenue,
        // BigDecimal pendingAmount,
        // int totalOrders,
        // int pendingOrders,
        // int completedOrders,
        // int cancelledOrders,
        // List<TopProduct> topProducts,
        // List<MonthRevenue> revenueByMonth
// ) {
    // /** Sản phẩm bán chạy: tính trên các đơn chưa bị hủy. */
    // public record TopProduct(int productId, String productName, int quantitySold, BigDecimal revenue) {
    // }

    // /** Doanh thu một tháng, month có dạng "2026-11". */
    // public record MonthRevenue(String month, BigDecimal revenue, int orderCount) {
    // }
// }
// [TN-04] KẾT THÚC
