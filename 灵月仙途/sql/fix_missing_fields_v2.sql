-- ============================================
-- 数据库字段缺失修复脚本 (语法修正版)
-- 生成时间：2026-04-01
-- 说明：使用标准 MySQL ALTER TABLE 语法
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- 修复 mail_item 表
-- ========================================
ALTER TABLE mail_item ADD COLUMN `item_id` BIGINT COMMENT '物品 ID';
ALTER TABLE mail_item ADD COLUMN `quantity` INT DEFAULT 0 COMMENT '数量';
ALTER TABLE mail_item ADD COLUMN `mail_id` BIGINT COMMENT '邮件 ID';

-- ========================================
-- 修复 body_part 表
-- ========================================
ALTER TABLE body_part ADD COLUMN `sort_order` INT DEFAULT 0 COMMENT '排序';

-- ========================================
-- 修复 skill 表
-- ========================================
ALTER TABLE skill ADD COLUMN `trigger_rate` DECIMAL(5,2) DEFAULT 1.00 COMMENT '触发概率';

-- ========================================
-- 修复 equipment 表
-- ========================================
ALTER TABLE equipment ADD COLUMN `defense` INT DEFAULT 0 COMMENT '防御';
ALTER TABLE equipment ADD COLUMN `status` INT DEFAULT 1 COMMENT '状态';
ALTER TABLE equipment ADD COLUMN `level` INT DEFAULT 1 COMMENT '等级';
ALTER TABLE equipment ADD COLUMN `attack` INT DEFAULT 0 COMMENT '攻击';

-- ========================================
-- 修复 role_activity 表
-- ========================================
ALTER TABLE role_activity ADD COLUMN `reset_time` DATETIME COMMENT '重置时间';

-- ========================================
-- 修复 announcement 表
-- ========================================
ALTER TABLE announcement ADD COLUMN `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态';
ALTER TABLE announcement ADD COLUMN `type` VARCHAR(50) DEFAULT 'system' COMMENT '类型';
ALTER TABLE announcement ADD COLUMN `title` VARCHAR(200) COMMENT '标题';
ALTER TABLE announcement ADD COLUMN `content` TEXT COMMENT '内容';

-- ========================================
-- 修复 role_asset 表
-- ========================================
ALTER TABLE role_asset ADD COLUMN `quantity` BIGINT DEFAULT 0 COMMENT '数量';
ALTER TABLE role_asset ADD COLUMN `asset_type_code` VARCHAR(50) COMMENT '资产类型代码';
ALTER TABLE role_asset ADD COLUMN `role_id` BIGINT COMMENT '角色 ID';

-- ========================================
-- 修复 asset_types 表
-- ========================================
ALTER TABLE asset_types ADD COLUMN `unit_of_measure` VARCHAR(20) COMMENT '单位';
ALTER TABLE asset_types ADD COLUMN `is_system` TINYINT(1) DEFAULT 0 COMMENT '是否系统';
ALTER TABLE asset_types ADD COLUMN `icon` VARCHAR(255) COMMENT '图标';
ALTER TABLE asset_types ADD COLUMN `icon_path` VARCHAR(255) COMMENT '图标路径';
ALTER TABLE asset_types ADD COLUMN `modules` VARCHAR(255) COMMENT '模块';
ALTER TABLE asset_types ADD COLUMN `type` VARCHAR(50) COMMENT '类型';
ALTER TABLE asset_types ADD COLUMN `droppable` TINYINT(1) DEFAULT 1 COMMENT '可掉落';
ALTER TABLE asset_types ADD COLUMN `decimal_places` INT DEFAULT 0 COMMENT '小数位数';
ALTER TABLE asset_types ADD COLUMN `category` VARCHAR(50) COMMENT '分类';
ALTER TABLE asset_types ADD COLUMN `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态';
ALTER TABLE asset_types ADD COLUMN `deleted_at` DATETIME COMMENT '删除时间';
ALTER TABLE asset_types ADD COLUMN `tradable` TINYINT(1) DEFAULT 1 COMMENT '可交易';
ALTER TABLE asset_types ADD COLUMN `max_stack` INT DEFAULT 99 COMMENT '最大堆叠';
ALTER TABLE asset_types ADD COLUMN `decimal_precision` INT DEFAULT 0 COMMENT '小数精度';
ALTER TABLE asset_types ADD COLUMN `destroy_policy` VARCHAR(50) DEFAULT 'none' COMMENT '销毁策略';

