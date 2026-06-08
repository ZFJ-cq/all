-- ============================================  
-- 灵月仙途 - 资产类型修复脚本  
-- 用于修复 asset_types 表中的重复记录问题  
-- ============================================

-- 1. 查看 asset_types 表中的重复记录
SELECT 
  `code`,
  COUNT(*) as count
FROM `asset_types`
GROUP BY `code`
HAVING COUNT(*) > 1;

-- 2. 保留最新的记录，删除重复的记录
-- 注意：此操作会删除重复的记录，只保留最新的一条
DELETE FROM `asset_types`
WHERE `id` NOT IN (
    SELECT MAX(`id`) 
    FROM `asset_types` 
    GROUP BY `code`
);

-- 3. 确保 code 字段的唯一性（添加唯一索引）
ALTER TABLE `asset_types` ADD UNIQUE INDEX `uk_asset_type_code` (`code`);

-- 4. 重新插入必要的资产类型（如果不存在）
INSERT IGNORE INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `unit_of_measure`, `decimal_precision`, `is_system`, `created_at`, `updated_at`) VALUES
('LINGSHI', '灵石', 'CURRENCY', '货币', '修仙世界的通用货币', '个', 0, 1, NOW(), NOW()),
('XIANSHI', '仙石', 'CURRENCY', '货币', '仙界通用货币，蕴含强大灵气', '个', 0, 1, NOW(), NOW()),
('SHOUMING', '寿命', 'SPECIAL', '属性', '角色的寿命值，影响修炼和活动', '年', 0, 1, NOW(), NOW()),
('XIUWEI', '修为', 'SPECIAL', '属性', '角色的修炼程度', '点', 0, 1, NOW(), NOW()),
('HUNSHI', '魂石', 'MATERIAL', '材料', '蕴含灵魂之力的石头', '个', 0, 1, NOW(), NOW());

-- 5. 验证修复结果
SELECT 
  `id`,
  `code`,
  `name`,
  `type`,
  `category`,
  `description`
FROM `asset_types`
ORDER BY `code`;

SELECT '✅ 资产类型修复完成！' AS message;