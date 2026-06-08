-- ============================================
-- 灵月仙途 - 完整数据初始化脚本
-- 包含：表创建 + 数据插入
-- ============================================

-- 1. 系统角色数据
INSERT INTO `sys_role` (`role_name`, `role_code`, `description`, `role_level`, `data_scope`, `sort`, `status`)
VALUES 
('超级管理员', 'ROLE_SUPER_ADMIN', '拥有系统所有权限', 1, 'ALL', 1, 1),
('运营主管', 'ROLE_OPERATION_ADMIN', '负责活动、公告等运营管理', 2, 'ALL', 2, 1),
('客服专员', 'ROLE_CUSTOMER_SERVICE', '处理玩家问题', 3, 'CUSTOM', 3, 1),
('数据分析师', 'ROLE_DATA_ANALYST', '查看数据和统计', 4, 'SELF', 4, 1)
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 2. 系统用户数据
INSERT INTO `sys_user` (`username`, `password`, `nickname`, `phone`, `status`)
VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '系统管理员', '13800138000', 1),
('operation', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '运营专员', '13800138001', 1),
('service', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '客服人员', '13800138002', 1)
ON DUPLICATE KEY UPDATE nickname = VALUES(nickname);

-- 3. 系统用户角色关联
INSERT INTO `sys_user_role` (`user_id`, `role_id`)
SELECT su.id, sr.id FROM sys_user su, sys_role sr WHERE su.username = 'admin' AND sr.role_code = 'ROLE_SUPER_ADMIN'
ON DUPLICATE KEY UPDATE user_id = user_id;

