-- 为角色 45 初始化修为资源
-- 在 MySQL 中执行：mysql -u root -p12345678 lingyuexiantu < fix_role_45_xiuwei.sql

-- 1. 确保 resource_type 表中有修为类型
INSERT INTO resource_type (code, name, description, unit, icon, created_at)
VALUES ('xiuwei', '修为', '修炼经验值', '点', '✨', NOW())
ON DUPLICATE KEY UPDATE code = code;

-- 2. 为角色 45 初始化修为资源（如果不存在）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    45 as role_id,
    rt.id as resource_type_id,
    0 as quantity,
    NOW() as create_time,
    NOW() as update_time
FROM resource_type rt
WHERE rt.code = 'xiuwei'
AND NOT EXISTS (
    SELECT 1 FROM role_resource rr 
    WHERE rr.role_id = 45 AND rr.resource_type_id = rt.id
);

-- 3. 验证数据
SELECT '=== 资源类型 ===' AS info;
SELECT * FROM resource_type WHERE code IN ('xiuwei', 'lingshi');

SELECT '=== 角色 45 资源 ===' AS info;
SELECT rr.*, rt.code, rt.name
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45;

-- 4. 给角色 45 添加一些初始修为（用于测试）
UPDATE role_resource rr
INNER JOIN resource_type rt ON rr.resource_type_id = rt.id
SET rr.quantity = 100, rr.update_time = NOW()
WHERE rr.role_id = 45 AND rt.code = 'xiuwei';

-- 5. 再次验证
SELECT '=== 更新后的角色 45 资源 ===' AS info;
SELECT rr.*, rt.code, rt.name
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45;
