-- ============================================
-- 全量数据库表字段检测与修复脚本
-- 生成时间：2026-04-01
-- 用途：智能检测并修复所有数据库表与实体类不匹配的字段
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- 1. game_role 表字段修复
-- ========================================
ALTER TABLE game_role 
ADD COLUMN IF NOT EXISTS age INT DEFAULT 18 COMMENT '年龄',
ADD COLUMN IF NOT EXISTS max_age INT DEFAULT 100 COMMENT '最大年龄',
ADD COLUMN IF NOT EXISTS life_status INT DEFAULT 0 COMMENT '生命状态 (0-存活，1-死亡)',
ADD COLUMN IF NOT EXISTS death_time DATETIME COMMENT '死亡时间',
ADD COLUMN IF NOT EXISTS reincarnation_count INT DEFAULT 0 COMMENT '轮回次数',
ADD COLUMN IF NOT EXISTS cultivation_base DOUBLE DEFAULT 1.0 COMMENT '修炼基础',
ADD COLUMN IF NOT EXISTS longevity_bonus INT DEFAULT 0 COMMENT '寿命加成';

-- ========================================
-- 2. role_asset 表字段修复
-- ========================================
ALTER TABLE role_asset 
ADD COLUMN IF NOT EXISTS subtype VARCHAR(50) COMMENT '资产子类型',
ADD COLUMN IF NOT EXISTS rarity INT DEFAULT 1 COMMENT '品质等级',
ADD COLUMN IF NOT EXISTS description TEXT COMMENT '资产描述',
ADD COLUMN IF NOT EXISTS effect TEXT COMMENT '资产效果',
ADD COLUMN IF NOT EXISTS affixes JSON COMMENT '附加属性';

-- ========================================
-- 3. role_skill 表字段修复
-- ========================================
ALTER TABLE role_skill 
ADD COLUMN IF NOT EXISTS equipped TINYINT(1) DEFAULT 0 COMMENT '是否装备 (0-未装备，1-已装备)';

-- 修改 equipped 字段类型以匹配实体类
ALTER TABLE role_skill MODIFY COLUMN equipped TINYINT(1) DEFAULT 0;

-- ========================================
-- 4. role_clan 表字段修复 (注意：表名是 role_clans)
-- ========================================
-- 检查表是否存在，如果不存在则创建
CREATE TABLE IF NOT EXISTS role_clans (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT,
    clan_id BIGINT,
    position VARCHAR(50) DEFAULT 'member',
    contribution INT DEFAULT 0,
    join_date VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    `rank` INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 添加缺失的字段
ALTER TABLE role_clans 
ADD COLUMN IF NOT EXISTS position VARCHAR(50) DEFAULT 'member' COMMENT '职位',
ADD COLUMN IF NOT EXISTS contribution INT DEFAULT 0 COMMENT '贡献值',
ADD COLUMN IF NOT EXISTS join_date VARCHAR(20) COMMENT '加入日期',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' COMMENT '状态',
ADD COLUMN IF NOT EXISTS `rank` INT DEFAULT 0 COMMENT '宗门内排名';

-- ========================================
-- 5. role_equipment 表字段修复
-- ========================================
ALTER TABLE role_equipment 
ADD COLUMN IF NOT EXISTS item_id BIGINT COMMENT '物品 ID',
ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 1 COMMENT '数量',
ADD COLUMN IF NOT EXISTS acquired_at DATETIME COMMENT '获得时间',
ADD COLUMN IF NOT EXISTS equip_time DATETIME COMMENT '装备时间',
ADD COLUMN IF NOT EXISTS slot_id INT COMMENT '装备槽位 ID',
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255) COMMENT '装备名称',
ADD COLUMN IF NOT EXISTS item_type VARCHAR(50) COMMENT '装备类型',
ADD COLUMN IF NOT EXISTS rarity INT DEFAULT 1 COMMENT '品质等级',
ADD COLUMN IF NOT EXISTS base_stats JSON COMMENT '基础属性',
ADD COLUMN IF NOT EXISTS affixes JSON COMMENT '附加属性',
ADD COLUMN IF NOT EXISTS spirit JSON COMMENT '器灵信息',
ADD COLUMN IF NOT EXISTS spirit_level INT DEFAULT 0 COMMENT '器灵等级',
ADD COLUMN IF NOT EXISTS durability INT DEFAULT 100 COMMENT '耐久度';

