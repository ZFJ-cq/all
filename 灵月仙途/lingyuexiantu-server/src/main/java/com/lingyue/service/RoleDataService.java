package com.lingyue.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RoleDataService {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 为新角色初始化所有必要数据
     */
    @Transactional
    public void initializeRoleData(Long roleId) {
        initializeRoleRealm(roleId);
        initializeCultivationConfig(roleId);
        initializeBodyCultivation(roleId);
        initializeTasks(roleId);
        initializeRoleAssets(roleId);
        giveStarterItems(roleId);
    }
    
    /**
     * 初始化角色资产数据
     */
    private void initializeRoleAssets(Long roleId) {
        try {
            // 初始化寿命资产
            jdbcTemplate.update("""
                INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
                VALUES (?, 'SHOUMING', 100, NOW(), NOW())
                ON DUPLICATE KEY UPDATE quantity = 100
            """, roleId);
            
            // 初始化灵石资产
            jdbcTemplate.update("""
                INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
                VALUES (?, 'LINGSHI', 0, NOW(), NOW())
                ON DUPLICATE KEY UPDATE quantity = 0
            """, roleId);
            
            // 初始化仙石资产
            jdbcTemplate.update("""
                INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
                VALUES (?, 'XIANSHI', 0, NOW(), NOW())
                ON DUPLICATE KEY UPDATE quantity = 0
            """, roleId);
            
            // 初始化修为资产
            jdbcTemplate.update("""
                INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
                VALUES (?, 'XIUWEI', 0, NOW(), NOW())
                ON DUPLICATE KEY UPDATE quantity = 0
            """, roleId);
            
            System.out.println("角色资产数据初始化成功，roleId: " + roleId);
        } catch (Exception e) {
            System.err.println("角色资产数据初始化失败：" + e.getMessage());
        }
    }
    
    /**
     * 初始化境界数据
     */
    private void initializeRoleRealm(Long roleId) {
        try {
            jdbcTemplate.update("""
                INSERT INTO role_realms 
                (role_id, realm_name, realm_level, total_cultivation, next_realm_cultivation, created_at, updated_at)
                VALUES (?, '凡人', 1, 0, 100, NOW(), NOW())
                ON DUPLICATE KEY UPDATE role_id = ?
            """, roleId, roleId);
            
            jdbcTemplate.update("""
                UPDATE game_role 
                SET realm = '凡人', body_level = '凡人' 
                WHERE id = ?
            """, roleId);
            
            System.out.println("境界数据初始化成功，roleId: " + roleId);
        } catch (Exception e) {
            System.err.println("境界数据初始化失败：" + e.getMessage());
        }
    }
    
    /**
     * 初始化修炼配置
     */
    private void initializeCultivationConfig(Long roleId) {
        try {
            jdbcTemplate.update("""
                INSERT INTO role_auto_cultivation_config 
                (role_id, is_enabled, cultivation_interval, auto_breakthrough)
                VALUES (?, 0, 60, 0)
                ON DUPLICATE KEY UPDATE role_id = ?
            """, roleId, roleId);
            System.out.println("修炼配置初始化成功，roleId: " + roleId);
        } catch (Exception e) {
            System.err.println("修炼配置初始化失败：" + e.getMessage());
        }
    }
    
    /**
     * 初始化锻体数据
     */
    private void initializeBodyCultivation(Long roleId) {
        try {
            jdbcTemplate.update("""
                INSERT INTO role_body_cultivation 
                (role_id, realm_id, body_exp, pain_value, tolerance, status, failed_breakthrough_count, total_breakthrough_count, total_cultivate_count)
                VALUES (?, 1, 0, 0.00, 0, 1, 0, 0, 0)
                ON DUPLICATE KEY UPDATE role_id = ?
            """, roleId, roleId);
            
            List<Long> bodyParts = jdbcTemplate.queryForList("""
                SELECT id FROM body_part
            """, Long.class);
            
            for (Long partId : bodyParts) {
                jdbcTemplate.update("""
                    INSERT INTO role_body_part_progress 
                    (role_id, part_id, exp, is_locked, level, cultivate_count, created_at, updated_at)
                    VALUES (?, ?, 0, 0, 1, 0, NOW(), NOW())
                """, roleId, partId);
            }
            
            System.out.println("锻体数据初始化成功，roleId: " + roleId + ", 身体部位数: " + bodyParts.size());
        } catch (Exception e) {
            System.err.println("锻体数据初始化失败：" + e.getMessage());
        }
    }
    
    /**
     * 初始化任务数据
     */
    private void initializeTasks(Long roleId) {
        try {
            List<Long> dailyTasks = jdbcTemplate.queryForList("""
                SELECT id FROM task WHERE task_type = 'DAILY' AND is_active = 1
            """, Long.class);
            
            for (Long taskId : dailyTasks) {
                jdbcTemplate.update("""
                    INSERT INTO role_task 
                    (role_id, task_id, status, progress, task_type, target, create_time)
                    VALUES (?, ?, 'ACCEPTED', 0, 1, 1, NOW())
                """, roleId, taskId);
            }
            
            System.out.println("任务数据初始化成功，roleId: " + roleId + ", 任务数：" + dailyTasks.size());
        } catch (Exception e) {
            System.err.println("任务数据初始化失败：" + e.getMessage());
        }
    }
    
    /**
     * 发放新手物品
     */
    private void giveStarterItems(Long roleId) {
        try {
            List<Long> itemIds = jdbcTemplate.queryForList("""
                SELECT id FROM item WHERE name IN ('聚气丹', '回春丹', '回灵丹')
            """, Long.class);
            
            for (Long itemId : itemIds) {
                String itemName = jdbcTemplate.queryForObject(
                    "SELECT name FROM item WHERE id = ?", String.class, itemId);
                jdbcTemplate.update("""
                    INSERT INTO role_item 
                    (role_id, item_id, quantity, item_name, item_type, position, acquire_time)
                    VALUES (?, ?, 10, ?, 'PILL', 0, NOW())
                    ON DUPLICATE KEY UPDATE quantity = quantity + 10
                """, roleId, itemId, itemName);
            }
            
            if (itemIds.isEmpty()) {
                System.out.println("新手物品不存在，跳过发放，roleId: " + roleId);
            } else {
                System.out.println("新手物品发放成功，roleId: " + roleId + ", 物品数：" + itemIds.size());
            }
        } catch (Exception e) {
            System.err.println("新手物品发放失败：" + e.getMessage());
        }
    }
}
