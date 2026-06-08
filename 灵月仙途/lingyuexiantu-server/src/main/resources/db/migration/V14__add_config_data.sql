-- 配置表数据初始化脚本

-- 1. 确保配置表存在
CREATE TABLE IF NOT EXISTS t_cfg_numerical_rules (
    config_key VARCHAR(64) NOT NULL PRIMARY KEY,
    config_version INT DEFAULT 1 NOT NULL,
    content JSON NOT NULL,
    description VARCHAR(255),
    updated_by VARCHAR(32),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

-- 2. 插入装备槽位配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('equipment_slots', 1, '{"slots":[{"slot_id":"weapon","name":"武器","icon":"⚔️","index":0},{"slot_id":"head","name":"头部","icon":"👒","index":1},{"slot_id":"body","name":"身体","icon":"👕","index":2},{"slot_id":"legs","name":"腿部","icon":"👖","index":3},{"slot_id":"feet","name":"鞋子","icon":"👢","index":4},{"slot_id":"accessory","name":"饰品","icon":"🐉","index":5}]}', '装备槽位配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 3. 插入境界系数配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('realm_mult', 1, '{"1":{"name":"凡人","hp_mul":1.0,"atk_mul":1.0,"def_mul":1.0,"weight":1},"2":{"name":"练气期","hp_mul":1.5,"atk_mul":1.5,"def_mul":1.2,"weight":2},"3":{"name":"筑基期","hp_mul":2.0,"atk_mul":2.0,"def_mul":1.5,"weight":3},"4":{"name":"金丹期","hp_mul":3.0,"atk_mul":3.0,"def_mul":2.0,"weight":4},"5":{"name":"元婴期","hp_mul":4.0,"atk_mul":4.0,"def_mul":2.5,"weight":5},"6":{"name":"化神期","hp_mul":5.0,"atk_mul":5.0,"def_mul":3.0,"weight":6},"7":{"name":"合体期","hp_mul":6.0,"atk_mul":6.0,"def_mul":3.5,"weight":7},"8":{"name":"大乘期","hp_mul":7.0,"atk_mul":7.0,"def_mul":4.0,"weight":8},"9":{"name":"渡劫期","hp_mul":8.0,"atk_mul":8.0,"def_mul":4.5,"weight":9},"10":{"name":"仙人","hp_mul":10.0,"atk_mul":10.0,"def_mul":5.0,"weight":10}}', '境界系数配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 4. 插入公式系数配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('formula_coef', 1, '{"hp_base":100,"atk_spirit":8,"atk_vit":1,"def_vit":5,"def_agi":2,"speed":10,"crit_luck":0.001,"crit_spirit":0.0002,"dodge":0.005,"hit_base":0.9,"hit_agi":0.003,"exp_base":1.0,"exp_wis":0.01}', '公式系数配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 5. 插入属性上限配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('stat_caps', 1, '{"crit_rate":0.60,"dodge_rate":0.45,"hit_rate":0.95}', '属性上限配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 6. 插入属性名称配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('stat_names', 1, '{"vit":"根骨","spi":"灵力","agi":"身法","wis":"悟性","lck":"气运","maxHp":"气血","attack":"攻击力","defense":"防御力","speed":"速度","critRate":"暴击率","dodgeRate":"闪避率","hitRate":"命中率","expBonus":"经验加成"}', '属性名称配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 7. 插入境界突破配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('realm_breakthrough', 1, '{"凡人":{"next":"练气期","requiredLevel":10,"requiredSpirit":100,"successRate":1.0,"failurePenalty":0,"lifespan":100},"练气期":{"next":"筑基期","requiredLevel":30,"requiredSpirit":500,"successRate":0.8,"failurePenalty":5,"lifespan":200},"筑基期":{"next":"金丹期","requiredLevel":60,"requiredSpirit":1500,"successRate":0.6,"failurePenalty":10,"lifespan":300},"金丹期":{"next":"元婴期","requiredLevel":100,"requiredSpirit":3000,"successRate":0.4,"failurePenalty":15,"lifespan":500},"元婴期":{"next":"化神期","requiredLevel":150,"requiredSpirit":6000,"successRate":0.3,"failurePenalty":20,"lifespan":800},"化神期":{"next":"合体期","requiredLevel":210,"requiredSpirit":10000,"successRate":0.2,"failurePenalty":25,"lifespan":1200},"合体期":{"next":"大乘期","requiredLevel":280,"requiredSpirit":15000,"successRate":0.15,"failurePenalty":30,"lifespan":1800},"大乘期":{"next":"渡劫期","requiredLevel":360,"requiredSpirit":25000,"successRate":0.1,"failurePenalty":35,"lifespan":2500},"渡劫期":{"next":"仙人","requiredLevel":450,"requiredSpirit":50000,"successRate":0.05,"failurePenalty":40,"lifespan":5000},"仙人":{"next":null,"requiredLevel":0,"requiredSpirit":0,"successRate":0,"failurePenalty":0,"lifespan":99999}}', '境界突破配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 8. 插入数值规则配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('numerical_rules', 1, '{"baseStatGrowth":{"vit":2,"spi":3,"agi":2,"wis":1,"lck":1},"levelUpBonus":{"vit":1,"spi":1,"agi":1,"wis":0.5,"lck":0.5},"realmBonusMultiplier":1.5,"equipmentBonusCap":0.3,"skillBonusCap":0.2,"pillEffectDuration":3600000,"maxAttributePoints":999,"maxLevel":999,"maxRealmLevel":10}', '数值规则配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 9. 插入装备品质配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('equipment_quality', 1, '{"凡品":{"color":"#888888","prefix":"","suffix":"","baseBonus":0.1,"affixCount":1},"良品":{"color":"#4CAF50","prefix":"优质","suffix":"","baseBonus":0.2,"affixCount":2},"珍品":{"color":"#2196F3","prefix":"稀有","suffix":"","baseBonus":0.3,"affixCount":3},"极品":{"color":"#9C27B0","prefix":"卓越","suffix":"","baseBonus":0.4,"affixCount":4},"仙品":{"color":"#FF9800","prefix":"神器","suffix":"","baseBonus":0.5,"affixCount":5}}', '装备品质配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 10. 插入丹药效果配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('pill_effects', 1, '{"经验丹":{"type":"exp","value":1000,"duration":0,"cooldown":300000},"修为丹":{"type":"spirit","value":500,"duration":0,"cooldown":600000},"气血丹":{"type":"hp","value":500,"duration":0,"cooldown":180000},"根骨丹":{"type":"vit","value":1,"duration":0,"cooldown":86400000},"灵力丹":{"type":"spi","value":1,"duration":0,"cooldown":86400000},"身法丹":{"type":"agi","value":1,"duration":0,"cooldown":86400000},"悟性丹":{"type":"wis","value":1,"duration":0,"cooldown":86400000},"气运丹":{"type":"lck","value":1,"duration":0,"cooldown":86400000},"速度丹":{"type":"speed","value":10,"duration":3600000,"cooldown":1800000},"暴击丹":{"type":"critRate","value":0.1,"duration":3600000,"cooldown":1800000},"闪避丹":{"type":"dodgeRate","value":0.1,"duration":3600000,"cooldown":1800000}}', '丹药效果配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 11. 插入技能升级配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('skill_upgrade', 1, '{"1":{"requiredLevel":1,"requiredSpirit":100,"successRate":1.0,"failurePenalty":0},"2":{"requiredLevel":10,"requiredSpirit":300,"successRate":0.9,"failurePenalty":5},"3":{"requiredLevel":20,"requiredSpirit":600,"successRate":0.8,"failurePenalty":10},"4":{"requiredLevel":30,"requiredSpirit":1000,"successRate":0.7,"failurePenalty":15},"5":{"requiredLevel":40,"requiredSpirit":1500,"successRate":0.6,"failurePenalty":20},"6":{"requiredLevel":50,"requiredSpirit":2100,"successRate":0.5,"failurePenalty":25},"7":{"requiredLevel":60,"requiredSpirit":2800,"successRate":0.4,"failurePenalty":30},"8":{"requiredLevel":70,"requiredSpirit":3600,"successRate":0.3,"failurePenalty":35},"9":{"requiredLevel":80,"requiredSpirit":4500,"successRate":0.2,"failurePenalty":40},"10":{"requiredLevel":90,"requiredSpirit":5500,"successRate":0.1,"failurePenalty":45}}', '技能升级配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 12. 插入背包配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('inventory_config', 1, '{"maxPages":5,"slotsPerPage":24,"initialPages":2,"expandCost":{"2":10,"3":20,"4":30,"5":50},"maxItemStack":999,"autoOrganizeDelay":1000,"searchDelay":300}', '背包配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 13. 插入战斗配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('combat_config', 1, '{"turnTimeout":30000,"maxTurns":50,"criticalDamageMultiplier":1.5,"dodgeSuccessRate":0.8,"hitBaseRate":0.9,"missPenalty":0.5,"victoryExpBonus":1.2,"defeatExpPenalty":0.5,"maxBattleLevelDifference":20,"minBattleLevelDifference":-10}', '战斗配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 14. 插入任务配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('task_config', 1, '{"maxActiveTasks":5,"taskRefreshInterval":86400000,"dailyTaskLimit":10,"weeklyTaskLimit":30,"monthlyTaskLimit":100,"taskExpMultiplier":1.0,"taskSpiritMultiplier":1.0,"taskItemDropRate":0.8,"taskCooldown":3600000}', '任务配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 15. 插入活动配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('activity_config', 1, '{"maxConcurrentActivities":5,"activityCheckInterval":300000,"eventNotificationDelay":60000,"activityRewardMultiplier":1.0,"activityParticipationLimit":10,"activityCooldown":1800000}', '活动配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 16. 插入宗门配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('clan_config', 1, '{"maxClanMembers":50,"clanCreationCost":1000,"clanJoinLevel":10,"clanDonationLimit":1000,"clanUpgradeCost":{"1":10000,"2":50000,"3":100000,"4":500000,"5":1000000},"clanBonusMultiplier":0.1,"clanSkillLimit":10,"clanBuildingLimit":5}', '宗门配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 17. 插入修炼配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('cultivation_config', 1, '{"baseCultivationRate":1,"realmCultivationMultiplier":1.5,"meditationBonus":0.5,"autoCultivationInterval":300000,"maxCultivationTime":86400000,"cultivationExpMultiplier":1.0,"cultivationSpiritMultiplier":1.0,"breakthroughAttemptLimit":10,"breakthroughCostMultiplier":1.5}', '修炼配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 18. 插入云游配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('travel_config', 1, '{"baseTravelTime":3600000,"maxTravelDistance":100,"travelExpMultiplier":1.2,"travelItemDropRate":0.7,"travelCooldown":1800000,"maxConcurrentTravels":1,"travelCost":10,"travelRewardMultiplier":1.0}', '云游配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 19. 插入成就配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('achievement_config', 1, '{"maxAchievements":100,"achievementCheckInterval":60000,"achievementRewardMultiplier":1.0,"achievementNotificationDelay":1000,"achievementCategoryLimit":10,"achievementTierLimit":5}', '成就配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 20. 插入邮件配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('mail_config', 1, '{"maxMailStorage":100,"mailExpiryDays":30,"mailCheckInterval":60000,"mailSendLimit":50,"mailAttachmentLimit":10,"mailNotificationDelay":5000}', '邮件配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 21. 插入商城配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('mall_config', 1, '{"maxProducts":100,"productRefreshInterval":86400000,"purchaseLimit":999,"discountLimit":0.5,"vipDiscount":0.1,"dailyPurchaseLimit":50,"weeklyPurchaseLimit":200}', '商城配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 22. 插入排行榜配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('leaderboard_config', 1, '{"maxRankings":100,"rankUpdateInterval":300000,"rankRewardInterval":86400000,"rankRewardMultiplier":1.0,"rankDisplayLimit":50,"rankRefreshDelay":5000}', '排行榜配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 23. 插入好友配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('friend_config', 1, '{"maxFriends":100,"friendRequestLimit":50,"friendCheckInterval":60000,"friendGiftLimit":10,"friendGiftCooldown":86400000,"friendNotificationDelay":5000}', '好友配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 24. 插入交易配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('trade_config', 1, '{"maxTrades":50,"tradeCheckInterval":30000,"tradeTaxRate":0.05,"tradeCooldown":3600000,"tradeLimitPerDay":10,"tradeMinimumValue":1,"tradeMaximumValue":1000000}', '交易配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);

-- 25. 插入系统配置
INSERT INTO t_cfg_numerical_rules (config_key, config_version, content, description, updated_by)
VALUES ('system_config', 1, '{"serverName":"灵月仙途","serverVersion":"1.0.0","maintenanceMode":false,"maxPlayers":1000,"playerLevelCap":999,"realmCap":10,"chatMessageLimit":100,"chatCooldown":1000,"loginAttemptLimit":5,"loginCooldown":30000,"apiRequestLimit":1000,"apiRequestCooldown":60000,"sessionTimeout":3600000,"tokenExpiry":86400000}', '系统配置', 'system')
ON DUPLICATE KEY UPDATE
    content = VALUES(content),
    description = VALUES(description),
    updated_by = VALUES(updated_by),
    updated_at = CURRENT_TIMESTAMP(3);
