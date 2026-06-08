-- 为 admin 用户在 game_user 表中创建账号
-- 密码：123456 (BCrypt 加密)
-- BCrypt hash for '123456': $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2

INSERT INTO game_user (`username`, `password`, `nickname`, `phone`, `status`, `avatar`, `created_at`, `updated_at`)
SELECT * FROM (
    SELECT 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '系统管理员', '13800138000', 1, NULL, NOW(), NOW()
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM game_user WHERE username = 'admin');

-- 验证插入
SELECT id, username, nickname, phone, status FROM game_user WHERE username = 'admin';
