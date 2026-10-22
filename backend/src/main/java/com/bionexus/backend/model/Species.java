package com.bionexus.backend.model;

import java.time.LocalDateTime;

public class Species {
    private int speciesID;
    private int nodeID;
    private int managedByAdminID;
    private String scientificName;
    private String commonName;
    private String conservationStatus;
    private String description;
    private String imageUrl;
    private String referenceURL;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Species() {}

    public Species(int speciesID, int nodeID, int managedByAdminID, String scientificName, String commonName, String conservationStatus, String description, String imageUrl, String referenceURL, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.speciesID = speciesID;
        this.nodeID = nodeID;
        this.managedByAdminID = managedByAdminID;
        this.scientificName = scientificName;
        this.commonName = commonName;
        this.conservationStatus = conservationStatus;
        this.description = description;
        this.imageUrl = imageUrl;
        this.referenceURL = referenceURL;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Species(LocalDateTime createdAt, String referenceURL, String imageUrl, String description, String conservationStatus, String commonName, String scientificName, int managedByAdminID, int nodeID, int speciesID) {
        this.createdAt = createdAt;
        this.referenceURL = referenceURL;
        this.imageUrl = imageUrl;
        this.description = description;
        this.conservationStatus = conservationStatus;
        this.commonName = commonName;
        this.scientificName = scientificName;
        this.managedByAdminID = managedByAdminID;
        this.nodeID = nodeID;
        this.speciesID = speciesID;
    }

    public int getSpeciesID() {
        return speciesID;
    }

    public int getNodeID() {
        return nodeID;
    }

    public int getManagedByAdminID() {
        return managedByAdminID;
    }

    public String getScientificName() {
        return scientificName;
    }

    public String getCommonName() {
        return commonName;
    }

    public String getConservationStatus() {
        return conservationStatus;
    }

    public String getDescription() {
        return description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getReferenceURL() {
        return referenceURL;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setSpeciesID(int speciesID) {
        this.speciesID = speciesID;
    }

    public void setNodeID(int nodeID) {
        this.nodeID = nodeID;
    }

    public void setManagedByAdminID(int managedByAdminID) {
        this.managedByAdminID = managedByAdminID;
    }

    public void setScientificName(String scientificName) {
        this.scientificName = scientificName;
    }

    public void setCommonName(String commonName) {
        this.commonName = commonName;
    }

    public void setConservationStatus(String conservationStatus) {
        this.conservationStatus = conservationStatus;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setReferenceURL(String referenceURL) {
        this.referenceURL = referenceURL;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

