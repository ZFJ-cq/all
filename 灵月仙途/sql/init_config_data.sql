-- 初始化配置数据

-- 检查并创建 t_cfg_numerical_rules 表
CREATE TABLE IF NOT EXISTS t_cfg_numerical_rules (
    config_key VARCHAR(64) NOT NULL PRIMARY KEY,
    config_version INT DEFAULT 1 NOT NULL,
    content JSON NOT NULL,
    description VARCHAR(255),
    updated_by VARCHAR(32),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化公式系数配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('formula_coef', 1, '{"hp_base": 100, "atk_spirit": 8, "atk_vit": 1, "def_vit": 5, "def_agi": 2, "speed": 10, "crit_luck": 0.001, "crit_spirit": 0.0002, "dodge": 0.005, "hit_base": 0.9, "hit_agi": 0.003, "exp_base": 1.0, "exp_wis": 0.01}', '公式系数配置', 'system', NOW());

-- 初始化境界系数配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('realm_mult', 1, '{"1": {"name": "凡人", "hp_mul": 1.0, "atk_mul": 1.0, "def_mul": 1.0, "weight": 1}, "2": {"name": "练气期", "hp_mul": 1.5, "atk_mul": 1.5, "def_mul": 1.5, "weight": 2}, "3": {"name": "筑基期", "hp_mul": 2.0, "atk_mul": 2.0, "def_mul": 2.0, "weight": 3}, "4": {"name": "金丹期", "hp_mul": 3.0, "atk_mul": 3.0, "def_mul": 3.0, "weight": 4}, "5": {"name": "元婴期", "hp_mul": 4.0, "atk_mul": 4.0, "def_mul": 4.0, "weight": 5}, "6": {"name": "化神期", "hp_mul": 5.0, "atk_mul": 5.0, "def_mul": 5.0, "weight": 6}, "7": {"name": "合体期", "hp_mul": 6.0, "atk_mul": 6.0, "def_mul": 6.0, "weight": 7}, "8": {"name": "大乘期", "hp_mul": 7.0, "atk_mul": 7.0, "def_mul": 7.0, "weight": 8}, "9": {"name": "渡劫期", "hp_mul": 8.0, "atk_mul": 8.0, "def_mul": 8.0, "weight": 9}, "10": {"name": "仙人", "hp_mul": 10.0, "atk_mul": 10.0, "def_mul": 10.0, "weight": 10}}', '境界系数配置', 'system', NOW());

-- 初始化属性上限配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('stat_caps', 1, '{"crit_rate": 0.60, "dodge_rate": 0.45, "hit_rate": 0.95}', '属性上限配置', 'system', NOW());

-- 初始化境界突破配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('realm_breakthrough', 1, '{"凡人": {"next": "练气期", "requiredLevel": 10, "requiredSpirit": 100, "successRate": 1.0, "failurePenalty": 0, "lifespan": 100}, "练气期": {"next": "筑基期", "requiredLevel": 30, "requiredSpirit": 500, "successRate": 0.8, "failurePenalty": 5, "lifespan": 200}, "筑基期": {"next": "金丹期", "requiredLevel": 60, "requiredSpirit": 1500, "successRate": 0.6, "failurePenalty": 10, "lifespan": 300}, "金丹期": {"next": "元婴期", "requiredLevel": 100, "requiredSpirit": 3000, "successRate": 0.4, "failurePenalty": 15, "lifespan": 500}, "元婴期": {"next": "化神期", "requiredLevel": 150, "requiredSpirit": 6000, "successRate": 0.3, "failurePenalty": 20, "lifespan": 800}, "化神期": {"next": "合体期", "requiredLevel": 210, "requiredSpirit": 10000, "successRate": 0.2, "failurePenalty": 25, "lifespan": 1200}, "合体期": {"next": "大乘期", "requiredLevel": 280, "requiredSpirit": 15000, "successRate": 0.15, "failurePenalty": 30, "lifespan": 1800}, "大乘期": {"next": "渡劫期", "requiredLevel": 360, "requiredSpirit": 25000, "successRate": 0.1, "failurePenalty": 35, "lifespan": 2500}, "渡劫期": {"next": "仙人", "requiredLevel": 450, "requiredSpirit": 50000, "successRate": 0.05, "failurePenalty": 40, "lifespan": 5000}, "仙人": {"next": null, "requiredLevel": 0, "requiredSpirit": 0, "successRate": 0, "failurePenalty": 0, "lifespan": 99999}}', '境界突破配置', 'system', NOW());

-- 初始化初始基础属性配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('initial_base_stats', 1, '{"vit": 10, "spi": 10, "agi": 10, "wis": 10, "lck": 10}', '初始基础属性配置', 'system', NOW());

-- 初始化灵根影响配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES ('spirit_root_bonus', 1, '{"金灵根": {"spi": 5}, "木灵根": {"vit": 5}, "水灵根": {"wis": 5}, "火灵根": {"agi": 5}, "土灵根": {"vit": 3, "def": 2}}', '灵根对基础属性的影响', 'system', NOW());

-- 完成消息
SELECT '✅ 配置数据初始化完成！' AS message;