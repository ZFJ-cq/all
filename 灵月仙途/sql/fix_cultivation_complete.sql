-- ============================================
-- 灵月仙途 - 修炼系统完整修复脚本
-- 执行方式：在数据库客户端中一次性执行全部 SQL
-- 功能：实现自动修炼、灵石/丹药加速功能
-- ============================================

USE lingyuexiantu;

-- ============================================
-- 1️⃣ 境界配置表修复
-- ============================================

SELECT '=== 1. 检查境界配置表 ===' AS info;

-- 检查表是否存在
SELECT COUNT(*) AS table_exists 
FROM information_schema.tables 
WHERE table_schema = 'lingyuexiantu' 
AND table_name = 'cfg_realm_breakthrough';

-- 检查现有数据
SELECT '=== 当前境界配置数据 ===' AS info;
SELECT id, from_realm, to_realm, xiuwei_requirement, pill_name, success_rate 
FROM cfg_realm_breakthrough 
ORDER BY id;

-- 插入完整的境界配置数据（如果表为空）
INSERT INTO cfg_realm_breakthrough 
  (from_realm, to_realm, xiuwei_requirement, pill_name, success_rate, failure_penalty)
SELECT * FROM (
  SELECT '凡人', '炼气期', 100, '聚气丹', 0.9500, '损失 10% 修为'
  UNION ALL SELECT '炼气期', '筑基期', 500, '筑基丹', 0.9000, '损失 20% 修为'
  UNION ALL SELECT '筑基期', '金丹期', 2000, '金丹散', 0.8000, '损失 30% 修为'
  UNION ALL SELECT '金丹期', '元婴期', 10000, '化婴果', 0.7000, '损失 40% 修为'
  UNION ALL SELECT '元婴期', '化神期', 50000, '凝神草', 0.6000, '损失 50% 修为'
  UNION ALL SELECT '化神期', '炼虚期', 200000, '虚灵液', 0.5000, '损失 60% 修为'
  UNION ALL SELECT '炼虚期', '合体期', 1000000, '合神丹', 0.4000, '损失 70% 修为'
  UNION ALL SELECT '合体期', '大乘期', 5000000, '渡劫散', 0.3000, '损失 80% 修为'
  UNION ALL SELECT '大乘期', '真仙期', 20000000, '飞升丹', 0.2000, '损失 90% 修为'
  UNION ALL SELECT '真仙期', '更高境界', 100000000, '仙缘果', 0.1000, '重修'
) AS temp(from_realm, to_realm, xiuwei_requirement, pill_name, success_rate, failure_penalty)
WHERE NOT EXISTS (SELECT 1 FROM cfg_realm_breakthrough WHERE from_realm = '凡人');

SELECT '=== 插入后的境界配置 ===' AS info;
SELECT CONCAT(from_realm, ' → ', to_realm) AS breakthrough, 
       xiuwei_requirement AS required_xiuwei,
       CONCAT(success_rate * 100, '%') AS success_rate
FROM cfg_realm_breakthrough 
ORDER BY id;

-- ============================================
-- 2️⃣ 资源类型表检查
-- ============================================

SELECT '=== 2. 检查资源类型表 ===' AS info;
SELECT id, code, name, unit FROM resource_type ORDER BY id;

-- 如果资源类型表为空，插入基础数据
INSERT INTO resource_type (code, name, description, unit)
SELECT * FROM (
  SELECT 'lingshi' AS code, '灵石' AS name, '游戏通用货币' AS description, '个' AS unit
  UNION ALL SELECT 'xiuwei', '修为', '修炼经验值', '点'
  UNION ALL SELECT 'hunshi', '魂石', '特殊资源', '个'
  UNION ALL SELECT 'xiandian', '仙点', '商城积分', '点'
  UNION ALL SELECT 'zhujidan', '筑基丹', '突破丹药', '颗'
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi');

-- ============================================
-- 3️⃣ 角色 45 资源修复
-- ============================================

SELECT '=== 3. 检查角色 45 的资源 ===' AS info;

-- 检查角色 45 的现有资源
SELECT 
    rr.role_id,
    rt.code AS resource_code,
    rt.name AS resource_name,
    rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45
ORDER BY rt.code;

-- 插入修为资源（如果不存在）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    45 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'xiuwei') AS resource_type_id,
    1680 AS quantity,  -- 初始修为
    NOW() AS create_time,
    NOW() AS update_time
WHERE NOT EXISTS (
    SELECT 1 FROM role_resource 
    WHERE role_id = 45 
    AND resource_type_id = (SELECT id FROM resource_type WHERE code = 'xiuwei')
);

