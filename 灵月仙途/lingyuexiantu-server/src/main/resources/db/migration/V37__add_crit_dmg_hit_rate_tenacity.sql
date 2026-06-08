ALTER TABLE t_role_attribute_cache ADD COLUMN crit_dmg DECIMAL(10,4) DEFAULT 150.0000 COMMENT '暴击伤害 (%)' AFTER dodge_rate;
ALTER TABLE t_role_attribute_cache ADD COLUMN hit_rate DECIMAL(10,4) DEFAULT 100.0000 COMMENT '命中率 (%)' AFTER crit_dmg;
ALTER TABLE t_role_attribute_cache ADD COLUMN tenacity DECIMAL(10,4) DEFAULT 0.0000 COMMENT '韧性/抗暴 (%)' AFTER hit_rate;

INSERT INTO cfg_attribute_rules (rule_key, rule_name, rule_type, attribute_type, formula, base_value, coeff_value, min_value, max_value, description, priority, is_active, version)
VALUES
('crit_dmg_base', '暴击伤害基础值', 1, 'critDmg', '150', 150.0000, NULL, 100.0000, 500.0000, '暴击伤害基础百分比', 11, 1, 1),
('crit_dmg_spi_coeff', '暴击伤害灵力系数', 1, 'critDmg', 'spi * 0.5', NULL, 0.5000, NULL, NULL, '灵力对暴击伤害的加成系数', 12, 1, 1),
('hit_rate_base', '命中率基础值', 1, 'hitRate', '100', 100.0000, NULL, 80.0000, 200.0000, '命中率基础百分比', 13, 1, 1),
('hit_rate_wis_coeff', '命中率悟性系数', 1, 'hitRate', 'wis * 0.3', NULL, 0.3000, NULL, NULL, '悟性对命中率的加成系数', 14, 1, 1),
('tenacity_coeff', '韧性根骨系数', 1, 'tenacity', 'vit * 0.2', NULL, 0.2000, NULL, NULL, '根骨对韧性的加成系数', 15, 1, 1)
ON DUPLICATE KEY UPDATE coeff_value = VALUES(coeff_value), base_value = VALUES(base_value);
