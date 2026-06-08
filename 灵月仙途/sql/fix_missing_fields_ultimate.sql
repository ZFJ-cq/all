-- ============================================
-- 数据库字段缺失修复脚本 (最终完美版)
-- 说明：使用动态 SQL 和更可靠的字段检测
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- 创建临时表记录需要添加的字段
DROP TABLE IF EXISTS _columns_to_add;
CREATE TEMPORARY TABLE _columns_to_add (
    table_name VARCHAR(100),
    column_name VARCHAR(100),
    column_definition VARCHAR(500)
);

-- 插入需要添加的字段定义
INSERT INTO _columns_to_add VALUES
-- mail_item 表
('mail_item', 'item_id', 'BIGINT COMMENT \'物品 ID\''),
('mail_item', 'quantity', 'INT DEFAULT 0 COMMENT \'数量\''),
('mail_item', 'mail_id', 'BIGINT COMMENT \'邮件 ID\''),

-- body_part 表
('body_part', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\''),

-- skill 表
('skill', 'trigger_rate', 'DECIMAL(5,2) DEFAULT 1.00 COMMENT \'触发概率\''),

-- equipment 表
('equipment', 'defense', 'INT DEFAULT 0 COMMENT \'防御\''),
('equipment', 'status', 'INT DEFAULT 1 COMMENT \'状态\''),
('equipment', 'level', 'INT DEFAULT 1 COMMENT \'等级\''),
('equipment', 'attack', 'INT DEFAULT 0 COMMENT \'攻击\''),

-- role_activity 表
('role_activity', 'reset_time', 'DATETIME COMMENT \'重置时间\''),

-- announcement 表
('announcement', 'status', 'VARCHAR(20) DEFAULT \'active\' COMMENT \'状态\''),
('announcement', 'type', 'VARCHAR(50) DEFAULT \'system\' COMMENT \'类型\''),
('announcement', 'title', 'VARCHAR(200) COMMENT \'标题\''),
('announcement', 'content', 'TEXT COMMENT \'内容\''),

-- role_asset 表
('role_asset', 'quantity', 'BIGINT DEFAULT 0 COMMENT \'数量\''),
('role_asset', 'asset_type_code', 'VARCHAR(50) COMMENT \'资产类型代码\''),
('role_asset', 'role_id', 'BIGINT COMMENT \'角色 ID\''),

-- asset_types 表
('asset_types', 'unit_of_measure', 'VARCHAR(20) COMMENT \'单位\''),
('asset_types', 'is_system', 'TINYINT(1) DEFAULT 0 COMMENT \'是否系统\''),
('asset_types', 'icon', 'VARCHAR(255) COMMENT \'图标\''),
('asset_types', 'icon_path', 'VARCHAR(255) COMMENT \'图标路径\''),
('asset_types', 'modules', 'VARCHAR(255) COMMENT \'模块\''),
('asset_types', 'type', 'VARCHAR(50) COMMENT \'类型\''),
('asset_types', 'droppable', 'TINYINT(1) DEFAULT 1 COMMENT \'可掉落\''),
('asset_types', 'decimal_places', 'INT DEFAULT 0 COMMENT \'小数位数\''),
('asset_types', 'category', 'VARCHAR(50) COMMENT \'分类\''),
('asset_types', 'status', 'VARCHAR(20) DEFAULT \'active\' COMMENT \'状态\''),
('asset_types', 'deleted_at', 'DATETIME COMMENT \'删除时间\''),
('asset_types', 'tradable', 'TINYINT(1) DEFAULT 1 COMMENT \'可交易\''),
('asset_types', 'max_stack', 'INT DEFAULT 99 COMMENT \'最大堆叠\''),
('asset_types', 'decimal_precision', 'INT DEFAULT 0 COMMENT \'小数精度\''),
('asset_types', 'destroy_policy', 'VARCHAR(50) DEFAULT \'none\' COMMENT \'销毁策略\''),

