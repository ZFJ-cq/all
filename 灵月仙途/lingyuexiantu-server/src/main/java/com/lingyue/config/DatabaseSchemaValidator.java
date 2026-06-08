package com.lingyue.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.*;

/**
 * 数据库表结构验证器
 * 在应用启动时检查表结构完整性，自动添加缺失字段
 */
@Component
public class DatabaseSchemaValidator {
    
    private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaValidator.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    // 定义每个表应该有的字段
    private static final Map<String, Set<String>> EXPECTED_COLUMNS = new HashMap<>();
    
    static {
        // role_asset 表
        EXPECTED_COLUMNS.put("role_asset", new HashSet<>(Arrays.asList(
            "id", "role_id", "asset_id", "asset_name", "asset_type", 
            "subtype", "quantity", "rarity", "description", "effect",
            "affixes", "create_time", "update_time"
        )));
        
        // role_item 表
        EXPECTED_COLUMNS.put("role_item", new HashSet<>(Arrays.asList(
            "id", "role_id", "item_id", "item_name", "item_type",
            "subtype", "quantity", "rarity", "description", "effect",
            "affixes", "create_time", "update_time"
        )));
        
        // role_equipment 表
        EXPECTED_COLUMNS.put("role_equipment", new HashSet<>(Arrays.asList(
            "id", "role_id", "item_id", "slot_id", "item_name",
            "item_type", "rarity", "base_stats", "affixes", "spirit",
            "spirit_level", "durability", "create_time", "update_time"
        )));
        
        // role_clan 表
        EXPECTED_COLUMNS.put("role_clan", new HashSet<>(Arrays.asList(
            "id", "role_id", "clan_id", "position", "join_time",
            "contribution", "status", "version"
        )));
        
        // clan 表
        EXPECTED_COLUMNS.put("clan", new HashSet<>(Arrays.asList(
            "id", "name", "level", "members_count", "max_members",
            "leader_id", "leader_name", "description", "status",
            "create_time", "update_time"
        )));
        
        // role_skill 表
        EXPECTED_COLUMNS.put("role_skill", new HashSet<>(Arrays.asList(
            "id", "role_id", "skill_id", "skill_level", "progress",
            "is_equipped", "create_time", "update_time"
        )));
        
        // role_task 表
        EXPECTED_COLUMNS.put("role_task", new HashSet<>(Arrays.asList(
            "id", "role_id", "task_id", "task_type", "status",
            "progress", "reward_claimed", "create_time", "update_time"
        )));
    }
    
    /**
     * 应用启动后验证数据库表结构
     */
    @PostConstruct
    public void validateAndFixSchema() {
        log.info("开始验证数据库表结构...");
        
        try {
            for (Map.Entry<String, Set<String>> entry : EXPECTED_COLUMNS.entrySet()) {
                String tableName = entry.getKey();
                Set<String> expectedColumns = entry.getValue();
                
                if (!tableExists(tableName)) {
                    log.warn("表 {} 不存在，跳过检查", tableName);
                    continue;
                }
                
                Set<String> actualColumns = getActualColumns(tableName);
                Set<String> missingColumns = new HashSet<>(expectedColumns);
                missingColumns.removeAll(actualColumns);
                
                if (!missingColumns.isEmpty()) {
                    log.warn("表 {} 缺少字段：{}", tableName, missingColumns);
                    addMissingColumns(tableName, missingColumns);
                } else {
                    log.info("表 {} 结构完整", tableName);
                }
            }
            
            log.info("数据库表结构验证完成");
        } catch (Exception e) {
            log.error("数据库表结构验证失败：{}", e.getMessage(), e);
        }
    }
    
    /**
     * 检查表是否存在
     */
    private boolean tableExists(String tableName) {
        try {
            String sql = "SELECT COUNT(*) FROM information_schema.tables " +
                        "WHERE table_schema = DATABASE() AND table_name = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName);
            return count != null && count > 0;
        } catch (Exception e) {
            log.error("检查表 {} 是否存在失败：{}", tableName, e.getMessage());
            return false;
        }
    }
    
