-- ========================================
-- 灵月仙途 - 完整测试数据SQL
-- 包含：活动、签到、任务、成就、道友、邮件等
-- ========================================

-- ========================================
-- 1. 活动测试数据
-- ========================================
INSERT INTO activity (name, description, start_time, end_time, status, reward_config, created_at) VALUES
('新手修炼礼包', '新手专属修炼福利，助力快速成长', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, '{"resourceRewards":{"lingshi":1000,"xiuwei":500}}', NOW()),
('月度签到活动', '每日签到，获取丰厚奖励', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, '{"resourceRewards":{"lingshi":500}}', NOW()),
('宗门贡献赛', '宗门成员贡献比拼，赢取宗门荣誉', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, '{"resourceRewards":{"hunshi":200}}', NOW());

-- ========================================
-- 2. 任务测试数据
-- ========================================
INSERT INTO task (name, description, task_type, condition_type, condition_value, activity_points, rewards, is_active, sort_order) VALUES
('初入仙途', '完成新手引导', 'daily', 'login', 1, 10, '{"resourceRewards":{"lingshi":100}}', 1, 1),
('修炼入门', '进行一次修炼', 'daily', 'cultivate', 1, 15, '{"resourceRewards":{"lingshi":150,"xiuwei":100}}', 1, 2),
('每日签到', '完成每日签到', 'daily', 'checkin', 1, 20, '{"resourceRewards":{"lingshi":200}}', 1, 3),
('挑战自我', '完成3次日常任务', 'main', 'daily_tasks', 3, 50, '{"resourceRewards":{"lingshi":500,"xiuwei":300}}', 1, 1),
('小有所成', '达到练气期三层', 'main', 'realm_level', 3, 30, '{"resourceRewards":{"lingshi":300}}', 1, 2),
('百炼成仙', '完成100次修炼', 'achievement', 'total_cultivates', 100, 100, '{"resourceRewards":{"lingshi":1000,"xiuwei":500}}', 1, 1);

-- ========================================
-- 3. 成就测试数据
-- ========================================
INSERT INTO achievement (name, description, icon, condition_type, condition_value, reward_config, is_active, created_at) VALUES
('初入仙途', '创建角色并完成新手引导', '🎮', 'create_role', 1, '{"resourceRewards":{"lingshi":1000}}', 1, NOW()),
('修炼有成', '达到金丹期', '⚡', 'realm_level', 10, '{"resourceRewards":{"lingshi":5000}}', 1, NOW()),
('采集大师', '采集100株灵草', '🌿', 'collect_herbs', 100, '{"resourceRewards":{"lingshi":3000}}', 1, NOW()),
('除魔卫道', '击杀100只妖魔', '⚔️', 'kill_monsters', 100, '{"resourceRewards":{"lingshi":8000}}', 1, NOW()),
('社交达人', '添加10位好友', '👥', 'add_friends', 10, '{"resourceRewards":{"lingshi":2000}}', 1, NOW()),
('签到狂人', '连续签到30天', '📅', 'continuous_checkin', 30, '{"resourceRewards":{"lingshi":10000}}', 1, NOW()),
('富甲一方', '累计获得100000灵石', '💰', 'total_lingshi', 100000, '{"resourceRewards":{"lingshi":50000}}', 1, NOW());

-- ========================================
-- 4. 物品测试数据
-- ========================================
INSERT INTO item (name, description, item_type, quality, icon, max_stack, can_trade, can_use, use_effect, created_at) VALUES
('聚气丹', '辅助修炼的基础丹药', 'consumable', 1, '💊', 99, 1, 1, '{"xiuwei":100}', NOW()),
('筑基丹', '突破筑基期的关键丹药', 'consumable', 2, '🧪', 10, 1, 1, '{"breakthrough":1}', NOW()),
('下品灵石', '最低级的灵石，可用于交易', 'resource', 1, '💎', 999, 1, 0, '{}', NOW()),
('中品灵石', '中等品质的灵石', 'resource', 2, '💠', 999, 1, 0, '{}', NOW()),
('极品灵石', '最高品质的灵石', 'resource', 3, '👑', 999, 1, 0, '{}', NOW()),
('回灵散', '快速恢复灵力的丹药', 'consumable', 1, '💊', 99, 1, 1, '{"spiritual_power":100}', NOW()),
('洗髓丹', '改善体质的丹药', 'consumable', 2, '🧪', 10, 1, 1, '{"constitution":10}', NOW()),
('千年人参', '千年的珍贵药材', 'material', 2, '🥕', 99, 1, 0, '{}', NOW()),
('元婴果', '有助于元婴修炼的果实', 'consumable', 3, '🍑', 10, 1, 1, '{"nascent_soul":50}', NOW()),
('玄铁精', '炼器的上等材料', 'material', 2, '⚙️', 99, 1, 0, '{}', NOW()),
('飞升令', '飞升仙界的信物', 'special', 5, '🪐', 1, 1, 0, '{}', NOW()),
('仙缘宝箱', '蕴含仙缘的神秘宝箱', 'special', 4, '🎁', 99, 1, 1, '{"random_reward":1}', NOW());

-- ========================================
-- 5. 资源类型测试数据
-- ========================================
INSERT INTO resource_type (code, name, description, unit, icon, created_at) VALUES
('lingshi', '灵石', '游戏通用货币', '个', '💰', NOW()),
('xiuwei', '修为', '修炼经验值', '点', '✨', NOW()),
('hunshi', '魂石', '特殊资源', '个', '🔥', NOW()),
('xiandian', '仙点', '商城积分', '点', '⭐', NOW());

-- ========================================
-- 6. 邮件测试数据（为当前角色准备）
-- 使用时需要替换{userId}为实际用户ID
-- ========================================
-- 注释：实际使用时请先获取正确的userId
-- INSERT INTO mail (user_id, title, content, type, has_attachment, is_read, send_time, expire_time) VALUES
-- ({userId}, '欢迎来到灵月仙途', '尊敬的道友，欢迎来到灵月仙途！\n\n在这个修仙世界中，您将踏上寻找长生大道的旅程。', 1, 1, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- ========================================
-- 7. 好友关系测试数据（示例）
-- ========================================
-- 注释：需要先创建多个角色后使用
-- INSERT INTO friend (role_id, friend_role_id, status, created_at) VALUES
-- (1, 2, 1, NOW()),
-- (1, 3, 1, NOW()),
-- (2, 1, 1, NOW()),
-- (3, 1, 1, NOW());

-- ========================================
-- 8. 商城商品测试数据
-- ========================================
INSERT INTO shop_item (item_id, price, price_type, stock, limit_per_role, is_active, sort_order, created_at) VALUES
(1, 100, 'lingshi', 999, 0, 1, 1, NOW()),
(2, 500, 'lingshi', 100, 10, 1, 2, NOW()),
(3, 10, 'lingshi', 9999, 0, 1, 3, NOW()),
(6, 50, 'lingshi', 999, 0, 1, 4, NOW()),
(7, 200, 'lingshi', 50, 5, 1, 5, NOW());

-- ========================================
-- 测试数据加载完成提示
-- ========================================
SELECT '测试数据加载完成！' AS message;