-- ========================================
-- 修复 trade_item 表
-- ========================================
ALTER TABLE trade_item ADD COLUMN `icon` VARCHAR(255) COMMENT '图标';
ALTER TABLE trade_item ADD COLUMN `name` VARCHAR(100) COMMENT '名称';
ALTER TABLE trade_item ADD COLUMN `category` VARCHAR(50) COMMENT '分类';
ALTER TABLE trade_item ADD COLUMN `description` TEXT COMMENT '描述';
ALTER TABLE trade_item ADD COLUMN `price` INT DEFAULT 0 COMMENT '价格';
ALTER TABLE trade_item ADD COLUMN `stock` INT DEFAULT 0 COMMENT '库存';

-- ========================================
-- 修复 asset_acquisition_records 表
-- ========================================
ALTER TABLE asset_acquisition_records ADD COLUMN `quantity` BIGINT DEFAULT 0 COMMENT '数量';
ALTER TABLE asset_acquisition_records ADD COLUMN `source_id` BIGINT COMMENT '来源 ID';
ALTER TABLE asset_acquisition_records ADD COLUMN `asset_type` VARCHAR(50) COMMENT '资产类型';
ALTER TABLE asset_acquisition_records ADD COLUMN `source` VARCHAR(50) COMMENT '来源';
ALTER TABLE asset_acquisition_records ADD COLUMN `role_id` BIGINT COMMENT '角色 ID';

-- ========================================
-- 修复 role_clans 表
-- ========================================
ALTER TABLE role_clans ADD COLUMN `rank` INT DEFAULT 0 COMMENT '排名';

-- ========================================
-- 修复 cfg_skill_upgrade 表
-- ========================================
ALTER TABLE cfg_skill_upgrade ADD COLUMN `effect_increase` DECIMAL(5,2) COMMENT '效果提升';
ALTER TABLE cfg_skill_upgrade ADD COLUMN `proficiency_requirement` INT COMMENT '熟练度要求';
ALTER TABLE cfg_skill_upgrade ADD COLUMN `cooldown` INT COMMENT '冷却时间';
ALTER TABLE cfg_skill_upgrade ADD COLUMN `mana_consumption` INT COMMENT '法力消耗';
ALTER TABLE cfg_skill_upgrade ADD COLUMN `skill_level` VARCHAR(10) COMMENT '技能等级';

-- ========================================
-- 修复 sys_role 表
-- ========================================
ALTER TABLE sys_role ADD COLUMN `custom_data_scope` TEXT COMMENT '自定义数据范围';

-- ========================================
-- 修复 cfg_equipment_quality 表
-- ========================================
ALTER TABLE cfg_equipment_quality ADD COLUMN `probability` DECIMAL(5,2) COMMENT '概率';
ALTER TABLE cfg_equipment_quality ADD COLUMN `max_bonus` DECIMAL(5,2) COMMENT '最大加成';
ALTER TABLE cfg_equipment_quality ADD COLUMN `upgrade_effect` TEXT COMMENT '升级效果';
ALTER TABLE cfg_equipment_quality ADD COLUMN `quality_name` VARCHAR(50) COMMENT '品质名称';
ALTER TABLE cfg_equipment_quality ADD COLUMN `glow_color` VARCHAR(20) COMMENT '发光颜色';
ALTER TABLE cfg_equipment_quality ADD COLUMN `description` VARCHAR(255) COMMENT '描述';

-- ========================================
-- 修复 asset_usage_records 表
-- ========================================
ALTER TABLE asset_usage_records ADD COLUMN `quantity` BIGINT DEFAULT 0 COMMENT '数量';
ALTER TABLE asset_usage_records ADD COLUMN `purpose_id` BIGINT COMMENT '用途 ID';
ALTER TABLE asset_usage_records ADD COLUMN `asset_type` VARCHAR(50) COMMENT '资产类型';
ALTER TABLE asset_usage_records ADD COLUMN `purpose` VARCHAR(50) COMMENT '用途';
ALTER TABLE asset_usage_records ADD COLUMN `role_id` BIGINT COMMENT '角色 ID';

