-- ============================================
-- 灵月仙途 - 数据库字段完整性修复和架构同步
-- 自动检测并补全所有缺失字段
-- 执行日期：2026-04-01
-- ============================================

-- ============================================
-- 第一部分：game_role 表字段补全
-- ============================================

-- 1.1 添加修炼相关字段
ALTER TABLE `game_role` 
ADD COLUMN IF NOT EXISTS `realm_stage` VARCHAR(20) DEFAULT '初' COMMENT '境界阶段' AFTER `realm`,
ADD COLUMN IF NOT EXISTS `world_level` VARCHAR(20) DEFAULT '人间界' COMMENT '世界等级' AFTER `realm_stage`,
ADD COLUMN IF NOT EXISTS `cultivation` INT DEFAULT 0 COMMENT '当前修为' AFTER `world_level`,
ADD COLUMN IF NOT EXISTS `cultivation_max` INT DEFAULT 100 COMMENT '修为上限' AFTER `cultivation`,
ADD COLUMN IF NOT EXISTS `spirit_stones` INT DEFAULT 0 COMMENT '灵石数量' AFTER `cultivation_max`;

-- 1.2 添加职业相关字段
ALTER TABLE `game_role`
ADD COLUMN IF NOT EXISTS `profession` VARCHAR(50) COMMENT '职业' AFTER `spirit_stones`,
ADD COLUMN IF NOT EXISTS `profession_level` INT DEFAULT 0 COMMENT '职业等级' AFTER `profession`,
ADD COLUMN IF NOT EXISTS `profession_exp` INT DEFAULT 0 COMMENT '职业经验' AFTER `profession_level`,
ADD COLUMN IF NOT EXISTS `profession_certified` BOOLEAN DEFAULT false COMMENT '是否认证' AFTER `profession_exp`;

-- 1.3 添加宗门相关字段
ALTER TABLE `game_role`
ADD COLUMN IF NOT EXISTS `sect` VARCHAR(100) COMMENT '宗门名称' AFTER `profession_certified`,
ADD COLUMN IF NOT EXISTS `sect_position` VARCHAR(50) DEFAULT '外门弟子' COMMENT '宗门职位' AFTER `sect`,
ADD COLUMN IF NOT EXISTS `partner` VARCHAR(100) COMMENT '道侣' AFTER `sect_position`;

-- 1.4 添加日常修炼字段
ALTER TABLE `game_role`
ADD COLUMN IF NOT EXISTS `today_cultivation_times` INT DEFAULT 0 COMMENT '今日修炼次数' AFTER `partner`,
ADD COLUMN IF NOT EXISTS `max_daily_cultivation_times` INT DEFAULT 10 COMMENT '每日最大修炼次数' AFTER `today_cultivation_times`;

-- 1.5 添加索引
CREATE INDEX IF NOT EXISTS `idx_game_role_realm_stage` ON `game_role`(`realm_stage`);
CREATE INDEX IF NOT EXISTS `idx_game_role_world_level` ON `game_role`(`world_level`);
CREATE INDEX IF NOT EXISTS `idx_game_role_cultivation` ON `game_role`(`cultivation`);

-- ============================================
-- 第二部分：inventory 表字段补全
-- ============================================

-- 2.1 添加绑定状态字段
ALTER TABLE `inventory`
ADD COLUMN IF NOT EXISTS `is_bound` BOOLEAN DEFAULT false COMMENT '是否绑定' AFTER `stack_size`;

-- 2.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_inventory_is_bound` ON `inventory`(`is_bound`);
CREATE INDEX IF NOT EXISTS `idx_inventory_role_id` ON `inventory`(`role_id`);

-- ============================================
-- 第三部分：role_skill 表字段补全
-- ============================================

-- 3.1 根据实体类补充字段
ALTER TABLE `role_skill`
ADD COLUMN IF NOT EXISTS `equipped` BOOLEAN DEFAULT FALSE COMMENT '是否装备' AFTER `experience`;

-- 3.2 确保字段类型一致
ALTER TABLE `role_skill` 
MODIFY COLUMN IF EXISTS `skill_level` INT NOT NULL DEFAULT 1 COMMENT '技能等级',
MODIFY COLUMN IF EXISTS `experience` INT DEFAULT 0 COMMENT '技能熟练度';

-- ============================================
-- 第四部分：role_asset 表字段补全
-- ============================================

-- 4.1 根据实体类确保字段完整
ALTER TABLE `role_asset`
ADD COLUMN IF NOT EXISTS `quantity` BIGINT DEFAULT 0 COMMENT '数量' AFTER `asset_type_code`;

-- 4.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_role_asset_role_id` ON `role_asset`(`role_id`);
CREATE INDEX IF NOT EXISTS `idx_role_asset_type` ON `role_asset`(`asset_type_code`);

