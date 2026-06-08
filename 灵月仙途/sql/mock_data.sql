-- 模拟数据 SQL 脚本

-- 1. 角色基础属性数据（role_base_stats）
INSERT INTO role_base_stats (role_id, vit, spi, agi, wis, lck, created_at, updated_at)
VALUES 
(45, 15, 18, 12, 10, 8, NOW(), NOW()),
(1, 10, 10, 10, 10, 10, NOW(), NOW());

-- 2. 物品数据（item）
INSERT INTO item (name, type, description, rarity, level, price, sell_price, stackable, max_stack, use_effect, created_at, updated_at)
VALUES 
('新手剑', '装备', '一把普通的铁剑，适合新手使用', '凡品', 1, 100, 50, 0, 1, NULL, NOW(), NOW()),
('新手衣', '装备', '一件普通的布衣，提供基本的防护', '凡品', 1, 80, 40, 0, 1, NULL, NOW(), NOW()),
('气血丹', '丹药', '恢复少量气血', '凡品', 1, 50, 25, 1, 99, '{"type": "hp", "value": 100}', NOW(), NOW()),
('修为丹', '丹药', '增加少量修为', '凡品', 1, 80, 40, 1, 99, '{"type": "spirit", "value": 50}', NOW(), NOW()),
('金灵根丹', '丹药', '提升金灵根资质', '珍品', 10, 500, 250, 1, 99, '{"type": "spirit_root", "value": "金灵根", "bonus": {"spi": 5}}', NOW(), NOW());

-- 3. 装备数据（equipment）
INSERT INTO equipment (item_id, type, attack, defense, hp_bonus, mp_bonus, speed_bonus, crit_rate_bonus, dodge_rate_bonus, hit_rate_bonus, level_requirement, stat_requirements)
VALUES 
(1, 1, 15, 0, 0, 0, 0, 0, 0, 0, 1, NULL), -- 新手剑（武器）
(2, 2, 0, 10, 20, 0, 0, 0, 0, 0, 1, NULL); -- 新手衣（身体）

-- 4. 丹药数据（pill）
INSERT INTO pill (item_id, effect_type, effect_value, duration, cooldown, side_effect)
VALUES 
(3, 'hp', 100, 0, 300, NULL), -- 气血丹
(4, 'spirit', 50, 0, 600, NULL), -- 修为丹
(5, 'spirit_root', 5, 0, 86400, NULL); -- 金灵根丹

-- 5. 角色装备数据（role_equipment）
INSERT INTO role_equipment (role_id, equipment_id, item_id, slot, status, quantity, acquired_at, updated_at)
VALUES 
(45, 1, 1, 1, 0, 1, NOW(), NOW()), -- 角色 45 拥有新手剑（未装备）
(45, 2, 2, 2, 0, 1, NOW(), NOW()), -- 角色 45 拥有新手衣（未装备）
(45, NULL, 3, NULL, 0, 10, NOW(), NOW()), -- 角色 45 拥有 10 个气血丹
(45, NULL, 4, NULL, 0, 5, NOW(), NOW()), -- 角色 45 拥有 5 个修为丹
(45, NULL, 5, NULL, 0, 1, NOW(), NOW()); -- 角色 45 拥有 1 个金灵根丹

-- 6. 角色境界数据（role_realm）
INSERT INTO role_realm (role_id, realm_name, realm_level, total_cultivation, created_at, updated_at)
VALUES 
(45, '凡人', 1, 0, NOW(), NOW());

-- 7. 系统配置数据（system_setting）
INSERT INTO system_setting (setting_key, setting_value, description, created_at, updated_at)
VALUES 
('initial_base_stats', '{"vit": 10, "spi": 10, "agi": 10, "wis": 10, "lck": 10}', '初始基础属性', NOW(), NOW()),
('spirit_root_bonus', '{"金灵根": {"spi": 5}, "木灵根": {"vit": 5}, "水灵根": {"wis": 5}, "火灵根": {"agi": 5}, "土灵根": {"vit": 3, "def": 2}}', '灵根对基础属性的影响', NOW(), NOW());

-- 8. 角色数据（game_role）
INSERT INTO game_role (user_id, role_name, realm, level, hp, mp, status, create_time)
VALUES 
(1, '测试角色', '凡人', 1, 100, 80, 1, NOW());

