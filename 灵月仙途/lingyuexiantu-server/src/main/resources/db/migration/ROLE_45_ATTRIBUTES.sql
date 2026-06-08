-- ============================================
-- 灵月仙途 - 角色 45 属性数据快速插入脚本
-- 执行方式：直接在数据库管理工具中执行
-- ============================================

-- 1. 插入角色基础属性（如果不存在）
INSERT INTO t_player_stats_base (
    role_id, base_vit, base_spi, base_agi, base_wis, base_lck,
    perm_vit, perm_spi, perm_agi, perm_wis, perm_lck,
    tmp_vit, tmp_spi, tmp_agi, tmp_wis, tmp_lck,
    realm_level, total_cultivation, created_at, updated_at
) VALUES (
    45,
    120, 100, 100, 15, 50,  -- 基础属性：根骨 120, 灵力 100, 身法 100, 悟性 15, 气运 50
    0, 0, 0, 0, 0,          -- 永久加成
    0, 0, 0, 0, 0,          -- 临时加成
    0,                      -- 境界等级（凡人）
    0,                      -- 总修为
    NOW(), NOW()
) ON DUPLICATE KEY UPDATE 
    base_vit = VALUES(base_vit),
    base_spi = VALUES(base_spi),
    base_agi = VALUES(base_agi),
    base_wis = VALUES(base_wis),
    base_lck = VALUES(base_lck);

-- 2. 插入属性缓存数据（预计算结果）
INSERT INTO t_role_attribute_cache (
    role_id, hp, hp_max, mp, mp_max, atk, def, speed, 
    crit_rate, dodge_rate, exp_bonus,
    total_vit, total_spi, total_agi, total_wis, total_lck,
    calc_version, calculated_at, created_at, updated_at
) VALUES (
    45,
    12000, 12000,  -- HP = 120 × 100 = 12,000
    5000, 5000,    -- MP = 100 × 50 = 5,000
    920,           -- ATK = (100×8 + 120×1) = 920
    800,           -- DEF = (120×5 + 100×2) = 800
    1000,          -- Speed = 100 × 10 = 1,000
    7.00,          -- Crit = (50×0.1% + 100×0.02%) = 7%
    5.00,          -- Dodge = (100×0.5%) = 5%
    1.15,          -- Exp = 1.0 + (15×1%) = 1.15
    120, 100, 100, 15, 50,  -- 总属性
    1,             -- 计算版本
    NOW(), NOW(), NOW()
) ON DUPLICATE KEY UPDATE 
    hp = VALUES(hp),
    hp_max = VALUES(hp_max),
    mp = VALUES(mp),
    mp_max = VALUES(mp_max),
    atk = VALUES(atk),
    def = VALUES(def),
    speed = VALUES(speed),
    crit_rate = VALUES(crit_rate),
    dodge_rate = VALUES(dodge_rate),
    exp_bonus = VALUES(exp_bonus);

-- 3. 更新角色寿命信息
UPDATE game_role 
SET 
    age = 18,
    max_age = 100,
    life_status = 0,
    reincarnation_count = 0,
    cultivation_base = 1.0,
    longevity_bonus = 0,
    updated_at = NOW()
WHERE id = 45;

-- 4. 验证插入结果
SELECT '✅ 角色 45 属性数据插入完成！' AS message;

SELECT 
    role_id,
    CONCAT('HP:', hp_max, ' | MP:', mp_max, ' | ATK:', atk, ' | DEF:', def, ' | SPD:', speed) AS main_attributes,
    CONCAT('Crit:', crit_rate, '% | Dodge:', dodge_rate, '% | Exp:', exp_bonus, 'x') AS secondary_attributes
FROM t_role_attribute_cache 
WHERE role_id = 45;
