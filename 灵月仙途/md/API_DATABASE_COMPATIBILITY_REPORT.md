# 灵月仙途 - API 与数据库字段兼容性检测报告

## 概览
- 扫描的 API 服务文件：2
- 扫描的 Controller 文件：69
- 扫描的 Entity 文件：88
- 扫描的 SQL 文件：133
- 解析的 API 端点：30
- 解析的数据库表：72
- 发现的字段不匹配：91

## 字段不匹配详情

### ⚠️  achievement_claim_record 表缺失字段
**实体类**: AchievementClaimRecord
**缺失字段**: rewardItems, rewardAttributes, claimTime, titleGranted, errorMessage, achievementId, requestId, claimIp, traceId, roleId

### ℹ️  achievement_claim_record 表多余字段
**实体类**: AchievementClaimRecord
**多余字段**: 领取, PRIMARY, 主键, 分布式追踪, 成就, claim_ip, NOT, AUTO_INCREMENT, trace_id, error_message, 角色, role_id, claim_time, request_id, reward_items, achievement_id, 奖励属性, DEFAULT, UNIQUE, 请求, 奖励物品, title_granted, reward_attributes

### ⚠️  body_part 表缺失字段
**实体类**: BodyPart
**缺失字段**: updated_at, created_at, createdAt, primaryAttr, partCode, partName, sort_order, secondaryAttr, updatedAt

### ℹ️  body_part 表多余字段
**实体类**: BodyPart
**多余字段**: exp_growth_rate, NOT, secondary_attr, UNIQUE, AUTO_INCREMENT, part_code, status, DEFAULT, primary_attr, part_name

### ⚠️  role_realm_breakthrough 表缺失字段
**实体类**: RoleRealmBreakthrough
**缺失字段**: roleName, newRealm, oldRealm, breakthroughTime, roleId

### ℹ️  role_realm_breakthrough 表多余字段
**实体类**: RoleRealmBreakthrough
**多余字段**: role_id, NOT, old_realm, 失败, PRIMARY, new_realm, DEFAULT, role_name, 角色

### ⚠️  skill 表缺失字段
**实体类**: Skill
**缺失字段**: triggerRate, skillName, skillType, maxLevel, attackBonus, defenseBonus, createdAt, speedBonus, spiritPowerBonus, skillLevel, criticalBonus, xiuweiBonus, updatedAt, dodgeBonus

### ℹ️  skill 表多余字段
**实体类**: Skill
**多余字段**: 1, NOT, ON, speed_bonus, AUTO_INCREMENT, xiuwei_bonus, defense_bonus, 0, spirit_power_bonus, critical_bonus, max_level, skill_type, attack_bonus, DEFAULT, dodge_bonus, skill_name, skill_level

### ⚠️  equipment 表缺失字段
**实体类**: Equipment
**缺失字段**: level, mpBonus, attack, defense, status, hpBonus

### ℹ️  equipment 表多余字段
**实体类**: Equipment
**多余字段**: NOT, ON, PRIMARY, is_tradable, defense_bonus, combat_bonus, attack_bonus, DEFAULT, level_require

### ⚠️  sys_user_role 表缺失字段
**实体类**: SysUserRole
**缺失字段**: userId, createTime, roleId

### ℹ️  sys_user_role 表多余字段
**实体类**: SysUserRole
**多余字段**: role_id, user_id, NOT, 用户, ON, AUTO_INCREMENT, PRIMARY, UNIQUE, fk_user_role_role, 主键, fk_user_role_user, DEFAULT, 角色

### ⚠️  role_activity 表缺失字段
**实体类**: RoleActivity
**缺失字段**: updateTime, resetTime, createTime, roleId

### ℹ️  role_activity 表多余字段
**实体类**: RoleActivity
**多余字段**: role_id, daily_reset_time, NOT, ON, daily_activity, PRIMARY, UNIQUE, claimed_rewards, DEFAULT, total_activity

### ⚠️  activity 表缺失字段
**实体类**: Activity
**缺失字段**: endTime, startTime

### ℹ️  activity 表多余字段
**实体类**: Activity
**多余字段**: 未开始, NOT, ON, PRIMARY, 进行中, DEFAULT

### ⚠️  audit_log 表缺失字段
**实体类**: AuditLog
**缺失字段**: createTime, errorMessage, oldValue, newValue, traceId, executionTimeMs, requestParams, operatorIp, roleId