-- 9. 资产类型数据（asset_types）
INSERT INTO asset_types (code, name, type, category, description, unit_of_measure, decimal_places, status, created_at, updated_at)
VALUES 
('gold', '金币', 'currency', 'primary', '游戏主要货币', '个', 0, 'active', NOW(), NOW()),
('spirit_stone', '灵石', 'currency', 'secondary', '修炼用货币', '块', 0, 'active', NOW(), NOW()),
('exp', '经验', 'experience', 'primary', '角色经验', '点', 0, 'active', NOW(), NOW()),
('spirit', '修为', 'experience', 'secondary', '修炼修为', '点', 0, 'active', NOW(), NOW());

-- 10. 角色资产数据（role_asset）
INSERT INTO role_asset (role_id, asset_type_code, quantity, created_at, updated_at)
VALUES 
(45, 'gold', 1000, NOW(), NOW()),
(45, 'spirit_stone', 100, NOW(), NOW()),
(45, 'exp', 0, NOW(), NOW()),
(45, 'spirit', 0, NOW(), NOW());

-- 11. 任务数据（task）
INSERT INTO task (name, description, type, level_requirement, exp_reward, gold_reward, item_rewards, status, created_at, updated_at)
VALUES 
('新手任务', '完成你的第一个任务', 'main', 1, 100, 50, '{"item_id": 3, "quantity": 2}', 'active', NOW(), NOW()),
('采集任务', '采集10个草药', 'daily', 5, 50, 25, NULL, 'active', NOW(), NOW());

-- 12. 角色任务数据（role_task）
INSERT INTO role_task (role_id, task_id, status, progress, started_at, completed_at, updated_at)
VALUES 
(45, 1, 'in_progress', 0, NOW(), NULL, NOW()),
(45, 2, 'pending', 0, NULL, NULL, NOW());

-- 13. 活动数据（activity）
INSERT INTO activity (name, description, start_time, end_time, rewards, status, created_at, updated_at)
VALUES 
('新手礼包', '新玩家专属礼包', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), '{"gold": 1000, "spirit_stone": 100, "items": [{"item_id": 3, "quantity": 5}]}', 'active', NOW(), NOW()),
('每日签到', '每日签到领取奖励', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), '{"gold": 100, "exp": 50}', 'active', NOW(), NOW());

-- 14. 公告数据（announcement）
INSERT INTO announcement (title, content, type, status, created_at, updated_at)
VALUES 
('系统公告', '欢迎来到灵月仙途！', 'system', 'active', NOW(), NOW()),
('活动公告', '新手礼包活动开始啦！', 'activity', 'active', NOW(), NOW());

-- 15. 邮件数据（mail）
INSERT INTO mail (user_id, title, content, status, send_time, read_time, created_at, updated_at)
VALUES 
(1, '欢迎邮件', '欢迎加入灵月仙途，这是你的新手礼包！', 'unread', NOW(), NULL, NOW(), NOW()),
(1, '系统通知', '系统维护将于明天进行，请提前做好准备。', 'unread', NOW(), NULL, NOW(), NOW());

-- 16. 邮件物品数据（mail_item）
INSERT INTO mail_item (mail_id, item_id, quantity, status, created_at, updated_at)
VALUES 
(1, 3, 5, 'unclaimed', NOW(), NOW()),
(1, 4, 3, 'unclaimed', NOW(), NOW());

-- 17. 成就数据（achievement）
INSERT INTO achievement (name, description, requirement_type, requirement_value, rewards, status, created_at, updated_at)
VALUES 
('初入仙途', '创建你的第一个角色', 'role_create', 1, '{"exp": 100, "gold": 100}', 'active', NOW(), NOW()),
('第一次装备', '装备你的第一件装备', 'equip_item', 1, '{"exp": 50, "gold": 50}', 'active', NOW(), NOW());

-- 18. 角色成就数据（role_achievement）
INSERT INTO role_achievement (role_id, achievement_id, progress, status, created_at, updated_at)
VALUES 
(45, 1, 1, 'completed', NOW(), NOW()),
(45, 2, 0, 'in_progress', NOW(), NOW());

-- 19. 技能数据（skill）
INSERT INTO skill (name, description, type, level, damage, cooldown, mana_cost, status, created_at, updated_at)
VALUES 
('基础剑法', '基础的剑法攻击', 'attack', 1, 20, 2, 10, 'active', NOW(), NOW()),
('基础拳法', '基础的拳法攻击', 'attack', 1, 15, 1, 5, 'active', NOW(), NOW());

