-- ============================================
-- 境界技能容量配置表
-- 定义不同境界对应的最大技能学习数量
-- ============================================

CREATE TABLE IF NOT EXISTS `cfg_realm_skill_capacity` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    `realm_name` VARCHAR(50) NOT NULL COMMENT '境界名称',
    `realm_level` INT NOT NULL COMMENT '境界等级（数字越大境界越高）',
    `max_skills` INT NOT NULL DEFAULT 10 COMMENT '最大技能数量',
    `description` VARCHAR(200) COMMENT '描述',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_realm_level` (`realm_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='境界技能容量配置表';

-- 初始化境界技能容量数据
INSERT INTO `cfg_realm_skill_capacity` (`realm_name`, `realm_level`, `max_skills`, `description`) VALUES
('练气期', 1, 5, '初入仙道，根基尚浅，最多可习得 5 个技能'),
('筑基期', 2, 10, '道基初成，神识扩展，最多可习得 10 个技能'),
('金丹期', 3, 15, '金丹凝结，悟性提升，最多可习得 15 个技能'),
('元婴期', 4, 20, '元婴化形，神通知广，最多可习得 20 个技能'),
('化神期', 5, 25, '化神入虚，通达天地，最多可习得 25 个技能'),
('炼虚期', 6, 30, '炼虚合道，虚空自在，最多可习得 30 个技能'),
('合体期', 7, 35, '合体归一，万法相通，最多可习得 35 个技能'),
('大乘期', 8, 40, '大乘圆满，接近仙道，最多可习得 40 个技能'),
('渡劫期', 9, 45, '渡劫问鼎，超凡入圣，最多可习得 45 个技能');

-- ============================================
-- 技能书简物品配置
-- ============================================

INSERT INTO `item` (`item_name`, `item_type`, `item_category`, `rarity`, `description`, `icon`, `effect_type`, `effect_value`, `max_stack`, `is_consumable`, `created_at`) VALUES
('技能书简', 'SPECIAL', 'TOOL', 'RARE', '用于遗忘已习得的技能，使用后技能将被移除并返还部分熟练度', '📜', 'FORGET_SKILL', '0', 99, TRUE, NOW());
