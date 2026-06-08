-- ============================================
-- 数据库字段缺失修复脚本 (智能安全版)
-- 生成时间：2026-04-01
-- 说明：使用存储过程智能检测，自动跳过已存在的字段
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
SET @dbname = DATABASE();

-- 创建存储过程：智能添加字段
DROP PROCEDURE IF EXISTS add_column_safe;
DELIMITER $$
CREATE PROCEDURE add_column_safe(
    IN p_table_name VARCHAR(100),
    IN p_column_name VARCHAR(100),
    IN p_column_def VARCHAR(500)
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    -- 检查列是否已存在
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = @dbname
      AND TABLE_NAME = p_table_name
      AND COLUMN_NAME = p_column_name;
    
    -- 如果列不存在，则添加
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_column_def);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('✓ 已添加 ', p_table_name, '.', p_column_name) AS result;
    ELSE
        SELECT CONCAT('⊕ 已跳过 ', p_table_name, '.', p_column_name, ' (字段已存在)') AS result;
    END IF;
END$$
DELIMITER ;

-- ========================================
-- 修复 mail_item 表
-- ========================================
CALL add_column_safe('mail_item', 'item_id', 'BIGINT COMMENT \'物品 ID\'');
CALL add_column_safe('mail_item', 'quantity', 'INT DEFAULT 0 COMMENT \'数量\'');
CALL add_column_safe('mail_item', 'mail_id', 'BIGINT COMMENT \'邮件 ID\'');

-- ========================================
-- 修复 body_part 表
-- ========================================
CALL add_column_safe('body_part', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\'');

-- ========================================
-- 修复 skill 表
-- ========================================
CALL add_column_safe('skill', 'trigger_rate', 'DECIMAL(5,2) DEFAULT 1.00 COMMENT \'触发概率\'');

-- ========================================
-- 修复 equipment 表
-- ========================================
CALL add_column_safe('equipment', 'defense', 'INT DEFAULT 0 COMMENT \'防御\'');
CALL add_column_safe('equipment', 'status', 'INT DEFAULT 1 COMMENT \'状态\'');
CALL add_column_safe('equipment', 'level', 'INT DEFAULT 1 COMMENT \'等级\'');
CALL add_column_safe('equipment', 'attack', 'INT DEFAULT 0 COMMENT \'攻击\'');

-- ========================================
-- 修复 role_activity 表
-- ========================================
CALL add_column_safe('role_activity', 'reset_time', 'DATETIME COMMENT \'重置时间\'');

-- ========================================
-- 修复 announcement 表
-- ========================================
CALL add_column_safe('announcement', 'status', 'VARCHAR(20) DEFAULT \'active\' COMMENT \'状态\'');
CALL add_column_safe('announcement', 'type', 'VARCHAR(50) DEFAULT \'system\' COMMENT \'类型\'');
CALL add_column_safe('announcement', 'title', 'VARCHAR(200) COMMENT \'标题\'');
CALL add_column_safe('announcement', 'content', 'TEXT COMMENT \'内容\'');

-- ========================================
-- 修复 role_asset 表
-- ========================================
CALL add_column_safe('role_asset', 'quantity', 'BIGINT DEFAULT 0 COMMENT \'数量\'');
CALL add_column_safe('role_asset', 'asset_type_code', 'VARCHAR(50) COMMENT \'资产类型代码\'');
CALL add_column_safe('role_asset', 'role_id', 'BIGINT COMMENT \'角色 ID\'');