-- trade_item 表
('trade_item', 'icon', 'VARCHAR(255) COMMENT \'图标\''),
('trade_item', 'name', 'VARCHAR(100) COMMENT \'名称\''),
('trade_item', 'category', 'VARCHAR(50) COMMENT \'分类\''),
('trade_item', 'description', 'TEXT COMMENT \'描述\''),
('trade_item', 'price', 'INT DEFAULT 0 COMMENT \'价格\''),
('trade_item', 'stock', 'INT DEFAULT 0 COMMENT \'库存\''),

-- asset_acquisition_records 表
('asset_acquisition_records', 'quantity', 'BIGINT DEFAULT 0 COMMENT \'数量\''),
('asset_acquisition_records', 'source_id', 'BIGINT COMMENT \'来源 ID\''),
('asset_acquisition_records', 'asset_type', 'VARCHAR(50) COMMENT \'资产类型\''),
('asset_acquisition_records', 'source', 'VARCHAR(50) COMMENT \'来源\''),
('asset_acquisition_records', 'role_id', 'BIGINT COMMENT \'角色 ID\''),

-- role_clans 表
('role_clans', 'rank', 'INT DEFAULT 0 COMMENT \'排名\''),

-- cfg_skill_upgrade 表
('cfg_skill_upgrade', 'effect_increase', 'DECIMAL(5,2) COMMENT \'效果提升\''),
('cfg_skill_upgrade', 'proficiency_requirement', 'INT COMMENT \'熟练度要求\''),
('cfg_skill_upgrade', 'cooldown', 'INT COMMENT \'冷却时间\''),
('cfg_skill_upgrade', 'mana_consumption', 'INT COMMENT \'法力消耗\''),
('cfg_skill_upgrade', 'skill_level', 'VARCHAR(10) COMMENT \'技能等级\''),

-- sys_role 表
('sys_role', 'custom_data_scope', 'TEXT COMMENT \'自定义数据范围\''),

-- cfg_equipment_quality 表
('cfg_equipment_quality', 'probability', 'DECIMAL(5,2) COMMENT \'概率\''),
('cfg_equipment_quality', 'max_bonus', 'DECIMAL(5,2) COMMENT \'最大加成\''),
('cfg_equipment_quality', 'upgrade_effect', 'TEXT COMMENT \'升级效果\''),
('cfg_equipment_quality', 'quality_name', 'VARCHAR(50) COMMENT \'品质名称\''),
('cfg_equipment_quality', 'glow_color', 'VARCHAR(20) COMMENT \'发光颜色\''),
('cfg_equipment_quality', 'description', 'VARCHAR(255) COMMENT \'描述\''),

-- asset_usage_records 表
('asset_usage_records', 'quantity', 'BIGINT DEFAULT 0 COMMENT \'数量\''),
('asset_usage_records', 'purpose_id', 'BIGINT COMMENT \'用途 ID\''),
('asset_usage_records', 'asset_type', 'VARCHAR(50) COMMENT \'资产类型\''),
('asset_usage_records', 'purpose', 'VARCHAR(50) COMMENT \'用途\''),
('asset_usage_records', 'role_id', 'BIGINT COMMENT \'角色 ID\''),

-- role_equipment 表
('role_equipment', 'item_id', 'BIGINT COMMENT \'物品 ID\''),
('role_equipment', 'quantity', 'INT DEFAULT 1 COMMENT \'数量\''),
('role_equipment', 'acquired_at', 'DATETIME COMMENT \'获得时间\''),
('role_equipment', 'equip_time', 'DATETIME COMMENT \'装备时间\''),
('role_equipment', 'slot_id', 'INT COMMENT \'槽位 ID\''),

-- cfg_realm_breakthrough 表
('cfg_realm_breakthrough', 'from_realm', 'VARCHAR(50) COMMENT \'原境界\''),
('cfg_realm_breakthrough', 'to_realm', 'VARCHAR(50) COMMENT \'新境界\''),
('cfg_realm_breakthrough', 'xiuwei_requirement', 'INT COMMENT \'修为要求\''),
('cfg_realm_breakthrough', 'pill_name', 'VARCHAR(100) COMMENT \'丹药名称\''),
('cfg_realm_breakthrough', 'success_rate', 'DECIMAL(5,2) COMMENT \'成功率\''),
('cfg_realm_breakthrough', 'failure_penalty', 'VARCHAR(100) COMMENT \'失败惩罚\''),

