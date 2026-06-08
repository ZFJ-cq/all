-- 创建默认游戏用户 admin
INSERT IGNORE INTO game_user (username, password, nickname, phone, status, created_at, updated_at)
VALUES ('admin', '123456', '管理员', '13800000000', 1, NOW(), NOW());
