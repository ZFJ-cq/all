-- ============================================
-- 灵月仙途 - 修炼系统快速修复脚本
-- 执行方式：在数据库客户端中直接执行全部 SQL
-- ============================================

USE lingyuexiantu;

-- 1️⃣ 检查境界配置表数据
SELECT '=== 1. 当前境界配置 ===' AS info;
SELECT id, from_realm, to_realm, xiuwei_requirement, pill_name, success_rate 
FROM cfg_realm_breakthrough 
ORDER BY id;

-- 2️⃣ 插入完整的境界配置（如果表为空）
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

-- 3️⃣ 验证境界配置
SELECT '=== 2. 插入后的境界配置 ===' AS info;
SELECT CONCAT(from_realm, ' → ', to_realm) AS breakthrough, xiuwei_requirement, success_rate
FROM cfg_realm_breakthrough 
ORDER BY id;

-- 4️⃣ 检查角色 45 的资源
SELECT '=== 3. 角色 45 的现有资源 ===' AS info;
SELECT 
    rr.role_id,
    rt.code AS resource_code,
    rt.name AS resource_name,
    rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45
ORDER BY rt.code;

-- 5️⃣ 插入修为资源（如果不存在）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    45,
    (SELECT id FROM resource_type WHERE code = 'xiuwei'),
    1680,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM role_resource 
    WHERE role_id = 45 
    AND resource_type_id = (SELECT id FROM resource_type WHERE code = 'xiuwei')
);

-- 6️⃣ 插入灵石资源（如果不存在）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    45,
    (SELECT id FROM resource_type WHERE code = 'lingshi'),
    1000,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM role_resource 
    WHERE role_id = 45 
    AND resource_type_id = (SELECT id FROM resource_type WHERE code = 'lingshi')
);

-- 7️⃣ 验证资源插入
SELECT '=== 4. 插入后的角色 45 资源 ===' AS info;
SELECT 
    rr.role_id,
    rt.code AS resource_code,
    rt.name AS resource_name,
    rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45
ORDER BY rt.code;

-- 8️⃣ 检查并更新角色境界
SELECT '=== 5. 角色 45 的境界 ===' AS info;
SELECT id, name, realm FROM game_role WHERE id = 45;

UPDATE game_role SET realm = '凡人' WHERE id = 45 AND (realm IS NULL OR realm = '');

-- 9️⃣ 最终验证
SELECT '=== 6. 最终验证 ===' AS info;
SELECT 
    g.id AS role_id,
    g.name AS role_name,
    g.realm AS current_realm,
    rr_xiuwei.quantity AS current_xiuwei,
    rb.xiuwei_requirement AS required_xiuwei,
    rb.to_realm AS next_realm,
    CASE 
        WHEN rr_xiuwei.quantity >= rb.xiuwei_requirement THEN '✅ 可以突破'
        ELSE '❌ 修为不足'
    END AS breakthrough_status
FROM game_role g
LEFT JOIN role_resource rr_xiuwei ON g.id = rr_xiuwei.role_id 
    AND rr_xiuwei.resource_type_id = (SELECT id FROM resource_type WHERE code = 'xiuwei')
LEFT JOIN cfg_realm_breakthrough rb ON g.realm = rb.from_realm
WHERE g.id = 45;

SELECT '✅ 修复完成！请刷新修炼页面验证。' AS message;
