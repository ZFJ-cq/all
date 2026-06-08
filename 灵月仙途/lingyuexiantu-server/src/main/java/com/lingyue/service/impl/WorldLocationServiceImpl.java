package com.lingyue.service.impl;

import com.lingyue.entity.WorldLocation;
import com.lingyue.entity.WorldLocationFeature;
import com.lingyue.repository.WorldLocationRepository;
import com.lingyue.repository.WorldLocationFeatureRepository;
import com.lingyue.service.WorldLocationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class WorldLocationServiceImpl implements WorldLocationService {

    private final WorldLocationRepository locationRepository;
    private final WorldLocationFeatureRepository featureRepository;

    public WorldLocationServiceImpl(WorldLocationRepository locationRepository,
                                     WorldLocationFeatureRepository featureRepository) {
        this.locationRepository = locationRepository;
        this.featureRepository = featureRepository;
    }

    @Override
    public List<WorldLocation> getAllActiveLocations() {
        return locationRepository.findByIsActiveOrderBySortOrderAsc(1);
    }

    @Override
    public WorldLocation getLocationById(Long id) {
        return locationRepository.findById(id).orElse(null);
    }

    @Override
    public WorldLocation getLocationByName(String name) {
        return locationRepository.findByName(name);
    }

    @Override
    public List<WorldLocationFeature> getLocationFeatures(Long locationId) {
        return featureRepository.findByLocationIdAndIsActiveOrderBySortOrderAsc(locationId, 1);
    }

    @Override
    public List<WorldLocation> getLocationsByCategory(String category) {
        return locationRepository.findByCategoryOrderBySortOrderAsc(category);
    }

    @Override
    @Transactional
    public WorldLocation createLocation(WorldLocation location) {
        return locationRepository.save(location);
    }

    @Override
    @Transactional
    public WorldLocation updateLocation(Long id, WorldLocation location) {
        WorldLocation existing = locationRepository.findById(id).orElse(null);
        if (existing == null) {
            return null;
        }
        if (location.getName() != null) existing.setName(location.getName());
        if (location.getDescription() != null) existing.setDescription(location.getDescription());
        if (location.getIcon() != null) existing.setIcon(location.getIcon());
        if (location.getBgColor() != null) existing.setBgColor(location.getBgColor());
        if (location.getSortOrder() != null) existing.setSortOrder(location.getSortOrder());
        if (location.getCategory() != null) existing.setCategory(location.getCategory());
        if (location.getRequiredLevel() != null) existing.setRequiredLevel(location.getRequiredLevel());
        if (location.getRequiredRealm() != null) existing.setRequiredRealm(location.getRequiredRealm());
        if (location.getPageUrl() != null) existing.setPageUrl(location.getPageUrl());
        if (location.getIsActive() != null) existing.setIsActive(location.getIsActive());
        return locationRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteLocation(Long id) {
        locationRepository.deleteById(id);
    }
}
