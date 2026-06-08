-- 创建技能表
CREATE TABLE IF NOT EXISTS skill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL COMMENT '技能名称',
    description VARCHAR(500) COMMENT '技能描述',
    skill_type VARCHAR(50) NOT NULL COMMENT '技能类型：攻击、防御、辅助、身法、功法',
    skill_level INT NOT NULL DEFAULT 1 COMMENT '技能等级',
    max_level INT NOT NULL DEFAULT 12 COMMENT '最大等级',
    attack_bonus INT DEFAULT 0 COMMENT '增加攻击力',
    defense_bonus INT DEFAULT 0 COMMENT '增加防御力',
    xiuwei_bonus INT DEFAULT 0 COMMENT '增加修为',
    spirit_power_bonus INT DEFAULT 0 COMMENT '增加神力',
    speed_bonus INT DEFAULT 0 COMMENT '增加速度',
    critical_bonus INT DEFAULT 0 COMMENT '增加暴击率',
    dodge_bonus INT DEFAULT 0 COMMENT '增加闪避率',
    status INT DEFAULT 1 COMMENT '状态：1 启用，0 禁用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能表';

-- 创建角色技能表
CREATE TABLE IF NOT EXISTS role_skill (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT NOT NULL COMMENT '角色 ID',
    skill_id BIGINT NOT NULL COMMENT '技能 ID',
    skill_level INT NOT NULL DEFAULT 1 COMMENT '技能等级',
    experience INT DEFAULT 0 COMMENT '技能熟练度',
    equipped BOOLEAN DEFAULT FALSE COMMENT '是否装备',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_id (role_id),
    INDEX idx_skill_id (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色技能表';

-- 插入一些初始技能数据
INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, status) VALUES
('基础剑法', '最基础的剑法招式，简单易学', '攻击', 1, 12, 100, 0, 50, 0, 0, 0, 0, 1),
('灵力护盾', '凝聚灵力形成护盾，抵御伤害', '防御', 1, 12, 0, 150, 30, 0, 0, 0, 0, 1),
('聚气诀', '快速聚集灵气的功法', '功法', 1, 12, 0, 0, 200, 50, 0, 0, 0, 1),
('瞬影步', '快速移动的身法', '身法', 1, 12, 0, 0, 50, 0, 100, 0, 50, 1),
('火球术', '操控火焰形成火球攻击敌人', '攻击', 1, 12, 200, 0, 80, 50, 0, 10, 0, 1),
('冰魄术', '极寒之力凝结成冰，冻结敌人', '攻击', 1, 12, 180, 0, 100, 80, 0, 5, 0, 1),
('金刚诀', '强化肉身的防御功法', '防御', 1, 12, 50, 300, 100, 0, 0, 0, 0, 1),
('天雷诀', '引动天雷之力，威力巨大', '攻击', 1, 12, 500, 0, 200, 100, 0, 20, 0, 1),
('五行遁术', '借助五行之力快速遁走', '辅助', 1, 12, 0, 100, 150, 0, 200, 0, 100, 1),
('九转玄功', '上古修炼功法，全面提升修为', '功法', 1, 12, 100, 100, 500, 200, 50, 10, 10, 1);
