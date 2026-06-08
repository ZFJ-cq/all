-- ============================================
-- API 与数据库字段兼容性修复脚本
-- 自动生成
-- ============================================

SET FOREIGN_KEY_CHECKS = 0;

-- 修复 achievement_claim_record 表缺失字段
ALTER TABLE achievement_claim_record
  ADD COLUMN IF NOT EXISTS `rewardItems` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `rewardAttributes` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `claimTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `titleGranted` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `errorMessage` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `achievementId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `requestId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `claimIp` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `traceId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 body_part 表缺失字段
ALTER TABLE body_part
  ADD COLUMN IF NOT EXISTS `updated_at` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `created_at` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `primaryAttr` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `partCode` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `partName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `sort_order` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `secondaryAttr` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_realm_breakthrough 表缺失字段
ALTER TABLE role_realm_breakthrough
  ADD COLUMN IF NOT EXISTS `roleName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `newRealm` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `oldRealm` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `breakthroughTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 skill 表缺失字段
ALTER TABLE skill
  ADD COLUMN IF NOT EXISTS `triggerRate` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `skillName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `skillType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `maxLevel` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `attackBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `defenseBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `speedBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `spiritPowerBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `skillLevel` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `criticalBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `xiuweiBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `dodgeBonus` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 equipment 表缺失字段
ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS `level` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `mpBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `attack` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `defense` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `hpBonus` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 sys_user_role 表缺失字段
ALTER TABLE sys_user_role
  ADD COLUMN IF NOT EXISTS `userId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_activity 表缺失字段
ALTER TABLE role_activity
  ADD COLUMN IF NOT EXISTS `updateTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `resetTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 activity 表缺失字段
ALTER TABLE activity
  ADD COLUMN IF NOT EXISTS `endTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `startTime` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 audit_log 表缺失字段
ALTER TABLE audit_log
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `errorMessage` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `oldValue` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `newValue` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `traceId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `executionTimeMs` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `requestParams` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `operatorIp` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_skill 表缺失字段
ALTER TABLE role_skill
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `skillId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `skillLevel` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_body_cultivation 表缺失字段
ALTER TABLE role_body_cultivation
  ADD COLUMN IF NOT EXISTS `realmId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `injuryRecoveryTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `mutationId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `lastCultivateTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 inventory 表缺失字段
ALTER TABLE inventory
  ADD COLUMN IF NOT EXISTS `itemName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `itemId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `itemType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updateTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 activity_reward 表缺失字段
ALTER TABLE activity_reward
  ADD COLUMN IF NOT EXISTS `rewardItems` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `isEnabled` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `sortOrder` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `rewardLingshi` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `rewardXiuwei` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `activityThreshold` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 sys_role 表缺失字段
ALTER TABLE sys_role
  ADD COLUMN IF NOT EXISTS `roleName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `customDataScope` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleCode` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_walk_fire_status 表缺失字段
ALTER TABLE role_walk_fire_status
  ADD COLUMN IF NOT EXISTS `endTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `remainingMinutes` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `startTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 map_node 表缺失字段
ALTER TABLE map_node
  ADD COLUMN IF NOT EXISTS `requiredLevel` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `description` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `type` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `cost` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 sys_login_log 表缺失字段
ALTER TABLE sys_login_log
  ADD COLUMN IF NOT EXISTS `logoutTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `userId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `ipAddress` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `errorMessage` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `ipLocation` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `userAgent` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `loginType` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 asset_modification_log 表缺失字段
ALTER TABLE asset_modification_log
  ADD COLUMN IF NOT EXISTS `assetId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `modifiedBy` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `oldValue` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `newValue` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `fieldName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `modifiedAt` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 game_role 表缺失字段
ALTER TABLE game_role
  ADD COLUMN IF NOT EXISTS `lifeStatus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `maxAge` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `userId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `longevityBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `bodyLevel` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `bodyStrength` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `spiritRoot` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `cultivationBase` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `reincarnationCount` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `deathTime` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_resource 表缺失字段
ALTER TABLE role_resource
  ADD COLUMN IF NOT EXISTS `resourceTypeId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_auto_cultivation_config 表缺失字段
ALTER TABLE role_auto_cultivation_config
  ADD COLUMN IF NOT EXISTS `lastCultivationTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 mail 表缺失字段
ALTER TABLE mail
  ADD COLUMN IF NOT EXISTS `hasAttachment` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `userId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `isRead` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `sendTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `expireTime` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 system_setting 表缺失字段
ALTER TABLE system_setting
  ADD COLUMN IF NOT EXISTS `key` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `value` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_base_stats 表缺失字段
