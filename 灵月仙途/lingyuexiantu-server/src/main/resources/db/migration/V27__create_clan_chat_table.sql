-- ============================================
-- 创建宗门聊天消息表
-- ============================================

CREATE TABLE IF NOT EXISTS `clan_chat_message` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `clan_id` BIGINT NOT NULL COMMENT '宗门 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `role_name` VARCHAR(50) NOT NULL COMMENT '角色名称',
  `message` VARCHAR(500) NOT NULL COMMENT '消息内容',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_clan_id` (`clan_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门聊天消息表';

SELECT '✅ clan_chat_message 表创建完成！' AS message;