-- ========================================
-- 修复 asset_types 表
-- ========================================
CALL add_column_safe('asset_types', 'unit_of_measure', 'VARCHAR(20) COMMENT \'单位\'');
CALL add_column_safe('asset_types', 'is_system', 'TINYINT(1) DEFAULT 0 COMMENT \'是否系统\'');
CALL add_column_safe('asset_types', 'icon', 'VARCHAR(255) COMMENT \'图标\'');
CALL add_column_safe('asset_types', 'icon_path', 'VARCHAR(255) COMMENT \'图标路径\'');
CALL add_column_safe('asset_types', 'modules', 'VARCHAR(255) COMMENT \'模块\'');
CALL add_column_safe('asset_types', 'type', 'VARCHAR(50) COMMENT \'类型\'');
CALL add_column_safe('asset_types', 'droppable', 'TINYINT(1) DEFAULT 1 COMMENT \'可掉落\'');
CALL add_column_safe('asset_types', 'decimal_places', 'INT DEFAULT 0 COMMENT \'小数位数\'');
CALL add_column_safe('asset_types', 'category', 'VARCHAR(50) COMMENT \'分类\'');
CALL add_column_safe('asset_types', 'status', 'VARCHAR(20) DEFAULT \'active\' COMMENT \'状态\'');
CALL add_column_safe('asset_types', 'deleted_at', 'DATETIME COMMENT \'删除时间\'');
CALL add_column_safe('asset_types', 'tradable', 'TINYINT(1) DEFAULT 1 COMMENT \'可交易\'');
CALL add_column_safe('asset_types', 'max_stack', 'INT DEFAULT 99 COMMENT \'最大堆叠\'');
CALL add_column_safe('asset_types', 'decimal_precision', 'INT DEFAULT 0 COMMENT \'小数精度\'');
CALL add_column_safe('asset_types', 'destroy_policy', 'VARCHAR(50) DEFAULT \'none\' COMMENT \'销毁策略\'');

-- ========================================
-- 修复 trade_item 表
-- ========================================
CALL add_column_safe('trade_item', 'icon', 'VARCHAR(255) COMMENT \'图标\'');
CALL add_column_safe('trade_item', 'name', 'VARCHAR(100) COMMENT \'名称\'');
CALL add_column_safe('trade_item', 'category', 'VARCHAR(50) COMMENT \'分类\'');
CALL add_column_safe('trade_item', 'description', 'TEXT COMMENT \'描述\'');
CALL add_column_safe('trade_item', 'price', 'INT DEFAULT 0 COMMENT \'价格\'');
CALL add_column_safe('trade_item', 'stock', 'INT DEFAULT 0 COMMENT \'库存\'');

-- ========================================
-- 修复 asset_acquisition_records 表
-- ========================================
CALL add_column_safe('asset_acquisition_records', 'quantity', 'BIGINT DEFAULT 0 COMMENT \'数量\'');
CALL add_column_safe('asset_acquisition_records', 'source_id', 'BIGINT COMMENT \'来源 ID\'');
CALL add_column_safe('asset_acquisition_records', 'asset_type', 'VARCHAR(50) COMMENT \'资产类型\'');
CALL add_column_safe('asset_acquisition_records', 'source', 'VARCHAR(50) COMMENT \'来源\'');
CALL add_column_safe('asset_acquisition_records', 'role_id', 'BIGINT COMMENT \'角色 ID\'');

-- ========================================
-- 修复 role_clans 表
-- ========================================
CALL add_column_safe('role_clans', '`rank`', 'INT DEFAULT 0 COMMENT \'排名\'');

-- ========================================
-- 修复 cfg_skill_upgrade 表
-- ========================================
CALL add_column_safe('cfg_skill_upgrade', 'effect_increase', 'DECIMAL(5,2) COMMENT \'效果提升\'');
CALL add_column_safe('cfg_skill_upgrade', 'proficiency_requirement', 'INT COMMENT \'熟练度要求\'');
CALL add_column_safe('cfg_skill_upgrade', 'cooldown', 'INT COMMENT \'冷却时间\'');
CALL add_column_safe('cfg_skill_upgrade', 'mana_consumption', 'INT COMMENT \'法力消耗\'');
CALL add_column_safe('cfg_skill_upgrade', 'skill_level', 'VARCHAR(10) COMMENT \'技能等级\'');

-- ========================================
-- 修复 sys_role 表
-- ========================================
CALL add_column_safe('sys_role', 'custom_data_scope', 'TEXT COMMENT \'自定义数据范围\'');

-- ========================================
-- 修复 cfg_equipment_quality 表
-- ========================================
CALL add_column_safe('cfg_equipment_quality', 'probability', 'DECIMAL(5,2) COMMENT \'概率\'');
CALL add_column_safe('cfg_equipment_quality', 'max_bonus', 'DECIMAL(5,2) COMMENT \'最大加成\'');
CALL add_column_safe('cfg_equipment_quality', 'upgrade_effect', 'TEXT COMMENT \'升级效果\'');
CALL add_column_safe('cfg_equipment_quality', 'quality_name', 'VARCHAR(50) COMMENT \'品质名称\'');
CALL add_column_safe('cfg_equipment_quality', 'glow_color', 'VARCHAR(20) COMMENT \'发光颜色\'');
CALL add_column_safe('cfg_equipment_quality', 'description', 'VARCHAR(255) COMMENT \'描述\'');

