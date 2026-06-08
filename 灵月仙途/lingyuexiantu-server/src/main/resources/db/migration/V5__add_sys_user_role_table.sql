-- 系统用户角色关联表
CREATE TABLE IF NOT EXISTS `sys_user_role` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`, `role_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_role_id` (`role_id`),
  CONSTRAINT `fk_user_role_user` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_role_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统用户角色关联表';

-- 为现有的 admin 用户分配超级管理员角色（假设超级管理员角色 ID 为 1）
-- 注意：这需要在 sys_role 表创建之后执行
INSERT INTO `sys_user_role` (`user_id`, `role_id`, `create_time`)
SELECT su.id, sr.id, NOW()
FROM sys_user su, sys_role sr
WHERE su.username = 'admin' AND sr.role_code = 'ROLE_SUPER_ADMIN'
ON DUPLICATE KEY UPDATE sys_user_role.create_time = NOW();
