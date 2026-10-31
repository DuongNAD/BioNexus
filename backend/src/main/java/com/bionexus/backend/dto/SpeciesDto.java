package com.bionexus.backend.dto;

import com.bionexus.backend.enums.ConservationStatus;

public record SpeciesDto(
        int id,
        int nodeId,
        String scientificName,
        String commonName,
        ConservationStatus conservationStatus,
        String environmentSpecies,
        String description,
        String imageURL,
        String referenceURL
) {
    public static SpeciesDto fromEntity(com.bionexus.backend.model.Species species) {
        return new SpeciesDto(
                species.getSpeciesID(),
                species.getNodeID(),
                species.getScientificName(),
                species.getCommonName(),
                species.getConservationStatus(),
                species.getEnvironmentSpecs(),
                species.getDescription(),
                species.getImageURL(),
                species.getReferenceURL()
        );
    }
}
