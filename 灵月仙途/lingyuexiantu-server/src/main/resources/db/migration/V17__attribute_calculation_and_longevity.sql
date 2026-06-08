-- ============================================
-- 灵月仙途 - 属性计算和寿命系统增强
-- 执行日期：2026-03-31
-- 说明：完整的属性计算规则和寿命管理
-- ============================================

-- ============================================
-- 第一部分：属性计算规则配置表
-- ============================================

-- 1.1 创建属性计算规则配置表
CREATE TABLE IF NOT EXISTS cfg_attribute_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    rule_key VARCHAR(50) NOT NULL COMMENT '规则标识 (如：hp_base, atk_spi_coeff)',
    rule_name VARCHAR(100) NOT NULL COMMENT '规则名称',
    rule_type TINYINT NOT NULL DEFAULT 1 COMMENT '规则类型：1-基础系数，2-境界倍率，3-特殊公式',
    attribute_type VARCHAR(20) COMMENT '属性类型：hp, atk, def, speed, crit, dodge, exp',
    formula VARCHAR(500) COMMENT '计算公式（可选，用于复杂计算）',
    base_value DECIMAL(10,4) COMMENT '基础值',
    coeff_value DECIMAL(10,4) COMMENT '系数值',
    min_value DECIMAL(10,4) DEFAULT 0 COMMENT '最小值',
    max_value DECIMAL(10,4) COMMENT '最大值',
    description VARCHAR(500) COMMENT '规则描述',
    priority INT DEFAULT 0 COMMENT '优先级（数值越大优先级越高）',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    version INT DEFAULT 1 COMMENT '版本号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_rule_key (rule_key),
    INDEX idx_attribute_type (attribute_type),
    INDEX idx_rule_type (rule_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='属性计算规则配置表';

-- 1.2 创建境界属性倍率表
CREATE TABLE IF NOT EXISTS cfg_realm_attribute_mult (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    realm_name VARCHAR(50) NOT NULL COMMENT '境界名称',
    realm_level INT NOT NULL COMMENT '境界等级 (1=炼气，2=筑基，3=金丹，4=元婴，5=化神，6=炼虚，7=合体，8=大乘，9=渡劫)',
    hp_mult DECIMAL(10,4) DEFAULT 1.0 COMMENT '血量倍率',
    atk_mult DECIMAL(10,4) DEFAULT 1.0 COMMENT '攻击倍率',
    def_mult DECIMAL(10,4) DEFAULT 1.0 COMMENT '防御倍率',
    speed_mult DECIMAL(10,4) DEFAULT 1.0 COMMENT '速度倍率',
    crit_mult DECIMAL(10,4) DEFAULT 1.0 COMMENT '暴击倍率',
    dodge_mult DECIMAL(10,4) DEFAULT 1.0 COMMENT '闪避倍率',
    exp_mult DECIMAL(10,4) DEFAULT 1.0 COMMENT '经验倍率',
    max_age INT DEFAULT 100 COMMENT '该境界最大年龄',
    description VARCHAR(200) COMMENT '描述',
    UNIQUE KEY uk_realm_level (realm_level),
    INDEX idx_realm_name (realm_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='境界属性倍率表';

-- 1.3 创建属性缓存表（存储实时计算结果）
CREATE TABLE IF NOT EXISTS t_role_attribute_cache (
    role_id BIGINT PRIMARY KEY COMMENT '角色 ID',
    hp BIGINT DEFAULT 0 COMMENT '生命值',
    hp_max BIGINT DEFAULT 0 COMMENT '最大生命值',
    mp BIGINT DEFAULT 0 COMMENT '法力值',
    mp_max BIGINT DEFAULT 0 COMMENT '最大法力值',
    atk BIGINT DEFAULT 0 COMMENT '攻击力',
    def BIGINT DEFAULT 0 COMMENT '防御力',
    speed BIGINT DEFAULT 0 COMMENT '速度',
    crit_rate DECIMAL(10,4) DEFAULT 0 COMMENT '暴击率 (%)',
    dodge_rate DECIMAL(10,4) DEFAULT 0 COMMENT '闪避率 (%)',
    exp_bonus DECIMAL(10,4) DEFAULT 1.0 COMMENT '经验加成倍率',
    total_vit BIGINT DEFAULT 0 COMMENT '总根骨',
    total_spi BIGINT DEFAULT 0 COMMENT '总灵力',
    total_agi BIGINT DEFAULT 0 COMMENT '总身法',
    total_wis BIGINT DEFAULT 0 COMMENT '总悟性',
    total_lck BIGINT DEFAULT 0 COMMENT '总气运',
    equipment_bonus TEXT COMMENT '装备加成 JSON',
    skill_bonus TEXT COMMENT '技能加成 JSON',
    buff_bonus TEXT COMMENT 'Buff 加成 JSON',
    calc_version BIGINT DEFAULT 0 COMMENT '计算版本号',
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '计算时间',
    expires_at DATETIME COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_calculated_at (calculated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色属性缓存表';

-- ============================================
-- 第二部分：寿命系统增强
-- ============================================

-- 2.1 为 game_role 表添加寿命相关字段
ALTER TABLE game_role 
ADD COLUMN IF NOT EXISTS age INT DEFAULT 18 COMMENT '当前年龄' AFTER level,

ADD COLUMN IF NOT EXISTS max_age INT DEFAULT 100 COMMENT '最大年龄（寿元）' AFTER age,

ADD COLUMN IF NOT EXISTS life_status TINYINT DEFAULT 0 COMMENT '生命状态：0-存活，1-坐化中，2-已故' AFTER max_age,

ADD COLUMN IF NOT EXISTS death_time DATETIME COMMENT '死亡时间' AFTER life_status,

ADD COLUMN IF NOT EXISTS reincarnation_count INT DEFAULT 0 COMMENT '轮回次数' AFTER death_time,

ADD COLUMN IF NOT EXISTS cultivation_base DECIMAL(10,4) DEFAULT 1.0 COMMENT '修炼资质系数' AFTER reincarnation_count,

ADD COLUMN IF NOT EXISTS longevity_bonus INT DEFAULT 0 COMMENT '寿命加成（来自丹药、功法等）' AFTER cultivation_base;

-- 2.2 添加索引优化查询
CREATE INDEX IF NOT EXISTS idx_game_role_age ON game_role(age);
CREATE INDEX IF NOT EXISTS idx_game_role_life_status ON game_role(life_status);

-- 2.3 创建寿命日志表（记录年龄增长、突破延寿等事件）
CREATE TABLE IF NOT EXISTS t_longevity_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    role_id BIGINT NOT NULL COMMENT '角色 ID',
    event_type TINYINT NOT NULL COMMENT '事件类型：1-年龄增长，2-突破延寿，3-丹药延寿，4-坐化，5-轮回',
    old_age INT COMMENT '事件前年龄',
    new_age INT COMMENT '事件后年龄',
    old_max_age INT COMMENT '事件前最大年龄',
    new_max_age INT COMMENT '事件后最大年龄',
    old_status TINYINT COMMENT '事件前状态',
    new_status TINYINT COMMENT '事件后状态',
    description VARCHAR(500) COMMENT '事件描述',
    extra_data JSON COMMENT '额外数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_role_id (role_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='寿命事件日志表';

-- ============================================
-- 第三部分：初始化配置数据
-- ============================================

-- 3.1 插入属性计算规则
INSERT INTO cfg_attribute_rules (rule_key, rule_name, rule_type, attribute_type, base_value, coeff_value, description) VALUES
-- HP 计算规则
('hp_base', 'HP 基础系数', 1, 'hp', 100.0, 1.0, 'HP = 根骨 × 100'),
('hp_vit_coeff', 'HP 根骨系数', 1, 'hp', 0.0, 1.0, '每点根骨增加的基础 HP'),

-- ATK 计算规则
('atk_spi_coeff', '攻击灵力系数', 1, 'atk', 0.0, 8.0, '每点灵力增加的攻击力'),
('atk_vit_coeff', '攻击根骨系数', 1, 'atk', 0.0, 1.0, '每点根骨增加的攻击力'),

-- DEF 计算规则
('def_vit_coeff', '防御根骨系数', 1, 'def', 0.0, 5.0, '每点根骨增加的防御力'),
('def_agi_coeff', '防御身法系数', 1, 'def', 0.0, 2.0, '每点身法增加的防御力'),

-- Speed 计算规则
('speed_coeff', '速度系数', 1, 'speed', 0.0, 10.0, '每点身法增加的速度'),

-- Crit Rate 计算规则
('crit_lck_coeff', '暴击气运系数', 1, 'crit', 0.0, 0.001, '每点气运增加的暴击率 (0.1%)'),
('crit_spi_coeff', '暴击灵力系数', 1, 'crit', 0.0, 0.0002, '每点灵力增加的暴击率 (0.02%)'),

-- Dodge Rate 计算规则
('dodge_coeff', '闪避系数', 1, 'dodge', 0.0, 0.005, '每点身法增加的闪避率 (0.5%)'),

-- Exp Bonus 计算规则
('exp_base', '经验基础倍率', 1, 'exp', 1.0, 0.0, '基础经验倍率'),
('exp_wis_coeff', '经验悟性系数', 1, 'exp', 0.0, 0.01, '每点悟性增加的经验加成 (1%)');

-- 3.2 插入境界属性倍率
INSERT INTO cfg_realm_attribute_mult (realm_name, realm_level, hp_mult, atk_mult, def_mult, speed_mult, crit_mult, dodge_mult, exp_mult, max_age) VALUES
('凡人', 0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 100),
('炼气', 1, 1.5, 1.2, 1.2, 1.0, 1.0, 1.0, 1.2, 120),
('筑基', 2, 2.5, 2.0, 2.0, 1.1, 1.1, 1.1, 1.5, 150),
('金丹', 3, 4.0, 3.5, 3.5, 1.2, 1.2, 1.2, 2.0, 200),
('元婴', 4, 6.5, 5.5, 5.5, 1.3, 1.3, 1.3, 3.0, 300),
('化神', 5, 10.0, 8.5, 8.5, 1.5, 1.5, 1.5, 5.0, 500),
('炼虚', 6, 15.0, 13.0, 13.0, 1.7, 1.7, 1.7, 8.0, 800),
('合体', 7, 22.0, 20.0, 20.0, 2.0, 2.0, 2.0, 12.0, 1200),
('大乘', 8, 35.0, 32.0, 32.0, 2.5, 2.5, 2.5, 20.0, 2000),
('渡劫', 9, 50.0, 50.0, 50.0, 3.0, 3.0, 3.0, 50.0, 5000);

-- ============================================
-- 第四部分：初始化示例数据（角色 ID: 45）
-- ============================================

-- 4.1 为角色 45 初始化属性缓存数据
INSERT INTO t_role_attribute_cache (
    role_id, hp, hp_max, mp, mp_max, atk, def, speed, 
    crit_rate, dodge_rate, exp_bonus,
    total_vit, total_spi, total_agi, total_wis, total_lck,
    calc_version, calculated_at
)
SELECT 
    45,
    1500, 1500,  -- HP, HP Max
    500, 500,    -- MP, MP Max
    180,         -- ATK
    120,         -- DEF
    100,         -- Speed
    5.50,        -- Crit Rate (%)
    5.00,        -- Dodge Rate (%)
    1.15,        -- Exp Bonus
    120,         -- Total Vit (根骨)
    100,         -- Total Spi (灵力)
    100,         -- Total Agi (身法)
    15,          -- Total Wis (悟性)
    50,          -- Total Lck (气运)
    1,           -- Calc Version
    NOW()        -- Calculated At
WHERE NOT EXISTS (SELECT 1 FROM t_role_attribute_cache WHERE role_id = 45);

-- 4.2 更新 game_role 表的寿命字段（角色 ID: 45）
UPDATE game_role 
SET 
    age = 18,
    max_age = 100,
    life_status = 0,
    reincarnation_count = 0,
    cultivation_base = 1.0,
    longevity_bonus = 0
WHERE id = 45;

-- ============================================
-- 完成消息
-- ============================================
SELECT '✅ 属性计算和寿命系统增强完成！' AS message;
SELECT '📊 属性规则数量：' || COUNT(*) FROM cfg_attribute_rules AS msg;
SELECT '📊 境界倍率数量：' || COUNT(*) FROM cfg_realm_attribute_mult AS msg;
SELECT '📊 属性缓存角色数：' || COUNT(*) FROM t_role_attribute_cache AS msg;