-- 4. 游戏用户数据
INSERT INTO `game_user` (`username`, `password`, `nickname`, `phone`, `status`)
VALUES 
('player001', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '张三丰', '13900139001', 1),
('player002', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '李秋水', '13900139002', 1),
('player003', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '王语嫣', '13900139003', 1),
('player004', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '段誉', '13900139004', 1),
('player005', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iG6yL8xwC0hJQvK3yPz9sF4mNqW2', '虚竹', '13900139005', 1)
ON DUPLICATE KEY UPDATE nickname = VALUES(nickname);

-- 5. 游戏角色数据
INSERT INTO `game_role` (`user_id`, `role_name`, `gender`, `realm`, `level`, `hp`, `mp`, `spirit_root`, `status`)
SELECT gu.id, v.role_name, v.gender, v.realm, v.level, v.hp, v.mp, v.spirit_root, v.status
FROM game_user gu, (
    SELECT 'player001' AS username, '张逍遥' AS role_name, 1 AS gender, '炼气期' AS realm, 5 AS level, 500 AS hp, 200 AS mp, '金灵根' AS spirit_root, 1 AS status
    UNION ALL SELECT 'player002', '李寻欢', 1, '筑基期', 15, 1500, 600, '木灵根', 1
    UNION ALL SELECT 'player003', '王语嫣', 0, '金丹期', 30, 3000, 1200, '水灵根', 1
    UNION ALL SELECT 'player004', '段誉', 1, '元婴期', 50, 5000, 2000, '火灵根', 1
    UNION ALL SELECT 'player005', '虚竹', 1, '化神期', 70, 8000, 3500, '土灵根', 1
) AS v WHERE gu.username = v.username
ON DUPLICATE KEY UPDATE role_name = VALUES(role_name);

-- 6. 宗门数据
INSERT INTO `clans` (`name`, `description`, `logo`, `level`, `members_count`, `contribution`, `leader_name`, `status`, `location`, `max_members`, `required_level`)
VALUES 
('青云门', '正道第一大宗，以剑法著称', '/images/clans/qingyun.png', 7, 156, 50000, '道玄真人', 'active', '青云山', 200, 10),
('焚香谷', '以火系功法闻名天下', '/images/clans/fenxiang.png', 7, 142, 48000, '云易岚', 'active', '焚香谷', 200, 15),
('天音寺', '佛门圣地，普渡众生', '/images/clans/tianyin.png', 7, 128, 45000, '普泓', 'active', '天音寺', 180, 12),
('鬼王宗', '魔教大宗，功法诡异', '/images/clans/guiwang.png', 7, 167, 52000, '鬼王', 'active', '鬼王宗', 200, 10),
('万毒门', '擅长用毒，令人闻风丧胆', '/images/clans/wandu.png', 6, 89, 30000, '毒神', 'active', '万毒山', 150, 20),
('合欢派', '魔教门派，魅惑之术', '/images/clans/hehuan.png', 6, 76, 28000, '三娘', 'active', '合欢山', 150, 18),
('天剑宗', '剑修圣地', '/images/clans/tianjian.png', 8, 200, 80000, '剑魔', 'active', '天剑峰', 250, 25),
('药王谷', '医仙谷，救人济世', '/images/clans/yaowang.png', 6, 95, 35000, '药王', 'active', '药王谷', 150, 15)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 7. 装备数据
INSERT INTO `equipment` (`name`, `type`, `rarity`, `level_require`, `combat_bonus`, `attack_bonus`, `defense_bonus`, `description`, `is_tradable`)
VALUES 
('青锋剑', 'weapon', 2, 5, 100, 50, 0, '普通宝剑，锋利无比', 1),
('玄铁剑', 'weapon', 3, 15, 300, 150, 0, '由玄铁打造，沉重有力', 1),
('倚天剑', 'weapon', 5, 30, 800, 400, 0, '上古神兵，削铁如泥', 0),
('诛仙剑', 'weapon', 6, 50, 2000, 1000, 0, '传说中的杀伐第一剑', 0),
('布衣', 'armor', 1, 1, 50, 0, 20, '普通衣物，提供基本防御', 1),
('金丝甲', 'armor', 3, 20, 400, 0, 150, '金丝编织，防御不俗', 1),
('八卦仙衣', 'armor', 5, 40, 1000, 0, 400, '八卦图案，仙家法宝', 1),
('太极道袍', 'armor', 6, 60, 2500, 0, 800, '蕴含太极之力', 0),
('玉佩', 'accessory', 2, 10, 80, 10, 10, '温润如玉，提升修为', 1),
('灵珠', 'accessory', 4, 35, 500, 50, 50, '蕴含灵气的宝珠', 1)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 8. 物品数据
INSERT INTO `item` (`name`, `type`, `rarity`, `effect_type`, `effect_value`, `description`, `is_usable`, `is_tradable`, `stack_limit`)
VALUES 
('聚气丹', 'pill', 2, 'xiuwei', 100, '聚集天地灵气，增加修为', 1, 1, 99),
('筑基丹', 'pill', 4, 'breakthrough', 50, '辅助突破筑基境界', 1, 1, 10),
('金丹丹', 'pill', 5, 'breakthrough', 80, '辅助凝结金丹', 1, 1, 5),
('回春丹', 'pill', 2, 'heal', 500, '恢复生命值', 1, 1, 99),
('回灵丹', 'pill', 2, 'recover_mp', 300, '恢复法力值', 1, 1, 99),
('灵石', 'material', 1, 'currency', 1, '通用货币', 0, 1, 999999),
('下品灵石', 'material', 1, 'currency', 1, '含有少量灵气', 0, 1, 999999),
('中品灵石', 'material', 3, 'currency', 10, '含有中等灵气', 0, 1, 999999),
('上品灵石', 'material', 5, 'currency', 100, '含有大量灵气', 0, 1, 999999),
('千年灵芝', 'material', 5, 'material', 2000, '珍贵药材，可炼制丹药', 0, 1, 99),
('妖兽内丹', 'material', 3, 'material', 500, '妖兽精华所在', 0, 1, 99),
('铁矿石', 'material', 1, 'material', 10, '常见的矿石', 0, 1, 999),
('玄铁矿', 'material', 3, 'material', 100, '稀有矿石', 0, 1, 999)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 9. 活动数据
INSERT INTO `activity` (`name`, `description`, `start_time`, `end_time`, `status`, `type`)
VALUES 
('新春庆典', '庆祝新春佳节，丰厚奖励等你来拿', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 20 DAY), 1, 1),
('宗门大比', '各宗门弟子切磋比武，争夺第一', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 1, 2),
('妖兽潮', '大批妖兽来袭，守护家园', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 1, 3),
('秘境开启', '上古秘境开启，机缘与危险并存', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 1, 4),
('签到活动', '每日签到领好礼', DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), 1, 5)
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- 10. 系统设置数据
INSERT INTO `system_setting` (`setting_key`, `setting_value`, `description`)
VALUES 
('server_name', '灵月仙途', '服务器名称'),
('server_version', '1.0.0', '服务器版本'),
('max_level', '100', '玩家最大等级'),
('max_realm', '渡劫期', '最高境界'),
('exp_rate', '1.0', '经验倍率'),
('drop_rate', '1.0', '掉落倍率'),
('online_reward_interval', '30', '在线奖励间隔（分钟）'),
('offline_protect_time', '72', '离线保护时间（小时）')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- 11. 资产类型数据
INSERT INTO `asset_types` (`code`, `name`, `description`)
VALUES 
('CURRENCY', '货币', '各类货币资产'),
('CONSUMABLE', '消耗品', '丹药、符箓等消耗品'),
('MATERIAL', '材料', '炼器炼丹材料'),
('EQUIPMENT', '装备', '武器装备'),
('SPECIAL', '特殊', '特殊道具')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 12. 地图节点数据
INSERT INTO `map_node` (`map_code`, `map_name`, `map_type`, `layer_level`, `recommend_level`, `recommend_combat`, `environment_desc`, `monster_density`, `drop_weight`, `main_products`, `status`, `online_count`)
VALUES 
('MAP_011', '落霞镇', 1, 1, 1, 100, '新手村落，宁静祥和', '无', '无', '基础物资', 1, 50),
('MAP_012', '妖兽森林边缘', 2, 1, 5, 500, '有低级妖兽出没', '低', '普通', '妖兽材料、草药', 1, 120),
('MAP_013', '黑风洞', 3, 1, 10, 1500, '阴暗潮湿的洞穴', '中', '优秀', '矿石、妖兽内丹', 1, 80),
('MAP_014', '火焰山', 2, 2, 25, 5000, '炽热无比，岩浆翻滚', '高', '稀有', '火系材料、晶石', 1, 60),
('MAP_015', '冰原', 2, 2, 30, 6000, '冰天雪地，寒风刺骨', '中', '稀有', '冰系材料、雪莲', 1, 45),
('MAP_016', '古战场', 3, 3, 40, 10000, '上古战场，怨气冲天', '高', '史诗', '法宝碎片、战利品', 1, 35),
('MAP_017', '龙族秘境', 4, 1, 50, 15000, '龙族栖息之地', '极高', '传说', '龙鳞、龙血、龙珠', 1, 20),
('MAP_018', '仙界入口', 4, 1, 80, 50000, '通往仙界的入口', '无', '仙级', '仙器碎片', 1, 5)
ON DUPLICATE KEY UPDATE environment_desc = VALUES(environment_desc);

