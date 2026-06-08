-- 直接插入锻体部位数据（四肢和五脏）
DELETE FROM body_part;

INSERT INTO body_part (part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status, sort_order) VALUES
('四肢', 'LIMBS', '双手双足，力量之源', '力量', '敏捷', 100, 1.2, 50, 1, 1),
('五脏', 'ORGANS', '心肝脾肺肾，生命之本', '气血', '精神', 150, 1.25, 50, 1, 2);

-- 验证插入结果
SELECT * FROM body_part;
