-- ============================================
-- 数据库字段缺失修复脚本 (修正版)
-- 生成时间：2026-04-01 15:33:03
-- 说明：已移除 IF NOT EXISTS 语法，改用存储过程动态检查
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;
SET @dbname = DATABASE();

-- 修复 mail_item 表缺失字段
CALL add_column_if_not_exists('mail_item', 'item_id', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('mail_item', 'quantity', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('mail_item', 'mail_id', 'BIGINT COMMENT \'自动补充字段\'');

-- 修复 body_part 表缺失字段
CALL add_column_if_not_exists('body_part', 'sort_order', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');

-- 修复 skill 表缺失字段
CALL add_column_if_not_exists('skill', 'trigger_rate', 'DECIMAL(5,2) DEFAULT 1.00 COMMENT \'自动补充字段\'');

-- 修复 equipment 表缺失字段
CALL add_column_if_not_exists('equipment', 'defense', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('equipment', 'status', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('equipment', 'level', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('equipment', 'attack', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');

-- 修复 role_activity 表缺失字段
CALL add_column_if_not_exists('role_activity', 'reset_time', 'DATETIME COMMENT \'自动补充字段\'');

-- 修复 announcement 表缺失字段
CALL add_column_if_not_exists('announcement', 'status', 'VARCHAR(20) DEFAULT \'active\' COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('announcement', 'type', 'VARCHAR(50) DEFAULT \'system\' COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('announcement', 'title', 'VARCHAR(200) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('announcement', 'content', 'TEXT COMMENT \'自动补充字段\'');

-- 修复 role_asset 表缺失字段
CALL add_column_if_not_exists('role_asset', 'quantity', 'BIGINT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_asset', 'asset_type_code', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_asset', 'role_id', 'BIGINT COMMENT \'自动补充字段\'');

-- 修复 asset_types 表缺失字段
CALL add_column_if_not_exists('asset_types', 'unit_of_measure', 'VARCHAR(20) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'is_system', 'TINYINT(1) DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'icon', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'icon_path', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'modules', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'droppable', 'TINYINT(1) DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'decimal_places', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'category', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'status', 'VARCHAR(20) DEFAULT \'active\' COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'deleted_at', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'tradable', 'TINYINT(1) DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'max_stack', 'INT DEFAULT 99 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'decimal_precision', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_types', 'destroy_policy', 'VARCHAR(50) DEFAULT \'none\' COMMENT \'自动补充字段\'');

-- 修复 trade_item 表缺失字段
CALL add_column_if_not_exists('trade_item', 'icon', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_item', 'name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_item', 'category', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_item', 'description', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_item', 'price', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_item', 'stock', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');

-- 修复 asset_acquisition_records 表缺失字段
CALL add_column_if_not_exists('asset_acquisition_records', 'quantity', 'BIGINT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_acquisition_records', 'source_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_acquisition_records', 'asset_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_acquisition_records', 'source', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_acquisition_records', 'role_id', 'BIGINT COMMENT \'自动补充字段\'');

-- 修复 role_clans 表缺失字段
CALL add_column_if_not_exists('role_clans', '`rank`', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');

-- 修复 cfg_skill_upgrade 表缺失字段
CALL add_column_if_not_exists('cfg_skill_upgrade', 'effect_increase', 'DECIMAL(5,2) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_skill_upgrade', 'proficiency_requirement', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_skill_upgrade', 'cooldown', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_skill_upgrade', 'mana_consumption', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_skill_upgrade', 'skill_level', 'VARCHAR(10) COMMENT \'自动补充字段\'');

-- 修复 sys_role 表缺失字段
CALL add_column_if_not_exists('sys_role', 'custom_data_scope', 'TEXT COMMENT \'自动补充字段\'');

-- 修复 cfg_equipment_quality 表缺失字段
CALL add_column_if_not_exists('cfg_equipment_quality', 'probability', 'DECIMAL(5,2) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_equipment_quality', 'max_bonus', 'DECIMAL(5,2) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_equipment_quality', 'upgrade_effect', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_equipment_quality', 'quality_name', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_equipment_quality', 'glow_color', 'VARCHAR(20) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_equipment_quality', 'description', 'VARCHAR(255) COMMENT \'自动补充字段\'');

-- 修复 asset_usage_records 表缺失字段
CALL add_column_if_not_exists('asset_usage_records', 'quantity', 'BIGINT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_usage_records', 'purpose_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_usage_records', 'asset_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_usage_records', 'purpose', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('asset_usage_records', 'role_id', 'BIGINT COMMENT \'自动补充字段\'');

-- 修复 role_equipment 表缺失字段
CALL add_column_if_not_exists('role_equipment', 'item_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_equipment', 'quantity', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_equipment', 'acquired_at', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_equipment', 'equip_time', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_equipment', 'slot_id', 'INT COMMENT \'自动补充字段\'');

-- 修复 cfg_realm_breakthrough 表缺失字段
CALL add_column_if_not_exists('cfg_realm_breakthrough', 'from_realm', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_realm_breakthrough', 'to_realm', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_realm_breakthrough', 'xiuwei_requirement', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_realm_breakthrough', 'pill_name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_realm_breakthrough', 'success_rate', 'DECIMAL(5,2) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_realm_breakthrough', 'failure_penalty', 'VARCHAR(100) COMMENT \'自动补充字段\'');

-- 修复 friends 表缺失字段
CALL add_column_if_not_exists('friends', 'remark', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('friends', 'intimacy', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('friends', 'block_status', 'TINYINT(1) DEFAULT 0 COMMENT \'自动补充字段\'');

-- 修复 clans 表缺失字段
CALL add_column_if_not_exists('clans', 'level', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');

-- 修复 cultivation_techniques 表缺失字段
CALL add_column_if_not_exists('cultivation_techniques', 'type', 'VARCHAR(50) COMMENT \'自动补充字段\'');

-- 修复 system_setting 表缺失字段
CALL add_column_if_not_exists('system_setting', 'description', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('system_setting', 'updated_at', 'DATETIME COMMENT \'自动补充字段\'');

-- 修复 payment_record 表缺失字段
CALL add_column_if_not_exists('payment_record', 'amount', 'DECIMAL(10,2) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('payment_record', 'currency', 'VARCHAR(20) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('payment_record', 'status', 'VARCHAR(20) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('payment_record', 'payment_time', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('payment_record', 'payment_method', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('payment_record', 'transaction_id', 'VARCHAR(100) COMMENT \'自动补充字段\'');

-- 修复 role_map_node 表缺失字段
CALL add_column_if_not_exists('role_map_node', 'current_x', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_map_node', 'current_y', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_map_node', 'last_move_time', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_map_node', 'map_id', 'BIGINT COMMENT \'自动补充字段\'');

-- 修复 role_checkin 表缺失字段
CALL add_column_if_not_exists('role_checkin', 'last_checkin_time', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_checkin', 'total_checkin_days', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_checkin', 'checkin_count', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_checkin', 'month', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_checkin', 'year', 'INT COMMENT \'自动补充字段\'');

-- 修复 sys_user 表缺失字段
CALL add_column_if_not_exists('sys_user', 'email', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sys_user', 'phone', 'VARCHAR(20) COMMENT \'自动补充字段\'');

-- 修复 shop_items 表缺失字段
CALL add_column_if_not_exists('shop_items', 'sort_order', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('shop_items', 'discount', 'DECIMAL(5,2) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('shop_items', 'purchase_limit', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('shop_items', 'shelf_status', 'TINYINT(1) DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('shop_items', 'category', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('shop_items', 'icon', 'VARCHAR(255) COMMENT \'自动补充字段\'');

-- 修复 role_clan_skill 表缺失字段
CALL add_column_if_not_exists('role_clan_skill', 'skill_level', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_clan_skill', 'learn_time', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_clan_skill', 'proficiency', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_clan_skill', 'is_equipped', 'TINYINT(1) DEFAULT 0 COMMENT \'自动补充字段\'');

-- 修复 verification_code 表缺失字段
CALL add_column_if_not_exists('verification_code', 'phone', 'VARCHAR(20) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('verification_code', 'code', 'VARCHAR(10) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('verification_code', 'type', 'VARCHAR(20) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('verification_code', 'expire_at', 'DATETIME COMMENT \'自动补充字段\'');

-- 修复 body_mutation 表缺失字段
CALL add_column_if_not_exists('body_mutation', 'mutation_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('body_mutation', 'description', 'TEXT COMMENT \'自动补充字段\'');

-- 修复 trade_record 表缺失字段
CALL add_column_if_not_exists('trade_record', 'seller_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_record', 'buyer_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_record', 'item_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_record', 'quantity', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_record', 'price', 'DECIMAL(10,2) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_record', 'status', 'VARCHAR(20) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('trade_record', 'trade_time', 'DATETIME COMMENT \'自动补充字段\'');

-- 修复 permission 表缺失字段
CALL add_column_if_not_exists('permission', 'permission_name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('permission', 'permission_code', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('permission', 'description', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('permission', 'resource_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('permission', 'resource_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('permission', 'sort_order', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');

-- 修复 task 表缺失字段
CALL add_column_if_not_exists('task', 'task_difficulty', 'VARCHAR(20) DEFAULT \'normal\' COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('task', 'min_level', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('task', 'max_level', 'INT DEFAULT 100 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('task', 'repeat_count', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('task', 'time_limit', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('task', 'task_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('task', 'icon', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('task', 'reward_items', 'TEXT COMMENT \'自动补充字段\'');

-- 修复 role_item 表缺失字段
CALL add_column_if_not_exists('role_item', 'item_name', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_item', 'item_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');

-- 修复 clan_skill 表缺失字段
CALL add_column_if_not_exists('clan_skill', 'skill_name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('clan_skill', 'description', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('clan_skill', 'level_requirement', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('clan_skill', 'effect', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('clan_skill', 'icon', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('clan_skill', 'type', 'VARCHAR(50) COMMENT \'自动补充字段\'');

-- 修复 sys_permission 表缺失字段
CALL add_column_if_not_exists('sys_permission', 'permission_name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sys_permission', 'permission_code', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sys_permission', 'resource_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sys_permission', 'description', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sys_permission', 'sort_order', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');

-- 修复 cfg_pill_effect 表缺失字段
CALL add_column_if_not_exists('cfg_pill_effect', 'pill_name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_pill_effect', 'effect_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_pill_effect', 'effect_value', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_pill_effect', 'duration', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_pill_effect', 'cooldown', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('cfg_pill_effect', 'side_effect', 'TEXT COMMENT \'自动补充字段\'');

-- 修复 sect_apply 表缺失字段
CALL add_column_if_not_exists('sect_apply', 'applicant_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sect_apply', 'sect_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sect_apply', 'apply_time', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sect_apply', 'status', 'VARCHAR(20) DEFAULT \'pending\' COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sect_apply', 'message', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sect_apply', 'handler_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('sect_apply', 'handle_time', 'DATETIME COMMENT \'自动补充字段\'');

-- 修复 gift 表缺失字段
CALL add_column_if_not_exists('gift', 'gift_name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('gift', 'gift_type', 'VARCHAR(50) DEFAULT \'system\' COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('gift', 'priority', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('gift', 'valid_days', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('gift', 'icon', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('gift', 'description', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('gift', 'rewards', 'TEXT COMMENT \'自动补充字段\'');

-- 修复 role_realms 表缺失字段
CALL add_column_if_not_exists('role_realms', 'realm_name', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_realms', 'realm_level', 'INT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_realms', 'total_cultivation', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_realms', 'realm_stage', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_realms', 'breakthrough_time', 'DATETIME COMMENT \'自动补充字段\'');

-- 修复 body_cultivation_material 表缺失字段
CALL add_column_if_not_exists('body_cultivation_material', 'material_name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('body_cultivation_material', 'material_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('body_cultivation_material', 'effect', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('body_cultivation_material', 'rarity', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');

-- 修复 system_log 表缺失字段
CALL add_column_if_not_exists('system_log', 'log_level', 'VARCHAR(20) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('system_log', 'logger_name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('system_log', 'message', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('system_log', 'exception', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('system_log', 'thread_name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('system_log', 'log_time', 'DATETIME COMMENT \'自动补充字段\'');

-- 修复 game_user 表缺失字段
CALL add_column_if_not_exists('game_user', 'username', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('game_user', 'password', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('game_user', 'email', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('game_user', 'phone', 'VARCHAR(20) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('game_user', 'status', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('game_user', 'last_login_time', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('game_user', 'create_time', 'DATETIME COMMENT \'自动补充字段\'');

-- 修复 role_task 表缺失字段
CALL add_column_if_not_exists('role_task', 'task_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_task', 'reward_claimed', 'TINYINT(1) DEFAULT 0 COMMENT \'自动补充字段\'');

-- 修复 achievement 表缺失字段
CALL add_column_if_not_exists('achievement', 'reward_attributes', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'rewards', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'icon', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'name', 'VARCHAR(100) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'rarity', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', '`condition`', 'TEXT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'status', 'VARCHAR(20) DEFAULT \'active\' COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'condition_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'hidden', 'TINYINT(1) DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'title', 'VARCHAR(200) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'module_type', 'VARCHAR(50) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'operator', 'VARCHAR(10) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'threshold', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'sort_order', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('achievement', 'description', 'TEXT COMMENT \'自动补充字段\'');

-- 修复 item 表缺失字段
CALL add_column_if_not_exists('item', 'item_level', 'INT DEFAULT 1 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('item', 'quality', 'VARCHAR(20) DEFAULT \'common\' COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('item', 'icon', 'VARCHAR(255) COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('item', 'max_stack_size', 'INT DEFAULT 99 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('item', 'sell_price', 'INT COMMENT \'自动补充字段\'');

-- 修复 role_achievement 表缺失字段
CALL add_column_if_not_exists('role_achievement', 'completed_at', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_achievement', 'reward_claimed', 'TINYINT(1) DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_achievement', 'progress', 'INT DEFAULT 0 COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_achievement', 'status', 'VARCHAR(20) DEFAULT \'in_progress\' COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_achievement', 'achievement_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_achievement', 'role_id', 'BIGINT COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_achievement', 'created_at', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_achievement', 'updated_at', 'DATETIME COMMENT \'自动补充字段\'');
CALL add_column_if_not_exists('role_achievement', 'id', 'BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT \'自动补充字段\'');

-- 清理存储过程
DROP PROCEDURE IF EXISTS add_column_if_not_exists;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ 数据库字段修复完成！' AS message;
