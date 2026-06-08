-- 检查 asset_types 表的修为资源
USE lingyuexiantu;

SELECT id, code, name, type, category 
FROM asset_types 
WHERE code LIKE '%XIU%' OR name LIKE '%修%' OR name LIKE '%为%';
