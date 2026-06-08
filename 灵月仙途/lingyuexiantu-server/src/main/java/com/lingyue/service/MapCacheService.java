package com.lingyue.service;

import com.lingyue.entity.MapNode;
import java.util.List;

public interface MapCacheService {
    
    /**
     * 缓存地图数据
     */
    void cacheMap(MapNode map);
    
    /**
     * 从缓存获取地图数据
     */
    MapNode getCachedMap(Long mapId);
    
    /**
     * 从缓存获取地图数据（按编码）
     */
    MapNode getCachedMapByCode(String mapCode);
    
    /**
     * 缓存启用的地图列表
     */
    void cacheEnabledMaps(List<MapNode> maps);
    
    /**
     * 从缓存获取启用的地图列表
     */
    List<MapNode> getCachedEnabledMaps();
    
    /**
     * 预加载地图数据
     */
    void preloadMap(Long mapId);
    
    /**
     * 清除地图缓存
     */
    void clearMapCache(Long mapId);
    
    /**
     * 清除所有地图缓存
     */
    void clearAllMapCache();
}