-- 插入灵石资源（如果不存在）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    45 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'lingshi') AS resource_type_id,
    5000 AS quantity,  -- 初始灵石（足够多次加速）
    NOW() AS create_time,
    NOW() AS update_time
WHERE NOT EXISTS (
    SELECT 1 FROM role_resource 
    WHERE role_id = 45 
    AND resource_type_id = (SELECT id FROM resource_type WHERE code = 'lingshi')
);

-- 插入筑基丹资源（如果不存在）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    45 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'zhujidan') AS resource_type_id,
    10 AS quantity,  -- 初始筑基丹
    NOW() AS create_time,
    NOW() AS update_time
WHERE NOT EXISTS (
    SELECT 1 FROM role_resource 
    WHERE role_id = 45 
    AND resource_type_id = (SELECT id FROM resource_type WHERE code = 'zhujidan')
);

SELECT '=== 插入后的角色 45 资源 ===' AS info;
SELECT 
    rr.role_id,
    rt.code AS resource_code,
    rt.name AS resource_name,
    rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45
ORDER BY rt.code;

-- ============================================
-- 4️⃣ 角色境界修复
-- ============================================

SELECT '=== 4. 检查角色 45 的境界 ===' AS info;
SELECT id, name, realm FROM game_role WHERE id = 45;

-- 确保角色 45 的境界为"凡人"
UPDATE game_role SET realm = '凡人' WHERE id = 45 AND (realm IS NULL OR realm = '');

SELECT '=== 更新后的角色境界 ===' AS info;
SELECT id, name, realm FROM game_role WHERE id = 45;

-- ============================================
-- 5️⃣ 最终验证
-- ============================================

SELECT '=== 5. 最终验证 ===' AS info;

-- 验证修炼系统完整性
SELECT 
    g.id AS role_id,
    g.name AS role_name,
    g.realm AS current_realm,
    rr_xiuwei.quantity AS current_xiuwei,
    rb.xiuwei_requirement AS required_xiuwei,
    rb.to_realm AS next_realm,
    rr_lingshi.quantity AS lingshi_count,
    rr_pill.quantity AS pill_count,
    CASE 
        WHEN rr_xiuwei.quantity >= rb.xiuwei_requirement THEN '✅ 可以突破'
        ELSE '❌ 修为不足'
    END AS breakthrough_status,
    CASE 
        WHEN rr_lingshi.quantity >= 100 THEN '✅ 可以灵石加速'
        ELSE '❌ 灵石不足'
    END AS lingshi_boost_status,
    CASE 
        WHEN rr_pill.quantity >= 1 THEN '✅ 可以丹药加速'
        ELSE '❌ 丹药不足'
    END AS pill_boost_status
FROM game_role g
LEFT JOIN role_resource rr_xiuwei ON g.id = rr_xiuwei.role_id 
    AND rr_xiuwei.resource_type_id = (SELECT id FROM resource_type WHERE code = 'xiuwei')
LEFT JOIN role_resource rr_lingshi ON g.id = rr_lingshi.role_id 
    AND rr_lingshi.resource_type_id = (SELECT id FROM resource_type WHERE code = 'lingshi')
LEFT JOIN role_resource rr_pill ON g.id = rr_pill.role_id 
    AND rr_pill.resource_type_id = (SELECT id FROM resource_type WHERE code = 'zhujidan')
LEFT JOIN cfg_realm_breakthrough rb ON g.realm = rb.from_realm
WHERE g.id = 45;

-- ============================================
-- 6️⃣ 功能说明
-- ============================================

SELECT '
=============================================
✅ 修炼系统修复完成！
=============================================

功能说明：
1. 自动修炼：每 30 秒自动获得修为（基础 30 点/次）
2. 灵石加速：消耗 100 灵石，立即获得修为
3. 丹药加速：消耗 1 筑基丹，立即获得 3 倍修为

修炼效率：
- 基础效率：1 点/秒 = 30 点/次
- 灵石增幅：2 倍效率（60 点/次）
- 丹药爆发：3 倍效率（90 点/次）

境界突破需求：
- 凡人 → 炼气期：100 修为
- 炼气期 → 筑基期：500 修为
- 筑基期 → 金丹期：2000 修为
- 后续境界需求递增

操作指南：
1. 刷新修炼页面查看效果
2. 点击"灵石增幅"或"丹药爆发"按钮加速修炼
3. 修为达到需求后，点击"突破"按钮提升境界
=============================================
' AS guide;

SELECT '✅ 所有修复完成！请刷新修炼页面验证。' AS message;
