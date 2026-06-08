package com.lingyue.service;

import com.lingyue.entity.MapNode;
import java.util.List;

public interface MapService {
    
    List<MapNode> getAllMaps();
    
    List<MapNode> getEnabledMaps();
    
    MapNode getMapById(Long id);
    
    MapNode getMapByCode(String mapCode);
    
    MapNode createMap(MapNode map);
    
    MapNode updateMap(Long id, MapNode map);
    
    void deleteMap(Long id);
    
    List<MapNode> getMapsByType(Integer type);
    
    List<MapNode> searchMaps(String keyword);
    
    void updateOnlineCount(Long id, Integer count);
    
    void updateMapStatus(Long id, Integer status);
}
