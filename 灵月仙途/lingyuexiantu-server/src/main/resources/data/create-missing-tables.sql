-- ============================================
-- 灵月仙途 - 手动创建缺失的表
-- ============================================

-- 1. 创建 sys_role 表（如果不存在）
CREATE TABLE IF NOT EXISTS `sys_role` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `role_code` VARCHAR(50) NOT NULL COMMENT '角色代码',
  `description` VARCHAR(200) COMMENT '角色描述',
  `role_level` INT DEFAULT 1 COMMENT '角色级别',
  `data_scope` VARCHAR(20) DEFAULT 'ALL' COMMENT '数据范围',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `status` INT DEFAULT 1 COMMENT '状态',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统角色表';

-- 2. 创建 sys_user 表（如果不存在）
CREATE TABLE IF NOT EXISTS `sys_user` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(100) NOT NULL,
  `nickname` VARCHAR(50) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `status` INT DEFAULT 1,
  `avatar` VARCHAR(255),
  `last_login_time` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户表';

-- 3. 创建 sys_user_role 表（如果不存在）
CREATE TABLE IF NOT EXISTS `sys_user_role` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `role_id` BIGINT NOT NULL,
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户角色关联表';

-- 4. 创建 equipment 表（如果不存在）
CREATE TABLE IF NOT EXISTS `equipment` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '装备名称',
  `type` VARCHAR(50) NOT NULL COMMENT '类型：weapon/armor/accessory',
  `rarity` INT NOT NULL DEFAULT 1 COMMENT '稀有度：1-普通，2-优秀，3-精良，4-史诗，5-传说',
  `level_require` INT NOT NULL DEFAULT 1 COMMENT '等级要求',
  `combat_bonus` INT DEFAULT 0 COMMENT '战力加成',
  `attack_bonus` INT DEFAULT 0 COMMENT '攻击加成',
  `defense_bonus` INT DEFAULT 0 COMMENT '防御加成',
  `hp_bonus` INT DEFAULT 0 COMMENT '气血加成',
  `mp_bonus` INT DEFAULT 0 COMMENT '法力加成',
  `description` VARCHAR(500) COMMENT '描述',
  `is_tradable` INT DEFAULT 1 COMMENT '是否可交易',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='装备表';

-- 5. 创建 item 表（如果不存在）
CREATE TABLE IF NOT EXISTS `item` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '物品名称',
  `type` VARCHAR(50) NOT NULL COMMENT '类型',
  `rarity` INT NOT NULL DEFAULT 1 COMMENT '稀有度',
  `effect_type` VARCHAR(50) COMMENT '效果类型',
  `effect_value` INT DEFAULT 0 COMMENT '效果值',
  `description` VARCHAR(500) COMMENT '描述',
  `is_usable` INT DEFAULT 1 COMMENT '是否可使用',
  `is_tradable` INT DEFAULT 1 COMMENT '是否可交易',
  `stack_limit` INT DEFAULT 99 COMMENT '堆叠上限',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='物品表';

-- 6. 创建 activity 表（如果不存在）
CREATE TABLE IF NOT EXISTS `activity` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(200) NOT NULL COMMENT '活动名称',
  `description` VARCHAR(1000) COMMENT '活动描述',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `status` INT DEFAULT 1 COMMENT '状态：0-未开始 1-进行中 2-已结束',
  `type` INT COMMENT '活动类型',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动表';

-- 7. 创建 system_setting 表（如果不存在）
CREATE TABLE IF NOT EXISTS `system_setting` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `setting_key` VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
  `setting_value` VARCHAR(500) COMMENT '配置值',
  `description` VARCHAR(500) COMMENT '描述',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统设置表';

-- 8. 创建 asset_types 表（如果不存在）
CREATE TABLE IF NOT EXISTS `asset_types` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(50) NOT NULL UNIQUE COMMENT '类型代码',
  `name` VARCHAR(100) NOT NULL COMMENT '类型名称',
  `description` VARCHAR(500) COMMENT '描述',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资产类型表';

-- 9. 创建 clans 表（如果不存在）
CREATE TABLE IF NOT EXISTS `clans` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL COMMENT '宗门名称',
  `description` VARCHAR(1000) COMMENT '宗门描述',
  `logo` VARCHAR(255) COMMENT '宗门标志',
  `level` INT NOT NULL DEFAULT 1 COMMENT '宗门等级',
  `members_count` INT NOT NULL DEFAULT 0 COMMENT '成员数量',
  `contribution` INT NOT NULL DEFAULT 0 COMMENT '宗门贡献',
  `leader_name` VARCHAR(50) COMMENT '宗主名称',
  `leader_id` BIGINT COMMENT '宗主 ID',
  `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
  `location` VARCHAR(100) COMMENT '位置',
  `max_members` INT NOT NULL DEFAULT 100 COMMENT '最大成员数',
  `required_level` INT NOT NULL DEFAULT 1 COMMENT '加入要求等级',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门表';

-- 10. 创建 mail 表（如果不存在）
CREATE TABLE IF NOT EXISTS `mail` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '收件人 ID',
  `title` VARCHAR(200) NOT NULL COMMENT '邮件标题',
  `content` TEXT COMMENT '邮件内容',
  `type` INT COMMENT '邮件类型',
  `has_attachment` INT DEFAULT 0 COMMENT '是否有附件',
  `is_read` INT DEFAULT 0 COMMENT '是否已读',
  `send_time` DATETIME COMMENT '发送时间',
  `expire_time` DATETIME COMMENT '过期时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='邮件表';

SELECT '✅ 所有表创建完成！' AS message;