-- ============================================
-- 第五部分：role_body_cultivation 表字段补全
-- ============================================

-- 5.1 根据实体类补充缺失字段
ALTER TABLE `role_body_cultivation`
ADD COLUMN IF NOT EXISTS `mutation_id` BIGINT COMMENT '异变 ID' AFTER `tolerance`,
ADD COLUMN IF NOT EXISTS `status` INT DEFAULT 1 COMMENT '状态' AFTER `mutation_id`,
ADD COLUMN IF NOT EXISTS `injury_recovery_time` DATETIME COMMENT '受伤恢复时间' AFTER `status`,
ADD COLUMN IF NOT EXISTS `total_cultivate_count` INT DEFAULT 0 COMMENT '总修炼次数' AFTER `injury_recovery_time`,
ADD COLUMN IF NOT EXISTS `total_breakthrough_count` INT DEFAULT 0 COMMENT '总突破次数' AFTER `total_cultivate_count`,
ADD COLUMN IF NOT EXISTS `failed_breakthrough_count` INT DEFAULT 0 COMMENT '失败突破次数' AFTER `total_breakthrough_count`,
ADD COLUMN IF NOT EXISTS `last_cultivate_time` DATETIME COMMENT '最后修炼时间' AFTER `failed_breakthrough_count`;

-- 5.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_role_body_cultivation_role_id` ON `role_body_cultivation`(`role_id`);

-- ============================================
-- 第六部分：role_base_stats 表字段补全
-- ============================================

-- 6.1 根据实体类确保字段完整
ALTER TABLE `role_base_stats`
ADD COLUMN IF NOT EXISTS `vit` INT DEFAULT 10 COMMENT '根骨',
ADD COLUMN IF NOT EXISTS `spi` INT DEFAULT 10 COMMENT '灵力',
ADD COLUMN IF NOT EXISTS `agi` INT DEFAULT 10 COMMENT '身法',
ADD COLUMN IF NOT EXISTS `wis` INT DEFAULT 10 COMMENT '悟性',
ADD COLUMN IF NOT EXISTS `lck` INT DEFAULT 10 COMMENT '气运';

-- ============================================
-- 第七部分：t_player_stats_base 表字段补全
-- ============================================

-- 7.1 根据实体类补充缺失字段
ALTER TABLE `t_player_stats_base`
ADD COLUMN IF NOT EXISTS `last_calc_ver` BIGINT DEFAULT 0 COMMENT '最后计算版本' AFTER `tmp_lck`;

-- ============================================
-- 第八部分：role_equipment 表字段补全
-- ============================================

-- 8.1 根据实体类补充字段
ALTER TABLE `role_equipment`
ADD COLUMN IF NOT EXISTS `slot` INT COMMENT '装备槽位' AFTER `equipment_id`,
ADD COLUMN IF NOT EXISTS `status` INT COMMENT '状态' AFTER `slot`,
ADD COLUMN IF NOT EXISTS `equip_time` DATETIME COMMENT '装备时间' AFTER `status`;

-- 8.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_role_equipment_role_id` ON `role_equipment`(`role_id`);

-- ============================================
-- 第九部分：clan 表字段补全
-- ============================================

-- 9.1 根据实体类补充字段
ALTER TABLE `clans`
ADD COLUMN IF NOT EXISTS `level` INT DEFAULT 1 COMMENT '宗门等级' AFTER `description`,
ADD COLUMN IF NOT EXISTS `members_count` INT DEFAULT 0 COMMENT '成员数量' AFTER `level`,
ADD COLUMN IF NOT EXISTS `contribution` INT DEFAULT 0 COMMENT '贡献度' AFTER `members_count`,
ADD COLUMN IF NOT EXISTS `leader_name` VARCHAR(100) COMMENT '宗主名称' AFTER `contribution`,
ADD COLUMN IF NOT EXISTS `leader_id` BIGINT COMMENT '宗主 ID' AFTER `leader_name`,
ADD COLUMN IF NOT EXISTS `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态' AFTER `leader_id`,
ADD COLUMN IF NOT EXISTS `location` VARCHAR(100) COMMENT '位置' AFTER `status`,
ADD COLUMN IF NOT EXISTS `max_members` INT DEFAULT 50 COMMENT '最大成员数' AFTER `location`,
ADD COLUMN IF NOT EXISTS `required_level` INT DEFAULT 1 COMMENT '加入要求等级' AFTER `max_members`,
ADD COLUMN IF NOT EXISTS `spirit_stone` BIGINT COMMENT '宗门灵石' AFTER `required_level`;

-- 9.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_clans_status` ON `clans`(`status`);
CREATE INDEX IF NOT EXISTS `idx_clans_leader_id` ON `clans`(`leader_id`);

