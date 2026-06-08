-- 插入日常任务
INSERT INTO task (name, task_type, is_active, description, condition_type, condition_value, activity_points, sort_order, rewards) VALUES
('每日修炼', 'DAILY', 1, '每日完成修炼获取修为', 'CULTIVATE', 1, 10, 1, '{"xiuwei": 50}'),
('每日锻体', 'DAILY', 1, '每日完成锻体修炼', 'BODY_CULTIVATE', 1, 10, 2, '{"body_exp": 30}'),
('每日签到', 'DAILY', 1, '每日登录签到', 'LOGIN', 1, 5, 3, '{"lingshi": 100}'),
('每日历练', 'DAILY', 1, '每日完成历练任务', 'ADVENTURE', 1, 15, 4, '{"xiuwei": 80, "lingshi": 200}'),
('每日突破', 'DAILY', 1, '尝试突破境界', 'BREAKTHROUGH', 1, 20, 5, '{"xiuwei": 100}');

-- 插入基础丹药物品
INSERT INTO item (name, type, description, price, stackable, max_stack, use_effect, status) VALUES
('聚气丹', 1, '服用后增加修为50点', 100, 1, 999, '{"type":"add_xiuwei","value":50}', 1),
('回春丹', 2, '服用后恢复气血100点', 80, 1, 999, '{"type":"add_hp","value":100}', 1),
('回灵丹', 3, '服用后恢复法力80点', 60, 1, 999, '{"type":"add_mp","value":80}', 1),
('培元丹', 1, '服用后增加修为200点', 500, 1, 999, '{"type":"add_xiuwei","value":200}', 1),
('洗髓丹', 4, '服用后随机增加一项基础属性1点', 1000, 1, 99, '{"type":"add_stat","value":1}', 1);

-- 插入更多身体部位
INSERT INTO body_part (part_code, part_name, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, sort_order, status) VALUES
('HEAD', '头部神识', '泥丸宫所在，神识之源', '悟性', '精神', 200, 1.30, 50, 3, 1),
('TORSO', '躯干气血', '丹田所在，气血之海', '根骨', '精神', 250, 1.35, 50, 4, 1),
('SKIN', '肌肤防御', '皮膜如铁，防御之基', '根骨', '敏捷', 120, 1.15, 50, 5, 1),
('BONES', '筋骨力量', '筋骨如钢，力量之本', '根骨', '气运', 180, 1.25, 50, 6, 1),
('MERIDIAN', '经脉通道', '经脉畅通，灵力之途', '灵力', '悟性', 300, 1.40, 50, 7, 1),
('DANTIAN', '丹田灵海', '灵力汇聚之地', '灵力', '根骨', 350, 1.45, 50, 8, 1),
('SENSE', '五感灵觉', '眼耳鼻舌身，感知天地', '敏捷', '悟性', 160, 1.20, 50, 9, 1),
('HEART', '道心意志', '道心坚定，意志如铁', '气运', '悟性', 400, 1.50, 50, 10, 1);

-- 验证
SELECT 'task' AS tbl, COUNT(*) AS cnt FROM task WHERE task_type='DAILY' AND is_active=1
UNION ALL SELECT 'item', COUNT(*) FROM item WHERE name IN ('聚气丹','回春丹','回灵丹')
UNION ALL SELECT 'body_part', COUNT(*) FROM body_part;