-- ========================================
-- 6. role_item 表字段修复
-- ========================================
CREATE TABLE IF NOT EXISTS role_item (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    item_name VARCHAR(255),
    item_type VARCHAR(50),
    subtype VARCHAR(50),
    quantity INT DEFAULT 0,
    rarity INT DEFAULT 1,
    description TEXT,
    effect TEXT,
    affixes JSON,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_id (role_id),
    INDEX idx_item_type (item_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE role_item 
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255) COMMENT '物品名称',
ADD COLUMN IF NOT EXISTS item_type VARCHAR(50) COMMENT '物品类型',
ADD COLUMN IF NOT EXISTS subtype VARCHAR(50) COMMENT '物品子类型',
ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 0 COMMENT '数量',
ADD COLUMN IF NOT EXISTS rarity INT DEFAULT 1 COMMENT '品质等级',
ADD COLUMN IF NOT EXISTS description TEXT COMMENT '物品描述',
ADD COLUMN IF NOT EXISTS effect TEXT COMMENT '物品效果',
ADD COLUMN IF NOT EXISTS affixes JSON COMMENT '附加属性';

-- ========================================
-- 7. role_task 表字段修复
-- ========================================
ALTER TABLE role_task 
ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) COMMENT '任务类型',
ADD COLUMN IF NOT EXISTS reward_claimed TINYINT(1) DEFAULT 0 COMMENT '奖励是否领取',
ADD COLUMN IF NOT EXISTS started_at DATETIME COMMENT '开始时间',
ADD COLUMN IF NOT EXISTS completed_at DATETIME COMMENT '完成时间';

-- ========================================
-- 8. role_realm 表字段修复
-- ========================================
ALTER TABLE role_realm 
ADD COLUMN IF NOT EXISTS realm_stage INT DEFAULT 1 COMMENT '境界阶段',
ADD COLUMN IF NOT EXISTS breakthrough_success_rate DECIMAL(5,2) COMMENT '突破成功率';

-- ========================================
-- 9. role_body_cultivation 表字段修复
-- ========================================
ALTER TABLE role_body_cultivation 
ADD COLUMN IF NOT EXISTS breakthrough_count INT DEFAULT 0 COMMENT '突破次数',
ADD COLUMN IF NOT EXISTS last_breakthrough_time DATETIME COMMENT '上次突破时间';