-- ========================================
-- 修复 role_equipment 表
-- ========================================
ALTER TABLE role_equipment ADD COLUMN `item_id` BIGINT COMMENT '物品 ID';
ALTER TABLE role_equipment ADD COLUMN `quantity` INT DEFAULT 1 COMMENT '数量';
ALTER TABLE role_equipment ADD COLUMN `acquired_at` DATETIME COMMENT '获得时间';
ALTER TABLE role_equipment ADD COLUMN `equip_time` DATETIME COMMENT '装备时间';
ALTER TABLE role_equipment ADD COLUMN `slot_id` INT COMMENT '槽位 ID';

-- ========================================
-- 修复 cfg_realm_breakthrough 表
-- ========================================
ALTER TABLE cfg_realm_breakthrough ADD COLUMN `from_realm` VARCHAR(50) COMMENT '原境界';
ALTER TABLE cfg_realm_breakthrough ADD COLUMN `to_realm` VARCHAR(50) COMMENT '新境界';
ALTER TABLE cfg_realm_breakthrough ADD COLUMN `xiuwei_requirement` INT COMMENT '修为要求';
ALTER TABLE cfg_realm_breakthrough ADD COLUMN `pill_name` VARCHAR(100) COMMENT '丹药名称';
ALTER TABLE cfg_realm_breakthrough ADD COLUMN `success_rate` DECIMAL(5,2) COMMENT '成功率';
ALTER TABLE cfg_realm_breakthrough ADD COLUMN `failure_penalty` VARCHAR(100) COMMENT '失败惩罚';

-- ========================================
-- 修复 friends 表
-- ========================================
ALTER TABLE friends ADD COLUMN `remark` VARCHAR(100) COMMENT '备注';
ALTER TABLE friends ADD COLUMN `intimacy` INT DEFAULT 0 COMMENT '亲密度';
ALTER TABLE friends ADD COLUMN `block_status` TINYINT(1) DEFAULT 0 COMMENT '屏蔽状态';

-- ========================================
-- 修复 clans 表
-- ========================================
ALTER TABLE clans ADD COLUMN `level` INT DEFAULT 1 COMMENT '等级';

-- ========================================
-- 修复 cultivation_techniques 表
-- ========================================
ALTER TABLE cultivation_techniques ADD COLUMN `type` VARCHAR(50) COMMENT '类型';

-- ========================================
-- 修复 system_setting 表
-- ========================================
ALTER TABLE system_setting ADD COLUMN `description` VARCHAR(255) COMMENT '描述';
ALTER TABLE system_setting ADD COLUMN `updated_at` DATETIME COMMENT '更新时间';

-- ========================================
-- 修复 payment_record 表
-- ========================================
ALTER TABLE payment_record ADD COLUMN `amount` DECIMAL(10,2) COMMENT '金额';
ALTER TABLE payment_record ADD COLUMN `currency` VARCHAR(20) COMMENT '货币';
ALTER TABLE payment_record ADD COLUMN `status` VARCHAR(20) COMMENT '状态';
ALTER TABLE payment_record ADD COLUMN `payment_time` DATETIME COMMENT '支付时间';
ALTER TABLE payment_record ADD COLUMN `payment_method` VARCHAR(50) COMMENT '支付方式';
ALTER TABLE payment_record ADD COLUMN `transaction_id` VARCHAR(100) COMMENT '交易 ID';

-- ========================================
-- 修复 role_map_node 表
-- ========================================
ALTER TABLE role_map_node ADD COLUMN `current_x` INT DEFAULT 0 COMMENT 'X 坐标';
ALTER TABLE role_map_node ADD COLUMN `current_y` INT DEFAULT 0 COMMENT 'Y 坐标';
ALTER TABLE role_map_node ADD COLUMN `last_move_time` DATETIME COMMENT '最后移动时间';
ALTER TABLE role_map_node ADD COLUMN `map_id` BIGINT COMMENT '地图 ID';

