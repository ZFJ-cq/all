-- ============================================
-- 灵月仙途 - 检查和修复角色 45 的修为资源
-- 执行方式：在数据库客户端中直接执行
-- ============================================

USE lingyuexiantu;

-- 1. 检查资源类型表
SELECT '=== 资源类型表 ===' AS info;
SELECT id, code, name, unit FROM resource_type ORDER BY id;

-- 2. 检查角色 45 的现有资源
SELECT '=== 角色 45 的现有资源 ===' AS info;
SELECT 
    rr.id,
    rr.role_id,
    rr.resource_type_id,
    rt.code AS resource_code,
    rt.name AS resource_name,
    rr.quantity,
    rr.create_time,
    rr.update_time
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45
ORDER BY rr.resource_type_id;

-- 3. 如果角色 45 没有修为资源，插入初始数据
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    45 AS role_id,
    rt.id AS resource_type_id,
    0 AS quantity,
    NOW() AS create_time,
    NOW() AS update_time
FROM resource_type rt
WHERE rt.code = 'xiuwei'
AND NOT EXISTS (
    SELECT 1 FROM role_resource rr 
    WHERE rr.role_id = 45 AND rr.resource_type_id = rt.id
);

-- 4. 验证插入结果
SELECT '=== 插入后的角色 45 资源 ===' AS info;
SELECT 
    rr.id,
    rr.role_id,
    rr.resource_type_id,
    rt.code AS resource_code,
    rt.name AS resource_name,
    rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45
ORDER BY rr.resource_type_id;

-- 5. 检查境界配置表
SELECT '=== 境界配置表 ===' AS info;
SELECT * FROM realm_breakthrough ORDER BY sort_order;

-- 6. 如果境界配置表为空，插入完整数据
INSERT INTO realm_breakthrough (from_realm, to_realm, xiuwei_requirement, success_rate_base, description, sort_order)
SELECT * FROM (
    SELECT 
        '凡人' AS from_realm,
        '炼气期' AS to_realm,
        100 AS xiuwei_requirement,
        95.00 AS success_rate_base,
        '从凡人踏入炼气期，开启修仙之路' AS description,
        1 AS sort_order
    UNION ALL SELECT '炼气期', '筑基期', 500, 90.00, '炼气化神，铸就道基', 2
    UNION ALL SELECT '筑基期', '金丹期', 2000, 80.00, '凝气成丹，大道可期', 3
    UNION ALL SELECT '金丹期', '元婴期', 10000, 70.00, '丹破婴生，神通初显', 4
    UNION ALL SELECT '元婴期', '化神期', 50000, 60.00, '婴神合一，感悟天地', 5
    UNION ALL SELECT '化神期', '炼虚期', 200000, 50.00, '虚实相生，通天达地', 6
    UNION ALL SELECT '炼虚期', '合体期', 1000000, 40.00, '身合大道，逆天改命', 7
    UNION ALL SELECT '合体期', '大乘期', 5000000, 30.00, '功德圆满，渡劫飞升', 8
    UNION ALL SELECT '大乘期', '真仙期', 20000000, 20.00, '历经天劫，超脱凡俗', 9
    UNION ALL SELECT '真仙期', '更高境界', 100000000, 10.00, '仙路漫漫，永无止境', 10
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM realm_breakthrough WHERE from_realm = '凡人')
ON DUPLICATE KEY UPDATE from_realm = from_realm;

-- 7. 验证境界配置
SELECT '=== 验证后的境界配置 ===' AS info;
SELECT * FROM realm_breakthrough ORDER BY sort_order;

-- 8. 检查角色 45 的境界
SELECT '=== 角色 45 的境界 ===' AS info;
SELECT id, name, realm FROM game_role WHERE id = 45;

-- 9. 确保角色 45 的境界为"凡人"
UPDATE game_role SET realm = '凡人' WHERE id = 45 AND (realm IS NULL OR realm = '');

-- 10. 最终验证
SELECT '=== 最终验证 ===' AS info;
SELECT 
    g.id AS role_id,
    g.name AS role_name,
    g.realm AS current_realm,
    rr_xiuwei.quantity AS xiuwei,
    rb.xiuwei_requirement AS required_xiuwei,
    rb.to_realm AS next_realm
FROM game_role g
LEFT JOIN role_resource rr_xiuwei ON g.id = rr_xiuwei.role_id 
    AND rr_xiuwei.resource_type_id = (SELECT id FROM resource_type WHERE code = 'xiuwei')
LEFT JOIN realm_breakthrough rb ON g.realm = rb.from_realm
WHERE g.id = 45;
