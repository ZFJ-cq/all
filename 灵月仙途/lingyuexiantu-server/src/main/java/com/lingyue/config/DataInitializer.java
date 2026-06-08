package com.lingyue.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("开始初始化基础数据...");
        
        try {
            // 0. 先创建缺失的表
            ClassPathResource tableResource = new ClassPathResource("data/create-missing-tables.sql");
            if (tableResource.exists()) {
                System.out.println("开始创建缺失的表...");
                String tableSql = new String(Files.readAllBytes(Paths.get(tableResource.getURI())));
                String[] tableStatements = tableSql.split(";");
                int tableCount = 0;
                for (String stmt : tableStatements) {
                    String trimmed = stmt.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                        try {
                            jdbcTemplate.execute(trimmed);
                            tableCount++;
                        } catch (Exception e) {
                            System.err.println("创建表出错：" + e.getMessage());
                        }
                    }
                }
                System.out.println("缺失的表创建完成！共执行 " + tableCount + " 条 SQL 语句");
            }
            
            // 0.1 创建核心数值系统表
            ClassPathResource statsResource = new ClassPathResource("data/create-stats-tables.sql");
            if (statsResource.exists()) {
                System.out.println("开始创建核心数值系统表...");
                String statsSql = new String(Files.readAllBytes(Paths.get(statsResource.getURI())));
                String[] statsStatements = statsSql.split(";");
                int statsCount = 0;
                for (String stmt : statsStatements) {
                    String trimmed = stmt.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                        try {
                            jdbcTemplate.execute(trimmed);
                            statsCount++;
                        } catch (Exception e) {
                            System.err.println("创建数值系统表出错：" + e.getMessage());
                        }
                    }
                }
                System.out.println("核心数值系统表创建完成！共执行 " + statsCount + " 条 SQL 语句");
            }
            
            // 1. 先执行创建 admin 用户的 SQL
            ClassPathResource adminResource = new ClassPathResource("data/create-admin.sql");
            if (adminResource.exists()) {
                String adminSql = new String(Files.readAllBytes(Paths.get(adminResource.getURI())));
                String[] adminStatements = adminSql.split(";");
                for (String stmt : adminStatements) {
                    String trimmed = stmt.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                        try {
                            jdbcTemplate.execute(trimmed);
                        } catch (Exception e) {
                            // 忽略错误
                        }
                    }
                }
                System.out.println("Admin 用户创建完成！");
            }

            // 1.1 执行更新 admin 密码的 SQL
            ClassPathResource updatePasswordResource = new ClassPathResource("data/update-admin-password.sql");
            if (updatePasswordResource.exists()) {
                String updateSql = new String(Files.readAllBytes(Paths.get(updatePasswordResource.getURI())));
                String[] updateStatements = updateSql.split(";");
                for (String stmt : updateStatements) {
                    String trimmed = stmt.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                        try {
                            jdbcTemplate.execute(trimmed);
                            System.out.println("Admin 用户密码已更新为 123456！");
                        } catch (Exception e) {
                            // 忽略错误
                        }
                    }
                }
            }

            // 2. 读取基础数据 SQL 文件
            ClassPathResource resource = new ClassPathResource("data/init-data.sql");
            if (resource.exists()) {
                String sql = new String(Files.readAllBytes(Paths.get(resource.getURI())));
                
                // 分割 SQL 语句并执行
                String[] statements = sql.split(";");
                for (String stmt : statements) {
                    String trimmed = stmt.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                        try {
                            jdbcTemplate.execute(trimmed);
                        } catch (Exception e) {
                            // 忽略已存在的记录错误
                            if (!e.getMessage().contains("Duplicate") && 
                                !e.getMessage().contains("已存在")) {
                                System.err.println("执行 SQL 出错：" + e.getMessage());
                            }
                        }
                    }
                }
                System.out.println("基础数据初始化完成！");
            } else {
                System.out.println("未找到初始化数据文件");
            }
            
            // 3. 读取完整数据初始化 SQL 文件（新增）
            ClassPathResource completeDataResource = new ClassPathResource("data/complete-data-init.sql");
            if (completeDataResource.exists()) {
                System.out.println("开始执行完整数据初始化...");
                String sql = new String(Files.readAllBytes(Paths.get(completeDataResource.getURI())));
                
                // 分割 SQL 语句并执行
                String[] statements = sql.split(";");
                int executedCount = 0;
                for (String stmt : statements) {
                    String trimmed = stmt.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                        try {
                            jdbcTemplate.execute(trimmed);
                            executedCount++;
                            System.out.println("  执行 SQL #" + executedCount + ": " + trimmed.substring(0, Math.min(50, trimmed.length())) + "...");
                        } catch (Exception e) {
                            System.err.println("执行 SQL 出错：" + e.getMessage());
                        }
                    }
                }
                System.out.println("完整数据初始化完成！共执行 " + executedCount + " 条 SQL 语句");
            } else {
                System.out.println("未找到完整数据初始化文件");
            }
            
            // 4. 初始化资产类型和角色资产
            System.out.println("开始初始化资产类型和角色资产...");
            try {
                try {
                    jdbcTemplate.execute("ALTER TABLE role_asset ADD UNIQUE INDEX uk_role_asset_type (role_id, asset_type_code)");
                    System.out.println("  添加 role_asset 唯一约束成功");
                } catch (Exception e) {
                    if (e.getMessage().contains("Duplicate") || e.getMessage().contains("already exists")) {
                        System.out.println("  role_asset 唯一约束已存在，跳过");
                    } else {
                        System.err.println("  添加唯一约束出错：" + e.getMessage());
                    }
                }
                
                String[] assetTypeSqls = {
                    "INSERT INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `unit_of_measure`, `decimal_precision`, `is_system`, `created_at`, `updated_at`) VALUES ('LINGSHI', '灵石', 'CURRENCY', '货币', '修仙世界的通用货币', '个', 0, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();",
                    "INSERT INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `unit_of_measure`, `decimal_precision`, `is_system`, `created_at`, `updated_at`) VALUES ('XIANSHI', '仙石', 'CURRENCY', '货币', '仙界通用货币，蕴含强大灵气', '个', 0, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();",
                    "INSERT INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `unit_of_measure`, `decimal_precision`, `is_system`, `created_at`, `updated_at`) VALUES ('SHOUMING', '寿命', 'SPECIAL', '属性', '角色的寿命值，影响修炼和活动', '年', 0, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();",
                    "INSERT INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `unit_of_measure`, `decimal_precision`, `is_system`, `created_at`, `updated_at`) VALUES ('XIUWEI', '修为', 'SPECIAL', '属性', '角色的修炼程度', '点', 0, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();",
                    "INSERT INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `unit_of_measure`, `decimal_precision`, `is_system`, `created_at`, `updated_at`) VALUES ('XIANLI', '仙力', 'SPECIAL', '属性', '角色的仙力值', '点', 0, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();",
                    "INSERT INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `unit_of_measure`, `decimal_precision`, `is_system`, `created_at`, `updated_at`) VALUES ('HUNSHI', '魂石', 'MATERIAL', '材料', '蕴含灵魂之力的石头', '个', 0, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();",
                    "INSERT INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `unit_of_measure`, `decimal_precision`, `is_system`, `created_at`, `updated_at`) VALUES ('LINGQI', '灵气', 'SPECIAL', '属性', '角色的灵气值', '点', 0, 1, NOW(), NOW()) ON DUPLICATE KEY UPDATE name = VALUES(name), updated_at = NOW();"
                };
                
                for (String sql : assetTypeSqls) {
                    try {
                        jdbcTemplate.execute(sql);
                        System.out.println("  执行资产类型初始化 SQL: " + sql.substring(0, Math.min(100, sql.length())) + "...");
                    } catch (Exception e) {
                        System.err.println("执行资产类型 SQL 出错：" + e.getMessage());
                    }
                }
                
                // 为每个角色添加初始资产
                String roleAssetSql = "INSERT IGNORE INTO `role_asset` (`role_id`, `asset_type_code`, `quantity`, `created_at`, `updated_at`) " +
                    "SELECT gr.id AS role_id, at.code AS asset_type_code, " +
                    "CASE " +
                    "    WHEN at.code = 'LINGSHI' THEN 0 " +
                    "    WHEN at.code = 'XIANSHI' THEN 0 " +
                    "    WHEN at.code = 'SHOUMING' THEN 100 " +
                    "    WHEN at.code = 'XIUWEI' THEN 0 " +
                    "    WHEN at.code = 'XIANLI' THEN 0 " +
                    "    WHEN at.code = 'HUNSHI' THEN 0 " +
                    "    WHEN at.code = 'LINGQI' THEN 0 " +
                    "    ELSE 0 " +
                    "END AS quantity, NOW(), NOW() " +
                    "FROM game_role gr, asset_types at " +
                    "WHERE at.code IN ('LINGSHI', 'XIANSHI', 'SHOUMING', 'XIUWEI', 'XIANLI', 'HUNSHI', 'LINGQI') " +
                    "AND NOT EXISTS (" +
                    "    SELECT 1 FROM role_asset ra " +
                    "    WHERE ra.role_id = gr.id AND ra.asset_type_code = at.code " +
                    ")";
                
                try {
                    jdbcTemplate.execute(roleAssetSql);
                    System.out.println("  执行角色资产初始化 SQL");
                } catch (Exception e) {
                    System.err.println("执行角色资产 SQL 出错：" + e.getMessage());
                }
                
                System.out.println("资产类型和角色资产初始化完成！");
            } catch (Exception e) {
                System.err.println("初始化资产数据失败：" + e.getMessage());
            }
            
            // 5. 初始化宗门数据
            System.out.println("开始初始化宗门数据...");
            try {
                ClassPathResource clanResource = new ClassPathResource("data/init-clan-data.sql");
                if (clanResource.exists()) {
                    String clanSql = new String(Files.readAllBytes(Paths.get(clanResource.getURI())));
                    String[] clanStatements = clanSql.split(";\n");
                    for (String stmt : clanStatements) {
                        String trimmed = stmt.trim();
                        if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                            try {
                                jdbcTemplate.execute(trimmed);
                                System.out.println("  执行宗门数据初始化 SQL");
                            } catch (Exception e) {
                                // 忽略已存在的记录错误
                                if (!e.getMessage().contains("Duplicate") && 
                                    !e.getMessage().contains("已存在")) {
                                    System.err.println("执行宗门数据 SQL 出错：" + e.getMessage());
                                }
                            }
                        }
                    }
                    System.out.println("宗门数据初始化完成！");
                } else {
                    System.out.println("未找到宗门数据初始化文件");
                }
            } catch (Exception e) {
                System.err.println("初始化宗门数据失败：" + e.getMessage());
            }
            
            // 6. 初始化系统配置数据
            System.out.println("开始初始化系统配置数据...");
            try {
                ClassPathResource systemSettingResource = new ClassPathResource("data/init-system-setting.sql");
                if (systemSettingResource.exists()) {
                    String systemSettingSql = new String(Files.readAllBytes(Paths.get(systemSettingResource.getURI())));
                    String[] systemSettingStatements = systemSettingSql.split(";\n");
                    for (String stmt : systemSettingStatements) {
                        String trimmed = stmt.trim();
                        if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                            try {
                                jdbcTemplate.execute(trimmed);
                                System.out.println("  执行系统配置数据初始化 SQL");
                            } catch (Exception e) {
                                // 忽略已存在的记录错误
                                if (!e.getMessage().contains("Duplicate") && 
                                    !e.getMessage().contains("已存在")) {
                                    System.err.println("执行系统配置数据 SQL 出错：" + e.getMessage());
                                }
                            }
                        }
                    }
                    System.out.println("系统配置数据初始化完成！");
                } else {
                    System.out.println("未找到系统配置数据初始化文件");
                }
            } catch (Exception e) {
                System.err.println("初始化系统配置数据失败：" + e.getMessage());
            }
            
            // 7. 初始化配置数据
            System.out.println("开始初始化配置数据...");
            try {
                ClassPathResource configResource = new ClassPathResource("data/init-config-data.sql");
                if (configResource.exists()) {
                    String configSql = new String(Files.readAllBytes(Paths.get(configResource.getURI())));
                    String[] configStatements = configSql.split(";\n");
                    for (String stmt : configStatements) {
                        String trimmed = stmt.trim();
                        if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                            try {
                                jdbcTemplate.execute(trimmed);
                                System.out.println("  执行配置数据初始化 SQL");
                            } catch (Exception e) {
                                // 忽略已存在的记录错误
                                if (!e.getMessage().contains("Duplicate") && 
                                    !e.getMessage().contains("已存在")) {
                                    System.err.println("执行配置数据 SQL 出错：" + e.getMessage());
                                }
                            }
                        }
                    }
                    System.out.println("配置数据初始化完成！");
                } else {
                    System.out.println("未找到配置数据初始化文件");
                }
            } catch (Exception e) {
                System.err.println("初始化配置数据失败：" + e.getMessage());
            }
            
            // 8. 初始化任务和背包数据
            System.out.println("开始初始化任务和背包数据...");
            try {
                ClassPathResource taskInvResource = new ClassPathResource("data/init-task-inventory.sql");
                if (taskInvResource.exists()) {
                    String taskInvSql = new String(Files.readAllBytes(Paths.get(taskInvResource.getURI())));
                    String[] taskInvStatements = taskInvSql.split(";");
                    for (String stmt : taskInvStatements) {
                        String trimmed = stmt.trim();
                        if (!trimmed.isEmpty() && !trimmed.startsWith("--")) {
                            try {
                                jdbcTemplate.execute(trimmed);
                            } catch (Exception e) {
                                if (!e.getMessage().contains("Duplicate") &&
                                    !e.getMessage().contains("已存在")) {
                                    System.err.println("执行任务/背包 SQL 出错：" + e.getMessage());
                                }
                            }
                        }
                    }
                    System.out.println("任务和背包数据初始化完成！");
                } else {
                    System.out.println("未找到任务和背包数据初始化文件");
                }
            } catch (Exception e) {
                System.err.println("初始化任务和背包数据失败：" + e.getMessage());
            }

            // 9. 修复任务类型大小写
            System.out.println("开始修复任务类型...");
            try {
                jdbcTemplate.execute("UPDATE task SET task_type = LOWER(task_type) WHERE task_type IN ('DAILY', 'MAIN', 'ACHIEVEMENT')");
                System.out.println("任务类型修复完成！");
            } catch (Exception e) {
                System.err.println("修复任务类型出错：" + e.getMessage());
            }

            // 10. 清理重复任务
            System.out.println("开始清理重复任务...");
            try {
                jdbcTemplate.execute("DELETE t1 FROM task t1 INNER JOIN task t2 WHERE t1.id > t2.id AND t1.name = t2.name AND t1.task_type = t2.task_type");
                System.out.println("重复任务清理完成！");
            } catch (Exception e) {
                System.err.println("清理重复任务出错：" + e.getMessage());
            }

        } catch (Exception e) {
            System.err.println("初始化数据失败：" + e.getMessage());
            e.printStackTrace();
        }
    }
}
