-- 初始化配置数据

-- 检查并创建 t_cfg_numerical_rules 表
CREATE TABLE IF NOT EXISTS t_cfg_numerical_rules (
    config_key VARCHAR(100) PRIMARY KEY,
    config_version INT NOT NULL,
    content TEXT NOT NULL,
    description VARCHAR(255),
    updated_by VARCHAR(100),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化公式系数配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('formula_coef', 1, '{"hp_base": 100, "atk_spirit": 8, "atk_vit": 1, "def_vit": 5, "def_agi": 2, "speed": 10, "crit_luck": 0.001, "crit_spirit": 0.0002, "dodge": 0.005, "hit_base": 0.9, "hit_agi": 0.003, "exp_base": 1.0, "exp_wis": 0.01}', '公式系数配置', 'system', NOW());

-- 初始化属性上限配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('stat_caps', 1, '{"hp": 999999, "attack": 99999, "defense": 99999, "speed": 9999, "crit": 100, "dodge": 100}', '属性上限配置', 'system', NOW());

-- 初始化境界系数配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('realm_mult', 1, '{"凡人": 1, "练气期": 2, "筑基期": 3, "金丹期": 5, "元婴期": 8, "化神期": 13, "合体期": 21, "大乘期": 34, "渡劫期": 55, "真仙": 89}', '境界系数配置', 'system', NOW());

-- 初始化境界突破配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('realm_breakthrough', 1, '{"凡人": {"lifespan": 100, "requiredCultivation": 0}, "练气期": {"lifespan": 200, "requiredCultivation": 1000}, "筑基期": {"lifespan": 300, "requiredCultivation": 5000}, "金丹期": {"lifespan": 500, "requiredCultivation": 10000}, "元婴期": {"lifespan": 800, "requiredCultivation": 20000}, "化神期": {"lifespan": 1300, "requiredCultivation": 40000}, "合体期": {"lifespan": 2100, "requiredCultivation": 80000}, "大乘期": {"lifespan": 3400, "requiredCultivation": 160000}, "渡劫期": {"lifespan": 5500, "requiredCultivation": 320000}, "真仙": {"lifespan": 8900, "requiredCultivation": 640000}}', '境界突破配置', 'system', NOW());

-- 完成消息
SELECT '✅ 配置数据初始化完成！' AS message;