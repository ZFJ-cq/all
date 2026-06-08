-- 锻体系统字段完善和日志功能实现
-- 执行时间：2026-03-27

-- 1. 角色锻体表添加缺失字段
ALTER TABLE `role_body_cultivation` 
ADD COLUMN IF NOT EXISTS `current_realm_id` BIGINT COMMENT '当前境界 ID' AFTER `realm_id`,
ADD COLUMN IF NOT EXISTS `total_exp` BIGINT DEFAULT 0 COMMENT '总经验' AFTER `realm_id`,
ADD COLUMN IF NOT EXISTS `pain_value` DECIMAL(10,2) DEFAULT 0 COMMENT '痛苦值' AFTER `total_exp`,
ADD COLUMN IF NOT EXISTS `tolerance` INT DEFAULT 0 COMMENT '耐受度' AFTER `pain_value`,
ADD COLUMN IF NOT EXISTS `status` INT DEFAULT 0 COMMENT '状态：0-正常，1-受伤' AFTER `tolerance`,
ADD COLUMN IF NOT EXISTS `injury_recovery_time` DATETIME COMMENT '受伤恢复时间' AFTER `status`,
ADD COLUMN IF NOT EXISTS `mutation_id` BIGINT COMMENT '当前异变 ID' AFTER `injury_recovery_time`,
ADD COLUMN IF NOT EXISTS `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间' AFTER `mutation_id`,
ADD COLUMN IF NOT EXISTS `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间' AFTER `create_time`;

-- 2. 部位进度表添加字段
ALTER TABLE `role_body_part_progress`
ADD COLUMN IF NOT EXISTS `cultivate_count` INT DEFAULT 0 COMMENT '修炼次数' AFTER `exp`,
ADD COLUMN IF NOT EXISTS `is_locked` TINYINT DEFAULT 0 COMMENT '是否锁定' AFTER `cultivate_count`,
ADD COLUMN IF NOT EXISTS `last_cultivate_time` DATETIME COMMENT '上次修炼时间' AFTER `is_locked`;

