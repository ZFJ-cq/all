-- ============================================
-- 灵月仙途 - 排行榜测试数据快速插入脚本
-- 执行方式：直接在数据库管理工具中执行
-- ============================================

-- 1. 插入更多游戏角色用于测试排行榜
-- 角色1 - 练气期
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '道玄真人', 1, '金灵根', '练气期', 15, 1500, 800, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 角色2 - 筑基期
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '普泓大师', 1, '木灵根', '筑基期', 35, 3500, 1800, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 角色3 - 金丹期
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '云易岚', 1, '水灵根', '金丹期', 65, 6500, 3300, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 角色4 - 元婴期
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '鬼王', 1, '火灵根', '元婴期', 85, 8500, 4300, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 角色5 - 化神期
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '三妙仙子', 2, '土灵根', '化神期', 105, 10500, 5300, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 角色6 - 合体期
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '陆雪琪', 2, '水灵根', '合体期', 125, 12500, 6300, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 角色7 - 大乘期
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '张小凡', 1, '金土双灵根', '大乘期', 145, 14500, 7300, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 角色8 - 渡劫期
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '碧瑶', 2, '木灵根', '渡劫期', 165, 16500, 8300, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 角色9 - 仙人
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '青叶祖师', 1, '全灵根', '仙人', 200, 50000, 25000, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 角色10 - 练气期（富有的角色）
INSERT INTO game_role (user_id, role_name, gender, spirit_root, realm, level, hp, mp, status, create_time)
VALUES (1, '富甲天下', 1, '土灵根', '练气期', 10, 1000, 500, 1, NOW())
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 2. 为角色添加灵石资源（用于财富榜测试）
-- 获取刚刚插入的角色ID并添加灵石
-- 注意：这里假设 resource_type 表中已有 code 为 'lingshi' 的资源类型

-- 为角色1添加 10000 灵石
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '道玄真人' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    10000,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 10000, update_time = NOW();

-- 为角色2添加 25000 灵石
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '普泓大师' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    25000,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 25000, update_time = NOW();

-- 为角色3添加 50000 灵石
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '云易岚' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    50000,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 50000, update_time = NOW();

-- 为角色4添加 75000 灵石
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '鬼王' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    75000,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 75000, update_time = NOW();

-- 为角色5添加 100000 灵石
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '三妙仙子' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    100000,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 100000, update_time = NOW();

-- 为角色6添加 150000 灵石
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '陆雪琪' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    150000,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 150000, update_time = NOW();

-- 为角色7添加 200000 灵石
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '张小凡' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    200000,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 200000, update_time = NOW();

-- 为角色8添加 300000 灵石
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '碧瑶' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    300000,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 300000, update_time = NOW();

-- 为角色9添加 500000 灵石（最高）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '青叶祖师' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    500000,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 500000, update_time = NOW();

-- 为角色10添加 999999 灵石（超级富豪）
INSERT INTO role_resource (role_id, resource_type_id, quantity, create_time, update_time)
SELECT 
    (SELECT id FROM game_role WHERE role_name = '富甲天下' LIMIT 1),
    (SELECT id FROM resource_type WHERE code = 'lingshi' LIMIT 1),
    999999,
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM resource_type WHERE code = 'lingshi')
ON DUPLICATE KEY UPDATE quantity = 999999, update_time = NOW();

-- 3. 验证插入结果
SELECT '✅ 排行榜测试数据插入完成！' AS message;

SELECT 
    '游戏角色数量' AS stat_name,
    COUNT(*) AS stat_value
FROM game_role 
WHERE status = 1

UNION ALL

SELECT 
    '资源类型数量' AS stat_name,
    COUNT(*) AS stat_value
FROM resource_type

UNION ALL

SELECT 
    '角色资源记录数' AS stat_name,
    COUNT(*) AS stat_value
FROM role_resource;

-- 显示所有测试角色
SELECT 
    id,
    role_name,
    realm,
    level,
    spirit_root,
    hp,
    mp
FROM game_role 
WHERE status = 1 
ORDER BY level DESC;
