# 灵月仙途 - 数据库字段完整性检测报告

**生成时间**: 2026-04-01 15:33:03

## 📊 扫描统计

- Entity 文件：85 个
- SQL 文件：124 个
- 解析的表：85 个
- 发现缺失：46 个表

## 🔍 缺失字段详情

### achievement 表

**缺失字段**: reward_attributes, rewards, icon, name, type, rarity, condition, status, condition_type, hidden, title, module_type, operator, threshold, sort_order, `condition`

```sql
ALTER TABLE achievement
ADD COLUMN `reward_attributes` VARCHAR(255),
ADD COLUMN `rewards` VARCHAR(255),
ADD COLUMN `icon` VARCHAR(255),
ADD COLUMN `name` VARCHAR(255),
ADD COLUMN `type` VARCHAR(255),
ADD COLUMN `rarity` VARCHAR(255),
ADD COLUMN `condition` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `condition_type` VARCHAR(255),
ADD COLUMN `hidden` VARCHAR(255),
ADD COLUMN `title` VARCHAR(255),
ADD COLUMN `module_type` VARCHAR(255),
ADD COLUMN `operator` VARCHAR(255),
ADD COLUMN `threshold` VARCHAR(255),
ADD COLUMN `sort_order` VARCHAR(255),
ADD COLUMN ``condition`` VARCHAR(255);
```

### announcement 表

**缺失字段**: status, type, title, content

```sql
ALTER TABLE announcement
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `type` VARCHAR(255),
ADD COLUMN `title` VARCHAR(255),
ADD COLUMN `content` VARCHAR(255);
```

### asset_acquisition_records 表

**缺失字段**: quantity, source_id, asset_type, source, role_id

```sql
ALTER TABLE asset_acquisition_records
ADD COLUMN `quantity` VARCHAR(255),
ADD COLUMN `source_id` VARCHAR(255),
ADD COLUMN `asset_type` VARCHAR(255),
ADD COLUMN `source` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255);
```

### asset_types 表

**缺失字段**: unit_of_measure, is_system, icon, icon_path, modules, type, droppable, decimal_places, category, status, deleted_at, tradable, max_stack, decimal_precision, destroy_policy

```sql
ALTER TABLE asset_types
ADD COLUMN `unit_of_measure` VARCHAR(255),
ADD COLUMN `is_system` VARCHAR(255),
ADD COLUMN `icon` VARCHAR(255),
ADD COLUMN `icon_path` VARCHAR(255),
ADD COLUMN `modules` VARCHAR(255),
ADD COLUMN `type` VARCHAR(255),
ADD COLUMN `droppable` VARCHAR(255),
ADD COLUMN `decimal_places` VARCHAR(255),
ADD COLUMN `category` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `deleted_at` VARCHAR(255),
ADD COLUMN `tradable` VARCHAR(255),
ADD COLUMN `max_stack` VARCHAR(255),
ADD COLUMN `decimal_precision` VARCHAR(255),
ADD COLUMN `destroy_policy` VARCHAR(255);
```

### asset_usage_records 表

**缺失字段**: quantity, purpose_id, asset_type, purpose, role_id

```sql
ALTER TABLE asset_usage_records
ADD COLUMN `quantity` VARCHAR(255),
ADD COLUMN `purpose_id` VARCHAR(255),
ADD COLUMN `asset_type` VARCHAR(255),
ADD COLUMN `purpose` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255);
```

### body_cultivation_material 表

**缺失字段**: base_price, source_description, material_type, effect_description

```sql
ALTER TABLE body_cultivation_material
ADD COLUMN `base_price` VARCHAR(255),
ADD COLUMN `source_description` VARCHAR(255),
ADD COLUMN `material_type` VARCHAR(255),
ADD COLUMN `effect_description` VARCHAR(255);
```

### body_mutation 表

**缺失字段**: activation_condition, sort_order

```sql
ALTER TABLE body_mutation
ADD COLUMN `activation_condition` VARCHAR(255),
ADD COLUMN `sort_order` VARCHAR(255);
```

### body_part 表

**缺失字段**: sort_order

```sql
ALTER TABLE body_part
ADD COLUMN `sort_order` VARCHAR(255);
```

### cfg_equipment_quality 表

