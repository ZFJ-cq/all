-- 修复skill表缺失的triggerRate字段

-- 添加triggerRate字段
ALTER TABLE skill ADD COLUMN IF NOT EXISTS trigger_rate INT DEFAULT 50 COMMENT '技能触发概率（百分比），数值越大触发概率越低' AFTER dodge_bonus;

-- 更新现有技能的triggerRate字段
UPDATE skill SET trigger_rate = 50 WHERE trigger_rate IS NULL;

-- 插入更多基础技能数据
INSERT INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, trigger_rate, status) VALUES
('基础拳法', '最基础的拳法招式，简单易学', '攻击', 1, 12, 80, 0, 40, 0, 0, 0, 0, 45, 1),
('风刃术', '操控风元素形成刀刃攻击敌人', '攻击', 1, 12, 150, 0, 60, 30, 0, 8, 0, 55, 1),
('水疗术', '利用水元素治疗伤口', '辅助', 1, 12, 0, 50, 80, 40, 0, 0, 0, 40, 1),
('土遁术', '借助土元素之力遁入地下', '辅助', 1, 12, 0, 80, 120, 0, 150, 0, 80, 60, 1),
('闪电术', '召唤闪电攻击敌人', '攻击', 1, 12, 250, 0, 100, 60, 0, 15, 0, 50, 1),
('隐身术', '暂时隐身，躲避敌人', '辅助', 1, 12, 0, 0, 180, 80, 200, 0, 100, 70, 1),
('力劈华山', '强大的物理攻击技能', '攻击', 1, 12, 300, 0, 120, 0, 0, 12, 0, 55, 1),
('金钟罩', '强大的防御技能', '防御', 1, 12, 0, 400, 150, 50, 0, 0, 0, 45, 1),
('踏雪无痕', '轻盈的身法，提高闪避', '身法', 1, 12, 0, 0, 60, 0, 180, 0, 90, 40, 1),
('万剑归宗', '高级剑法，召唤多把剑攻击敌人', '攻击', 1, 12, 400, 0, 250, 100, 0, 25, 0, 65, 1);

SELECT '✅ skill表修复完成，triggerRate字段已添加并初始化！' AS message;
