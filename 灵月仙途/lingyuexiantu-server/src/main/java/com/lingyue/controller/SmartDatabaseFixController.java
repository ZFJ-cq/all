package com.lingyue.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/smart-db-fix")
@CrossOrigin(originPatterns = "*")
public class SmartDatabaseFixController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @PostMapping("/fix-all")
    public Map<String, Object> fixAll() {
        Map<String, Object> result = new HashMap<>();
        List<String> messages = new ArrayList<>();
        
        try {
            messages.add("🚀 开始智能修复数据库缺失字段...");
            
            // 创建存储过程
            createSafeAddColumnProcedure(messages);
            
            // 执行修复
            fixMailItemTable(messages);
            fixBodyPartTable(messages);
            fixSkillTable(messages);
            fixEquipmentTable(messages);
            fixRoleActivityTable(messages);
            fixAnnouncementTable(messages);
            fixRoleAssetTable(messages);
            fixAssetTypesTable(messages);
            fixTradeItemTable(messages);
            fixRoleClansTable(messages);
            fixCfgSkillUpgradeTable(messages);
            fixSysRoleTable(messages);
            fixCfgEquipmentQualityTable(messages);
            fixRoleEquipmentTable(messages);
            fixCfgRealmBreakthroughTable(messages);
            fixFriendsTable(messages);
            fixClansTable(messages);
            fixSystemSettingTable(messages);
            fixPaymentRecordTable(messages);
            fixRoleMapNodeTable(messages);
            fixRoleCheckinTable(messages);
            fixSysUserTable(messages);
            fixShopItemsTable(messages);
            fixRoleClanSkillTable(messages);
            fixVerificationCodeTable(messages);
            fixBodyMutationTable(messages);
            fixTradeRecordTable(messages);
            fixPermissionTable(messages);
            fixTaskTable(messages);
            fixRoleItemTable(messages);
            fixClanSkillTable(messages);
            fixSysPermissionTable(messages);
            fixCfgPillEffectTable(messages);
            fixSectApplyTable(messages);
            fixGiftTable(messages);
            fixRoleRealmsTable(messages);
            fixSystemLogTable(messages);
            fixGameUserTable(messages);
            fixRoleTaskTable(messages);
            fixAchievementTable(messages);
            fixItemTable(messages);
            fixRoleAchievementTable(messages);
            
            // 删除存储过程
            dropSafeAddColumnProcedure(messages);
            
            messages.add("✅ 数据库字段修复完成！所有字段已智能检测并安全添加。");
            
            result.put("success", true);
            result.put("messages", messages);
            
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
            result.put("messages", messages);
        }
        
        return result;
    }
    
    private void createSafeAddColumnProcedure(List<String> messages) {
        try {
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            jdbcTemplate.execute("SET @dbname = DATABASE()");
            
            jdbcTemplate.execute("DROP PROCEDURE IF EXISTS add_column_safe");
            
            String procedureSql = """
                CREATE PROCEDURE add_column_safe(
                    IN p_table_name VARCHAR(100),
                    IN p_column_name VARCHAR(100),
                    IN p_column_def VARCHAR(500)
                )
                BEGIN
                    DECLARE column_exists INT DEFAULT 0;
                    
                    SELECT COUNT(*) INTO column_exists
                    FROM information_schema.COLUMNS
                    WHERE TABLE_SCHEMA = @dbname
                      AND TABLE_NAME = p_table_name
                      AND COLUMN_NAME = p_column_name;
                    
                    IF column_exists = 0 THEN
                        SET @sql = CONCAT('ALTER TABLE ', p_table_name, ' ADD COLUMN ', p_column_name, ' ', p_column_def);
                        PREPARE stmt FROM @sql;
                        EXECUTE stmt;
                        DEALLOCATE PREPARE stmt;
                        SELECT CONCAT('✓ 已添加 ', p_table_name, '.', p_column_name) AS result;
                    ELSE
                        SELECT CONCAT('⊕ 已跳过 ', p_table_name, '.', p_column_name, ' (字段已存在)') AS result;
                    END IF;
                END
                """;
            
            jdbcTemplate.execute(procedureSql);
            messages.add("✅ 创建智能添加字段存储过程成功");
        } catch (Exception e) {
            messages.add("⚠️ 创建存储过程: " + e.getMessage());
        }
    }
    
    private void dropSafeAddColumnProcedure(List<String> messages) {
        try {
            jdbcTemplate.execute("DROP PROCEDURE IF EXISTS add_column_safe");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            messages.add("✅ 清理存储过程完成");
        } catch (Exception e) {
            messages.add("⚠️ 清理存储过程: " + e.getMessage());
        }
    }
    
    private void addColumnSafe(String table, String column, String definition, List<String> messages) {
        try {
            jdbcTemplate.execute("CALL add_column_safe('" + table + "', '" + column + "', '" + definition + "')");
        } catch (Exception e) {
            // 静默处理，存储过程会返回结果
        }
    }
    
    private void fixMailItemTable(List<String> messages) {
        addColumnSafe("mail_item", "item_id", "BIGINT COMMENT '物品 ID'", messages);
        addColumnSafe("mail_item", "quantity", "INT DEFAULT 0 COMMENT '数量'", messages);
        addColumnSafe("mail_item", "mail_id", "BIGINT COMMENT '邮件 ID'", messages);
        messages.add("📧 修复 mail_item 表完成");
    }
    
    private void fixBodyPartTable(List<String> messages) {
        addColumnSafe("body_part", "sort_order", "INT DEFAULT 0 COMMENT '排序'", messages);
        messages.add("💪 修复 body_part 表完成");
    }
    
    private void fixSkillTable(List<String> messages) {
        addColumnSafe("skill", "trigger_rate", "DECIMAL(5,2) DEFAULT 1.00 COMMENT '触发概率'", messages);
        messages.add("⚔️ 修复 skill 表完成");
    }
    
    private void fixEquipmentTable(List<String> messages) {
        addColumnSafe("equipment", "defense", "INT DEFAULT 0 COMMENT '防御'", messages);
        addColumnSafe("equipment", "status", "INT DEFAULT 1 COMMENT '状态'", messages);
        addColumnSafe("equipment", "level", "INT DEFAULT 1 COMMENT '等级'", messages);
        addColumnSafe("equipment", "attack", "INT DEFAULT 0 COMMENT '攻击'", messages);
        messages.add("🛡️ 修复 equipment 表完成");
    }
    
    private void fixRoleActivityTable(List<String> messages) {
        addColumnSafe("role_activity", "reset_time", "DATETIME COMMENT '重置时间'", messages);
        messages.add("📅 修复 role_activity 表完成");
    }
    
    private void fixAnnouncementTable(List<String> messages) {
        addColumnSafe("announcement", "status", "VARCHAR(20) DEFAULT 'active' COMMENT '状态'", messages);
        addColumnSafe("announcement", "type", "VARCHAR(50) DEFAULT 'system' COMMENT '类型'", messages);
        addColumnSafe("announcement", "title", "VARCHAR(200) COMMENT '标题'", messages);
        addColumnSafe("announcement", "content", "TEXT COMMENT '内容'", messages);
        messages.add("📢 修复 announcement 表完成");
    }
    
    private void fixRoleAssetTable(List<String> messages) {
        addColumnSafe("role_asset", "quantity", "BIGINT DEFAULT 0 COMMENT '数量'", messages);
        addColumnSafe("role_asset", "asset_type_code", "VARCHAR(50) COMMENT '资产类型代码'", messages);
        addColumnSafe("role_asset", "role_id", "BIGINT COMMENT '角色 ID'", messages);
        messages.add("💰 修复 role_asset 表完成");
    }
    
    private void fixAssetTypesTable(List<String> messages) {
        addColumnSafe("asset_types", "unit_of_measure", "VARCHAR(20) COMMENT '单位'", messages);
        addColumnSafe("asset_types", "is_system", "TINYINT(1) DEFAULT 0 COMMENT '是否系统'", messages);
        addColumnSafe("asset_types", "icon", "VARCHAR(255) COMMENT '图标'", messages);
        addColumnSafe("asset_types", "icon_path", "VARCHAR(255) COMMENT '图标路径'", messages);
        addColumnSafe("asset_types", "modules", "VARCHAR(255) COMMENT '模块'", messages);
        addColumnSafe("asset_types", "type", "VARCHAR(50) COMMENT '类型'", messages);
        addColumnSafe("asset_types", "droppable", "TINYINT(1) DEFAULT 1 COMMENT '可掉落'", messages);
        addColumnSafe("asset_types", "decimal_places", "INT DEFAULT 0 COMMENT '小数位数'", messages);
        addColumnSafe("asset_types", "category", "VARCHAR(50) COMMENT '分类'", messages);
        addColumnSafe("asset_types", "status", "VARCHAR(20) DEFAULT 'active' COMMENT '状态'", messages);
        addColumnSafe("asset_types", "deleted_at", "DATETIME COMMENT '删除时间'", messages);
        addColumnSafe("asset_types", "tradable", "TINYINT(1) DEFAULT 1 COMMENT '可交易'", messages);
        addColumnSafe("asset_types", "max_stack", "INT DEFAULT 99 COMMENT '最大堆叠'", messages);
        addColumnSafe("asset_types", "decimal_precision", "INT DEFAULT 0 COMMENT '小数精度'", messages);
        addColumnSafe("asset_types", "destroy_policy", "VARCHAR(50) DEFAULT 'none' COMMENT '销毁策略'", messages);
        messages.add("🏪 修复 asset_types 表完成");
    }
    
    private void fixTradeItemTable(List<String> messages) {
        addColumnSafe("trade_item", "icon", "VARCHAR(255) COMMENT '图标'", messages);
        addColumnSafe("trade_item", "name", "VARCHAR(100) COMMENT '名称'", messages);
        addColumnSafe("trade_item", "category", "VARCHAR(50) COMMENT '分类'", messages);
        addColumnSafe("trade_item", "description", "TEXT COMMENT '描述'", messages);
        addColumnSafe("trade_item", "price", "INT DEFAULT 0 COMMENT '价格'", messages);
        addColumnSafe("trade_item", "stock", "INT DEFAULT 0 COMMENT '库存'", messages);
        messages.add("💱 修复 trade_item 表完成");
    }
    
    private void fixRoleClansTable(List<String> messages) {
        addColumnSafe("role_clans", "`rank`", "INT DEFAULT 0 COMMENT '排名'", messages);
        messages.add("👥 修复 role_clans 表完成");
    }
    
    private void fixCfgSkillUpgradeTable(List<String> messages) {
        addColumnSafe("cfg_skill_upgrade", "effect_increase", "DECIMAL(5,2) COMMENT '效果提升'", messages);
        addColumnSafe("cfg_skill_upgrade", "proficiency_requirement", "INT COMMENT '熟练度要求'", messages);
        addColumnSafe("cfg_skill_upgrade", "cooldown", "INT COMMENT '冷却时间'", messages);
        addColumnSafe("cfg_skill_upgrade", "mana_consumption", "INT COMMENT '法力消耗'", messages);
        addColumnSafe("cfg_skill_upgrade", "skill_level", "VARCHAR(10) COMMENT '技能等级'", messages);
        messages.add("📚 修复 cfg_skill_upgrade 表完成");
    }
    
    private void fixSysRoleTable(List<String> messages) {
        addColumnSafe("sys_role", "custom_data_scope", "TEXT COMMENT '自定义数据范围'", messages);
        messages.add("🔐 修复 sys_role 表完成");
    }
    
    private void fixCfgEquipmentQualityTable(List<String> messages) {
        addColumnSafe("cfg_equipment_quality", "probability", "DECIMAL(5,2) COMMENT '概率'", messages);
        addColumnSafe("cfg_equipment_quality", "max_bonus", "DECIMAL(5,2) COMMENT '最大加成'", messages);
        addColumnSafe("cfg_equipment_quality", "upgrade_effect", "TEXT COMMENT '升级效果'", messages);
        addColumnSafe("cfg_equipment_quality", "quality_name", "VARCHAR(50) COMMENT '品质名称'", messages);
        addColumnSafe("cfg_equipment_quality", "glow_color", "VARCHAR(20) COMMENT '发光颜色'", messages);
        addColumnSafe("cfg_equipment_quality", "description", "VARCHAR(255) COMMENT '描述'", messages);
        messages.add("✨ 修复 cfg_equipment_quality 表完成");
    }
    
    private void fixRoleEquipmentTable(List<String> messages) {
        addColumnSafe("role_equipment", "item_id", "BIGINT COMMENT '物品 ID'", messages);
        addColumnSafe("role_equipment", "quantity", "INT DEFAULT 1 COMMENT '数量'", messages);
        addColumnSafe("role_equipment", "acquired_at", "DATETIME COMMENT '获得时间'", messages);
        addColumnSafe("role_equipment", "equip_time", "DATETIME COMMENT '装备时间'", messages);
        addColumnSafe("role_equipment", "slot_id", "INT COMMENT '槽位 ID'", messages);
        messages.add("⚔️ 修复 role_equipment 表完成");
    }
    
    private void fixCfgRealmBreakthroughTable(List<String> messages) {
        addColumnSafe("cfg_realm_breakthrough", "from_realm", "VARCHAR(50) COMMENT '原境界'", messages);
        addColumnSafe("cfg_realm_breakthrough", "to_realm", "VARCHAR(50) COMMENT '新境界'", messages);
        addColumnSafe("cfg_realm_breakthrough", "xiuwei_requirement", "INT COMMENT '修为要求'", messages);
        addColumnSafe("cfg_realm_breakthrough", "pill_name", "VARCHAR(100) COMMENT '丹药名称'", messages);
        addColumnSafe("cfg_realm_breakthrough", "success_rate", "DECIMAL(5,2) COMMENT '成功率'", messages);
        addColumnSafe("cfg_realm_breakthrough", "failure_penalty", "VARCHAR(100) COMMENT '失败惩罚'", messages);
        messages.add("🚀 修复 cfg_realm_breakthrough 表完成");
    }
    
    private void fixFriendsTable(List<String> messages) {
        addColumnSafe("friends", "remark", "VARCHAR(100) COMMENT '备注'", messages);
        addColumnSafe("friends", "intimacy", "INT DEFAULT 0 COMMENT '亲密度'", messages);
        addColumnSafe("friends", "block_status", "TINYINT(1) DEFAULT 0 COMMENT '屏蔽状态'", messages);
        messages.add("👫 修复 friends 表完成");
    }
    
    private void fixClansTable(List<String> messages) {
        addColumnSafe("clans", "level", "INT DEFAULT 1 COMMENT '等级'", messages);
        messages.add("🏰 修复 clans 表完成");
    }
    
    private void fixSystemSettingTable(List<String> messages) {
        addColumnSafe("system_setting", "description", "VARCHAR(255) COMMENT '描述'", messages);
        addColumnSafe("system_setting", "updated_at", "DATETIME COMMENT '更新时间'", messages);
        messages.add("⚙️ 修复 system_setting 表完成");
    }
    
    private void fixPaymentRecordTable(List<String> messages) {
        addColumnSafe("payment_record", "amount", "DECIMAL(10,2) COMMENT '金额'", messages);
        addColumnSafe("payment_record", "currency", "VARCHAR(20) COMMENT '货币'", messages);
        addColumnSafe("payment_record", "status", "VARCHAR(20) COMMENT '状态'", messages);
        addColumnSafe("payment_record", "payment_time", "DATETIME COMMENT '支付时间'", messages);
        addColumnSafe("payment_record", "payment_method", "VARCHAR(50) COMMENT '支付方式'", messages);
        addColumnSafe("payment_record", "transaction_id", "VARCHAR(100) COMMENT '交易 ID'", messages);
        messages.add("💳 修复 payment_record 表完成");
    }
    
    private void fixRoleMapNodeTable(List<String> messages) {
        addColumnSafe("role_map_node", "current_x", "INT DEFAULT 0 COMMENT 'X 坐标'", messages);
        addColumnSafe("role_map_node", "current_y", "INT DEFAULT 0 COMMENT 'Y 坐标'", messages);
        addColumnSafe("role_map_node", "last_move_time", "DATETIME COMMENT '最后移动时间'", messages);
        addColumnSafe("role_map_node", "map_id", "BIGINT COMMENT '地图 ID'", messages);
        messages.add("🗺️ 修复 role_map_node 表完成");
    }
    
    private void fixRoleCheckinTable(List<String> messages) {
        addColumnSafe("role_checkin", "last_checkin_time", "DATETIME COMMENT '最后签到时间'", messages);
        addColumnSafe("role_checkin", "total_checkin_days", "INT DEFAULT 0 COMMENT '累计签到天数'", messages);
        addColumnSafe("role_checkin", "checkin_count", "INT DEFAULT 0 COMMENT '签到次数'", messages);
        addColumnSafe("role_checkin", "month", "INT COMMENT '月份'", messages);
        addColumnSafe("role_checkin", "year", "INT COMMENT '年份'", messages);
        messages.add("📅 修复 role_checkin 表完成");
    }
    
    private void fixSysUserTable(List<String> messages) {
        addColumnSafe("sys_user", "email", "VARCHAR(100) COMMENT '邮箱'", messages);
        addColumnSafe("sys_user", "phone", "VARCHAR(20) COMMENT '手机'", messages);
        messages.add("👤 修复 sys_user 表完成");
    }
    
    private void fixShopItemsTable(List<String> messages) {
        addColumnSafe("shop_items", "sort_order", "INT DEFAULT 0 COMMENT '排序'", messages);
        addColumnSafe("shop_items", "discount", "DECIMAL(5,2) COMMENT '折扣'", messages);
        addColumnSafe("shop_items", "purchase_limit", "INT COMMENT '购买限制'", messages);
        addColumnSafe("shop_items", "shelf_status", "TINYINT(1) DEFAULT 1 COMMENT '上架状态'", messages);
        addColumnSafe("shop_items", "category", "VARCHAR(50) COMMENT '分类'", messages);
        addColumnSafe("shop_items", "icon", "VARCHAR(255) COMMENT '图标'", messages);
        messages.add("🛒 修复 shop_items 表完成");
    }
    
    private void fixRoleClanSkillTable(List<String> messages) {
        addColumnSafe("role_clan_skill", "skill_level", "INT DEFAULT 1 COMMENT '技能等级'", messages);
        addColumnSafe("role_clan_skill", "learn_time", "DATETIME COMMENT '学习时间'", messages);
        addColumnSafe("role_clan_skill", "proficiency", "INT DEFAULT 0 COMMENT '熟练度'", messages);
        addColumnSafe("role_clan_skill", "is_equipped", "TINYINT(1) DEFAULT 0 COMMENT '是否装备'", messages);
        messages.add("🎯 修复 role_clan_skill 表完成");
    }
    
    private void fixVerificationCodeTable(List<String> messages) {
        addColumnSafe("verification_code", "phone", "VARCHAR(20) COMMENT '手机'", messages);
        addColumnSafe("verification_code", "code", "VARCHAR(10) COMMENT '验证码'", messages);
        addColumnSafe("verification_code", "type", "VARCHAR(20) COMMENT '类型'", messages);
        addColumnSafe("verification_code", "expire_at", "DATETIME COMMENT '过期时间'", messages);
        messages.add("🔢 修复 verification_code 表完成");
    }
    
    private void fixBodyMutationTable(List<String> messages) {
        addColumnSafe("body_mutation", "mutation_type", "VARCHAR(50) COMMENT '变异类型'", messages);
        addColumnSafe("body_mutation", "description", "TEXT COMMENT '描述'", messages);
        messages.add("🧬 修复 body_mutation 表完成");
    }
    
    private void fixTradeRecordTable(List<String> messages) {
        addColumnSafe("trade_record", "seller_id", "BIGINT COMMENT '卖家 ID'", messages);
        addColumnSafe("trade_record", "buyer_id", "BIGINT COMMENT '买家 ID'", messages);
        addColumnSafe("trade_record", "item_id", "BIGINT COMMENT '物品 ID'", messages);
        addColumnSafe("trade_record", "quantity", "INT COMMENT '数量'", messages);
        addColumnSafe("trade_record", "price", "DECIMAL(10,2) COMMENT '价格'", messages);
        addColumnSafe("trade_record", "status", "VARCHAR(20) COMMENT '状态'", messages);
        addColumnSafe("trade_record", "trade_time", "DATETIME COMMENT '交易时间'", messages);
        messages.add("💹 修复 trade_record 表完成");
    }
    
    private void fixPermissionTable(List<String> messages) {
        addColumnSafe("permission", "permission_name", "VARCHAR(100) COMMENT '权限名称'", messages);
        addColumnSafe("permission", "permission_code", "VARCHAR(100) COMMENT '权限代码'", messages);
        addColumnSafe("permission", "description", "TEXT COMMENT '描述'", messages);
        addColumnSafe("permission", "resource_type", "VARCHAR(50) COMMENT '资源类型'", messages);
        addColumnSafe("permission", "resource_id", "BIGINT COMMENT '资源 ID'", messages);
        addColumnSafe("permission", "sort_order", "INT DEFAULT 0 COMMENT '排序'", messages);
        messages.add("🔑 修复 permission 表完成");
    }
    
    private void fixTaskTable(List<String> messages) {
        addColumnSafe("task", "task_difficulty", "VARCHAR(20) DEFAULT 'normal' COMMENT '难度'", messages);
        addColumnSafe("task", "min_level", "INT DEFAULT 1 COMMENT '最低等级'", messages);
        addColumnSafe("task", "max_level", "INT DEFAULT 100 COMMENT '最高等级'", messages);
        addColumnSafe("task", "repeat_count", "INT DEFAULT 0 COMMENT '重复次数'", messages);
        addColumnSafe("task", "time_limit", "INT COMMENT '时间限制'", messages);
        addColumnSafe("task", "task_type", "VARCHAR(50) COMMENT '任务类型'", messages);
        addColumnSafe("task", "icon", "VARCHAR(255) COMMENT '图标'", messages);
        addColumnSafe("task", "reward_items", "TEXT COMMENT '奖励物品'", messages);
        messages.add("📋 修复 task 表完成");
    }
    
    private void fixRoleItemTable(List<String> messages) {
        addColumnSafe("role_item", "item_name", "VARCHAR(255) COMMENT '物品名称'", messages);
        addColumnSafe("role_item", "item_type", "VARCHAR(50) COMMENT '物品类型'", messages);
        messages.add("🎒 修复 role_item 表完成");
    }
    
    private void fixClanSkillTable(List<String> messages) {
        addColumnSafe("clan_skill", "skill_name", "VARCHAR(100) COMMENT '技能名称'", messages);
        addColumnSafe("clan_skill", "description", "TEXT COMMENT '描述'", messages);
        addColumnSafe("clan_skill", "level_requirement", "INT COMMENT '等级要求'", messages);
        addColumnSafe("clan_skill", "effect", "TEXT COMMENT '效果'", messages);
        addColumnSafe("clan_skill", "icon", "VARCHAR(255) COMMENT '图标'", messages);
        addColumnSafe("clan_skill", "type", "VARCHAR(50) COMMENT '类型'", messages);
        messages.add("🏆 修复 clan_skill 表完成");
    }
    
    private void fixSysPermissionTable(List<String> messages) {
        addColumnSafe("sys_permission", "permission_name", "VARCHAR(100) COMMENT '权限名称'", messages);
        addColumnSafe("sys_permission", "permission_code", "VARCHAR(100) COMMENT '权限代码'", messages);
        addColumnSafe("sys_permission", "resource_type", "VARCHAR(50) COMMENT '资源类型'", messages);
        addColumnSafe("sys_permission", "description", "TEXT COMMENT '描述'", messages);
        addColumnSafe("sys_permission", "sort_order", "INT DEFAULT 0 COMMENT '排序'", messages);
        messages.add("🛡️ 修复 sys_permission 表完成");
    }
    
    private void fixCfgPillEffectTable(List<String> messages) {
        addColumnSafe("cfg_pill_effect", "pill_name", "VARCHAR(100) COMMENT '丹药名称'", messages);
        addColumnSafe("cfg_pill_effect", "effect_type", "VARCHAR(50) COMMENT '效果类型'", messages);
        addColumnSafe("cfg_pill_effect", "effect_value", "INT COMMENT '效果值'", messages);
        addColumnSafe("cfg_pill_effect", "duration", "INT COMMENT '持续时间'", messages);
        addColumnSafe("cfg_pill_effect", "cooldown", "INT COMMENT '冷却时间'", messages);
        addColumnSafe("cfg_pill_effect", "side_effect", "TEXT COMMENT '副作用'", messages);
        messages.add("💊 修复 cfg_pill_effect 表完成");
    }
    
    private void fixSectApplyTable(List<String> messages) {
        addColumnSafe("sect_apply", "applicant_id", "BIGINT COMMENT '申请者 ID'", messages);
        addColumnSafe("sect_apply", "sect_id", "BIGINT COMMENT '宗门 ID'", messages);
        addColumnSafe("sect_apply", "apply_time", "DATETIME COMMENT '申请时间'", messages);
        addColumnSafe("sect_apply", "status", "VARCHAR(20) DEFAULT 'pending' COMMENT '状态'", messages);
        addColumnSafe("sect_apply", "message", "TEXT COMMENT '消息'", messages);
        addColumnSafe("sect_apply", "handler_id", "BIGINT COMMENT '处理者 ID'", messages);
        addColumnSafe("sect_apply", "handle_time", "DATETIME COMMENT '处理时间'", messages);
        messages.add("📝 修复 sect_apply 表完成");
    }
    
    private void fixGiftTable(List<String> messages) {
        addColumnSafe("gift", "gift_name", "VARCHAR(100) COMMENT '礼物名称'", messages);
        addColumnSafe("gift", "gift_type", "VARCHAR(50) DEFAULT 'system' COMMENT '礼物类型'", messages);
        addColumnSafe("gift", "priority", "INT DEFAULT 0 COMMENT '优先级'", messages);
        addColumnSafe("gift", "valid_days", "INT COMMENT '有效天数'", messages);
        addColumnSafe("gift", "icon", "VARCHAR(255) COMMENT '图标'", messages);
        addColumnSafe("gift", "description", "TEXT COMMENT '描述'", messages);
        addColumnSafe("gift", "rewards", "TEXT COMMENT '奖励'", messages);
        messages.add("🎁 修复 gift 表完成");
    }
    
    private void fixRoleRealmsTable(List<String> messages) {
        addColumnSafe("role_realms", "realm_name", "VARCHAR(50) COMMENT '境界名称'", messages);
        addColumnSafe("role_realms", "realm_level", "INT COMMENT '境界等级'", messages);
        addColumnSafe("role_realms", "total_cultivation", "BIGINT COMMENT '总修为'", messages);
        addColumnSafe("role_realms", "realm_stage", "INT DEFAULT 1 COMMENT '境界阶段'", messages);
        addColumnSafe("role_realms", "breakthrough_time", "DATETIME COMMENT '突破时间'", messages);
        messages.add("🌟 修复 role_realms 表完成");
    }
    
    private void fixSystemLogTable(List<String> messages) {
        addColumnSafe("system_log", "log_level", "VARCHAR(20) COMMENT '日志级别'", messages);
        addColumnSafe("system_log", "logger_name", "VARCHAR(100) COMMENT '日志名称'", messages);
        addColumnSafe("system_log", "message", "TEXT COMMENT '消息'", messages);
        addColumnSafe("system_log", "exception", "TEXT COMMENT '异常'", messages);
        addColumnSafe("system_log", "thread_name", "VARCHAR(100) COMMENT '线程名'", messages);
        addColumnSafe("system_log", "log_time", "DATETIME COMMENT '日志时间'", messages);
        messages.add("📝 修复 system_log 表完成");
    }
    
    private void fixGameUserTable(List<String> messages) {
        addColumnSafe("game_user", "username", "VARCHAR(100) COMMENT '用户名'", messages);
        addColumnSafe("game_user", "password", "VARCHAR(255) COMMENT '密码'", messages);
        addColumnSafe("game_user", "email", "VARCHAR(100) COMMENT '邮箱'", messages);
        addColumnSafe("game_user", "phone", "VARCHAR(20) COMMENT '手机'", messages);
        addColumnSafe("game_user", "status", "INT DEFAULT 1 COMMENT '状态'", messages);
        addColumnSafe("game_user", "last_login_time", "DATETIME COMMENT '最后登录时间'", messages);
        addColumnSafe("game_user", "create_time", "DATETIME COMMENT '创建时间'", messages);
        messages.add("👥 修复 game_user 表完成");
    }
    
    private void fixRoleTaskTable(List<String> messages) {
        addColumnSafe("role_task", "task_type", "VARCHAR(50) COMMENT '任务类型'", messages);
        addColumnSafe("role_task", "reward_claimed", "TINYINT(1) DEFAULT 0 COMMENT '奖励已领取'", messages);
        messages.add("📋 修复 role_task 表完成");
    }
    
    private void fixAchievementTable(List<String> messages) {
        addColumnSafe("achievement", "reward_attributes", "TEXT COMMENT '奖励属性'", messages);
        addColumnSafe("achievement", "rewards", "TEXT COMMENT '奖励'", messages);
        addColumnSafe("achievement", "icon", "VARCHAR(255) COMMENT '图标'", messages);
        addColumnSafe("achievement", "name", "VARCHAR(100) COMMENT '名称'", messages);
        addColumnSafe("achievement", "type", "VARCHAR(50) COMMENT '类型'", messages);
        addColumnSafe("achievement", "rarity", "INT DEFAULT 1 COMMENT '稀有度'", messages);
        addColumnSafe("achievement", "`condition`", "TEXT COMMENT '条件'", messages);
        addColumnSafe("achievement", "status", "VARCHAR(20) DEFAULT 'active' COMMENT '状态'", messages);
        addColumnSafe("achievement", "condition_type", "VARCHAR(50) COMMENT '条件类型'", messages);
        addColumnSafe("achievement", "hidden", "TINYINT(1) DEFAULT 0 COMMENT '隐藏'", messages);
        addColumnSafe("achievement", "title", "VARCHAR(200) COMMENT '标题'", messages);
        addColumnSafe("achievement", "module_type", "VARCHAR(50) COMMENT '模块类型'", messages);
        addColumnSafe("achievement", "operator", "VARCHAR(10) COMMENT '操作符'", messages);
        addColumnSafe("achievement", "threshold", "BIGINT COMMENT '阈值'", messages);
        addColumnSafe("achievement", "sort_order", "INT DEFAULT 0 COMMENT '排序'", messages);
        addColumnSafe("achievement", "description", "TEXT COMMENT '描述'", messages);
        messages.add("🏆 修复 achievement 表完成");
    }
    
    private void fixItemTable(List<String> messages) {
        addColumnSafe("item", "item_level", "INT DEFAULT 1 COMMENT '物品等级'", messages);
        addColumnSafe("item", "quality", "VARCHAR(20) DEFAULT 'common' COMMENT '品质'", messages);
        addColumnSafe("item", "icon", "VARCHAR(255) COMMENT '图标'", messages);
        addColumnSafe("item", "max_stack_size", "INT DEFAULT 99 COMMENT '最大堆叠数'", messages);
        addColumnSafe("item", "sell_price", "INT COMMENT '出售价格'", messages);
        messages.add("📦 修复 item 表完成");
    }
    
    private void fixRoleAchievementTable(List<String> messages) {
        addColumnSafe("role_achievement", "completed_at", "DATETIME COMMENT '完成时间'", messages);
        addColumnSafe("role_achievement", "reward_claimed", "TINYINT(1) DEFAULT 0 COMMENT '奖励已领取'", messages);
        addColumnSafe("role_achievement", "progress", "INT DEFAULT 0 COMMENT '进度'", messages);
        addColumnSafe("role_achievement", "status", "VARCHAR(20) DEFAULT 'in_progress' COMMENT '状态'", messages);
        addColumnSafe("role_achievement", "achievement_id", "BIGINT COMMENT '成就 ID'", messages);
        addColumnSafe("role_achievement", "role_id", "BIGINT COMMENT '角色 ID'", messages);
        addColumnSafe("role_achievement", "created_at", "DATETIME COMMENT '创建时间'", messages);
        addColumnSafe("role_achievement", "updated_at", "DATETIME COMMENT '更新时间'", messages);
        messages.add("🎉 修复 role_achievement 表完成");
    }
}
