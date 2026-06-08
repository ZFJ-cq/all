package com.lingyue.controller;

import com.lingyue.service.RoleStatsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/role-stats")
public class RoleStatsController {
    
    private final RoleStatsService roleStatsService;
    
    public RoleStatsController(RoleStatsService roleStatsService) {
        this.roleStatsService = roleStatsService;
    }
    
    /**
     * 获取角色基础属性
     * @param roleId 角色ID
     * @return 基础属性
     */
    @GetMapping("/base/{roleId}")
    public Map<String, Object> getBaseStats(@PathVariable Long roleId) {
        Map<String, Object> result = new java.util.HashMap<>();
        try {
            Map<String, Integer> stats = roleStatsService.getBaseStats(roleId);
            result.put("code", 200);
            result.put("message", "获取成功");
            result.put("data", stats);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "获取失败：" + e.getMessage());
        }
        return result;
    }
    
    /**
     * 更新角色基础属性
     * @param roleId 角色ID
     * @param stats 基础属性
     * @return 操作结果
     */
    @PostMapping("/base/{roleId}")
    public Map<String, Object> updateBaseStats(@PathVariable Long roleId, @RequestBody Map<String, Integer> stats) {
        Map<String, Object> result = new java.util.HashMap<>();
        try {
            roleStatsService.updateBaseStats(roleId, stats);
            result.put("code", 200);
            result.put("message", "更新成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "更新失败：" + e.getMessage());
        }
        return result;
    }
}
