package com.bionexus.backend.model;

import com.bionexus.backend.enums.ConservationStatus;

import java.time.LocalDateTime;

public class Species {
    private int speciesID;
    private int nodeID;
    private int managedByAdminID;
    private String scientificName;
    private String commonName;
    private ConservationStatus conservationStatus;
    private String environmentSpecs;
    private String description;
    private String imageUrl;
    private String referenceURL;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Species() {}

    public Species(int speciesID, int nodeID, int managedByAdminID, String scientificName, String commonName, ConservationStatus conservationStatus, String environmentSpecs, String description, String imageUrl, String referenceURL, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.speciesID = speciesID;
        this.nodeID = nodeID;
        this.managedByAdminID = managedByAdminID;
        this.scientificName = scientificName;
        this.commonName = commonName;
        this.conservationStatus = conservationStatus;
        this.environmentSpecs = environmentSpecs;
        this.description = description;
        this.imageUrl = imageUrl;
        this.referenceURL = referenceURL;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Species(int nodeID, int managedByAdminID, String scientificName, String commonName, ConservationStatus conservationStatus, String environmentSpecs, String description, String imageUrl, String referenceURL) {
        this.nodeID = nodeID;
        this.managedByAdminID = managedByAdminID;
        this.scientificName = scientificName;
        this.commonName = commonName;
        this.conservationStatus = conservationStatus;
        this.environmentSpecs = environmentSpecs;
        this.description = description;
        this.imageUrl = imageUrl;
        this.referenceURL = referenceURL;
        this.createdAt = LocalDateTime.now();
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

    public ConservationStatus getConservationStatus() {
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

    public String getEnvironmentSpecs() {
        return environmentSpecs;
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

    public void setConservationStatus(ConservationStatus conservationStatus) {
        this.conservationStatus = conservationStatus;
    }
    public void setEnvironmentSpecs(String environmentSpecs) {
        this.environmentSpecs = environmentSpecs;
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

