-- ============================================
-- 灵月仙途 - 修复角色资产数据（使用 asset_types 表）
-- ============================================

USE lingyuexiantu;

-- 1. 检查 asset_types 表
SELECT '=== 1. 当前资源类型 (asset_types) ===' AS info;
SELECT id, code, name, type, category, unit_of_measure 
FROM asset_types 
ORDER BY id;

-- 2. 查找修为相关的资源类型
SELECT '=== 2. 查找修为相关资源 ===' AS info;
SELECT id, code, name, type, category, unit_of_measure 
FROM asset_types 
WHERE code LIKE '%XIU%' OR code LIKE '%CULTIVATION%' OR name LIKE '%修%' OR name LIKE '%为%';

-- 3. 如果不存在修为资源类型，插入
INSERT INTO asset_types (code, name, type, category, unit_of_measure, status, created_at, updated_at)
SELECT * FROM (
  SELECT 'XIUXIUWEI' AS code, '修为' AS name, 'VIRTUAL' AS type, 'CULTIVATION' AS category, 
         '点' AS unit_of_measure, 'ACTIVE' AS status, NOW() AS created_at, NOW() AS updated_at
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM asset_types WHERE code = 'XIUXIUWEI');

-- 4. 如果不存在灵石资源类型，插入
INSERT INTO asset_types (code, name, type, category, unit_of_measure, status, created_at, updated_at)
SELECT * FROM (
  SELECT 'LINGSHI' AS code, '灵石' AS name, 'CURRENCY' AS type, 'CURRENCY' AS category,
         '个' AS unit_of_measure, 'ACTIVE' AS status, NOW() AS created_at, NOW() AS updated_at
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM asset_types WHERE code = 'LINGSHI');

-- 5. 如果不存在筑基丹资源类型，插入
INSERT INTO asset_types (code, name, type, category, unit_of_measure, status, created_at, updated_at)
SELECT * FROM (
  SELECT 'ZHUJIDAN' AS code, '筑基丹' AS name, 'ITEM' AS type, 'CONSUMABLE' AS category,
         '颗' AS unit_of_measure, 'ACTIVE' AS status, NOW() AS created_at, NOW() AS updated_at
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM asset_types WHERE code = 'ZHUJIDAN');

-- 6. 验证资源类型已插入
SELECT '=== 3. 插入后的资源类型 ===' AS info;
SELECT id, code, name, type, category, unit_of_measure 
FROM asset_types 
WHERE code IN ('XIUXIUWEI', 'LINGSHI', 'ZHUJIDAN')
ORDER BY id;

-- 7. 检查角色 45 的现有资产
SELECT '=== 4. 角色 45 的现有资产 ===' AS info;
SELECT ra.*, at.name as asset_type_name, at.code as asset_type_code
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 45
ORDER BY ra.id;

-- 8. 插入修为资源（如果不存在）
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
SELECT 
    45 AS role_id,
    'XIUXIUWEI' AS asset_type_code,
    1680 AS quantity,
    NOW() AS created_at,
    NOW() AS updated_at
WHERE NOT EXISTS (
    SELECT 1 FROM role_asset WHERE role_id = 45 AND asset_type_code = 'XIUXIUWEI'
);

-- 9. 插入灵石资源（如果不存在）
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

-- 10. 插入筑基丹资源（如果不存在）
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
SELECT 
    45 AS role_id,
    'ZHUJIDAN' AS asset_type_code,
    10 AS quantity,
    NOW() AS created_at,
    NOW() AS updated_at
WHERE NOT EXISTS (
    SELECT 1 FROM role_asset WHERE role_id = 45 AND asset_type_code = 'ZHUJIDAN'
);

-- 11. 验证插入结果
SELECT '=== 5. 插入后的角色 45 资产 ===' AS info;
SELECT ra.id, ra.role_id, ra.asset_type_code, at.name as asset_name, ra.quantity, ra.created_at
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 45
ORDER BY ra.asset_type_code;

-- 12. 最终验证查询
SELECT '=== 6. 最终验证 ===' AS info;
SELECT 
    ra.role_id,
    ra.asset_type_code,
    at.name as resource_name,
    ra.quantity,
    at.unit_of_measure as unit
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 45
ORDER BY ra.id;

SELECT '✅ 修复完成！请刷新修炼页面验证。' AS message;
