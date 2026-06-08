-- 修复 role_asset 表中的 asset_type_code 字段
USE lingyuexiantu;

-- 1. 显示当前表结构
SELECT '=== 当前 role_asset 表结构 ===' AS info;
SHOW COLUMNS FROM role_asset;

-- 2. 检查 asset_type_code 字段是否存在
SELECT '=== 检查 asset_type_code 字段 ===' AS info;
SELECT COLUMN_NAME, DATA_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lingyuexiantu' 
AND TABLE_NAME = 'role_asset' 
AND COLUMN_NAME = 'asset_type_code';

-- 3. 添加 asset_type_code 字段（如果不存在）
-- 注意：MySQL 不支持 IF NOT EXISTS，需要手动检查
-- 如果上面查询返回空，执行以下语句：
ALTER TABLE role_asset ADD COLUMN asset_type_code VARCHAR(50) AFTER role_id;

-- 4. 检查是否有 asset_type_id 字段
SELECT '=== 检查 asset_type_id 字段 ===' AS info;
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lingyuexiantu' 
AND TABLE_NAME = 'role_asset' 
AND COLUMN_NAME = 'asset_type_id';

-- 5. 从 asset_types 表复制数据到 asset_type_code
UPDATE role_asset ra
INNER JOIN asset_types at ON ra.asset_type_id = at.id
SET ra.asset_type_code = at.code
WHERE ra.asset_type_code IS NULL AND ra.asset_type_id IS NOT NULL;

-- 6. 显示更新后的数据
SELECT '=== 更新后的数据 ===' AS info;
SELECT ra.id, ra.role_id, ra.asset_type_code, ra.quantity, at.name as asset_name
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1
ORDER BY ra.asset_type_code;

-- 7. 统计空值
SELECT '=== 空 asset_type_code 统计 ===' AS info;
SELECT COUNT(*) as null_count
FROM role_asset
WHERE asset_type_code IS NULL OR asset_type_code = '';

-- 8. 添加索引
ALTER TABLE role_asset ADD INDEX idx_role_code (role_id, asset_type_code);

SELECT '=== 修复完成 ===' AS info;
