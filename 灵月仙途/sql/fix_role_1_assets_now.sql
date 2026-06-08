-- ============================================
-- 灵月仙途 - 直接修复角色 1 的资源数据
-- 立即执行此脚本
-- ============================================

USE lingyuexiantu;

-- 1. 检查当前有哪些角色有资源
SELECT '=== 1. 当前有资源的角色 ===' AS info;
SELECT DISTINCT role_id FROM role_asset ORDER BY role_id;

-- 2. 检查角色 1 的资源
SELECT '=== 2. 角色 1 的现有资源 ===' AS info;
SELECT ra.*, at.name as asset_type_name, at.code as asset_type_code
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1
ORDER BY ra.id;

-- 3. 检查 asset_types 表是否有必要的资源类型
SELECT '=== 3. 检查资源类型 ===' AS info;
SELECT id, code, name, type, category FROM asset_types 
WHERE code IN ('XIUXIUWEI', 'LINGSHI', 'ZHUJIDAN') OR code LIKE '%XIU%' OR name LIKE '%修%';

-- 4. 如果没有修为资源类型，插入
INSERT INTO asset_types (code, name, type, category, unit_of_measure, status, created_at, updated_at)
SELECT 'XIUXIUWEI', '修为', 'VIRTUAL', 'CULTIVATION', '点', 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM asset_types WHERE code = 'XIUXIUWEI');

-- 5. 如果没有灵石资源类型，插入
INSERT INTO asset_types (code, name, type, category, unit_of_measure, status, created_at, updated_at)
SELECT 'LINGSHI', '灵石', 'CURRENCY', 'CURRENCY', '个', 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM asset_types WHERE code = 'LINGSHI');

-- 6. 如果没有筑基丹资源类型，插入
INSERT INTO asset_types (code, name, type, category, unit_of_measure, status, created_at, updated_at)
SELECT 'ZHUJIDAN', '筑基丹', 'ITEM', 'CONSUMABLE', '颗', 'ACTIVE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM asset_types WHERE code = 'ZHUJIDAN');

-- 7. 验证资源类型已插入
SELECT '=== 4. 插入后的资源类型 ===' AS info;
SELECT id, code, name FROM asset_types 
WHERE code IN ('XIUXIUWEI', 'LINGSHI', 'ZHUJIDAN')
ORDER BY id;

-- 8. 删除角色 1 的旧资源（如果有）
DELETE FROM role_asset WHERE role_id = 1;

-- 9. 插入角色 1 的修为资源
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
VALUES (1, 'XIUXIUWEI', 1680, NOW(), NOW());

-- 10. 插入角色 1 的灵石资源
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
VALUES (1, 'LINGSHI', 5000, NOW(), NOW());

-- 11. 插入角色 1 的筑基丹资源
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
VALUES (1, 'ZHUJIDAN', 10, NOW(), NOW());

-- 12. 验证插入结果
SELECT '=== 5. 角色 1 的最终资源 ===' AS info;
SELECT ra.id, ra.role_id, ra.asset_type_code, at.name as asset_name, ra.quantity, ra.created_at
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 1
ORDER BY ra.id;

-- 13. 同时插入角色 45 的资源（备用）
DELETE FROM role_asset WHERE role_id = 45;

INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
VALUES 
(45, 'XIUXIUWEI', 1680, NOW(), NOW()),
(45, 'LINGSHI', 5000, NOW(), NOW()),
(45, 'ZHUJIDAN', 10, NOW(), NOW());

SELECT '=== 6. 角色 45 的资源 ===' AS info;
SELECT ra.role_id, ra.asset_type_code, at.name as asset_name, ra.quantity
FROM role_asset ra
LEFT JOIN asset_types at ON ra.asset_type_code = at.code
WHERE ra.role_id = 45
ORDER BY ra.id;

SELECT '✅ 修复完成！请刷新修炼页面验证。' AS message;
