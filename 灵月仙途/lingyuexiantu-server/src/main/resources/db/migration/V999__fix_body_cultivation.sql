-- 修复锻体系统数据库问题
-- 用于确保所有必要的表和数据都存在

-- 1. 确保 body_cultivation_realm 表存在
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

-- 2. 确保 body_part 表存在
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

-- 3. 确保 role_body_cultivation 表存在
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

-- 4. 确保 role_body_part_progress 表存在
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

-- 5. 确保 body_cultivation_log 表存在
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
    result_description VARCHAR(500) COMMENT '结果描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_role_time (role_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='锻体修炼日志表';

-- 6. 插入初始境界数据（如果为空）
INSERT INTO body_cultivation_realm (realm_name, realm_order, description, base_hp_bonus, base_defense_bonus, base_strength_bonus, 
    breakthrough_success_rate, required_exp, pain_growth_rate, mutation_probability, failure_penalty, status)
SELECT * FROM (SELECT 1, '锻体境', 1, '锻体初境，打磨肉身', 10, 5, 3, 90.00, 1000, 1.00, 0.00, 'NONE', 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM body_cultivation_realm LIMIT 1);

-- 7. 插入初始部位数据（四肢、五脏）
INSERT INTO body_part (part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status)
SELECT * FROM (SELECT 1, '四肢', 'limbs', '手臂与腿部力量锤炼', '力量', '敏捷', 100, 1.2, 50, 1) AS tmp
WHERE NOT EXISTS (SELECT 1 FROM body_part LIMIT 1);

INSERT INTO body_part (part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status)
SELECT * FROM (SELECT 2, '五脏', 'organs', '心肝脾肺肾内脏淬炼', '气血', '防御', 150, 1.25, 50, 1) AS tmp
WHERE NOT EXISTS (SELECT 2 FROM body_part LIMIT 1);

-- 8. 为当前所有角色初始化锻体数据
INSERT INTO role_body_cultivation (role_id, realm_id, body_exp, pain_value, tolerance, status)
SELECT 
    r.id as role_id,
    1 as realm_id,
    0 as body_exp,
    0.00 as pain_value,
    0 as tolerance,
    1 as status
FROM game_role r
WHERE NOT EXISTS (
    SELECT 1 FROM role_body_cultivation rbc WHERE rbc.role_id = r.id
);

-- 9. 为当前所有角色初始化部位进度
INSERT INTO role_body_part_progress (role_id, part_id, level, exp, cultivate_count, is_locked)
SELECT 
    r.id as role_id,
    1 as part_id,
    1 as level,
    0 as exp,
    0 as cultivate_count,
    0 as is_locked
FROM game_role r
WHERE NOT EXISTS (
    SELECT 1 FROM role_body_part_progress rbpp WHERE rbpp.role_id = r.id AND rbpp.part_id = 1
);

INSERT INTO role_body_part_progress (role_id, part_id, level, exp, cultivate_count, is_locked)
SELECT 
    r.id as role_id,
    2 as part_id,
    1 as level,
    0 as exp,
    0 as cultivate_count,
    0 as is_locked
FROM game_role r
WHERE NOT EXISTS (
    SELECT 1 FROM role_body_part_progress rbpp WHERE rbpp.role_id = r.id AND rbpp.part_id = 2
);
