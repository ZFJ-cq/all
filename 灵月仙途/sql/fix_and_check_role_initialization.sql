-- ============================================
-- 灵月仙途 - 角色创建初始化数据修复与验证
-- 功能：修复和验证新创建角色的所有必要数据
-- 创建时间：2026-04-01
-- ============================================

-- ============================================
-- 1. 检查必要的基础数据是否存在
-- ============================================

-- 检查资产类型表是否有数据
SELECT '检查资产类型...' AS step;
SELECT COUNT(*) as asset_type_count FROM asset_types;

-- 检查物品表是否有新手物品
SELECT '检查新手物品...' AS step;
SELECT name, id FROM item WHERE name IN ('聚气丹', '回春丹', '回灵丹');

-- 检查任务表是否有日常任务
SELECT '检查日常任务...' AS step;
SELECT id, name, is_daily, is_enabled FROM task WHERE is_daily = 1 AND is_enabled = 1;

-- 检查身体部位表是否有数据
SELECT '检查身体部位...' AS step;
SELECT COUNT(*) as body_part_count FROM body_part;

-- ============================================
-- 2. 为指定角色初始化所有数据（假设角色 ID=45）
-- ============================================

SET @role_id = 45;

-- 2.1 初始化基础属性
SELECT CONCAT('初始化角色 ', @role_id, ' 的基础属性...') AS step;
INSERT INTO role_base_stats (role_id, vit, spi, agi, wis, lck, created_at, updated_at)
VALUES (@role_id, 10, 10, 10, 10, 10, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    vit = VALUES(vit),
    spi = VALUES(spi),
    agi = VALUES(agi),
    wis = VALUES(wis),
    lck = VALUES(lck),
    updated_at = NOW();

-- 2.2 初始化境界数据
SELECT CONCAT('初始化角色 ', @role_id, ' 的境界数据...') AS step;
INSERT INTO role_realms 
(role_id, realm_name, realm_level, total_cultivation, next_realm_cultivation, created_at, updated_at)
VALUES (@role_id, '凡人', 1, 0, 100, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    realm_name = VALUES(realm_name),
    realm_level = VALUES(realm_level),
    total_cultivation = VALUES(total_cultivation),
    next_realm_cultivation = VALUES(next_realm_cultivation),
    updated_at = NOW();

-- 2.3 初始化修炼配置
SELECT CONCAT('初始化角色 ', @role_id, ' 的修炼配置...') AS step;
INSERT INTO role_auto_cultivation_config 
(role_id, is_enabled, cultivation_interval, auto_breakthrough, created_at, updated_at)
VALUES (@role_id, 0, 60, 0, NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    is_enabled = VALUES(is_enabled),
    cultivation_interval = VALUES(cultivation_interval),
    auto_breakthrough = VALUES(auto_breakthrough),
    updated_at = NOW();

-- 2.4 初始化锻体境界
SELECT CONCAT('初始化角色 ', @role_id, ' 的锻体境界...') AS step;
INSERT INTO role_body_cultivation 
(role_id, realm_id, body_exp, pain_value, tolerance, status, create_time)
VALUES (@role_id, 1, 0, 0, 0, 1, NOW())
ON DUPLICATE KEY UPDATE 
    realm_id = VALUES(realm_id),
    body_exp = VALUES(body_exp),
    pain_value = VALUES(pain_value),
    tolerance = VALUES(tolerance),
    status = VALUES(status),
    create_time = NOW();

-- 2.5 初始化身体部位进度（10 个部位）
SELECT CONCAT('初始化角色 ', @role_id, ' 的身体部位进度...') AS step;
INSERT INTO role_body_part_progress (role_id, body_part_id, progress, is_locked, create_time)
SELECT @role_id, id, 0, 0, NOW() FROM body_part
ON DUPLICATE KEY UPDATE 
    progress = VALUES(progress),
    is_locked = VALUES(is_locked),
    create_time = NOW();

-- 2.6 初始化资产（所有资产类型）
SELECT CONCAT('初始化角色 ', @role_id, ' 的资产数据...') AS step;
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
SELECT @role_id, code, 0, NOW(), NOW() FROM asset_types
ON DUPLICATE KEY UPDATE 
    quantity = VALUES(quantity),
    updated_at = NOW();

-- 2.7 初始化任务数据（所有日常任务）
SELECT CONCAT('初始化角色 ', @role_id, ' 的任务数据...') AS step;
INSERT INTO role_task (role_id, task_id, status, progress, is_daily_task, accept_time, create_time)
SELECT @role_id, id, 'ACCEPTED', 0, 1, NOW(), NOW() 
FROM task 
WHERE is_daily = 1 AND is_enabled = 1
ON DUPLICATE KEY UPDATE 
    status = VALUES(status),
    progress = VALUES(progress),
    is_daily_task = VALUES(is_daily_task),
    accept_time = VALUES(accept_time),
    create_time = NOW();

-- 2.8 发放新手物品
SELECT CONCAT('发放角色 ', @role_id, ' 的新手物品...') AS step;
INSERT INTO role_item (role_id, item_id, count, create_time)
SELECT @role_id, id, 10, NOW() FROM item WHERE name = '聚气丹'
ON DUPLICATE KEY UPDATE count = count + 10;

INSERT INTO role_item (role_id, item_id, count, create_time)
SELECT @role_id, id, 10, NOW() FROM item WHERE name = '回春丹'
ON DUPLICATE KEY UPDATE count = count + 10;

INSERT INTO role_item (role_id, item_id, count, create_time)
SELECT @role_id, id, 10, NOW() FROM item WHERE name = '回灵丹'
ON DUPLICATE KEY UPDATE count = count + 10;

-- ============================================
-- 3. 验证数据
-- ============================================

SELECT '======================================' AS '';
SELECT CONCAT('验证角色 ', @role_id, ' 的数据完整性') AS '';
SELECT '======================================' AS '';

-- 3.1 验证基础属性
SELECT '基础属性' AS category, 
       CONCAT('根骨:', vit, ' 灵力:', spi, ' 身法:', agi, ' 悟性:', wis, ' 气运:', lck) AS value
FROM role_base_stats WHERE role_id = @role_id;

-- 3.2 验证境界数据
SELECT '境界数据' AS category, 
       CONCAT(realm_name, ' (', realm_level, '层，修为:', total_cultivation, ')') AS value
FROM role_realms WHERE role_id = @role_id;

-- 3.3 验证修炼配置
SELECT '修炼配置' AS category, 
       CONCAT('自动修炼:', IF(is_enabled=1,'开启','关闭'), ' 间隔:', cultivation_interval, '秒') AS value
FROM role_auto_cultivation_config WHERE role_id = @role_id;

-- 3.4 验证锻体数据
SELECT '锻体境界' AS category, 
       CONCAT('境界 ID:', realm_id, ' 经验:', body_exp) AS value
FROM role_body_cultivation WHERE role_id = @role_id;

-- 3.5 验证身体部位
SELECT '身体部位' AS category, 
       CONCAT(COUNT(*), ' 个部位已初始化') AS value
FROM role_body_part_progress WHERE role_id = @role_id;

-- 3.6 验证资产数据
SELECT '资产数据' AS category, 
       GROUP_CONCAT(CONCAT(asset_type_code, ':', quantity) SEPARATOR ' ') AS value
FROM role_asset WHERE role_id = @role_id;

-- 3.7 验证任务数据
SELECT '任务数据' AS category, 
       CONCAT(COUNT(*), ' 个日常任务') AS value
FROM role_task WHERE role_id = @role_id AND is_daily_task = 1;

-- 3.8 验证物品数据
SELECT '背包物品' AS category, 
       GROUP_CONCAT(CONCAT(i.name, '×', ri.count) SEPARATOR ' ') AS value
FROM role_item ri
LEFT JOIN item i ON ri.item_id = i.id
WHERE ri.role_id = @role_id;

-- ============================================
-- 4. 完整性检查
-- ============================================

SELECT '======================================' AS '';
SELECT '数据完整性检查报告' AS report;
SELECT '======================================' AS '';

SELECT 
    'game_role' AS table_name,
    IF(COUNT(*) > 0, '✅ 存在', '❌ 缺失') AS status,
    COUNT(*) AS record_count
FROM game_role WHERE id = @role_id
UNION ALL
SELECT 
    'role_base_stats' AS table_name,
    IF(COUNT(*) > 0, '✅ 存在', '❌ 缺失') AS status,
    COUNT(*) AS record_count
FROM role_base_stats WHERE role_id = @role_id
UNION ALL
SELECT 
    'role_realms' AS table_name,
    IF(COUNT(*) > 0, '✅ 存在', '❌ 缺失') AS status,
    COUNT(*) AS record_count
FROM role_realms WHERE role_id = @role_id
UNION ALL
SELECT 
    'role_auto_cultivation_config' AS table_name,
    IF(COUNT(*) > 0, '✅ 存在', '❌ 缺失') AS status,
    COUNT(*) AS record_count
FROM role_auto_cultivation_config WHERE role_id = @role_id
UNION ALL
SELECT 
    'role_body_cultivation' AS table_name,
    IF(COUNT(*) > 0, '✅ 存在', '❌ 缺失') AS status,
    COUNT(*) AS record_count
FROM role_body_cultivation WHERE role_id = @role_id
UNION ALL
SELECT 
    'role_body_part_progress' AS table_name,
    IF(COUNT(*) >= 10, '✅ 完整', '❌ 不完整') AS status,
    COUNT(*) AS record_count
FROM role_body_part_progress WHERE role_id = @role_id
UNION ALL
SELECT 
    'role_asset' AS table_name,
    IF(COUNT(*) > 0, '✅ 存在', '❌ 缺失') AS status,
    COUNT(*) AS record_count
FROM role_asset WHERE role_id = @role_id
UNION ALL
SELECT 
    'role_task' AS table_name,
    IF(COUNT(*) > 0, '✅ 存在', '❌ 缺失') AS status,
    COUNT(*) AS record_count
FROM role_task WHERE role_id = @role_id
UNION ALL
SELECT 
    'role_item' AS table_name,
    IF(COUNT(*) > 0, '✅ 存在', '❌ 缺失') AS status,
    COUNT(*) AS record_count
FROM role_item WHERE role_id = @role_id;

SELECT '======================================' AS '';
SELECT '✅ 数据初始化完成！' AS message;
SELECT '======================================' AS '';
