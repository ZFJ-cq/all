-- 检查和修复技能系统数据
-- 用于解决技能获取失败的问题

-- ========================================
-- 1. 检查 skill 表是否存在
-- ========================================
SELECT '检查 skill 表' AS action;
SELECT COUNT(*) AS skill_table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'skill';

-- ========================================
-- 2. 检查 role_skill 表是否存在
-- ========================================
SELECT '检查 role_skill 表' AS action;
SELECT COUNT(*) AS role_skill_table_exists 
FROM information_schema.tables 
WHERE table_schema = DATABASE() AND table_name = 'role_skill';

-- ========================================
-- 3. 检查 skill 表字段
-- ========================================
SELECT 'skill 表字段' AS action, COLUMN_NAME, DATA_TYPE 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'skill'
ORDER BY ORDINAL_POSITION;

-- ========================================
-- 4. 检查 role_skill 表字段
-- ========================================
SELECT 'role_skill 表字段' AS action, COLUMN_NAME, DATA_TYPE 
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_skill'
ORDER BY ORDINAL_POSITION;

-- ========================================
-- 5. 检查 skill 表数据
-- ========================================
SELECT 'skill 表数据' AS action, COUNT(*) AS skill_count FROM skill;

-- ========================================
-- 6. 如果 skill 表为空，插入初始数据
-- ========================================
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

-- ========================================
-- 7. 查看当前 skill 表所有数据
-- ========================================
SELECT * FROM skill;
