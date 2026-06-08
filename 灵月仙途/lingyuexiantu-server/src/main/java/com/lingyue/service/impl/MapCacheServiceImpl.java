package com.lingyue.service.impl;

import com.lingyue.entity.MapNode;
import com.lingyue.service.MapCacheService;
import com.lingyue.service.MapService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class MapCacheServiceImpl implements MapCacheService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private MapService mapService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final String MAP_PREFIX = "map:";
    private final String ENABLED_MAPS_KEY = "maps:enabled";
    private final long CACHE_TTL = 30; // 缓存过期时间（分钟）

    @Override
    public void cacheMap(MapNode map) {
        try {
            String key = MAP_PREFIX + map.getId();
            String json = objectMapper.writeValueAsString(map);
            redisTemplate.opsForValue().set(key, json, CACHE_TTL, TimeUnit.MINUTES);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public MapNode getCachedMap(Long mapId) {
        try {
            String key = MAP_PREFIX + mapId;
            String json = (String) redisTemplate.opsForValue().get(key);
            if (json != null) {
                return objectMapper.readValue(json, MapNode.class);
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return null;
    }

    @Override
    public MapNode getCachedMapByCode(String mapCode) {
        // 这里简化处理，实际项目中应该建立编码到ID的映射
        List<MapNode> maps = getCachedEnabledMaps();
        for (MapNode map : maps) {
            if (map.getMapCode().equals(mapCode)) {
                return map;
            }
        }
        return null;
    }

    @Override
    public void cacheEnabledMaps(List<MapNode> maps) {
        try {
            String json = objectMapper.writeValueAsString(maps);
            redisTemplate.opsForValue().set(ENABLED_MAPS_KEY, json, CACHE_TTL, TimeUnit.MINUTES);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public List<MapNode> getCachedEnabledMaps() {
        try {
            String json = (String) redisTemplate.opsForValue().get(ENABLED_MAPS_KEY);
            if (json != null) {
                return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, MapNode.class));
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return new ArrayList<>();
    }

    @Override
    public void preloadMap(Long mapId) {
        // 异步预加载地图数据
        new Thread(() -> {
            MapNode map = mapService.getMapById(mapId);
            if (map != null) {
                cacheMap(map);
            }
        }).start();
    }

    @Override
    public void clearMapCache(Long mapId) {
        String key = MAP_PREFIX + mapId;
        redisTemplate.delete(key);
    }

    @Override
    public void clearAllMapCache() {
        // 清除所有地图缓存
        redisTemplate.delete(ENABLED_MAPS_KEY);
        // 实际项目中应该使用scan命令清除所有map:前缀的键
    }
}