-- ========================================
-- 修复 asset_usage_records 表
-- ========================================
CALL add_column_safe('asset_usage_records', 'quantity', 'BIGINT DEFAULT 0 COMMENT \'数量\'');
CALL add_column_safe('asset_usage_records', 'purpose_id', 'BIGINT COMMENT \'用途 ID\'');
CALL add_column_safe('asset_usage_records', 'asset_type', 'VARCHAR(50) COMMENT \'资产类型\'');
CALL add_column_safe('asset_usage_records', 'purpose', 'VARCHAR(50) COMMENT \'用途\'');
CALL add_column_safe('asset_usage_records', 'role_id', 'BIGINT COMMENT \'角色 ID\'');

-- ========================================
-- 修复 role_equipment 表
-- ========================================
CALL add_column_safe('role_equipment', 'item_id', 'BIGINT COMMENT \'物品 ID\'');
CALL add_column_safe('role_equipment', 'quantity', 'INT DEFAULT 1 COMMENT \'数量\'');
CALL add_column_safe('role_equipment', 'acquired_at', 'DATETIME COMMENT \'获得时间\'');
CALL add_column_safe('role_equipment', 'equip_time', 'DATETIME COMMENT \'装备时间\'');
CALL add_column_safe('role_equipment', 'slot_id', 'INT COMMENT \'槽位 ID\'');

-- ========================================
-- 修复 cfg_realm_breakthrough 表
-- ========================================
CALL add_column_safe('cfg_realm_breakthrough', 'from_realm', 'VARCHAR(50) COMMENT \'原境界\'');
CALL add_column_safe('cfg_realm_breakthrough', 'to_realm', 'VARCHAR(50) COMMENT \'新境界\'');
CALL add_column_safe('cfg_realm_breakthrough', 'xiuwei_requirement', 'INT COMMENT \'修为要求\'');
CALL add_column_safe('cfg_realm_breakthrough', 'pill_name', 'VARCHAR(100) COMMENT \'丹药名称\'');
CALL add_column_safe('cfg_realm_breakthrough', 'success_rate', 'DECIMAL(5,2) COMMENT \'成功率\'');
CALL add_column_safe('cfg_realm_breakthrough', 'failure_penalty', 'VARCHAR(100) COMMENT \'失败惩罚\'');

-- ========================================
-- 修复 friends 表
-- ========================================
CALL add_column_safe('friends', 'remark', 'VARCHAR(100) COMMENT \'备注\'');
CALL add_column_safe('friends', 'intimacy', 'INT DEFAULT 0 COMMENT \'亲密度\'');
CALL add_column_safe('friends', 'block_status', 'TINYINT(1) DEFAULT 0 COMMENT \'屏蔽状态\'');

-- ========================================
-- 修复 clans 表
-- ========================================
CALL add_column_safe('clans', 'level', 'INT DEFAULT 1 COMMENT \'等级\'');

-- ========================================
-- 修复 cultivation_techniques 表
-- ========================================
CALL add_column_safe('cultivation_techniques', 'type', 'VARCHAR(50) COMMENT \'类型\'');

-- ========================================
-- 修复 system_setting 表
-- ========================================
CALL add_column_safe('system_setting', 'description', 'VARCHAR(255) COMMENT \'描述\'');
CALL add_column_safe('system_setting', 'updated_at', 'DATETIME COMMENT \'更新时间\'');

-- ========================================
-- 修复 payment_record 表
-- ========================================
CALL add_column_safe('payment_record', 'amount', 'DECIMAL(10,2) COMMENT \'金额\'');
CALL add_column_safe('payment_record', 'currency', 'VARCHAR(20) COMMENT \'货币\'');
CALL add_column_safe('payment_record', 'status', 'VARCHAR(20) COMMENT \'状态\'');
CALL add_column_safe('payment_record', 'payment_time', 'DATETIME COMMENT \'支付时间\'');
CALL add_column_safe('payment_record', 'payment_method', 'VARCHAR(50) COMMENT \'支付方式\'');
CALL add_column_safe('payment_record', 'transaction_id', 'VARCHAR(100) COMMENT \'交易 ID\'');

