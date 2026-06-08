-- ============================================
-- 灵月仙途 - 初始化示例数据脚本
-- 功能：为所有必要的数据库表插入测试数据
-- ============================================

-- ============================================
-- 1. 系统管理相关表数据
-- ============================================

-- 插入系统角色数据（如果不存在）
INSERT INTO `sys_role` (`role_name`, `role_code`, `description`, `role_level`, `data_scope`, `sort`, `status`)
SELECT * FROM (
    SELECT '超级管理员', 'ROLE_SUPER_ADMIN', '拥有系统所有权限', 1, 'ALL', 1, 1
    UNION ALL
    SELECT '运营主管', 'ROLE_OPERATION_ADMIN', '负责活动、公告等运营管理', 2, 'ALL', 2, 1
    UNION ALL
    SELECT '客服专员', 'ROLE_CUSTOMER_SERVICE', '处理玩家问题', 3, 'CUSTOM', 3, 1
    UNION ALL
    SELECT '数据分析师', 'ROLE_DATA_ANALYST', '查看数据和统计', 4, 'SELF', 4, 1
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM sys_role WHERE sys_role.role_code = temp.role_code);

-- 插入系统用户数据（如果不存在）
INSERT INTO `sys_user` (`username`, `password`, `nickname`, `phone`, `status`, `avatar`)
SELECT * FROM (
    SELECT 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '系统管理员', '13800138000', 1, NULL
    UNION ALL
    SELECT 'operation', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '运营专员', '13800138001', 1, NULL
    UNION ALL
    SELECT 'service', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '客服人员', '13800138002', 1, NULL
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM sys_user WHERE sys_user.username = temp.username);

-- 为管理员分配角色
INSERT INTO `sys_user_role` (`user_id`, `role_id`)
SELECT su.id, sr.id FROM sys_user su, sys_role sr
WHERE su.username = 'admin' AND sr.role_code = 'ROLE_SUPER_ADMIN'
ON DUPLICATE KEY UPDATE user_id = user_id;

INSERT INTO `sys_user_role` (`user_id`, `role_id`)
SELECT su.id, sr.id FROM sys_user su, sys_role sr
WHERE su.username = 'operation' AND sr.role_code = 'ROLE_OPERATION_ADMIN'
ON DUPLICATE KEY UPDATE user_id = user_id;

INSERT INTO `sys_user_role` (`user_id`, `role_id`)
SELECT su.id, sr.id FROM sys_user su, sys_role sr
WHERE su.username = 'service' AND sr.role_code = 'ROLE_CUSTOMER_SERVICE'
ON DUPLICATE KEY UPDATE user_id = user_id;

-- ============================================
-- 2. 游戏用户和角色数据
-- ============================================

-- 插入游戏用户数据
INSERT INTO `game_user` (`username`, `password`, `nickname`, `phone`, `status`, `avatar`)
SELECT * FROM (
    SELECT 'player001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '张三丰', '13900139001', 1, NULL
    UNION ALL
    SELECT 'player002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '李秋水', '13900139002', 1, NULL
    UNION ALL
    SELECT 'player003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '王语嫣', '13900139003', 1, NULL
    UNION ALL
    SELECT 'player004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '段誉', '13900139004', 1, NULL
    UNION ALL
    SELECT 'player005', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '虚竹', '13900139005', 1, NULL
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM game_user WHERE game_user.username = temp.username);