-- ========================================
-- 10. role_body_part_progress 表字段修复
-- ========================================
CREATE TABLE IF NOT EXISTS role_body_part_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    body_part_id BIGINT NOT NULL,
    progress INT DEFAULT 0,
    level INT DEFAULT 1,
    experience BIGINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_body_part (role_id, body_part_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 11. role_activity 表字段修复
-- ========================================
ALTER TABLE role_activity 
ADD COLUMN IF NOT EXISTS activity_name VARCHAR(100) COMMENT '活动名称',
ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 COMMENT '参与进度',
ADD COLUMN IF NOT EXISTS reward_claimed TINYINT(1) DEFAULT 0 COMMENT '奖励是否领取';

-- ========================================
-- 12. role_achievement 表字段修复
-- ========================================
ALTER TABLE role_achievement 
ADD COLUMN IF NOT EXISTS completed_at DATETIME COMMENT '完成时间',
ADD COLUMN IF NOT EXISTS reward_claimed TINYINT(1) DEFAULT 0 COMMENT '奖励是否领取';

-- ========================================
-- 13. role_checkin 表字段修复
-- ========================================
ALTER TABLE role_checkin 
ADD COLUMN IF NOT EXISTS last_checkin_time DATETIME COMMENT '上次签到时间',
ADD COLUMN IF NOT EXISTS total_checkin_days INT DEFAULT 0 COMMENT '累计签到天数';

-- ========================================
-- 14. role_resource 表字段修复
-- ========================================
CREATE TABLE IF NOT EXISTS role_resource (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    resource_type_id BIGINT NOT NULL,
    quantity BIGINT DEFAULT 0,
    version INT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_resource (role_id, resource_type_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 15. role_map_node 表字段修复
-- ========================================
ALTER TABLE role_map_node 
ADD COLUMN IF NOT EXISTS current_x INT DEFAULT 0 COMMENT '当前 X 坐标',
ADD COLUMN IF NOT EXISTS current_y INT DEFAULT 0 COMMENT '当前 Y 坐标',
ADD COLUMN IF NOT EXISTS last_move_time DATETIME COMMENT '最后移动时间';

-- ========================================
-- 16. clan 表字段修复
-- ========================================
ALTER TABLE clan 
ADD COLUMN IF NOT EXISTS level INT DEFAULT 1 COMMENT '宗门等级',
ADD COLUMN IF NOT EXISTS members_count INT DEFAULT 0 COMMENT '成员数量',
ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 50 COMMENT '最大成员数',
ADD COLUMN IF NOT EXISTS leader_id BIGINT COMMENT '宗主角色 ID',
ADD COLUMN IF NOT EXISTS leader_name VARCHAR(100) COMMENT '宗主名称';

-- ========================================
-- 17. clan_member 表字段修复
-- ========================================
ALTER TABLE clan_member 
ADD COLUMN IF NOT EXISTS role_name VARCHAR(100) COMMENT '角色名称',
ADD COLUMN IF NOT EXISTS leave_time DATETIME COMMENT '离开时间',
ADD COLUMN IF NOT EXISTS leave_reason VARCHAR(255) COMMENT '离开原因';

-- ========================================
-- 18. inventory 表字段修复
-- ========================================
CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    item_name VARCHAR(100),
    item_type VARCHAR(50),
    rarity VARCHAR(20) DEFAULT 'common',
    stack_size INT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 19. asset_types 表字段修复
-- ========================================
ALTER TABLE asset_types 
ADD COLUMN IF NOT EXISTS icon VARCHAR(255) COMMENT '图标',
ADD COLUMN IF NOT EXISTS icon_path VARCHAR(255) COMMENT '图标路径',
ADD COLUMN IF NOT EXISTS decimal_precision INT DEFAULT 0 COMMENT '小数精度',
ADD COLUMN IF NOT EXISTS tradable TINYINT(1) DEFAULT 1 COMMENT '是否可交易',
ADD COLUMN IF NOT EXISTS droppable TINYINT(1) DEFAULT 1 COMMENT '是否可掉落',
ADD COLUMN IF NOT EXISTS max_stack INT DEFAULT 99 COMMENT '最大堆叠',
ADD COLUMN IF NOT EXISTS destroy_policy VARCHAR(50) DEFAULT 'none' COMMENT '销毁策略',
ADD COLUMN IF NOT EXISTS modules VARCHAR(255) COMMENT '模块',
ADD COLUMN IF NOT EXISTS is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统资产',
ADD COLUMN IF NOT EXISTS deleted_at DATETIME COMMENT '删除时间';

-- ========================================
-- 20. announcement 表字段修复
-- ========================================
ALTER TABLE announcement 
ADD COLUMN IF NOT EXISTS create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
ADD COLUMN IF NOT EXISTS update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
ADD COLUMN IF NOT EXISTS publish_time DATETIME COMMENT '发布时间',
ADD COLUMN IF NOT EXISTS author VARCHAR(100) COMMENT '作者';

-- ========================================
-- 21. mail 表字段修复
-- ========================================
ALTER TABLE mail 
ADD COLUMN IF NOT EXISTS mail_type VARCHAR(50) DEFAULT 'system' COMMENT '邮件类型',
ADD COLUMN IF NOT EXISTS expire_time DATETIME COMMENT '过期时间',
ADD COLUMN IF NOT EXISTS attachment_claimed TINYINT(1) DEFAULT 0 COMMENT '附件是否领取';

-- ========================================
-- 22. mail_item 表字段修复
-- ========================================
ALTER TABLE mail_item 
ADD COLUMN IF NOT EXISTS claim_time DATETIME COMMENT '领取时间';

-- ========================================
-- 23. friend 表字段修复
-- ========================================
ALTER TABLE friend 
ADD COLUMN IF NOT EXISTS remark VARCHAR(100) COMMENT '备注',
ADD COLUMN IF NOT EXISTS intimacy INT DEFAULT 0 COMMENT '亲密度',
ADD COLUMN IF NOT EXISTS block_status TINYINT(1) DEFAULT 0 COMMENT '屏蔽状态';

-- ========================================
-- 24. task 表字段修复
-- ========================================
ALTER TABLE task 
ADD COLUMN IF NOT EXISTS task_difficulty VARCHAR(20) DEFAULT 'normal' COMMENT '任务难度',
ADD COLUMN IF NOT EXISTS min_level INT DEFAULT 1 COMMENT '最低等级要求',
ADD COLUMN IF NOT EXISTS max_level INT DEFAULT 100 COMMENT '最高等级要求',
ADD COLUMN IF NOT EXISTS repeat_count INT DEFAULT 0 COMMENT '可重复次数',
ADD COLUMN IF NOT EXISTS time_limit INT COMMENT '时间限制 (分钟)';

-- ========================================
-- 25. activity 表字段修复
-- ========================================
ALTER TABLE activity 
ADD COLUMN IF NOT EXISTS activity_type VARCHAR(50) DEFAULT 'event' COMMENT '活动类型',
ADD COLUMN IF NOT EXISTS min_level INT DEFAULT 1 COMMENT '最低参与等级',
ADD COLUMN IF NOT EXISTS max_participants INT COMMENT '最大参与人数',
ADD COLUMN IF NOT EXISTS join_condition TEXT COMMENT '参与条件';

-- ========================================
-- 26. skill 表字段修复
-- ========================================
ALTER TABLE skill 
ADD COLUMN IF NOT EXISTS skill_type VARCHAR(50) DEFAULT 'active' COMMENT '技能类型 (active/passive)',
ADD COLUMN IF NOT EXISTS max_level INT DEFAULT 10 COMMENT '最大等级',
ADD COLUMN IF NOT EXISTS upgrade_cost INT COMMENT '升级消耗',
ADD COLUMN IF NOT EXISTS icon VARCHAR(255) COMMENT '技能图标',
ADD COLUMN IF NOT EXISTS trigger_rate DECIMAL(5,2) COMMENT '触发概率';

-- ========================================
-- 27. equipment 表字段修复
-- ========================================
ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS quality_level INT DEFAULT 1 COMMENT '品质等级',
ADD COLUMN IF NOT EXISTS min_damage INT COMMENT '最小伤害',
ADD COLUMN IF NOT EXISTS max_damage INT COMMENT '最大伤害',
ADD COLUMN IF NOT EXISTS durability INT DEFAULT 100 COMMENT '耐久度',
ADD COLUMN IF NOT EXISTS max_durability INT DEFAULT 100 COMMENT '最大耐久度',
ADD COLUMN IF NOT EXISTS required_level INT DEFAULT 1 COMMENT '需要等级',
ADD COLUMN IF NOT EXISTS required_spirit_root VARCHAR(50) COMMENT '需要灵根';

-- ========================================
-- 28. item 表字段修复
-- ========================================
ALTER TABLE item 
ADD COLUMN IF NOT EXISTS item_level INT DEFAULT 1 COMMENT '物品等级',
ADD COLUMN IF NOT EXISTS quality VARCHAR(20) DEFAULT 'common' COMMENT '品质',
ADD COLUMN IF NOT EXISTS icon VARCHAR(255) COMMENT '图标',
ADD COLUMN IF NOT EXISTS max_stack_size INT DEFAULT 99 COMMENT '最大堆叠数',
ADD COLUMN IF NOT EXISTS sell_price INT COMMENT '出售价格',
ADD COLUMN IF NOT EXISTS bind_type VARCHAR(20) DEFAULT 'none' COMMENT '绑定类型';

-- ========================================
-- 29. gift 表字段修复
-- ========================================
ALTER TABLE gift 
ADD COLUMN IF NOT EXISTS gift_type VARCHAR(50) DEFAULT 'system' COMMENT '礼物类型',
ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0 COMMENT '优先级',
ADD COLUMN IF NOT EXISTS valid_days INT COMMENT '有效天数';

-- ========================================
-- 30. shop_item 表字段修复
-- ========================================
ALTER TABLE shop_item 
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0 COMMENT '排序',
ADD COLUMN IF NOT EXISTS discount DECIMAL(5,2) COMMENT '折扣',
ADD COLUMN IF NOT EXISTS purchase_limit INT COMMENT '购买限制',
ADD COLUMN IF NOT EXISTS shelf_status TINYINT(1) DEFAULT 1 COMMENT '上架状态';

-- ========================================
-- 31. cultivation_task 表字段修复
-- ========================================
ALTER TABLE cultivation_task 
ADD COLUMN IF NOT EXISTS task_reward_type VARCHAR(50) COMMENT '任务奖励类型',
ADD COLUMN IF NOT EXISTS daily_limit INT DEFAULT 1 COMMENT '每日限制次数';

-- ========================================
-- 32. breakthrough_history 表字段修复
-- ========================================
ALTER TABLE breakthrough_history 
ADD COLUMN IF NOT EXISTS breakthrough_type VARCHAR(50) COMMENT '突破类型',
ADD COLUMN IF NOT EXISTS cost_items JSON COMMENT '消耗物品',
ADD COLUMN IF NOT EXISTS bonus_rate DECIMAL(5,2) COMMENT '加成概率';

-- ========================================
-- 33. stat_operation_log 表字段修复
-- ========================================
ALTER TABLE stat_operation_log 
ADD COLUMN IF NOT EXISTS operation_desc VARCHAR(255) COMMENT '操作描述',
ADD COLUMN IF NOT EXISTS before_value JSON COMMENT '操作前值',
ADD COLUMN IF NOT EXISTS after_value JSON COMMENT '操作后值';

-- ========================================
-- 34. role_attribute_cache 表字段修复
-- ========================================
CREATE TABLE IF NOT EXISTS t_role_attribute_cache (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL UNIQUE,
    cached_attrs JSON,
    version BIGINT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 35. cfg_attribute_rule 表字段修复
-- ========================================
ALTER TABLE cfg_attribute_rule 
ADD COLUMN IF NOT EXISTS rule_type VARCHAR(50) COMMENT '规则类型',
ADD COLUMN IF NOT EXISTS priority INT DEFAULT 0 COMMENT '优先级';

-- ========================================
-- 36. 设置默认值
-- ========================================
UPDATE game_role SET age = 18 WHERE age IS NULL;
UPDATE game_role SET max_age = 100 WHERE max_age IS NULL;
UPDATE game_role SET life_status = 0 WHERE life_status IS NULL;
UPDATE game_role SET reincarnation_count = 0 WHERE reincarnation_count IS NULL;
UPDATE game_role SET cultivation_base = 1.0 WHERE cultivation_base IS NULL;
UPDATE game_role SET longevity_bonus = 0 WHERE longevity_bonus IS NULL;

UPDATE role_asset SET subtype = 'general' WHERE subtype IS NULL;
UPDATE role_asset SET rarity = 1 WHERE rarity IS NULL;

UPDATE role_skill SET equipped = 0 WHERE equipped IS NULL;

UPDATE role_equipment SET quantity = 1 WHERE quantity IS NULL;
UPDATE role_equipment SET rarity = 1 WHERE rarity IS NULL;
UPDATE role_equipment SET durability = 100 WHERE durability IS NULL;

UPDATE role_item SET subtype = 'general' WHERE subtype IS NULL;
UPDATE role_item SET quantity = 0 WHERE quantity IS NULL;
UPDATE role_item SET rarity = 1 WHERE rarity IS NULL;

UPDATE role_task SET task_type = 'general' WHERE task_type IS NULL;
UPDATE role_task SET reward_claimed = 0 WHERE reward_claimed IS NULL;

UPDATE role_realm SET realm_stage = 1 WHERE realm_stage IS NULL;

UPDATE role_body_cultivation SET breakthrough_count = 0 WHERE breakthrough_count IS NULL;

UPDATE role_achievement SET reward_claimed = 0 WHERE reward_claimed IS NULL;

UPDATE role_checkin SET total_checkin_days = 0 WHERE total_checkin_days IS NULL;

UPDATE role_map_node SET current_x = 0 WHERE current_x IS NULL;
UPDATE role_map_node SET current_y = 0 WHERE current_y IS NULL;

UPDATE clan SET level = 1 WHERE level IS NULL;
UPDATE clan SET members_count = 0 WHERE members_count IS NULL;
UPDATE clan SET max_members = 50 WHERE max_members IS NULL;

UPDATE asset_types SET decimal_precision = 0 WHERE decimal_precision IS NULL;
UPDATE asset_types SET tradable = 1 WHERE tradable IS NULL;
UPDATE asset_types SET droppable = 1 WHERE droppable IS NULL;
UPDATE asset_types SET max_stack = 99 WHERE max_stack IS NULL;
UPDATE asset_types SET destroy_policy = 'none' WHERE destroy_policy IS NULL;
UPDATE asset_types SET is_system = 0 WHERE is_system IS NULL;

UPDATE announcement SET create_time = NOW() WHERE create_time IS NULL;
UPDATE announcement SET update_time = NOW() WHERE update_time IS NULL;

UPDATE mail SET mail_type = 'system' WHERE mail_type IS NULL;
UPDATE mail SET attachment_claimed = 0 WHERE attachment_claimed IS NULL;

UPDATE friend SET remark = '' WHERE remark IS NULL;
UPDATE friend SET intimacy = 0 WHERE intimacy IS NULL;
UPDATE friend SET block_status = 0 WHERE block_status IS NULL;

UPDATE task SET task_difficulty = 'normal' WHERE task_difficulty IS NULL;
UPDATE task SET min_level = 1 WHERE min_level IS NULL;
UPDATE task SET max_level = 100 WHERE max_level IS NULL;
UPDATE task SET repeat_count = 0 WHERE repeat_count IS NULL;

UPDATE activity SET activity_type = 'event' WHERE activity_type IS NULL;
UPDATE activity SET min_level = 1 WHERE min_level IS NULL;

UPDATE skill SET skill_type = 'active' WHERE skill_type IS NULL;
UPDATE skill SET max_level = 10 WHERE max_level IS NULL;

UPDATE equipment SET quality_level = 1 WHERE quality_level IS NULL;
UPDATE equipment SET durability = 100 WHERE durability IS NULL;
UPDATE equipment SET max_durability = 100 WHERE max_durability IS NULL;
UPDATE equipment SET required_level = 1 WHERE required_level IS NULL;

UPDATE item SET item_level = 1 WHERE item_level IS NULL;
UPDATE item SET quality = 'common' WHERE quality IS NULL;
UPDATE item SET max_stack_size = 99 WHERE max_stack_size IS NULL;
UPDATE item SET bind_type = 'none' WHERE bind_type IS NULL;

UPDATE gift SET gift_type = 'system' WHERE gift_type IS NULL;
UPDATE gift SET priority = 0 WHERE priority IS NULL;

UPDATE shop_item SET sort_order = 0 WHERE sort_order IS NULL;
UPDATE shop_item SET shelf_status = 1 WHERE shelf_status IS NULL;

UPDATE cultivation_task SET daily_limit = 1 WHERE daily_limit IS NULL;

UPDATE cfg_attribute_rule SET priority = 0 WHERE priority IS NULL;

-- ========================================
-- 37. 创建必要的索引
-- ========================================
CREATE INDEX IF NOT EXISTS idx_role_asset_role_id ON role_asset(role_id);
CREATE INDEX IF NOT EXISTS idx_role_asset_type ON role_asset(asset_type_code);
CREATE INDEX IF NOT EXISTS idx_role_skill_role_id ON role_skill(role_id);
CREATE INDEX IF NOT EXISTS idx_role_skill_skill_id ON role_skill(skill_id);
CREATE INDEX IF NOT EXISTS idx_role_equipment_role_id ON role_equipment(role_id);
CREATE INDEX IF NOT EXISTS idx_role_item_role_id ON role_item(role_id);
CREATE INDEX IF NOT EXISTS idx_role_task_role_id ON role_task(role_id);
CREATE INDEX IF NOT EXISTS idx_role_achievement_role_id ON role_achievement(role_id);
CREATE INDEX IF NOT EXISTS idx_role_checkin_role_id ON role_checkin(role_id);
CREATE INDEX IF NOT EXISTS idx_role_clans_role_id ON role_clans(role_id);
CREATE INDEX IF NOT EXISTS idx_role_clans_clan_id ON role_clans(clan_id);
CREATE INDEX IF NOT EXISTS idx_inventory_role_id ON inventory(role_id);
CREATE INDEX IF NOT EXISTS idx_friend_role_id ON friend(role_id);
CREATE INDEX IF NOT EXISTS idx_mail_user_id ON mail(user_id);
CREATE INDEX IF NOT EXISTS idx_task_status ON task(status);
CREATE INDEX IF NOT EXISTS idx_activity_status ON activity(status);
CREATE INDEX IF NOT EXISTS idx_skill_type ON skill(type);
CREATE INDEX IF NOT EXISTS idx_equipment_type ON equipment(type);
CREATE INDEX IF NOT EXISTS idx_item_type ON item(type);
CREATE INDEX IF NOT EXISTS idx_clan_status ON clan(status);
CREATE INDEX IF NOT EXISTS idx_clan_member_role_id ON clan_member(role_id);

-- ========================================
-- 38. 输出修复报告
-- ========================================
SELECT '✅ 数据库表结构检测与修复完成！' AS message;
SELECT '已修复以下表的缺失字段:' AS table_name;
SELECT '1. game_role' AS fixed_table
UNION ALL SELECT '2. role_asset'
UNION ALL SELECT '3. role_skill'
UNION ALL SELECT '4. role_clans'
UNION ALL SELECT '5. role_equipment'
UNION ALL SELECT '6. role_item'
UNION ALL SELECT '7. role_task'
UNION ALL SELECT '8. role_realm'
UNION ALL SELECT '9. role_body_cultivation'
UNION ALL SELECT '10. role_body_part_progress'
UNION ALL SELECT '11. role_activity'
UNION ALL SELECT '12. role_achievement'
UNION ALL SELECT '13. role_checkin'
UNION ALL SELECT '14. role_resource'
UNION ALL SELECT '15. role_map_node'
UNION ALL SELECT '16. clan'
UNION ALL SELECT '17. clan_member'
UNION ALL SELECT '18. inventory'
UNION ALL SELECT '19. asset_types'
UNION ALL SELECT '20. announcement'
UNION ALL SELECT '21. mail'
UNION ALL SELECT '22. mail_item'
UNION ALL SELECT '23. friend'
UNION ALL SELECT '24. task'
UNION ALL SELECT '25. activity'
UNION ALL SELECT '26. skill'
UNION ALL SELECT '27. equipment'
UNION ALL SELECT '28. item'
UNION ALL SELECT '29. gift'
UNION ALL SELECT '30. shop_item'
UNION ALL SELECT '31. cultivation_task'
UNION ALL SELECT '32. breakthrough_history'
UNION ALL SELECT '33. stat_operation_log'
UNION ALL SELECT '34. t_role_attribute_cache'
UNION ALL SELECT '35. cfg_attribute_rule';

SET FOREIGN_KEY_CHECKS = 1;
