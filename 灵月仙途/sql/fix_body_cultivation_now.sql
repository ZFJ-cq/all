-- 直接修复锻体修炼问题 - 立即执行
-- 在 MySQL 中运行：mysql -u root -p12345678 lingyuexiantu < fix_body_cultivation_now.sql

-- 1. 确保境界表有数据
INSERT INTO body_cultivation_realm (id, realm_name, realm_order, description, base_hp_bonus, base_defense_bonus, base_strength_bonus, breakthrough_success_rate, required_exp, pain_growth_rate, mutation_probability, failure_penalty, status)
VALUES (1, '锻体境', 1, '锻体初境，打磨肉身', 10, 5, 3, 90.00, 1000, 1.00, 0.00, 'NONE', 1)
ON DUPLICATE KEY UPDATE realm_name = realm_name;

-- 2. 确保部位表有数据（四肢、五脏）
INSERT INTO body_part (id, part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status)
VALUES 
(1, '四肢', 'limbs', '手臂与腿部力量锤炼', '力量', '敏捷', 100, 1.2, 50, 1),
(2, '五脏', 'organs', '心肝脾肺肾内脏淬炼', '气血', '防御', 150, 1.25, 50, 1)
ON DUPLICATE KEY UPDATE part_name = part_name;

-- 3. 确保角色 45 有锻体数据
INSERT INTO role_body_cultivation (role_id, realm_id, body_exp, pain_value, tolerance, status, total_cultivate_count, total_breakthrough_count, failed_breakthrough_count)
VALUES (45, 1, 0, 0.00, 0, 1, 0, 0, 0)
ON DUPLICATE KEY UPDATE role_id = role_id;

-- 4. 确保角色 45 有部位进度数据
INSERT INTO role_body_part_progress (role_id, part_id, level, exp, cultivate_count, is_locked)
VALUES 
(45, 1, 1, 0, 0, 0),
(45, 2, 1, 0, 0, 0)
ON DUPLICATE KEY UPDATE role_id = role_id;

-- 5. 验证数据
SELECT '=== 境界数据 ===' AS info;
SELECT * FROM body_cultivation_realm;

SELECT '=== 部位数据 ===' AS info;
SELECT * FROM body_part;

SELECT '=== 角色 45 锻体数据 ===' AS info;
SELECT rbc.*, r.name as role_name 
FROM role_body_cultivation rbc
LEFT JOIN game_role r ON rbc.role_id = r.id
WHERE rbc.role_id = 45;

SELECT '=== 角色 45 部位进度 ===' AS info;
SELECT rbpp.*, bp.part_name
FROM role_body_part_progress rbpp
LEFT JOIN body_part bp ON rbpp.part_id = bp.id
WHERE rbpp.role_id = 45;
