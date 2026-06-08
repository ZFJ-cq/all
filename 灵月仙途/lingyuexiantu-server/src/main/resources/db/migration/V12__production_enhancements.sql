-- ============================================
-- 生产级重构 - 数据库迁移脚本 V12
-- 功能：乐观锁、幂等性、审计日志、性能优化
-- ============================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- 1. 添加乐观锁版本号字段
-- ============================================

DELIMITER //
CREATE PROCEDURE add_version_columns()
BEGIN
    -- 为 role_resource 表添加版本号字段
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_resource' AND column_name = 'version') THEN
        ALTER TABLE `role_resource` ADD COLUMN `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号' AFTER `quantity`;
    END IF;
    
    -- 为 role_resource 表添加版本号索引
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'role_resource' AND index_name = 'idx_version') THEN
        ALTER TABLE `role_resource` ADD INDEX `idx_version` (`version`);
    END IF;
    
    -- 为 role_achievement 表添加版本号字段
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_achievement' AND column_name = 'version') THEN
        ALTER TABLE `role_achievement` ADD COLUMN `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号' AFTER `is_equipped`;
    END IF;
    
    -- 为 role_achievement 表添加版本号索引
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'role_achievement' AND index_name = 'idx_version') THEN
        ALTER TABLE `role_achievement` ADD INDEX `idx_version` (`version`);
    END IF;
    
    -- 为 clan_member 表添加版本号字段
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'clan_member' AND column_name = 'version') THEN
        ALTER TABLE `clan_member` ADD COLUMN `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号' AFTER `status`;
    END IF;
    
    -- 为 clan_member 表添加版本号索引
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'clan_member' AND index_name = 'idx_version') THEN
        ALTER TABLE `clan_member` ADD INDEX `idx_version` (`version`);
    END IF;
    
    -- 为 game_role 表添加版本号字段
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'game_role' AND column_name = 'version') THEN
        ALTER TABLE `game_role` ADD COLUMN `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号' AFTER `updated_at`;
    END IF;
    
    -- 为 game_role 表添加版本号索引
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'game_role' AND index_name = 'idx_version') THEN
        ALTER TABLE `game_role` ADD INDEX `idx_version` (`version`);
    END IF;
END //
DELIMITER ;

CALL add_version_columns();
DROP PROCEDURE IF EXISTS add_version_columns;

-- ============================================
-- 2. 添加幂等性和审计字段
-- ============================================

DELIMITER //
CREATE PROCEDURE add_idempotency_columns()
BEGIN
    -- 为 role_achievement 表添加幂等性和审计字段
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_achievement' AND column_name = 'claimed_request_id') THEN
        ALTER TABLE `role_achievement` ADD COLUMN `claimed_request_id` VARCHAR(64) COMMENT '领取奖励请求 ID (幂等性)' AFTER `claimed_time`;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_achievement' AND column_name = 'claimed_ip') THEN
        ALTER TABLE `role_achievement` ADD COLUMN `claimed_ip` VARCHAR(50) COMMENT '领取奖励 IP 地址' AFTER `claimed_request_id`;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_achievement' AND column_name = 'completed_ip') THEN
        ALTER TABLE `role_achievement` ADD COLUMN `completed_ip` VARCHAR(50) COMMENT '成就完成 IP 地址' AFTER `claimed_ip`;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_achievement' AND column_name = 'trace_id') THEN
        ALTER TABLE `role_achievement` ADD COLUMN `trace_id` VARCHAR(64) COMMENT '分布式追踪 ID' AFTER `completed_ip`;
    END IF;
    
    -- 为 breakthrough_history 表添加幂等性和审计字段
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'breakthrough_history' AND column_name = 'request_id') THEN
        ALTER TABLE `breakthrough_history` ADD COLUMN `request_id` VARCHAR(64) COMMENT '突破请求 ID (幂等性)' AFTER `create_time`;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'breakthrough_history' AND column_name = 'trace_id') THEN
        ALTER TABLE `breakthrough_history` ADD COLUMN `trace_id` VARCHAR(64) COMMENT '分布式追踪 ID' AFTER `request_id`;
    END IF;
    
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'breakthrough_history' AND column_name = 'operator_ip') THEN
        ALTER TABLE `breakthrough_history` ADD COLUMN `operator_ip` VARCHAR(50) COMMENT '操作 IP' AFTER `trace_id`;
    END IF;