**缺失字段**: probability, max_bonus, color, quality, min_bonus, special_effect_probability

```sql
ALTER TABLE cfg_equipment_quality
ADD COLUMN `probability` VARCHAR(255),
ADD COLUMN `max_bonus` VARCHAR(255),
ADD COLUMN `color` VARCHAR(255),
ADD COLUMN `quality` VARCHAR(255),
ADD COLUMN `min_bonus` VARCHAR(255),
ADD COLUMN `special_effect_probability` VARCHAR(255);
```

### cfg_pill_effect 表

**缺失字段**: duration, material_cost, rank, cooldown, effect, pill_name

```sql
ALTER TABLE cfg_pill_effect
ADD COLUMN `duration` VARCHAR(255),
ADD COLUMN `material_cost` VARCHAR(255),
ADD COLUMN `rank` VARCHAR(255),
ADD COLUMN `cooldown` VARCHAR(255),
ADD COLUMN `effect` VARCHAR(255),
ADD COLUMN `pill_name` VARCHAR(255);
```

### cfg_realm_breakthrough 表

**缺失字段**: success_rate, from_realm, failure_penalty, xiuwei_requirement, to_realm, pill_name

```sql
ALTER TABLE cfg_realm_breakthrough
ADD COLUMN `success_rate` VARCHAR(255),
ADD COLUMN `from_realm` VARCHAR(255),
ADD COLUMN `failure_penalty` VARCHAR(255),
ADD COLUMN `xiuwei_requirement` VARCHAR(255),
ADD COLUMN `to_realm` VARCHAR(255),
ADD COLUMN `pill_name` VARCHAR(255);
```

### cfg_skill_upgrade 表

**缺失字段**: effect_increase, proficiency_requirement, cooldown, mana_consumption, skill_level

```sql
ALTER TABLE cfg_skill_upgrade
ADD COLUMN `effect_increase` VARCHAR(255),
ADD COLUMN `proficiency_requirement` VARCHAR(255),
ADD COLUMN `cooldown` VARCHAR(255),
ADD COLUMN `mana_consumption` VARCHAR(255),
ADD COLUMN `skill_level` VARCHAR(255);
```

### clan_skill 表

**缺失字段**: clan_id, skill_effect, required_contribution, skill_name, required_level, skill_level

```sql
ALTER TABLE clan_skill
ADD COLUMN `clan_id` VARCHAR(255),
ADD COLUMN `skill_effect` VARCHAR(255),
ADD COLUMN `required_contribution` VARCHAR(255),
ADD COLUMN `skill_name` VARCHAR(255),
ADD COLUMN `required_level` VARCHAR(255),
ADD COLUMN `skill_level` VARCHAR(255);
```

### clans 表

**缺失字段**: spirit_stone

```sql
ALTER TABLE clans
ADD COLUMN `spirit_stone` VARCHAR(255);
```

### cultivation_techniques 表

**缺失字段**: display_name

```sql
ALTER TABLE cultivation_techniques
ADD COLUMN `display_name` VARCHAR(255);
```

### equipment 表

**缺失字段**: defense, status, level, attack

```sql
ALTER TABLE equipment
ADD COLUMN `defense` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `level` VARCHAR(255),
ADD COLUMN `attack` VARCHAR(255);
```

### friends 表

**缺失字段**: user_id, remark, friend_id

```sql
ALTER TABLE friends
ADD COLUMN `user_id` VARCHAR(255),
ADD COLUMN `remark` VARCHAR(255),
ADD COLUMN `friend_id` VARCHAR(255);
```

### game_user 表

**缺失字段**: last_login_time, username, password, status, nickname, avatar, phone

```sql
ALTER TABLE game_user
ADD COLUMN `last_login_time` VARCHAR(255),
ADD COLUMN `username` VARCHAR(255),
ADD COLUMN `password` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `nickname` VARCHAR(255),
ADD COLUMN `avatar` VARCHAR(255),
ADD COLUMN `phone` VARCHAR(255);
```

### gift 表

**缺失字段**: quantity, user_id, name, type, status, expire_time, role_id

```sql
ALTER TABLE gift
ADD COLUMN `quantity` VARCHAR(255),
ADD COLUMN `user_id` VARCHAR(255),
ADD COLUMN `name` VARCHAR(255),
ADD COLUMN `type` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `expire_time` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255);
```

