-- ============================================
-- 创建 clan_member 表
-- 用于存储宗门成员信息
-- ============================================

CREATE TABLE IF NOT EXISTS `clan_member` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `clan_id` BIGINT NOT NULL COMMENT '宗门 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `position` INT DEFAULT 0 COMMENT '职位 (0:普通弟子，1:外门长老，2:内门长老，3:太上长老，4:宗主)',
  `contribution` INT DEFAULT 0 COMMENT '贡献度',
  `join_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `status` INT DEFAULT 1 COMMENT '状态 (0:离开，1:正常)',
  `total_contribution` BIGINT DEFAULT 0 COMMENT '累计贡献',
  `last_login_time` DATETIME COMMENT '最后登录时间',
  `is_approved` TINYINT DEFAULT 1 COMMENT '是否已审批 (0:待审核，1:已通过，2:已拒绝)',
  `version` INT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_role_id` (`role_id`) COMMENT '一个角色只能加入一个宗门',
  KEY `idx_clan_id` (`clan_id`),
  KEY `idx_clan_position_status` (`clan_id`, `position`, `status`),
  KEY `idx_role_clan_status` (`role_id`, `clan_id`, `status`),
  KEY `idx_version` (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门成员表';

SELECT '✅ clan_member 表创建完成！' AS message;