-- ========================================
-- 修复 role_checkin 表
-- ========================================
ALTER TABLE role_checkin ADD COLUMN `last_checkin_time` DATETIME COMMENT '最后签到时间';
ALTER TABLE role_checkin ADD COLUMN `total_checkin_days` INT DEFAULT 0 COMMENT '累计签到天数';
ALTER TABLE role_checkin ADD COLUMN `checkin_count` INT DEFAULT 0 COMMENT '签到次数';
ALTER TABLE role_checkin ADD COLUMN `month` INT COMMENT '月份';
ALTER TABLE role_checkin ADD COLUMN `year` INT COMMENT '年份';

-- ========================================
-- 修复 sys_user 表
-- ========================================
ALTER TABLE sys_user ADD COLUMN `email` VARCHAR(100) COMMENT '邮箱';
ALTER TABLE sys_user ADD COLUMN `phone` VARCHAR(20) COMMENT '手机';

-- ========================================
-- 修复 shop_items 表
-- ========================================
ALTER TABLE shop_items ADD COLUMN `sort_order` INT DEFAULT 0 COMMENT '排序';
ALTER TABLE shop_items ADD COLUMN `discount` DECIMAL(5,2) COMMENT '折扣';
ALTER TABLE shop_items ADD COLUMN `purchase_limit` INT COMMENT '购买限制';
ALTER TABLE shop_items ADD COLUMN `shelf_status` TINYINT(1) DEFAULT 1 COMMENT '上架状态';
ALTER TABLE shop_items ADD COLUMN `category` VARCHAR(50) COMMENT '分类';
ALTER TABLE shop_items ADD COLUMN `icon` VARCHAR(255) COMMENT '图标';

-- ========================================
-- 修复 role_clan_skill 表
-- ========================================
ALTER TABLE role_clan_skill ADD COLUMN `skill_level` INT DEFAULT 1 COMMENT '技能等级';
ALTER TABLE role_clan_skill ADD COLUMN `learn_time` DATETIME COMMENT '学习时间';
ALTER TABLE role_clan_skill ADD COLUMN `proficiency` INT DEFAULT 0 COMMENT '熟练度';
ALTER TABLE role_clan_skill ADD COLUMN `is_equipped` TINYINT(1) DEFAULT 0 COMMENT '是否装备';

-- ========================================
-- 修复 verification_code 表
-- ========================================
ALTER TABLE verification_code ADD COLUMN `phone` VARCHAR(20) COMMENT '手机';
ALTER TABLE verification_code ADD COLUMN `code` VARCHAR(10) COMMENT '验证码';
ALTER TABLE verification_code ADD COLUMN `type` VARCHAR(20) COMMENT '类型';
ALTER TABLE verification_code ADD COLUMN `expire_at` DATETIME COMMENT '过期时间';

-- ========================================
-- 修复 body_mutation 表
-- ========================================
ALTER TABLE body_mutation ADD COLUMN `mutation_type` VARCHAR(50) COMMENT '变异类型';
ALTER TABLE body_mutation ADD COLUMN `description` TEXT COMMENT '描述';

-- ========================================
-- 修复 trade_record 表
-- ========================================
ALTER TABLE trade_record ADD COLUMN `seller_id` BIGINT COMMENT '卖家 ID';
ALTER TABLE trade_record ADD COLUMN `buyer_id` BIGINT COMMENT '买家 ID';
ALTER TABLE trade_record ADD COLUMN `item_id` BIGINT COMMENT '物品 ID';
ALTER TABLE trade_record ADD COLUMN `quantity` INT COMMENT '数量';
ALTER TABLE trade_record ADD COLUMN `price` DECIMAL(10,2) COMMENT '价格';
ALTER TABLE trade_record ADD COLUMN `status` VARCHAR(20) COMMENT '状态';
ALTER TABLE trade_record ADD COLUMN `trade_time` DATETIME COMMENT '交易时间';

