-- 宗门申请表
CREATE TABLE IF NOT EXISTS sect_apply (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL COMMENT '申请人ID',
  sect_id BIGINT NOT NULL COMMENT '目标宗门ID',
  message VARCHAR(200) COMMENT '申请留言',
  status TINYINT DEFAULT 0 COMMENT '状态:0待审核,1同意,2拒绝',
  apply_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  handle_time DATETIME COMMENT '处理时间',
  handler_id BIGINT COMMENT '处理人ID(宗主或长老)',
  INDEX idx_sect_status (sect_id, status)
) COMMENT='宗门申请表';

-- 完善宗门表
ALTER TABLE clans ADD COLUMN IF NOT EXISTS spirit_stone BIGINT DEFAULT 0 COMMENT '宗门灵石';
ALTER TABLE clans ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 50 COMMENT '最大成员数';
ALTER TABLE clans ADD COLUMN IF NOT EXISTS required_level INT DEFAULT 1 COMMENT '加入所需等级';

-- 完善宗门成员表
ALTER TABLE clan_member ADD COLUMN IF NOT EXISTS total_contribution BIGINT DEFAULT 0 COMMENT '累计贡献';
ALTER TABLE clan_member ADD COLUMN IF NOT EXISTS last_login_time DATETIME COMMENT '最后登录时间';
ALTER TABLE clan_member ADD COLUMN IF NOT EXISTS is_approved TINYINT DEFAULT 1 COMMENT '是否已审批';

-- 创建唯一索引，确保一个角色只能加入一个宗门
ALTER TABLE clan_member ADD UNIQUE INDEX IF NOT EXISTS uk_role_id (role_id);
