-- 修复 role_asset 表中的 asset_type_code 字段数据
USE lingyuexiantu;

-- 1. 查看当前数据结构
SELECT '=== 当前 role_asset 表前 10 条数据 ===' AS info;
SELECT id, role_id, asset_id, asset_type_code, quantity, asset_name, asset_type
FROM role_asset
WHERE role_id = 1
LIMIT 10;

-- 2. 查看 asset_type_code 为 NULL 的数据
SELECT '=== asset_type_code 为 NULL 的数据 ===' AS info;
SELECT COUNT(*) as null_count
FROM role_asset
WHERE asset_type_code IS NULL OR asset_type_code = '';

-- 3. 查看 asset_id 是否有值
SELECT '=== 检查 asset_id 是否有值 ===' AS info;
SELECT COUNT(*) as has_asset_id
FROM role_asset
WHERE asset_id IS NOT NULL AND asset_type_code IS NULL;

-- 4. 关键修复：从 asset_types 表复制数据到 asset_type_code
-- 通过 asset_id 关联
SELECT '=== 开始修复数据 ===' AS info;

UPDATE role_asset ra
INNER JOIN asset_types at ON ra.asset_id = at.id
SET ra.asset_type_code = at.code
WHERE (ra.asset_type_code IS NULL OR ra.asset_type_code = '')
AND ra.asset_id IS NOT NULL;

SELECT '=== 修复完成，检查结果 ===' AS info;

-- 5. 检查修复后的数据
SELECT ra.id, ra.role_id, ra.asset_id, ra.asset_type_code, ra.quantity, at.name as asset_type_name
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1
ORDER BY ra.asset_type_code;

-- 6. 再次检查是否还有 NULL 值
SELECT '=== 剩余的 NULL 值统计 ===' AS info;
SELECT COUNT(*) as remaining_nulls
FROM role_asset
WHERE asset_type_code IS NULL OR asset_type_code = '';

-- 7. 如果还有 NULL 值且 asset_id 也为 NULL，尝试从 asset_name 恢复
SELECT '=== 尝试从 asset_name 恢复 ===' AS info;

UPDATE role_asset ra
INNER JOIN asset_types at ON ra.asset_name = at.name
SET ra.asset_type_code = at.code
WHERE (ra.asset_type_code IS NULL OR ra.asset_type_code = '')
AND ra.asset_id IS NULL;

-- 8. 最终检查
SELECT '=== 最终结果 ===' AS info;
SELECT ra.id, ra.role_id, ra.asset_type_code, ra.quantity, at.name as asset_name
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1
ORDER BY ra.id;

SELECT '=== 修复完成 ===' AS info;
