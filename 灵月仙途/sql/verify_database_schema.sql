-- ============================================
-- 灵月仙途 - 数据库字段完整性验证脚本
-- 用于验证数据库表结构与实体类的匹配程度
-- ============================================

-- 1. 统计所有表的字段数量
SELECT '=== 数据库表字段统计 ===' AS section;
SELECT 
    TABLE_NAME AS '表名',
    COUNT(*) AS '字段数量'
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
GROUP BY TABLE_NAME
ORDER BY field_count DESC
LIMIT 20;

-- 2. 检查关键表的必需字段
SELECT '=== 检查 game_role 表关键字段 ===' AS section;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'game_role'
AND COLUMN_NAME IN (
    'id', 'user_id', 'role_name', 'realm', 'realm_stage', 'world_level',
    'cultivation', 'cultivation_max', 'spirit_stones', 'level', 'hp', 'mp',
    'profession', 'profession_level', 'sect', 'sect_position', 'status'
)
ORDER BY ORDINAL_POSITION;

SELECT '=== 检查 role_skill 表关键字段 ===' AS section;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_skill'
AND COLUMN_NAME IN (
    'id', 'role_id', 'skill_id', 'skill_level', 'experience', 'equipped'
)
ORDER BY ORDINAL_POSITION;

SELECT '=== 检查 inventory 表关键字段 ===' AS section;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory'
AND COLUMN_NAME IN (
    'id', 'role_id', 'item_id', 'item_name', 'item_type', 'stack_size', 'is_bound'
)
ORDER BY ORDINAL_POSITION;

SELECT '=== 检查 clans 表关键字段 ===' AS section;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clans'
AND COLUMN_NAME IN (
    'id', 'name', 'level', 'members_count', 'max_members', 'leader_id', 
    'leader_name', 'contribution', 'spirit_stone', 'status', 'location'
)
ORDER BY ORDINAL_POSITION;

SELECT '=== 检查 clan_member 表关键字段 ===' AS section;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clan_member'
AND COLUMN_NAME IN (
    'id', 'clan_id', 'role_id', 'position', 'contribution', 'total_contribution',
    'join_time', 'last_login_time', 'is_approved', 'status'
)
ORDER BY ORDINAL_POSITION;

SELECT '=== 检查 role_body_cultivation 表关键字段 ===' AS section;
SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_body_cultivation'
AND COLUMN_NAME IN (
    'id', 'role_id', 'realm_id', 'body_exp', 'pain_value', 'tolerance',
    'mutation_id', 'status', 'injury_recovery_time', 'total_cultivate_count',
    'total_breakthrough_count', 'failed_breakthrough_count', 'last_cultivate_time'
)
ORDER BY ORDINAL_POSITION;

-- 3. 检查是否有 NULL 值（数据完整性）
SELECT '=== 检查数据完整性（NULL 值统计） ===' AS section;

SELECT 'game_role' AS table_name, 
       SUM(CASE WHEN realm_stage IS NULL THEN 1 ELSE 0 END) AS realm_stage_null,
       SUM(CASE WHEN cultivation IS NULL THEN 1 ELSE 0 END) AS cultivation_null,
       SUM(CASE WHEN status IS NULL THEN 1 ELSE 0 END) AS status_null
FROM game_role
UNION ALL
SELECT 'inventory', 
       SUM(CASE WHEN is_bound IS NULL THEN 1 ELSE 0 END), 0, 0
FROM inventory
UNION ALL
SELECT 'role_skill',
       SUM(CASE WHEN equipped IS NULL THEN 1 ELSE 0 END), 0, 0
FROM role_skill;

-- 4. 检查索引情况
SELECT '=== 检查关键表的索引 ===' AS section;
SELECT 
    TABLE_NAME AS '表名',
    INDEX_NAME AS '索引名',
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS '索引字段',
    NON_UNIQUE AS '是否非唯一'
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('game_role', 'role_skill', 'inventory', 'clans', 'clan_member')
GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE
ORDER BY TABLE_NAME, INDEX_NAME;

