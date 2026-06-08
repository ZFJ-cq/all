-- 为 clan_shop_item 和 clan_task 表添加 clan_id 字段

ALTER TABLE `clan_shop_item` ADD COLUMN IF NOT EXISTS `clan_id` BIGINT DEFAULT NULL COMMENT '宗门 ID' AFTER `id`;
ALTER TABLE `clan_task` ADD COLUMN IF NOT EXISTS `clan_id` BIGINT DEFAULT NULL COMMENT '宗门 ID' AFTER `id`;

-- 为已有数据设置 clan_id（关联到第一个宗门）
UPDATE `clan_shop_item` SET `clan_id` = (SELECT MIN(id) FROM `clan`) WHERE `clan_id` IS NULL;
UPDATE `clan_task` SET `clan_id` = (SELECT MIN(id) FROM `clan`) WHERE `clan_id` IS NULL;

-- 添加索引
ALTER TABLE `clan_shop_item` ADD INDEX IF NOT EXISTS `idx_clan_id` (`clan_id`);
ALTER TABLE `clan_task` ADD INDEX IF NOT EXISTS `idx_clan_id` (`clan_id`);

SELECT '✅ clan_shop_item 和 clan_task 表添加 clan_id 字段完成！' AS message;
