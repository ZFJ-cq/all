-- 灵月仙途 - 检查锻体系统数据库状态
-- 用于诊断和修复数据库问题

-- 1. 检查所有表是否存在
SELECT 'Checking tables...' AS info;

SELECT 
    TABLE_NAME,
    TABLE_COMMENT
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'lingyuexiantu' 
AND TABLE_NAME LIKE 'body%'
ORDER BY TABLE_NAME;

-- 2. 检查境界数据
SELECT 'Checking realms...' AS info;
SELECT COUNT(*) as realm_count FROM body_cultivation_realm;
SELECT * FROM body_cultivation_realm ORDER BY realm_order LIMIT 5;

-- 3. 检查部位数据
SELECT 'Checking parts...' AS info;
SELECT COUNT(*) as part_count FROM body_part;
SELECT * FROM body_part ORDER BY id;

-- 4. 检查角色锻体数据
SELECT 'Checking role body cultivation...' AS info;
SELECT COUNT(*) as role_count FROM role_body_cultivation;
SELECT rbc.*, r.name as role_name 
FROM role_body_cultivation rbc
LEFT JOIN game_role r ON rbc.role_id = r.id
ORDER BY rbc.role_id LIMIT 10;

-- 5. 检查特定角色（45 号）的数据
SELECT 'Checking role 45...' AS info;
SELECT rbc.*, r.name as role_name
FROM role_body_cultivation rbc
LEFT JOIN game_role r ON rbc.role_id = r.id
WHERE rbc.role_id = 45;

-- 6. 检查角色 45 的部位进度
SELECT 'Checking role 45 parts...' AS info;
SELECT rbpp.*, bp.part_name
FROM role_body_part_progress rbpp
LEFT JOIN body_part bp ON rbpp.part_id = bp.id
WHERE rbpp.role_id = 45;

-- 7. 如果角色 45 不存在，插入初始数据
SELECT 'Inserting data for role 45 if not exists...' AS info;

INSERT INTO role_body_cultivation (role_id, realm_id, body_exp, pain_value, tolerance, status)
SELECT 
    45 as role_id,
    1 as realm_id,
    0 as body_exp,
    0.00 as pain_value,
    0 as tolerance,
    1 as status
WHERE NOT EXISTS (
    SELECT 1 FROM role_body_cultivation WHERE role_id = 45
);

INSERT INTO role_body_part_progress (role_id, part_id, level, exp, cultivate_count, is_locked)
SELECT 
    45 as role_id,
    1 as part_id,
    1 as level,
    0 as exp,
    0 as cultivate_count,
    0 as is_locked
WHERE NOT EXISTS (
    SELECT 1 FROM role_body_part_progress WHERE role_id = 45 AND part_id = 1
);

INSERT INTO role_body_part_progress (role_id, part_id, level, exp, cultivate_count, is_locked)
SELECT 
    45 as role_id,
    2 as part_id,
    1 as level,
    0 as exp,
    0 as cultivate_count,
    0 as is_locked
WHERE NOT EXISTS (
    SELECT 1 FROM role_body_part_progress WHERE role_id = 45 AND part_id = 2
);

-- 8. 验证插入结果
SELECT 'Verifying inserted data...' AS info;
SELECT * FROM role_body_cultivation WHERE role_id = 45;
SELECT rbpp.*, bp.part_name FROM role_body_part_progress rbpp 
LEFT JOIN body_part bp ON rbpp.part_id = bp.id 
WHERE rbpp.role_id = 45;