-- ========================================
-- 修复 role_map_node 表
-- ========================================
CALL add_column_safe('role_map_node', 'current_x', 'INT DEFAULT 0 COMMENT \'X 坐标\'');
CALL add_column_safe('role_map_node', 'current_y', 'INT DEFAULT 0 COMMENT \'Y 坐标\'');
CALL add_column_safe('role_map_node', 'last_move_time', 'DATETIME COMMENT \'最后移动时间\'');
CALL add_column_safe('role_map_node', 'map_id', 'BIGINT COMMENT \'地图 ID\'');

-- ========================================
-- 修复 role_checkin 表
-- ========================================
CALL add_column_safe('role_checkin', 'last_checkin_time', 'DATETIME COMMENT \'最后签到时间\'');
CALL add_column_safe('role_checkin', 'total_checkin_days', 'INT DEFAULT 0 COMMENT \'累计签到天数\'');
CALL add_column_safe('role_checkin', 'checkin_count', 'INT DEFAULT 0 COMMENT \'签到次数\'');
CALL add_column_safe('role_checkin', 'month', 'INT COMMENT \'月份\'');
CALL add_column_safe('role_checkin', 'year', 'INT COMMENT \'年份\'');

-- ========================================
-- 修复 sys_user 表
-- ========================================
CALL add_column_safe('sys_user', 'email', 'VARCHAR(100) COMMENT \'邮箱\'');
CALL add_column_safe('sys_user', 'phone', 'VARCHAR(20) COMMENT \'手机\'');

-- ========================================
-- 修复 shop_items 表
-- ========================================
CALL add_column_safe('shop_items', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\'');
CALL add_column_safe('shop_items', 'discount', 'DECIMAL(5,2) COMMENT \'折扣\'');
CALL add_column_safe('shop_items', 'purchase_limit', 'INT COMMENT \'购买限制\'');
CALL add_column_safe('shop_items', 'shelf_status', 'TINYINT(1) DEFAULT 1 COMMENT \'上架状态\'');
CALL add_column_safe('shop_items', 'category', 'VARCHAR(50) COMMENT \'分类\'');
CALL add_column_safe('shop_items', 'icon', 'VARCHAR(255) COMMENT \'图标\'');

-- ========================================
-- 修复 role_clan_skill 表
-- ========================================
CALL add_column_safe('role_clan_skill', 'skill_level', 'INT DEFAULT 1 COMMENT \'技能等级\'');
CALL add_column_safe('role_clan_skill', 'learn_time', 'DATETIME COMMENT \'学习时间\'');
CALL add_column_safe('role_clan_skill', 'proficiency', 'INT DEFAULT 0 COMMENT \'熟练度\'');
CALL add_column_safe('role_clan_skill', 'is_equipped', 'TINYINT(1) DEFAULT 0 COMMENT \'是否装备\'');

-- ========================================
-- 修复 verification_code 表
-- ========================================
CALL add_column_safe('verification_code', 'phone', 'VARCHAR(20) COMMENT \'手机\'');
CALL add_column_safe('verification_code', 'code', 'VARCHAR(10) COMMENT \'验证码\'');
CALL add_column_safe('verification_code', 'type', 'VARCHAR(20) COMMENT \'类型\'');
CALL add_column_safe('verification_code', 'expire_at', 'DATETIME COMMENT \'过期时间\'');

-- ========================================
-- 修复 body_mutation 表
-- ========================================
CALL add_column_safe('body_mutation', 'mutation_type', 'VARCHAR(50) COMMENT \'变异类型\'');
CALL add_column_safe('body_mutation', 'description', 'TEXT COMMENT \'描述\'');

-- ========================================
-- 修复 trade_record 表
-- ========================================
CALL add_column_safe('trade_record', 'seller_id', 'BIGINT COMMENT \'卖家 ID\'');
CALL add_column_safe('trade_record', 'buyer_id', 'BIGINT COMMENT \'买家 ID\'');
CALL add_column_safe('trade_record', 'item_id', 'BIGINT COMMENT \'物品 ID\'');
CALL add_column_safe('trade_record', 'quantity', 'INT COMMENT \'数量\'');
CALL add_column_safe('trade_record', 'price', 'DECIMAL(10,2) COMMENT \'价格\'');
CALL add_column_safe('trade_record', 'status', 'VARCHAR(20) COMMENT \'状态\'');
CALL add_column_safe('trade_record', 'trade_time', 'DATETIME COMMENT \'交易时间\'');

