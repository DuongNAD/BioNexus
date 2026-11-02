package com.bionexus.backend.service;

import com.bionexus.backend.dal.SpeciesDao;
import com.bionexus.backend.dal.TaxonomyNodesDao;
import com.bionexus.backend.dto.SpeciesDto;
import com.bionexus.backend.dto.TaxonomyDetailDto;
import com.bionexus.backend.dto.TaxonomyNodeDto;
import com.bionexus.backend.enums.MessageKey;
import com.bionexus.backend.model.Species;
import com.bionexus.backend.model.TaxonomyNodes;
import com.bionexus.backend.util.ApiException;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class TaxonomyService {
    private final TaxonomyNodesDao taxonomyDao = new TaxonomyNodesDao();
    private final SpeciesDao speciesDao = new SpeciesDao();

    public List<TaxonomyNodeDto> getRootNodes() throws Exception{
        List<TaxonomyNodes> nodes = taxonomyDao.getRootNodes();
        List<TaxonomyNodeDto> result = new ArrayList<>();
        for (TaxonomyNodes node : nodes) {
            result.add(TaxonomyNodeDto.fromEntity(node));
        }
        return result;
    }

    public List<TaxonomyNodeDto> getChildNodes(int parentId) throws Exception{
        TaxonomyNodes parent = taxonomyDao.getTaxonomyNodeById(parentId);

        if(parent == null){
            throw new ApiException(MessageKey.TAXONOMY_NOT_FOUND);
        }
        List<TaxonomyNodes> children = taxonomyDao.getChildrenNodeById(parentId);
        List<TaxonomyNodeDto> result = new ArrayList<>();
        for (TaxonomyNodes node : children) {
            result.add(TaxonomyNodeDto.fromEntity(node));
        }
        return result;
    }

    public List<SpeciesDto> getSpeciesByNodeId(int nodeId) throws Exception{
        TaxonomyNodes node = taxonomyDao.getTaxonomyNodeById(nodeId);

        if(node == null){
            throw new ApiException(MessageKey.TAXONOMY_NOT_FOUND);
        }

        List<Species> speciesEntities = speciesDao.getSpeciesByNodeID(nodeId);
        List<SpeciesDto> speciesList = new ArrayList<>();

        for (Species species : speciesEntities) {
            speciesList.add(SpeciesDto.fromEntity(species));
        }

        return speciesList;
    }

    public TaxonomyDetailDto getTaxonomyDetail(int nodeId) throws Exception{
        TaxonomyNodes currentNode = taxonomyDao.getTaxonomyNodeById(nodeId);

        if(currentNode == null){
            throw new ApiException(MessageKey.TAXONOMY_NOT_FOUND);
        }

        List<TaxonomyNodeDto> breadcrumbs = new ArrayList<>();

        TaxonomyNodes temp = currentNode;
        while (temp != null) {
            breadcrumbs.add(TaxonomyNodeDto.fromEntity(temp));
            if(temp.getParentNodeID() == null) {
                break;
            }
            temp = taxonomyDao.getTaxonomyNodeById(temp.getParentNodeID());
        }
        Collections.reverse(breadcrumbs);


        return new TaxonomyDetailDto(TaxonomyNodeDto.fromEntity(currentNode), breadcrumbs);
    }

    public SpeciesDto getSpeciesDetail(int speciesId) throws Exception{
        Species species = speciesDao.getSpeciesBySpeciesID(speciesId);

        if(species == null){
            throw new ApiException(MessageKey.SPECIES_NOT_FOUND);
        }

        return SpeciesDto.fromEntity(species);
    }

}
