-- ============================================
-- 数据库字段缺失修复脚本
-- 生成时间：2026-04-01 15:33:03
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- 修复 mail_item 表缺失字段
ALTER TABLE mail_item
  ADD COLUMN IF NOT EXISTS `item_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `quantity` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `mail_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 body_part 表缺失字段
ALTER TABLE body_part
  ADD COLUMN IF NOT EXISTS `sort_order` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 skill 表缺失字段
ALTER TABLE skill
  ADD COLUMN IF NOT EXISTS `trigger_rate` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 equipment 表缺失字段
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS `defense` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `level` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `attack` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_activity 表缺失字段
ALTER TABLE role_activity
  ADD COLUMN IF NOT EXISTS `reset_time` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 announcement 表缺失字段
ALTER TABLE announcement
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `title` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `content` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_asset 表缺失字段
ALTER TABLE role_asset
  ADD COLUMN IF NOT EXISTS `quantity` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `asset_type_code` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 asset_types 表缺失字段
ALTER TABLE asset_types
  ADD COLUMN IF NOT EXISTS `unit_of_measure` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `is_system` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `icon` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `icon_path` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `modules` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `droppable` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `decimal_places` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `category` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `deleted_at` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `tradable` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `max_stack` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `decimal_precision` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `destroy_policy` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 trade_item 表缺失字段
ALTER TABLE trade_item
  ADD COLUMN IF NOT EXISTS `icon` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `category` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `description` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `price` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `stock` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 asset_acquisition_records 表缺失字段
ALTER TABLE asset_acquisition_records
  ADD COLUMN IF NOT EXISTS `quantity` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `source_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `asset_type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `source` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_clans 表缺失字段
ALTER TABLE role_clans
  ADD COLUMN IF NOT EXISTS ``rank`` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 cfg_skill_upgrade 表缺失字段
ALTER TABLE cfg_skill_upgrade
  ADD COLUMN IF NOT EXISTS `effect_increase` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `proficiency_requirement` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `cooldown` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `mana_consumption` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `skill_level` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 sys_role 表缺失字段
ALTER TABLE sys_role
  ADD COLUMN IF NOT EXISTS `custom_data_scope` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 cfg_equipment_quality 表缺失字段
ALTER TABLE cfg_equipment_quality
  ADD COLUMN IF NOT EXISTS `probability` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `max_bonus` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `color` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `quality` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `min_bonus` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `special_effect_probability` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 asset_usage_records 表缺失字段
ALTER TABLE asset_usage_records
  ADD COLUMN IF NOT EXISTS `quantity` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `purpose_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `asset_type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `purpose` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_equipment 表缺失字段
ALTER TABLE role_equipment
  ADD COLUMN IF NOT EXISTS `slot` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `equipment_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `equip_time` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 cfg_realm_breakthrough 表缺失字段
ALTER TABLE cfg_realm_breakthrough
  ADD COLUMN IF NOT EXISTS `success_rate` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `from_realm` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `failure_penalty` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `xiuwei_requirement` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `to_realm` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `pill_name` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 friends 表缺失字段
ALTER TABLE friends
  ADD COLUMN IF NOT EXISTS `user_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `remark` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `friend_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 clans 表缺失字段
ALTER TABLE clans
  ADD COLUMN IF NOT EXISTS `spirit_stone` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 cultivation_techniques 表缺失字段
ALTER TABLE cultivation_techniques
  ADD COLUMN IF NOT EXISTS `display_name` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 system_setting 表缺失字段
ALTER TABLE system_setting
  ADD COLUMN IF NOT EXISTS `key` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `value` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 payment_record 表缺失字段
ALTER TABLE payment_record
  ADD COLUMN IF NOT EXISTS `order_no` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `user_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `amount` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `method` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_map_node 表缺失字段
ALTER TABLE role_map_node
  ADD COLUMN IF NOT EXISTS `map_node_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `unlocked_at` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `last_visited_at` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_checkin 表缺失字段
ALTER TABLE role_checkin
  ADD COLUMN IF NOT EXISTS `month` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `last_checkin_date` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `checkin_days` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `year` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 sys_user 表缺失字段
ALTER TABLE sys_user
  ADD COLUMN IF NOT EXISTS `role_name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 shop_items 表缺失字段