-- 插入游戏角色数据
INSERT INTO `game_role` (`user_id`, `role_name`, `gender`, `realm`, `level`, `hp`, `mp`, `spirit_root`, `status`)
SELECT gu.id, v.role_name, v.gender, v.realm, v.level, v.hp, v.mp, v.spirit_root, v.status
FROM game_user gu, (
    SELECT 'player001' AS username, '张逍遥' AS role_name, 1 AS gender, '炼气期' AS realm, 5 AS level, 500 AS hp, 200 AS mp, '金灵根' AS spirit_root, 1 AS status
    UNION ALL
    SELECT 'player002', '李寻欢', 1, '筑基期', 15, 1500, 600, '木灵根', 1
    UNION ALL
    SELECT 'player003', '王语嫣', 0, '金丹期', 30, 3000, 1200, '水灵根', 1
    UNION ALL
    SELECT 'player004', '段誉', 1, '元婴期', 50, 5000, 2000, '火灵根', 1
    UNION ALL
    SELECT 'player005', '虚竹', 1, '化神期', 70, 8000, 3500, '土灵根', 1
) AS v
WHERE gu.username = v.username
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- ============================================
-- 3. 宗门数据
-- ============================================

INSERT INTO `clans` (`name`, `description`, `logo`, `level`, `members_count`, `contribution`, `leader_name`, `leader_id`, `status`, `location`, `max_members`, `required_level`)
SELECT * FROM (
    SELECT '青云门', '正道第一大宗，以剑法著称', '/images/clans/qingyun.png', 7, 156, 50000, '道玄真人', 1, 'active', '青云山', 200, 10
    UNION ALL
    SELECT '焚香谷', '以火系功法闻名天下', '/images/clans/fenxiang.png', 7, 142, 48000, '云易岚', 2, 'active', '焚香谷', 200, 15
    UNION ALL
    SELECT '天音寺', '佛门圣地，普渡众生', '/images/clans/tianyin.png', 7, 128, 45000, '普泓', 3, 'active', '天音寺', 180, 12
    UNION ALL
    SELECT '鬼王宗', '魔教大宗，功法诡异', '/images/clans/guiwang.png', 7, 167, 52000, '鬼王', 4, 'active', '鬼王宗', 200, 10
    UNION ALL
    SELECT '万毒门', '擅长用毒，令人闻风丧胆', '/images/clans/wandu.png', 6, 89, 30000, '毒神', 5, 'active', '万毒山', 150, 20
    UNION ALL
    SELECT '合欢派', '魔教门派，魅惑之术', '/images/clans/hehuan.png', 6, 76, 28000, '三娘', 6, 'active', '合欢山', 150, 18
    UNION ALL
    SELECT '天剑宗', '剑修圣地', '/images/clans/tianjian.png', 8, 200, 80000, '剑魔', 7, 'active', '天剑峰', 250, 25
    UNION ALL
    SELECT '药王谷', '医仙谷，救人济世', '/images/clans/yaowang.png', 6, 95, 35000, '药王', 8, 'active', '药王谷', 150, 15
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM clan WHERE clan.name = temp.name);

-- ============================================
-- 4. 装备数据
-- ============================================

INSERT INTO `equipment` (`name`, `type`, `rarity`, `level_require`, `combat_bonus`, `attack_bonus`, `defense_bonus`, `hp_bonus`, `mp_bonus`, `description`, `is_tradable`)
SELECT * FROM (
    SELECT '青锋剑', 'weapon', 2, 5, 100, 50, 0, 0, 0, '普通宝剑，锋利无比', 1
    UNION ALL
    SELECT '玄铁剑', 'weapon', 3, 15, 300, 150, 0, 0, 0, '由玄铁打造，沉重有力', 1
    UNION ALL
    SELECT '倚天剑', 'weapon', 5, 30, 800, 400, 0, 0, 0, '上古神兵，削铁如泥', 0
    UNION ALL
    SELECT '诛仙剑', 'weapon', 6, 50, 2000, 1000, 0, 0, 0, '传说中的杀伐第一剑', 0
    UNION ALL
    SELECT '布衣', 'armor', 1, 1, 50, 0, 20, 50, 0, '普通衣物，提供基本防御', 1
    UNION ALL
    SELECT '金丝甲', 'armor', 3, 20, 400, 0, 150, 200, 0, '金丝编织，防御不俗', 1
    UNION ALL
    SELECT '八卦仙衣', 'armor', 5, 40, 1000, 0, 400, 500, 100, '八卦图案，仙家法宝', 1
    UNION ALL
    SELECT '太极道袍', 'armor', 6, 60, 2500, 0, 800, 1000, 200, '蕴含太极之力', 0
    UNION ALL
    SELECT '玉佩', 'accessory', 2, 10, 80, 10, 10, 100, 50, '温润如玉，提升修为', 1
    UNION ALL
    SELECT '灵珠', 'accessory', 4, 35, 500, 50, 50, 300, 200, '蕴含灵气的宝珠', 1
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE equipment.name = temp.name);

