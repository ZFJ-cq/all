-- 初始化基础数据脚本
-- 用于在数据库中插入技能、任务、资产类型等基础数据

-- 插入技能数据
INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status, created_at, updated_at)
SELECT * FROM (
    SELECT '基础剑法' AS skill_name, '最基础的剑法招式' AS description, '攻击' AS skill_type, 
           1 AS skill_level, 12 AS max_level, 10 AS attack_bonus, 0 AS defense_bonus, 100 AS xiuwei_bonus, 
           0 AS spirit_power_bonus, 0 AS speed_bonus, 0 AS critical_bonus, 0 AS dodge_bonus, 1 AS status, 
           NOW() AS created_at, NOW() AS updated_at
    UNION ALL
    SELECT '烈火剑法', '蕴含火焰之力的剑法', '攻击', 2, 12, 25, 0, 200, 50, 0, 10, 0, 1, NOW(), NOW()
    UNION ALL
    SELECT '寒冰诀', '极寒内力凝聚成冰', '攻击', 3, 12, 30, 0, 250, 80, 0, 5, 0, 1, NOW(), NOW()
    UNION ALL
    SELECT '金刚护体', '强化肉身防御', '防御', 2, 12, 0, 20, 150, 0, 0, 0, 0, 1, NOW(), NOW()
    UNION ALL
    SELECT '太极护盾', '以柔克刚的防御功法', '防御', 4, 12, 0, 35, 300, 0, 0, 0, 10, 1, NOW(), NOW()
    UNION ALL
    SELECT '清风诀', '提升身法速度', '辅助', 2, 12, 5, 5, 180, 0, 50, 0, 20, 1, NOW(), NOW()
    UNION ALL
    SELECT '聚灵阵', '聚集天地灵气', '辅助', 3, 12, 0, 0, 500, 100, 0, 0, 0, 1, NOW(), NOW()
    UNION ALL
    SELECT '九转玄功', '上古修炼功法', '功法', 5, 12, 50, 50, 1000, 200, 50, 10, 10, 1, NOW(), NOW()
    UNION ALL
    SELECT '易筋经', '洗经伐髓改善资质', '功法', 4, 12, 20, 20, 800, 150, 30, 5, 5, 1, NOW(), NOW()
    UNION ALL
    SELECT '北冥神功', '吸收他人内力', '功法', 5, 12, 40, 30, 1200, 250, 20, 15, 5, 1, NOW(), NOW()
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM skill WHERE skill.skill_name = temp.skill_name);

-- 插入任务数据
INSERT INTO task (task_name, task_type, description, reward_xiuwei, reward_contribution, requirement_realm, is_daily, is_loop, is_enabled, created_at, updated_at)
SELECT * FROM (
    SELECT '每日签到' AS task_name, '日常' AS task_type, '每日登录游戏签到' AS description,
           50 AS reward_xiuwei, 10 AS reward_contribution, '练气' AS requirement_realm,
           1 AS is_daily, 0 AS is_loop, 1 AS is_enabled, NOW(), NOW()
    UNION ALL
    SELECT '修炼吐纳', '日常', '完成一次完整的吐纳修炼', 100, 20, '练气', 1, 0, 1, NOW(), NOW()
    UNION ALL
    SELECT '宗门贡献', '日常', '为宗门贡献资源', 80, 50, '练气', 1, 0, 1, NOW(), NOW()
    UNION ALL
    SELECT '猎杀妖兽', '循环', '猎杀指定数量的妖兽', 200, 30, '筑基', 0, 1, 1, NOW(), NOW()
    UNION ALL
    SELECT '采集灵草', '循环', '采集指定数量的灵草', 150, 25, '练气', 0, 1, 1, NOW(), NOW()
    UNION ALL
    SELECT '突破境界', '成就', '成功突破到新的境界', 500, 100, '筑基', 0, 0, 1, NOW(), NOW()
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM task WHERE task.task_name = temp.task_name);

-- 插入资产类型数据
INSERT INTO resource_type (code, name, description, unit)
SELECT * FROM (
    SELECT 'PILL' AS code, '丹药' AS name, '各类修炼丹药' AS description, '颗' AS unit
    UNION ALL
    SELECT 'MATERIAL', '材料', '炼器和炼丹材料', '份'
    UNION ALL
    SELECT 'WEAPON', '法宝', '各类法宝武器', '件'
    UNION ALL
    SELECT 'ARMOR', '装备', '防具装备', '件'
    UNION ALL
    SELECT 'TECHNIQUE', '功法', '修炼功法和秘籍', '本'
    UNION ALL
    SELECT 'OTHER', '其他', '其他杂物', '个'
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM resource_type WHERE resource_type.code = temp.code);