-- ========================================
-- 修复 permission 表
-- ========================================
CALL add_column_safe('permission', 'permission_name', 'VARCHAR(100) COMMENT \'权限名称\'');
CALL add_column_safe('permission', 'permission_code', 'VARCHAR(100) COMMENT \'权限代码\'');
CALL add_column_safe('permission', 'description', 'TEXT COMMENT \'描述\'');
CALL add_column_safe('permission', 'resource_type', 'VARCHAR(50) COMMENT \'资源类型\'');
CALL add_column_safe('permission', 'resource_id', 'BIGINT COMMENT \'资源 ID\'');
CALL add_column_safe('permission', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\'');

-- ========================================
-- 修复 task 表
-- ========================================
CALL add_column_safe('task', 'task_difficulty', 'VARCHAR(20) DEFAULT \'normal\' COMMENT \'难度\'');
CALL add_column_safe('task', 'min_level', 'INT DEFAULT 1 COMMENT \'最低等级\'');
CALL add_column_safe('task', 'max_level', 'INT DEFAULT 100 COMMENT \'最高等级\'');
CALL add_column_safe('task', 'repeat_count', 'INT DEFAULT 0 COMMENT \'重复次数\'');
CALL add_column_safe('task', 'time_limit', 'INT COMMENT \'时间限制\'');
CALL add_column_safe('task', 'task_type', 'VARCHAR(50) COMMENT \'任务类型\'');
CALL add_column_safe('task', 'icon', 'VARCHAR(255) COMMENT \'图标\'');
CALL add_column_safe('task', 'reward_items', 'TEXT COMMENT \'奖励物品\'');

-- ========================================
-- 修复 role_item 表
-- ========================================
CALL add_column_safe('role_item', 'item_name', 'VARCHAR(255) COMMENT \'物品名称\'');
CALL add_column_safe('role_item', 'item_type', 'VARCHAR(50) COMMENT \'物品类型\'');

-- ========================================
-- 修复 clan_skill 表
-- ========================================
CALL add_column_safe('clan_skill', 'skill_name', 'VARCHAR(100) COMMENT \'技能名称\'');
CALL add_column_safe('clan_skill', 'description', 'TEXT COMMENT \'描述\'');
CALL add_column_safe('clan_skill', 'level_requirement', 'INT COMMENT \'等级要求\'');
CALL add_column_safe('clan_skill', 'effect', 'TEXT COMMENT \'效果\'');
CALL add_column_safe('clan_skill', 'icon', 'VARCHAR(255) COMMENT \'图标\'');
CALL add_column_safe('clan_skill', 'type', 'VARCHAR(50) COMMENT \'类型\'');

-- ========================================
-- 修复 sys_permission 表
-- ========================================
CALL add_column_safe('sys_permission', 'permission_name', 'VARCHAR(100) COMMENT \'权限名称\'');
CALL add_column_safe('sys_permission', 'permission_code', 'VARCHAR(100) COMMENT \'权限代码\'');
CALL add_column_safe('sys_permission', 'resource_type', 'VARCHAR(50) COMMENT \'资源类型\'');
CALL add_column_safe('sys_permission', 'description', 'TEXT COMMENT \'描述\'');
CALL add_column_safe('sys_permission', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\'');

-- ========================================
-- 修复 cfg_pill_effect 表
-- ========================================
CALL add_column_safe('cfg_pill_effect', 'pill_name', 'VARCHAR(100) COMMENT \'丹药名称\'');
CALL add_column_safe('cfg_pill_effect', 'effect_type', 'VARCHAR(50) COMMENT \'效果类型\'');
CALL add_column_safe('cfg_pill_effect', 'effect_value', 'INT COMMENT \'效果值\'');
CALL add_column_safe('cfg_pill_effect', 'duration', 'INT COMMENT \'持续时间\'');
CALL add_column_safe('cfg_pill_effect', 'cooldown', 'INT COMMENT \'冷却时间\'');
CALL add_column_safe('cfg_pill_effect', 'side_effect', 'TEXT COMMENT \'副作用\'');