-- ============================================
-- 5. 物品数据
-- ============================================

INSERT INTO `item` (`name`, `type`, `rarity`, `effect_type`, `effect_value`, `description`, `is_usable`, `is_tradable`, `stack_limit`)
SELECT * FROM (
    SELECT '聚气丹', 'pill', 2, 'xiuwei', 100, '聚集天地灵气，增加修为', 1, 1, 99
    UNION ALL
    SELECT '筑基丹', 'pill', 4, 'breakthrough', 50, '辅助突破筑基境界', 1, 1, 10
    UNION ALL
    SELECT '金丹丹', 'pill', 5, 'breakthrough', 80, '辅助凝结金丹', 1, 1, 5
    UNION ALL
    SELECT '回春丹', 'pill', 2, 'heal', 500, '恢复生命值', 1, 1, 99
    UNION ALL
    SELECT '回灵丹', 'pill', 2, 'recover_mp', 300, '恢复法力值', 1, 1, 99
    UNION ALL
    SELECT '灵石', 'material', 1, 'currency', 1, '通用货币', 0, 1, 999999
    UNION ALL
    SELECT '下品灵石', 'material', 1, 'currency', 1, '含有少量灵气', 0, 1, 999999
    UNION ALL
    SELECT '中品灵石', 'material', 3, 'currency', 10, '含有中等灵气', 0, 1, 999999
    UNION ALL
    SELECT '上品灵石', 'material', 5, 'currency', 100, '含有大量灵气', 0, 1, 999999
    UNION ALL
    SELECT '千年灵芝', 'material', 5, 'material', 2000, '珍贵药材，可炼制丹药', 0, 1, 99
    UNION ALL
    SELECT '妖兽内丹', 'material', 3, 'material', 500, '妖兽精华所在', 0, 1, 99
    UNION ALL
    SELECT '铁矿石', 'material', 1, 'material', 10, '常见的矿石', 0, 1, 999
    UNION ALL
    SELECT '玄铁矿', 'material', 3, 'material', 100, '稀有矿石', 0, 1, 999
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM item WHERE item.name = temp.name);

-- ============================================
-- 6. 活动数据
-- ============================================

INSERT INTO `activity` (`name`, `description`, `start_time`, `end_time`, `status`, `type`)
SELECT * FROM (
    SELECT '新春庆典', '庆祝新春佳节，丰厚奖励等你来拿', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 1, 1
    UNION ALL
    SELECT '宗门大比', '各宗门弟子切磋比武，争夺第一', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 1, 2
    UNION ALL
    SELECT '妖兽潮', '大批妖兽来袭，守护家园', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 3
    UNION ALL
    SELECT '秘境开启', '上古秘境开启，机缘与危险并存', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 4
    UNION ALL
    SELECT '签到活动', '每日签到领好礼', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 5
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM activity WHERE activity.name = temp.name);

-- ============================================
-- 7. 系统设置数据
-- ============================================

