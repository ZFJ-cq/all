-- ============================================
-- 任务系统增强 V10
-- 功能：完整的日常任务、循环任务、活跃度系统
-- ============================================

-- 1. 更新 task 表，添加完整字段以匹配 Task 实体类
DELIMITER //
CREATE PROCEDURE update_task_table()
BEGIN
    -- 检查并添加 id 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'id') THEN
        ALTER TABLE `task` ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;
    END IF;
    
    -- 检查并修改 name 列
    IF EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'name') THEN
        ALTER TABLE `task` MODIFY COLUMN `name` VARCHAR(100) NOT NULL;
    ELSE
        ALTER TABLE `task` ADD COLUMN `name` VARCHAR(100) NOT NULL;
    END IF;
    
    -- 检查并修改 description 列
    IF EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'description') THEN
        ALTER TABLE `task` MODIFY COLUMN `description` TEXT;
    ELSE
        ALTER TABLE `task` ADD COLUMN `description` TEXT;
    END IF;
    
    -- 检查并添加 task_type 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'task_type') THEN
        ALTER TABLE `task` ADD COLUMN `task_type` VARCHAR(20) NOT NULL COMMENT '任务类型：daily/main/achievement';
    END IF;
    
    -- 检查并添加 condition_type 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'condition_type') THEN
        ALTER TABLE `task` ADD COLUMN `condition_type` VARCHAR(50) COMMENT '任务条件类型';
    END IF;
    
    -- 检查并添加 condition_value 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'condition_value') THEN
        ALTER TABLE `task` ADD COLUMN `condition_value` INT COMMENT '目标值';
    END IF;
    
    -- 检查并添加 activity_points 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'activity_points') THEN
        ALTER TABLE `task` ADD COLUMN `activity_points` INT COMMENT '活跃度奖励';
    END IF;
    
    -- 检查并添加 rewards 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'rewards') THEN
        ALTER TABLE `task` ADD COLUMN `rewards` JSON COMMENT '奖励 JSON';
    END IF;
    
    -- 检查并添加 sort_order 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'sort_order') THEN
        ALTER TABLE `task` ADD COLUMN `sort_order` INT DEFAULT 0 COMMENT '排序';
    END IF;
    
    -- 检查并添加 is_active 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'is_active') THEN
        ALTER TABLE `task` ADD COLUMN `is_active` TINYINT DEFAULT 1 COMMENT '是否激活';
    END IF;
    
    -- 检查并添加 create_time 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'create_time') THEN
        ALTER TABLE `task` ADD COLUMN `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
    END IF;
    
    -- 检查并添加 update_time 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'task' AND column_name = 'update_time') THEN
        ALTER TABLE `task` ADD COLUMN `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
    END IF;
END //
DELIMITER ;

CALL update_task_table();
DROP PROCEDURE IF EXISTS update_task_table;