### ℹ️  audit_log 表多余字段
**实体类**: AuditLog
**多余字段**: NOT, 新值, AUTO_INCREMENT, 操作, 旧值, PRIMARY, 主键, trace_id, 请求参数, old_value, 分布式追踪, error_message, request_params, new_value, DEFAULT, operator_ip, 角色

### ⚠️  role_skill 表缺失字段
**实体类**: RoleSkill
**缺失字段**: createdAt, skillId, skillLevel, updatedAt, roleId

### ℹ️  role_skill 表多余字段
**实体类**: RoleSkill
**多余字段**: ON, PRIMARY, unlocked, skill_name, skill_level, NOT, AUTO_INCREMENT, INDEX, combat, max_exp, 角色, role_id, 技能, FOREIGN, REFERENCES, DEFAULT, skill_type, skill_id, exp, effect, INT

### ⚠️  role_body_cultivation 表缺失字段
**实体类**: RoleBodyCultivation
**缺失字段**: realmId, injuryRecoveryTime, mutationId, lastCultivateTime, roleId

### ℹ️  role_body_cultivation 表多余字段
**实体类**: RoleBodyCultivation
**多余字段**: 异变, failed_breakthrough_count, body_exp, pain_value, total_cultivate_count, 00, NOT, AUTO_INCREMENT, realm_id, 角色, role_id, total_breakthrough_count, FOREIGN, 当前境界, REFERENCES, status, DEFAULT, tolerance, UNIQUE

### ⚠️  inventory 表缺失字段
**实体类**: Inventory
**缺失字段**: itemName, itemId, itemType, updateTime, createTime, roleId

### ℹ️  inventory 表多余字段
**实体类**: Inventory
**多余字段**: role_id, NOT, ON, item_name, item_id, PRIMARY, item_type, INDEX, stack_size, DEFAULT, rarity

### ⚠️  activity_reward 表缺失字段
**实体类**: ActivityReward
**缺失字段**: rewardItems, isEnabled, sortOrder, rewardLingshi, createdAt, rewardXiuwei, activityThreshold, updatedAt

### ℹ️  activity_reward 表多余字段
**实体类**: ActivityReward
**多余字段**: activity_threshold, NOT, ON, PRIMARY, reward_items, is_enabled, DEFAULT

### ⚠️  sys_role 表缺失字段
**实体类**: SysRole
**缺失字段**: roleName, createdAt, customDataScope, roleCode, updatedAt

### ℹ️  sys_role 表多余字段
**实体类**: SysRole
**多余字段**: NOT, ON, AUTO_INCREMENT, data_scope, PRIMARY, 主键, UNIQUE, role_code, DEFAULT, role_name

### ⚠️  role_walk_fire_status 表缺失字段
**实体类**: RoleWalkFireStatus
**缺失字段**: endTime, remainingMinutes, startTime, roleId

### ℹ️  role_walk_fire_status 表多余字段
**实体类**: RoleWalkFireStatus
**多余字段**: role_id, NOT, PRIMARY, end_time, start_time, DEFAULT, remaining_minutes, 角色

### ⚠️  map_node 表缺失字段
**实体类**: MapNode
**缺失字段**: requiredLevel, description, name, type, cost

### ℹ️  map_node 表多余字段
**实体类**: MapNode
**多余字段**: special_event, 地图, ON, environment_desc, background_resource, recommend_combat, 9, KEY, layer_level, drop_weight, extension_field2, map_type, NOT, AUTO_INCREMENT, INDEX, main_products, weather_type, map_code, monster_density, DEFAULT, map_name, extension_field1, UNIQUE, 扩展字段, online_count, recommend_level

### ⚠️  sys_login_log 表缺失字段
**实体类**: SysLoginLog
**缺失字段**: logoutTime, userId, ipAddress, errorMessage, ipLocation, userAgent, loginType

### ℹ️  sys_login_log 表多余字段
**实体类**: SysLoginLog
**多余字段**: ip_location, user_id, NOT, 用户, 失败, PRIMARY, IP, user_agent, error_message, login_type, DEFAULT, ip_address

### ⚠️  asset_modification_log 表缺失字段
**实体类**: AssetModificationLog
**缺失字段**: assetId, modifiedBy, oldValue, newValue, fieldName, modifiedAt

### ℹ️  asset_modification_log 表多余字段
**实体类**: AssetModificationLog
**多余字段**: NOT, PRIMARY, field_name, modified_at, asset_id, FOREIGN, REFERENCES, DEFAULT

