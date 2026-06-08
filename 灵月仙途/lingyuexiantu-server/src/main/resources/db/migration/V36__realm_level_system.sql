-- ============================================
-- 修炼系统全面改造
-- 新境界体系：凡人→炼体(10层)→炼气(10层)→筑基(10层)→金丹(10层)→元婴(10层)→化神(10层)→炼虚(10层)→合体(10层)→大乘(10层)
-- 突破概率、惩罚机制、离线修炼、走火入魔
-- ============================================

-- 1. 给 game_role 表添加境界层级字段
SET @dbname = DATABASE();
SET @tablename = 'game_role';

-- 使用存储过程安全添加列
DROP PROCEDURE IF EXISTS add_column_if_not_exists;
DELIMITER //
CREATE PROCEDURE add_column_if_not_exists()
BEGIN
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@dbname AND TABLE_NAME='game_role' AND COLUMN_NAME='realm_level') THEN
        ALTER TABLE `game_role` ADD COLUMN `realm_level` INT DEFAULT 1 COMMENT '境界层级(1-10)';
    END IF;
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@dbname AND TABLE_NAME='game_role' AND COLUMN_NAME='last_online_time') THEN
        ALTER TABLE `game_role` ADD COLUMN `last_online_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后在线时间';
    END IF;
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@dbname AND TABLE_NAME='game_role' AND COLUMN_NAME='last_cultivation_time') THEN
        ALTER TABLE `game_role` ADD COLUMN `last_cultivation_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后修炼时间';
    END IF;
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@dbname AND TABLE_NAME='game_role' AND COLUMN_NAME='walk_fire_until') THEN
        ALTER TABLE `game_role` ADD COLUMN `walk_fire_until` DATETIME NULL COMMENT '走火入魔结束时间';
    END IF;
    IF NOT EXISTS (SELECT * FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=@dbname AND TABLE_NAME='game_role' AND COLUMN_NAME='consecutive_breakthrough_failures') THEN
        ALTER TABLE `game_role` ADD COLUMN `consecutive_breakthrough_failures` INT DEFAULT 0 COMMENT '连续突破失败次数(保底用)';
    END IF;
END //
DELIMITER ;
CALL add_column_if_not_exists();
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

