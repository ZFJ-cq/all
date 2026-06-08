-- 检查 asset_types 表中的修为资源
USE lingyuexiantu;

-- 1. 查看所有修为相关的资源类型
SELECT '=== 修为相关的资源类型 ===' AS info;
SELECT id, code, name, type, category
FROM asset_types
WHERE code LIKE '%XIU%' OR name LIKE '%修%' OR name LIKE '%为%';

-- 2. 查看 role_asset 表中修为相关的数据
SELECT '=== role_asset 表中的修为数据 ===' AS info;
SELECT ra.id, ra.role_id, ra.asset_type_code, ra.quantity, at.code as at_code, at.name as at_name
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1 AND (ra.asset_type_code LIKE '%XIU%' OR at.name LIKE '%修%');

-- 3. 清理重复数据，保留 XIUXIUWEI
SELECT '=== 清理重复数据 ===' AS info;

-- 删除 XIUWEI 的记录（保留 XIUXIUWEI）
DELETE FROM role_asset
WHERE role_id = 1 AND asset_type_code = 'XIUWEI';

-- 4. 验证清理结果
SELECT '=== 清理后的结果 ===' AS info;
SELECT ra.id, ra.role_id, ra.asset_type_code, ra.quantity, at.name as asset_name
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1
ORDER BY ra.asset_type_code;

SELECT '=== 完成 ===' AS info;