### ⚠️  game_role 表缺失字段
**实体类**: GameRole
**缺失字段**: lifeStatus, maxAge, userId, roleName, createTime, longevityBonus, bodyLevel, bodyStrength, spiritRoot, cultivationBase, reincarnationCount, deathTime

### ℹ️  game_role 表多余字段
**实体类**: GameRole
**多余字段**: user_id, NOT, PRIMARY, INDEX, role_name

### ⚠️  role_resource 表缺失字段
**实体类**: RoleResource
**缺失字段**: resourceTypeId, updatedAt, roleId

### ℹ️  role_resource 表多余字段
**实体类**: RoleResource
**多余字段**: NOT, ON, UNIQUE, PRIMARY, INDEX, DEFAULT

### ⚠️  role_auto_cultivation_config 表缺失字段
**实体类**: RoleAutoCultivationConfig
**缺失字段**: lastCultivationTime, roleId

### ℹ️  role_auto_cultivation_config 表多余字段
**实体类**: RoleAutoCultivationConfig
**多余字段**: role_id, NOT, ON, CURRENT_TIMESTAMP, UNIQUE, PRIMARY, 手动, DEFAULT, 角色

### ⚠️  mail 表缺失字段
**实体类**: Mail
**缺失字段**: hasAttachment, userId, isRead, sendTime, expireTime

### ℹ️  mail 表多余字段
**实体类**: Mail
**多余字段**: NOT, 收件人, PRIMARY, DEFAULT

### ⚠️  system_setting 表缺失字段
**实体类**: SystemSetting
**缺失字段**: key, value, updatedAt

### ℹ️  system_setting 表多余字段
**实体类**: SystemSetting
**多余字段**: NOT, ON, UNIQUE, PRIMARY, setting_key, DEFAULT

### ⚠️  role_base_stats 表缺失字段
**实体类**: RoleBaseStats
**缺失字段**: createdAt, updatedAt, roleId

### ℹ️  role_base_stats 表多余字段
**实体类**: RoleBaseStats
**多余字段**: role_id, NOT, ON, CURRENT_TIMESTAMP, 身法, PRIMARY, DATETIME, 气运, 悟性, FOREIGN, 灵力, REFERENCES, 根骨, DEFAULT, INT, n, 角色

### ℹ️  resource_type 表多余字段
**实体类**: ResourceType
**多余字段**: NOT, ON, PRIMARY, DEFAULT

### ⚠️  cfg_realm_attribute_mult 表缺失字段
**实体类**: CfgRealmAttributeMult
**缺失字段**: critMult, realmName, atkMult, maxAge, hpMult, defMult, realmLevel, speedMult, expMult, dodgeMult

### ℹ️  cfg_realm_attribute_mult 表多余字段
**实体类**: CfgRealmAttributeMult
**多余字段**: dodge_mult, NOT, crit_mult, hp_mult, PRIMARY, AUTO_INCREMENT, atk_mult, 主键, INDEX, realm_name, UNIQUE, 0, speed_mult, def_mult, DEFAULT, exp_mult, realm_level

### ⚠️  sys_user 表缺失字段
**实体类**: SysUser
**缺失字段**: role, email

### ℹ️  sys_user 表多余字段
**实体类**: SysUser
**多余字段**: NOT, ON, avatar, PRIMARY, last_login_time, DEFAULT

### ⚠️  sys_menu 表缺失字段
**实体类**: SysMenu
**缺失字段**: updateTime, menuType, createTime, menuName

### ℹ️  sys_menu 表多余字段
**实体类**: SysMenu
**多余字段**: 目录, NOT, ON, 父菜单, CURRENT_TIMESTAMP, PRIMARY, 菜单, 禁用, DEFAULT, menu_name

### ⚠️  task_log 表缺失字段
**实体类**: TaskLog
**缺失字段**: rewardInfo, progressBefore, ipAddress, actionType, taskId, createdAt, progressAfter, loopCount, timeSpent, userAgent, roleId

### ℹ️  task_log 表多余字段
**实体类**: TaskLog
**多余字段**: role_id, NOT, PRIMARY, user_agent, action_type, reward_info, DEFAULT, ip_address

### ⚠️  body_cultivation_realm 表缺失字段
**实体类**: BodyCultivationRealm
**缺失字段**: painGrowthRate, realmName, failurePenalty, realmOrder, mutationProbability, breakthroughSuccessRate, requiredExp

