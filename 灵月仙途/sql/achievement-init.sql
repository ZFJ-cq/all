-- ============================================
-- 灵月仙途 - 成就称号系统数据库初始化脚本
-- ============================================

-- 1. 更新 achievement 表结构
-- ============================================

-- 添加新字段
ALTER TABLE achievement ADD COLUMN IF NOT EXISTS module_type VARCHAR(100) COMMENT '所属模块：cultivation, sect, skill, world';
ALTER TABLE achievement ADD COLUMN IF NOT EXISTS condition_type VARCHAR(50) COMMENT '条件类型';
ALTER TABLE achievement ADD COLUMN IF NOT EXISTS operator VARCHAR(10) COMMENT '操作符：>=, ==, >, <, <=';
ALTER TABLE achievement ADD COLUMN IF NOT EXISTS threshold INT COMMENT '阈值';
ALTER TABLE achievement ADD COLUMN IF NOT EXISTS reward_attributes VARCHAR(255) COMMENT '奖励属性 JSON';
ALTER TABLE achievement ADD COLUMN IF NOT EXISTS title VARCHAR(50) COMMENT '奖励称号名称';
ALTER TABLE achievement ADD COLUMN IF NOT EXISTS rarity VARCHAR(20) COMMENT '稀有度：common, rare, epic, legendary';
ALTER TABLE achievement ADD COLUMN IF NOT EXISTS icon VARCHAR(10) COMMENT '图标';
ALTER TABLE achievement ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT FALSE COMMENT '是否隐藏成就';

-- 2. 更新 role_achievement 表结构
-- ============================================

ALTER TABLE role_achievement ADD COLUMN IF NOT EXISTS is_equipped BOOLEAN DEFAULT FALSE COMMENT '是否佩戴此称号';

-- 3. 插入成就配置数据
-- ============================================

-- 清空现有数据（可选，生产环境请注释）
-- DELETE FROM achievement;

-- 修炼模块成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, 
                         condition, status, sort_order)
VALUES 
-- 初入仙途
('初入仙途', 'login', 'cultivation', 'login_days', '>=', 1, 
 '{"attack":10,"defense":10}', '修仙者', 'common', '🌟', FALSE, 
 '首次登录游戏，踏上修仙之路', 1, 1),

-- 修炼达人
('修炼达人', 'cultivate', 'cultivation', 'cultivation_count', '>=', 100, 
 '{"attack":50,"defense":50,"qi":100}', '苦修者', 'rare', '🧘', FALSE, 
 '累计完成 100 次修炼', 1, 2),

-- 金丹大道
('金丹大道', 'breakthrough', 'cultivation', 'realm_breakthrough', '>=', 5, 
 '{"attack":200,"defense":150,"intelligence":10}', '金丹真人', 'epic', '🔮', FALSE, 
 '境界突破至金丹期', 1, 3),

-- 灵气满溢
('灵气满溢', 'qi', 'cultivation', 'qi_accumulation', '>=', 10000, 
 '{"qi":500,"mana":500,"cultivation":"5%"}', '聚灵仙君', 'legendary', '💫', FALSE, 
 '累计积累 10000 点灵气', 1, 4),

-- 连续登录
('持之以恒', 'login', 'cultivation', 'login_days', '>=', 30, 
 '{"defense":100,"health":500}', '坚守者', 'rare', '📅', FALSE, 
 '连续登录 30 天', 1, 5);

-- 宗门模块成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, 
                         condition, status, sort_order)
VALUES 
-- 宗门新秀
('宗门新秀', 'sect', 'sect', 'sect_contribution', '>=', 1000, 
 '{"defense":100,"sect_reputation":10}', '宗门精英', 'rare', '🏯', FALSE, 
 '累计获得 1000 点宗门贡献', 1, 10),

-- 勤勉弟子
('勤勉弟子', 'sect_task', 'sect', 'sect_tasks', '>=', 50, 
 '{"attack":80,"defense":80}', '勤勉真人', 'rare', '📜', FALSE, 
 '完成 50 次宗门任务', 1, 11),

-- 一派长老
('一派长老', 'sect_level', 'sect', 'sect_level', '>=', 10, 
 '{"attack":150,"defense":150,"intelligence":15}', '宗门长老', 'epic', '👑', FALSE, 
 '宗门等级达到 10 级', 1, 12),

-- 宗门贡献者
('宗门贡献者', 'sect', 'sect', 'sect_contribution', '>=', 10000, 
 '{"attack":200,"defense":200,"sect_reputation":50}', '宗门守护神', 'legendary', '🏛️', FALSE, 
 '累计获得 10000 点宗门贡献', 1, 13);

-- 技能模块成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, 
                         condition, status, sort_order)
VALUES 
-- 博学多才
('博学多才', 'skill', 'skill', 'techniques_learned', '>=', 10, 
 '{"intelligence":20,"mana":300}', '博学者', 'rare', '📚', FALSE, 
 '累计学习 10 门功法', 1, 20),

-- 登峰造极
('登峰造极', 'skill_max', 'skill', 'max_level_skills', '>=', 1, 
 '{"attack":100,"critical":"5%","intelligence":10}', '宗师', 'epic', '⚡', FALSE, 
 '将一门技能修炼至满级', 1, 21),

-- 融会贯通
('融会贯通', 'skill_combo', 'skill', 'skill_combos', '>=', 5, 
 '{"attack":120,"defense":120,"critical":"3%"}', '通悟真君', 'legendary', '🌈', FALSE, 
 '解锁 5 个技能组合', 1, 22),

-- 技能大师
('技能大师', 'skill', 'skill', 'skill_upgrades', '>=', 100, 
 '{"attack":150,"intelligence":25,"mana":500}', '技能之神', 'epic', '🎯', FALSE, 
 '累计升级技能 100 次', 1, 23);

