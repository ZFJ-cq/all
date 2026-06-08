-- ============================================
-- 创建宗门商城商品表
-- ============================================

CREATE TABLE IF NOT EXISTS `clan_shop_item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `name` VARCHAR(100) NOT NULL COMMENT '商品名称',
  `description` VARCHAR(500) COMMENT '商品描述',
  `price` INT NOT NULL DEFAULT 0 COMMENT '价格（贡献度）',
  `currency` VARCHAR(20) DEFAULT '贡献' COMMENT '货币类型',
  `image` VARCHAR(50) DEFAULT '📦' COMMENT '商品图标',
  `stock` INT DEFAULT -1 COMMENT '库存（-1 表示无限）',
  `type` VARCHAR(20) DEFAULT 'normal' COMMENT '商品类型：normal-普通，special-特殊',
  `status` INT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门商城商品表';

-- 插入初始商品数据
INSERT INTO `clan_shop_item` (`name`, `description`, `price`, `currency`, `image`, `stock`, `type`, `status`) VALUES
('聚灵丹', '增加修炼速度的丹药', 100, '贡献', '💊', 100, 'normal', 1),
('筑基丹', '帮助突破筑基期的丹药', 500, '贡献', '💊', 50, 'special', 1),
('灵石', '修真界通用货币', 50, '贡献', '💎', 999, 'normal', 1),
('凝神丹', '提升悟性的丹药', 200, '贡献', '💊', 80, 'normal', 1),
('破境丹', '突破瓶颈的丹药', 1000, '贡献', '💊', 20, 'special', 1);

-- ============================================
-- 创建宗门任务表
-- ============================================

CREATE TABLE IF NOT EXISTS `clan_task` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `title` VARCHAR(100) NOT NULL COMMENT '任务标题',
  `description` VARCHAR(500) NOT NULL COMMENT '任务描述',
  `target` INT NOT NULL DEFAULT 1 COMMENT '任务目标数量',
  `reward` INT NOT NULL DEFAULT 100 COMMENT '任务奖励（贡献度）',
  `type` VARCHAR(20) DEFAULT 'daily' COMMENT '任务类型：daily-每日，weekly-每周，normal-普通',
  `difficulty` INT DEFAULT 1 COMMENT '难度等级：1-简单，2-普通，3-困难',
  `status` INT DEFAULT 1 COMMENT '状态：0-下架，1-上架',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门任务表';

-- 插入初始任务数据
INSERT INTO `clan_task` (`title`, `description`, `target`, `reward`, `type`, `difficulty`, `status`) VALUES
('采集灵草', '采集 10 株灵草', 10, 100, 'daily', 1, 1),
('猎杀妖兽', '猎杀 5 头筑基期妖兽', 5, 200, 'daily', 2, 1),
('炼制丹药', '炼制 3 枚聚灵丹', 3, 150, 'daily', 1, 1),
('探索秘境', '探索 1 次秘境', 1, 300, 'weekly', 3, 1),
('宗门贡献', '获得 1000 点宗门贡献', 1000, 500, 'weekly', 2, 1);

-- ============================================
-- 创建宗门建筑表
-- ============================================

CREATE TABLE IF NOT EXISTS `clan_building` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `clan_id` BIGINT NOT NULL COMMENT '宗门 ID',
  `name` VARCHAR(100) NOT NULL COMMENT '建筑名称',
  `level` INT NOT NULL DEFAULT 1 COMMENT '建筑等级',
  `max_level` INT NOT NULL DEFAULT 10 COMMENT '最大等级',
  `effect` VARCHAR(200) COMMENT '建筑效果描述',
  `upgrade_cost` INT NOT NULL DEFAULT 1000 COMMENT '升级所需贡献度',
  `type` VARCHAR(20) DEFAULT 'normal' COMMENT '建筑类型：normal-普通，special-特殊',
  `status` INT DEFAULT 1 COMMENT '状态：0-停用，1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_clan_name` (`clan_id`, `name`),
  KEY `idx_clan_id` (`clan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门建筑表';

-- ============================================
-- 创建宗门成员任务进度表
-- ============================================

CREATE TABLE IF NOT EXISTS `clan_member_task` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `clan_id` BIGINT NOT NULL COMMENT '宗门 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `task_id` BIGINT NOT NULL COMMENT '任务 ID',
  `progress` INT NOT NULL DEFAULT 0 COMMENT '当前进度',
  `status` VARCHAR(20) DEFAULT 'available' COMMENT '状态：available-可接受，in_progress-进行中，completed-已完成',
  `accept_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '接受时间',
  `complete_time` DATETIME DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_task` (`role_id`, `task_id`),
  KEY `idx_clan_id` (`clan_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门成员任务进度表';

SELECT '✅ 宗门功能相关表创建完成！' AS message;