-- ========================================
-- 修复 permission 表
-- ========================================
ALTER TABLE permission ADD COLUMN `permission_name` VARCHAR(100) COMMENT '权限名称';
ALTER TABLE permission ADD COLUMN `permission_code` VARCHAR(100) COMMENT '权限代码';
ALTER TABLE permission ADD COLUMN `description` TEXT COMMENT '描述';
ALTER TABLE permission ADD COLUMN `resource_type` VARCHAR(50) COMMENT '资源类型';
ALTER TABLE permission ADD COLUMN `resource_id` BIGINT COMMENT '资源 ID';
ALTER TABLE permission ADD COLUMN `sort_order` INT DEFAULT 0 COMMENT '排序';

-- ========================================
-- 修复 task 表
-- ========================================
ALTER TABLE task ADD COLUMN `task_difficulty` VARCHAR(20) DEFAULT 'normal' COMMENT '难度';
ALTER TABLE task ADD COLUMN `min_level` INT DEFAULT 1 COMMENT '最低等级';
ALTER TABLE task ADD COLUMN `max_level` INT DEFAULT 100 COMMENT '最高等级';
ALTER TABLE task ADD COLUMN `repeat_count` INT DEFAULT 0 COMMENT '重复次数';
ALTER TABLE task ADD COLUMN `time_limit` INT COMMENT '时间限制';
ALTER TABLE task ADD COLUMN `task_type` VARCHAR(50) COMMENT '任务类型';
ALTER TABLE task ADD COLUMN `icon` VARCHAR(255) COMMENT '图标';
ALTER TABLE task ADD COLUMN `reward_items` TEXT COMMENT '奖励物品';

-- ========================================
-- 修复 role_item 表
-- ========================================
ALTER TABLE role_item ADD COLUMN `item_name` VARCHAR(255) COMMENT '物品名称';
ALTER TABLE role_item ADD COLUMN `item_type` VARCHAR(50) COMMENT '物品类型';

-- ========================================
-- 修复 clan_skill 表
-- ========================================
ALTER TABLE clan_skill ADD COLUMN `skill_name` VARCHAR(100) COMMENT '技能名称';
ALTER TABLE clan_skill ADD COLUMN `description` TEXT COMMENT '描述';
ALTER TABLE clan_skill ADD COLUMN `level_requirement` INT COMMENT '等级要求';
ALTER TABLE clan_skill ADD COLUMN `effect` TEXT COMMENT '效果';
ALTER TABLE clan_skill ADD COLUMN `icon` VARCHAR(255) COMMENT '图标';
ALTER TABLE clan_skill ADD COLUMN `type` VARCHAR(50) COMMENT '类型';

-- ========================================
-- 修复 sys_permission 表
-- ========================================
ALTER TABLE sys_permission ADD COLUMN `permission_name` VARCHAR(100) COMMENT '权限名称';
ALTER TABLE sys_permission ADD COLUMN `permission_code` VARCHAR(100) COMMENT '权限代码';
ALTER TABLE sys_permission ADD COLUMN `resource_type` VARCHAR(50) COMMENT '资源类型';
ALTER TABLE sys_permission ADD COLUMN `description` TEXT COMMENT '描述';
ALTER TABLE sys_permission ADD COLUMN `sort_order` INT DEFAULT 0 COMMENT '排序';

-- ========================================
-- 修复 cfg_pill_effect 表
-- ========================================
ALTER TABLE cfg_pill_effect ADD COLUMN `pill_name` VARCHAR(100) COMMENT '丹药名称';
ALTER TABLE cfg_pill_effect ADD COLUMN `effect_type` VARCHAR(50) COMMENT '效果类型';
ALTER TABLE cfg_pill_effect ADD COLUMN `effect_value` INT COMMENT '效果值';
ALTER TABLE cfg_pill_effect ADD COLUMN `duration` INT COMMENT '持续时间';
ALTER TABLE cfg_pill_effect ADD COLUMN `cooldown` INT COMMENT '冷却时间';
ALTER TABLE cfg_pill_effect ADD COLUMN `side_effect` TEXT COMMENT '副作用';

