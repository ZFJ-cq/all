-- 灵月仙途 - 修炼系统数据库迁移脚本
-- 创建时间：2026-03-23

-- 创建修炼任务表
CREATE TABLE IF NOT EXISTS `cultivation_tasks` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '任务 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `start_time` DATETIME NOT NULL COMMENT '开始时间',
  `end_time` DATETIME NOT NULL COMMENT '结束时间',
  `expected_xiuwei` INT NOT NULL COMMENT '预期修为',
  `actual_xiuwei` INT NOT NULL DEFAULT 0 COMMENT '实际获得修为',
  `efficiency_multiplier` DOUBLE NOT NULL DEFAULT 1.0 COMMENT '效率倍数',
  `status` VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' COMMENT '状态：ACTIVE, COMPLETED, INTERRUPTED',
  `boost_type` VARCHAR(20) DEFAULT NULL COMMENT '加速类型：NONE, LINGSHI, PILL',
  `created_at` DATETIME NOT NULL COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_cultivation_task_role_id` (`role_id`),
  INDEX `idx_cultivation_task_status` (`status`),
  INDEX `idx_cultivation_task_end_time` (`end_time`),
  CONSTRAINT `fk_cultivation_role` FOREIGN KEY (`role_id`) REFERENCES `game_role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='修炼任务表';

-- 添加索引以提升查询性能
CREATE INDEX `idx_role_status_end` ON `cultivation_tasks` (`role_id`, `status`, `end_time`);

-- 初始化数据说明
-- 1. 新角色首次进入修炼页面时，会自动创建一个 ACTIVE 状态的任务
-- 2. 离线收益通过 processOfflineCultivation 接口计算
-- 3. 修为资源通过 role_resource 表存储，resource_type 表中应有 xiuwei 类型

-- 验证查询示例
-- SELECT * FROM cultivation_tasks WHERE role_id = ? AND status = 'ACTIVE' ORDER BY end_time DESC LIMIT 1;
-- SELECT SUM(actual_xiuwei) as total_xiuwei FROM cultivation_tasks WHERE role_id = ? AND status = 'COMPLETED';