END //
DELIMITER ;

CALL add_idempotency_columns();
DROP PROCEDURE IF EXISTS add_idempotency_columns;

-- ============================================
-- 3. 创建成就领取记录表 (独立审计表)
-- ============================================

DROP TABLE IF EXISTS `achievement_claim_record`;

CREATE TABLE `achievement_claim_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `achievement_id` BIGINT NOT NULL COMMENT '成就 ID',
  `request_id` VARCHAR(64) NOT NULL COMMENT '请求 ID (幂等性)',
  `reward_items` JSON COMMENT '奖励物品 JSON [{itemId, quantity}]',
  `reward_attributes` VARCHAR(500) COMMENT '奖励属性 JSON {attack:10,defense:5}',
  `title_granted` VARCHAR(50) COMMENT '授予称号名称',
  `claim_ip` VARCHAR(50) COMMENT '领取 IP 地址',
  `claim_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' COMMENT '状态：SUCCESS/FAILED',
  `error_message` VARCHAR(500) COMMENT '错误信息',
  `trace_id` VARCHAR(64) COMMENT '分布式追踪 ID',
  `version` INT NOT NULL DEFAULT 0 COMMENT '版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_request_id` (`request_id`) COMMENT '请求 ID 唯一索引 (幂等性)',
  KEY `idx_role_id` (`role_id`),
  KEY `idx_achievement_id` (`achievement_id`),
  KEY `idx_claim_time` (`claim_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成就领取记录表 (审计用)';

-- ============================================
-- 4. 创建资源操作日志表
-- ============================================

DROP TABLE IF EXISTS `resource_operation_log`;

CREATE TABLE `resource_operation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `trace_id` VARCHAR(64) NOT NULL COMMENT '分布式追踪 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `resource_type_id` BIGINT NOT NULL COMMENT '资源类型 ID',
  `resource_type_code` VARCHAR(50) COMMENT '资源类型代码 (如：xiuwei, lingshi)',
  `operation_type` VARCHAR(20) NOT NULL COMMENT '操作类型：ADD/CONSUME',
  `quantity` BIGINT NOT NULL COMMENT '操作数量',
  `balance_before` BIGINT COMMENT '操作前余额',
  `balance_after` BIGINT COMMENT '操作后余额',
  `business_type` VARCHAR(50) COMMENT '业务类型：BREAKTHROUGH/CULTIVATION/TRADE/ACHIEVEMENT',
  `business_id` VARCHAR(64) COMMENT '业务 ID (如：突破记录 ID)',
  `operator_ip` VARCHAR(50) COMMENT '操作 IP',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `remark` VARCHAR(500) COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `idx_trace_id` (`trace_id`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_business` (`business_type`, `business_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源操作日志表';

-- ============================================
-- 5. 创建审计日志表
-- ============================================

DROP TABLE IF EXISTS `audit_log`;

CREATE TABLE `audit_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `trace_id` VARCHAR(64) NOT NULL COMMENT '分布式追踪 ID',
  `module` VARCHAR(50) NOT NULL COMMENT '模块：ACHIEVEMENT/BREAKTHROUGH/CLAN/TRADE',
  `operation` VARCHAR(100) NOT NULL COMMENT '操作名称',
  `role_id` BIGINT COMMENT '角色 ID',
  `operator_ip` VARCHAR(50) COMMENT '操作 IP',
  `request_params` JSON COMMENT '请求参数 JSON',
  `old_value` JSON COMMENT '旧值 JSON',
  `new_value` JSON COMMENT '新值 JSON',
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' COMMENT '状态：SUCCESS/FAILED',
  `error_message` VARCHAR(500) COMMENT '错误信息',
  `execution_time_ms` INT COMMENT '执行耗时 (毫秒)',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_trace_id` (`trace_id`),
  KEY `idx_module` (`module`),
  KEY `idx_role_id` (`role_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='审计日志表';

-- ============================================
-- 6. 创建宗门操作日志表
-- ============================================

DROP TABLE IF EXISTS `clan_operation_log`;

CREATE TABLE `clan_operation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `trace_id` VARCHAR(64) NOT NULL COMMENT '分布式追踪 ID',
  `clan_id` BIGINT NOT NULL COMMENT '宗门 ID',
  `operator_role_id` BIGINT NOT NULL COMMENT '操作人角色 ID',
  `operator_position` INT COMMENT '操作人职位',
  `target_role_id` BIGINT COMMENT '目标角色 ID (可为空)',
  `operation_type` VARCHAR(50) NOT NULL COMMENT '操作类型：POSITION_CHANGE/WAR_START/WAREHOUSE_OPERATE',
  `operation_detail` VARCHAR(500) COMMENT '操作详情',
  `request_id` VARCHAR(64) COMMENT '请求 ID (幂等性)',
  `operator_ip` VARCHAR(50) COMMENT '操作 IP',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  `status` VARCHAR(20) NOT NULL DEFAULT 'SUCCESS' COMMENT '状态',
  PRIMARY KEY (`id`),
  KEY `idx_clan_id` (`clan_id`),
  KEY `idx_operator_id` (`operator_role_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门操作日志表';

-- ============================================
-- 7. 添加复合索引 (优化查询性能)
-- ============================================

DELIMITER //
CREATE PROCEDURE add_optimization_indexes()
BEGIN
    -- 成就查询优化
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'role_achievement' AND index_name = 'idx_role_status_achievement') THEN
        ALTER TABLE `role_achievement` ADD INDEX `idx_role_status_achievement` (`role_id`, `status`, `achievement_id`);
    END IF;
    
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'role_achievement' AND index_name = 'idx_achievement_status_claimed') THEN
        ALTER TABLE `role_achievement` ADD INDEX `idx_achievement_status_claimed` (`achievement_id`, `status`, `claimed_time`);
    END IF;
    
    -- 宗门成员查询优化
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'clan_member' AND index_name = 'idx_clan_position_status') THEN
        ALTER TABLE `clan_member` ADD INDEX `idx_clan_position_status` (`clan_id`, `position`, `status`);
    END IF;
    
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'clan_member' AND index_name = 'idx_role_clan_status') THEN
        ALTER TABLE `clan_member` ADD INDEX `idx_role_clan_status` (`role_id`, `clan_id`, `status`);
    END IF;
    
    -- 突破历史查询优化
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'breakthrough_history' AND index_name = 'idx_role_success_time') THEN
        ALTER TABLE `breakthrough_history` ADD INDEX `idx_role_success_time` (`role_id`, `is_success`, `create_time`);
    END IF;
    
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'breakthrough_history' AND index_name = 'idx_request_id') THEN
        ALTER TABLE `breakthrough_history` ADD INDEX `idx_request_id` (`request_id`);
    END IF;
    
    -- 资源查询优化
    IF NOT EXISTS (SELECT * FROM information_schema.statistics WHERE table_name = 'role_resource' AND index_name = 'idx_role_type_version') THEN
        ALTER TABLE `role_resource` ADD INDEX `idx_role_type_version` (`role_id`, `resource_type_id`, `version`);
    END IF;
END //
DELIMITER ;

CALL add_optimization_indexes();
DROP PROCEDURE IF EXISTS add_optimization_indexes;

-- ============================================
-- 8. 数据修复：初始化版本号
-- ============================================

UPDATE `role_resource` SET `version` = 0 WHERE `version` IS NULL;
UPDATE `role_achievement` SET `version` = 0 WHERE `version` IS NULL;
UPDATE `clan_member` SET `version` = 0 WHERE `version` IS NULL;
UPDATE `game_role` SET `version` = 0 WHERE `version` IS NULL;

-- ============================================
-- 脚本执行完成
-- ============================================

SET FOREIGN_KEY_CHECKS = 1;

SELECT '生产级数据库迁移完成！' AS status;