-- friends 表
('friends', 'remark', 'VARCHAR(100) COMMENT \'备注\''),
('friends', 'intimacy', 'INT DEFAULT 0 COMMENT \'亲密度\''),
('friends', 'block_status', 'TINYINT(1) DEFAULT 0 COMMENT \'屏蔽状态\''),

-- clans 表
('clans', 'level', 'INT DEFAULT 1 COMMENT \'等级\''),

-- cultivation_techniques 表
('cultivation_techniques', 'type', 'VARCHAR(50) COMMENT \'类型\''),

-- system_setting 表
('system_setting', 'description', 'VARCHAR(255) COMMENT \'描述\''),
('system_setting', 'updated_at', 'DATETIME COMMENT \'更新时间\''),

-- payment_record 表
('payment_record', 'amount', 'DECIMAL(10,2) COMMENT \'金额\''),
('payment_record', 'currency', 'VARCHAR(20) COMMENT \'货币\''),
('payment_record', 'status', 'VARCHAR(20) COMMENT \'状态\''),
('payment_record', 'payment_time', 'DATETIME COMMENT \'支付时间\''),
('payment_record', 'payment_method', 'VARCHAR(50) COMMENT \'支付方式\''),
('payment_record', 'transaction_id', 'VARCHAR(100) COMMENT \'交易 ID\''),

-- role_map_node 表
('role_map_node', 'current_x', 'INT DEFAULT 0 COMMENT \'X 坐标\''),
('role_map_node', 'current_y', 'INT DEFAULT 0 COMMENT \'Y 坐标\''),
('role_map_node', 'last_move_time', 'DATETIME COMMENT \'最后移动时间\''),
('role_map_node', 'map_id', 'BIGINT COMMENT \'地图 ID\''),

-- role_checkin 表
('role_checkin', 'last_checkin_time', 'DATETIME COMMENT \'最后签到时间\''),
('role_checkin', 'total_checkin_days', 'INT DEFAULT 0 COMMENT \'累计签到天数\''),
('role_checkin', 'checkin_count', 'INT DEFAULT 0 COMMENT \'签到次数\''),
('role_checkin', 'month', 'INT COMMENT \'月份\''),
('role_checkin', 'year', 'INT COMMENT \'年份\''),

-- sys_user 表
('sys_user', 'email', 'VARCHAR(100) COMMENT \'邮箱\''),
('sys_user', 'phone', 'VARCHAR(20) COMMENT \'手机\''),

-- shop_items 表
('shop_items', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\''),
('shop_items', 'discount', 'DECIMAL(5,2) COMMENT \'折扣\''),
('shop_items', 'purchase_limit', 'INT COMMENT \'购买限制\''),
('shop_items', 'shelf_status', 'TINYINT(1) DEFAULT 1 COMMENT \'上架状态\''),
('shop_items', 'category', 'VARCHAR(50) COMMENT \'分类\''),
('shop_items', 'icon', 'VARCHAR(255) COMMENT \'图标\''),

-- role_clan_skill 表
('role_clan_skill', 'skill_level', 'INT DEFAULT 1 COMMENT \'技能等级\''),
('role_clan_skill', 'learn_time', 'DATETIME COMMENT \'学习时间\''),
('role_clan_skill', 'proficiency', 'INT DEFAULT 0 COMMENT \'熟练度\''),
('role_clan_skill', 'is_equipped', 'TINYINT(1) DEFAULT 0 COMMENT \'是否装备\''),

-- verification_code 表
('verification_code', 'phone', 'VARCHAR(20) COMMENT \'手机\''),
('verification_code', 'code', 'VARCHAR(10) COMMENT \'验证码\''),
('verification_code', 'type', 'VARCHAR(20) COMMENT \'类型\''),
('verification_code', 'expire_at', 'DATETIME COMMENT \'过期时间\''),

-- body_mutation 表
('body_mutation', 'mutation_type', 'VARCHAR(50) COMMENT \'变异类型\''),
('body_mutation', 'description', 'TEXT COMMENT \'描述\''),

