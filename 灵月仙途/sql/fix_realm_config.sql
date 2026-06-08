-- 灵月仙途 - 修复境界配置数据
-- 用于确保境界突破配置正确

-- 1. 检查现有配置
SELECT '=== 现有境界突破配置 ===' AS info;
SELECT * FROM realm_breakthrough ORDER BY id;

-- 2. 如果配置表为空或没有"凡人"的配置，插入完整数据
INSERT INTO realm_breakthrough (from_realm, to_realm, xiuwei_requirement, success_rate_base, description, sort_order)
VALUES 
('凡人', '炼气期', 100, 95.0, '从凡人踏入炼气期，开启修仙之路', 1),
('炼气期', '筑基期', 500, 90.0, '炼气化神，铸就道基', 2),
('筑基期', '金丹期', 2000, 80.0, '凝气成丹，大道可期', 3),
('金丹期', '元婴期', 10000, 70.0, '丹破婴生，神通初显', 4),
('元婴期', '化神期', 50000, 60.0, '婴变神游，通天达地', 5),
('化神期', '炼虚期', 200000, 50.0, '神念化虚，接近大乘', 6),
('炼虚期', '合体期', 1000000, 40.0, '虚实合一，肉身成圣', 7),
('合体期', '大乘期', 5000000, 30.0, '圆满无漏，大乘之境', 8),
('大乘期', '渡劫期', 20000000, 20.0, '历经天劫，超脱凡俗', 9),
('渡劫期', '真仙', 100000000, 10.0, '渡过天劫，成就真仙', 10)
ON DUPLICATE KEY UPDATE from_realm = from_realm;

-- 3. 验证插入结果
SELECT '=== 更新后的境界突破配置 ===' AS info;
SELECT * FROM realm_breakthrough ORDER BY sort_order;

-- 4. 检查角色 45 的境界
SELECT '=== 角色 45 当前境界 ===' AS info;
SELECT id, name, realm FROM game_role WHERE id = 45;

-- 5. 如果角色 45 的境界是"无"或 NULL，更新为"凡人"
UPDATE game_role SET realm = '凡人' WHERE id = 45 AND (realm IS NULL OR realm = '无');

-- 6. 再次验证
SELECT '=== 更新后的角色 45 ===' AS info;
SELECT id, name, realm FROM game_role WHERE id = 45;
