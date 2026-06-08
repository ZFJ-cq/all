-- 直接执行添加 trigger_rate 字段的 SQL
USE lingyue_xiantu;

-- 添加字段
ALTER TABLE skill
ADD COLUMN IF NOT EXISTS trigger_rate INT DEFAULT 100 COMMENT '技能触发概率（百分比），100 表示 100% 概率触发，数值越大触发概率越低';

-- 更新现有技能数据
UPDATE skill SET trigger_rate = 100 WHERE skill_name IN ('基础剑法', '火球术');
UPDATE skill SET trigger_rate = 150 WHERE skill_name IN ('冰魄术', '天雷诀');
UPDATE skill SET trigger_rate = 80 WHERE skill_name = '灵力护盾';
UPDATE skill SET trigger_rate = 120 WHERE skill_name = '金刚诀';
UPDATE skill SET trigger_rate = 200 WHERE skill_name = '聚气诀';
UPDATE skill SET trigger_rate = 180 WHERE skill_name = '九转玄功';
UPDATE skill SET trigger_rate = 90 WHERE skill_name = '瞬影步';
UPDATE skill SET trigger_rate = 110 WHERE skill_name = '五行遁术';

-- 验证结果
SELECT id, skill_name, skill_type, trigger_rate FROM skill ORDER BY id;
