-- ============================================
-- 灵月仙途 - 角色 45 属性数据初始化
-- 执行日期：2026-03-31
-- 说明：为角色 45 创建完整的属性数据
-- ============================================

-- 1. 确保 game_role 表中角色 45 存在
INSERT INTO game_role (id, user_id, role_name, gender, realm, level, hp, mp, spirit_root, avatar, body_level, body_strength, age, max_age, life_status, reincarnation_count, cultivation_base, longevity_bonus, create_time)
SELECT 45, 1, '测试角色', 1, '凡人', 1, 1000, 500, '金灵根', '', '锻体初期', 10, 18, 100, 0, 0, 1.0, 0, NOW()
WHERE NOT EXISTS (SELECT 1 FROM game_role WHERE id = 45);

-- 2. 确保 player_stats_base 表中角色 45 的基础属性存在
-- 假设角色 45 的基础属性：
-- 根骨 (Vit): 120
-- 灵力 (Spi): 100
-- 身法 (Agi): 100
-- 悟性 (Wis): 15
-- 气运 (Lck): 50
-- 境界：凡人 (realm_level = 0)
INSERT INTO t_player_stats_base (
    role_id, base_vit, base_spi, base_agi, base_wis, base_lck,
    perm_vit, perm_spi, perm_agi, perm_wis, perm_lck,
    tmp_vit, tmp_spi, tmp_agi, tmp_wis, tmp_lck,
    realm_level, total_cultivation, created_at, updated_at
)
SELECT 
    45,
    120, 100, 100, 15, 50,  -- 基础属性
    0, 0, 0, 0, 0,          -- 永久加成
    0, 0, 0, 0, 0,          -- 临时加成
    0,                      -- 境界等级（凡人）
    0,                      -- 总修为
    NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM t_player_stats_base WHERE role_id = 45);

-- 3. 为角色 45 创建属性缓存数据（预计算结果）
-- 计算公式（凡人境界，所有倍率=1.0）：
-- HP = (120 × 100) × 1.0 = 12,000
-- MP = 100 × 50 = 5,000
-- ATK = (100 × 8 + 120 × 1) × 1.0 = 920
-- DEF = (120 × 5 + 100 × 2) × 1.0 = 800
-- Speed = 100 × 10 = 1,000
-- Crit Rate = (50 × 0.001 + 100 × 0.0002) × 100 = 7%
-- Dodge Rate = (100 × 0.005) × 100 = 5%
-- Exp Bonus = 1.0 + (15 × 0.01) = 1.15
INSERT INTO t_role_attribute_cache (
    role_id, hp, hp_max, mp, mp_max, atk, def, speed, 
    crit_rate, dodge_rate, exp_bonus,
    total_vit, total_spi, total_agi, total_wis, total_lck,
    calc_version, calculated_at, created_at, updated_at
)
SELECT 
    45,
    12000, 12000,  -- HP, HP Max
    5000, 5000,    -- MP, MP Max
    920,           -- ATK
    800,           -- DEF
    1000,          -- Speed
    7.00,          -- Crit Rate (%)
    5.00,          -- Dodge Rate (%)
    1.15,          -- Exp Bonus
    120, 100, 100, 15, 50,  -- 总属性
    1,             -- Calc Version
    NOW(),         -- Calculated At
    NOW(), NOW()   -- Created At, Updated At
WHERE NOT EXISTS (SELECT 1 FROM t_role_attribute_cache WHERE role_id = 45);

-- 4. 更新 game_role 表的寿命字段
UPDATE game_role 
SET 
    age = 18,
    max_age = 100,  -- 凡人期最大年龄
    life_status = 0,  -- 存活
    death_time = NULL,
    reincarnation_count = 0,
    cultivation_base = 1.0,
    longevity_bonus = 0
WHERE id = 45;

-- ============================================
-- 验证数据
-- ============================================
SELECT '✅ 角色 45 属性数据初始化完成！' AS message;

-- 验证基础属性
SELECT 
    '基础属性' AS category,
    role_id,
    CONCAT('根骨:', base_vit, ', 灵力:', base_spi, ', 身法:', base_agi, ', 悟性:', base_wis, ', 气运:', base_lck) AS stats
FROM t_player_stats_base 
WHERE role_id = 45;

-- 验证属性缓存
SELECT 
    '属性缓存' AS category,
    role_id,
    CONCAT('HP:', hp_max, ', MP:', mp_max, ', ATK:', atk, ', DEF:', def, ', Speed:', speed) AS main_stats,
    CONCAT('Crit:', crit_rate, '%, Dodge:', dodge_rate, '%, Exp:', exp_bonus, 'x') AS secondary_stats
FROM t_role_attribute_cache 
WHERE role_id = 45;

-- 验证寿命信息
SELECT 
    '寿命信息' AS category,
    id AS role_id,
    CONCAT('年龄:', age, '/', max_age, ', 状态:', 
        CASE life_status 
            WHEN 0 THEN '存活' 
            WHEN 1 THEN '坐化中' 
            WHEN 2 THEN '已故' 
            ELSE '未知' 
        END,
        ', 轮回:', reincarnation_count
    ) AS longevity_info
FROM game_role 
WHERE id = 45;