### item 表

**缺失字段**: stackable, status, use_effect, max_stack, price

```sql
ALTER TABLE item
ADD COLUMN `stackable` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `use_effect` VARCHAR(255),
ADD COLUMN `max_stack` VARCHAR(255),
ADD COLUMN `price` VARCHAR(255);
```

### mail_item 表

**缺失字段**: item_id, quantity, mail_id

```sql
ALTER TABLE mail_item
ADD COLUMN `item_id` VARCHAR(255),
ADD COLUMN `quantity` VARCHAR(255),
ADD COLUMN `mail_id` VARCHAR(255);
```

### payment_record 表

**缺失字段**: order_no, user_id, amount, status, role_id, method

```sql
ALTER TABLE payment_record
ADD COLUMN `order_no` VARCHAR(255),
ADD COLUMN `user_id` VARCHAR(255),
ADD COLUMN `amount` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255),
ADD COLUMN `method` VARCHAR(255);
```

### permission 表

**缺失字段**: parent_id, require_verification, is_button, is_sensitive, api_path, method

```sql
ALTER TABLE permission
ADD COLUMN `parent_id` VARCHAR(255),
ADD COLUMN `require_verification` VARCHAR(255),
ADD COLUMN `is_button` VARCHAR(255),
ADD COLUMN `is_sensitive` VARCHAR(255),
ADD COLUMN `api_path` VARCHAR(255),
ADD COLUMN `method` VARCHAR(255);
```

### role_achievement 表

**缺失字段**: is_equipped, claimed_request_id, achievement_id, claimed_time, status, progress, claimed_ip, role_id, completed_time

```sql
ALTER TABLE role_achievement
ADD COLUMN `is_equipped` VARCHAR(255),
ADD COLUMN `claimed_request_id` VARCHAR(255),
ADD COLUMN `achievement_id` VARCHAR(255),
ADD COLUMN `claimed_time` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `progress` VARCHAR(255),
ADD COLUMN `claimed_ip` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255),
ADD COLUMN `completed_time` VARCHAR(255);
```

### role_activity 表

**缺失字段**: reset_time

```sql
ALTER TABLE role_activity
ADD COLUMN `reset_time` VARCHAR(255);
```

### role_asset 表

**缺失字段**: quantity, asset_type_code, role_id

```sql
ALTER TABLE role_asset
ADD COLUMN `quantity` VARCHAR(255),
ADD COLUMN `asset_type_code` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255);
```

### role_checkin 表

**缺失字段**: month, last_checkin_date, checkin_days, year, role_id

```sql
ALTER TABLE role_checkin
ADD COLUMN `month` VARCHAR(255),
ADD COLUMN `last_checkin_date` VARCHAR(255),
ADD COLUMN `checkin_days` VARCHAR(255),
ADD COLUMN `year` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255);
```

### role_clan_skill 表

**缺失字段**: learn_time, clan_skill_id, role_id, skill_level

```sql
ALTER TABLE role_clan_skill
ADD COLUMN `learn_time` VARCHAR(255),
ADD COLUMN `clan_skill_id` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255),
ADD COLUMN `skill_level` VARCHAR(255);
```

### role_clans 表

**缺失字段**: `rank`

```sql
ALTER TABLE role_clans
ADD COLUMN ``rank`` VARCHAR(255);
```

### role_equipment 表

**缺失字段**: slot, status, equipment_id, role_id, equip_time

```sql
ALTER TABLE role_equipment
ADD COLUMN `slot` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `equipment_id` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255),
ADD COLUMN `equip_time` VARCHAR(255);
```

### role_item 表

**缺失字段**: position, acquire_time

```sql
ALTER TABLE role_item
ADD COLUMN `position` VARCHAR(255),
ADD COLUMN `acquire_time` VARCHAR(255);
```

### role_map_node 表

**缺失字段**: map_node_id, unlocked_at, role_id, last_visited_at

```sql
ALTER TABLE role_map_node
ADD COLUMN `map_node_id` VARCHAR(255),
ADD COLUMN `unlocked_at` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255),
ADD COLUMN `last_visited_at` VARCHAR(255);
```

### role_realms 表

**缺失字段**: realm_name, next_realm_cultivation, realm_level, role_id, total_cultivation

