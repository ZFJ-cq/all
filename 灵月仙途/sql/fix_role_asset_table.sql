-- 直接修复数据库中的 role_asset 表
USE lingyuexiantu;

-- 1. 检查当前表结构
SELECT '当前 role_asset 表结构:' AS info;
SHOW COLUMNS FROM role_asset;

-- 2. 添加 asset_type_code 字段（如果不存在）
ALTER TABLE role_asset ADD COLUMN IF NOT EXISTS asset_type_code VARCHAR(50) AFTER role_id COMMENT '资产类型代码';

-- 3. 从 asset_types 表复制数据到 asset_type_code
-- 假设原来有 asset_type_id 字段
UPDATE role_asset ra
INNER JOIN asset_types at ON ra.asset_type_id = at.id
SET ra.asset_type_code = at.code
WHERE ra.asset_type_code IS NULL OR ra.asset_type_code = '';

-- 4. 如果没有 asset_type_id 字段，尝试从其他字段恢复
-- 检查是否有 asset_id 字段
SELECT '检查 asset_id 字段:' AS info;
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lingyuexiantu' 
AND TABLE_NAME = 'role_asset' 
AND COLUMN_NAME = 'asset_id';

-- 5. 删除重复数据，保留每个角色每种资产类型的一条记录
DELETE ra1 FROM role_asset ra1
INNER JOIN role_asset ra2 
WHERE ra1.id > ra2.id 
AND ra1.role_id = ra2.role_id 
AND ra1.asset_type_code = ra2.asset_type_code;

-- 6. 添加索引
ALTER TABLE role_asset ADD INDEX IF NOT EXISTS idx_role_code (role_id, asset_type_code);

-- 7. 验证修复结果
SELECT '修复后的数据:' AS info;
SELECT ra.id, ra.role_id, ra.asset_type_code, ra.quantity, at.name as asset_name
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1
ORDER BY ra.asset_type_code;

-- 8. 统计
SELECT '统计信息:' AS info;
SELECT asset_type_code, COUNT(*) as count
FROM role_asset
WHERE asset_type_code IS NOT NULL AND asset_type_code != ''
GROUP BY asset_type_code;

SELECT '空 asset_type_code 的记录数:' AS info;
SELECT COUNT(*) as null_count
FROM role_asset
WHERE asset_type_code IS NULL OR asset_type_code = '';