-- 20. 角色技能数据（role_skill）
INSERT INTO role_skill (role_id, skill_id, level, experience, status, created_at, updated_at)
VALUES 
(45, 1, 1, 0, 'active', NOW(), NOW()),
(45, 2, 1, 0, 'active', NOW(), NOW());

-- 21. 宗门数据（clan）
INSERT INTO clan (name, description, level, member_count, status, created_at, updated_at)
VALUES 
('仙剑门', '专注于剑法的宗门', 1, 1, 'active', NOW(), NOW()),
('御气宗', '专注于法术的宗门', 1, 1, 'active', NOW(), NOW());

-- 22. 宗门成员数据（clan_member）
INSERT INTO clan_member (clan_id, role_id, position, contribution, status, joined_at, updated_at)
VALUES 
(1, 45, 'member', 0, 'active', NOW(), NOW());

-- 23. 锻体数据（body_part）
INSERT INTO body_part (name, description, base_level, max_level, status, created_at, updated_at)
VALUES 
('经脉', '修炼经脉可以提升修为速度', 1, 10, 'active', NOW(), NOW()),
('骨骼', '强化骨骼可以提升防御力', 1, 10, 'active', NOW(), NOW());

-- 24. 角色锻体数据（role_body_cultivation）
INSERT INTO role_body_cultivation (role_id, body_part_id, level, experience, status, created_at, updated_at)
VALUES 
(45, 1, 1, 0, 'active', NOW(), NOW()),
(45, 2, 1, 0, 'active', NOW(), NOW());

-- 25. 修炼任务数据（cultivation_task）
INSERT INTO cultivation_task (name, description, required_level, required_spirit, rewards, status, created_at, updated_at)
VALUES 
('基础修炼', '进行基础的修炼', 1, 0, '{"exp": 50, "spirit": 10}', 'active', NOW(), NOW()),
('进阶修炼', '进行进阶的修炼', 10, 100, '{"exp": 200, "spirit": 50}', 'active', NOW(), NOW());

-- 26. 排行榜数据（leaderboard）
INSERT INTO leaderboard (type, role_id, value, rank, updated_at)
VALUES 
('level', 45, 1, 1, NOW()),
('power', 45, 100, 1, NOW());

-- 27. 好友数据（friend）
INSERT INTO friend (role_id, friend_role_id, status, created_at, updated_at)
VALUES 
(45, 1, 'accepted', NOW(), NOW());

-- 28. 交易数据（trade）
INSERT INTO trade (seller_role_id, buyer_role_id, item_id, quantity, price, status, created_at, updated_at)
VALUES 
(45, 1, 3, 2, 100, 'completed', NOW(), NOW());

-- 29. 交易物品数据（trade_item）
INSERT INTO trade_item (trade_id, item_id, quantity, price)
VALUES 
(1, 3, 2, 100);

-- 30. 商城商品数据（mall_product）
INSERT INTO mall_product (name, description, price, stock, category, status, created_at, updated_at)
VALUES 
('新手礼包', '包含基础装备和丹药', 100, 999, 'beginner', 'active', NOW(), NOW()),
('高级礼包', '包含高级装备和丹药', 1000, 999, 'advanced', 'active', NOW(), NOW());

-- 31. 商城订单数据（mall_order）
INSERT INTO mall_order (role_id, product_id, quantity, total_price, status, created_at, updated_at)
VALUES 
(45, 1, 1, 100, 'completed', NOW(), NOW());

-- 32. 商城订单物品数据（mall_order_item）
INSERT INTO mall_order_item (order_id, product_id, quantity, price)
VALUES 
(1, 1, 1, 100);

-- 33. 签到数据（role_checkin）
INSERT INTO role_checkin (role_id, checkin_date, streak_days, rewards, status, created_at, updated_at)
VALUES 
(45, CURDATE(), 1, '{"gold": 100, "exp": 50}', 'completed', NOW(), NOW());

-- 34. 锻体日志数据（body_cultivation_log）
INSERT INTO body_cultivation_log (role_id, body_part_id, action, level_before, level_after, experience_gained, created_at)
VALUES 
(45, 1, 'cultivate', 1, 1, 10, NOW()),
(45, 2, 'cultivate', 1, 1, 10, NOW());