```sql
ALTER TABLE role_realms
ADD COLUMN `realm_name` VARCHAR(255),
ADD COLUMN `next_realm_cultivation` VARCHAR(255),
ADD COLUMN `realm_level` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255),
ADD COLUMN `total_cultivation` VARCHAR(255);
```

### role_task 表

**缺失字段**: claim_time, status

```sql
ALTER TABLE role_task
ADD COLUMN `claim_time` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255);
```

### sect_apply 表

**缺失字段**: handle_time, user_id, message, status, sect_id, apply_time, handler_id

```sql
ALTER TABLE sect_apply
ADD COLUMN `handle_time` VARCHAR(255),
ADD COLUMN `user_id` VARCHAR(255),
ADD COLUMN `message` VARCHAR(255),
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `sect_id` VARCHAR(255),
ADD COLUMN `apply_time` VARCHAR(255),
ADD COLUMN `handler_id` VARCHAR(255);
```

### shop_items 表

**缺失字段**: start_time, end_time, currency, name, type, price

```sql
ALTER TABLE shop_items
ADD COLUMN `start_time` VARCHAR(255),
ADD COLUMN `end_time` VARCHAR(255),
ADD COLUMN `currency` VARCHAR(255),
ADD COLUMN `name` VARCHAR(255),
ADD COLUMN `type` VARCHAR(255),
ADD COLUMN `price` VARCHAR(255);
```

### skill 表

**缺失字段**: trigger_rate

```sql
ALTER TABLE skill
ADD COLUMN `trigger_rate` VARCHAR(255);
```

### sys_permission 表

**缺失字段**: code, name, url, description, method

```sql
ALTER TABLE sys_permission
ADD COLUMN `code` VARCHAR(255),
ADD COLUMN `name` VARCHAR(255),
ADD COLUMN `url` VARCHAR(255),
ADD COLUMN `description` VARCHAR(255),
ADD COLUMN `method` VARCHAR(255);
```

### sys_role 表

**缺失字段**: custom_data_scope

```sql
ALTER TABLE sys_role
ADD COLUMN `custom_data_scope` VARCHAR(255);
```

### sys_user 表

**缺失字段**: role_name, role_id

```sql
ALTER TABLE sys_user
ADD COLUMN `role_name` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255);
```

### system_log 表

**缺失字段**: log_source, message, log_level, log_message, source, level

```sql
ALTER TABLE system_log
ADD COLUMN `log_source` VARCHAR(255),
ADD COLUMN `message` VARCHAR(255),
ADD COLUMN `log_level` VARCHAR(255),
ADD COLUMN `log_message` VARCHAR(255),
ADD COLUMN `source` VARCHAR(255),
ADD COLUMN `level` VARCHAR(255);
```

### system_setting 表

**缺失字段**: key, value

```sql
ALTER TABLE system_setting
ADD COLUMN `key` VARCHAR(255),
ADD COLUMN `value` VARCHAR(255);
```

### task 表

**缺失字段**: rewards, name, activity_points, condition_type, task_type, sort_order, description, condition_value

```sql
ALTER TABLE task
ADD COLUMN `rewards` VARCHAR(255),
ADD COLUMN `name` VARCHAR(255),
ADD COLUMN `activity_points` VARCHAR(255),
ADD COLUMN `condition_type` VARCHAR(255),
ADD COLUMN `task_type` VARCHAR(255),
ADD COLUMN `sort_order` VARCHAR(255),
ADD COLUMN `description` VARCHAR(255),
ADD COLUMN `condition_value` VARCHAR(255);
```

### trade_item 表

**缺失字段**: icon, name, category, description, price, stock

```sql
ALTER TABLE trade_item
ADD COLUMN `icon` VARCHAR(255),
ADD COLUMN `name` VARCHAR(255),
ADD COLUMN `category` VARCHAR(255),
ADD COLUMN `description` VARCHAR(255),
ADD COLUMN `price` VARCHAR(255),
ADD COLUMN `stock` VARCHAR(255);
```

### trade_record 表

**缺失字段**: quantity, total_price, item_name, type, item_id, trade_time, role_id

