-- 更新锻体部位为四肢和五脏
-- 先删除旧的部位数据
DELETE FROM body_part;

-- 插入新的部位数据
INSERT INTO body_part (part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status, sort_order) VALUES
('四肢', 'LIMBS', '双手双足，力量之源', '力量', '敏捷', 100, 1.2, 50, 1, 1),
('五脏', 'ORGANS', '心肝脾肺肾，生命之本', '气血', '精神', 150, 1.25, 50, 1, 2);

-- 更新角色部位进度，将所有旧部位合并到新部位
-- 首先删除所有角色的部位进度（因为部位 ID 已变更）
DELETE FROM role_body_part_progress;
