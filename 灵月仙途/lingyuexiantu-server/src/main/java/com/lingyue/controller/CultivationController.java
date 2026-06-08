package com.lingyue.controller;

import com.lingyuexiantu.common.Result;
import com.lingyue.service.CultivationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/cultivation")
public class CultivationController {
    
    private static final Logger logger = LoggerFactory.getLogger(CultivationController.class);
    
    private final CultivationService cultivationService;
    
    public CultivationController(CultivationService cultivationService) {
        this.cultivationService = cultivationService;
    }
    
    @GetMapping("/status/{roleId}")
    public Result<Map<String, Object>> getCultivationStatus(@PathVariable Long roleId) {
        try {
            Map<String, Object> status = cultivationService.getCultivationStatus(roleId);
            if (Boolean.TRUE.equals(status.get("success"))) {
                return Result.success(status);
            } else {
                return Result.error((String) status.get("message"));
            }
        } catch (Exception e) {
            logger.error("获取修炼状态失败", e);
            return Result.error("获取修炼状态失败");
        }
    }
    
    @GetMapping("/realm-info")
    public Result<Map<String, Object>> getRealmInfo(@RequestParam Long roleId) {
        try {
            Map<String, Object> result = cultivationService.getRealmInfo(roleId);
            if (Boolean.TRUE.equals(result.get("success"))) {
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            logger.error("获取境界信息失败", e);
            return Result.error("获取境界信息失败");
        }
    }
    
    @GetMapping("/realm-configs")
    public Result<Map<String, Object>> getAllRealmConfigs() {
        try {
            Map<String, Object> result = cultivationService.getAllRealmConfigs();
            return Result.success(result);
        } catch (Exception e) {
            logger.error("获取境界配置失败", e);
            return Result.error("获取境界配置失败");
        }
    }
    
    @PostMapping("/auto")
    public Result<Map<String, Object>> autoCultivation(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.valueOf(request.get("roleId").toString());
            if (roleId == null || roleId <= 0) {
                return Result.error("角色 ID 无效");
            }
            String boostType = request.get("boostType") != null ? request.get("boostType").toString() : null;
            Map<String, Object> result = cultivationService.autoCultivation(roleId, boostType);
            if (Boolean.TRUE.equals(result.get("success"))) {
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            logger.error("自动修炼失败", e);
            return Result.error("自动修炼失败");
        }
    }
    
    @PostMapping("/breakthrough")
    public Result<Map<String, Object>> breakthrough(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.valueOf(request.get("roleId").toString());
            if (roleId == null || roleId <= 0) {
                return Result.error("角色 ID 无效");
            }
            String pillCode = request.get("pillCode") != null ? request.get("pillCode").toString() : null;
            Map<String, Object> result = cultivationService.breakthrough(roleId, pillCode);
            if (Boolean.TRUE.equals(result.get("success"))) {
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            logger.error("境界突破失败", e);
            return Result.error("境界突破失败");
        }
    }
    
    @PostMapping("/offline-cultivation")
    public Result<Map<String, Object>> calculateOfflineCultivation(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.valueOf(request.get("roleId").toString());
            if (roleId == null || roleId <= 0) {
                return Result.error("角色 ID 无效");
            }
            Map<String, Object> result = cultivationService.calculateOfflineCultivation(roleId);
            if (Boolean.TRUE.equals(result.get("success"))) {
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            logger.error("计算离线修炼失败", e);
            return Result.error("计算离线修炼失败");
        }
    }
    
    @GetMapping("/next-realm")
    public Result<Map<String, Object>> getNextRealm(@RequestParam String currentRealm) {
        try {
            Map<String, Object> result = cultivationService.getNextRealm(currentRealm);
            return Result.success(result);
        } catch (Exception e) {
            logger.error("获取下一境界失败", e);
            return Result.error("获取下一境界失败");
        }
    }
    
    @PostMapping("/heartbeat")
    public Result<Map<String, Object>> heartbeat(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.valueOf(request.get("roleId").toString());
            Map<String, Object> result = cultivationService.heartbeat(roleId);
            if (Boolean.TRUE.equals(result.get("success"))) {
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            logger.error("心跳更新失败", e);
            return Result.error("心跳更新失败");
        }
    }
    
    @PostMapping("/start")
    public Result<Map<String, Object>> startCultivation(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = request.get("roleId") != null ? Long.valueOf(request.get("roleId").toString()) : null;
            if (roleId == null) {
                return Result.error("参数不完整");
            }
            Map<String, Object> result = cultivationService.autoCultivation(roleId);
            if (Boolean.TRUE.equals(result.get("success"))) {
                result.put("cultivating", true);
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            logger.error("开始修炼失败", e);
            return Result.error("开始修炼失败");
        }
    }
    
    @PostMapping("/stop")
    public Result<Map<String, Object>> stopCultivation(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = request.get("roleId") != null ? Long.valueOf(request.get("roleId").toString()) : null;
            if (roleId == null) {
                return Result.error("参数不完整");
            }
            Map<String, Object> result = cultivationService.getCultivationStatus(roleId);
            result.put("cultivating", false);
            result.put("message", "已停止修炼");
            return Result.success(result);
        } catch (Exception e) {
            logger.error("停止修炼失败", e);
            return Result.error("停止修炼失败");
        }
    }
}
