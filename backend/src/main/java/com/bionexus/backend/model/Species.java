package com.bionexus.backend.model;

import java.time.LocalDateTime;

public class Species {
    private int speciesID;
    private int nodeID;
    private int managedByAdminID;
    private String scientificName;
    private String commonName;
    private String conservationStatus;
    private LocalDateTime createdAt;

    // Constructors
    public Species() {}

    public Species(int nodeID, int managedByAdminID, String scientificName, String commonName, String conservationStatus) {
        this.nodeID = nodeID;
        this.managedByAdminID = managedByAdminID;
        this.scientificName = scientificName;
        this.commonName = commonName;
        this.conservationStatus = conservationStatus;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public int getSpeciesID() {
        return speciesID;
    }

    public void setSpeciesID(int speciesID) {
        this.speciesID = speciesID;
    }

    public int getNodeID() {
        return nodeID;
    }

    public void setNodeID(int nodeID) {
        this.nodeID = nodeID;
    }

    public int getManagedByAdminID() {
        return managedByAdminID;
    }

    public void setManagedByAdminID(int managedByAdminID) {
        this.managedByAdminID = managedByAdminID;
    }

    public String getScientificName() {
        return scientificName;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public String getCommonName() {
        return commonName;
    }

    public void setCommonName(String commonName) {
        this.commonName = commonName;
    }

    public String getConservationStatus() {
        return conservationStatus;
    }

    public void setConservationStatus(String conservationStatus) {
        this.conservationStatus = conservationStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

