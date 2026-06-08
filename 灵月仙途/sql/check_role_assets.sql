-- ============================================
-- 灵月仙途 - 检查角色资源数据
-- ============================================

USE lingyuexiantu;

-- 1. 检查 asset_types 表（资源类型）
SELECT '=== 1. 资源类型表 (asset_types) ===' AS info;
SELECT id, code, name, type, category, unit_of_measure FROM asset_types ORDER BY id;

-- 2. 检查 role_asset 表（角色资源）
SELECT '=== 2. 角色资源表 (role_asset) ===' AS info;
SELECT * FROM role_asset WHERE role_id = 45 ORDER BY id;

-- 3. 检查是否有修为相关的资源类型
SELECT '=== 3. 查找修为相关资源类型 ===' AS info;
SELECT id, code, name, type, category 
FROM asset_types 
WHERE code LIKE '%xiuwei%' OR name LIKE '%修为%' OR code LIKE '%cultivation%';

-- 4. 检查 role_resource 表（旧的资源表）
SELECT '=== 4. 旧资源表 (role_resource) ===' AS info;
SELECT rr.*, rt.code as resource_code, rt.name as resource_name
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45;

-- 5. 检查 resource_type 表
SELECT '=== 5. 旧资源类型表 (resource_type) ===' AS info;
SELECT * FROM resource_type ORDER BY id;

-- 6. 如果 role_asset 表没有角色 45 的数据，插入测试数据
SELECT '=== 6. 插入角色 45 的测试资源 ===' AS info;

-- 首先找到修为对应的 asset_type_code
SELECT '查找修为的 asset_type_code:' AS info;
SELECT code, name, type, category FROM asset_types WHERE code = 'XIUXIUWEI' OR code = 'XIUYUAN';

-- 插入修为资源（假设修为的 asset_type_code 是 'XIUXIUWEI'）
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
SELECT 
    45 AS role_id,
    'XIUXIUWEI' AS asset_type_code,  -- 需要根据实际表结构调整
    1680 AS quantity,
    NOW() AS created_at,
    NOW() AS updated_at
WHERE NOT EXISTS (
    SELECT 1 FROM role_asset WHERE role_id = 45 AND asset_type_code = 'XIUXIUWEI'
);

-- 插入灵石资源
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
SELECT 
    45 AS role_id,
    'LINGSHI' AS asset_type_code,
    5000 AS quantity,
    NOW() AS created_at,
    NOW() AS updated_at
WHERE NOT EXISTS (
    SELECT 1 FROM role_asset WHERE role_id = 45 AND asset_type_code = 'LINGSHI'
);

-- 7. 验证插入结果
SELECT '=== 7. 验证插入结果 ===' AS info;
SELECT ra.*, at.name as asset_type_name, at.code as asset_type_code
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 45
ORDER BY ra.id;
