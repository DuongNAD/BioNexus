package com.bionexus.backend.model;

import com.bionexus.backend.enums.TaxonomyRank;

public class TaxonomyNodes {
    private int nodeID;
    private String scientificName;
    private String commonName;
    private TaxonomyRank rankLevel;
    private Integer parentNodeID;

    // Constructors
    public TaxonomyNodes() {}

    public TaxonomyNodes(String scientificName, String commonName, TaxonomyRank rankLevel, Integer parentNodeID) {
        this.scientificName = scientificName;
        this.commonName = commonName;
        this.rankLevel = rankLevel;
        this.parentNodeID = parentNodeID;
    }

    public TaxonomyNodes(int nodeID, String scientificName, String commonName, TaxonomyRank rankLevel, Integer parentNodeID) {
        this.nodeID = nodeID;
        this.scientificName = scientificName;
        this.commonName = commonName;
        this.rankLevel = rankLevel;
        this.parentNodeID = parentNodeID;
    }

    // Getters and Setters
    public int getNodeID() {
        return nodeID;
    }

    public void setNodeID(int nodeID) {
        this.nodeID = nodeID;
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

    public TaxonomyRank getRankLevel() {
        return rankLevel;
    }

    public void setRankLevel(TaxonomyRank rankLevel) {
        this.rankLevel = rankLevel;
    }

    public Integer getParentNodeID() {
        return parentNodeID;
    }

    public void setParentNodeID(Integer parentNodeID) {
        this.parentNodeID = parentNodeID;
    }
}
