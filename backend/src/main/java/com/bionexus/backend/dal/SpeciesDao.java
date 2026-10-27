package com.bionexus.backend.dal;

import com.bionexus.backend.enums.ConservationStatus;
import com.bionexus.backend.model.Species;

import java.sql.ResultSet;
import java.util.List;

/** Truy vấn bảng Species (loài sinh vật). */
public class SpeciesDao {
    private Species mapRow(ResultSet rs) throws Exception {
        Species species = new Species();
        species.setSpeciesID(rs.getInt("speciesID"));
        species.setNodeID(rs.getInt("nodeID"));
        species.setManagedByAdminID(rs.getInt("managedByAdminID"));
        species.setScientificName(rs.getString("scientificName"));
        species.setCommonName(rs.getString("commonName"));
        species.setConservationStatus(ConservationStatus.valueOf(rs.getString("conservationStatus")));
        species.setEnvironmentSpecs(rs.getString("environmentSpecs"));
        species.setDescription(rs.getString("description"));
        species.setImageUrl(rs.getString("imageUrl"));
        species.setReferenceURL(rs.getString("referenceURL"));
        species.setCreatedAt(rs.getTimestamp("createdAt").toLocalDateTime());
        species.setUpdatedAt(rs.getTimestamp("updatedAt").toLocalDateTime());
        return species;
    }

    public List<Species> getAllSpecies() {
        String sql = "SELECT * FROM Species";
        List<Species> speciesList = new java.util.ArrayList<>();
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql);
                ResultSet rs = pts.executeQuery()
        ) {
            while (rs.next()) {
                speciesList.add(mapRow(rs));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return speciesList;
    }

    public Species getSpeciesBySpeciesID(int speciesID) {
        String sql = "SELECT * FROM Species WHERE speciesID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, speciesID);
            try (ResultSet rs = pts.executeQuery()) {
                if (rs.next()) {
                    return mapRow(rs);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Species> getSpeciesByNodeID(int nodeID) {
        String sql = "SELECT * FROM Species WHERE nodeID = ?";
        List<Species> speciesList = new java.util.ArrayList<>();
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, nodeID);
            try (ResultSet rs = pts.executeQuery()) {
                while (rs.next()) {
                    speciesList.add(mapRow(rs));
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return speciesList;
    }

    public boolean insertSpecies(Species species) {
        String sql = "INSERT INTO Species (nodeID, managedByAdminID, scientificName, commonName, conservationStatus, environmentSpecs, description, imageUrl, referenceURL) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, species.getNodeID());
            pts.setInt(2, species.getManagedByAdminID());
            pts.setString(3, species.getScientificName());
            pts.setString(4, species.getCommonName());
            pts.setString(5, species.getConservationStatus().name());
            pts.setString(6, species.getEnvironmentSpecs());
            pts.setString(7, species.getDescription());
            pts.setString(8, species.getImageUrl());
            pts.setString(9, species.getReferenceURL());
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateSpecies(Species species) {
        String sql = "UPDATE Species SET nodeID = ?, managedByAdminID = ?, scientificName = ?, commonName = ?, conservationStatus = ?, environmentSpecs = ?, description = ?, imageUrl = ?, referenceURL = ?, updatedAt =SYSDATETIME() WHERE speciesID = ?";
        try (
                java.sql.Connection conn = DBContext.getConnection();
                java.sql.PreparedStatement pts = conn.prepareStatement(sql)
        ) {
            pts.setInt(1, species.getNodeID());
            pts.setInt(2, species.getManagedByAdminID());
            pts.setString(3, species.getScientificName());
            pts.setString(4, species.getCommonName());
            pts.setString(5, species.getConservationStatus().name());
            pts.setString(6, species.getEnvironmentSpecs());
            pts.setString(7, species.getDescription());
            pts.setString(8, species.getImageUrl());
            pts.setString(9, species.getReferenceURL());
            pts.setInt(10, species.getSpeciesID());
            int rowsAffected = pts.executeUpdate();
            return rowsAffected > 0;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }
}
