-- 为skill表添加缺失的字段

-- 添加attack_bonus字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS attack_bonus INT DEFAULT 0 COMMENT '增加攻击力' AFTER max_level;

-- 添加defense_bonus字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS defense_bonus INT DEFAULT 0 COMMENT '增加防御力' AFTER attack_bonus;

-- 添加xiuwei_bonus字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS xiuwei_bonus INT DEFAULT 0 COMMENT '增加修为' AFTER defense_bonus;

-- 添加spirit_power_bonus字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS spirit_power_bonus INT DEFAULT 0 COMMENT '增加神力' AFTER xiuwei_bonus;

-- 添加speed_bonus字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS speed_bonus INT DEFAULT 0 COMMENT '增加速度' AFTER spirit_power_bonus;

-- 添加critical_bonus字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS critical_bonus INT DEFAULT 0 COMMENT '增加暴击率' AFTER speed_bonus;

-- 添加dodge_bonus字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS dodge_bonus INT DEFAULT 0 COMMENT '增加闪避率' AFTER critical_bonus;

-- 添加trigger_rate字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS trigger_rate INT DEFAULT 50 COMMENT '技能触发概率（百分比），数值越大触发概率越低' AFTER dodge_bonus;

-- 添加status字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS status INT DEFAULT 1 COMMENT '状态：1 启用，0 禁用' AFTER trigger_rate;

-- 初始化现有数据的缺失字段值
UPDATE skill SET attack_bonus = 0 WHERE attack_bonus IS NULL;
UPDATE skill SET defense_bonus = 0 WHERE defense_bonus IS NULL;
UPDATE skill SET xiuwei_bonus = 0 WHERE xiuwei_bonus IS NULL;
UPDATE skill SET spirit_power_bonus = 0 WHERE spirit_power_bonus IS NULL;
UPDATE skill SET speed_bonus = 0 WHERE speed_bonus IS NULL;
UPDATE skill SET critical_bonus = 0 WHERE critical_bonus IS NULL;
UPDATE skill SET dodge_bonus = 0 WHERE dodge_bonus IS NULL;
UPDATE skill SET trigger_rate = 50 WHERE trigger_rate IS NULL;
UPDATE skill SET status = 1 WHERE status IS NULL;

-- 验证修改结果
SELECT '✅ skill表缺失字段添加完成！' AS message;