-- ============================================
-- 系统配置 - 属性计算相关配置
-- ============================================

-- 插入属性上限配置
INSERT INTO `t_cfg_numerical_rules` (`config_key`, `config_version`, `content`, `description`, `updated_by`)
VALUES ('stat_caps', 1, '{"crit_rate": 0.6, "dodge_rate": 0.45, "hit_rate": 0.95}', '属性上限配置', 'system')
ON DUPLICATE KEY UPDATE `content` = '{"crit_rate": 0.6, "dodge_rate": 0.45, "hit_rate": 0.95}', `description` = '属性上限配置', `updated_by` = 'system';

-- 插入公式系数配置
INSERT INTO `t_cfg_numerical_rules` (`config_key`, `config_version`, `content`, `description`, `updated_by`)
VALUES ('formula_coef', 1, '{"hp_base": 100, "atk_spirit": 8, "atk_vit": 1, "def_vit": 5, "def_agi": 2, "speed": 10, "crit_luck": 0.001, "crit_spirit": 0.0002, "dodge": 0.005, "hit_base": 0.9, "hit_agi": 0.003, "exp_base": 1.0, "exp_wis": 0.01}', '属性计算公式系数配置', 'system')
ON DUPLICATE KEY UPDATE `content` = '{"hp_base": 100, "atk_spirit": 8, "atk_vit": 1, "def_vit": 5, "def_agi": 2, "speed": 10, "crit_luck": 0.001, "crit_spirit": 0.0002, "dodge": 0.005, "hit_base": 0.9, "hit_agi": 0.003, "exp_base": 1.0, "exp_wis": 0.01}', `description` = '属性计算公式系数配置', `updated_by` = 'system';

-- 插入境界系数配置
INSERT INTO `t_cfg_numerical_rules` (`config_key`, `config_version`, `content`, `description`, `updated_by`)
VALUES ('realm_mult', 1, '{"1": {"name": "练气期", "hp_mul": 1.0, "atk_mul": 1.0, "def_mul": 1.0, "weight": 1}, "2": {"name": "筑基期", "hp_mul": 2.0, "atk_mul": 2.0, "def_mul": 1.5, "weight": 2}, "3": {"name": "金丹期", "hp_mul": 4.0, "atk_mul": 4.0, "def_mul": 3.0, "weight": 4}, "4": {"name": "元婴期", "hp_mul": 8.0, "atk_mul": 8.0, "def_mul": 6.0, "weight": 8}, "5": {"name": "化神期", "hp_mul": 16.0, "atk_mul": 16.0, "def_mul": 12.0, "weight": 16}}', '境界系数配置', 'system')
ON DUPLICATE KEY UPDATE `content` = '{"1": {"name": "练气期", "hp_mul": 1.0, "atk_mul": 1.0, "def_mul": 1.0, "weight": 1}, "2": {"name": "筑基期", "hp_mul": 2.0, "atk_mul": 2.0, "def_mul": 1.5, "weight": 2}, "3": {"name": "金丹期", "hp_mul": 4.0, "atk_mul": 4.0, "def_mul": 3.0, "weight": 4}, "4": {"name": "元婴期", "hp_mul": 8.0, "atk_mul": 8.0, "def_mul": 6.0, "weight": 8}, "5": {"name": "化神期", "hp_mul": 16.0, "atk_mul": 16.0, "def_mul": 12.0, "weight": 16}}', `description` = '境界系数配置', `updated_by` = 'system';
