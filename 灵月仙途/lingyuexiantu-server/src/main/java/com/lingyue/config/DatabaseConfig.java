package com.lingyue.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
public class DatabaseConfig {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PostConstruct
    public void initDatabase() {
        try {
            // 先尝试获取外键约束名称
            List<String> foreignKeys = jdbcTemplate.queryForList(
                "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_NAME = 'game_role' AND CONSTRAINT_NAME LIKE 'game_role_ibfk_%'",
                String.class
            );
            
            // 移除现有的外键约束
            for (String constraintName : foreignKeys) {
                jdbcTemplate.execute("ALTER TABLE game_role DROP FOREIGN KEY " + constraintName);
                System.out.println("Dropped foreign key: " + constraintName);
            }
            
            // 添加新的外键约束，引用game_user表
            jdbcTemplate.execute("ALTER TABLE game_role ADD CONSTRAINT game_role_ibfk_1 FOREIGN KEY (user_id) REFERENCES game_user(id) ON DELETE CASCADE");
            
            System.out.println("Database foreign key constraint updated successfully!");
        } catch (Exception e) {
            System.out.println("Error updating database foreign key constraint: " + e.getMessage());
            // 继续执行，不影响应用启动
        }
        
        // 清空现有的资源数据
        clearResourceData();
        
        // 初始化资源类型数据
        initResourceTypes();
        
        // 初始化角色资源数据
        initRoleResources();
    }
    
    private void clearResourceData() {
        try {
            // 删除角色资源数据
            jdbcTemplate.execute("DELETE FROM role_resource");
            // 删除资源类型数据
            jdbcTemplate.execute("DELETE FROM resource_type");
            System.out.println("Resource data cleared successfully!");
        } catch (Exception e) {
            System.out.println("Error clearing resource data: " + e.getMessage());
            // 继续执行，不影响应用启动
        }
    }
    
    private void initResourceTypes() {
        try {
            // 检查resource_type表是否为空
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM resource_type", Integer.class);
            if (count == 0) {
                // 插入资源类型数据
                String[] resourceTypes = {
                    "仙力,xianli,修仙所需的仙力",
                    "仙石,xianshi,修仙世界的通用货币",
                    "灵石,lingshi,修仙世界的基础货币",
                    "修为,xiuwei,修仙者的修为值",
                    "魂石,hunshi,用于提升灵魂强度",
                    "灵气,lingqi,修仙所需的灵气"
                };
                
                for (String type : resourceTypes) {
                    String[] parts = type.split(",");
                    String name = parts[0];
                    String code = parts[1];
                    String description = parts[2];
                    
                    // 使用参数化查询避免SQL注入
                    jdbcTemplate.update(
                        "INSERT INTO resource_type (name, code, description, unit) VALUES (?, ?, ?, ?)",
                        name, code, description, ""
                    );
                }
                
                System.out.println("Resource types initialized successfully!");
            }
        } catch (Exception e) {
            System.out.println("Error initializing resource types: " + e.getMessage());
            // 继续执行，不影响应用启动
        }
    }
    
    private void initRoleResources() {
        try {
            // 检查role_resource表是否为空
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM role_resource", Integer.class);
            if (count == 0) {
                // 获取所有资源类型ID
                List<Long> resourceTypeIds = jdbcTemplate.queryForList(
                    "SELECT id FROM resource_type", Long.class
                );
                
                // 获取所有角色ID
                List<Long> roleIds = jdbcTemplate.queryForList(
                    "SELECT id FROM game_role", Long.class
                );
                
                // 为每个角色初始化资源
                for (Long roleId : roleIds) {
                    for (Long resourceTypeId : resourceTypeIds) {
                        // 所有资源初始值都设置为0
                        long quantity = 0;
                        
                        // 使用参数化查询避免SQL注入
                        jdbcTemplate.update(
                            "INSERT INTO role_resource (role_id, resource_type_id, quantity, updated_at) VALUES (?, ?, ?, NOW())",
                            roleId, resourceTypeId, quantity
                        );
                    }
                }
                
                System.out.println("Role resources initialized successfully!");
            }
        } catch (Exception e) {
            System.out.println("Error initializing role resources: " + e.getMessage());
            // 继续执行，不影响应用启动
        }
    }
}