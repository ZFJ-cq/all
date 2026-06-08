-- ============================================
-- 灵月仙途 - 手动初始化角色数据
-- 功能：为角色 45 初始化所有必要数据
-- 执行时间：2026-03-18
-- ============================================

-- ============================================
-- 1. 初始化修炼数据
-- ============================================

-- 创建境界数据
INSERT INTO role_realms (role_id, realm, xiuwei, level, create_time)
VALUES (45, '凡人', 0, 1, NOW())
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- 创建修炼配置
INSERT INTO role_auto_cultivation_config 
(role_id, is_enabled, cultivation_interval, auto_breakthrough, create_time)
VALUES (45, 0, 60, 0, NOW())
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- ============================================
-- 2. 初始化锻体数据
-- ============================================

-- 创建锻体境界
INSERT INTO role_body_cultivation 
(role_id, realm_id, body_exp, pain_value, tolerance, status, create_time)
VALUES (45, 1, 0, 0, 0, 1, NOW())
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- 创建 10 个身体部位的修炼进度
INSERT INTO role_body_part_progress (role_id, body_part_id, progress, is_locked, create_time)
SELECT 45, id, 0, 0, NOW() FROM body_part
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- ============================================
-- 3. 初始化任务数据
-- ============================================

-- 接取所有启用的日常任务
INSERT INTO role_task (role_id, task_id, status, progress, is_daily_task, accept_time, create_time)
SELECT 45, id, 'ACCEPTED', 0, 1, NOW(), NOW() 
FROM task 
WHERE is_daily = 1 AND is_enabled = 1
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- ============================================
-- 4. 发放新手物品
-- ============================================

-- 发放聚气丹×10
INSERT INTO role_item (role_id, item_id, count, create_time)
SELECT 45, id, 10, NOW() FROM item WHERE name = '聚气丹'
ON DUPLICATE KEY UPDATE count = count + 10;

-- 发放回春丹×10
INSERT INTO role_item (role_id, item_id, count, create_time)
SELECT 45, id, 10, NOW() FROM item WHERE name = '回春丹'
ON DUPLICATE KEY UPDATE count = count + 10;

-- 发放回灵丹×10
INSERT INTO role_item (role_id, item_id, count, create_time)
SELECT 45, id, 10, NOW() FROM item WHERE name = '回灵丹'
ON DUPLICATE KEY UPDATE count = count + 10;

-- ============================================
-- 5. 验证数据
-- ============================================

SELECT '=== 修炼数据 ===' AS info;
SELECT * FROM role_realms WHERE role_id = 45;
SELECT * FROM role_auto_cultivation_config WHERE role_id = 45;

SELECT '=== 锻体数据 ===' AS info;
SELECT * FROM role_body_cultivation WHERE role_id = 45;
SELECT COUNT(*) as body_parts FROM role_body_part_progress WHERE role_id = 45;

SELECT '=== 任务数据 ===' AS info;
SELECT COUNT(*) as task_count FROM role_task WHERE role_id = 45;

SELECT '=== 物品数据 ===' AS info;
SELECT ri.*, i.name FROM role_item ri 
LEFT JOIN item i ON ri.item_id = i.id 
WHERE ri.role_id = 45;

SELECT '✅ 数据初始化完成！' AS message;