-- ========================================
-- 修复 sect_apply 表
-- ========================================
ALTER TABLE sect_apply ADD COLUMN `applicant_id` BIGINT COMMENT '申请者 ID';
ALTER TABLE sect_apply ADD COLUMN `sect_id` BIGINT COMMENT '宗门 ID';
ALTER TABLE sect_apply ADD COLUMN `apply_time` DATETIME COMMENT '申请时间';
ALTER TABLE sect_apply ADD COLUMN `status` VARCHAR(20) DEFAULT 'pending' COMMENT '状态';
ALTER TABLE sect_apply ADD COLUMN `message` TEXT COMMENT '消息';
ALTER TABLE sect_apply ADD COLUMN `handler_id` BIGINT COMMENT '处理者 ID';
ALTER TABLE sect_apply ADD COLUMN `handle_time` DATETIME COMMENT '处理时间';

-- ========================================
-- 修复 gift 表
-- ========================================
ALTER TABLE gift ADD COLUMN `gift_name` VARCHAR(100) COMMENT '礼物名称';
ALTER TABLE gift ADD COLUMN `gift_type` VARCHAR(50) DEFAULT 'system' COMMENT '礼物类型';
ALTER TABLE gift ADD COLUMN `priority` INT DEFAULT 0 COMMENT '优先级';
ALTER TABLE gift ADD COLUMN `valid_days` INT COMMENT '有效天数';
ALTER TABLE gift ADD COLUMN `icon` VARCHAR(255) COMMENT '图标';
ALTER TABLE gift ADD COLUMN `description` TEXT COMMENT '描述';
ALTER TABLE gift ADD COLUMN `rewards` TEXT COMMENT '奖励';

-- ========================================
-- 修复 role_realms 表
-- ========================================
ALTER TABLE role_realms ADD COLUMN `realm_name` VARCHAR(50) COMMENT '境界名称';
ALTER TABLE role_realms ADD COLUMN `realm_level` INT COMMENT '境界等级';
ALTER TABLE role_realms ADD COLUMN `total_cultivation` BIGINT COMMENT '总修为';
ALTER TABLE role_realms ADD COLUMN `realm_stage` INT DEFAULT 1 COMMENT '境界阶段';
ALTER TABLE role_realms ADD COLUMN `breakthrough_time` DATETIME COMMENT '突破时间';

-- ========================================
-- 修复 body_cultivation_material 表
-- ========================================
ALTER TABLE body_cultivation_material ADD COLUMN `material_name` VARCHAR(100) COMMENT '材料名称';
ALTER TABLE body_cultivation_material ADD COLUMN `material_type` VARCHAR(50) COMMENT '材料类型';
ALTER TABLE body_cultivation_material ADD COLUMN `effect` TEXT COMMENT '效果';
ALTER TABLE body_cultivation_material ADD COLUMN `rarity` INT DEFAULT 1 COMMENT '稀有度';

-- ========================================
-- 修复 system_log 表
-- ========================================
ALTER TABLE system_log ADD COLUMN `log_level` VARCHAR(20) COMMENT '日志级别';
ALTER TABLE system_log ADD COLUMN `logger_name` VARCHAR(100) COMMENT '日志名称';
ALTER TABLE system_log ADD COLUMN `message` TEXT COMMENT '消息';
ALTER TABLE system_log ADD COLUMN `exception` TEXT COMMENT '异常';
ALTER TABLE system_log ADD COLUMN `thread_name` VARCHAR(100) COMMENT '线程名';
ALTER TABLE system_log ADD COLUMN `log_time` DATETIME COMMENT '日志时间';

-- ========================================
-- 修复 game_user 表
-- ========================================
ALTER TABLE game_user ADD COLUMN `username` VARCHAR(100) COMMENT '用户名';
ALTER TABLE game_user ADD COLUMN `password` VARCHAR(255) COMMENT '密码';
ALTER TABLE game_user ADD COLUMN `email` VARCHAR(100) COMMENT '邮箱';
ALTER TABLE game_user ADD COLUMN `phone` VARCHAR(20) COMMENT '手机';
ALTER TABLE game_user ADD COLUMN `status` INT DEFAULT 1 COMMENT '状态';
ALTER TABLE game_user ADD COLUMN `last_login_time` DATETIME COMMENT '最后登录时间';
ALTER TABLE game_user ADD COLUMN `create_time` DATETIME COMMENT '创建时间';

