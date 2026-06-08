package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.MapNode;
import com.lingyue.service.MapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/map")
public class MapController {
    
    @Autowired
    private MapService mapService;
    
    /**
     * 获取所有地图
     */
    @GetMapping
    public ResponseEntity<List<MapNode>> getAllMaps() {
        List<MapNode> maps = mapService.getAllMaps();
        return new ResponseEntity<>(maps, HttpStatus.OK);
    }
    
    /**
     * 获取启用的地图
     */
    @GetMapping("/enabled")
    public ResponseEntity<List<MapNode>> getEnabledMaps() {
        List<MapNode> maps = mapService.getEnabledMaps();
        return new ResponseEntity<>(maps, HttpStatus.OK);
    }
    
    /**
     * 根据 ID 获取地图详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<MapNode> getMapById(@PathVariable Long id) {
        MapNode map = mapService.getMapById(id);
        if (map != null) {
            return new ResponseEntity<>(map, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }
    
    /**
     * 根据编码获取地图详情
     */
    @GetMapping("/code/{code}")
    public ResponseEntity<MapNode> getMapByCode(@PathVariable String code) {
        MapNode map = mapService.getMapByCode(code);
        if (map != null) {
            return new ResponseEntity<>(map, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }
    
    /**
     * 创建地图
     */
    @PostMapping
    public ResponseEntity<MapNode> createMap(@RequestBody MapNode map) {
        MapNode createdMap = mapService.createMap(map);
        return new ResponseEntity<>(createdMap, HttpStatus.CREATED);
    }
    
    /**
     * 更新地图
     */
    @PutMapping("/{id}")
    public ResponseEntity<MapNode> updateMap(@PathVariable Long id, @RequestBody MapNode map) {
        MapNode updatedMap = mapService.updateMap(id, map);
        if (updatedMap != null) {
            return new ResponseEntity<>(updatedMap, HttpStatus.OK);
        }
        return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
    }
    
    /**
     * 删除地图
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMap(@PathVariable Long id) {
        mapService.deleteMap(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    /**
     * 根据类型获取地图
     */
    @GetMapping("/type/{type}")
    public ResponseEntity<List<MapNode>> getMapsByType(@PathVariable Integer type) {
        List<MapNode> maps = mapService.getMapsByType(type);
        return new ResponseEntity<>(maps, HttpStatus.OK);
    }
    
    /**
     * 搜索地图
     */
    @GetMapping("/search")
    public ResponseEntity<List<MapNode>> searchMaps(@RequestParam String keyword) {
        List<MapNode> maps = mapService.searchMaps(keyword);
        return new ResponseEntity<>(maps, HttpStatus.OK);
    }
    
    /**
     * 更新在线人数
     */
    @PutMapping("/{id}/online-count")
    public ResponseEntity<Void> updateOnlineCount(@PathVariable Long id, @RequestParam Integer count) {
        mapService.updateOnlineCount(id, count);
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    /**
     * 更新地图状态
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateMapStatus(@PathVariable Long id, @RequestParam Integer status) {
        mapService.updateMapStatus(id, status);
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    /**
     * 获取地图类型列表
     */
    @GetMapping("/types")
    public ResponseEntity<List<Map<String, Object>>> getMapTypes() {
        List<Map<String, Object>> types = List.of(
            Map.of("value", 1, "label", "主城"),
            Map.of("value", 2, "label", "野外"),
            Map.of("value", 3, "label", "副本"),
            Map.of("value", 4, "label", "秘境"),
            Map.of("value", 5, "label", "宗门")
        );
        return new ResponseEntity<>(types, HttpStatus.OK);
    }
    
    /**
     * 获取地图状态列表
     */
    @GetMapping("/statuses")
    public ResponseEntity<List<Map<String, Object>>> getMapStatuses() {
        List<Map<String, Object>> statuses = List.of(
            Map.of("value", 0, "label", "关闭"),
            Map.of("value", 1, "label", "开启"),
            Map.of("value", 2, "label", "维护")
        );
        return new ResponseEntity<>(statuses, HttpStatus.OK);
    }
}