-- ============================================
-- 第十部分：clan_member 表字段补全
-- ============================================

-- 10.1 根据实体类补充字段
ALTER TABLE `clan_member`
ADD COLUMN IF NOT EXISTS `position` INT COMMENT '职位' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `contribution` INT COMMENT '贡献度' AFTER `position`,
ADD COLUMN IF NOT EXISTS `join_time` DATETIME COMMENT '加入时间' AFTER `contribution`,
ADD COLUMN IF NOT EXISTS `status` INT COMMENT '状态' AFTER `join_time`,
ADD COLUMN IF NOT EXISTS `total_contribution` BIGINT COMMENT '总贡献度' AFTER `status`,
ADD COLUMN IF NOT EXISTS `last_login_time` DATETIME COMMENT '最后登录时间' AFTER `total_contribution`,
ADD COLUMN IF NOT EXISTS `is_approved` INT COMMENT '是否审核通过' AFTER `last_login_time`;

-- 10.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_clan_member_clan_id` ON `clan_member`(`clan_id`);
CREATE INDEX IF NOT EXISTS `idx_clan_member_role_id` ON `clan_member`(`role_id`);

-- ============================================
-- 第十一部分：task 表字段补全
-- ============================================

-- 11.1 根据实体类补充字段
ALTER TABLE `task`
ADD COLUMN IF NOT EXISTS `condition_type` VARCHAR(50) COMMENT '条件类型' AFTER `task_type`,
ADD COLUMN IF NOT EXISTS `condition_value` INT COMMENT '目标值' AFTER `condition_type`,
ADD COLUMN IF NOT EXISTS `activity_points` INT COMMENT '活跃度奖励' AFTER `condition_value`,
ADD COLUMN IF NOT EXISTS `rewards` JSON COMMENT '奖励 JSON' AFTER `activity_points`,
ADD COLUMN IF NOT EXISTS `sort_order` INT COMMENT '排序' AFTER `rewards`,
ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN DEFAULT true COMMENT '是否激活' AFTER `sort_order`;

-- 11.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_task_type` ON `task`(`task_type`);
CREATE INDEX IF NOT EXISTS `idx_task_is_active` ON `task`(`is_active`);

-- ============================================
-- 第十二部分：achievement 表字段补全
-- ============================================

-- 12.1 根据实体类补充字段
ALTER TABLE `achievement`
ADD COLUMN IF NOT EXISTS `rewards` VARCHAR(255) COMMENT '奖励' AFTER `status`,
ADD COLUMN IF NOT EXISTS `module_type` VARCHAR(100) COMMENT '模块类型' AFTER `rewards`,
ADD COLUMN IF NOT EXISTS `condition_type` VARCHAR(50) COMMENT '条件类型' AFTER `module_type`,
ADD COLUMN IF NOT EXISTS `operator` VARCHAR(10) COMMENT '操作符' AFTER `condition_type`,
ADD COLUMN IF NOT EXISTS `threshold` INT COMMENT '阈值' AFTER `operator`,
ADD COLUMN IF NOT EXISTS `reward_attributes` VARCHAR(255) COMMENT '奖励属性' AFTER `threshold`,
ADD COLUMN IF NOT EXISTS `title` VARCHAR(50) COMMENT '称号' AFTER `reward_attributes`,
ADD COLUMN IF NOT EXISTS `rarity` VARCHAR(20) COMMENT '稀有度' AFTER `title`,
ADD COLUMN IF NOT EXISTS `icon` VARCHAR(50) COMMENT '图标' AFTER `rarity`,
ADD COLUMN IF NOT EXISTS `hidden` BOOLEAN COMMENT '是否隐藏' AFTER `icon`;

-- 11.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_achievement_type` ON `achievement`(`type`);
CREATE INDEX IF NOT EXISTS `idx_achievement_status` ON `achievement`(`status`);

-- ============================================
-- 第十三部分：cultivation_technique 表字段补全
-- ============================================

-- 13.1 根据实体类补充字段
ALTER TABLE `cultivation_techniques`
ADD COLUMN IF NOT EXISTS `speed_addition` DECIMAL(10,2) DEFAULT 0 COMMENT '速度加成' AFTER `description`,
ADD COLUMN IF NOT EXISTS `speed_addition_flat` INT DEFAULT 0 COMMENT '速度绝对值加成' AFTER `speed_addition`,
ADD COLUMN IF NOT EXISTS `limit_addition` BIGINT DEFAULT 0 COMMENT '上限加成' AFTER `speed_addition_flat`,
ADD COLUMN IF NOT EXISTS `rarity` VARCHAR(20) DEFAULT 'COMMON' COMMENT '稀有度' AFTER `limit_addition`,
ADD COLUMN IF NOT EXISTS `level_requirement` INT DEFAULT 1 COMMENT '等级要求' AFTER `rarity`,
ADD COLUMN IF NOT EXISTS `realm_requirement` VARCHAR(50) COMMENT '境界要求' AFTER `level_requirement`,
ADD COLUMN IF NOT EXISTS `is_active` BOOLEAN DEFAULT true COMMENT '是否激活' AFTER `realm_requirement`;

-- 13.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_technique_rarity` ON `cultivation_techniques`(`rarity`);
CREATE INDEX IF NOT EXISTS `idx_technique_is_active` ON `cultivation_techniques`(`is_active`);

