-- 为角色 45 添加所有技能的学习记录
-- 执行方式：在 MySQL 客户端中运行此脚本

USE lingyue_xiantu;

-- 插入所有技能到角色技能表
INSERT INTO role_skill (role_id, skill_id, skill_level, experience, equipped) VALUES
(45, 1, 5, 2500, true),    -- 基础剑法 - 已装备
(45, 2, 3, 1200, false),   -- 灵力护盾
(45, 3, 7, 5800, true),    -- 聚气诀 - 已装备
(45, 4, 4, 1800, false),   -- 瞬影步
(45, 5, 6, 3200, false),   -- 火球术
(45, 6, 4, 1600, false),   -- 冰魄术
(45, 7, 5, 2400, false),   -- 金刚诀
(45, 8, 3, 900, false),    -- 天雷诀
(45, 9, 4, 1500, false),   -- 五行遁术
(45, 10, 2, 600, false)    -- 九转玄功
ON DUPLICATE KEY UPDATE 
    skill_level = VALUES(skill_level),
    experience = VALUES(experience),
    equipped = VALUES(equipped);

-- 验证插入结果
SELECT 
    rs.role_id,
    s.skill_name,
    s.skill_type,
    rs.skill_level,
    rs.experience,
    CASE 
        WHEN rs.equipped = 1 THEN '已装备'
        WHEN rs.role_id IS NOT NULL THEN '已学习'
        ELSE '未学习'
    END as status
FROM role_skill rs
JOIN skill s ON rs.skill_id = s.id
WHERE rs.role_id = 45
ORDER BY s.skill_type, s.skill_name;
