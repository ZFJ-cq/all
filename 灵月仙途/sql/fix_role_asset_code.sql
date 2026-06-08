-- 修复 role_asset 表中的 asset_type_code 字段
USE lingyuexiantu;

-- 检查表结构
SHOW COLUMNS FROM role_asset;

-- 如果存在 asset_type_id 字段，添加 asset_type_code 字段并迁移数据
ALTER TABLE role_asset ADD COLUMN IF NOT EXISTS asset_type_code VARCHAR(50) AFTER role_id;

-- 从 asset_types 表复制 code 到 asset_type_code
UPDATE role_asset ra
JOIN asset_types at ON ra.asset_type_id = at.id
SET ra.asset_type_code = at.code
WHERE ra.asset_type_code IS NULL AND ra.asset_type_id IS NOT NULL;

-- 删除旧的 asset_type_id 字段（如果有）
ALTER TABLE role_asset DROP COLUMN IF EXISTS asset_type_id;

-- 添加索引
CREATE INDEX IF NOT EXISTS idx_role_asset_code ON role_asset(role_id, asset_type_code);

-- 验证修复结果
SELECT ra.id, ra.role_id, ra.asset_type_code, ra.quantity, at.name as asset_name
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1;