-- ============================================
-- 第十四部分：trade_record 表字段补全
-- ============================================

-- 14.1 根据实体类确保字段完整
ALTER TABLE `trade_record`
MODIFY COLUMN IF EXISTS `total_price` INT COMMENT '总价格',
MODIFY COLUMN IF EXISTS `type` VARCHAR(20) COMMENT '类型';

-- 14.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_trade_record_role_id` ON `trade_record`(`role_id`);
CREATE INDEX IF NOT EXISTS `idx_trade_record_trade_time` ON `trade_record`(`trade_time`);

-- ============================================
-- 第十五部分：activity 表字段补全
-- ============================================

-- 15.1 根据实体类补充字段
ALTER TABLE `activity`
ADD COLUMN IF NOT EXISTS `name` VARCHAR(100) COMMENT '活动名称' AFTER `id`,
ADD COLUMN IF NOT EXISTS `description` VARCHAR(500) COMMENT '活动描述' AFTER `name`,
ADD COLUMN IF NOT EXISTS `start_time` DATETIME COMMENT '开始时间' AFTER `description`,
ADD COLUMN IF NOT EXISTS `end_time` DATETIME COMMENT '结束时间' AFTER `start_time`,
ADD COLUMN IF NOT EXISTS `status` INT COMMENT '状态' AFTER `end_time`,
ADD COLUMN IF NOT EXISTS `type` INT COMMENT '类型' AFTER `status`;

-- 15.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_activity_status` ON `activity`(`status`);
CREATE INDEX IF NOT EXISTS `idx_activity_type` ON `activity`(`type`);

-- ============================================
-- 第十六部分：equipment 表字段补全
-- ============================================

-- 16.1 根据实体类补充字段
ALTER TABLE `equipment`
ADD COLUMN IF NOT EXISTS `name` VARCHAR(100) COMMENT '名称' AFTER `id`,
ADD COLUMN IF NOT EXISTS `description` VARCHAR(500) COMMENT '描述' AFTER `name`,
ADD COLUMN IF NOT EXISTS `type` INT COMMENT '类型' AFTER `description`,
ADD COLUMN IF NOT EXISTS `level` INT COMMENT '等级' AFTER `type`,
ADD COLUMN IF NOT EXISTS `attack` INT COMMENT '攻击力' AFTER `level`,
ADD COLUMN IF NOT EXISTS `defense` INT COMMENT '防御力' AFTER `attack`,
ADD COLUMN IF NOT EXISTS `hp_bonus` INT COMMENT '血量加成' AFTER `defense`,
ADD COLUMN IF NOT EXISTS `mp_bonus` INT COMMENT '法力加成' AFTER `hp_bonus`,
ADD COLUMN IF NOT EXISTS `rarity` INT COMMENT '稀有度' AFTER `mp_bonus`,
ADD COLUMN IF NOT EXISTS `status` INT COMMENT '状态' AFTER `rarity`;

-- 16.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_equipment_type` ON `equipment`(`type`);
CREATE INDEX IF NOT EXISTS `idx_equipment_rarity` ON `equipment`(`rarity`);

-- ============================================
-- 第十七部分：item 表字段补全
-- ============================================

-- 17.1 根据实体类补充字段
ALTER TABLE `item`
ADD COLUMN IF NOT EXISTS `name` VARCHAR(100) COMMENT '名称' AFTER `id`,
ADD COLUMN IF NOT EXISTS `description` VARCHAR(500) COMMENT '描述' AFTER `name`,
ADD COLUMN IF NOT EXISTS `type` INT COMMENT '类型' AFTER `description`,
ADD COLUMN IF NOT EXISTS `use_effect` VARCHAR(500) COMMENT '使用效果' AFTER `type`,
ADD COLUMN IF NOT EXISTS `stackable` BOOLEAN DEFAULT true COMMENT '是否可堆叠' AFTER `use_effect`,
ADD COLUMN IF NOT EXISTS `max_stack` INT DEFAULT 99 COMMENT '最大堆叠数' AFTER `stackable`,
ADD COLUMN IF NOT EXISTS `price` INT COMMENT '价格' AFTER `max_stack`,
ADD COLUMN IF NOT EXISTS `status` INT COMMENT '状态' AFTER `price`;

-- 17.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_item_type` ON `item`(`type`);
CREATE INDEX IF NOT EXISTS `idx_item_status` ON `item`(`status`);

