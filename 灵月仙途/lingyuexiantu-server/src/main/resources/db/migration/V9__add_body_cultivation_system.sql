-- 创建锻体境界表
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

-- 创建身体部位表
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

-- 创建角色锻体进度表
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

-- 创建角色部位修炼进度表
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

-- 创建异变配置表
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

-- 创建锻体材料表
CREATE TABLE IF NOT EXISTS body_cultivation_material (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    material_name VARCHAR(50) NOT NULL COMMENT '材料名称',
    material_code VARCHAR(20) NOT NULL UNIQUE COMMENT '材料代码',
    effect_type VARCHAR(50) COMMENT '效果类型：BREAKTHROUGH_SUCCESS, PAIN_REDUCE, EXP_BOOST',
    effect_value VARCHAR(100) COMMENT '效果值',
    drop_rate DECIMAL(5,2) COMMENT '掉落率 (%)',
    status INT NOT NULL DEFAULT 1 COMMENT '状态：0-停用，1-启用'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='锻体材料配置表';

-- 检查并添加所有必要的列
DELIMITER //
CREATE PROCEDURE add_material_columns_if_not_exists()
BEGIN
    -- 检查description列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'body_cultivation_material' AND column_name = 'description') THEN
        ALTER TABLE body_cultivation_material ADD COLUMN description VARCHAR(500) COMMENT '材料描述' AFTER material_code;
    END IF;
    
    -- 检查effect_type列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'body_cultivation_material' AND column_name = 'effect_type') THEN
        ALTER TABLE body_cultivation_material ADD COLUMN effect_type VARCHAR(50) COMMENT '效果类型：BREAKTHROUGH_SUCCESS, PAIN_REDUCE, EXP_BOOST' AFTER description;
    END IF;
    
    -- 检查effect_value列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'body_cultivation_material' AND column_name = 'effect_value') THEN
        ALTER TABLE body_cultivation_material ADD COLUMN effect_value VARCHAR(100) COMMENT '效果值' AFTER effect_type;
    END IF;
    
    -- 检查drop_rate列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'body_cultivation_material' AND column_name = 'drop_rate') THEN
        ALTER TABLE body_cultivation_material ADD COLUMN drop_rate DECIMAL(6,2) COMMENT '掉落率 (%)' AFTER effect_value;
    ELSE
        -- 修改现有列的精度
        ALTER TABLE body_cultivation_material MODIFY COLUMN drop_rate DECIMAL(6,2) COMMENT '掉落率 (%)' AFTER effect_value;
    END IF;
    
    -- 检查status列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'body_cultivation_material' AND column_name = 'status') THEN
        ALTER TABLE body_cultivation_material ADD COLUMN status INT NOT NULL DEFAULT 1 COMMENT '状态：0-停用，1-启用' AFTER drop_rate;
    END IF;
END //
DELIMITER ;

CALL add_material_columns_if_not_exists();
DROP PROCEDURE IF EXISTS add_material_columns_if_not_exists;

-- 创建锻体修炼日志表（数据埋点）
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

-- 插入初始境界数据
INSERT INTO body_cultivation_realm (realm_name, realm_order, description, base_hp_bonus, base_defense_bonus, base_strength_bonus, 
    breakthrough_success_rate, required_exp, pain_growth_rate, mutation_probability, failure_penalty, status) VALUES
('锻体境', 1, '锻体初境，打磨肉身', 10, 5, 3, 90.00, 1000, 1.00, 0.00, 'NONE', 1),
('淬骨境', 2, '淬炼筋骨，脱胎换骨', 30, 15, 10, 80.00, 3000, 1.20, 2.00, 'INJURY', 1),
('易筋境', 3, '易筋洗髓，百病不侵', 60, 30, 20, 70.00, 8000, 1.50, 5.00, 'ATTR_DECAY', 1),
('洗髓境', 4, '洗经伐髓，超凡入圣', 120, 60, 40, 60.00, 20000, 2.00, 10.00, 'ATTR_DECAY', 1),
('金身境', 5, '铸就金身，坚不可摧', 300, 150, 100, 50.00, 50000, 2.50, 20.00, 'INJURY', 1),
('不灭境', 6, '肉身不灭，与天同寿', 1000, 500, 300, 40.00, 100000, 3.00, 30.00, 'ATTR_DECAY', 1);

