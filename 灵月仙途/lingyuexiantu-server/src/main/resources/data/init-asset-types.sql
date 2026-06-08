-- ============================================
-- 灵月仙途 - 资产类型和角色资产初始化脚本
-- ============================================

-- 1. 具体资产类型数据
INSERT INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `unit_of_measure`, `decimal_precision`, `is_system`)
VALUES 
('LINGSHI', '灵石', 'CURRENCY', '货币', '修仙世界的通用货币', '个', 0, 1),
('XIANSHI', '仙石', 'CURRENCY', '货币', '仙界通用货币，蕴含强大灵气', '个', 0, 1),
('SHOUMING', '寿命', 'SPECIAL', '属性', '角色的寿命值，影响修炼和活动', '年', 0, 1),
('XIUWEI', '修为', 'SPECIAL', '属性', '角色的修炼程度', '点', 0, 1),
('XIANLI', '仙力', 'SPECIAL', '属性', '角色的仙力值', '点', 0, 1),
('HUNSHI', '魂石', 'MATERIAL', '材料', '蕴含灵魂之力的石头', '个', 0, 1),
('LINGQI', '灵气', 'SPECIAL', '属性', '角色的灵气值', '点', 0, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. 为每个角色添加初始资产
-- 先获取所有角色ID
INSERT INTO `role_assets` (`role_id`, `asset_type_id`, `quantity`)
SELECT 
    gr.id AS role_id,
    at.id AS asset_type_id,
    CASE 
        WHEN at.code = 'LINGSHI' THEN 0
        WHEN at.code = 'XIANSHI' THEN 0
        WHEN at.code = 'SHOUMING' THEN 100
        WHEN at.code = 'XIUWEI' THEN 0
        WHEN at.code = 'XIANLI' THEN 0
        WHEN at.code = 'HUNSHI' THEN 0
        WHEN at.code = 'LINGQI' THEN 0
        ELSE 0
    END AS quantity
FROM 
    game_role gr,
    asset_types at
WHERE 
    at.code IN ('LINGSHI', 'XIANSHI', 'SHOUMING', 'XIUWEI', 'XIANLI', 'HUNSHI', 'LINGQI')
    AND NOT EXISTS (
        SELECT 1 FROM role_assets ra 
        WHERE ra.role_id = gr.id AND ra.asset_type_id = at.id
    )
ON DUPLICATE KEY UPDATE quantity = VALUES(quantity);

SELECT '✅ 资产类型和角色资产初始化完成！' AS message;