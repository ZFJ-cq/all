-- ============================================
-- 初始化宗门建筑数据
-- 为所有现有宗门创建基础建筑
-- ============================================

-- 为每个宗门创建基础建筑
INSERT INTO `clan_building` (`clan_id`, `name`, `level`, `max_level`, `effect`, `upgrade_cost`, `type`, `status`)
SELECT 
    c.id AS clan_id,
    '聚灵阵' AS name,
    1 AS level,
    10 AS max_level,
    '提升宗门成员修炼速度' AS effect,
    1000 AS upgrade_cost,
    'normal' AS type,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_building` b WHERE b.`clan_id` = c.id AND b.`name` = '聚灵阵'
);

INSERT INTO `clan_building` (`clan_id`, `name`, `level`, `max_level`, `effect`, `upgrade_cost`, `type`, `status`)
SELECT 
    c.id AS clan_id,
    '炼丹房' AS name,
    1 AS level,
    10 AS max_level,
    '提升宗门成员炼丹成功率' AS effect,
    800 AS upgrade_cost,
    'normal' AS type,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_building` b WHERE b.`clan_id` = c.id AND b.`name` = '炼丹房'
);

INSERT INTO `clan_building` (`clan_id`, `name`, `level`, `max_level`, `effect`, `upgrade_cost`, `type`, `status`)
SELECT 
    c.id AS clan_id,
    '炼器室' AS name,
    1 AS level,
    10 AS max_level,
    '提升宗门成员炼器成功率' AS effect,
    800 AS upgrade_cost,
    'normal' AS type,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_building` b WHERE b.`clan_id` = c.id AND b.`name` = '炼器室'
);

INSERT INTO `clan_building` (`clan_id`, `name`, `level`, `max_level`, `effect`, `upgrade_cost`, `type`, `status`)
SELECT 
    c.id AS clan_id,
    '藏经阁' AS name,
    1 AS level,
    10 AS max_level,
    '存储宗门功法秘籍' AS effect,
    1200 AS upgrade_cost,
    'special' AS type,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_building` b WHERE b.`clan_id` = c.id AND b.`name` = '藏经阁'
);

SELECT '✅ 宗门建筑初始化完成！' AS message;
