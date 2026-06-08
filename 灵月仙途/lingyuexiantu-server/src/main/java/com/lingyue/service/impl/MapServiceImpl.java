package com.lingyue.service.impl;

import com.lingyue.entity.MapNode;
import com.lingyue.repository.MapNodeRepository;
import com.lingyue.service.MapService;
import com.lingyue.service.MapCacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MapServiceImpl implements MapService {
    
    @Autowired
    private MapNodeRepository mapNodeRepository;
    
    @Autowired
    private MapCacheService mapCacheService;
    
    @Override
    public List<MapNode> getAllMaps() {
        return mapNodeRepository.findAll();
    }
    
    @Override
    public List<MapNode> getEnabledMaps() {
        // 先从缓存获取
        List<MapNode> cachedMaps = mapCacheService.getCachedEnabledMaps();
        if (!cachedMaps.isEmpty()) {
            return cachedMaps;
        }
        // 缓存中没有，从数据库获取
        List<MapNode> maps = mapNodeRepository.findByStatus(1);
        // 缓存结果
        mapCacheService.cacheEnabledMaps(maps);
        return maps;
    }
    
    @Override
    public MapNode getMapById(Long id) {
        // 先从缓存获取
        MapNode cachedMap = mapCacheService.getCachedMap(id);
        if (cachedMap != null) {
            return cachedMap;
        }
        // 缓存中没有，从数据库获取
        Optional<MapNode> map = mapNodeRepository.findById(id);
        MapNode result = map.orElse(null);
        // 缓存结果
        if (result != null) {
            mapCacheService.cacheMap(result);
        }
        return result;
    }
    
    @Override
    public MapNode getMapByCode(String mapCode) {
        // 先从缓存获取
        MapNode cachedMap = mapCacheService.getCachedMapByCode(mapCode);
        if (cachedMap != null) {
            return cachedMap;
        }
        // 缓存中没有，从数据库获取
        Optional<MapNode> map = mapNodeRepository.findByMapCode(mapCode);
        MapNode result = map.orElse(null);
        // 缓存结果
        if (result != null) {
            mapCacheService.cacheMap(result);
        }
        return result;
    }
    
    @Override
    public MapNode createMap(MapNode map) {
        if (map.getStatus() == null) {
            map.setStatus(1);
        }
        if (map.getOnlineCount() == null) {
            map.setOnlineCount(0);
        }
        return mapNodeRepository.save(map);
    }
    
    @Override
    public MapNode updateMap(Long id, MapNode map) {
        Optional<MapNode> existingMap = mapNodeRepository.findById(id);
        if (existingMap.isPresent()) {
            MapNode m = existingMap.get();
            m.setMapName(map.getMapName());
            m.setMapType(map.getMapType());
            m.setLayerLevel(map.getLayerLevel());
            m.setRecommendLevel(map.getRecommendLevel());
            m.setRecommendCombat(map.getRecommendCombat());
            m.setEnvironmentDesc(map.getEnvironmentDesc());
            m.setMonsterDensity(map.getMonsterDensity());
            m.setDropWeight(map.getDropWeight());
            m.setBackgroundResource(map.getBackgroundResource());
            m.setMainProducts(map.getMainProducts());
            m.setStatus(map.getStatus());
            m.setWeatherType(map.getWeatherType());
            m.setSpecialEvent(map.getSpecialEvent());
            m.setExtensionField1(map.getExtensionField1());
            m.setExtensionField2(map.getExtensionField2());
            MapNode updatedMap = mapNodeRepository.save(m);
            // 清除缓存
            mapCacheService.clearMapCache(id);
            return updatedMap;
        }
        return null;
    }
    
    @Override
    public void deleteMap(Long id) {
        mapNodeRepository.deleteById(id);
        // 清除缓存
        mapCacheService.clearMapCache(id);
    }
    
    @Override
    public List<MapNode> getMapsByType(Integer type) {
        return mapNodeRepository.findByMapType(type);
    }
    
    @Override
    public List<MapNode> searchMaps(String keyword) {
        return mapNodeRepository.searchByKeyword(keyword);
    }
    
    @Override
    public void updateOnlineCount(Long id, Integer count) {
        Optional<MapNode> map = mapNodeRepository.findById(id);
        if (map.isPresent()) {
            MapNode m = map.get();
            m.setOnlineCount(count);
            mapNodeRepository.save(m);
        }
    }
    
    @Override
    public void updateMapStatus(Long id, Integer status) {
        Optional<MapNode> map = mapNodeRepository.findById(id);
        if (map.isPresent()) {
            MapNode m = map.get();
            m.setStatus(status);
            mapNodeRepository.save(m);
        }
    }
}