INSERT INTO `system_setting` (`setting_key`, `setting_value`, `description`)
SELECT * FROM (
    SELECT 'server_name', '灵月仙途', '服务器名称'
    UNION ALL
    SELECT 'server_version', '1.0.0', '服务器版本'
    UNION ALL
    SELECT 'max_level', '100', '玩家最大等级'
    UNION ALL
    SELECT 'max_realm', '渡劫期', '最高境界'
    UNION ALL
    SELECT 'exp_rate', '1.0', '经验倍率'
    UNION ALL
    SELECT 'drop_rate', '1.0', '掉落倍率'
    UNION ALL
    SELECT 'online_reward_interval', '30', '在线奖励间隔（分钟）'
    UNION ALL
    SELECT 'offline_protect_time', '72', '离线保护时间（小时）'
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM system_setting WHERE system_setting.setting_key = temp.setting_key);

-- ============================================
-- 8. 资产类型数据（如果不存在）
-- ============================================

INSERT INTO `asset_types` (`code`, `name`, `description`)
SELECT * FROM (
    SELECT 'CURRENCY', '货币', '各类货币资产'
    UNION ALL
    SELECT 'CONSUMABLE', '消耗品', '丹药、符箓等消耗品'
    UNION ALL
    SELECT 'MATERIAL', '材料', '炼器炼丹材料'
    UNION ALL
    SELECT 'EQUIPMENT', '装备', '武器装备'
    UNION ALL
    SELECT 'SPECIAL', '特殊', '特殊道具'
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM asset_type WHERE asset_type.code = temp.code);

-- ============================================
-- 9. 地图节点数据（补充）
-- ============================================

INSERT INTO `map_node` (`map_code`, `map_name`, `map_type`, `layer_level`, `recommend_level`, `recommend_combat`, `environment_desc`, `monster_density`, `drop_weight`, `main_products`, `status`, `online_count`)
SELECT * FROM (
    SELECT 'MAP_011', '落霞镇', 1, 1, 1, 100, '新手村落，宁静祥和', '无', '无', '基础物资', 1, 50
    UNION ALL
    SELECT 'MAP_012', '妖兽森林边缘', 2, 1, 5, 500, '有低级妖兽出没', '低', '普通', '妖兽材料、草药', 1, 120
    UNION ALL
    SELECT 'MAP_013', '黑风洞', 3, 1, 10, 1500, '阴暗潮湿的洞穴', '中', '优秀', '矿石、妖兽内丹', 1, 80
    UNION ALL
    SELECT 'MAP_014', '火焰山', 2, 2, 25, 5000, '炽热无比，岩浆翻滚', '高', '稀有', '火系材料、晶石', 1, 60
    UNION ALL
    SELECT 'MAP_015', '冰原', 2, 2, 30, 6000, '冰天雪地，寒风刺骨', '中', '稀有', '冰系材料、雪莲', 1, 45
    UNION ALL
    SELECT 'MAP_016', '古战场', 3, 3, 40, 10000, '上古战场，怨气冲天', '高', '史诗', '法宝碎片、战利品', 1, 35
    UNION ALL
    SELECT 'MAP_017', '龙族秘境', 4, 1, 50, 15000, '龙族栖息之地', '极高', '传说', '龙鳞、龙血、龙珠', 1, 20
    UNION ALL
    SELECT 'MAP_018', '仙界入口', 4, 1, 80, 50000, '通往仙界的入口', '无', '仙级', '仙器碎片', 1, 5
) AS temp
WHERE NOT EXISTS (SELECT 1 FROM map_node WHERE map_node.map_code = temp.map_code);

-- ============================================
-- 10. 邮件数据（示例）
-- ============================================

INSERT INTO `mail` (`user_id`, `title`, `content`, `type`, `has_attachment`, `is_read`, `send_time`, `expire_time`)
SELECT gu.id, '欢迎来到灵月仙途', '尊敬的道友，欢迎来到灵月仙途世界！\n\n这是一份新手礼包，请查收。\n\n祝道友修仙之路一帆风顺！', 1, 1, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
FROM game_user gu
WHERE NOT EXISTS (
    SELECT 1 FROM mail m WHERE m.user_id = gu.id AND m.title = '欢迎来到灵月仙途'
);

-- ============================================
-- 完成提示
-- ============================================
SELECT '✅ 数据插入完成！' AS message;
