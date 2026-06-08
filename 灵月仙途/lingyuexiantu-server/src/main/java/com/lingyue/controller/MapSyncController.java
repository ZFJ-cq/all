package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.MapNode;
import com.lingyue.service.MapCoordinateService;
import com.lingyue.service.MapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/map-sync")
public class MapSyncController {

    @Autowired
    private MapService mapService;

    @Autowired
    private MapCoordinateService mapCoordinateService;

    // 分线管理
    private final Map<Long, Map<Integer, Integer>> mapLineCount = new HashMap<>();
    private final int MAX_PLAYERS_PER_LINE = 50;

    /**
     * 增量同步地图数据
     */
    @PostMapping("/incremental")
    public ResponseEntity<Map<String, Object>> incrementalSync(
            @RequestBody Map<String, Object> request) {
        
        Long mapId = Long.parseLong(request.get("mapId").toString());
        double playerX = Double.parseDouble(request.get("x").toString());
        double playerY = Double.parseDouble(request.get("y").toString());
        double radius = Double.parseDouble(request.get("radius").toString());
        int screenWidth = Integer.parseInt(request.get("screenWidth").toString());
        int screenHeight = Integer.parseInt(request.get("screenHeight").toString());

        MapNode map = mapService.getMapById(mapId);
        if (map == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }

        // 获取AOI区域
        List<Map<String, Double>> aoi = mapCoordinateService.getAOI(playerX, playerY, radius);

        // 模拟实体数据
        List<Map<String, Object>> entities = generateMockEntities(aoi, map);

        // 构建响应
        Map<String, Object> response = new HashMap<>();
        response.put("mapId", mapId);
        response.put("entities", entities);
        response.put("timestamp", System.currentTimeMillis());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * 获取地图分线
     */
    @GetMapping("/line/{mapId}")
    public ResponseEntity<Map<String, Object>> getMapLine(@PathVariable Long mapId) {
        MapNode map = mapService.getMapById(mapId);
        if (map == null) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }

        // 初始化分线数据
        if (!mapLineCount.containsKey(mapId)) {
            mapLineCount.put(mapId, new HashMap<>());
            mapLineCount.get(mapId).put(1, 0);
        }

        Map<Integer, Integer> lines = mapLineCount.get(mapId);
        int bestLine = 1;
        int minPlayers = Integer.MAX_VALUE;

        // 找到玩家最少的分线
        for (Map.Entry<Integer, Integer> entry : lines.entrySet()) {
            if (entry.getValue() < minPlayers) {
                minPlayers = entry.getValue();
                bestLine = entry.getKey();
            }
        }

        // 如果所有分线都满了，创建新分线
        if (minPlayers >= MAX_PLAYERS_PER_LINE) {
            bestLine = lines.size() + 1;
            lines.put(bestLine, 0);
        }

        // 增加分线人数
        lines.put(bestLine, lines.get(bestLine) + 1);

        Map<String, Object> response = new HashMap<>();
        response.put("mapId", mapId);
        response.put("line", bestLine);
        response.put("totalLines", lines.size());

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /**
     * 离开地图分线
     */
    @PostMapping("/leave/{mapId}/{line}")
    public ResponseEntity<Void> leaveMapLine(@PathVariable Long mapId, @PathVariable Integer line) {
        if (mapLineCount.containsKey(mapId) && mapLineCount.get(mapId).containsKey(line)) {
            Map<Integer, Integer> lines = mapLineCount.get(mapId);
            int count = lines.get(line) - 1;
            if (count >= 0) {
                lines.put(line, count);
            }
        }
        return new ResponseEntity<>(HttpStatus.OK);
    }

    /**
     * 生成模拟实体数据
     */
    private List<Map<String, Object>> generateMockEntities(List<Map<String, Double>> aoi, MapNode map) {
        List<Map<String, Object>> entities = new ArrayList<>();

        // 模拟怪物
        for (int i = 0; i < 5; i++) {
            Map<String, Object> monster = new HashMap<>();
            monster.put("id", "monster_" + i);
            monster.put("type", "monster");
            monster.put("x", Math.random() * 100 - 50);
            monster.put("y", Math.random() * 200 - 100);
            monster.put("name", "野怪" + i);
            monster.put("level", map.getRecommendLevel() + i);
            entities.add(monster);
        }

        // 模拟NPC
        for (int i = 0; i < 3; i++) {
            Map<String, Object> npc = new HashMap<>();
            npc.put("id", "npc_" + i);
            npc.put("type", "npc");
            npc.put("x", Math.random() * 100 - 50);
            npc.put("y", Math.random() * 200 - 100);
            npc.put("name", "NPC" + i);
            entities.add(npc);
        }

        // 模拟其他玩家
        for (int i = 0; i < 10; i++) {
            Map<String, Object> player = new HashMap<>();
            player.put("id", "player_" + i);
            player.put("type", "player");
            player.put("x", Math.random() * 100 - 50);
            player.put("y", Math.random() * 200 - 100);
            player.put("name", "玩家" + i);
            player.put("level", map.getRecommendLevel() + i % 5);
            entities.add(player);
        }

        return entities;
    }
}
