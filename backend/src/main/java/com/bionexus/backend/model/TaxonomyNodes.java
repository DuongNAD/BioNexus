package com.bionexus.backend.model;

public class TaxonomyNodes {
    private int nodeID;
    private String scientificName;
    private String commonName;
    private String rankLevel;
    private Integer parentNodeID;

    // Constructors
    public TaxonomyNodes() {}

    public TaxonomyNodes(String scientificName, String commonName, String rankLevel, Integer parentNodeID) {
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

    public String getRankLevel() {
        return rankLevel;
    }

    public void setRankLevel(String rankLevel) {
        this.rankLevel = rankLevel;
    }

    public Integer getParentNodeID() {
        return parentNodeID;
    }

    public void setParentNodeID(Integer parentNodeID) {
        this.parentNodeID = parentNodeID;
    }
}
