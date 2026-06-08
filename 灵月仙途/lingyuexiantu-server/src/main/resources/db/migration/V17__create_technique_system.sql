-- 灵月仙途 - 功法系统数据库迁移脚本
-- 创建时间：2026-03-23
-- 说明：功法系统支持修炼速度加成和修为上限加成

-- ========================================
-- 1. 功法定义表
-- ========================================
CREATE TABLE IF NOT EXISTS `cultivation_techniques` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '功法 ID',
  `name` VARCHAR(100) NOT NULL COMMENT '功法名称',
  `description` TEXT COMMENT '功法描述',
  `speed_addition` DOUBLE NOT NULL DEFAULT 0.0 COMMENT '修炼速度加成 (百分比，0.2 表示 +20%)',
  `speed_addition_flat` INT NOT NULL DEFAULT 0 COMMENT '修炼速度绝对值加成 (点/秒)',
  `limit_addition` BIGINT NOT NULL DEFAULT 0 COMMENT '修为上限加成 (绝对值)',
  `rarity` VARCHAR(20) NOT NULL DEFAULT 'COMMON' COMMENT '品质：COMMON, UNCOMMON, RARE, EPIC, LEGENDARY',
  `level_requirement` INT NOT NULL DEFAULT 1 COMMENT '学习等级要求',
  `realm_requirement` VARCHAR(50) DEFAULT NULL COMMENT '境界要求',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `created_at` DATETIME NOT NULL COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_technique_rarity` (`rarity`),
  INDEX `idx_technique_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='功法定义表';

-- ========================================
-- 2. 用户功法关联表 (用户已拥有的功法)
-- ========================================
CREATE TABLE IF NOT EXISTS `user_techniques` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '记录 ID',
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `technique_id` BIGINT NOT NULL COMMENT '功法 ID',
  `is_equipped` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否已装备',
  `acquired_at` DATETIME NOT NULL COMMENT '获得时间',
  `equipped_at` DATETIME DEFAULT NULL COMMENT '装备时间',
  `unequipped_at` DATETIME DEFAULT NULL COMMENT '卸下时间',
  `created_at` DATETIME NOT NULL COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_technique` (`user_id`, `technique_id`),
  INDEX `idx_user_equipped` (`user_id`, `is_equipped`),
  INDEX `idx_role_equipped` (`role_id`, `is_equipped`),
  CONSTRAINT `fk_user_technique` FOREIGN KEY (`technique_id`) REFERENCES `cultivation_techniques` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户功法关联表';

-- ========================================
-- 3. 功法变更日志表 (用于追踪装备变更历史)
-- ========================================
CREATE TABLE IF NOT EXISTS `technique_change_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '日志 ID',
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `technique_id` BIGINT NOT NULL COMMENT '功法 ID',
  `action_type` VARCHAR(20) NOT NULL COMMENT '操作类型：EQUIP, UNEQUIP',
  `old_speed_bonus` DOUBLE DEFAULT 0 COMMENT '变更前总速度加成',
  `old_limit_bonus` BIGINT DEFAULT 0 COMMENT '变更前总上限加成',
  `new_speed_bonus` DOUBLE DEFAULT 0 COMMENT '变更后总速度加成',
  `new_limit_bonus` BIGINT DEFAULT 0 COMMENT '变更后总上限加成',
  `cultivation_task_id` BIGINT DEFAULT NULL COMMENT '关联的修炼任务 ID (如果正在修炼)',
  `cultivation_progress` DOUBLE DEFAULT 0 COMMENT '变更时的修炼进度 (0-100)',
  `current_xiuwei` INT DEFAULT 0 COMMENT '变更时的当前修为',
  `change_time` DATETIME NOT NULL COMMENT '变更时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_change_time` (`user_id`, `change_time`),
  INDEX `idx_role_change_time` (`role_id`, `change_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='功法变更日志表';

-- ========================================
-- 4. 初始化示例数据
-- ========================================

-- 插入一些示例功法
INSERT INTO `cultivation_techniques` (`name`, `description`, `speed_addition`, `speed_addition_flat`, `limit_addition`, `rarity`, `level_requirement`, `is_active`, `created_at`) VALUES
('基础吐纳法', '最基础的修炼功法，可略微提升修炼速度', 0.1, 0, 100, 'COMMON', 1, 1, NOW()),
('青元功', '青色元力运转之法，显著提升修炼效率', 0.25, 2, 500, 'UNCOMMON', 5, 1, NOW()),
('九天玄功', '上古传承功法，修炼速度大幅提升', 0.5, 5, 2000, 'RARE', 10, 1, NOW()),
('混沌诀', '混沌之力护体，修炼上限大幅提升', 0.3, 3, 5000, 'EPIC', 20, 1, NOW()),
('太虚真经', '传说中的太虚之道，全方位提升', 1.0, 10, 10000, 'LEGENDARY', 50, 1, NOW()),
('五行炼气诀', '五行之力相辅相成，均衡提升', 0.15, 1, 800, 'UNCOMMON', 8, 1, NOW()),
('星辰变', '引星辰之力入体，修炼速度极快', 0.8, 8, 8000, 'EPIC', 30, 1, NOW()),
('九转玄功', '九转轮回，突破极限', 0.4, 4, 3000, 'RARE', 15, 1, NOW());

-- ========================================
-- 5. 视图：用户当前功法加成汇总
-- ========================================
CREATE OR REPLACE VIEW `v_user_technique_bonus` AS
SELECT 
  ut.user_id,
  ut.role_id,
  COUNT(CASE WHEN ut.is_equipped = 1 THEN 1 END) as equipped_count,
  COALESCE(SUM(CASE WHEN ut.is_equipped = 1 THEN ct.speed_addition ELSE 0 END), 0.0) as total_speed_percentage,
  COALESCE(SUM(CASE WHEN ut.is_equipped = 1 THEN ct.speed_addition_flat ELSE 0 END), 0) as total_speed_flat,
  COALESCE(SUM(CASE WHEN ut.is_equipped = 1 THEN ct.limit_addition ELSE 0 END), 0) as total_limit_bonus
FROM user_techniques ut
JOIN cultivation_techniques ct ON ut.technique_id = ct.id
WHERE ct.is_active = 1
GROUP BY ut.user_id, ut.role_id;

-- 使用示例：
-- SELECT * FROM v_user_technique_bonus WHERE user_id = ?;
