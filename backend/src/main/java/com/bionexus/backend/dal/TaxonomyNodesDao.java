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
    private TaxonomyNodes mapRowToTaxonomyNode(ResultSet rs) throws java.sql.SQLException {
        TaxonomyNodes taxonomyNode = new TaxonomyNodes();
        taxonomyNode.setNodeID(rs.getInt("nodeID"));
        taxonomyNode.setScientificName(rs.getString("scientificName"));
        taxonomyNode.setCommonName(rs.getString("commonName"));
        taxonomyNode.setRankLevel(TaxonomyRank.valueOf(rs.getString("rankLevel")));
        taxonomyNode.setParentNodeID(rs.getObject("parentNodeID", Integer.class));
        return taxonomyNode;
    }

    public List<TaxonomyNodes> getAllTaxonomyNodes() {
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
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return taxonomyNodesList;
    }

    public TaxonomyNodes getTaxonomyNodeById(int nodeID){
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
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<TaxonomyNodes> getChildrenNodeById(int parentNodeID) {
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
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return childrenNodesList;
    }

    public boolean insertTaxonomyNode(TaxonomyNodes taxonomyNode) {
        String sql = "INSERT INTO TaxonomyNodes (scientificName, commonName, rankLevel, parentNodeID) VALUES (?, ?, ?, ?)";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setString(1, taxonomyNode.getScientificName());
            pts.setString(2, taxonomyNode.getCommonName());
            pts.setString(3, taxonomyNode.getRankLevel().name());
            pts.setObject(4,taxonomyNode.getParentNodeID(), java.sql.Types.INTEGER);
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateTaxonomyNode(TaxonomyNodes taxonomyNode) {
        String sql = "UPDATE TaxonomyNodes SET scientificName = ?, commonName = ?, rankLevel = ?, parentNodeID = ? WHERE nodeID = ?";
        try (
                Connection conn = DBContext.getConnection();
                PreparedStatement pts = conn.prepareStatement(sql);
        ) {
            pts.setString(1, taxonomyNode.getScientificName());
            pts.setString(2, taxonomyNode.getCommonName());
            pts.setString(3, taxonomyNode.getRankLevel().name());
            pts.setObject(4, taxonomyNode.getParentNodeID(), java.sql.Types.INTEGER);
            pts.setInt(5, taxonomyNode.getNodeID());
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }
}