ALTER TABLE shop_items
  ADD COLUMN IF NOT EXISTS `start_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `end_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `currency` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `price` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_clan_skill 表缺失字段
ALTER TABLE role_clan_skill
  ADD COLUMN IF NOT EXISTS `learn_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `clan_skill_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `skill_level` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 verification_code 表缺失字段
ALTER TABLE verification_code
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `code` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `expire_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 body_mutation 表缺失字段
ALTER TABLE body_mutation
  ADD COLUMN IF NOT EXISTS `activation_condition` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `sort_order` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 trade_record 表缺失字段
ALTER TABLE trade_record
  ADD COLUMN IF NOT EXISTS `quantity` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `total_price` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `item_name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `item_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `trade_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 permission 表缺失字段
ALTER TABLE permission
  ADD COLUMN IF NOT EXISTS `parent_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `require_verification` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `is_button` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `is_sensitive` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `api_path` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `method` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 task 表缺失字段
ALTER TABLE task
  ADD COLUMN IF NOT EXISTS `rewards` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `activity_points` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `condition_type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `task_type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `sort_order` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `description` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `condition_value` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_item 表缺失字段
ALTER TABLE role_item
  ADD COLUMN IF NOT EXISTS `position` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `acquire_time` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 clan_skill 表缺失字段
ALTER TABLE clan_skill
  ADD COLUMN IF NOT EXISTS `clan_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `skill_effect` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `required_contribution` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `skill_name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `required_level` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `skill_level` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 sys_permission 表缺失字段
ALTER TABLE sys_permission
  ADD COLUMN IF NOT EXISTS `code` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `url` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `description` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `method` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 cfg_pill_effect 表缺失字段
ALTER TABLE cfg_pill_effect
  ADD COLUMN IF NOT EXISTS `duration` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `material_cost` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `rank` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `cooldown` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `effect` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `pill_name` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 sect_apply 表缺失字段
ALTER TABLE sect_apply
  ADD COLUMN IF NOT EXISTS `handle_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `user_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `message` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `sect_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `apply_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `handler_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 gift 表缺失字段
ALTER TABLE gift
  ADD COLUMN IF NOT EXISTS `quantity` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `user_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `expire_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_realms 表缺失字段
ALTER TABLE role_realms
  ADD COLUMN IF NOT EXISTS `realm_name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `next_realm_cultivation` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `realm_level` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `total_cultivation` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 body_cultivation_material 表缺失字段
ALTER TABLE body_cultivation_material
  ADD COLUMN IF NOT EXISTS `base_price` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `source_description` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `material_type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `effect_description` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 system_log 表缺失字段
ALTER TABLE system_log
  ADD COLUMN IF NOT EXISTS `log_source` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `message` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `log_level` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `log_message` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `source` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `level` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 game_user 表缺失字段
ALTER TABLE game_user
  ADD COLUMN IF NOT EXISTS `last_login_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `username` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `password` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `nickname` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `phone` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_task 表缺失字段
ALTER TABLE role_task
  ADD COLUMN IF NOT EXISTS `claim_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 achievement 表缺失字段
ALTER TABLE achievement
  ADD COLUMN IF NOT EXISTS `reward_attributes` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `rewards` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `icon` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `rarity` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `condition` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `condition_type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `hidden` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `title` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `module_type` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `operator` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `threshold` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `sort_order` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS ``condition`` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 item 表缺失字段
ALTER TABLE item
  ADD COLUMN IF NOT EXISTS `stackable` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `use_effect` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `max_stack` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `price` VARCHAR(255) COMMENT '自动补充字段';

-- 修复 role_achievement 表缺失字段
ALTER TABLE role_achievement
  ADD COLUMN IF NOT EXISTS `is_equipped` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `claimed_request_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `achievement_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `claimed_time` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `progress` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `claimed_ip` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `role_id` VARCHAR(255) COMMENT '自动补充字段',
  ADD COLUMN IF NOT EXISTS `completed_time` VARCHAR(255) COMMENT '自动补充字段';

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ 数据库字段修复完成！' AS message;