-- 3. 创建修炼日志表 (如果不存在)
CREATE TABLE IF NOT EXISTS `body_cultivation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `action_type` VARCHAR(50) NOT NULL COMMENT '操作类型：CULTIVATE/BREAKTHROUGH',
  `part_id` BIGINT COMMENT '部位 ID',
  `success` TINYINT DEFAULT 1 COMMENT '是否成功',
  `pain_value_before` DECIMAL(10,2) COMMENT '操作前痛苦值',
  `pain_value_after` DECIMAL(10,2) COMMENT '操作后痛苦值',
  `tolerance_before` INT COMMENT '操作前耐受度',
  `tolerance_after` INT COMMENT '操作后耐受度',
  `exp_gained` BIGINT COMMENT '获得经验',
  `qte_score` INT COMMENT 'QTE 分数',
  `result_description` VARCHAR(500) COMMENT '结果描述',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_role_time` (`role_id`, `create_time`),
  INDEX `idx_action_type` (`action_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='锻体修炼日志表';

-- 4. 添加锻体部位配置表数据 (如果不存在)
INSERT INTO `body_cultivation_part` 
(`part_name`, `part_code`, `description`, `primary_attr`, `secondary_attr`, `base_exp_requirement`, `exp_growth_rate`, `max_level`) 
VALUES
('双拳', 'FISTS', '双拳修炼，增强攻击力', 'attack', 'strength', 100, 1.2, 100),
('双腿', 'LEGS', '双腿修炼，增强速度', 'speed', 'agility', 100, 1.2, 100),
('双臂', 'ARMS', '双臂修炼，增强力量', 'strength', 'attack', 100, 1.2, 100),
('骨骼', 'BONES', '骨骼修炼，增强防御', 'defense', 'hp', 150, 1.3, 100),
('心脏', 'HEART', '心脏修炼，增强生命力', 'hp', 'recovery', 200, 1.5, 100),
('头脑', 'BRAIN', '头脑修炼，增强神识', 'spirit', 'wisdom', 200, 1.5, 100),
('双眼', 'EYES', '双眼修炼，增强洞察', 'perception', 'spirit', 150, 1.3, 100),
('双耳', 'EARS', '双耳修炼，增强听力', 'perception', 'spirit', 150, 1.3, 100),
('鼻窍', 'NOSE', '鼻窍修炼，增强嗅觉', 'perception', 'spirit', 150, 1.3, 100),
('舌窍', 'TONGUE', '舌窍修炼，增强味觉', 'perception', 'spirit', 150, 1.3, 100)
ON DUPLICATE KEY UPDATE part_name=VALUES(part_name);

-- 5. 添加锻体境界配置表数据 (如果不存在)
INSERT INTO `body_cultivation_realm` 
(`realm_name`, `realm_order`, `description`, `base_hp_bonus`, `base_defense_bonus`, `base_strength_bonus`, `breakthrough_success_rate`, `required_exp`, `pain_growth_rate`, `mutation_probability`, `failure_penalty`)
VALUES
('凡人之躯', 1, '普通人的身体', 10, 5, 5, 100.00, 0, 1.0, 0.00, '无'),
('淬体境', 2, '淬炼身体，打下基础', 50, 20, 15, 90.00, 1000, 1.2, 0.01, '轻微内伤'),
('锻骨境', 3, '锻造骨骼，坚如钢铁', 150, 50, 30, 80.00, 5000, 1.5, 0.03, '中度内伤'),
('洗髓境', 4, '洗涤骨髓，脱胎换骨', 400, 100, 60, 70.00, 20000, 2.0, 0.05, '重伤'),
('金身境', 5, '成就金身，百毒不侵', 1000, 200, 120, 60.00, 100000, 2.5, 0.08, '严重内伤'),
('不灭境', 6, '肉身不灭，与天地同寿', 3000, 500, 300, 50.00, 500000, 3.0, 0.12, '境界跌落')
ON DUPLICATE KEY UPDATE realm_name=VALUES(realm_name);

-- 6. 添加索引优化查询性能
ALTER TABLE `role_body_cultivation` 
ADD INDEX IF NOT EXISTS `idx_role_id` (`role_id`),
ADD INDEX IF NOT EXISTS `idx_realm_id` (`current_realm_id`);

ALTER TABLE `role_body_part_progress`
ADD INDEX IF NOT EXISTS `idx_role_part` (`role_id`, `part_id`);

-- 7. 初始化现有角色的锻体数据 (如果有现有角色)
INSERT INTO `role_body_cultivation` (`role_id`, `current_realm_id`, `total_exp`, `pain_value`, `tolerance`, `status`)
SELECT 
  r.id AS role_id,
  1 AS current_realm_id,  -- 默认从凡人之躯开始
  0 AS total_exp,
  0 AS pain_value,
  0 AS tolerance,
  0 AS status
FROM `game_role` r
LEFT JOIN `role_body_cultivation` rbc ON r.id = rbc.role_id
WHERE rbc.role_id IS NULL
ON DUPLICATE KEY UPDATE update_time=CURRENT_TIMESTAMP;

-- 8. 初始化现有角色的部位进度数据
INSERT INTO `role_body_part_progress` (`role_id`, `part_id`, `level`, `exp`, `cultivate_count`, `is_locked`)
SELECT 
  rbc.role_id,
  bcp.id AS part_id,
  1 AS level,
  0 AS exp,
  0 AS cultivate_count,
  0 AS is_locked
FROM `role_body_cultivation` rbc
CROSS JOIN `body_cultivation_part` bcp
LEFT JOIN `role_body_part_progress` rbpp ON rbc.role_id = rbpp.role_id AND bcp.id = rbpp.part_id
WHERE rbpp.part_id IS NULL
ON DUPLICATE KEY UPDATE update_time=CURRENT_TIMESTAMP;

-- 验证数据
SELECT '锻体部位配置' AS table_name, COUNT(*) AS count FROM body_cultivation_part
UNION ALL
SELECT '锻体境界配置', COUNT(*) FROM body_cultivation_realm
UNION ALL
SELECT '角色锻体数据', COUNT(*) FROM role_body_cultivation
UNION ALL
SELECT '部位进度数据', COUNT(*) FROM role_body_part_progress
UNION ALL
SELECT '修炼日志', COUNT(*) FROM body_cultivation_log;
