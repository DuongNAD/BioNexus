package com.bionexus.backend.dal;

import com.bionexus.backend.enums.ProductStatus;
import com.bionexus.backend.model.Products;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/** Truy vấn bảng Products (sản phẩm các shop đăng bán). */
public class ProductDao {
    private Products mapRow(ResultSet rs) throws SQLException {
        return new Products(
                rs.getInt("productID"),
                rs.getInt("sellerProfileID"),
                rs.getInt("speciesID"),
                rs.getString("productName"),
                rs.getBigDecimal("price"),
                rs.getInt("stockQuantity"),
                rs.getString("description"),
                rs.getString("imageUrl"),
                ProductStatus.valueOf(rs.getString("status")),
                rs.getObject("moderatedByAdminID", Integer.class),
                rs.getObject("createdAt", java.time.LocalDateTime.class),
                rs.getObject("updatedAt", java.time.LocalDateTime.class)
        );
    }

    public List<Products> getAllProducts() {
        String sql = "SELECT * FROM Products";
        List<Products> productsList = new java.util.ArrayList<>();
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
            while (rs.next()) {
                productsList.add(mapRow(rs));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return productsList;
    }

    public Products getProductById(int productID) {
        String sql = "SELECT * FROM Products WHERE productID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, productID);
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

    public boolean insertProduct(Products product) {
        String sql = "INSERT INTO Products (sellerProfileID, speciesID, productName, price, stockQuantity, description, imageUrl, moderatedByAdminID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, product.getSellerProfileID());
            pts.setInt(2, product.getSpeciesID());
            pts.setString(3, product.getProductName());
            pts.setBigDecimal(4, product.getPrice());
            pts.setInt(5, product.getStockQuantity());
            pts.setString(6, product.getDescription());
            pts.setString(7, product.getImageUrl());
            pts.setObject(8, product.getModeratedByAdminID(), java.sql.Types.INTEGER);
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateProduct(Products product) {
        String sql = "UPDATE Products SET sellerProfileID = ?, speciesID = ?, productName = ?, price = ?, stockQuantity = ?, description = ?, imageUrl = ?, moderatedByAdminID = ? WHERE productID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, product.getSellerProfileID());
            pts.setInt(2, product.getSpeciesID());
            pts.setString(3, product.getProductName());
            pts.setBigDecimal(4, product.getPrice());
            pts.setInt(5, product.getStockQuantity());
            pts.setString(6, product.getDescription());
            pts.setString(7, product.getImageUrl());
            if (product.getModeratedByAdminID() != null) {
                pts.setInt(8, product.getModeratedByAdminID());
            } else {
                pts.setNull(8, java.sql.Types.INTEGER);
            }
            pts.setInt(9, product.getProductID());

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean moderate(int productID, ProductStatus status, int adminId) throws SQLException {
        String sql = "UPDATE Products SET status = ?, moderatedByAdminID = ?, updatedAt = SYSDATETIME() WHERE productID = ? AND status = 'PENDING'";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status.name());
            ps.setInt(2, adminId);
            ps.setInt(3, productID);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean updateProductStatus(int productID, ProductStatus status) {
        String sql = "UPDATE Products SET status = ?, updatedAt = ? WHERE productID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, status.name());
            pts.setObject(2, java.time.LocalDateTime.now());
            pts.setInt(3, productID);

            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public List<Products> getApprovedProducts(Integer speciesID) throws SQLException{
        String sql = (speciesID == null)
                ? "SELECT * FROM Products WHERE status = 'APPROVED' ORDER BY productID DESC"
                : "SELECT * FROM Products WHERE status = 'APPROVED' AND speciesID = ? ORDER BY productID DESC";
        List<Products> productsList = new ArrayList<>();
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
        ) {
            if (speciesID != null) {
                pts.setInt(1, speciesID);
            }
            try (ResultSet rs = pts.executeQuery()) {
                while (rs.next()) {
                    productsList.add(mapRow(rs));
                }
            }
        }
        return productsList;
    }

    // ===== Tìm kiếm + phân trang cho GET /api/products =====
    // Tìm không phân biệt hoa thường và dấu: xem SqlSearch.
    private static final String COLLATION = SqlSearch.COLLATION;

    /** Phần FROM + WHERE dùng chung cho đếm và lấy trang, để hai câu luôn lọc giống nhau. */
    private static String searchFromWhere(Integer speciesId, String q) {
        StringBuilder sb = new StringBuilder(" FROM Products p JOIN Species s ON s.speciesID = p.speciesID WHERE p.status = 'APPROVED'");
        if (speciesId != null) {
            sb.append(" AND p.speciesID = ?");
        }
        if (q != null) {
            sb.append(" AND (p.productName").append(COLLATION).append(" LIKE ? ESCAPE '\\'")
              .append(" OR s.scientificName").append(COLLATION).append(" LIKE ? ESCAPE '\\'")
              .append(" OR s.commonName").append(COLLATION).append(" LIKE ? ESCAPE '\\')");
        }
        return sb.toString();
    }

    /** Gán tham số cho searchFromWhere, trả về vị trí tham số kế tiếp. */
    private static int bindSearch(PreparedStatement ps, Integer speciesId, String q) throws SQLException {
        int i = 1;
        if (speciesId != null) {
            ps.setInt(i++, speciesId);
        }
        if (q != null) {
            String like = SqlSearch.likeContains(q);
            ps.setString(i++, like);
            ps.setString(i++, like);
            ps.setString(i++, like);
        }
        return i;
    }

    /** Một trang sản phẩm APPROVED (mới nhất trước), lọc theo loài và từ khóa nếu có. */
    public List<Products> searchApproved(Integer speciesId, String q, int offset, int size) throws SQLException {
        String sql = "SELECT p.*" + searchFromWhere(speciesId, q) + " ORDER BY p.productID DESC OFFSET ? ROWS FETCH NEXT ? ROWS ONLY";
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            int i = bindSearch(ps, speciesId, q);
            ps.setInt(i++, offset);
            ps.setInt(i, size);
            try (ResultSet rs = ps.executeQuery()) {
                List<Products> list = new ArrayList<>();
                while (rs.next()) {
                    list.add(mapRow(rs));
                }
                return list;
            }
        }
    }

    /** Tổng số sản phẩm APPROVED khớp bộ lọc (để giao diện tính số trang). */
    public int countApproved(Integer speciesId, String q) throws SQLException {
        String sql = "SELECT COUNT(*)" + searchFromWhere(speciesId, q);
        try (Connection conn = DBContext.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            bindSearch(ps, speciesId, q);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? rs.getInt(1) : 0;
            }
        }
    }

    // ===== Dùng trong transaction đặt hàng: nhận Connection từ OrderService =====

    /**
     * Đọc sản phẩm và khóa dòng đó đến hết transaction (UPDLOCK).
     * Nhờ vậy giá và tồn kho không đổi giữa lúc kiểm tra và lúc trừ kho.
     */
    public Products getProductForUpdate(Connection conn, int productID) throws SQLException {
        String sql = "SELECT * FROM Products WITH (UPDLOCK, ROWLOCK) WHERE productID = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, productID);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? mapRow(rs) : null;
            }
        }
    }

