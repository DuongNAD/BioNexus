package com.bionexus.backend.dal;

/** Phần dùng chung cho các câu truy vấn có tìm kiếm văn bản hoặc IN (...). */
final class SqlSearch {
    private SqlSearch() {
    }

    /** Không phân biệt hoa thường và dấu (cả đ = d), khớp cách tìm của giao diện. */
    static final String COLLATION = " COLLATE Latin1_General_100_CI_AI";

    /** Số id tối đa trong một mệnh đề IN. SQL Server cho tối đa 2100 tham số mỗi câu nên chia lô để luôn an toàn. */
    static final int IN_CHUNK = 1000;

    /** Biến từ khóa thành mẫu LIKE "chứa", thoát các ký tự đặc biệt để người dùng gõ % hoặc _ không làm sai kết quả. Dùng với ESCAPE '\'. */
    static String likeContains(String q) {
        String escaped = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_").replace("[", "\\[");
        return "%" + escaped + "%";
    }

    /** "?,?,?" với n dấu hỏi, để ghép vào IN (...). */
    static String placeholders(int n) {
        return "?" + ",?".repeat(n - 1);
    }
}
