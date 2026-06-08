-- ============================================
-- 初始化宗门功能数据
-- 为所有宗门创建商城商品、任务等数据
-- ============================================

-- 为每个宗门创建商城商品
INSERT INTO `clan_shop_item` (`clan_id`, `name`, `description`, `price`, `currency`, `image`, `stock`, `type`, `status`)
SELECT 
    c.id AS clan_id,
    '聚灵丹' AS name,
    '提升修炼速度的丹药' AS description,
    100 AS price,
    'contribution' AS currency,
    '💊' AS image,
    100 AS stock,
    'pill' AS type,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_shop_item` i WHERE i.`clan_id` = c.id AND i.`name` = '聚灵丹'
);

INSERT INTO `clan_shop_item` (`clan_id`, `name`, `description`, `price`, `currency`, `image`, `stock`, `type`, `status`)
SELECT 
    c.id AS clan_id,
    '筑基丹' AS name,
    '帮助突破筑基期的丹药' AS description,
    500 AS price,
    'contribution' AS currency,
    '💊' AS image,
    50 AS stock,
    'pill' AS type,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_shop_item` i WHERE i.`clan_id` = c.id AND i.`name` = '筑基丹'
);

INSERT INTO `clan_shop_item` (`clan_id`, `name`, `description`, `price`, `currency`, `image`, `stock`, `type`, `status`)
SELECT 
    c.id AS clan_id,
    '灵石' AS name,
    '修仙界通用货币' AS description,
    50 AS price,
    'contribution' AS currency,
    '💎' AS image,
    999 AS stock,
    'material' AS type,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_shop_item` i WHERE i.`clan_id` = c.id AND i.`name` = '灵石'
);

INSERT INTO `clan_shop_item` (`clan_id`, `name`, `description`, `price`, `currency`, `image`, `stock`, `type`, `status`)
SELECT 
    c.id AS clan_id,
    '炼器图谱' AS name,
    '稀有炼器图谱' AS description,
    1000 AS price,
    'contribution' AS currency,
    '📜' AS image,
    10 AS stock,
    'manual' AS type,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_shop_item` i WHERE i.`clan_id` = c.id AND i.`name` = '炼器图谱'
);

-- 为每个宗门创建任务
INSERT INTO `clan_task` (`clan_id`, `title`, `description`, `target`, `reward`, `type`, `difficulty`, `status`)
SELECT 
    c.id AS clan_id,
    '采集灵草' AS title,
    '采集 10 株灵草' AS description,
    10 AS target,
    100 AS reward,
    'gather' AS type,
    1 AS difficulty,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_task` t WHERE t.`clan_id` = c.id AND t.`title` = '采集灵草'
);

INSERT INTO `clan_task` (`clan_id`, `title`, `description`, `target`, `reward`, `type`, `difficulty`, `status`)
SELECT 
    c.id AS clan_id,
    '猎杀妖兽' AS title,
    '猎杀 5 头筑基期妖兽' AS description,
    5 AS target,
    200 AS reward,
    'hunt' AS type,
    2 AS difficulty,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_task` t WHERE t.`clan_id` = c.id AND t.`title` = '猎杀妖兽'
);

INSERT INTO `clan_task` (`clan_id`, `title`, `description`, `target`, `reward`, `type`, `difficulty`, `status`)
SELECT 
    c.id AS clan_id,
    '炼制丹药' AS title,
    '炼制 3 枚聚灵丹' AS description,
    3 AS target,
    150 AS reward,
    'refine' AS type,
    1 AS difficulty,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_task` t WHERE t.`clan_id` = c.id AND t.`title` = '炼制丹药'
);

INSERT INTO `clan_task` (`clan_id`, `title`, `description`, `target`, `reward`, `type`, `difficulty`, `status`)
SELECT 
    c.id AS clan_id,
    '巡逻宗门' AS title,
    '巡逻宗门周边区域' AS description,
    1 AS target,
    50 AS reward,
    'patrol' AS type,
    0 AS difficulty,
    1 AS status
FROM `clan` c
WHERE NOT EXISTS (
    SELECT 1 FROM `clan_task` t WHERE t.`clan_id` = c.id AND t.`title` = '巡逻宗门'
);

SELECT '✅ 宗门功能数据初始化完成！' AS message;