```sql
ALTER TABLE trade_record
ADD COLUMN `quantity` VARCHAR(255),
ADD COLUMN `total_price` VARCHAR(255),
ADD COLUMN `item_name` VARCHAR(255),
ADD COLUMN `type` VARCHAR(255),
ADD COLUMN `item_id` VARCHAR(255),
ADD COLUMN `trade_time` VARCHAR(255),
ADD COLUMN `role_id` VARCHAR(255);
```

### verification_code 表

**缺失字段**: status, code, expire_time, phone

```sql
ALTER TABLE verification_code
ADD COLUMN `status` VARCHAR(255),
ADD COLUMN `code` VARCHAR(255),
ADD COLUMN `expire_time` VARCHAR(255),
ADD COLUMN `phone` VARCHAR(255);
```

## 📋 已扫描的表清单

- `achievement` (17 个字段)
- `achievement_claim_record` (13 个字段)
- `activity` (7 个字段)
- `activity_reward` (11 个字段)
- `announcement` (7 个字段)
- `asset_acquisition_records` (7 个字段)
- `asset_information` (9 个字段)
- `asset_modification_log` (7 个字段)
- `asset_types` (21 个字段)
- `asset_usage_records` (7 个字段)
- `audit_log` (13 个字段)
- `body_cultivation_log` (13 个字段)
- `body_cultivation_material` (9 个字段)
- `body_cultivation_realm` (13 个字段)
- `body_mutation` (9 个字段)
- `body_part` (12 个字段)
- `breakthrough_history` (15 个字段)
- `cfg_attribute_rules` (14 个字段)
- `cfg_equipment_quality` (7 个字段)
- `cfg_pill_effect` (7 个字段)
- `cfg_realm_attribute_mult` (12 个字段)
- `cfg_realm_breakthrough` (7 个字段)
- `cfg_skill_upgrade` (6 个字段)
- `clan_member` (10 个字段)
- `clan_skill` (9 个字段)
- `clans` (14 个字段)
- `cultivation_tasks` (11 个字段)
- `cultivation_techniques` (13 个字段)
- `equipment` (11 个字段)
- `friends` (6 个字段)
- `game_role` (21 个字段)
- `game_user` (10 个字段)
- `gift` (9 个字段)
- `inventory` (7 个字段)
- `item` (9 个字段)
- `mail` (9 个字段)
- `mail_item` (4 个字段)
- `map_node` (20 个字段)
- `payment_record` (9 个字段)
- `permission` (14 个字段)
- `resource_type` (5 个字段)
- `role_achievement` (13 个字段)
- `role_activity` (5 个字段)
- `role_asset` (6 个字段)
- `role_auto_cultivation_config` (9 个字段)
- `role_base_stats` (9 个字段)
- `role_body_cultivation` (13 个字段)
- `role_body_part_progress` (7 个字段)
- `role_checkin` (8 个字段)
- `role_clan_skill` (5 个字段)
- `role_clans` (9 个字段)
- `role_equipment` (6 个字段)
- `role_item` (7 个字段)
- `role_map_node` (5 个字段)
- `role_realm_breakthrough` (8 个字段)
- `role_realms` (8 个字段)
- `role_resource` (6 个字段)
- `role_skill` (8 个字段)
- `role_task` (7 个字段)
- `role_walk_fire_status` (7 个字段)
- `sect_apply` (8 个字段)
- `shop_items` (9 个字段)
- `skill` (17 个字段)
- `sys_login_log` (11 个字段)
- `sys_menu` (12 个字段)
- `sys_menu_permission` (4 个字段)
- `sys_operation_log` (21 个字段)
- `sys_permission` (8 个字段)
- `sys_role` (11 个字段)
- `sys_role_permission` (4 个字段)
- `sys_user` (12 个字段)
- `sys_user_role` (4 个字段)
- `system_log` (8 个字段)
- `system_setting` (7 个字段)
- `t_cfg_numerical_rules` (6 个字段)
- `t_player_stats_base` (23 个字段)
- `t_role_attribute_cache` (24 个字段)
- `t_stat_operation_log` (9 个字段)
- `task` (11 个字段)
- `task_log` (12 个字段)
- `technique_change_log` (13 个字段)
- `trade_item` (7 个字段)
- `trade_record` (8 个字段)
- `user_techniques` (10 个字段)
- `verification_code` (6 个字段)