-- 世界模块成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, 
                         condition, status, sort_order)
VALUES 
-- 斩妖除魔
('斩妖除魔', 'world', 'world', 'monster_kills', '>=', 1000, 
 '{"attack":200,"critical":"5%"}', '降妖师', 'epic', '⚔️', FALSE, 
 '累计击败 1000 只妖兽', 1, 30),

-- 踏遍山河
('踏遍山河', 'explore', 'world', 'map_exploration', '>=', 80, 
 '{"agility":30,"dodge":"5%","movement":"10%"}', '云游散仙', 'legendary', '🗺️', FALSE, 
 '地图探索度达到 80%', 1, 31),

-- 秘境征服者
('秘境征服者', 'dungeon', 'world', 'dungeons_cleared', '>=', 20, 
 '{"attack":150,"defense":150,"health":1000}', '秘境之王', 'epic', '🏆', FALSE, 
 '通关 20 次副本', 1, 32),

-- 天命之人
('天命之人', 'world_event', 'world', 'world_events', '>=', 10, 
 '{"intelligence":25,"luck":20,"cultivation":"10%"}', '天命仙尊', 'legendary', '🌟', FALSE, 
 '参与 10 次世界事件', 1, 33),

-- 奇遇连连
('奇遇连连', 'encounter', 'world', 'successful_encounters', '>=', 50, 
 '{"luck":50,"critical":"10%","dodge":"10%"}', '幸运儿', 'epic', '🍀', FALSE, 
 '成功触发 50 次奇遇', 1, 34),

-- 物品收藏家
('收藏家', 'collect', 'world', 'items_collected', '>=', 1000, 
 '{"storage":100,"luck":15}', '收藏大师', 'rare', '🎒', FALSE, 
 '累计收集 1000 个物品', 1, 35);

-- 通用模块成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, 
                         condition, status, sort_order)
VALUES 
-- 任务达人
('任务达人', 'task', 'general', 'tasks_completed', '>=', 200, 
 '{"attack":100,"defense":100,"exp_bonus":"10%"}', '任务大师', 'epic', '✅', FALSE, 
 '完成 200 次任务', 1, 40),

-- 勤劳致富
('勤劳致富', 'general', 'general', 'login_days', '>=', 100, 
 '{"attack":300,"defense":300,"health":2000}', '勤劳真人', 'legendary', '💪', FALSE, 
 '累计登录 100 天', 1, 41);

-- 隐藏成就
INSERT INTO achievement (name, type, module_type, condition_type, operator, threshold, 
                         reward_attributes, title, rarity, icon, hidden, 
                         condition, status, sort_order)
VALUES 
-- 神秘成就
('神秘成就', 'secret', 'special', 'secret', '>=', 999, 
 '{"attack":999,"defense":999,"intelligence":99}', '？？？', 'legendary', '❓', TRUE, 
 '??? 达成条件未知 ???', 1, 99);

-- 4. 初始化测试数据（可选）
-- ============================================

-- 为测试角色初始化成就进度（请替换 roleId）
-- INSERT INTO role_achievement (role_id, achievement_id, progress, status, is_equipped)
-- SELECT 1, id, 0, 'in_progress', FALSE FROM achievement;

-- 5. 查询语句示例
-- ============================================

-- 查询所有启用的成就
-- SELECT * FROM achievement WHERE status = 1 ORDER BY sort_order;

-- 按模块查询成就
-- SELECT * FROM achievement WHERE module_type = 'cultivation' AND status = 1;

-- 查询传说级成就
-- SELECT * FROM achievement WHERE rarity = 'legendary' AND status = 1;

-- 查询角色的成就进度
-- SELECT a.*, ra.progress, ra.status, ra.is_equipped 
-- FROM achievement a
-- LEFT JOIN role_achievement ra ON a.id = ra.achievement_id AND ra.role_id = 1
-- WHERE a.status = 1
-- ORDER BY a.sort_order;

-- 6. 数据修复和清理（可选）
-- ============================================

-- 修复缺失的字段（如果已有数据）
UPDATE achievement SET 
  module_type = CASE 
    WHEN type IN ('login', 'cultivate', 'breakthrough', 'qi') THEN 'cultivation'
    WHEN type IN ('sect', 'sect_task', 'sect_level') THEN 'sect'
    WHEN type IN ('skill', 'skill_max', 'skill_combo') THEN 'skill'
    WHEN type IN ('world', 'explore', 'dungeon', 'world_event', 'encounter', 'collect') THEN 'world'
    ELSE 'general'
  END
WHERE module_type IS NULL;

-- 设置默认的 operator
UPDATE achievement SET operator = '>=' WHERE operator IS NULL;

-- 设置默认的 hidden 值
UPDATE achievement SET hidden = FALSE WHERE hidden IS NULL;

-- ============================================
-- 脚本执行完成
-- ============================================

-- 验证插入结果
SELECT 
  module_type, 
  COUNT(*) as count,
  SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as enabled
FROM achievement 
GROUP BY module_type;

-- 总计
SELECT 
  COUNT(*) as total_achievements,
  SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as enabled,
  SUM(CASE WHEN rarity = 'common' THEN 1 ELSE 0 END) as common,
  SUM(CASE WHEN rarity = 'rare' THEN 1 ELSE 0 END) as rare,
  SUM(CASE WHEN rarity = 'epic' THEN 1 ELSE 0 END) as epic,
  SUM(CASE WHEN rarity = 'legendary' THEN 1 ELSE 0 END) as legendary,
  SUM(CASE WHEN hidden = TRUE THEN 1 ELSE 0 END) as hidden
FROM achievement;