-- 2. 创建境界配置表
CREATE TABLE IF NOT EXISTS `realm_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `realm_name` VARCHAR(20) NOT NULL COMMENT '境界名(如:炼体)',
  `realm_index` INT NOT NULL COMMENT '境界序号(0=凡人,1=炼体,...)',
  `level` INT NOT NULL COMMENT '层级(1-10)',
  `full_realm_name` VARCHAR(30) NOT NULL COMMENT '完整名称(如:炼体一层)',
  `required_xiuwei` BIGINT NOT NULL DEFAULT 0 COMMENT '突破到本层所需修为',
  `base_success_rate` DECIMAL(5,2) NOT NULL DEFAULT 60.00 COMMENT '突破基础成功率(%)',
  `penalty_type` VARCHAR(20) DEFAULT 'NONE' COMMENT '失败惩罚:NONE/LOSS_XIUWEI/WALK_FIRE',
  `penalty_value` INT DEFAULT 0 COMMENT '惩罚值(修为损失%或走火入魔分钟)',
  `efficiency_multiplier` DECIMAL(5,2) DEFAULT 1.00 COMMENT '修炼效率倍率',
  `required_pill` VARCHAR(50) NULL COMMENT '突破所需丹药代码(如:LIANTIDAN)',
  `required_pill_count` INT DEFAULT 0 COMMENT '突破所需丹药数量',
  `is_major_breakthrough` TINYINT DEFAULT 0 COMMENT '是否大境界突破(0=小层,1=大境界)',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_realm_level` (`realm_name`, `level`),
  INDEX `idx_realm_index` (`realm_index`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='境界配置表';

-- 3. 插入完整境界配置数据
-- 凡人(0) → 炼体(1) → 炼气(2) → 筑基(3) → 金丹(4) → 元婴(5) → 化神(6) → 炼虚(7) → 合体(8) → 大乘(9)

-- 凡人 → 炼体一层（只需炼体丹）
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('炼体', 1, 1, '炼体一层', 100, 100.00, 'NONE', 0, 1.00, 'LIANTIDAN', 1, 1, 1);

-- 炼体期 1-10层
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('炼体', 1, 2, '炼体二层', 200, 90.00, 'LOSS_XIUWEI', 20, 1.05, NULL, 0, 0, 2),
('炼体', 1, 3, '炼体三层', 400, 85.00, 'LOSS_XIUWEI', 20, 1.10, NULL, 0, 0, 3),
('炼体', 1, 4, '炼体四层', 700, 80.00, 'LOSS_XIUWEI', 25, 1.15, NULL, 0, 0, 4),
('炼体', 1, 5, '炼体五层', 1100, 75.00, 'LOSS_XIUWEI', 25, 1.20, NULL, 0, 0, 5),
('炼体', 1, 6, '炼体六层', 1600, 70.00, 'LOSS_XIUWEI', 25, 1.25, NULL, 0, 0, 6),
('炼体', 1, 7, '炼体七层', 2200, 65.00, 'LOSS_XIUWEI', 30, 1.30, NULL, 0, 0, 7),
('炼体', 1, 8, '炼体八层', 3000, 60.00, 'LOSS_XIUWEI', 30, 1.35, NULL, 0, 0, 8),
('炼体', 1, 9, '炼体九层', 4000, 55.00, 'LOSS_XIUWEI', 30, 1.40, NULL, 0, 0, 9),
('炼体', 1, 10, '炼体十层', 5500, 50.00, 'LOSS_XIUWEI', 30, 1.45, NULL, 0, 0, 10);

-- 炼气期 1-10层（大境界突破）
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('炼气', 2, 1, '炼气一层', 8000, 60.00, 'LOSS_XIUWEI', 30, 1.50, 'LIANQIDAN', 1, 1, 11),
('炼气', 2, 2, '炼气二层', 10000, 58.00, 'LOSS_XIUWEI', 30, 1.55, NULL, 0, 0, 12),
('炼气', 2, 3, '炼气三层', 13000, 55.00, 'LOSS_XIUWEI', 30, 1.60, NULL, 0, 0, 13),
('炼气', 2, 4, '炼气四层', 16000, 52.00, 'LOSS_XIUWEI', 30, 1.65, NULL, 0, 0, 14),
('炼气', 2, 5, '炼气五层', 20000, 50.00, 'LOSS_XIUWEI', 30, 1.70, NULL, 0, 0, 15),
('炼气', 2, 6, '炼气六层', 25000, 48.00, 'LOSS_XIUWEI', 30, 1.75, NULL, 0, 0, 16),
('炼气', 2, 7, '炼气七层', 30000, 45.00, 'LOSS_XIUWEI', 30, 1.80, NULL, 0, 0, 17),
('炼气', 2, 8, '炼气八层', 36000, 42.00, 'LOSS_XIUWEI', 30, 1.85, NULL, 0, 0, 18),
('炼气', 2, 9, '炼气九层', 43000, 40.00, 'LOSS_XIUWEI', 30, 1.90, NULL, 0, 0, 19),
('炼气', 2, 10, '炼气十层', 50000, 38.00, 'LOSS_XIUWEI', 30, 1.95, NULL, 0, 0, 20);

-- 筑基期 1-10层
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('筑基', 3, 1, '筑基一层', 70000, 50.00, 'LOSS_XIUWEI', 30, 2.00, 'ZHUJIDAN', 1, 1, 21),
('筑基', 3, 2, '筑基二层', 85000, 48.00, 'LOSS_XIUWEI', 30, 2.05, NULL, 0, 0, 22),
('筑基', 3, 3, '筑基三层', 100000, 45.00, 'LOSS_XIUWEI', 30, 2.10, NULL, 0, 0, 23),
('筑基', 3, 4, '筑基四层', 120000, 42.00, 'LOSS_XIUWEI', 30, 2.15, NULL, 0, 0, 24),
('筑基', 3, 5, '筑基五层', 150000, 40.00, 'LOSS_XIUWEI', 30, 2.20, NULL, 0, 0, 25),
('筑基', 3, 6, '筑基六层', 180000, 38.00, 'LOSS_XIUWEI', 30, 2.25, NULL, 0, 0, 26),
('筑基', 3, 7, '筑基七层', 220000, 35.00, 'LOSS_XIUWEI', 30, 2.30, NULL, 0, 0, 27),
('筑基', 3, 8, '筑基八层', 270000, 33.00, 'LOSS_XIUWEI', 30, 2.35, NULL, 0, 0, 28),
('筑基', 3, 9, '筑基九层', 330000, 30.00, 'LOSS_XIUWEI', 30, 2.40, NULL, 0, 0, 29),
('筑基', 3, 10, '筑基十层', 400000, 28.00, 'LOSS_XIUWEI', 30, 2.45, NULL, 0, 0, 30);

-- 金丹期 1-10层
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('金丹', 4, 1, '金丹一层', 600000, 40.00, 'LOSS_XIUWEI', 30, 2.50, 'JINDANDAN', 1, 1, 31),
('金丹', 4, 2, '金丹二层', 800000, 38.00, 'LOSS_XIUWEI', 30, 2.60, NULL, 0, 0, 32),
('金丹', 4, 3, '金丹三层', 1000000, 35.00, 'LOSS_XIUWEI', 30, 2.70, NULL, 0, 0, 33),
('金丹', 4, 4, '金丹四层', 1300000, 33.00, 'LOSS_XIUWEI', 30, 2.80, NULL, 0, 0, 34),
('金丹', 4, 5, '金丹五层', 1600000, 30.00, 'LOSS_XIUWEI', 30, 2.90, NULL, 0, 0, 35),
('金丹', 4, 6, '金丹六层', 2000000, 28.00, 'LOSS_XIUWEI', 30, 3.00, NULL, 0, 0, 36),
('金丹', 4, 7, '金丹七层', 2500000, 25.00, 'LOSS_XIUWEI', 30, 3.10, NULL, 0, 0, 37),
('金丹', 4, 8, '金丹八层', 3000000, 23.00, 'LOSS_XIUWEI', 30, 3.20, NULL, 0, 0, 38),
('金丹', 4, 9, '金丹九层', 3600000, 20.00, 'LOSS_XIUWEI', 30, 3.30, NULL, 0, 0, 39),
('金丹', 4, 10, '金丹十层', 4500000, 18.00, 'LOSS_XIUWEI', 30, 3.40, NULL, 0, 0, 40);

-- 元婴期 1-10层
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('元婴', 5, 1, '元婴一层', 7000000, 30.00, 'WALK_FIRE', 30, 3.50, 'YUANYINGDAN', 1, 1, 41),
('元婴', 5, 2, '元婴二层', 9000000, 28.00, 'WALK_FIRE', 30, 3.60, NULL, 0, 0, 42),
('元婴', 5, 3, '元婴三层', 11000000, 25.00, 'WALK_FIRE', 30, 3.70, NULL, 0, 0, 43),
('元婴', 5, 4, '元婴四层', 14000000, 23.00, 'WALK_FIRE', 30, 3.80, NULL, 0, 0, 44),
('元婴', 5, 5, '元婴五层', 18000000, 20.00, 'WALK_FIRE', 30, 3.90, NULL, 0, 0, 45),
('元婴', 5, 6, '元婴六层', 22000000, 18.00, 'WALK_FIRE', 30, 4.00, NULL, 0, 0, 46),
('元婴', 5, 7, '元婴七层', 27000000, 16.00, 'WALK_FIRE', 30, 4.10, NULL, 0, 0, 47),
('元婴', 5, 8, '元婴八层', 33000000, 14.00, 'WALK_FIRE', 30, 4.20, NULL, 0, 0, 48),
('元婴', 5, 9, '元婴九层', 40000000, 12.00, 'WALK_FIRE', 30, 4.30, NULL, 0, 0, 49),
('元婴', 5, 10, '元婴十层', 50000000, 10.00, 'WALK_FIRE', 30, 4.40, NULL, 0, 0, 50);

-- 化神期 1-10层
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('化神', 6, 1, '化神一层', 80000000, 20.00, 'WALK_FIRE', 60, 4.50, 'HUASHENDAN', 1, 1, 51),
('化神', 6, 2, '化神二层', 100000000, 18.00, 'WALK_FIRE', 60, 4.60, NULL, 0, 0, 52),
('化神', 6, 3, '化神三层', 130000000, 16.00, 'WALK_FIRE', 60, 4.70, NULL, 0, 0, 53),
('化神', 6, 4, '化神四层', 160000000, 14.00, 'WALK_FIRE', 60, 4.80, NULL, 0, 0, 54),
('化神', 6, 5, '化神五层', 200000000, 12.00, 'WALK_FIRE', 60, 4.90, NULL, 0, 0, 55),
('化神', 6, 6, '化神六层', 250000000, 10.00, 'WALK_FIRE', 60, 5.00, NULL, 0, 0, 56),
('化神', 6, 7, '化神七层', 300000000, 9.00, 'WALK_FIRE', 60, 5.10, NULL, 0, 0, 57),
('化神', 6, 8, '化神八层', 360000000, 8.00, 'WALK_FIRE', 60, 5.20, NULL, 0, 0, 58),
('化神', 6, 9, '化神九层', 430000000, 7.00, 'WALK_FIRE', 60, 5.30, NULL, 0, 0, 59),
('化神', 6, 10, '化神十层', 500000000, 6.00, 'WALK_FIRE', 60, 5.40, NULL, 0, 0, 60);

-- 炼虚期 1-10层
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('炼虚', 7, 1, '炼虚一层', 800000000, 10.00, 'WALK_FIRE', 120, 5.50, 'LIANXUDAN', 1, 1, 61),
('炼虚', 7, 2, '炼虚二层', 1000000000, 9.00, 'WALK_FIRE', 120, 5.60, NULL, 0, 0, 62),
('炼虚', 7, 3, '炼虚三层', 1300000000, 8.00, 'WALK_FIRE', 120, 5.70, NULL, 0, 0, 63),
('炼虚', 7, 4, '炼虚四层', 1600000000, 7.00, 'WALK_FIRE', 120, 5.80, NULL, 0, 0, 64),
('炼虚', 7, 5, '炼虚五层', 2000000000, 6.00, 'WALK_FIRE', 120, 5.90, NULL, 0, 0, 65),
('炼虚', 7, 6, '炼虚六层', 2500000000, 5.00, 'WALK_FIRE', 120, 6.00, NULL, 0, 0, 66),
('炼虚', 7, 7, '炼虚七层', 3000000000, 5.00, 'WALK_FIRE', 120, 6.10, NULL, 0, 0, 67),
('炼虚', 7, 8, '炼虚八层', 3600000000, 5.00, 'WALK_FIRE', 120, 6.20, NULL, 0, 0, 68),
('炼虚', 7, 9, '炼虚九层', 4300000000, 5.00, 'WALK_FIRE', 120, 6.30, NULL, 0, 0, 69),
('炼虚', 7, 10, '炼虚十层', 5000000000, 5.00, 'WALK_FIRE', 120, 6.40, NULL, 0, 0, 70);

-- 合体期 1-10层
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('合体', 8, 1, '合体一层', 8000000000.00, 8.00, 'WALK_FIRE', 240, 6.50, 'HETIDAN', 1, 1, 71),
('合体', 8, 2, '合体二层', 10000000000.00, 7.00, 'WALK_FIRE', 240, 6.60, NULL, 0, 0, 72),
('合体', 8, 3, '合体三层', 13000000000.00, 6.00, 'WALK_FIRE', 240, 6.70, NULL, 0, 0, 73),
('合体', 8, 4, '合体四层', 16000000000.00, 5.00, 'WALK_FIRE', 240, 6.80, NULL, 0, 0, 74),
('合体', 8, 5, '合体五层', 20000000000.00, 5.00, 'WALK_FIRE', 240, 6.90, NULL, 0, 0, 75),
('合体', 8, 6, '合体六层', 25000000000.00, 5.00, 'WALK_FIRE', 240, 7.00, NULL, 0, 0, 76),
('合体', 8, 7, '合体七层', 30000000000.00, 5.00, 'WALK_FIRE', 240, 7.10, NULL, 0, 0, 77),
('合体', 8, 8, '合体八层', 36000000000.00, 5.00, 'WALK_FIRE', 240, 7.20, NULL, 0, 0, 78),
('合体', 8, 9, '合体九层', 43000000000.00, 5.00, 'WALK_FIRE', 240, 7.30, NULL, 0, 0, 79),
('合体', 8, 10, '合体十层', 50000000000.00, 5.00, 'WALK_FIRE', 240, 7.40, NULL, 0, 0, 80);

-- 大乘期 1-10层
INSERT INTO `realm_config` (`realm_name`, `realm_index`, `level`, `full_realm_name`, `required_xiuwei`, `base_success_rate`, `penalty_type`, `penalty_value`, `efficiency_multiplier`, `required_pill`, `required_pill_count`, `is_major_breakthrough`, `sort_order`) VALUES
('大乘', 9, 1, '大乘一层', 80000000000.00, 5.00, 'WALK_FIRE', 480, 7.50, 'DACHENGDAN', 1, 1, 81),
('大乘', 9, 2, '大乘二层', 100000000000.00, 5.00, 'WALK_FIRE', 480, 7.60, NULL, 0, 0, 82),
('大乘', 9, 3, '大乘三层', 130000000000.00, 5.00, 'WALK_FIRE', 480, 7.70, NULL, 0, 0, 83),
('大乘', 9, 4, '大乘四层', 160000000000.00, 5.00, 'WALK_FIRE', 480, 7.80, NULL, 0, 0, 84),
('大乘', 9, 5, '大乘五层', 200000000000.00, 5.00, 'WALK_FIRE', 480, 7.90, NULL, 0, 0, 85),
('大乘', 9, 6, '大乘六层', 250000000000.00, 5.00, 'WALK_FIRE', 480, 8.00, NULL, 0, 0, 86),
('大乘', 9, 7, '大乘七层', 300000000000.00, 5.00, 'WALK_FIRE', 480, 8.10, NULL, 0, 0, 87),
('大乘', 9, 8, '大乘八层', 360000000000.00, 5.00, 'WALK_FIRE', 480, 8.20, NULL, 0, 0, 88),
('大乘', 9, 9, '大乘九层', 430000000000.00, 5.00, 'WALK_FIRE', 480, 8.30, NULL, 0, 0, 89),
('大乘', 9, 10, '大乘十层', 500000000000.00, 5.00, 'WALK_FIRE', 480, 8.40, NULL, 0, 0, 90);

-- 4. 添加新丹药类型到 asset_types 表
INSERT INTO `asset_types` (`code`, `name`, `category`, `description`, `max_stack`) VALUES
('LIANTIDAN', '炼体丹', 'pill', '突破炼体期所需丹药', 99),
('LIANQIDAN', '炼气丹', 'pill', '突破炼气期所需丹药', 99),
('JINDANDAN', '金丹丹', 'pill', '突破金丹期所需丹药', 99),
('YUANYINGDAN', '元婴丹', 'pill', '突破元婴期所需丹药', 99),
('HUASHENDAN', '化神丹', 'pill', '突破化神期所需丹药', 99),
('LIANXUDAN', '炼虚丹', 'pill', '突破炼虚期所需丹药', 99),
('HETIDAN', '合体丹', 'pill', '突破合体期所需丹药', 99),
('DACHENGDAN', '大乘丹', 'pill', '突破大乘期所需丹药', 99)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 5. 给现有角色初始化境界层级
UPDATE `game_role` SET `realm_level` = 1 WHERE `realm_level` IS NULL OR `realm_level` = 0;

-- 6. 迁移旧境界数据到新体系
UPDATE `game_role` SET `realm` = '凡人', `realm_level` = 1 WHERE `realm` IN ('无', '无修为', '') OR `realm` IS NULL;
UPDATE `game_role` SET `realm` = '炼体', `realm_level` = 1 WHERE `realm` = '炼体期';
UPDATE `game_role` SET `realm` = '炼气', `realm_level` = 1 WHERE `realm` = '炼气期';
UPDATE `game_role` SET `realm` = '筑基', `realm_level` = 1 WHERE `realm` = '筑基期';
UPDATE `game_role` SET `realm` = '金丹', `realm_level` = 1 WHERE `realm` = '金丹期';
UPDATE `game_role` SET `realm` = '元婴', `realm_level` = 1 WHERE `realm` = '元婴期';
UPDATE `game_role` SET `realm` = '化神', `realm_level` = 1 WHERE `realm` = '化神期';
UPDATE `game_role` SET `realm` = '炼虚', `realm_level` = 1 WHERE `realm` = '炼虚期';
UPDATE `game_role` SET `realm` = '合体', `realm_level` = 1 WHERE `realm` = '合体期';
UPDATE `game_role` SET `realm` = '大乘', `realm_level` = 1 WHERE `realm` = '大乘期';

-- 7. 给角色1赠送一些丹药用于测试
INSERT INTO `role_asset` (`role_id`, `asset_type_code`, `quantity`, `updated_at`)
SELECT 1, at.code, 10, NOW() FROM `asset_types` at WHERE at.code IN ('LIANTIDAN', 'LIANQIDAN', 'ZHUJIDAN', 'JINDANDAN')
ON DUPLICATE KEY UPDATE `quantity` = `quantity` + 10;
