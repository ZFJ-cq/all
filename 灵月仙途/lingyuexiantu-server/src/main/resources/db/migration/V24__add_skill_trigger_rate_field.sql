-- 添加技能触发概率字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS trigger_rate INT DEFAULT 50 COMMENT '技能触发概率（百分比），数值越大触发概率越低' AFTER dodge_bonus;