-- 35. 修炼日志数据（cultivation_log）
INSERT INTO cultivation_log (role_id, action, spirit_gained, exp_gained, created_at)
VALUES 
(45, 'meditate', 10, 50, NOW()),
(45, 'practice', 5, 25, NOW());

-- 36. 突破日志数据（breakthrough_log）
INSERT INTO breakthrough_log (role_id, from_realm, to_realm, success, attempt_count, created_at)
VALUES 
(45, '凡人', '练气期', 0, 1, NOW());

-- 37. 任务日志数据（task_log）
INSERT INTO task_log (role_id, task_id, action, progress, created_at)
VALUES 
(45, 1, 'accept', 0, NOW()),
(45, 1, 'progress', 50, NOW());

-- 38. 邮件日志数据（mail_log）
INSERT INTO mail_log (user_id, mail_id, action, created_at)
VALUES 
(1, 1, 'send', NOW()),
(1, 2, 'send', NOW());

-- 39. 成就日志数据（achievement_log）
INSERT INTO achievement_log (role_id, achievement_id, action, progress, created_at)
VALUES 
(45, 1, 'complete', 1, NOW()),
(45, 2, 'progress', 0, NOW());

-- 40. 资产获取记录数据（asset_acquisition_record）
INSERT INTO asset_acquisition_record (role_id, asset_type_code, quantity, source_type, source_id, created_at)
VALUES 
(45, 'gold', 1000, 'system', NULL, NOW()),
(45, 'spirit_stone', 100, 'system', NULL, NOW());

-- 41. 系统操作日志数据（sys_operation_log）
INSERT INTO sys_operation_log (user_id, operation_type, operation_content, ip_address, created_at)
VALUES 
(1, 'login', '用户登录', '127.0.0.1', NOW()),
(1, 'create_role', '创建角色', '127.0.0.1', NOW());

-- 42. 审核日志数据（audit_log）
INSERT INTO audit_log (entity_type, entity_id, operation_type, operation_content, operator_id, created_at)
VALUES 
('user', 1, 'create', '创建用户', 1, NOW()),
('role', 45, 'create', '创建角色', 1, NOW());

-- 43. 登录日志数据（sys_login_log）
INSERT INTO sys_login_log (user_id, login_time, logout_time, ip_address, device_info, status)
VALUES 
(1, NOW(), NULL, '127.0.0.1', 'Chrome', 'active'),
(1, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY + 1 HOUR), '127.0.0.1', 'Firefox', 'completed');

-- 44. 验证码数据（verification_code）
INSERT INTO verification_code (phone, code, type, status, created_at, expire_at)
VALUES 
('13800138000', '123456', 'login', 'used', NOW(), DATE_ADD(NOW(), INTERVAL 5 MINUTE)),
('13900139000', '654321', 'register', 'unused', NOW(), DATE_ADD(NOW(), INTERVAL 5 MINUTE));

-- 45. 地图节点数据（map_node）
INSERT INTO map_node (name, description, type, level_requirement, coordinates, status, created_at, updated_at)
VALUES 
('新手村', '玩家出生的地方', 'village', 1, '0,0', 'active', NOW(), NOW()),
('练级区', '适合新手练级的地方', 'field', 5, '10,10', 'active', NOW(), NOW());

-- 46. 地图路径数据（map_path）
INSERT INTO map_path (from_node_id, to_node_id, distance, difficulty, status, created_at, updated_at)
VALUES 
(1, 2, 10, 1, 'active', NOW(), NOW());

