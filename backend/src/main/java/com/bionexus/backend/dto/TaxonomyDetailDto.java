package com.bionexus.backend.dto;

import java.util.List;

public record TaxonomyDetailDto(
        TaxonomyNodeDto node,
        List<TaxonomyNodeDto> breadcrumbs
) {
}