-- 插入资产类型数据（货币和虚拟资产）
INSERT INTO asset_types (code, name, type, category, description, unit)
SELECT * FROM (
    SELECT 'LINGSHI' AS code, '灵石' AS name, 'CURRENCY' AS type, '货币' AS category, '通用货币' AS description, '个' AS unit
    UNION ALL
    SELECT 'XIANSHI', '仙石', 'CURRENCY', '货币', '高级货币', '个'
    UNION ALL
    SELECT 'SHOUMING', '寿命', 'VIRTUAL', '虚拟', '角色寿命', '年'
    UNION ALL
    SELECT 'XIUXIUWEI', '修为', 'VIRTUAL', 'CULTIVATION', '修炼修为', '点'
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM asset_types WHERE asset_types.code = temp.code);

-- 插入具体资产数据
INSERT INTO resource (resource_type_id, name, description, rarity, effect_value, is_tradable, created_at, updated_at)
SELECT rt.id, v.name, v.description, v.rarity, v.effect_value, v.is_tradable, NOW(), NOW()
FROM resource_type rt, (
    SELECT 'PILL' AS type_code, '聚气丹' AS name, '聚集天地灵气' AS description, 2 AS rarity, 100 AS effect_value, 1 AS is_tradable
    UNION ALL SELECT 'PILL', '筑基丹', '辅助突破筑基', 4, 500, 1
    UNION ALL SELECT 'PILL', '金丹丹', '辅助凝结金丹', 5, 1000, 1
    UNION ALL SELECT 'MATERIAL', '灵石', '通用货币', 1, 10, 1
    UNION ALL SELECT 'MATERIAL', '千年灵芝', '珍贵药材', 5, 2000, 1
    UNION ALL SELECT 'WEAPON', '青锋剑', '普通宝剑', 2, 50, 1
    UNION ALL SELECT 'WEAPON', '诛仙剑', '上古神器', 6, 5000, 0
    UNION ALL SELECT 'ARMOR', '布衣', '普通衣物', 1, 20, 1
    UNION ALL SELECT 'ARMOR', '八卦仙衣', '仙级防具', 5, 3000, 1
    UNION ALL SELECT 'TECHNIQUE', '基础吐纳术', '入门功法', 1, 100, 0
    UNION ALL SELECT 'TECHNIQUE', '九转玄功', '顶级功法', 6, 10000, 0
) AS v
WHERE rt.code = v.type_code
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 插入宗门数据
INSERT INTO clan (name, level, description, members_count, max_members, leader_name, status, created_at)
SELECT * FROM (
    SELECT '青云门' AS name, 5 AS level, '正道第一宗门' AS description, 
           156 AS members_count, 200 AS max_members, '道玄真人' AS leader_name, 
           'normal' AS status, NOW() AS created_at
    UNION ALL
    SELECT '焚香谷', 5, '以火系功法著称', 142, 200, '云易岚', 'normal', NOW()
    UNION ALL
    SELECT '天音寺', 5, '佛门圣地', 128, 200, '普泓', 'normal', NOW()
    UNION ALL
    SELECT '鬼王宗', 5, '魔教大宗', 167, 200, '鬼王', 'normal', NOW()
    UNION ALL
    SELECT '万毒门', 4, '擅长用毒', 89, 150, '毒神', 'normal', NOW()
    UNION ALL
    SELECT '合欢派', 4, '魔教门派', 76, 150, '三娘', 'normal', NOW()
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM clan WHERE clan.name = temp.name);

-- 插入排行榜数据（角色等级）
INSERT INTO game_user (username, password, nickname, phone, status, avatar, created_at, updated_at)
SELECT * FROM (
    SELECT 'player1' AS username, '123456' AS password, '张三' AS nickname, '13800138001' AS phone, 
           1 AS status, NULL AS avatar, NOW(), NOW()
    UNION ALL
    SELECT 'player2', '123456', '李四', '13800138002', 1, NULL, NOW(), NOW()
    UNION ALL
    SELECT 'player3', '123456', '王五', '13800138003', 1, NULL, NOW(), NOW()
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM game_user WHERE game_user.username = temp.username);

-- 插入角色数据用于排行榜
INSERT INTO game_role (user_id, role_name, gender, realm, origin, spirit_root, status, created_at)
SELECT gu.id, v.role_name, v.gender, v.realm, v.origin, v.spirit_root, v.status, NOW()
FROM game_user gu, (
    SELECT 'player1' AS username, '张逍遥' AS role_name, 1 AS gender, '元婴' AS realm, 
           '凡人' AS origin, '金灵根' AS spirit_root, 'active' AS status
    UNION ALL
    SELECT 'player2', '李寻欢', 1, '化神', '修士', '木灵根', 'active'
    UNION ALL
    SELECT 'player3', '王语嫣', 0, '金丹', '仙族', '水灵根', 'active'
) AS v
WHERE gu.username = v.username
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);