-- ========================================
-- 修复 sect_apply 表
-- ========================================
CALL add_column_safe('sect_apply', 'applicant_id', 'BIGINT COMMENT \'申请者 ID\'');
CALL add_column_safe('sect_apply', 'sect_id', 'BIGINT COMMENT \'宗门 ID\'');
CALL add_column_safe('sect_apply', 'apply_time', 'DATETIME COMMENT \'申请时间\'');
CALL add_column_safe('sect_apply', 'status', 'VARCHAR(20) DEFAULT \'pending\' COMMENT \'状态\'');
CALL add_column_safe('sect_apply', 'message', 'TEXT COMMENT \'消息\'');
CALL add_column_safe('sect_apply', 'handler_id', 'BIGINT COMMENT \'处理者 ID\'');
CALL add_column_safe('sect_apply', 'handle_time', 'DATETIME COMMENT \'处理时间\'');

-- ========================================
-- 修复 gift 表
-- ========================================
CALL add_column_safe('gift', 'gift_name', 'VARCHAR(100) COMMENT \'礼物名称\'');
CALL add_column_safe('gift', 'gift_type', 'VARCHAR(50) DEFAULT 'system' COMMENT \'礼物类型\'');
CALL add_column_safe('gift', 'priority', 'INT DEFAULT 0 COMMENT \'优先级\'');
CALL add_column_safe('gift', 'valid_days', 'INT COMMENT \'有效天数\'');
CALL add_column_safe('gift', 'icon', 'VARCHAR(255) COMMENT \'图标\'');
CALL add_column_safe('gift', 'description', 'TEXT COMMENT \'描述\'');
CALL add_column_safe('gift', 'rewards', 'TEXT COMMENT \'奖励\'');

-- ========================================
-- 修复 role_realms 表
-- ========================================
CALL add_column_safe('role_realms', 'realm_name', 'VARCHAR(50) COMMENT \'境界名称\'');
CALL add_column_safe('role_realms', 'realm_level', 'INT COMMENT \'境界等级\'');
CALL add_column_safe('role_realms', 'total_cultivation', 'BIGINT COMMENT \'总修为\'');
CALL add_column_safe('role_realms', 'realm_stage', 'INT DEFAULT 1 COMMENT \'境界阶段\'');
CALL add_column_safe('role_realms', 'breakthrough_time', 'DATETIME COMMENT \'突破时间\'');

-- ========================================
-- 修复 body_cultivation_material 表
-- ========================================
CALL add_column_safe('body_cultivation_material', 'material_name', 'VARCHAR(100) COMMENT \'材料名称\'');
CALL add_column_safe('body_cultivation_material', 'material_type', 'VARCHAR(50) COMMENT \'材料类型\'');
CALL add_column_safe('body_cultivation_material', 'effect', 'TEXT COMMENT \'效果\'');
CALL add_column_safe('body_cultivation_material', 'rarity', 'INT DEFAULT 1 COMMENT \'稀有度\'');

-- ========================================
-- 修复 system_log 表
-- ========================================
CALL add_column_safe('system_log', 'log_level', 'VARCHAR(20) COMMENT \'日志级别\'');
CALL add_column_safe('system_log', 'logger_name', 'VARCHAR(100) COMMENT \'日志名称\'');
CALL add_column_safe('system_log', 'message', 'TEXT COMMENT \'消息\'');
CALL add_column_safe('system_log', 'exception', 'TEXT COMMENT \'异常\'');
CALL add_column_safe('system_log', 'thread_name', 'VARCHAR(100) COMMENT \'线程名\'');
CALL add_column_safe('system_log', 'log_time', 'DATETIME COMMENT \'日志时间\'');

-- ========================================
-- 修复 game_user 表
-- ========================================
CALL add_column_safe('game_user', 'username', 'VARCHAR(100) COMMENT \'用户名\'');
CALL add_column_safe('game_user', 'password', 'VARCHAR(255) COMMENT \'密码\'');
CALL add_column_safe('game_user', 'email', 'VARCHAR(100) COMMENT \'邮箱\'');
CALL add_column_safe('game_user', 'phone', 'VARCHAR(20) COMMENT \'手机\'');
CALL add_column_safe('game_user', 'status', 'INT DEFAULT 1 COMMENT \'状态\'');
CALL add_column_safe('game_user', 'last_login_time', 'DATETIME COMMENT \'最后登录时间\'');
CALL add_column_safe('game_user', 'create_time', 'DATETIME COMMENT \'创建时间\'');

