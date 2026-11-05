package com.bionexus.backend.dal;

import com.bionexus.backend.enums.ConservationStatus;
import com.bionexus.backend.model.Species;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/** Truy vấn bảng Species (loài sinh vật). */
public class SpeciesDao {
    private Species mapRow(ResultSet rs) throws SQLException {
        Species species = new Species();
        species.setSpeciesID(rs.getInt("speciesID"));
        species.setNodeID(rs.getInt("nodeID"));
        species.setManagedByAdminID(rs.getInt("managedByAdminID"));
        species.setScientificName(rs.getString("scientificName"));
        species.setCommonName(rs.getString("commonName"));
        species.setConservationStatus(ConservationStatus.valueOf(rs.getString("conservationStatus")));
        species.setEnvironmentSpecs(rs.getString("environmentSpecs"));
        species.setDescription(rs.getString("description"));
        species.setImageURL(rs.getString("imageUrl"));
        species.setReferenceURL(rs.getString("referenceURL"));
        species.setCreatedAt(rs.getTimestamp("createdAt").toLocalDateTime());
        species.setUpdatedAt(rs.getTimestamp("updatedAt").toLocalDateTime());
        return species;
    }

    public List<Species> getAllSpecies() throws SQLException {
        String sql = "SELECT * FROM Species";
        List<Species> speciesList = new ArrayList<>();
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
            while (rs.next()) {
                speciesList.add(mapRow(rs));
            }
        }
        return speciesList;
    }

    public Species getSpeciesBySpeciesID(int speciesID) throws SQLException {
        String sql = "SELECT * FROM Species WHERE speciesID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, speciesID);
            try (ResultSet rs = pts.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        }
        return null;
    }

    public List<Species> getSpeciesByNodeID(int nodeID) throws SQLException {
        String sql = "SELECT * FROM Species WHERE nodeID = ?";
        List<Species> speciesList = new ArrayList<>();
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, nodeID);
            try (ResultSet rs = pts.executeQuery()) {
                while (rs.next()) {
                    speciesList.add(mapRow(rs));
                }
            }
        }
        return speciesList;
    }

    /**
     * Danh sách loài cho bách khoa. Mọi tham số đều tùy chọn:
     * nodeId: lấy loài của nút đó và mọi nút con cháu (đệ quy theo parentNodeID), vd nodeId của một Bộ thì ra mọi loài thuộc Bộ;
     * q: tìm không phân biệt hoa thường và dấu trong tên khoa học, tên thường gọi và mô tả;
     * iucn: lọc đúng một mức bảo tồn.
     * Nút không tồn tại thì danh sách rỗng (giống bản mock của giao diện).
     */
    public List<Species> searchSpecies(Integer nodeId, String q, ConservationStatus iucn) throws SQLException {
        StringBuilder sql = new StringBuilder();
        if (nodeId != null) {
            // Cây tối đa 6 cấp nên đệ quy rất nông
            sql.append("WITH sub AS (SELECT nodeID FROM TaxonomyNodes WHERE nodeID = ? ")
               .append("UNION ALL SELECT t.nodeID FROM TaxonomyNodes t JOIN sub s ON t.parentNodeID = s.nodeID) ");
        }
        sql.append("SELECT sp.* FROM Species sp WHERE 1 = 1");
        if (nodeId != null) {
            sql.append(" AND sp.nodeID IN (SELECT nodeID FROM sub)");
        }
        if (iucn != null) {
            sql.append(" AND sp.conservationStatus = ?");
        }
        if (q != null) {
            sql.append(" AND (sp.scientificName").append(SqlSearch.COLLATION).append(" LIKE ? ESCAPE '\\'")
               .append(" OR sp.commonName").append(SqlSearch.COLLATION).append(" LIKE ? ESCAPE '\\'")
               .append(" OR sp.description").append(SqlSearch.COLLATION).append(" LIKE ? ESCAPE '\\')");
        }
        sql.append(" ORDER BY sp.speciesID");

        List<Species> speciesList = new ArrayList<>();
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql.toString())
        ) {
            int i = 1;
            if (nodeId != null) {
                pts.setInt(i++, nodeId);
            }
            if (iucn != null) {
                pts.setString(i++, iucn.name());
            }
            if (q != null) {
                String like = SqlSearch.likeContains(q);
                pts.setString(i++, like);
                pts.setString(i++, like);
                pts.setString(i, like);
            }
            try (ResultSet rs = pts.executeQuery()) {
                while (rs.next()) {
                    speciesList.add(mapRow(rs));
                }
            }
        }
        return speciesList;
    }

    /** Các loài theo danh sách id: một truy vấn cho cả trang sản phẩm. Id không có thì không nằm trong kết quả. */
    public java.util.Map<Integer, Species> getSpeciesByIds(java.util.Collection<Integer> ids) throws SQLException {
        java.util.Map<Integer, Species> result = new java.util.HashMap<>();
        List<Integer> unique = new ArrayList<>(new java.util.LinkedHashSet<>(ids));
        for (int from = 0; from < unique.size(); from += SqlSearch.IN_CHUNK) {
            List<Integer> part = unique.subList(from, Math.min(from + SqlSearch.IN_CHUNK, unique.size()));
            String sql = "SELECT * FROM Species WHERE speciesID IN (" + SqlSearch.placeholders(part.size()) + ")";
            try (
                    Connection conn = DBContext.getConnection();
                    PreparedStatement pts = conn.prepareStatement(sql)
            ) {
                for (int i = 0; i < part.size(); i++) {
                    pts.setInt(i + 1, part.get(i));
                }
                try (ResultSet rs = pts.executeQuery()) {
                    while (rs.next()) {
                        Species s = mapRow(rs);
                        result.put(s.getSpeciesID(), s);
                    }
                }
            }
        }
        return result;
    }

    public boolean insertSpecies(Species species) throws SQLException {
        String sql = "INSERT INTO Species (nodeID, managedByAdminID, scientificName, commonName, conservationStatus, environmentSpecs, description, imageUrl, referenceURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, species.getNodeID());
            pts.setInt(2, species.getManagedByAdminID());
            pts.setString(3, species.getScientificName());
            pts.setString(4, species.getCommonName());
            pts.setString(5, species.getConservationStatus().name());
            pts.setString(6, species.getEnvironmentSpecs());
            pts.setString(7, species.getDescription());
            pts.setString(8, species.getImageURL());
            pts.setString(9, species.getReferenceURL());
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        }
    }

    public boolean updateSpecies(Species species) throws SQLException {
        String sql = "UPDATE Species SET nodeID = ?, managedByAdminID = ?, scientificName = ?, commonName = ?, conservationStatus = ?, environmentSpecs = ?, description = ?, imageUrl = ?, referenceURL = ?, updatedAt =SYSDATETIME() WHERE speciesID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, species.getNodeID());
            pts.setInt(2, species.getManagedByAdminID());
            pts.setString(3, species.getScientificName());
            pts.setString(4, species.getCommonName());
            pts.setString(5, species.getConservationStatus().name());
            pts.setString(6, species.getEnvironmentSpecs());
            pts.setString(7, species.getDescription());
            pts.setString(8, species.getImageURL());
            pts.setString(9, species.getReferenceURL());
            pts.setInt(10, species.getSpeciesID());
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        }
    }
}