-- 2. 更新 role_task 表，添加完整字段
DELIMITER //
CREATE PROCEDURE update_role_task_table()
BEGIN
    -- 检查并添加 id 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'id') THEN
        ALTER TABLE `role_task` ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;
    END IF;
    
    -- 检查并修改 role_id 列
    IF EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'role_id') THEN
        ALTER TABLE `role_task` MODIFY COLUMN `role_id` BIGINT NOT NULL;
    ELSE
        ALTER TABLE `role_task` ADD COLUMN `role_id` BIGINT NOT NULL;
    END IF;
    
    -- 检查并修改 task_id 列
    IF EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'task_id') THEN
        ALTER TABLE `role_task` MODIFY COLUMN `task_id` BIGINT NOT NULL;
    ELSE
        ALTER TABLE `role_task` ADD COLUMN `task_id` BIGINT NOT NULL;
    END IF;
    
    -- 检查并添加 progress 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'progress') THEN
        ALTER TABLE `role_task` ADD COLUMN `progress` INT DEFAULT 0 COMMENT '进度';
    END IF;
    
    -- 检查并添加 status 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'status') THEN
        ALTER TABLE `role_task` ADD COLUMN `status` VARCHAR(20) DEFAULT 'ACCEPTED' COMMENT '状态：ACCEPTED/COMPLETED/CLAIMED';
    END IF;
    
    -- 检查并添加 accept_time 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'accept_time') THEN
        ALTER TABLE `role_task` ADD COLUMN `accept_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '接取时间';
    END IF;
    
    -- 检查并添加 complete_time 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'complete_time') THEN
        ALTER TABLE `role_task` ADD COLUMN `complete_time` DATETIME COMMENT '完成时间';
    END IF;
    
    -- 检查并添加 claim_time 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'claim_time') THEN
        ALTER TABLE `role_task` ADD COLUMN `claim_time` DATETIME COMMENT '领取时间';
    END IF;
    
    -- 检查并添加 created_at 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'created_at') THEN
        ALTER TABLE `role_task` ADD COLUMN `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间';
    END IF;
    
    -- 检查并添加 updated_at 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'role_task' AND column_name = 'updated_at') THEN
        ALTER TABLE `role_task` ADD COLUMN `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';
    END IF;
END //
DELIMITER ;

CALL update_role_task_table();
DROP PROCEDURE IF EXISTS update_role_task_table;

-- 3. 创建玩家活跃度表
CREATE TABLE IF NOT EXISTS `role_activity` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `daily_activity` INT NOT NULL DEFAULT 0 COMMENT '今日活跃度',
  `total_activity` INT NOT NULL DEFAULT 0 COMMENT '总活跃度',
  `claimed_rewards` VARCHAR(500) COMMENT '已领取奖励ID列表',
  `daily_reset_time` DATETIME COMMENT '每日重置时间',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_id` (`role_id`),
  INDEX `idx_daily_activity` (`daily_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='玩家活跃度表';

-- 4. 创建活跃度奖励配置表
CREATE TABLE IF NOT EXISTS `activity_reward` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `activity_threshold` INT NOT NULL COMMENT '活跃度阈值',
  `name` VARCHAR(200) NOT NULL COMMENT '奖励名称',
  `description` VARCHAR(500) COMMENT '描述',
  `reward_xiuwei` INT DEFAULT 0 COMMENT '奖励修为',
  `reward_lingshi` INT DEFAULT 0 COMMENT '奖励灵石',
  `reward_items` VARCHAR(2000) COMMENT '奖励物品',
  `is_enabled` TINYINT DEFAULT 1 COMMENT '是否启用',
  `sort_order` INT DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_threshold` (`activity_threshold`),
  INDEX `idx_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活跃度奖励配置表';

-- 5. 创建任务日志表（数据埋点）
CREATE TABLE IF NOT EXISTS `task_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `task_id` BIGINT COMMENT '任务ID',
  `action_type` VARCHAR(50) NOT NULL COMMENT '操作类型：ACCEPT-接取/COMPLETE-完成/CLAIM-领取/ABANDON-放弃',
  `loop_count` INT DEFAULT 0 COMMENT '循环次数',
  `time_spent` INT COMMENT '耗时（秒）',
  `progress_before` INT COMMENT '操作前进度',
  `progress_after` INT COMMENT '操作后进度',
  `reward_info` VARCHAR(2000) COMMENT '奖励信息',
  `ip_address` VARCHAR(50) COMMENT 'IP地址',
  `user_agent` VARCHAR(500) COMMENT '用户代理',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_task_id` (`task_id`),
  INDEX `idx_action_type` (`action_type`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务操作日志表';

-- 6. 创建每日任务重置记录表
CREATE TABLE IF NOT EXISTS `daily_task_reset` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色ID',
  `reset_date` DATE NOT NULL COMMENT '重置日期',
  `daily_tasks_accepted` INT DEFAULT 0 COMMENT '今日接取任务数',
  `daily_tasks_completed` INT DEFAULT 0 COMMENT '今日完成任务数',
  `total_loop_count` INT DEFAULT 0 COMMENT '今日总循环次数',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_date` (`role_id`, `reset_date`),
  INDEX `idx_reset_date` (`reset_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日任务重置记录表';

-- 7. 插入初始任务数据
INSERT IGNORE INTO `task` (`name`, `description`, `task_type`, `condition_type`, `condition_value`, `activity_points`, `rewards`, `sort_order`, `is_active`)
VALUES 
  ('采集草药', '在野外采集5株草药', 'daily', 'COLLECT', 5, 10, '{"xiuwei": 100, "lingshi": 50}', 1, 1),
  ('击杀妖兽', '击败3只练气期妖兽', 'daily', 'HUNT', 3, 15, '{"xiuwei": 150, "lingshi": 80}', 2, 1),
  ('强化装备', '强化任意装备1次', 'daily', 'INTERACT', 1, 20, '{"xiuwei": 200, "lingshi": 100}', 3, 1),
  ('消耗灵石', '消耗100灵石', 'daily', 'CONSUME', 100, 10, '{"xiuwei": 80, "lingshi": 0}', 4, 1),
  ('循环修炼', '每日修炼任务（可重复完成）', 'daily', 'COLLECT', 1, 5, '{"xiuwei": 50, "lingshi": 20}', 5, 1);

-- 8. 插入活跃度奖励配置
INSERT IGNORE INTO `activity_reward` (`activity_threshold`, `name`, `description`, `reward_xiuwei`, `reward_lingshi`, `is_enabled`, `sort_order`)
VALUES 
  (20, '活跃宝箱Ⅰ', '活跃度达到20点可领取', 200, 100, 1, 1),
  (40, '活跃宝箱Ⅱ', '活跃度达到40点可领取', 500, 300, 1, 2),
  (60, '活跃宝箱Ⅲ', '活跃度达到60点可领取', 1000, 500, 1, 3),
  (80, '活跃宝箱Ⅳ', '活跃度达到80点可领取', 2000, 1000, 1, 4),
  (100, '活跃宝箱Ⅴ', '活跃度达到100点可领取', 5000, 2000, 1, 5);
