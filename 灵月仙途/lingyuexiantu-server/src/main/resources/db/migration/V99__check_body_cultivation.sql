-- 灵月仙途 - 锻体系统数据库检查和修复脚本
-- 用于确保所有必要的表和数据都存在

-- 1. 检查并创建锻体境界表
CREATE TABLE IF NOT EXISTS body_cultivation_realm (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    realm_name VARCHAR(50) NOT NULL COMMENT '境界名称',
    realm_order INT NOT NULL COMMENT '境界顺序',
    description VARCHAR(500) COMMENT '境界描述',
    base_hp_bonus INT NOT NULL DEFAULT 0 COMMENT '基础气血加成',
    base_defense_bonus INT NOT NULL DEFAULT 0 COMMENT '基础防御加成',
    base_strength_bonus INT NOT NULL DEFAULT 0 COMMENT '基础力量加成',
    breakthrough_success_rate DECIMAL(5,2) NOT NULL COMMENT '突破成功率 (%)',
    required_exp BIGINT NOT NULL COMMENT '所需锻体经验',
    pain_growth_rate DECIMAL(5,2) NOT NULL COMMENT '痛苦值增长率',
    mutation_probability DECIMAL(5,2) NOT NULL COMMENT '异变觉醒概率 (%)',
    failure_penalty VARCHAR(20) COMMENT '失败惩罚：INJURY-重伤，ATTR_DECAY-属性衰减',
    status INT NOT NULL DEFAULT 1 COMMENT '状态：0-停用，1-启用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='锻体境界配置表';

-- 2. 检查并创建身体部位表
CREATE TABLE IF NOT EXISTS body_part (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_name VARCHAR(50) NOT NULL COMMENT '部位名称',
    part_code VARCHAR(20) NOT NULL UNIQUE COMMENT '部位代码',
    description VARCHAR(500) COMMENT '部位描述',
    primary_attr VARCHAR(20) COMMENT '主属性',
    secondary_attr VARCHAR(20) COMMENT '副属性',
    base_exp_requirement INT NOT NULL COMMENT '基础经验需求',
    exp_growth_rate DECIMAL(5,2) NOT NULL COMMENT '经验成长率',
    max_level INT NOT NULL COMMENT '最大等级',
    status INT NOT NULL DEFAULT 1 COMMENT '状态：0-停用，1-启用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='锻体部位配置表';

-- 3. 检查并创建角色锻体进度表
CREATE TABLE IF NOT EXISTS role_body_cultivation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL UNIQUE COMMENT '角色 ID',
    realm_id BIGINT NOT NULL COMMENT '当前境界 ID',
    body_exp BIGINT NOT NULL DEFAULT 0 COMMENT '锻体经验',
    pain_value DECIMAL(10,2) NOT NULL DEFAULT 0.00 COMMENT '痛苦值',
    tolerance INT NOT NULL DEFAULT 0 COMMENT '耐受度',
    mutation_id BIGINT COMMENT '异变 ID',
    status INT NOT NULL DEFAULT 1 COMMENT '状态：0-重伤，1-正常',
    injury_recovery_time DATETIME COMMENT '重伤恢复时间',
    total_cultivate_count INT NOT NULL DEFAULT 0 COMMENT '总修炼次数',
    total_breakthrough_count INT NOT NULL DEFAULT 0 COMMENT '总突破次数',
    failed_breakthrough_count INT NOT NULL DEFAULT 0 COMMENT '失败突破次数',
    last_cultivate_time DATETIME COMMENT '最后修炼时间',
    FOREIGN KEY (realm_id) REFERENCES body_cultivation_realm(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色锻体进度表';

-- 4. 检查并创建角色部位修炼进度表
CREATE TABLE IF NOT EXISTS role_body_part_progress (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL COMMENT '角色 ID',
    part_id BIGINT NOT NULL COMMENT '部位 ID',
    level INT NOT NULL DEFAULT 1 COMMENT '部位等级',
    exp BIGINT NOT NULL DEFAULT 0 COMMENT '部位经验',
    cultivate_count INT NOT NULL DEFAULT 0 COMMENT '修炼次数',
    is_locked INT NOT NULL DEFAULT 0 COMMENT '是否锁定：0-否，1-是',
    UNIQUE KEY uk_role_part (role_id, part_id),
    FOREIGN KEY (part_id) REFERENCES body_part(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色部位修炼进度表';

-- 5. 检查并创建异变配置表
CREATE TABLE IF NOT EXISTS body_mutation (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mutation_name VARCHAR(50) NOT NULL COMMENT '异变名称',
    mutation_code VARCHAR(20) NOT NULL UNIQUE COMMENT '异变代码',
    description VARCHAR(500) COMMENT '异变描述',
    rarity VARCHAR(10) NOT NULL COMMENT '稀有度：COMMON, RARE, EPIC, LEGENDARY',
    effect_type VARCHAR(50) COMMENT '效果类型',
    effect_value VARCHAR(100) COMMENT '效果值',
    status INT NOT NULL DEFAULT 1 COMMENT '状态：0-停用，1-启用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='锻体异变配置表';

-- 6. 检查并创建锻体材料表
CREATE TABLE IF NOT EXISTS body_cultivation_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_name VARCHAR(50) NOT NULL COMMENT '材料名称',
    material_code VARCHAR(20) NOT NULL UNIQUE COMMENT '材料代码',
    description VARCHAR(500) COMMENT '材料描述',
    effect_type VARCHAR(50) COMMENT '效果类型：BREAKTHROUGH_SUCCESS, PAIN_REDUCE, EXP_BOOST',
    effect_value VARCHAR(100) COMMENT '效果值',
    drop_rate DECIMAL(6,2) COMMENT '掉落率 (%)',
    status INT NOT NULL DEFAULT 1 COMMENT '状态：0-停用，1-启用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='锻体材料配置表';

-- 7. 检查并创建锻体修炼日志表
CREATE TABLE IF NOT EXISTS body_cultivation_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL COMMENT '角色 ID',
    action_type VARCHAR(50) NOT NULL COMMENT '操作类型：CULTIVATE, BREAKTHROUGH',
    realm_id BIGINT COMMENT '境界 ID',
    part_id BIGINT COMMENT '部位 ID',
    success INT NOT NULL DEFAULT 1 COMMENT '是否成功：0-否，1-是',
    pain_value_before DECIMAL(10,2) COMMENT '修炼前痛苦值',
    pain_value_after DECIMAL(10,2) COMMENT '修炼后痛苦值',
    tolerance_before INT COMMENT '修炼前耐受度',
    tolerance_after INT COMMENT '修炼后耐受度',
    exp_gained BIGINT COMMENT '获得经验',
    materials_consumed TEXT COMMENT '消耗材料 JSON',
    result_description VARCHAR(500) COMMENT '结果描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_role_time (role_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='锻体修炼日志表';

-- 8. 如果境界表为空，插入初始数据
INSERT INTO body_cultivation_realm (realm_name, realm_order, description, base_hp_bonus, base_defense_bonus, base_strength_bonus, 
    breakthrough_success_rate, required_exp, pain_growth_rate, mutation_probability, failure_penalty, status) 
SELECT * FROM (SELECT 1, '锻体境', 1, '锻体初境，打磨肉身', 10, 5, 3, 90.00, 1000, 1.00, 0.00, 'NONE', 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM body_cultivation_realm LIMIT 1);

-- 9. 如果部位表为空，插入简化后的部位数据（四肢、五脏）
INSERT INTO body_part (part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status)
SELECT * FROM (SELECT 1, '四肢', 'limbs', '手臂与腿部力量锤炼', '力量', '敏捷', 100, 1.2, 50, 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM body_part LIMIT 1);

INSERT INTO body_part (part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status)
SELECT * FROM (SELECT 2, '五脏', 'organs', '心肝脾肺肾内脏淬炼', '气血', '防御', 150, 1.25, 50, 1) AS tmp
WHERE NOT EXISTS (SELECT 2 FROM body_part LIMIT 1);

-- 10. 如果异变表为空，插入初始数据
INSERT INTO body_mutation (mutation_name, mutation_code, description, rarity, effect_type, effect_value, status)
SELECT * FROM (SELECT 1, '钢筋铁骨', 'IRON_BONES', '骨骼坚硬如铁，防御大幅提升', 'COMMON', 'DEFENSE_BOOST', 'defense_multiplier:1.5', 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM body_mutation LIMIT 1);

-- 11. 如果材料表为空，插入初始数据
INSERT INTO body_cultivation_material (material_name, material_code, description, effect_type, effect_value, drop_rate, status)
SELECT * FROM (SELECT 1, '锻体石', 'BODY_STONE', '普通的锻体材料', 'EXP_BOOST', 'exp_multiplier:1.2', 30.00, 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM body_cultivation_material LIMIT 1);
