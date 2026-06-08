package com.lingyue.service;

import com.lingyue.entity.WorldLocation;
import com.lingyue.entity.WorldLocationFeature;
import java.util.List;

public interface WorldLocationService {
    List<WorldLocation> getAllActiveLocations();
    WorldLocation getLocationById(Long id);
    WorldLocation getLocationByName(String name);
    List<WorldLocationFeature> getLocationFeatures(Long locationId);
    List<WorldLocation> getLocationsByCategory(String category);
    WorldLocation createLocation(WorldLocation location);
    WorldLocation updateLocation(Long id, WorldLocation location);
    void deleteLocation(Long id);
}