### ℹ️  body_cultivation_realm 表多余字段
**实体类**: BodyCultivationRealm
**多余字段**: required_exp, mutation_probability, NOT, base_defense_bonus, failure_penalty, realm_order, AUTO_INCREMENT, base_hp_bonus, breakthrough_success_rate, DEFAULT, realm_name, status, base_strength_bonus, pain_growth_rate

### ⚠️  role_body_part_progress 表缺失字段
**实体类**: RoleBodyPartProgress
**缺失字段**: createdAt, partId, updatedAt, roleId

### ℹ️  role_body_part_progress 表多余字段
**实体类**: RoleBodyPartProgress
**多余字段**: role_id, NOT, ON, level, AUTO_INCREMENT, PRIMARY, DEFAULT, UNIQUE, 部位, INDEX, experience, exp, body_part_id, FOREIGN, REFERENCES, progress, part_id, 角色

### ⚠️  body_mutation 表缺失字段
**实体类**: BodyMutation
**缺失字段**: activationCondition, created_at, mutationName, sort_order, createdAt, effectType, effectValue, mutationCode

### ℹ️  body_mutation 表多余字段
**实体类**: BodyMutation
**多余字段**: effect_value, NOT, UNIQUE, AUTO_INCREMENT, mutation_name, mutation_code, status, DEFAULT, effect_type, rarity

### ⚠️  permission 表缺失字段
**实体类**: Permission
**缺失字段**: is_button, method, updateTime, require_verification, parent_id, createTime, apiPath, is_sensitive

### ℹ️  permission 表多余字段
**实体类**: Permission
**多余字段**: NOT, ON, CURRENT_TIMESTAMP, UNIQUE, PRIMARY, 禁用, DEFAULT

### ⚠️  role_item 表缺失字段
**实体类**: RoleItem
**缺失字段**: itemId, acquire_time, version, position, acquireTime, roleId

### ℹ️  role_item 表多余字段
**实体类**: RoleItem
**多余字段**: NOT, ON, item_name, PRIMARY, item_type, DEFAULT, INDEX, subtype, description, affixes, effect, rarity

### ⚠️  sys_operation_log 表缺失字段
**实体类**: SysOperationLog
**缺失字段**: operatorNickname, operatorUsername, ipAddress, dataSnapshotBefore, operationType, errorMessage, apiPath, ipLocation, executionTime, verificationCode, dataSnapshotAfter, requestMethod, requestParams, userAgent, operatorId

### ℹ️  sys_operation_log 表多余字段
**实体类**: SysOperationLog
**多余字段**: operator_id, 操作, PRIMARY, IP, API, ip_address, NOT, api_path, operator_nickname, verification_code, error_message, request_params, operator_username, 失败, user_agent, 操作人, request_method, DEFAULT, ip_location, data_snapshot_before, data_snapshot_after, operation_type

### ⚠️  breakthrough_history 表缺失字段
**实体类**: BreakthroughHistory
**缺失字段**: penaltyValue, pityCount, successRate, roleName, ipAddress, randomSeed, fromRealm, bonusItems, penaltyType, isSuccess, toRealm, consumedXiuwei, roleId

### ℹ️  breakthrough_history 表多余字段
**实体类**: BreakthroughHistory
**多余字段**: role_id, NOT, 失败, penalty_type, 操作, PRIMARY, bonus_items, success_rate, from_realm, random_seed, 使用的加成道具, to_realm, is_success, consumed_xiuwei, DEFAULT, ip_address, role_name, 角色

### ⚠️  sys_role_permission 表缺失字段
**实体类**: SysRolePermission
**缺失字段**: create_time, createTime, permissionId, id, roleId

### ℹ️  sys_role_permission 表多余字段
**实体类**: SysRolePermission
**多余字段**: role_id, NOT, ON, 权限, PRIMARY, fk_role_permission_permission, permission_id, fk_role_permission_role, 角色

### ⚠️  sys_menu_permission 表缺失字段
**实体类**: SysMenuPermission
**缺失字段**: create_time, createTime, permissionId, menuId, id

### ℹ️  sys_menu_permission 表多余字段
**实体类**: SysMenuPermission
**多余字段**: NOT, ON, fk_menu_permission_permission, 权限, PRIMARY, menu_id, 菜单, permission_id, fk_menu_permission_menu

### ⚠️  asset_information 表缺失字段
**实体类**: AssetInformation
**缺失字段**: value, isActive, assetTypeCode, createdAt, deletedAt, name, updatedAt

### ℹ️  asset_information 表多余字段
**实体类**: AssetInformation
**多余字段**: 资产描述, NOT, ON, asset_type_code, PRIMARY, 是否激活, 关联资产类型编码, TIMESTAMP, REFERENCES, DEFAULT, 软删除时间戳