-- 5. 检查表是否存在
SELECT '=== 检查关键表是否存在 ===' AS section;
SELECT 
    TABLE_NAME AS '表名',
    TABLE_TYPE AS '类型',
    ENGINE AS '引擎',
    TABLE_ROWS AS '行数',
    CREATE_TIME AS '创建时间'
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN (
    'game_role', 'role_skill', 'inventory', 'clans', 'clan_member',
    'role_body_cultivation', 'task', 'achievement', 'cultivation_techniques',
    'equipment', 'item', 'mail', 'shop_items', 'trade_record', 'skill',
    'clan_task', 'clan_treasure', 'role_profession', 'role_pet', 'role_disciple'
)
ORDER BY TABLE_NAME;

-- 6. 字段类型匹配检查
SELECT '=== 检查字段类型匹配（实体类 vs 数据库） ===' AS section;

-- GameRole 实体类字段检查
SELECT 'GameRole' AS entity, 
       COLUMN_NAME AS field,
       DATA_TYPE AS db_type,
       COLUMN_TYPE AS full_type,
       CASE 
           WHEN COLUMN_NAME = 'id' AND DATA_TYPE = 'bigint' THEN '✓'
           WHEN COLUMN_NAME = 'user_id' AND DATA_TYPE = 'bigint' THEN '✓'
           WHEN COLUMN_NAME = 'role_name' AND DATA_TYPE IN ('varchar') THEN '✓'
           WHEN COLUMN_NAME = 'realm' AND DATA_TYPE IN ('varchar') THEN '✓'
           WHEN COLUMN_NAME = 'level' AND DATA_TYPE IN ('int') THEN '✓'
           WHEN COLUMN_NAME = 'status' AND DATA_TYPE IN ('int') THEN '✓'
           ELSE '✗'
       END AS match_status
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'game_role'
AND COLUMN_NAME IN ('id', 'user_id', 'role_name', 'realm', 'level', 'status')
ORDER BY ORDINAL_POSITION;

-- 7. 字符集和排序规则检查
SELECT '=== 检查字符集和排序规则 ===' AS section;
SELECT 
    TABLE_NAME AS '表名',
    TABLE_COLLATION AS '排序规则',
    CASE 
        WHEN TABLE_COLLATION LIKE 'utf8mb4%' THEN '✓ UTF8MB4'
        WHEN TABLE_COLLATION LIKE 'utf8%' THEN '✓ UTF8'
        ELSE '⚠ 其他'
    END AS charset_status
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('game_role', 'role_skill', 'inventory', 'clans')
ORDER BY TABLE_NAME;

-- 8. 自增主键检查
SELECT '=== 检查自增主键配置 ===' AS section;
SELECT 
    TABLE_NAME AS '表名',
    COLUMN_NAME AS '主键字段',
    COLUMN_TYPE AS '类型',
    EXTRA AS '额外信息'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND COLUMN_KEY = 'PRI'
AND EXTRA LIKE '%auto_increment%'
AND TABLE_NAME IN ('game_role', 'role_skill', 'inventory', 'clans', 'clan_member', 'task', 'achievement')
ORDER BY TABLE_NAME;

-- 9. 时间字段默认值检查
SELECT '=== 检查时间字段默认值 ===' AS section;
SELECT 
    TABLE_NAME AS '表名',
    COLUMN_NAME AS '字段名',
    COLUMN_DEFAULT AS '默认值',
    EXTRA AS '额外信息'
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND DATA_TYPE IN ('timestamp', 'datetime')
AND COLUMN_NAME IN ('create_time', 'update_time', 'created_at', 'updated_at')
AND TABLE_NAME IN ('game_role', 'role_skill', 'inventory', 'clans', 'task')
ORDER BY TABLE_NAME, COLUMN_NAME;

-- 10. 生成验证报告
SELECT '=== 验证完成报告 ===' AS section;
SELECT 
    '数据库字符集' AS item,
    @@character_set_database AS value
UNION ALL
SELECT '数据库排序规则', @@collation_database
UNION ALL
SELECT '表总数', CAST(COUNT(*) AS CHAR)
FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE()
UNION ALL
SELECT '字段总数', CAST(COUNT(*) AS CHAR)
FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()
UNION ALL
SELECT '索引总数', CAST(COUNT(*) AS CHAR)
FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE();

SELECT '✅ 数据库字段完整性验证完成！' AS message;
SELECT '📋 详细报告请查看上方输出结果' AS note;
