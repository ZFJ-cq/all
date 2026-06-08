-- 数据库字段完整性修复脚本
-- 用于补充可能缺失的字段，确保数据库架构兼容
-- Flyway 迁移脚本 V13

-- ========================================
-- 1. role_asset 表字段补充
-- ========================================
ALTER TABLE role_asset 
ADD COLUMN IF NOT EXISTS subtype VARCHAR(50) COMMENT '物品子类型',
ADD COLUMN IF NOT EXISTS rarity INT DEFAULT 1 COMMENT '品质等级',
ADD COLUMN IF NOT EXISTS description TEXT COMMENT '物品描述',
ADD COLUMN IF NOT EXISTS effect TEXT COMMENT '物品效果',
ADD COLUMN IF NOT EXISTS affixes JSON COMMENT '附加属性',
ADD COLUMN IF NOT EXISTS create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
ADD COLUMN IF NOT EXISTS update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- ========================================
-- 2. role_item 表字段补充
-- ========================================
ALTER TABLE role_item 
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255) COMMENT '物品名称',
ADD COLUMN IF NOT EXISTS item_type VARCHAR(50) COMMENT '物品类型',
ADD COLUMN IF NOT EXISTS subtype VARCHAR(50) COMMENT '物品子类型',
ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 0 COMMENT '数量',
ADD COLUMN IF NOT EXISTS rarity INT DEFAULT 1 COMMENT '品质等级',
ADD COLUMN IF NOT EXISTS description TEXT COMMENT '物品描述',
ADD COLUMN IF NOT EXISTS effect TEXT COMMENT '物品效果',
ADD COLUMN IF NOT EXISTS affixes JSON COMMENT '附加属性',
ADD COLUMN IF NOT EXISTS create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
ADD COLUMN IF NOT EXISTS update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- ========================================
-- 3. role_equipment 表字段补充
-- ========================================
ALTER TABLE role_equipment 
ADD COLUMN IF NOT EXISTS slot_id INT COMMENT '装备槽位 ID',
ADD COLUMN IF NOT EXISTS item_name VARCHAR(255) COMMENT '装备名称',
ADD COLUMN IF NOT EXISTS item_type VARCHAR(50) COMMENT '装备类型',
ADD COLUMN IF NOT EXISTS rarity INT DEFAULT 1 COMMENT '品质等级',
ADD COLUMN IF NOT EXISTS base_stats JSON COMMENT '基础属性',
ADD COLUMN IF NOT EXISTS affixes JSON COMMENT '附加属性',
ADD COLUMN IF NOT EXISTS spirit JSON COMMENT '器灵信息',
ADD COLUMN IF NOT EXISTS spirit_level INT DEFAULT 0 COMMENT '器灵等级',
ADD COLUMN IF NOT EXISTS durability INT DEFAULT 100 COMMENT '耐久度',
ADD COLUMN IF NOT EXISTS create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
ADD COLUMN IF NOT EXISTS update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- ========================================
-- 4. role_clan 表字段补充
-- ========================================
ALTER TABLE role_clan 
ADD COLUMN IF NOT EXISTS position INT DEFAULT 0 COMMENT '职位',
ADD COLUMN IF NOT EXISTS join_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
ADD COLUMN IF NOT EXISTS contribution INT DEFAULT 0 COMMENT '贡献度',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'normal' COMMENT '状态',
ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0 COMMENT '乐观锁版本号';

-- ========================================
-- 5. clan 表字段补充
-- ========================================
ALTER TABLE clan 
ADD COLUMN IF NOT EXISTS level INT DEFAULT 1 COMMENT '宗门等级',
ADD COLUMN IF NOT EXISTS members_count INT DEFAULT 0 COMMENT '成员数量',
ADD COLUMN IF NOT EXISTS max_members INT DEFAULT 50 COMMENT '最大成员数',
ADD COLUMN IF NOT EXISTS leader_id BIGINT COMMENT '宗主角色 ID',
ADD COLUMN IF NOT EXISTS leader_name VARCHAR(100) COMMENT '宗主名称',
ADD COLUMN IF NOT EXISTS description TEXT COMMENT '宗门描述',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'normal' COMMENT '状态',
ADD COLUMN IF NOT EXISTS create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
ADD COLUMN IF NOT EXISTS update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- ========================================
-- 6. role_skill 表字段补充
-- ========================================
ALTER TABLE role_skill 
ADD COLUMN IF NOT EXISTS skill_level INT DEFAULT 1 COMMENT '技能等级',
ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 COMMENT '修炼进度',
ADD COLUMN IF NOT EXISTS is_equipped TINYINT(1) DEFAULT 0 COMMENT '是否装备',
ADD COLUMN IF NOT EXISTS create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
ADD COLUMN IF NOT EXISTS update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- ========================================
-- 7. role_task 表字段补充
-- ========================================
ALTER TABLE role_task 
ADD COLUMN IF NOT EXISTS task_type VARCHAR(50) COMMENT '任务类型',
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' COMMENT '任务状态',
ADD COLUMN IF NOT EXISTS progress INT DEFAULT 0 COMMENT '任务进度',
ADD COLUMN IF NOT EXISTS reward_claimed TINYINT(1) DEFAULT 0 COMMENT '奖励是否领取',
ADD COLUMN IF NOT EXISTS create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
ADD COLUMN IF NOT EXISTS update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- ========================================
-- 8. game_role 表字段补充
-- ========================================
ALTER TABLE game_role 
ADD COLUMN IF NOT EXISTS body_level VARCHAR(50) COMMENT '肉身境界',
ADD COLUMN IF NOT EXISTS body_strength INT DEFAULT 0 COMMENT '肉身强度',
ADD COLUMN IF NOT EXISTS spirit_root VARCHAR(100) COMMENT '灵根',
ADD COLUMN IF NOT EXISTS avatar VARCHAR(255) COMMENT '头像',
ADD COLUMN IF NOT EXISTS status INT DEFAULT 1 COMMENT '状态(1-启用，0-禁用)';

