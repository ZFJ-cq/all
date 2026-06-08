-- ============================================
-- 修复角色缺失字段
-- 用于解决角色境界、性别等为 null 的问题
-- ============================================

-- 1. 检查 game_role 表结构
DESC game_role;

-- 2. 查看现有角色数据
SELECT id, user_id, role_name, gender, realm, level, exp FROM game_role;

-- 3. 更新测试角色数据（如果有角色但字段为空）
UPDATE game_role 
SET 
    gender = '男',
    realm = '炼气一层',
    level = 1,
    exp = 0
WHERE id = 1 AND (gender IS NULL OR realm IS NULL);

-- 4. 如果 game_role 表没有角色，创建一个默认角色
INSERT INTO game_role (user_id, role_name, gender, realm, level, exp, create_time)
SELECT 
    1,
    '测试角色',
    '男',
    '炼气一层',
    1,
    0,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM game_role WHERE user_id = 1);

-- 5. 确保角色资源数据存在
INSERT INTO role_resource (role_id, resource_type_id, amount)
SELECT 
    1,
    rt.id,
    CASE 
        WHEN rt.type_code = 'LINGSHI' THEN 10000
        WHEN rt.type_code = 'XIANSHI' THEN 1000
        WHEN rt.type_code = 'SHOUMING' THEN 100
        WHEN rt.type_code = 'XIUWEI' THEN 0
        WHEN rt.type_code = 'XIANLI' THEN 0
        WHEN rt.type_code = 'HUNSHI' THEN 0
        WHEN rt.type_code = 'LINGQI' THEN 0
        ELSE 0
    END
FROM resource_type rt
WHERE NOT EXISTS (
    SELECT 1 FROM role_resource rr 
    WHERE rr.role_id = 1 AND rr.resource_type_id = rt.id
);

-- 6. 验证修复结果
SELECT 
    r.id,
    r.role_name,
    r.gender,
    r.realm,
    r.level,
    r.exp,
    '角色数据' AS data_type
FROM game_role r
WHERE r.id = 1

UNION ALL

SELECT 
    rr.role_id,
    rt.type_name,
    rt.type_code,
    CAST(rr.amount AS CHAR),
    NULL,
    NULL,
    '资源数据'
FROM role_resource rr
JOIN resource_type rt ON rr.resource_type_id = rt.id
WHERE rr.role_id = 1;

-- 7. 显示修复后的完整信息
SELECT 
    '✅ 修复完成！角色信息：' AS message,
    r.role_name AS 角色名,
    r.gender AS 性别,
    r.realm AS 境界,
    r.level AS 等级,
    r.exp AS 经验
FROM game_role r
WHERE r.id = 1;