-- trade_record 表
('trade_record', 'seller_id', 'BIGINT COMMENT \'卖家 ID\''),
('trade_record', 'buyer_id', 'BIGINT COMMENT \'买家 ID\''),
('trade_record', 'item_id', 'BIGINT COMMENT \'物品 ID\''),
('trade_record', 'quantity', 'INT COMMENT \'数量\''),
('trade_record', 'price', 'DECIMAL(10,2) COMMENT \'价格\''),
('trade_record', 'status', 'VARCHAR(20) COMMENT \'状态\''),
('trade_record', 'trade_time', 'DATETIME COMMENT \'交易时间\''),

-- permission 表
('permission', 'permission_name', 'VARCHAR(100) COMMENT \'权限名称\''),
('permission', 'permission_code', 'VARCHAR(100) COMMENT \'权限代码\''),
('permission', 'description', 'TEXT COMMENT \'描述\''),
('permission', 'resource_type', 'VARCHAR(50) COMMENT \'资源类型\''),
('permission', 'resource_id', 'BIGINT COMMENT \'资源 ID\''),
('permission', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\''),

-- task 表
('task', 'task_difficulty', 'VARCHAR(20) DEFAULT \'normal\' COMMENT \'难度\''),
('task', 'min_level', 'INT DEFAULT 1 COMMENT \'最低等级\''),
('task', 'max_level', 'INT DEFAULT 100 COMMENT \'最高等级\''),
('task', 'repeat_count', 'INT DEFAULT 0 COMMENT \'重复次数\''),
('task', 'time_limit', 'INT COMMENT \'时间限制\''),
('task', 'task_type', 'VARCHAR(50) COMMENT \'任务类型\''),
('task', 'icon', 'VARCHAR(255) COMMENT \'图标\''),
('task', 'reward_items', 'TEXT COMMENT \'奖励物品\''),

-- role_item 表
('role_item', 'item_name', 'VARCHAR(255) COMMENT \'物品名称\''),
('role_item', 'item_type', 'VARCHAR(50) COMMENT \'物品类型\''),

-- clan_skill 表
('clan_skill', 'skill_name', 'VARCHAR(100) COMMENT \'技能名称\''),
('clan_skill', 'description', 'TEXT COMMENT \'描述\''),
('clan_skill', 'level_requirement', 'INT COMMENT \'等级要求\''),
('clan_skill', 'effect', 'TEXT COMMENT \'效果\''),
('clan_skill', 'icon', 'VARCHAR(255) COMMENT \'图标\''),
('clan_skill', 'type', 'VARCHAR(50) COMMENT \'类型\''),

-- sys_permission 表
('sys_permission', 'permission_name', 'VARCHAR(100) COMMENT \'权限名称\''),
('sys_permission', 'permission_code', 'VARCHAR(100) COMMENT \'权限代码\''),
('sys_permission', 'resource_type', 'VARCHAR(50) COMMENT \'资源类型\''),
('sys_permission', 'description', 'TEXT COMMENT \'描述\''),
('sys_permission', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\''),

-- cfg_pill_effect 表
('cfg_pill_effect', 'pill_name', 'VARCHAR(100) COMMENT \'丹药名称\''),
('cfg_pill_effect', 'effect_type', 'VARCHAR(50) COMMENT \'效果类型\''),
('cfg_pill_effect', 'effect_value', 'INT COMMENT \'效果值\''),
('cfg_pill_effect', 'duration', 'INT COMMENT \'持续时间\''),
('cfg_pill_effect', 'cooldown', 'INT COMMENT \'冷却时间\''),
('cfg_pill_effect', 'side_effect', 'TEXT COMMENT \'副作用\''),