-- ========================================
-- 修复 role_task 表
-- ========================================
CALL add_column_safe('role_task', 'task_type', 'VARCHAR(50) COMMENT \'任务类型\'');
CALL add_column_safe('role_task', 'reward_claimed', 'TINYINT(1) DEFAULT 0 COMMENT \'奖励已领取\'');

-- ========================================
-- 修复 achievement 表
-- ========================================
CALL add_column_safe('achievement', 'reward_attributes', 'TEXT COMMENT \'奖励属性\'');
CALL add_column_safe('achievement', 'rewards', 'TEXT COMMENT \'奖励\'');
CALL add_column_safe('achievement', 'icon', 'VARCHAR(255) COMMENT \'图标\'');
CALL add_column_safe('achievement', 'name', 'VARCHAR(100) COMMENT \'名称\'');
CALL add_column_safe('achievement', 'type', 'VARCHAR(50) COMMENT \'类型\'');
CALL add_column_safe('achievement', 'rarity', 'INT DEFAULT 1 COMMENT \'稀有度\'');
CALL add_column_safe('achievement', '`condition`', 'TEXT COMMENT \'条件\'');
CALL add_column_safe('achievement', 'status', 'VARCHAR(20) DEFAULT 'active' COMMENT \'状态\'');
CALL add_column_safe('achievement', 'condition_type', 'VARCHAR(50) COMMENT \'条件类型\'');
CALL add_column_safe('achievement', 'hidden', 'TINYINT(1) DEFAULT 0 COMMENT \'隐藏\'');
CALL add_column_safe('achievement', 'title', 'VARCHAR(200) COMMENT \'标题\'');
CALL add_column_safe('achievement', 'module_type', 'VARCHAR(50) COMMENT \'模块类型\'');
CALL add_column_safe('achievement', 'operator', 'VARCHAR(10) COMMENT \'操作符\'');
CALL add_column_safe('achievement', 'threshold', 'BIGINT COMMENT \'阈值\'');
CALL add_column_safe('achievement', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\'');
CALL add_column_safe('achievement', 'description', 'TEXT COMMENT \'描述\'');

-- ========================================
-- 修复 item 表
-- ========================================
CALL add_column_safe('item', 'item_level', 'INT DEFAULT 1 COMMENT \'物品等级\'');
CALL add_column_safe('item', 'quality', 'VARCHAR(20) DEFAULT 'common' COMMENT \'品质\'');
CALL add_column_safe('item', 'icon', 'VARCHAR(255) COMMENT \'图标\'');
CALL add_column_safe('item', 'max_stack_size', 'INT DEFAULT 99 COMMENT \'最大堆叠数\'');
CALL add_column_safe('item', 'sell_price', 'INT COMMENT \'出售价格\'');

-- ========================================
-- 修复 role_achievement 表
-- ========================================
CALL add_column_safe('role_achievement', 'completed_at', 'DATETIME COMMENT \'完成时间\'');
CALL add_column_safe('role_achievement', 'reward_claimed', 'TINYINT(1) DEFAULT 0 COMMENT \'奖励已领取\'');
CALL add_column_safe('role_achievement', 'progress', 'INT DEFAULT 0 COMMENT \'进度\'');
CALL add_column_safe('role_achievement', 'status', 'VARCHAR(20) DEFAULT 'in_progress' COMMENT \'状态\'');
CALL add_column_safe('role_achievement', 'achievement_id', 'BIGINT COMMENT \'成就 ID\'');
CALL add_column_safe('role_achievement', 'role_id', 'BIGINT COMMENT \'角色 ID\'');
CALL add_column_safe('role_achievement', 'created_at', 'DATETIME COMMENT \'创建时间\'');
CALL add_column_safe('role_achievement', 'updated_at', 'DATETIME COMMENT \'更新时间\'');

-- 删除存储过程
DROP PROCEDURE IF EXISTS add_column_safe;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ 数据库字段修复完成！所有字段已智能检测并安全添加。' AS message;