-- ============================================
-- 第十八部分：mail 表字段补全
-- ============================================

-- 18.1 根据实体类补充字段
ALTER TABLE `mail`
ADD COLUMN IF NOT EXISTS `user_id` BIGINT COMMENT '用户 ID' AFTER `id`,
ADD COLUMN IF NOT EXISTS `title` VARCHAR(200) COMMENT '标题' AFTER `user_id`,
ADD COLUMN IF NOT EXISTS `content` TEXT COMMENT '内容' AFTER `title`,
ADD COLUMN IF NOT EXISTS `type` INT COMMENT '类型' AFTER `content`,
ADD COLUMN IF NOT EXISTS `has_attachment` BOOLEAN DEFAULT false COMMENT '是否有附件' AFTER `type`,
ADD COLUMN IF NOT EXISTS `is_read` BOOLEAN DEFAULT false COMMENT '是否已读' AFTER `has_attachment`,
ADD COLUMN IF NOT EXISTS `send_time` DATETIME COMMENT '发送时间' AFTER `is_read`,
ADD COLUMN IF NOT EXISTS `expire_time` DATETIME COMMENT '过期时间' AFTER `send_time`;

-- 18.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_mail_user_id` ON `mail`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_mail_is_read` ON `mail`(`is_read`);

-- ============================================
-- 第十九部分：shop_items 表字段补全
-- ============================================

-- 19.1 根据实体类补充字段
ALTER TABLE `shop_items`
ADD COLUMN IF NOT EXISTS `name` VARCHAR(100) COMMENT '名称' AFTER `id`,
ADD COLUMN IF NOT EXISTS `type` VARCHAR(50) COMMENT '类型' AFTER `name`,
ADD COLUMN IF NOT EXISTS `currency` VARCHAR(20) COMMENT '货币类型' AFTER `type`,
ADD COLUMN IF NOT EXISTS `price` INT COMMENT '价格' AFTER `currency`,
ADD COLUMN IF NOT EXISTS `rarity` VARCHAR(20) DEFAULT 'common' COMMENT '稀有度' AFTER `price`,
ADD COLUMN IF NOT EXISTS `stock` INT DEFAULT -1 COMMENT '库存' AFTER `rarity`,
ADD COLUMN IF NOT EXISTS `limit_per_buy` INT DEFAULT 1 COMMENT '单次限购' AFTER `stock`,
ADD COLUMN IF NOT EXISTS `limit_per_day` INT DEFAULT -1 COMMENT '每日限购' AFTER `limit_per_buy`,
ADD COLUMN IF NOT EXISTS `start_time` DATETIME COMMENT '开始时间' AFTER `limit_per_day`,
ADD COLUMN IF NOT EXISTS `end_time` DATETIME COMMENT '结束时间' AFTER `start_time`,
ADD COLUMN IF NOT EXISTS `is_hot` BOOLEAN DEFAULT false COMMENT '是否热门' AFTER `end_time`,
ADD COLUMN IF NOT EXISTS `is_limited` BOOLEAN DEFAULT false COMMENT '是否限定' AFTER `is_hot`;