-- sect_apply 表
('sect_apply', 'applicant_id', 'BIGINT COMMENT \'申请者 ID\''),
('sect_apply', 'sect_id', 'BIGINT COMMENT \'宗门 ID\''),
('sect_apply', 'apply_time', 'DATETIME COMMENT \'申请时间\''),
('sect_apply', 'status', 'VARCHAR(20) DEFAULT \'pending\' COMMENT \'状态\''),
('sect_apply', 'message', 'TEXT COMMENT \'消息\''),
('sect_apply', 'handler_id', 'BIGINT COMMENT \'处理者 ID\''),
('sect_apply', 'handle_time', 'DATETIME COMMENT \'处理时间\''),

-- gift 表
('gift', 'gift_name', 'VARCHAR(100) COMMENT \'礼物名称\''),
('gift', 'gift_type', 'VARCHAR(50) DEFAULT \'system\' COMMENT \'礼物类型\''),
('gift', 'priority', 'INT DEFAULT 0 COMMENT \'优先级\''),
('gift', 'valid_days', 'INT COMMENT \'有效天数\''),
('gift', 'icon', 'VARCHAR(255) COMMENT \'图标\''),
('gift', 'description', 'TEXT COMMENT \'描述\''),
('gift', 'rewards', 'TEXT COMMENT \'奖励\''),

-- role_realms 表
('role_realms', 'realm_name', 'VARCHAR(50) COMMENT \'境界名称\''),
('role_realms', 'realm_level', 'INT COMMENT \'境界等级\''),
('role_realms', 'total_cultivation', 'BIGINT COMMENT \'总修为\''),
('role_realms', 'realm_stage', 'INT DEFAULT 1 COMMENT \'境界阶段\''),
('role_realms', 'breakthrough_time', 'DATETIME COMMENT \'突破时间\''),

-- body_cultivation_material 表
('body_cultivation_material', 'material_name', 'VARCHAR(100) COMMENT \'材料名称\''),
('body_cultivation_material', 'material_type', 'VARCHAR(50) COMMENT \'材料类型\''),
('body_cultivation_material', 'effect', 'TEXT COMMENT \'效果\''),
('body_cultivation_material', 'rarity', 'INT DEFAULT 1 COMMENT \'稀有度\''),

-- system_log 表
('system_log', 'log_level', 'VARCHAR(20) COMMENT \'日志级别\''),
('system_log', 'logger_name', 'VARCHAR(100) COMMENT \'日志名称\''),
('system_log', 'message', 'TEXT COMMENT \'消息\''),
('system_log', 'exception', 'TEXT COMMENT \'异常\''),
('system_log', 'thread_name', 'VARCHAR(100) COMMENT \'线程名\''),
('system_log', 'log_time', 'DATETIME COMMENT \'日志时间\''),

-- game_user 表
('game_user', 'username', 'VARCHAR(100) COMMENT \'用户名\''),
('game_user', 'password', 'VARCHAR(255) COMMENT \'密码\''),
('game_user', 'email', 'VARCHAR(100) COMMENT \'邮箱\''),
('game_user', 'phone', 'VARCHAR(20) COMMENT \'手机\''),
('game_user', 'status', 'INT DEFAULT 1 COMMENT \'状态\''),
('game_user', 'last_login_time', 'DATETIME COMMENT \'最后登录时间\''),
('game_user', 'create_time', 'DATETIME COMMENT \'创建时间\''),

-- role_task 表
('role_task', 'task_type', 'VARCHAR(50) COMMENT \'任务类型\''),
('role_task', 'reward_claimed', 'TINYINT(1) DEFAULT 0 COMMENT \'奖励已领取\''),

-- achievement 表
('achievement', 'reward_attributes', 'TEXT COMMENT \'奖励属性\''),
('achievement', 'rewards', 'TEXT COMMENT \'奖励\''),
('achievement', 'icon', 'VARCHAR(255) COMMENT \'图标\''),
('achievement', 'name', 'VARCHAR(100) COMMENT \'名称\''),
('achievement', 'type', 'VARCHAR(50) COMMENT \'类型\''),
('achievement', 'rarity', 'INT DEFAULT 1 COMMENT \'稀有度\''),
('achievement', '`condition`', 'TEXT COMMENT \'条件\''),
('achievement', 'status', 'VARCHAR(20) DEFAULT \'active\' COMMENT \'状态\''),
('achievement', 'condition_type', 'VARCHAR(50) COMMENT \'条件类型\''),
('achievement', 'hidden', 'TINYINT(1) DEFAULT 0 COMMENT \'隐藏\''),
('achievement', 'title', 'VARCHAR(200) COMMENT \'标题\''),
('achievement', 'module_type', 'VARCHAR(50) COMMENT \'模块类型\''),
('achievement', 'operator', 'VARCHAR(10) COMMENT \'操作符\''),
('achievement', 'threshold', 'BIGINT COMMENT \'阈值\''),
('achievement', 'sort_order', 'INT DEFAULT 0 COMMENT \'排序\''),
('achievement', 'description', 'TEXT COMMENT \'描述\''),

