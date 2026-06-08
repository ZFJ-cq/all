package com.lingyue.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/db-fix")
@CrossOrigin(originPatterns = "*")
public class DatabaseFixController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PostMapping("/run-v24")
    public Map<String, Object> runV24Fix() {
        Map<String, Object> result = new HashMap<>();
        List<String> messages = new ArrayList<>();
        
        try {
            // 1. asset_types 表添加缺失的列
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS icon VARCHAR(255) COMMENT '图标'");
                messages.add("✅ asset_types.icon 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.icon 列已存在或添加失败: " + e.getMessage());
            }
            
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS icon_path VARCHAR(255) COMMENT '图标路径'");
                messages.add("✅ asset_types.icon_path 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.icon_path 列已存在或添加失败: " + e.getMessage());
            }
            
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS decimal_precision INT COMMENT '小数精度'");
                messages.add("✅ asset_types.decimal_precision 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.decimal_precision 列已存在或添加失败: " + e.getMessage());
            }
            
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS tradable TINYINT(1) DEFAULT 1 COMMENT '是否可交易'");
                messages.add("✅ asset_types.tradable 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.tradable 列已存在或添加失败: " + e.getMessage());
            }
            
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS droppable TINYINT(1) DEFAULT 1 COMMENT '是否可掉落'");
                messages.add("✅ asset_types.droppable 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.droppable 列已存在或添加失败: " + e.getMessage());
            }
            
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS max_stack INT DEFAULT 99 COMMENT '最大堆叠'");
                messages.add("✅ asset_types.max_stack 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.max_stack 列已存在或添加失败: " + e.getMessage());
            }
            
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS destroy_policy VARCHAR(50) DEFAULT 'none' COMMENT '销毁策略'");
                messages.add("✅ asset_types.destroy_policy 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.destroy_policy 列已存在或添加失败: " + e.getMessage());
            }
            
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS modules VARCHAR(255) COMMENT '模块'");
                messages.add("✅ asset_types.modules 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.modules 列已存在或添加失败: " + e.getMessage());
            }
            
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统资产'");
                messages.add("✅ asset_types.is_system 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.is_system 列已存在或添加失败: " + e.getMessage());
            }
            
            try {
                jdbcTemplate.execute("ALTER TABLE asset_types ADD COLUMN IF NOT EXISTS deleted_at DATETIME COMMENT '删除时间'");
                messages.add("✅ asset_types.deleted_at 列添加成功");
            } catch (Exception e) {
                messages.add("ℹ️ asset_types.deleted_at 列已存在或添加失败: " + e.getMessage());
            }
            
            // 2. 创建 resource_type 表
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS resource_type (" +
                    "id BIGINT PRIMARY KEY AUTO_INCREMENT, " +
                    "name VARCHAR(100) NOT NULL, " +
                    "code VARCHAR(50) UNIQUE, " +
                    "description VARCHAR(255), " +
                    "unit VARCHAR(20), " +
                    "created_at DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                    "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                messages.add("✅ resource_type 表创建成功");
            } catch (Exception e) {
                messages.add("ℹ️ resource_type 表已存在或创建失败: " + e.getMessage());
            }
            
            // 3. 创建 role_resource 表
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS role_resource (" +
                    "id BIGINT PRIMARY KEY AUTO_INCREMENT, " +
                    "role_id BIGINT NOT NULL, " +
                    "resource_type_id BIGINT NOT NULL, " +
                    "quantity BIGINT DEFAULT 0, " +
                    "version INT DEFAULT 0, " +
                    "updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                    "UNIQUE KEY uk_role_resource (role_id, resource_type_id), " +
                    "INDEX idx_role_id (role_id)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                messages.add("✅ role_resource 表创建成功");
            } catch (Exception e) {
                messages.add("ℹ️ role_resource 表已存在或创建失败: " + e.getMessage());
            }
            
            // 4. 创建 inventory 表
            try {
                jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS inventory (" +
                    "id BIGINT PRIMARY KEY AUTO_INCREMENT, " +
                    "role_id BIGINT NOT NULL, " +
                    "item_id BIGINT NOT NULL, " +
                    "item_name VARCHAR(100), " +
                    "item_type VARCHAR(50), " +
                    "rarity VARCHAR(20) DEFAULT 'common', " +
                    "stack_size INT DEFAULT 1, " +
                    "create_time DATETIME DEFAULT CURRENT_TIMESTAMP, " +
                    "update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, " +
                    "INDEX idx_role_id (role_id)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
                messages.add("✅ inventory 表创建成功");
            } catch (Exception e) {
                messages.add("ℹ️ inventory 表已存在或创建失败: " + e.getMessage());
            }
            
            // 5. 复制数据
            try {
                jdbcTemplate.execute("INSERT IGNORE INTO resource_type (name, code, description, unit) " +
                    "SELECT name, code, description, unit_of_measure FROM asset_types");
                messages.add("✅ asset_types 数据复制到 resource_type 成功");
            } catch (Exception e) {
                messages.add("ℹ️ 数据复制失败或已存在: " + e.getMessage());
            }
            
            // 6. 更新默认值
            try {
                jdbcTemplate.update("UPDATE asset_types SET decimal_precision = 0 WHERE decimal_precision IS NULL");
                jdbcTemplate.update("UPDATE asset_types SET tradable = 1 WHERE tradable IS NULL");
                jdbcTemplate.update("UPDATE asset_types SET droppable = 1 WHERE droppable IS NULL");
                jdbcTemplate.update("UPDATE asset_types SET max_stack = 99 WHERE max_stack IS NULL");
                jdbcTemplate.update("UPDATE asset_types SET destroy_policy = 'none' WHERE destroy_policy IS NULL");
                jdbcTemplate.update("UPDATE asset_types SET is_system = 0 WHERE is_system IS NULL");
                messages.add("✅ 默认值设置成功");
            } catch (Exception e) {
                messages.add("ℹ️ 默认值设置失败: " + e.getMessage());
            }
            
            result.put("success", true);
            result.put("messages", messages);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("messages", messages);
        }
        
        return result;
    }
}
