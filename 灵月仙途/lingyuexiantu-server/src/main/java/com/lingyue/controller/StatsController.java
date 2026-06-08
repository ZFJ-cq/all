package com.lingyue.controller;

import com.lingyue.dto.DerivedStats;
import com.lingyue.entity.PlayerStatsBase;
import com.lingyue.entity.StatOperationLog;
import com.lingyue.entity.CfgNumericalRules;
import com.lingyue.service.PlayerStatsService;
import com.lingyue.service.StatOperationLogService;
import com.lingyue.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/stats")
public class StatsController {
    
    @Autowired
    private PlayerStatsService playerStatsService;
    
    @Autowired
    private StatOperationLogService logService;
    
    @Autowired
    private ConfigService configService;
    
    @GetMapping("/player/{roleId}")
    public ResponseEntity<Map<String, Object>> getPlayerStats(@PathVariable Long roleId) {
        PlayerStatsBase stats = playerStatsService.getPlayerStats(roleId);
        Map<String, Object> response = new HashMap<>();
        if (stats != null) {
            response.put("success", true);
            response.put("data", stats);
        } else {
            response.put("success", false);
            response.put("message", "角色属性数据不存在");
        }
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/player/{roleId}/update")
    public ResponseEntity<Map<String, Object>> updateBaseStats(@PathVariable Long roleId, @RequestBody Map<String, Object> request) {
        String statType = (String) request.get("statType");
        int value = request.get("value") != null ? ((Number) request.get("value")).intValue() : 0;
        String opType = (String) request.get("opType");
        String contextInfo = (String) request.get("contextInfo");
        
        PlayerStatsBase updated = playerStatsService.updateBaseStats(roleId, statType, value, opType, contextInfo);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/player/{roleId}/derived")
    public ResponseEntity<Map<String, Object>> getDerivedStats(@PathVariable Long roleId) {
        DerivedStats stats = playerStatsService.calculateDerivedStats(roleId);
        Map<String, Object> response = new HashMap<>();
        if (stats != null) {
            response.put("success", true);
            response.put("data", stats);
        } else {
            response.put("success", false);
            response.put("message", "无法计算衍生属性");
        }
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/player/{roleId}/realm")
    public ResponseEntity<Map<String, Object>> updateRealm(@PathVariable Long roleId, @RequestBody Map<String, Object> request) {
        int realmLevel = request.get("realmLevel") != null ? ((Number) request.get("realmLevel")).intValue() : 0;
        int realmStage = request.get("realmStage") != null ? ((Number) request.get("realmStage")).intValue() : 1;
        String contextInfo = (String) request.get("contextInfo");
        
        PlayerStatsBase updated = playerStatsService.updateRealmLevel(roleId, realmLevel, realmStage, contextInfo);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/player/{roleId}/exp")
    public ResponseEntity<Map<String, Object>> addExperience(@PathVariable Long roleId, @RequestBody Map<String, Object> request) {
        long expAmount = request.get("expAmount") != null ? ((Number) request.get("expAmount")).longValue() : 0;
        String contextInfo = (String) request.get("contextInfo");
        
        PlayerStatsBase updated = playerStatsService.addExperience(roleId, expAmount, contextInfo);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/logs/{roleId}")
    public ResponseEntity<Map<String, Object>> getPlayerLogs(@PathVariable Long roleId) {
        List<StatOperationLog> logs = logService.getPlayerLogs(roleId);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", logs);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/logs/{roleId}/type/{opType}")
    public ResponseEntity<Map<String, Object>> getPlayerLogsByType(@PathVariable Long roleId, @PathVariable String opType) {
        List<StatOperationLog> logs = logService.getPlayerLogsByType(roleId, opType);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", logs);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/configs")
    public ResponseEntity<Map<String, Object>> getAllConfigs() {
        List<CfgNumericalRules> configs = configService.getAllConfigs();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", configs);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/configs/{configKey}")
    public ResponseEntity<Map<String, Object>> getConfig(@PathVariable String configKey) {
        CfgNumericalRules config = configService.getConfig(configKey);
        Map<String, Object> response = new HashMap<>();
        if (config != null) {
            response.put("success", true);
            response.put("data", config);
        } else {
            response.put("success", false);
            response.put("message", "配置不存在");
        }
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/configs/{configKey}")
    public ResponseEntity<Map<String, Object>> updateConfig(@PathVariable String configKey, @RequestBody Map<String, Object> request) {
        String content = (String) request.get("content");
        String description = (String) request.get("description");
        String updatedBy = (String) request.get("updatedBy");
        
        CfgNumericalRules updated = configService.updateConfig(configKey, content, description, updatedBy);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/configs")
    public ResponseEntity<Map<String, Object>> createConfig(@RequestBody Map<String, Object> request) {
        String configKey = (String) request.get("configKey");
        String content = (String) request.get("content");
        String description = (String) request.get("description");
        String updatedBy = (String) request.get("updatedBy");
        
        CfgNumericalRules created = configService.createConfig(configKey, content, description, updatedBy);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", created);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/configs/{configKey}")
    public ResponseEntity<Map<String, Object>> deleteConfig(@PathVariable String configKey) {
        configService.deleteConfig(configKey);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "删除成功");
        return ResponseEntity.ok(response);
    }
}