-- item 表
('item', 'item_level', 'INT DEFAULT 1 COMMENT \'物品等级\''),
('item', 'quality', 'VARCHAR(20) DEFAULT \'common\' COMMENT \'品质\''),
('item', 'icon', 'VARCHAR(255) COMMENT \'图标\''),
('item', 'max_stack_size', 'INT DEFAULT 99 COMMENT \'最大堆叠数\''),
('item', 'sell_price', 'INT COMMENT \'出售价格\''),

-- role_achievement 表
('role_achievement', 'completed_at', 'DATETIME COMMENT \'完成时间\''),
('role_achievement', 'reward_claimed', 'TINYINT(1) DEFAULT 0 COMMENT \'奖励已领取\''),
('role_achievement', 'progress', 'INT DEFAULT 0 COMMENT \'进度\''),
('role_achievement', 'status', 'VARCHAR(20) DEFAULT \'in_progress\' COMMENT \'状态\''),
('role_achievement', 'achievement_id', 'BIGINT COMMENT \'成就 ID\''),
('role_achievement', 'role_id', 'BIGINT COMMENT \'角色 ID\''),
('role_achievement', 'created_at', 'DATETIME COMMENT \'创建时间\''),
('role_achievement', 'updated_at', 'DATETIME COMMENT \'更新时间\'');

-- 创建游标来遍历并添加字段
DROP PROCEDURE IF EXISTS process_columns;
DELIMITER $$
CREATE PROCEDURE process_columns()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE tbl_name VARCHAR(100);
    DECLARE col_name VARCHAR(100);
    DECLARE col_def VARCHAR(500);
    DECLARE col_exists INT;
    DECLARE sql_stmt TEXT;
    
    -- 声明游标
    DECLARE cur CURSOR FOR SELECT table_name, column_name, column_definition FROM _columns_to_add;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN cur;
    
    read_loop: LOOP
        FETCH cur INTO tbl_name, col_name, col_def;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- 检查列是否存在 (使用更可靠的方法)
        SET col_exists = 0;
        SELECT COUNT(*) INTO col_exists
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = tbl_name
          AND (COLUMN_NAME = col_name OR COLUMN_NAME = TRIM(BOTH '`' FROM col_name));
        
        -- 如果列不存在，则添加
        IF col_exists = 0 THEN
            SET sql_stmt = CONCAT('ALTER TABLE ', tbl_name, ' ADD COLUMN ', col_name, ' ', col_def);
            BEGIN
                DECLARE EXIT HANDLER FOR SQLEXCEPTION
                BEGIN
                    SELECT CONCAT('⚠️ 添加 ', tbl_name, '.', col_name, ' 失败') AS result;
                END;
                
                PREPARE stmt FROM sql_stmt;
                EXECUTE stmt;
                DEALLOCATE PREPARE stmt;
                SELECT CONCAT('✓ 已添加 ', tbl_name, '.', col_name) AS result;
            END;
        ELSE
            SELECT CONCAT('⊕ 已跳过 ', tbl_name, '.', col_name, ' (字段已存在)') AS result;
        END IF;
    END LOOP;
    
    CLOSE cur;
END$$
DELIMITER ;

-- 执行存储过程
CALL process_columns();

-- 清理
DROP PROCEDURE IF EXISTS process_columns;
DROP TABLE IF EXISTS _columns_to_add;

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ 数据库字段修复完成！所有字段已智能检测并安全添加。' AS message;
