-- ============================================
-- 灵月仙途 - 修复 resource_type 表（后端使用的表）
-- ============================================

USE lingyuexiantu;

-- 1. 检查 resource_type 表
SELECT '=== 1. resource_type 表当前数据 ===' AS info;
SELECT id, code, name, description, unit FROM resource_type ORDER BY id;

-- 2. 查找修为相关资源
SELECT '=== 2. 查找修为相关资源 ===' AS info;
SELECT * FROM resource_type WHERE code LIKE '%xiu%' OR code LIKE '%XIU%' OR name LIKE '%修%' OR name LIKE '%为%';

-- 3. 插入修为资源（如果不存在）
INSERT INTO resource_type (code, name, description, unit)
SELECT 'xiuwei', '修为', '修炼经验值', '点'
WHERE NOT EXISTS (SELECT 1 FROM resource_type WHERE code = 'xiuwei');

-- 4. 插入灵石资源（如果不存在）
INSERT INTO resource_type (code, name, description, unit)
SELECT 'lingshi', '灵石', '游戏通用货币', '个'
WHERE NOT EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi');

-- 5. 插入筑基丹资源（如果不存在）
INSERT INTO resource_type (code, name, description, unit)
SELECT 'zhujidan', '筑基丹', '突破丹药', '颗'
WHERE NOT EXISTS (SELECT 1 FROM resource_type WHERE code = 'zhujidan');

-- 6. 验证插入结果
SELECT '=== 3. 插入后的 resource_type 表 ===' AS info;
SELECT id, code, name, description, unit 
FROM resource_type 
WHERE code IN ('xiuwei', 'lingshi', 'zhujidan')
ORDER BY id;

-- 7. 检查 role_resource 表（后端使用的表）
SELECT '=== 4. role_resource 表结构 ===' AS info;
DESC role_resource;

-- 8. 检查角色 1 的现有资源（role_resource 表）
SELECT '=== 5. 角色 1 的现有资源 (role_resource) ===' AS info;
SELECT rr.*, rt.code, rt.name 
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 1;

-- 9. 删除角色 1 的旧资源
DELETE FROM role_resource WHERE role_id = 1;

-- 10. 插入角色 1 的修为资源
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    1 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'xiuwei') AS resource_type_id,
    1680 AS quantity,
    NOW() AS create_time,
    NOW() AS update_time;

-- 11. 插入角色 1 的灵石资源
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    1 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'lingshi') AS resource_type_id,
    5000 AS quantity,
    NOW() AS create_time,
    NOW() AS update_time;

-- 12. 插入角色 1 的筑基丹资源
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    1 AS role_id,
    (SELECT id FROM resource_type WHERE code = 'zhujidan') AS resource_type_id,
    10 AS quantity,
    NOW() AS create_time,
    NOW() AS update_time;

-- 13. 验证插入结果
SELECT '=== 6. 角色 1 的最终资源 (role_resource) ===' AS info;
SELECT rr.id, rr.role_id, rr.resource_type_id, rt.code, rt.name, rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 1
ORDER BY rr.id;

SELECT '✅ 修复完成！请刷新修炼页面验证。' AS message;