-- 插入初始部位数据
INSERT INTO body_part (part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status) VALUES
('头部', 'HEAD', '头颅部位，包含五官', '精神', '感知', 100, 1.2, 50, 1),
('颈部', 'NECK', '连接头部与躯干', '敏捷', '精神', 80, 1.15, 50, 1),
('躯干', 'TORSO', '身体主干部分', '气血', '防御', 150, 1.25, 50, 1),
('左臂', 'LEFT_ARM', '左侧手臂', '力量', '敏捷', 100, 1.2, 50, 1),
('右臂', 'RIGHT_ARM', '右侧手臂', '力量', '敏捷', 100, 1.2, 50, 1),
('左手', 'LEFT_HAND', '左侧手掌', '敏捷', '力量', 60, 1.1, 50, 1),
('右手', 'RIGHT_HAND', '右侧手掌', '敏捷', '力量', 60, 1.1, 50, 1),
('左腿', 'LEFT_LEG', '左侧腿部', '力量', '敏捷', 120, 1.2, 50, 1),
('右腿', 'RIGHT_LEG', '右侧腿部', '力量', '敏捷', 120, 1.2, 50, 1),
('双脚', 'FEET', '双足部位', '敏捷', '力量', 80, 1.15, 50, 1);

-- 插入初始异变数据
INSERT INTO body_mutation (mutation_name, mutation_code, description, rarity, effect_type, effect_value, status) VALUES
('钢筋铁骨', 'IRON_BONES', '骨骼坚硬如铁，防御大幅提升', 'COMMON', 'DEFENSE_BOOST', 'defense_multiplier:1.5', 1),
('龙象之力', 'DRAGON_STRENGTH', '拥有龙象般的力量，攻击力增强', 'RARE', 'STRENGTH_BOOST', 'strength_multiplier:1.5', 1),
('凤凰涅槃', 'PHOENIX_REBIRTH', '濒死时自动复活一次', 'EPIC', 'AUTO_REVIVE', 'revive_cooldown:300', 1),
('金刚不坏', 'DIAMOND_BODY', '肉身金刚不坏，所有抗性提升', 'LEGENDARY', 'ALL_RESIST', 'all_resist:50%', 1),
('气血如海', 'OCEAN_BLOOD', '气血如海洋般浩瀚，生命力暴涨', 'RARE', 'HP_BOOST', 'hp_multiplier:2.0', 1),
('神速', 'GOD_SPEED', '身法速度如神，闪避率大幅提升', 'EPIC', 'SPEED_BOOST', 'speed_multiplier:1.8, dodge_rate:30%', 1);

-- 插入初始材料数据
INSERT INTO body_cultivation_material (material_name, material_code, description, effect_type, effect_value, drop_rate, status) VALUES
('锻体石', 'BODY_STONE', '普通的锻体材料', 'EXP_BOOST', 'exp_multiplier:1.2', 30.00, 1),
('淬骨草', 'BONE_HERB', '淬炼筋骨的灵草', 'BREAKTHROUGH_SUCCESS', 'success_rate_bonus:10%', 20.00, 1),
('易筋花', 'TENDON_FLOWER', '易筋洗髓的奇花', 'BREAKTHROUGH_SUCCESS', 'success_rate_bonus:20%', 10.00, 1),
('洗髓果', 'MARROW_FRUIT', '洗经伐髓的圣果', 'BREAKTHROUGH_SUCCESS', 'success_rate_bonus:30%', 5.00, 1),
('金精', 'GOLD_ESSENCE', '铸造金身的精华', 'PAIN_REDUCE', 'pain_reduction:50', 2.00, 1),
('不灭灵液', 'IMMORTAL_FLUID', '通往不灭境的灵液', 'EXP_BOOST', 'exp_multiplier:2.0', 1.00, 1);
