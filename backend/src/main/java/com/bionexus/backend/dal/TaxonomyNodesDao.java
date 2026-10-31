package com.bionexus.backend.dal;

import com.bionexus.backend.enums.TaxonomyRank;
import com.bionexus.backend.model.TaxonomyNodes;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

/** Truy vấn bảng TaxonomyNodes (cây phân loại: giới, ngành, lớp, bộ, họ, chi). */
public class TaxonomyNodesDao {
    private TaxonomyNodes mapRowToTaxonomyNode(ResultSet rs) throws SQLException {
        TaxonomyNodes taxonomyNode = new TaxonomyNodes();
        taxonomyNode.setNodeID(rs.getInt("nodeID"));
        taxonomyNode.setScientificName(rs.getString("scientificName"));
        taxonomyNode.setCommonName(rs.getString("commonName"));
        taxonomyNode.setRankLevel(TaxonomyRank.valueOf(rs.getString("rankLevel")));
        taxonomyNode.setParentNodeID(rs.getObject("parentNodeID", Integer.class));
        return taxonomyNode;
    }

    public List<TaxonomyNodes> getAllTaxonomyNodes() throws SQLException {
        List<TaxonomyNodes> taxonomyNodesList = new ArrayList<>();
        String sql = "SELECT * FROM TaxonomyNodes";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
            while (rs.next()) {
                taxonomyNodesList.add(mapRowToTaxonomyNode(rs));
            }
        }
        return taxonomyNodesList;
    }

    /** Lấy các nút gốc của cây phân loại (cấp giới - KINGDOM, không có nút cha). */
    public List<TaxonomyNodes> getRootNodes() throws SQLException {
        List<TaxonomyNodes> rootNodes = new ArrayList<>();
        String sql = "SELECT * FROM TaxonomyNodes WHERE parentNodeID IS NULL";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
            while (rs.next()) {
                rootNodes.add(mapRowToTaxonomyNode(rs));
            }
        }
        return rootNodes;
    }

    public TaxonomyNodes getTaxonomyNodeById(int nodeID) throws SQLException {
        String sql = "SELECT * FROM TaxonomyNodes WHERE nodeID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, nodeID);
            try (ResultSet rs = pts.executeQuery()) {
                if (rs.next()) {
                    return mapRowToTaxonomyNode(rs);
                }
            }
        }
        return null;
    }

    public List<TaxonomyNodes> getChildrenNodeById(int parentNodeID) throws SQLException {
        List<TaxonomyNodes> childrenNodesList = new ArrayList<>();
        String sql = "SELECT * FROM TaxonomyNodes WHERE parentNodeID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, parentNodeID);
            try (ResultSet rs = pts.executeQuery()) {
                while (rs.next()) {
                    childrenNodesList.add(mapRowToTaxonomyNode(rs));
                }
            }
        }
        return childrenNodesList;
    }

    public boolean insertTaxonomyNode(TaxonomyNodes taxonomyNode) throws SQLException {
        String sql = "INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID) VALUES (?, ?, ?, ?)";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, taxonomyNode.getScientificName());
            pts.setString(2, taxonomyNode.getCommonName());
            pts.setString(3, taxonomyNode.getRankLevel().name());
            pts.setObject(4, taxonomyNode.getParentNodeID(), java.sql.Types.INTEGER);
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        }
    }

    public boolean updateTaxonomyNode(TaxonomyNodes taxonomyNode) throws SQLException {
        String sql = "UPDATE TaxonomyNodes SET scientificName = ?, commonName = ?, rankLevel = ?, parentNodeID = ? WHERE nodeID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, taxonomyNode.getScientificName());
            pts.setString(2, taxonomyNode.getCommonName());
            pts.setString(3, taxonomyNode.getRankLevel().name());
            pts.setObject(4, taxonomyNode.getParentNodeID(), java.sql.Types.INTEGER);
            pts.setInt(5, taxonomyNode.getNodeID());
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        }
    }
}