-- 13. 邮件数据（给每个玩家发送欢迎邮件）
INSERT INTO `mail` (`user_id`, `title`, `content`, `type`, `has_attachment`, `is_read`, `send_time`, `expire_time`)
SELECT gu.id, '欢迎来到灵月仙途', '尊敬的道友，欢迎来到灵月仙途世界！\n\n这是一份新手礼包，请查收。\n\n祝道友修仙之路一帆风顺！', 1, 1, 0, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)
FROM game_user gu
ON DUPLICATE KEY UPDATE content = VALUES(content);

-- 14. 技能数据
INSERT INTO `skill` (`skill_name`, `description`, `skill_type`, `skill_level`, `max_level`, `attack_bonus`, `defense_bonus`, `xiuwei_bonus`, `status`)
VALUES 
('基础剑法', '最基础的剑法招式，简单易学', '攻击', 1, 12, 100, 0, 50, 1),
('灵力护盾', '凝聚灵力形成护盾，抵御伤害', '防御', 1, 12, 0, 150, 30, 1),
('聚气诀', '快速聚集灵气的功法', '功法', 1, 12, 0, 0, 200, 1),
('瞬影步', '快速移动的身法', '身法', 1, 12, 0, 0, 50, 1),
('火球术', '操控火焰形成火球攻击敌人', '攻击', 1, 12, 200, 0, 80, 1),
('冰魄术', '极寒之力凝结成冰，冻结敌人', '攻击', 1, 12, 180, 0, 100, 1),
('金刚诀', '强化肉身的防御功法', '防御', 1, 12, 50, 300, 100, 1),
('天雷诀', '引动天雷之力，威力巨大', '攻击', 1, 12, 500, 0, 200, 1),
('五行遁术', '借助五行之力快速遁走', '辅助', 1, 12, 0, 100, 150, 1),
('九转玄功', '上古修炼功法，全面提升修为', '功法', 1, 12, 100, 100, 500, 1)
ON DUPLICATE KEY UPDATE description = VALUES(description);

SELECT '✅ 所有数据初始化完成！' AS message;
