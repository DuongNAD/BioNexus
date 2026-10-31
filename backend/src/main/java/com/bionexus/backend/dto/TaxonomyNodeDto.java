package com.bionexus.backend.dto;

import com.bionexus.backend.enums.TaxonomyRank;
import com.bionexus.backend.model.TaxonomyNodes;

public record TaxonomyNodeDto(
        int id,
        String scientificName,
        String commonName,
        TaxonomyRank rank,
        Integer parentId
) {
    public static TaxonomyNodeDto fromEntity(TaxonomyNodes node) {
        return new TaxonomyNodeDto(
                node.getNodeID(),
                node.getScientificName(),
                node.getCommonName(),
                node.getRankLevel(),
                node.getParentNodeID()
        );
    }
}