-- 47. 配置表数据（t_cfg_numerical_rules）
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by, updated_at)
VALUES 
('initial_base_stats', 1, '{"vit": 10, "spi": 10, "agi": 10, "wis": 10, "lck": 10}', '初始基础属性', 'system', NOW()),
('spirit_root_bonus', 1, '{"金灵根": {"spi": 5}, "木灵根": {"vit": 5}, "水灵根": {"wis": 5}, "火灵根": {"agi": 5}, "土灵根": {"vit": 3, "def": 2}}', '灵根对基础属性的影响', 'system', NOW()),
('realm_breakthrough', 1, '{"凡人": {"next": "练气期", "requiredLevel": 10, "requiredSpirit": 100, "successRate": 1.0, "failurePenalty": 0, "lifespan": 100}, "练气期": {"next": "筑基期", "requiredLevel": 30, "requiredSpirit": 500, "successRate": 0.8, "failurePenalty": 5, "lifespan": 200}, "筑基期": {"next": "金丹期", "requiredLevel": 60, "requiredSpirit": 1500, "successRate": 0.6, "failurePenalty": 10, "lifespan": 300}, "金丹期": {"next": "元婴期", "requiredLevel": 100, "requiredSpirit": 3000, "successRate": 0.4, "failurePenalty": 15, "lifespan": 500}, "元婴期": {"next": "化神期", "requiredLevel": 150, "requiredSpirit": 6000, "successRate": 0.3, "failurePenalty": 20, "lifespan": 800}, "化神期": {"next": "合体期", "requiredLevel": 210, "requiredSpirit": 10000, "successRate": 0.2, "failurePenalty": 25, "lifespan": 1200}, "合体期": {"next": "大乘期", "requiredLevel": 280, "requiredSpirit": 15000, "successRate": 0.15, "failurePenalty": 30, "lifespan": 1800}, "大乘期": {"next": "渡劫期", "requiredLevel": 360, "requiredSpirit": 25000, "successRate": 0.1, "failurePenalty": 35, "lifespan": 2500}, "渡劫期": {"next": "仙人", "requiredLevel": 450, "requiredSpirit": 50000, "successRate": 0.05, "failurePenalty": 40, "lifespan": 5000}, "仙人": {"next": null, "requiredLevel": 0, "requiredSpirit": 0, "successRate": 0, "failurePenalty": 0, "lifespan": 99999}}', '境界突破配置', 'system', NOW());

-- 48. 装备品质配置数据（cfg_equipment_quality）
INSERT INTO cfg_equipment_quality (id, quality, color, prefix, suffix, base_bonus, affix_count, created_at, updated_at)
VALUES 
(1, '凡品', '#888888', '', '', 0.1, 1, NOW(), NOW()),
(2, '良品', '#4CAF50', '优质', '', 0.2, 2, NOW(), NOW()),
(3, '珍品', '#2196F3', '稀有', '', 0.3, 3, NOW(), NOW()),
(4, '极品', '#9C27B0', '卓越', '', 0.4, 4, NOW(), NOW()),
(5, '仙品', '#FF9800', '神器', '', 0.5, 5, NOW(), NOW());

-- 49. 丹药效果配置数据（cfg_pill_effect）
INSERT INTO cfg_pill_effect (id, pill_name, effect_type, effect_value, duration, cooldown, created_at, updated_at)
VALUES 
(1, '气血丹', 'hp', 100, 0, 300, NOW(), NOW()),
(2, '修为丹', 'spirit', 50, 0, 600, NOW(), NOW()),
(3, '根骨丹', 'vit', 1, 0, 86400, NOW(), NOW()),
(4, '灵力丹', 'spi', 1, 0, 86400, NOW(), NOW()),
(5, '身法丹', 'agi', 1, 0, 86400, NOW(), NOW());

-- 50. 技能升级配置数据（cfg_skill_upgrade）
INSERT INTO cfg_skill_upgrade (id, skill_level, required_level, required_spirit, success_rate, failure_penalty, created_at, updated_at)
VALUES 
(1, '1', 1, 100, 1.0, 0, NOW(), NOW()),
(2, '2', 10, 300, 0.9, 5, NOW(), NOW()),
(3, '3', 20, 600, 0.8, 10, NOW(), NOW()),
(4, '4', 30, 1000, 0.7, 15, NOW(), NOW()),
(5, '5', 40, 1500, 0.6, 20, NOW(), NOW());

-- 51. 境界突破配置数据（cfg_realm_breakthrough）
INSERT INTO cfg_realm_breakthrough (id, from_realm, to_realm, xiuwei_requirement, pill_name, success_rate, failure_penalty, created_at, updated_at)
VALUES 
(1, '凡人', '练气期', 100, '练气丹', 1.0, '无', NOW(), NOW()),
(2, '练气期', '筑基期', 500, '筑基丹', 0.8, '修为下降5%', NOW(), NOW()),
(3, '筑基期', '金丹期', 1500, '金丹丹', 0.6, '修为下降10%', NOW(), NOW()),
(4, '金丹期', '元婴期', 3000, '元婴丹', 0.4, '修为下降15%', NOW(), NOW()),
(5, '元婴期', '化神期', 6000, '化神丹', 0.3, '修为下降20%', NOW(), NOW());

-- 完成所有模拟数据的插入
SELECT '✅ 所有模拟数据插入完成！' AS message;