ALTER TABLE role_base_stats
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 cfg_realm_attribute_mult 表缺失字段
ALTER TABLE cfg_realm_attribute_mult
  ADD COLUMN IF NOT EXISTS `critMult` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `realmName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `atkMult` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `maxAge` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `hpMult` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `defMult` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `realmLevel` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `speedMult` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `expMult` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `dodgeMult` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 sys_user 表缺失字段
ALTER TABLE sys_user
  ADD COLUMN IF NOT EXISTS `role` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `email` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 sys_menu 表缺失字段
ALTER TABLE sys_menu
  ADD COLUMN IF NOT EXISTS `updateTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `menuType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `menuName` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 task_log 表缺失字段
ALTER TABLE task_log
  ADD COLUMN IF NOT EXISTS `rewardInfo` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `progressBefore` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `ipAddress` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `actionType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `taskId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `progressAfter` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `loopCount` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `timeSpent` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `userAgent` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 body_cultivation_realm 表缺失字段
ALTER TABLE body_cultivation_realm
  ADD COLUMN IF NOT EXISTS `painGrowthRate` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `realmName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `failurePenalty` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `realmOrder` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `mutationProbability` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `breakthroughSuccessRate` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `requiredExp` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_body_part_progress 表缺失字段
ALTER TABLE role_body_part_progress
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `partId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 body_mutation 表缺失字段
ALTER TABLE body_mutation
  ADD COLUMN IF NOT EXISTS `activationCondition` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `created_at` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `mutationName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `sort_order` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `effectType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `effectValue` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `mutationCode` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 permission 表缺失字段
ALTER TABLE permission
  ADD COLUMN IF NOT EXISTS `is_button` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `method` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updateTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `require_verification` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `parent_id` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `apiPath` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `is_sensitive` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_item 表缺失字段
ALTER TABLE role_item
  ADD COLUMN IF NOT EXISTS `itemId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `acquire_time` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `version` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `position` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `acquireTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 sys_operation_log 表缺失字段
ALTER TABLE sys_operation_log
  ADD COLUMN IF NOT EXISTS `operatorNickname` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `operatorUsername` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `ipAddress` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `dataSnapshotBefore` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `operationType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `errorMessage` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `apiPath` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `ipLocation` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `executionTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `verificationCode` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `dataSnapshotAfter` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `requestMethod` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `requestParams` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `userAgent` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `operatorId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 breakthrough_history 表缺失字段
ALTER TABLE breakthrough_history
  ADD COLUMN IF NOT EXISTS `penaltyValue` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `pityCount` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `successRate` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `ipAddress` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `randomSeed` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `fromRealm` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `bonusItems` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `penaltyType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `isSuccess` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `toRealm` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `consumedXiuwei` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 sys_role_permission 表缺失字段
ALTER TABLE sys_role_permission
  ADD COLUMN IF NOT EXISTS `create_time` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `permissionId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `id` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 sys_menu_permission 表缺失字段
ALTER TABLE sys_menu_permission
  ADD COLUMN IF NOT EXISTS `create_time` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `permissionId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `menuId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `id` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 asset_information 表缺失字段
ALTER TABLE asset_information
  ADD COLUMN IF NOT EXISTS `value` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `isActive` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `assetTypeCode` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `deletedAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `name` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updatedAt` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 sect_apply 表缺失字段
ALTER TABLE sect_apply
  ADD COLUMN IF NOT EXISTS `userId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `applyTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `sectId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `handlerId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `handleTime` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 body_cultivation_material 表缺失字段
ALTER TABLE body_cultivation_material
  ADD COLUMN IF NOT EXISTS `base_price` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `materialType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `materialCode` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `created_at` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `effectDescription` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `sourceDescription` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `materialName` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 technique_change_log 表缺失字段
ALTER TABLE technique_change_log
  ADD COLUMN IF NOT EXISTS `newLimitBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `cultivationProgress` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `userId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `cultivationTaskId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `techniqueId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `actionType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `oldSpeedBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `currentXiuwei` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `changeTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `oldLimitBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `newSpeedBonus` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 role_task 表缺失字段
ALTER TABLE role_task
  ADD COLUMN IF NOT EXISTS `claimTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `updateTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `taskId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 clan_member 表缺失字段
ALTER TABLE clan_member
  ADD COLUMN IF NOT EXISTS `totalContribution` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `lastLoginTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `clanId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `isApproved` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `joinTime` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 body_cultivation_log 表缺失字段
ALTER TABLE body_cultivation_log
  ADD COLUMN IF NOT EXISTS `materialsConsumed` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `realmId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `toleranceAfter` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `painValueAfter` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `toleranceBefore` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `partId` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `actionType` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `painValueBefore` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `createdAt` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `resultDescription` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `roleId` VARCHAR(255) COMMENT '自动添加的字段';

-- 修复 item 表缺失字段
ALTER TABLE item
  ADD COLUMN IF NOT EXISTS `use_effect` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `useEffect` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `status` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `price` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `maxStack` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `stackable` VARCHAR(255) COMMENT '自动添加的字段',
  ADD COLUMN IF NOT EXISTS `max_stack` VARCHAR(255) COMMENT '自动添加的字段';

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ 兼容性修复完成！' AS message;