-- 宗门技能表
CREATE TABLE IF NOT EXISTS clan_skill (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  clan_id BIGINT NOT NULL COMMENT '宗门ID',
  skill_name VARCHAR(50) NOT NULL COMMENT '技能名称',
  skill_level INT DEFAULT 1 COMMENT '技能等级',
  skill_effect VARCHAR(200) COMMENT '技能效果',
  required_level INT DEFAULT 1 COMMENT '学习所需宗门等级',
  required_contribution BIGINT DEFAULT 0 COMMENT '学习所需贡献',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_clan_id (clan_id)
) COMMENT='宗门技能表';

-- 角色宗门技能表
CREATE TABLE IF NOT EXISTS role_clan_skill (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  role_id BIGINT NOT NULL COMMENT '角色ID',
  clan_skill_id BIGINT NOT NULL COMMENT '宗门技能ID',
  skill_level INT DEFAULT 1 COMMENT '技能等级',
  learn_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_role_id (role_id),
  INDEX idx_clan_skill_id (clan_skill_id)
) COMMENT='角色宗门技能表';