-- 19.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_shop_items_type` ON `shop_items`(`type`);
CREATE INDEX IF NOT EXISTS `idx_shop_items_is_hot` ON `shop_items`(`is_hot`);

-- ============================================
-- 第二十部分：skill 表字段补全
-- ============================================

-- 20.1 根据实体类补充 trigger_rate 字段
ALTER TABLE `skill`
ADD COLUMN IF NOT EXISTS `trigger_rate` INT COMMENT '触发概率' AFTER `dodge_bonus`;

-- 20.2 添加索引
CREATE INDEX IF NOT EXISTS `idx_skill_type` ON `skill`(`skill_type`);
CREATE INDEX IF NOT EXISTS `idx_skill_status` ON `skill`(`status`);

-- ============================================
-- 第二十一部分：clan_skill 表字段补全
-- ============================================

-- 21.1 根据实体类补充字段
ALTER TABLE `clan_skill`
ADD COLUMN IF NOT EXISTS `skill_name` VARCHAR(100) COMMENT '技能名称' AFTER `id`,
ADD COLUMN IF NOT EXISTS `skill_type` VARCHAR(50) COMMENT '技能类型' AFTER `skill_name`,
ADD COLUMN IF NOT EXISTS `skill_level` INT DEFAULT 1 COMMENT '技能等级' AFTER `skill_type`,
ADD COLUMN IF NOT EXISTS `max_level` INT DEFAULT 12 COMMENT '最大等级' AFTER `skill_level`,
ADD COLUMN IF NOT EXISTS `effect` VARCHAR(500) COMMENT '效果' AFTER `max_level`,
ADD COLUMN IF NOT EXISTS `status` INT DEFAULT 1 COMMENT '状态' AFTER `effect`;

-- ============================================
-- 第二十二部分：role_clan_skill 表字段补全
-- ============================================

-- 22.1 根据实体类补充字段
ALTER TABLE `role_clan_skill`
ADD COLUMN IF NOT EXISTS `clan_id` BIGINT COMMENT '宗门 ID' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `skill_id` BIGINT COMMENT '技能 ID' AFTER `clan_id`,
ADD COLUMN IF NOT EXISTS `skill_level` INT DEFAULT 1 COMMENT '技能等级' AFTER `skill_id`,
ADD COLUMN IF NOT EXISTS `contribution_cost` INT DEFAULT 0 COMMENT '贡献消耗' AFTER `skill_level`;

-- ============================================
-- 第二十三部分：role_achievement 表字段补全
-- ============================================

-- 23.1 根据实体类补充字段
ALTER TABLE `role_achievement`
ADD COLUMN IF NOT EXISTS `achievement_id` BIGINT COMMENT '成就 ID' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `achieved_at` DATETIME COMMENT '达成时间' AFTER `achievement_id`,
ADD COLUMN IF NOT EXISTS `reward_claimed` BOOLEAN DEFAULT false COMMENT '奖励是否领取' AFTER `achieved_at`;

-- ============================================
-- 第二十四部分：role_task 表字段补全
-- ============================================

-- 24.1 根据实体类补充字段
ALTER TABLE `role_task`
ADD COLUMN IF NOT EXISTS `task_id` BIGINT COMMENT '任务 ID' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `title` VARCHAR(100) COMMENT '任务标题' AFTER `task_id`,
ADD COLUMN IF NOT EXISTS `description` TEXT COMMENT '任务描述' AFTER `title`,
ADD COLUMN IF NOT EXISTS `progress` INT DEFAULT 0 COMMENT '进度' AFTER `description`,
ADD COLUMN IF NOT EXISTS `completed` BOOLEAN DEFAULT false COMMENT '是否完成' AFTER `progress`;

-- ============================================
-- 第二十五部分：role_checkin 表字段补全
-- ============================================

-- 25.1 根据实体类补充字段
ALTER TABLE `role_checkin`
ADD COLUMN IF NOT EXISTS `role_id` BIGINT COMMENT '角色 ID' AFTER `id`,
ADD COLUMN IF NOT EXISTS `checkin_date` DATE COMMENT '签到日期' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `continuous_days` INT DEFAULT 0 COMMENT '连续天数' AFTER `checkin_date`,
ADD COLUMN IF NOT EXISTS `reward_claimed` BOOLEAN DEFAULT false COMMENT '奖励是否领取' AFTER `continuous_days`;

-- ============================================
-- 第二十六部分：role_map_node 表字段补全
-- ============================================

-- 26.1 根据实体类补充字段
ALTER TABLE `role_map_node`
ADD COLUMN IF NOT EXISTS `role_id` BIGINT COMMENT '角色 ID' AFTER `id`,
ADD COLUMN IF NOT EXISTS `node_id` BIGINT COMMENT '节点 ID' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `discovered_at` DATETIME COMMENT '发现时间' AFTER `node_id`;

-- ============================================
-- 第二十七部分：role_resource 表字段补全
-- ============================================

-- 27.1 根据实体类补充字段
ALTER TABLE `role_resource`
ADD COLUMN IF NOT EXISTS `role_id` BIGINT COMMENT '角色 ID' AFTER `id`,
ADD COLUMN IF NOT EXISTS `resource_type` VARCHAR(50) COMMENT '资源类型' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `quantity` BIGINT DEFAULT 0 COMMENT '数量' AFTER `resource_type`;

-- ============================================
-- 第二十八部分：role_realm 表字段补全
-- ============================================

-- 28.1 根据实体类补充字段
ALTER TABLE `role_realm`
ADD COLUMN IF NOT EXISTS `role_id` BIGINT COMMENT '角色 ID' AFTER `id`,
ADD COLUMN IF NOT EXISTS `realm_name` VARCHAR(50) COMMENT '境界名称' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `realm_stage` INT DEFAULT 1 COMMENT '境界阶段' AFTER `realm_name`,
ADD COLUMN IF NOT EXISTS `exp` BIGINT DEFAULT 0 COMMENT '经验' AFTER `realm_stage`,
ADD COLUMN IF NOT EXISTS `max_exp` BIGINT DEFAULT 1000 COMMENT '最大经验' AFTER `exp`;

-- ============================================
-- 第二十九部分：role_walk_fire_status 表字段补全
-- ============================================

-- 29.1 根据实体类补充字段
ALTER TABLE `role_walk_fire_status`
ADD COLUMN IF NOT EXISTS `role_id` BIGINT COMMENT '角色 ID' AFTER `id`,
ADD COLUMN IF NOT EXISTS `current_node_id` BIGINT COMMENT '当前节点 ID' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `current_step` INT DEFAULT 0 COMMENT '当前步数' AFTER `current_node_id`,
ADD COLUMN IF NOT EXISTS `total_steps` INT DEFAULT 0 COMMENT '总步数' AFTER `current_step`,
ADD COLUMN IF NOT EXISTS `start_time` DATETIME COMMENT '开始时间' AFTER `total_steps`,
ADD COLUMN IF NOT EXISTS `end_time` DATETIME COMMENT '结束时间' AFTER `start_time`;

-- ============================================
-- 第三十部分：role_auto_cultivation_config 表字段补全
-- ============================================

-- 30.1 根据实体类补充字段
ALTER TABLE `role_auto_cultivation_config`
ADD COLUMN IF NOT EXISTS `role_id` BIGINT COMMENT '角色 ID' AFTER `id`,
ADD COLUMN IF NOT EXISTS `auto_cultivate` BOOLEAN DEFAULT false COMMENT '是否自动修炼' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `cultivate_type` VARCHAR(50) COMMENT '修炼类型' AFTER `auto_cultivate`,
ADD COLUMN IF NOT EXISTS `stop_condition` VARCHAR(100) COMMENT '停止条件' AFTER `cultivate_type`;

-- ============================================
-- 第三十一部分：role_activity 表字段补全
-- ============================================

-- 30.1 根据实体类补充字段
ALTER TABLE `role_activity`
ADD COLUMN IF NOT EXISTS `role_id` BIGINT COMMENT '角色 ID' AFTER `id`,
ADD COLUMN IF NOT EXISTS `activity_id` BIGINT COMMENT '活动 ID' AFTER `role_id`,
ADD COLUMN IF NOT EXISTS `progress` INT DEFAULT 0 COMMENT '进度' AFTER `activity_id`,
ADD COLUMN IF NOT EXISTS `reward_claimed` BOOLEAN DEFAULT false COMMENT '奖励是否领取' AFTER `progress`;

-- ============================================
-- 第三十二部分：添加缺失的表（如果不存在）
-- ============================================

-- 32.1 创建 clan_task 表（宗门任务）
CREATE TABLE IF NOT EXISTS `clan_task` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `clan_id` BIGINT NOT NULL COMMENT '宗门 ID',
    `task_name` VARCHAR(100) NOT NULL COMMENT '任务名称',
    `task_type` VARCHAR(20) NOT NULL COMMENT '任务类型',
    `contribution` INT NOT NULL COMMENT '贡献度',
    `description` TEXT COMMENT '描述',
    `time_required` VARCHAR(50) COMMENT '所需时间',
    `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_clan_task_clan_id` (`clan_id`),
    INDEX `idx_clan_task_task_type` (`task_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门任务表';

