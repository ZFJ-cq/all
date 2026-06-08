-- ========================================
-- 技能系统测试数据
-- 用于验证前端修复效果
-- ========================================

-- 1. 查看 skill 表现有数据
SELECT '===== skill 表数据 =====' AS info;
SELECT id, skill_name, skill_type, attack_bonus, defense_bonus, xiuwei_bonus, status 
FROM skill 
WHERE status = 1;

-- 2. 查看 role_skill 表现有数据
SELECT '===== role_skill 表数据 =====' AS info;
SELECT id, role_id, skill_id, skill_level, experience, equipped 
FROM role_skill 
WHERE role_id = 45;

-- 3. 关联查询（前端需要的数据）
SELECT '===== 角色 45 的技能详情 =====' AS info;
SELECT 
    rs.id AS role_skill_id,
    rs.role_id,
    rs.skill_id,
    rs.skill_level,
    rs.experience,
    rs.equipped,
    s.skill_name,
    s.skill_type,
    s.attack_bonus,
    s.defense_bonus,
    s.xiuwei_bonus,
    s.description
FROM role_skill rs
INNER JOIN skill s ON rs.skill_id = s.id
WHERE rs.role_id = 45
ORDER BY rs.equipped DESC, rs.skill_level DESC;

-- 4. 如果 skill 表为空，执行以下 SQL 插入数据
SELECT '===== 如果 skill 表为空，请执行以下 INSERT =====' AS info;

INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) 
SELECT '基础剑法', '最基础的剑法招式，简单易学', '攻击', 1, 12, 100, 0, 50, 0, 0, 0, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM skill WHERE skill_name = '基础剑法');

INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) 
SELECT '灵力护盾', '凝聚灵力形成护盾，抵御伤害', '防御', 1, 12, 0, 150, 30, 0, 0, 0, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM skill WHERE skill_name = '灵力护盾');

INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) 
SELECT '聚气诀', '快速聚集灵气的功法', '功法', 1, 12, 0, 0, 200, 50, 0, 0, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM skill WHERE skill_name = '聚气诀');

INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) 
SELECT '瞬影步', '快速移动的身法', '身法', 1, 12, 0, 0, 50, 0, 100, 0, 50, 1
WHERE NOT EXISTS (SELECT 1 FROM skill WHERE skill_name = '瞬影步');

INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) 
SELECT '火球术', '操控火焰形成火球攻击敌人', '攻击', 1, 12, 200, 0, 80, 50, 0, 10, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM skill WHERE skill_name = '火球术');

INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) 
SELECT '冰魄术', '极寒之力凝结成冰，冻结敌人', '攻击', 1, 12, 180, 0, 100, 80, 0, 5, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM skill WHERE skill_name = '冰魄术');

INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) 
SELECT '金刚诀', '强化肉身的防御功法', '防御', 1, 12, 50, 300, 100, 0, 0, 0, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM skill WHERE skill_name = '金刚诀');

INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) 
SELECT '天雷诀', '引动天雷之力，威力巨大', '攻击', 1, 12, 500, 0, 200, 100, 0, 20, 0, 1
WHERE NOT EXISTS (SELECT 1 FROM skill WHERE skill_name = '天雷诀');

-- 5. 为角色 45 添加技能（如果不存在）
SELECT '===== 为角色 45 添加技能 =====' AS info;

INSERT INTO role_skill (role_id, skill_id, skill_level, experience, equipped)
VALUES (45, 1, 5, 2500, TRUE)  -- 基础剑法 Lv.5
ON DUPLICATE KEY UPDATE 
    skill_level = VALUES(skill_level),
    experience = VALUES(experience),
    equipped = VALUES(equipped);

INSERT INTO role_skill (role_id, skill_id, skill_level, experience, equipped)
VALUES (45, 2, 3, 1200, FALSE)  -- 灵力护盾 Lv.3
ON DUPLICATE KEY UPDATE 
    skill_level = VALUES(skill_level),
    experience = VALUES(experience),
    equipped = VALUES(equipped);

INSERT INTO role_skill (role_id, skill_id, skill_level, experience, equipped)
VALUES (45, 3, 7, 5800, TRUE)  -- 聚气诀 Lv.7
ON DUPLICATE KEY UPDATE 
    skill_level = VALUES(skill_level),
    experience = VALUES(experience),
    equipped = VALUES(equipped);

INSERT INTO role_skill (role_id, skill_id, skill_level, experience, equipped)
VALUES (45, 4, 4, 1800, FALSE)  -- 瞬影步 Lv.4
ON DUPLICATE KEY UPDATE 
    skill_level = VALUES(skill_level),
    experience = VALUES(experience),
    equipped = VALUES(equipped);

INSERT INTO role_skill (role_id, skill_id, skill_level, experience, equipped)
VALUES (45, 5, 6, 4200, TRUE)  -- 火球术 Lv.6
ON DUPLICATE KEY UPDATE 
    skill_level = VALUES(skill_level),
    experience = VALUES(experience),
    equipped = VALUES(equipped);

-- 6. 验证最终结果
SELECT '===== 最终验证结果 =====' AS info;
SELECT 
    rs.role_id AS '角色 ID',
    s.skill_name AS '技能名称',
    s.skill_type AS '技能类型',
    rs.skill_level AS '技能等级',
    rs.experience AS '熟练度',
    CASE 
        WHEN rs.equipped = 1 THEN '✅ 已装备'
        ELSE '❌ 未装备'
    END AS '状态',
    CONCAT(
        s.attack_bonus > 0 ? CONCAT('+', s.attack_bonus, ' 攻击') : '',
        s.defense_bonus > 0 ? CONCAT(' +', s.defense_bonus, ' 防御') : '',
        s.xiuwei_bonus > 0 ? CONCAT(' +', s.xiuwei_bonus, ' 修为') : ''
    ) AS '属性加成'
FROM role_skill rs
INNER JOIN skill s ON rs.skill_id = s.id
WHERE rs.role_id = 45
ORDER BY rs.equipped DESC, rs.skill_level DESC;

-- 7. 统计信息
SELECT '===== 统计信息 =====' AS info;
SELECT 
    COUNT(*) AS '总技能数',
    SUM(CASE WHEN equipped = 1 THEN 1 ELSE 0 END) AS '已装备技能数',
    SUM(CASE WHEN equipped = 0 THEN 1 ELSE 0 END) AS '未装备技能数',
    AVG(skill_level) AS '平均等级'
FROM role_skill
WHERE role_id = 45;
