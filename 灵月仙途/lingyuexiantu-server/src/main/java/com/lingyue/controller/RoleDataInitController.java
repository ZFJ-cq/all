package com.lingyue.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/admin/init")
public class RoleDataInitController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 为任意角色初始化所有数据
     */
    @PostMapping("/role-data")
    public ResponseEntity<Map<String, Object>> initRoleData(@RequestParam Long roleId) {
        Map<String, Object> result = new HashMap<>();
        int totalOperations = 0;
        int successOperations = 0;
        
        try {
            // 1. 初始化境界数据
            totalOperations++;
            try {
                jdbcTemplate.update("""
                    INSERT INTO role_realms 
                    (role_id, realm_name, realm_level, total_cultivation, next_realm_cultivation, created_at)
                    VALUES (?, '凡人', 1, 0, 100, NOW())
                    ON DUPLICATE KEY UPDATE role_id = ?
                """, roleId, roleId);
                successOperations++;
                System.out.println("✅ 境界数据初始化成功，roleId: " + roleId);
            } catch (Exception e) {
                System.err.println("❌ 境界数据初始化失败：" + e.getMessage());
            }
            
            // 2. 初始化修炼配置
            totalOperations++;
            try {
                jdbcTemplate.update("""
                    INSERT INTO role_auto_cultivation_config 
                    (role_id, is_enabled, cultivation_interval, auto_breakthrough, created_at)
                    VALUES (?, 0, 60, 0, NOW())
                    ON DUPLICATE KEY UPDATE role_id = ?
                """, roleId, roleId);
                successOperations++;
                System.out.println("✅ 修炼配置初始化成功，roleId: " + roleId);
            } catch (Exception e) {
                System.err.println("❌ 修炼配置初始化失败：" + e.getMessage());
            }
            
            // 3. 初始化锻体数据
            totalOperations++;
            try {
                jdbcTemplate.update("""
                    INSERT INTO role_body_cultivation 
                    (role_id, realm_id, body_exp, pain_value, tolerance, status, create_time)
                    VALUES (?, 1, 0, 0, 0, 1, NOW())
                    ON DUPLICATE KEY UPDATE role_id = ?
                """, roleId, roleId);
                successOperations++;
                System.out.println("✅ 锻体境界初始化成功，roleId: " + roleId);
            } catch (Exception e) {
                System.err.println("❌ 锻体境界初始化失败：" + e.getMessage());
            }
            
            // 4. 初始化身体部位
            totalOperations++;
            try {
                jdbcTemplate.update("""
                    INSERT INTO role_body_part_progress (role_id, body_part_id, progress, is_locked, create_time)
                    SELECT ?, id, 0, 0, NOW() FROM body_part
                    ON DUPLICATE KEY UPDATE role_id = ?
                """, roleId, roleId);
                successOperations++;
                System.out.println("✅ 身体部位初始化成功，roleId: " + roleId);
            } catch (Exception e) {
                System.err.println("❌ 身体部位初始化失败：" + e.getMessage());
            }
            
            // 5. 初始化任务数据
            totalOperations++;
            try {
                jdbcTemplate.update("""
                    INSERT INTO role_task (role_id, task_id, status, progress, is_daily_task, accept_time, create_time)
                    SELECT ?, id, 'ACCEPTED', 0, 1, NOW(), NOW() 
                    FROM task 
                    WHERE is_daily = 1 AND is_enabled = 1
                    ON DUPLICATE KEY UPDATE role_id = ?
                """, roleId, roleId);
                successOperations++;
                System.out.println("✅ 任务数据初始化成功，roleId: " + roleId);
            } catch (Exception e) {
                System.err.println("❌ 任务数据初始化失败：" + e.getMessage());
            }
            
            // 6. 发放新手物品
            totalOperations++;
            try {
                jdbcTemplate.update("""
                    INSERT INTO role_item (role_id, item_id, count, create_time)
                    SELECT ?, id, 10, NOW() FROM item WHERE name = '聚气丹'
                    ON DUPLICATE KEY UPDATE count = count + 10
                """, roleId);
                jdbcTemplate.update("""
                    INSERT INTO role_item (role_id, item_id, count, create_time)
                    SELECT ?, id, 10, NOW() FROM item WHERE name = '回春丹'
                    ON DUPLICATE KEY UPDATE count = count + 10
                """, roleId);
                jdbcTemplate.update("""
                    INSERT INTO role_item (role_id, item_id, count, create_time)
                    SELECT ?, id, 10, NOW() FROM item WHERE name = '回灵丹'
                    ON DUPLICATE KEY UPDATE count = count + 10
                """, roleId);
                successOperations++;
                System.out.println("✅ 新手物品发放成功，roleId: " + roleId);
            } catch (Exception e) {
                System.err.println("❌ 新手物品发放失败：" + e.getMessage());
            }
            
            // 7. 初始化资产
            totalOperations++;
            try {
                jdbcTemplate.update("""
                    INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
                    SELECT ?, code, 0, NOW(), NOW() FROM asset_types
                    ON DUPLICATE KEY UPDATE quantity = 0
                """, roleId);
                successOperations++;
                System.out.println("✅ 资产数据初始化成功，roleId: " + roleId);
            } catch (Exception e) {
                System.err.println("❌ 资产数据初始化失败：" + e.getMessage());
            }
            
            // 返回结果
            result.put("code", 200);
            result.put("message", "初始化完成");
            result.put("data", Map.of(
                "totalOperations", totalOperations,
                "successOperations", successOperations,
                "roleId", roleId
            ));
            
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "初始化失败：" + e.getMessage());
            e.printStackTrace();
        }
        
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
    
    /**
     * 为角色 45 初始化所有数据（保留向后兼容）
     */
    @PostMapping("/role-45")
    public ResponseEntity<Map<String, Object>> initRole45Data() {
        return initRoleData(45L);
    }
    
    /**
     * 检查角色数据完整性
     */
    @GetMapping("/check-role-data")
    public ResponseEntity<Map<String, Object>> checkRoleData(@RequestParam Long roleId) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> checks = new HashMap<>();
        int totalChecks = 0;
        int passedChecks = 0;
        
        try {
            // 1. 检查 game_role
            totalChecks++;
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM game_role WHERE id = ?", Integer.class, roleId);
                if (count != null && count > 0) {
                    checks.put("game_role", Map.of("status", "✅ 存在", "count", count));
                    passedChecks++;
                } else {
                    checks.put("game_role", Map.of("status", "❌ 缺失", "count", 0));
                }
            } catch (Exception e) {
                checks.put("game_role", Map.of("status", "❌ 错误", "error", e.getMessage()));
            }
            
            // 2. 检查 role_base_stats
            totalChecks++;
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_base_stats WHERE role_id = ?", Integer.class, roleId);
                if (count != null && count > 0) {
                    checks.put("role_base_stats", Map.of("status", "✅ 存在", "count", count));
                    passedChecks++;
                } else {
                    checks.put("role_base_stats", Map.of("status", "❌ 缺失", "count", 0));
                }
            } catch (Exception e) {
                checks.put("role_base_stats", Map.of("status", "❌ 错误", "error", e.getMessage()));
            }
            
            // 3. 检查 role_realms
            totalChecks++;
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_realms WHERE role_id = ?", Integer.class, roleId);
                if (count != null && count > 0) {
                    checks.put("role_realms", Map.of("status", "✅ 存在", "count", count));
                    passedChecks++;
                } else {
                    checks.put("role_realms", Map.of("status", "❌ 缺失", "count", 0));
                }
            } catch (Exception e) {
                checks.put("role_realms", Map.of("status", "❌ 错误", "error", e.getMessage()));
            }
            
            // 4. 检查 role_auto_cultivation_config
            totalChecks++;
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_auto_cultivation_config WHERE role_id = ?", Integer.class, roleId);
                if (count != null && count > 0) {
                    checks.put("role_auto_cultivation_config", Map.of("status", "✅ 存在", "count", count));
                    passedChecks++;
                } else {
                    checks.put("role_auto_cultivation_config", Map.of("status", "❌ 缺失", "count", 0));
                }
            } catch (Exception e) {
                checks.put("role_auto_cultivation_config", Map.of("status", "❌ 错误", "error", e.getMessage()));
            }
            
            // 5. 检查 role_body_cultivation
            totalChecks++;
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_body_cultivation WHERE role_id = ?", Integer.class, roleId);
                if (count != null && count > 0) {
                    checks.put("role_body_cultivation", Map.of("status", "✅ 存在", "count", count));
                    passedChecks++;
                } else {
                    checks.put("role_body_cultivation", Map.of("status", "❌ 缺失", "count", 0));
                }
            } catch (Exception e) {
                checks.put("role_body_cultivation", Map.of("status", "❌ 错误", "error", e.getMessage()));
            }
            
            // 6. 检查 role_body_part_progress
            totalChecks++;
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_body_part_progress WHERE role_id = ?", Integer.class, roleId);
                if (count != null && count >= 10) {
                    checks.put("role_body_part_progress", Map.of("status", "✅ 完整", "count", count));
                    passedChecks++;
                } else {
                    checks.put("role_body_part_progress", Map.of("status", "❌ 不完整", "count", count));
                }
            } catch (Exception e) {
                checks.put("role_body_part_progress", Map.of("status", "❌ 错误", "error", e.getMessage()));
            }
            
            // 7. 检查 role_asset
            totalChecks++;
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_asset WHERE role_id = ?", Integer.class, roleId);
                if (count != null && count > 0) {
                    checks.put("role_asset", Map.of("status", "✅ 存在", "count", count));
                    passedChecks++;
                } else {
                    checks.put("role_asset", Map.of("status", "❌ 缺失", "count", 0));
                }
            } catch (Exception e) {
                checks.put("role_asset", Map.of("status", "❌ 错误", "error", e.getMessage()));
            }
            
            // 8. 检查 role_task
            totalChecks++;
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_task WHERE role_id = ?", Integer.class, roleId);
                if (count != null && count > 0) {
                    checks.put("role_task", Map.of("status", "✅ 存在", "count", count));
                    passedChecks++;
                } else {
                    checks.put("role_task", Map.of("status", "❌ 缺失", "count", 0));
                }
            } catch (Exception e) {
                checks.put("role_task", Map.of("status", "❌ 错误", "error", e.getMessage()));
            }
            
            // 9. 检查 role_item
            totalChecks++;
            try {
                Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_item WHERE role_id = ?", Integer.class, roleId);
                if (count != null && count > 0) {
                    checks.put("role_item", Map.of("status", "✅ 存在", "count", count));
                    passedChecks++;
                } else {
                    checks.put("role_item", Map.of("status", "❌ 缺失", "count", 0));
                }
            } catch (Exception e) {
                checks.put("role_item", Map.of("status", "❌ 错误", "error", e.getMessage()));
            }
            
            result.put("code", 200);
            result.put("message", "检查完成");
            result.put("data", Map.of(
                "roleId", roleId,
                "totalChecks", totalChecks,
                "passedChecks", passedChecks,
                "failedChecks", totalChecks - passedChecks,
                "completionRate", Math.round((double) passedChecks / totalChecks * 100) + "%",
                "checks", checks
            ));
            
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "检查失败：" + e.getMessage());
            e.printStackTrace();
        }
        
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
}