### ⚠️  sect_apply 表缺失字段
**实体类**: SectApply
**缺失字段**: userId, applyTime, sectId, handlerId, handleTime

### ℹ️  sect_apply 表多余字段
**实体类**: SectApply
**多余字段**: BIGINT, PRIMARY, last_login_time, is_approved, NOT, COLUMN, INDEX, max_members, 完善宗门表, ADD, clan_member, 完善宗门成员表, ALTER, DEFAULT, clans, TABLE, EXISTS, required_level, 确保一个角色只能加入一个宗门, 0, IF

### ⚠️  body_cultivation_material 表缺失字段
**实体类**: BodyCultivationMaterial
**缺失字段**: base_price, materialType, materialCode, created_at, effectDescription, sourceDescription, materialName, createdAt

### ℹ️  body_cultivation_material 表多余字段
**实体类**: BodyCultivationMaterial
**多余字段**: effect_value, NOT, material_code, UNIQUE, AUTO_INCREMENT, description, status, material_name, DEFAULT, drop_rate, effect_type

### ⚠️  technique_change_log 表缺失字段
**实体类**: TechniqueChangeLog
**缺失字段**: newLimitBonus, cultivationProgress, userId, cultivationTaskId, techniqueId, actionType, oldSpeedBonus, currentXiuwei, changeTime, oldLimitBonus, newSpeedBonus, roleId

### ℹ️  technique_change_log 表多余字段
**实体类**: TechniqueChangeLog
**多余字段**: role_id, user_id, technique_id, NOT, 用户, 功法, AUTO_INCREMENT, PRIMARY, new_speed_bonus, 关联的修炼任务, cultivation_progress, old_speed_bonus, action_type, 日志, DEFAULT, change_time, 角色

### ⚠️  role_task 表缺失字段
**实体类**: RoleTask
**缺失字段**: claimTime, updateTime, createTime, taskId, status, roleId

### ℹ️  role_task 表多余字段
**实体类**: RoleTask
**多余字段**: role_id, NOT, ON, PRIMARY, title, FOREIGN, REFERENCES, task_id, description, completed, progress, DEFAULT

### ⚠️  clan_member 表缺失字段
**实体类**: ClanMember
**缺失字段**: totalContribution, lastLoginTime, clanId, isApproved, joinTime, roleId

### ℹ️  clan_member 表多余字段
**实体类**: ClanMember
**多余字段**: NOT, version, AUTO_INCREMENT, PRIMARY, 宗门, UNIQUE, 主键, DEFAULT, 角色

### ⚠️  body_cultivation_log 表缺失字段
**实体类**: BodyCultivationLog
**缺失字段**: materialsConsumed, realmId, toleranceAfter, painValueAfter, toleranceBefore, partId, actionType, painValueBefore, createdAt, resultDescription, roleId

### ℹ️  body_cultivation_log 表多余字段
**实体类**: BodyCultivationLog
**多余字段**: pain_value_after, PRIMARY, result_description, action_type, NOT, AUTO_INCREMENT, INDEX, pain_value_before, 角色, role_id, materials_consumed, qte_score, QTE, 境界, DEFAULT, 消耗材料, success, 部位

### ⚠️  item 表缺失字段
**实体类**: Item
**缺失字段**: use_effect, useEffect, status, price, maxStack, stackable, max_stack

### ℹ️  item 表多余字段
**实体类**: Item
**多余字段**: effect_value, NOT, is_usable, ON, PRIMARY, is_tradable, stack_limit, DEFAULT, effect_type, rarity

## API 端点列表

- `/achievement/progress`
- `/activity`
- `/announcement`
- `/asset-information`
- `/asset-information/list`
- `/asset-information/search`
- `/asset-type`
- `/asset-type/list`
- `/body-cultivation/parts`
- `/body-cultivation/realms`
- `/checkin/do`
- `/clan/all`
- `/clan/apply/join`
- `/clan/apply/process`
- `/cultivation/auto`
- `/cultivation/breakthrough`
- `/cultivation/breakthrough/rate`
- `/cultivation/next-realm`
- `/equipment/auto-equip`
- `/equipment/unequip-all`
- `/inventory/expand`
- `/inventory/organize`
- `/inventory/sell`
- `/inventory/split`
- `/inventory/use`
- `/mall/buy`
- `/mall/products`
- `/payment/buy`
- `/skill`
- `/statistics`