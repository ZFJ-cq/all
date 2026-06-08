-- ============================================
-- 修仙系统增强 - 突破规则配置
-- 功能：智能挂机、概率突破、失败惩罚、保底机制
-- ============================================

-- 1. 创建境界突破规则配置表
CREATE TABLE IF NOT EXISTS `realm_breakthrough_rule` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `from_realm` VARCHAR(50) NOT NULL COMMENT '原境界',
  `to_realm` VARCHAR(50) NOT NULL COMMENT '目标境界',
  `base_success_rate` DECIMAL(5,2) NOT NULL DEFAULT 50.00 COMMENT '基础成功率 (%)',
  `required_xiuwei` INT NOT NULL DEFAULT 0 COMMENT '所需修为',
  `failure_penalty_type` VARCHAR(20) DEFAULT 'NONE' COMMENT '失败惩罚类型：NONE-无/LOSS-损失修为/DROP-境界跌落/WALK_FIRE-走火入魔',
  `failure_penalty_value` INT DEFAULT 0 COMMENT '失败惩罚值 (百分比或层数)',
  `walk_fire_duration` INT DEFAULT 0 COMMENT '走火入魔持续时间 (分钟)',
  `min_success_rate` DECIMAL(5,2) DEFAULT 10.00 COMMENT '最低保底成功率 (%)',
  `pity_count` INT DEFAULT 0 COMMENT '保底次数 (连续失败后必成)',
  `current_pity` INT DEFAULT 0 COMMENT '当前连续失败次数',
  `is_enabled` TINYINT DEFAULT 1 COMMENT '是否启用：0-禁用 1-启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `remark` VARCHAR(500) COMMENT '备注',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_from_to_realm` (`from_realm`, `to_realm`),
  INDEX `idx_enabled` (`is_enabled`),
  INDEX `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='境界突破规则配置表';

-- 2. 创建突破成功率加成配置表
CREATE TABLE IF NOT EXISTS `breakthrough_bonus_rule` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `bonus_type` VARCHAR(20) NOT NULL COMMENT '加成类型：ATTRIBUTE-属性/ITEM-道具/OTHER-其他',
  `bonus_code` VARCHAR(50) NOT NULL COMMENT '加成代码 (如：heart_mind-心境值)',
  `bonus_name` VARCHAR(100) NOT NULL COMMENT '加成名称',
  `bonus_rate` DECIMAL(5,2) NOT NULL DEFAULT 0.00 COMMENT '加成比例 (每点增加成功率%)',
  `max_bonus_rate` DECIMAL(5,2) DEFAULT 30.00 COMMENT '最大加成上限 (%)',
  `description` VARCHAR(500) COMMENT '描述',
  `is_enabled` TINYINT DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bonus_code` (`bonus_code`),
  INDEX `idx_type` (`bonus_type`),
  INDEX `idx_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='突破成功率加成配置表';

-- 3. 创建突破历史记录表
CREATE TABLE IF NOT EXISTS `breakthrough_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `role_name` VARCHAR(50) COMMENT '角色名称',
  `from_realm` VARCHAR(50) NOT NULL COMMENT '原境界',
  `to_realm` VARCHAR(50) NOT NULL COMMENT '目标境界',
  `success_rate` DECIMAL(5,2) NOT NULL COMMENT '突破时成功率 (%)',
  `random_seed` DECIMAL(5,2) COMMENT '随机数结果',
  `is_success` TINYINT NOT NULL COMMENT '是否成功：0-失败 1-成功',
  `consumed_xiuwei` INT NOT NULL COMMENT '消耗修为',
  `penalty_type` VARCHAR(20) COMMENT '触发的惩罚类型',
  `penalty_value` INT COMMENT '惩罚值',
  `pity_count` INT DEFAULT 0 COMMENT '突破时保底次数',
  `bonus_items` VARCHAR(500) COMMENT '使用的加成道具 JSON',
  `ip_address` VARCHAR(50) COMMENT '操作 IP',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '突破时间',
  PRIMARY KEY (`id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_realm` (`from_realm`, `to_realm`),
  INDEX `idx_success` (`is_success`),
  INDEX `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='突破历史记录表';

-- 4. 创建角色走火入魔状态表
CREATE TABLE IF NOT EXISTS `role_walk_fire_status` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `remaining_minutes` INT NOT NULL COMMENT '剩余分钟数',
  `is_active` TINYINT DEFAULT 1 COMMENT '是否生效中',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_active` (`is_active`),
  INDEX `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色走火入魔状态表';

-- 5. 创建角色自动修炼配置表
CREATE TABLE IF NOT EXISTS `role_auto_cultivation_config` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `is_enabled` TINYINT DEFAULT 0 COMMENT '是否启用自动修炼',
  `cultivation_interval` INT DEFAULT 60 COMMENT '修炼间隔 (秒)',
  `last_cultivation_time` DATETIME COMMENT '上次修炼时间',
  `total_xiuwei_gained` BIGINT DEFAULT 0 COMMENT '累计获得修为',
  `auto_breakthrough` TINYINT DEFAULT 0 COMMENT '是否自动突破：0-手动 1-自动',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_id` (`role_id`),
  INDEX `idx_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色自动修炼配置表';

-- 6. 插入初始突破规则数据
INSERT INTO `realm_breakthrough_rule` (`from_realm`, `to_realm`, `base_success_rate`, `required_xiuwei`, `failure_penalty_type`, `failure_penalty_value`, `walk_fire_duration`, `min_success_rate`, `pity_count`, `sort_order`, `remark`) VALUES
('炼体期', '炼气期', 95.00, 1000, 'LOSS', 10, 0, 30.00, 5, 1, '炼体到炼气，基础成功率 95%'),
('炼气期', '筑基期', 70.00, 5000, 'LOSS', 30, 0, 20.00, 10, 2, '炼气到筑基，基础成功率 70%'),
('筑基期', '金丹期', 50.00, 20000, 'DROP', 1, 30, 15.00, 15, 3, '筑基到金丹，基础成功率 50%，失败掉 1 层'),
('金丹期', '元婴期', 40.00, 100000, 'DROP', 1, 60, 10.00, 20, 4, '金丹到元婴，基础成功率 40%，失败掉 1 层'),
('元婴期', '化神期', 30.00, 500000, 'DROP', 2, 120, 10.00, 25, 5, '元婴到化神，基础成功率 30%，失败掉 2 层'),
('化神期', '炼虚期', 25.00, 2000000, 'WALK_FIRE', 0, 180, 10.00, 30, 6, '化神到炼虚，基础成功率 25%，失败走火入魔 3 小时'),
('炼虚期', '合体期', 20.00, 10000000, 'WALK_FIRE', 0, 360, 10.00, 35, 7, '炼虚到合体，基础成功率 20%，失败走火入魔 6 小时'),
('合体期', '大乘期', 15.00, 50000000, 'WALK_FIRE', 0, 720, 10.00, 40, 8, '合体到大乘，基础成功率 15%，失败走火入魔 12 小时'),
('大乘期', '渡劫期', 10.00, 200000000, 'WALK_FIRE', 0, 1440, 5.00, 50, 9, '大乘到渡劫，基础成功率 10%，失败走火入魔 24 小时');

-- 7. 插入初始成功率加成配置
INSERT INTO `breakthrough_bonus_rule` (`bonus_type`, `bonus_code`, `bonus_name`, `bonus_rate`, `max_bonus_rate`, `description`, `sort_order`) VALUES
('ATTRIBUTE', 'heart_mind', '心境值', 0.50, 30.00, '每点心境值增加 0.5% 成功率，最高 30%', 1),
('ATTRIBUTE', 'luck', '气运值', 0.30, 20.00, '每点气运值增加 0.3% 成功率，最高 20%', 2),
('ITEM', 'spirit_stone_low', '下品灵石', 5.00, 20.00, '使用下品灵石增加 5% 成功率，最多叠加 4 个', 3),
('ITEM', 'spirit_stone_mid', '中品灵石', 10.00, 30.00, '使用中品灵石增加 10% 成功率，最多叠加 3 个', 4),
('ITEM', 'spirit_stone_high', '上品灵石', 20.00, 40.00, '使用上品灵石增加 20% 成功率，最多叠加 2 个', 5),
('ITEM', 'breakthrough_dan', '突破丹', 15.00, 30.00, '使用突破丹增加 15% 成功率，最多叠加 2 个', 6),
('ITEM', 'protect_dan', '护心丹', 10.00, 20.00, '使用护心丹增加 10% 成功率并降低失败惩罚，最多叠加 2 个', 7);

-- 8. 为所有现有角色创建自动修炼配置
INSERT INTO `role_auto_cultivation_config` (`role_id`, `is_enabled`, `cultivation_interval`, `auto_breakthrough`)
SELECT id, 0, 60, 0 FROM game_role
ON DUPLICATE KEY UPDATE `cultivation_interval` = 60;
