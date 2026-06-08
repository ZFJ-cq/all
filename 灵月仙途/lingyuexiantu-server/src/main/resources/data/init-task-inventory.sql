-- 添加成就类型任务
INSERT INTO task (name, description, task_type, condition_type, condition_value, activity_points, rewards, sort_order, is_active, create_time, update_time) VALUES
('百炼成仙', '累计修炼100次', 'achievement', 'TOTAL_CULTIVATE', 100, 100, '{"xiuwei":1000,"lingshi":500}', 1, 1, NOW(), NOW()),
('签到达人', '累计签到30天', 'achievement', 'TOTAL_CHECKIN', 30, 150, '{"xiuwei":2000,"lingshi":1000}', 2, 1, NOW(), NOW()),
('境界高升', '突破至金丹期', 'achievement', 'REALM_JINDAN', 1, 200, '{"xiuwei":5000,"lingshi":2000}', 3, 1, NOW(), NOW()),
('灵石大亨', '累计获得10000灵石', 'achievement', 'EARN_LINGSHI', 10000, 100, '{"xiuwei":3000,"lingshi":1000}', 4, 1, NOW(), NOW()),
('探索大师', '累计探索50次', 'achievement', 'TOTAL_ADVENTURE', 50, 120, '{"xiuwei":2000,"lingshi":800}', 5, 1, NOW(), NOW());

-- 为角色1添加初始背包物品
INSERT INTO inventory (role_id, item_id, item_name, item_type, rarity, stack_size, create_time, update_time) VALUES
(1, 2, '聚气丹', 'dan_yao', 'common', 10, NOW(), NOW()),
(1, 3, '回春丹', 'dan_yao', 'common', 5, NOW(), NOW()),
(1, 4, '回灵丹', 'dan_yao', 'common', 8, NOW(), NOW()),
(1, 5, '培元丹', 'dan_yao', 'rare', 3, NOW(), NOW()),
(1, 6, '洗髓丹', 'cai_liao', 'epic', 2, NOW(), NOW()),
(1, 1, '新手剑', 'zhuang_bei', 'common', 1, NOW(), NOW());
