-- ============================================
-- 灵月仙途 - 修复突破功能（立即执行）
-- ============================================

USE lingyuexiantu;

-- 1. 检查 resource_type 表
SELECT '=== 1. 当前 resource_type 表数据 ===' AS info;
SELECT id, code, name, description, unit FROM resource_type ORDER BY id;

-- 2. 插入修为资源类型（如果不存在）
INSERT INTO resource_type (code, name, description, unit)
SELECT 'xiuwei', '修为', '修炼经验值', '点'
WHERE NOT EXISTS (SELECT 1 FROM resource_type WHERE code = 'xiuwei');

-- 3. 插入灵石资源类型（如果不存在）
INSERT INTO resource_type (code, name, description, unit)
SELECT 'lingshi', '灵石', '游戏通用货币', '个'
WHERE NOT EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi');

-- 4. 插入筑基丹资源类型（如果不存在）
INSERT INTO resource_type (code, name, description, unit)
SELECT 'zhujidan', '筑基丹', '突破丹药', '颗'
WHERE NOT EXISTS (SELECT 1 FROM resource_type WHERE code = 'zhujidan');

-- 5. 验证资源类型已插入
SELECT '=== 2. 验证资源类型 ===' AS info;
SELECT id, code, name FROM resource_type 
WHERE code IN ('xiuwei', 'lingshi', 'zhujidan')
ORDER BY id;

-- 6. 检查角色 1 的现有资源
SELECT '=== 3. 角色 1 的现有资源 ===' AS info;
SELECT rr.*, rt.code, rt.name 
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 1;

-- 7. 删除角色 1 的旧资源
DELETE FROM role_resource WHERE role_id = 1;

-- 8. 插入角色 1 的修为资源（1680 点）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    1 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'xiuwei') AS resource_type_id,
    1680 AS quantity,
    NOW() AS create_time,
    NOW() AS update_time;

-- 9. 插入角色 1 的灵石资源（5000 个）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    1 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'lingshi') AS resource_type_id,
    5000 AS quantity,
    NOW() AS create_time,
    NOW() AS update_time;

-- 10. 插入角色 1 的筑基丹资源（10 颗）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    1 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'zhujidan') AS resource_type_id,
    10 AS quantity,
    NOW() AS create_time,
    NOW() AS update_time;

-- 11. 验证角色 1 的资源
SELECT '=== 4. 角色 1 的最终资源 ===' AS info;
SELECT rr.id, rr.role_id, rr.resource_type_id, rt.code, rt.name, rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 1
ORDER BY rr.id;

-- 12. 检查角色 1 的境界
SELECT '=== 5. 角色 1 的境界 ===' AS info;
SELECT id, name, realm FROM game_role WHERE id = 1;

-- 13. 确保角色 1 的境界为"凡人"
UPDATE game_role SET realm = '凡人' WHERE id = 1 AND (realm IS NULL OR realm = '' OR realm = '无');

-- 14. 验证角色境界
SELECT '=== 6. 更新后的角色境界 ===' AS info;
SELECT id, name, realm FROM game_role WHERE id = 1;

-- 15. 测试突破所需的修为需求
SELECT '=== 7. 测试数据 ===' AS info;
SELECT 
    g.id AS role_id,
    g.name AS role_name,
    g.realm AS current_realm,
    rr_xiuwei.quantity AS current_xiuwei,
    100 AS required_xiuwei,
    CASE 
        WHEN rr_xiuwei.quantity >= 100 THEN '✅ 可以突破'
        ELSE '❌ 修为不足'
    END AS breakthrough_status
FROM game_role g
LEFT JOIN role_resource rr_xiuwei ON g.id = rr_xiuwei.role_id 
    AND rr_xiuwei.resource_type_id = (SELECT id FROM resource_type WHERE code = 'xiuwei')
WHERE g.id = 1;

SELECT '✅ 数据库修复完成！请重启后端服务并刷新页面。' AS message;
