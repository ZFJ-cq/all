-- ============================================
-- 签到奖励修复 - 数据库初始化脚本
-- ============================================

USE lingyuexiantu;

-- ============================================
-- 1. 确保资产类型存在
-- ============================================

INSERT INTO asset_type (code, name, type, category, unit_of_measure, status, created_at, updated_at)
VALUES 
    ('LINGSHI', '灵石', 'CURRENCY', 'CURRENCY', '个', 'ACTIVE', NOW(), NOW()),
    ('XIUWEI', '修为', 'VIRTUAL', 'CULTIVATION', '点', 'ACTIVE', NOW(), NOW()),
    ('HUNSHI', '魂石', 'VIRTUAL', 'CULTIVATION', '点', 'ACTIVE', NOW(), NOW()),
    ('SHOUMING', '寿命', 'VIRTUAL', 'CULTIVATION', '年', 'ACTIVE', NOW(), NOW()),
    ('XIANSHI', '仙石', 'CURRENCY', 'CURRENCY', '个', 'ACTIVE', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
    name = VALUES(name),
    type = VALUES(type),
    category = VALUES(category),
    unit_of_measure = VALUES(unit_of_measure),
    status = VALUES(status),
    updated_at = NOW();

-- ============================================
-- 2. 验证资产类型已创建
-- ============================================

SELECT '=== 资产类型列表 ===' AS info;
SELECT id, code, name, type, category, unit_of_measure, status 
FROM asset_type 
WHERE code IN ('LINGSHI', 'XIUWEI', 'HUNSHI', 'SHOUMING', 'XIANSHI')
ORDER BY code;

-- ============================================
-- 3. 为所有角色初始化资产记录 (可选)
-- ============================================

-- 获取所有角色 ID
SELECT '=== 现有角色列表 ===' AS info;
SELECT id, name, user_id FROM game_role WHERE is_deleted = 0;

-- 为每个角色初始化灵石资产 (如果没有的话)
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
SELECT 
    gr.id AS role_id,
    'LINGSHI' AS asset_type_code,
    5000 AS quantity,  -- 初始灵石数量
    NOW() AS created_at,
    NOW() AS updated_at
FROM game_role gr
WHERE gr.is_deleted = 0
  AND NOT EXISTS (
    SELECT 1 FROM role_asset ra 
    WHERE ra.role_id = gr.id AND ra.asset_type_code = 'LINGSHI'
  );

-- 为每个角色初始化修为资产 (如果没有的话)
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
SELECT 
    gr.id AS role_id,
    'XIUWEI' AS asset_type_code,
    1000 AS quantity,  -- 初始修为数量
    NOW() AS created_at,
    NOW() AS updated_at
FROM game_role gr
WHERE gr.is_deleted = 0
  AND NOT EXISTS (
    SELECT 1 FROM role_asset ra 
    WHERE ra.role_id = gr.id AND ra.asset_type_code = 'XIUWEI'
  );

-- 为每个角色初始化寿命资产 (如果没有的话)
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
SELECT 
    gr.id AS role_id,
    'SHOUMING' AS asset_type_code,
    100 AS quantity,  -- 初始寿命数量
    NOW() AS created_at,
    NOW() AS updated_at
FROM game_role gr
WHERE gr.is_deleted = 0
  AND NOT EXISTS (
    SELECT 1 FROM role_asset ra 
    WHERE ra.role_id = gr.id AND ra.asset_type_code = 'SHOUMING'
  );

-- ============================================
-- 4. 验证角色资产已创建
-- ============================================

SELECT '=== 角色资产验证 ===' AS info;
SELECT 
    gr.id AS role_id,
    gr.name AS role_name,
    at.code AS asset_type_code,
    at.name AS asset_type_name,
    ra.quantity,
    ra.created_at,
    ra.updated_at
FROM role_asset ra
INNER JOIN game_role gr ON ra.role_id = gr.id
INNER JOIN asset_type at ON ra.asset_type_code = at.code
WHERE at.code IN ('LINGSHI', 'XIUWEI', 'HUNSHI', 'SHOUMING', 'XIANSHI')
ORDER BY gr.id, at.code;

-- ============================================
-- 5. 测试签到奖励发放 (可选)
-- ============================================

-- 手动为角色 45 增加灵石 (模拟签到奖励)
UPDATE role_asset 
SET quantity = quantity + 100,
    updated_at = NOW()
WHERE role_id = 45 AND asset_type_code = 'LINGSHI';

-- 手动为角色 45 增加修为 (模拟签到奖励)
UPDATE role_asset 
SET quantity = quantity + 500,
    updated_at = NOW()
WHERE role_id = 45 AND asset_type_code = 'XIUWEI';

-- 验证更新结果
SELECT '=== 角色 45 签到奖励测试 ===' AS info;
SELECT 
    gr.id AS role_id,
    gr.name AS role_name,
    at.code AS asset_type_code,
    at.name AS asset_type_name,
    ra.quantity AS current_quantity
FROM role_asset ra
INNER JOIN game_role gr ON ra.role_id = gr.id
INNER JOIN asset_type at ON ra.asset_type_code = at.code
WHERE gr.id = 45
ORDER BY at.code;

-- ============================================
-- 6. 清理旧资源系统数据 (可选，谨慎操作)
-- ============================================

-- 查看旧资源系统中的数据
SELECT '=== 旧资源系统数据 (仅供参考) ===' AS info;
SELECT 
    rr.role_id,
    rt.code AS resource_code,
    rt.name AS resource_name,
    rr.quantity
FROM role_resource rr
LEFT JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 45
ORDER BY rt.code;

-- 注意：不要删除旧数据，保持向后兼容性
-- 如果需要迁移数据，可以执行以下操作 (谨慎！):
-- INSERT INTO role_asset ... SELECT FROM role_resource ...

-- ============================================
-- 7. 最终验证查询
-- ============================================

SELECT '=== 最终验证：角色 45 的资产状况 ===' AS info;
SELECT 
    '灵石' AS asset_name,
    (SELECT quantity FROM role_asset WHERE role_id = 45 AND asset_type_code = 'LINGSHI') AS quantity
UNION ALL
SELECT 
    '修为' AS asset_name,
    (SELECT quantity FROM role_asset WHERE role_id = 45 AND asset_type_code = 'XIUWEI') AS quantity
UNION ALL
SELECT 
    '寿命' AS asset_name,
    (SELECT quantity FROM role_asset WHERE role_id = 45 AND asset_type_code = 'SHOUMING') AS quantity
UNION ALL
SELECT 
    '魂石' AS asset_name,
    (SELECT quantity FROM role_asset WHERE role_id = 45 AND asset_type_code = 'HUNSHI') AS quantity
UNION ALL
SELECT 
    '仙石' AS asset_name,
    (SELECT quantity FROM role_asset WHERE role_id = 45 AND asset_type_code = 'XIANSHI') AS quantity;

SELECT '=== 数据库初始化完成 ===' AS info;
