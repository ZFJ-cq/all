-- 修复 role_asset 表中的 asset_type_code 字段
USE lingyuexiantu;

-- 1. 检查当前表结构
SELECT '当前 role_asset 表结构:' AS info;
SHOW COLUMNS FROM role_asset;

-- 2. 检查 asset_type_code 字段是否存在
SELECT '检查 asset_type_code 字段:' AS info;
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lingyuexiantu' 
AND TABLE_NAME = 'role_asset' 
AND COLUMN_NAME = 'asset_type_code';

-- 3. 如果字段不存在，添加字段（使用存储过程绕过 IF NOT EXISTS 限制）
SET @dbname = DATABASE();
SET @tablename = 'role_asset';
SET @columnname = 'asset_type_code';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (column_name = @columnname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) AFTER role_id COMMENT \'资产类型代码\'')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- 4. 检查是否有 asset_type_id 字段
SELECT '检查 asset_type_id 字段:' AS info;
SELECT COLUMN_NAME 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'lingyuexiantu' 
AND TABLE_NAME = 'role_asset' 
AND COLUMN_NAME = 'asset_type_id';

-- 5. 如果有 asset_type_id 字段，从 asset_types 表复制数据到 asset_type_code
UPDATE role_asset ra
INNER JOIN asset_types at ON ra.asset_type_id = at.id
SET ra.asset_type_code = at.code
WHERE (ra.asset_type_code IS NULL OR ra.asset_type_code = '') AND ra.asset_type_id IS NOT NULL;

-- 6. 如果没有 asset_type_id 字段，尝试从其他字段恢复（根据实际情况调整）
-- 这一步需要根据实际情况来定，暂时跳过

-- 7. 删除重复数据，保留每个角色每种资产类型的一条记录
DELETE ra1 FROM role_asset ra1
INNER JOIN role_asset ra2 
WHERE ra1.id > ra2.id 
AND ra1.role_id = ra2.role_id 
AND ra1.asset_type_code = ra2.asset_type_code;

-- 8. 添加索引（如果不存在）
SET @dbname = DATABASE();
SET @tablename = 'role_asset';
SET @indexname = 'idx_role_code';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (table_name = @tablename)
      AND (table_schema = @dbname)
      AND (index_name = @indexname)
  ) > 0,
  'SELECT 1',
  CONCAT('ALTER TABLE ', @tablename, ' ADD INDEX ', @indexname, ' (role_id, asset_type_code)')
));
PREPARE alterIndex FROM @preparedStatement;
EXECUTE alterIndex;
DEALLOCATE PREPARE alterIndex;

-- 9. 验证修复结果
SELECT '修复后的数据:' AS info;
SELECT ra.id, ra.role_id, ra.asset_type_code, ra.quantity, at.name as asset_name
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1
ORDER BY ra.asset_type_code;

-- 10. 统计信息
SELECT '统计信息:' AS info;
SELECT asset_type_code, COUNT(*) as count
FROM role_asset
WHERE asset_type_code IS NOT NULL AND asset_type_code != ''
GROUP BY asset_type_code;

SELECT '空 asset_type_code 的记录数:' AS info;
SELECT COUNT(*) as null_count
FROM role_asset
WHERE asset_type_code IS NULL OR asset_type_code = '';

SELECT '修复完成！' AS info;