-- ========================================
-- 9. role_assets 表字段补充（对应实体类 RoleAsset）
-- ========================================
ALTER TABLE role_assets 
ADD COLUMN IF NOT EXISTS version INT DEFAULT 0 COMMENT '乐观锁版本号';

-- ========================================
-- 10. role_clans 表字段补充（对应实体类 RoleClan）
-- ========================================
ALTER TABLE role_clans 
ADD COLUMN IF NOT EXISTS `rank` INT DEFAULT 0 COMMENT '宗门内排名',
ADD COLUMN IF NOT EXISTS join_date VARCHAR(20) COMMENT '加入日期';

-- ========================================
-- 11. 索引优化
-- ========================================
CREATE INDEX IF NOT EXISTS idx_role_asset_role_id ON role_asset(role_id);
CREATE INDEX IF NOT EXISTS idx_role_asset_type ON role_asset(asset_type);
CREATE INDEX IF NOT EXISTS idx_role_item_role_id ON role_item(role_id);
CREATE INDEX IF NOT EXISTS idx_role_item_type ON role_item(item_type);
CREATE INDEX IF NOT EXISTS idx_role_equipment_role_id ON role_equipment(role_id);
CREATE INDEX IF NOT EXISTS idx_role_equipment_slot ON role_equipment(slot_id);
CREATE INDEX IF NOT EXISTS idx_role_clan_role_id ON role_clan(role_id);
CREATE INDEX IF NOT EXISTS idx_role_clan_clan_id ON role_clan(clan_id);
CREATE INDEX IF NOT EXISTS idx_role_skill_role_id ON role_skill(role_id);
CREATE INDEX IF NOT EXISTS idx_role_task_role_id ON role_task(role_id);
CREATE INDEX IF NOT EXISTS idx_clan_status ON clan(status);
CREATE INDEX IF NOT EXISTS idx_game_role_user_id ON game_role(user_id);
CREATE INDEX IF NOT EXISTS idx_game_role_realm ON game_role(realm);
CREATE INDEX IF NOT EXISTS idx_game_role_status ON game_role(status);
CREATE INDEX IF NOT EXISTS idx_role_assets_role_id ON role_assets(role_id);
CREATE INDEX IF NOT EXISTS idx_role_assets_asset_type ON role_assets(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_role_clans_role_id ON role_clans(role_id);
CREATE INDEX IF NOT EXISTS idx_role_clans_clan_id ON role_clans(clan_id);

-- ========================================
-- 12. 数据完整性检查
-- ========================================
UPDATE role_asset SET subtype = 'general' WHERE subtype IS NULL;
UPDATE role_asset SET rarity = 1 WHERE rarity IS NULL;
UPDATE role_item SET subtype = 'general' WHERE subtype IS NULL;
UPDATE role_item SET quantity = 0 WHERE quantity IS NULL;
UPDATE role_item SET rarity = 1 WHERE rarity IS NULL;
UPDATE role_equipment SET rarity = 1 WHERE rarity IS NULL;
UPDATE role_equipment SET durability = 100 WHERE durability IS NULL;
UPDATE role_clan SET position = 0 WHERE position IS NULL;
UPDATE role_clan SET contribution = 0 WHERE contribution IS NULL;
UPDATE role_clan SET status = 'normal' WHERE status IS NULL;
UPDATE clan SET level = 1 WHERE level IS NULL;
UPDATE clan SET members_count = 0 WHERE members_count IS NULL;
UPDATE clan SET max_members = 50 WHERE max_members IS NULL;
UPDATE clan SET status = 'normal' WHERE status IS NULL;
UPDATE role_skill SET skill_level = 1 WHERE skill_level IS NULL;
UPDATE role_skill SET progress = 0 WHERE progress IS NULL;
UPDATE role_skill SET is_equipped = 0 WHERE is_equipped IS NULL;
UPDATE role_task SET status = 'pending' WHERE status IS NULL;
UPDATE role_task SET progress = 0 WHERE progress IS NULL;
UPDATE role_task SET reward_claimed = 0 WHERE reward_claimed IS NULL;
UPDATE game_role SET body_level = '凡人' WHERE body_level IS NULL;
UPDATE game_role SET body_strength = 0 WHERE body_strength IS NULL;
UPDATE game_role SET spirit_root = '无' WHERE spirit_root IS NULL;
UPDATE game_role SET status = 1 WHERE status IS NULL;
UPDATE role_assets SET version = 0 WHERE version IS NULL;
UPDATE role_clans SET `rank` = 0 WHERE `rank` IS NULL;
UPDATE role_clans SET join_date = DATE_FORMAT(NOW(), '%Y-%m-%d') WHERE join_date IS NULL;
UPDATE role_clans SET status = 'active' WHERE status IS NULL;
UPDATE role_clans SET contribution = 0 WHERE contribution IS NULL;