-- ========================================
-- 修复 role_task 表
-- ========================================
ALTER TABLE role_task ADD COLUMN `task_type` VARCHAR(50) COMMENT '任务类型';
ALTER TABLE role_task ADD COLUMN `reward_claimed` TINYINT(1) DEFAULT 0 COMMENT '奖励已领取';

-- ========================================
-- 修复 achievement 表
-- ========================================
ALTER TABLE achievement ADD COLUMN `reward_attributes` TEXT COMMENT '奖励属性';
ALTER TABLE achievement ADD COLUMN `rewards` TEXT COMMENT '奖励';
ALTER TABLE achievement ADD COLUMN `icon` VARCHAR(255) COMMENT '图标';
ALTER TABLE achievement ADD COLUMN `name` VARCHAR(100) COMMENT '名称';
ALTER TABLE achievement ADD COLUMN `type` VARCHAR(50) COMMENT '类型';
ALTER TABLE achievement ADD COLUMN `rarity` INT DEFAULT 1 COMMENT '稀有度';
ALTER TABLE achievement ADD COLUMN `condition` TEXT COMMENT '条件';
ALTER TABLE achievement ADD COLUMN `status` VARCHAR(20) DEFAULT 'active' COMMENT '状态';
ALTER TABLE achievement ADD COLUMN `condition_type` VARCHAR(50) COMMENT '条件类型';
ALTER TABLE achievement ADD COLUMN `hidden` TINYINT(1) DEFAULT 0 COMMENT '隐藏';
ALTER TABLE achievement ADD COLUMN `title` VARCHAR(200) COMMENT '标题';
ALTER TABLE achievement ADD COLUMN `module_type` VARCHAR(50) COMMENT '模块类型';
ALTER TABLE achievement ADD COLUMN `operator` VARCHAR(10) COMMENT '操作符';
ALTER TABLE achievement ADD COLUMN `threshold` BIGINT COMMENT '阈值';
ALTER TABLE achievement ADD COLUMN `sort_order` INT DEFAULT 0 COMMENT '排序';
ALTER TABLE achievement ADD COLUMN `description` TEXT COMMENT '描述';

-- ========================================
-- 修复 item 表
-- ========================================
ALTER TABLE item ADD COLUMN `item_level` INT DEFAULT 1 COMMENT '物品等级';
ALTER TABLE item ADD COLUMN `quality` VARCHAR(20) DEFAULT 'common' COMMENT '品质';
ALTER TABLE item ADD COLUMN `icon` VARCHAR(255) COMMENT '图标';
ALTER TABLE item ADD COLUMN `max_stack_size` INT DEFAULT 99 COMMENT '最大堆叠数';
ALTER TABLE item ADD COLUMN `sell_price` INT COMMENT '出售价格';

-- ========================================
-- 修复 role_achievement 表
-- ========================================
ALTER TABLE role_achievement ADD COLUMN `completed_at` DATETIME COMMENT '完成时间';
ALTER TABLE role_achievement ADD COLUMN `reward_claimed` TINYINT(1) DEFAULT 0 COMMENT '奖励已领取';
ALTER TABLE role_achievement ADD COLUMN `progress` INT DEFAULT 0 COMMENT '进度';
ALTER TABLE role_achievement ADD COLUMN `status` VARCHAR(20) DEFAULT 'in_progress' COMMENT '状态';
ALTER TABLE role_achievement ADD COLUMN `achievement_id` BIGINT COMMENT '成就 ID';
ALTER TABLE role_achievement ADD COLUMN `role_id` BIGINT COMMENT '角色 ID';
ALTER TABLE role_achievement ADD COLUMN `created_at` DATETIME COMMENT '创建时间';
ALTER TABLE role_achievement ADD COLUMN `updated_at` DATETIME COMMENT '更新时间';

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ 数据库字段修复完成！' AS message;
