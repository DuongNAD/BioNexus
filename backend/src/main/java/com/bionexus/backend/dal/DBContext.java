package com.bionexus.backend.dal;

import java.sql.Connection;
import java.sql.SQLException;

public class DBContext {
    // Cấu hình lấy từ biến môi trường DB_URL, DB_USERNAME, DB_PASSWORD.
    // Chưa đặt biến thì dùng giá trị mặc định cho máy dev.
    private static final String URL = env("DB_URL", "jdbc:sqlserver://localhost:1433;databaseName=BioNexusDB;encrypt=true;trustServerCertificate=true");
    private static final String USERNAME = env("DB_USERNAME", "sa");
    private static final String PASSWORD = env("DB_PASSWORD", "123");

    // Đọc biến môi trường tên `name`. Chưa đặt hoặc để rỗng thì trả về `fallback`.
    private static String env(String name, String fallback) {
        String value = System.getenv(name);
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }

    // Mở một kết nối mới tới SQL Server. Nơi gọi phải đóng kết nối (dùng try-with-resources).
    public static Connection getConnection() throws SQLException {
        try {
            // Đăng ký driver SQL Server (giữ dòng này để chạy được trong Tomcat).
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        } catch (ClassNotFoundException e) {
            // Thiếu thư viện mssql-jdbc. Đổi thành SQLException để nơi gọi chỉ cần xử lý 1 loại lỗi.
            throw new SQLException("SQL Server JDBC Driver not found", e);
        }
        return java.sql.DriverManager.getConnection(URL, USERNAME, PASSWORD);
    }

    // Chạy riêng file này để thử kết nối DB (không dùng khi chạy web).
    public static void main(String[] args) {
        try (Connection connection = getConnection()) {
            if (connection != null) {
                System.out.println("Connected to the database!");
            }
        } catch (SQLException e) {
            System.out.println("Error connecting to the database: " + e.getMessage());
            e.printStackTrace();
        }
    }
}