    /**
     * 获取表的实际字段列表
     */
    private Set<String> getActualColumns(String tableName) {
        Set<String> columns = new HashSet<>();
        try {
            String sql = "SELECT COLUMN_NAME FROM information_schema.COLUMNS " +
                        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?";
            List<String> result = jdbcTemplate.queryForList(sql, String.class, tableName);
            if (result != null) {
                columns.addAll(result);
            }
        } catch (Exception e) {
            log.error("获取表 {} 字段列表失败：{}", tableName, e.getMessage());
        }
        return columns;
    }
    
    /**
     * 添加缺失的字段
     */
    private void addMissingColumns(String tableName, Set<String> missingColumns) {
        for (String columnName : missingColumns) {
            try {
                String alterSql = getAlterTableSql(tableName, columnName);
                log.info("执行 SQL: {}", alterSql);
                jdbcTemplate.execute(alterSql);
                log.info("成功为表 {} 添加字段 {}", tableName, columnName);
            } catch (Exception e) {
                log.error("为表 {} 添加字段 {} 失败：{}", tableName, columnName, e.getMessage());
            }
        }
    }
    
    /**
     * 根据字段名生成 ALTER TABLE SQL
     */
    private String getAlterTableSql(String tableName, String columnName) {
        // 根据字段名推断字段类型
        String columnType = inferColumnType(columnName);
        String defaultValue = getDefaultValue(columnName);
        
        StringBuilder sql = new StringBuilder();
        sql.append("ALTER TABLE ").append(tableName);
        sql.append(" ADD COLUMN ").append(columnName);
        sql.append(" ").append(columnType);
        
        if (defaultValue != null) {
            sql.append(" DEFAULT ").append(defaultValue);
        }
        
        // version 字段需要 NOT NULL
        if ("version".equals(columnName)) {
            sql.append(" NOT NULL");
        }
        
        // 添加注释
        String comment = getColumnComment(columnName);
        if (comment != null) {
            sql.append(" COMMENT '").append(comment).append("'");
        }
        
        return sql.toString();
    }
    
    /**
     * 根据字段名推断字段类型
     */
    private String inferColumnType(String columnName) {
        if (columnName.endsWith("_id") || "id".equals(columnName) || "role_id".equals(columnName)) {
            return "BIGINT";
        }
        
        if (columnName.endsWith("_count") || "quantity".equals(columnName) || 
            "level".equals(columnName) || "progress".equals(columnName) ||
            "rarity".equals(columnName) || "type".equals(columnName) ||
            "slot_id".equals(columnName) || "task_type".equals(columnName) ||
            "position".equals(columnName) || "contribution".equals(columnName)) {
            return "INT";
        }
        
        if (columnName.startsWith("is_") || "claimed".equals(columnName)) {
            return "TINYINT(1)";
        }
        
        if (columnName.endsWith("_time") || "create_time".equals(columnName) || 
            "update_time".equals(columnName) || "join_time".equals(columnName)) {
            return "DATETIME";
        }
        
        if ("base_stats".equals(columnName) || "affixes".equals(columnName) || 
            "spirit".equals(columnName)) {
            return "JSON";
        }
        
        if ("description".equals(columnName) || "effect".equals(columnName)) {
            return "TEXT";
        }
        
        // 默认 VARCHAR
        return "VARCHAR(255)";
    }
    
    /**
     * 获取字段默认值
     */
    private String getDefaultValue(String columnName) {
        if (columnName.endsWith("_count") || "quantity".equals(columnName) ||
            "progress".equals(columnName) || "contribution".equals(columnName)) {
            return "0";
        }
        
        if (columnName.startsWith("is_")) {
            return "0";
        }
        
        if (columnName.endsWith("_time")) {
            return "CURRENT_TIMESTAMP";
        }
        
        if ("version".equals(columnName)) {
            return "0";
        }
        
        if ("status".equals(columnName)) {
            return "'normal'";
        }
        
        return null;
    }
    
    /**
     * 获取字段注释
     */
    private String getColumnComment(String columnName) {
        Map<String, String> comments = new HashMap<>();
        comments.put("version", "乐观锁版本号");
        comments.put("create_time", "创建时间");
        comments.put("update_time", "更新时间");
        comments.put("status", "状态");
        comments.put("quantity", "数量");
        comments.put("rarity", "品质");
        comments.put("level", "等级");
        comments.put("progress", "进度");
        
        return comments.get(columnName);
    }
}