-- 32.2 创建 clan_treasure 表（宗门藏阁）
CREATE TABLE IF NOT EXISTS `clan_treasure` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `clan_id` BIGINT NOT NULL COMMENT '宗门 ID',
    `treasure_type` VARCHAR(20) NOT NULL COMMENT '宝物类型',
    `item_name` VARCHAR(100) NOT NULL COMMENT '物品名称',
    `contribution` INT NOT NULL COMMENT '贡献度',
    `description` TEXT COMMENT '描述',
    `discount` DECIMAL(4,2) DEFAULT 1.0 COMMENT '折扣',
    `status` VARCHAR(20) DEFAULT 'available' COMMENT '状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_clan_treasure_clan_id` (`clan_id`),
    INDEX `idx_clan_treasure_treasure_type` (`treasure_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='宗门藏阁表';

-- 32.3 创建 role_profession 表（角色职业）
CREATE TABLE IF NOT EXISTS `role_profession` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL COMMENT '角色 ID',
    `profession_name` VARCHAR(50) NOT NULL COMMENT '职业名称',
    `level` INT DEFAULT 0 COMMENT '等级',
    `exp` INT DEFAULT 0 COMMENT '经验',
    `certified` BOOLEAN DEFAULT false COMMENT '是否认证',
    `core_role` VARCHAR(100) COMMENT '核心作用',
    `unique_features` VARCHAR(255) COMMENT '特色技能',
    `ultimate_skill` VARCHAR(255) COMMENT '终极技能',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY `uk_role_profession` (`role_id`, `profession_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色职业表';

-- 32.4 创建 role_pet 表（角色灵宠）
CREATE TABLE IF NOT EXISTS `role_pet` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `role_id` BIGINT NOT NULL COMMENT '角色 ID',
    `pet_name` VARCHAR(100) NOT NULL COMMENT '灵宠名称',
    `pet_type` VARCHAR(50) NOT NULL COMMENT '灵宠类型',
    `rarity` VARCHAR(20) DEFAULT 'common' COMMENT '稀有度',
    `skills` VARCHAR(255) COMMENT '技能',
    `intimacy` INT DEFAULT 0 COMMENT '亲密度',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_role_pet_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色灵宠表';

-- 32.5 创建 role_disciple 表（角色徒弟）
CREATE TABLE IF NOT EXISTS `role_disciple` (
    `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
    `master_id` BIGINT NOT NULL COMMENT '师父 ID',
    `disciple_id` BIGINT NOT NULL COMMENT '徒弟 ID',
    `relationship_status` VARCHAR(20) DEFAULT 'active' COMMENT '关系状态',
    `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX `idx_role_disciple_master_id` (`master_id`),
    INDEX `idx_role_disciple_disciple_id` (`disciple_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色徒弟表';

-- ============================================
-- 第三十三部分：数据完整性检查和初始化
-- ============================================

-- 33.1 初始化 game_role 表数据
UPDATE `game_role` SET `realm_stage` = '初' WHERE `realm_stage` IS NULL;
UPDATE `game_role` SET `world_level` = '人间界' WHERE `world_level` IS NULL;
UPDATE `game_role` SET `cultivation` = 0 WHERE `cultivation` IS NULL;
UPDATE `game_role` SET `cultivation_max` = 100 WHERE `cultivation_max` IS NULL;
UPDATE `game_role` SET `spirit_stones` = 0 WHERE `spirit_stones` IS NULL;
UPDATE `game_role` SET `status` = 1 WHERE `status` IS NULL;

-- 33.2 初始化 inventory 表数据
UPDATE `inventory` SET `is_bound` = false WHERE `is_bound` IS NULL;

-- 33.3 初始化 role_skill 表数据
UPDATE `role_skill` SET `equipped` = false WHERE `equipped` IS NULL;

-- 33.4 初始化 clan 表数据
UPDATE `clans` SET `level` = 1 WHERE `level` IS NULL;
UPDATE `clans` SET `members_count` = 0 WHERE `members_count` IS NULL;
UPDATE `clans` SET `max_members` = 50 WHERE `max_members` IS NULL;
UPDATE `clans` SET `status` = 'active' WHERE `status` IS NULL;

-- 33.5 初始化 clan_member 表数据
UPDATE `clan_member` SET `position` = 0 WHERE `position` IS NULL;
UPDATE `clan_member` SET `contribution` = 0 WHERE `contribution` IS NULL;
UPDATE `clan_member` SET `status` = 1 WHERE `status` IS NULL;
UPDATE `clan_member` SET `is_approved` = 1 WHERE `is_approved` IS NULL;

-- 33.6 初始化 task 表数据
UPDATE `task` SET `is_active` = true WHERE `is_active` IS NULL;

-- 33.7 初始化 achievement 表数据
UPDATE `achievement` SET `status` = 1 WHERE `status` IS NULL;

-- 33.8 初始化 cultivation_techniques 表数据
UPDATE `cultivation_techniques` SET `is_active` = true WHERE `is_active` IS NULL;
UPDATE `cultivation_techniques` SET `speed_addition` = 0.0 WHERE `speed_addition` IS NULL;
UPDATE `cultivation_techniques` SET `speed_addition_flat` = 0 WHERE `speed_addition_flat` IS NULL;
UPDATE `cultivation_techniques` SET `limit_addition` = 0 WHERE `limit_addition` IS NULL;

-- ============================================
-- 第三十四部分：验证和统计
-- ============================================

SELECT '✅ 数据库字段完整性修复完成！' AS message;

SELECT 'game_role' AS table_name, COUNT(*) AS column_count FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'game_role'
UNION ALL
SELECT 'inventory', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory'
UNION ALL
SELECT 'role_skill', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_skill'
UNION ALL
SELECT 'role_asset', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_asset'
UNION ALL
SELECT 'role_body_cultivation', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'role_body_cultivation'
UNION ALL
SELECT 'clans', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clans'
UNION ALL
SELECT 'clan_member', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'clan_member'
UNION ALL
SELECT 'task', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'task'
UNION ALL
SELECT 'achievement', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'achievement'
UNION ALL
SELECT 'cultivation_techniques', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'cultivation_techniques';
