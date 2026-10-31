package com.bionexus.backend.service;

import com.bionexus.backend.dal.SpeciesDao;
import com.bionexus.backend.dal.TaxonomyNodesDao;

public class TaxonomyService {
    private final TaxonomyNodesDao taxonomyDao = new TaxonomyNodesDao();
    private final SpeciesDao speciesDao = new SpeciesDao();


}