    /**
     * Trừ kho, chỉ khi sản phẩm còn APPROVED và đủ hàng. Trả false nếu không đổi dòng nào (hết hàng).
     * Kho về 0 thì đổi luôn sang SOLD_OUT. Trong SQL Server, vế phải của SET dùng giá trị CŨ của cột
     * nên "stockQuantity - ? = 0" kiểm đúng số kho trước khi trừ.
     */
    public boolean decreaseStock(Connection conn, int productID, int quantity) throws SQLException {
        String sql = "UPDATE Products SET stockQuantity = stockQuantity - ?, "
                + "status = CASE WHEN stockQuantity - ? = 0 THEN 'SOLD_OUT' ELSE status END, "
                + "updatedAt = SYSDATETIME() "
                + "WHERE productID = ? AND status = 'APPROVED' AND stockQuantity >= ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, quantity);
            ps.setInt(2, quantity);
            ps.setInt(3, productID);
            ps.setInt(4, quantity);
            return ps.executeUpdate() > 0;
        }
    }

    public int insertProductReturnId(Products p) throws SQLException{
        String sql = "INSERT INTO Products (sellerProfileID, speciesID, productName, price, stockQuantity, description, imageUrl) VALUES (?,?,?,?,?,?,?)";
        try(Connection conn = DBContext.getConnection();
            PreparedStatement pts = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)){
            pts.setInt(1, p.getSellerProfileID());
            pts.setInt(2, p.getSpeciesID());
            pts.setString(3, p.getProductName());
            pts.setBigDecimal(4, p.getPrice());
            pts.setInt(5, p.getStockQuantity());
            pts.setString(6, p.getDescription());
            pts.setString(7, p.getImageUrl());

            pts.executeUpdate();
            try(ResultSet rs = pts.getGeneratedKeys()){
                if(rs.next()){
                    return rs.getInt(1);
                }
            }
            throw new SQLException("Không lấy được productID sau khi insert sản phẩm mới");
        }
    }
}
