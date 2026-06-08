-- 初始化数据脚本
-- 为角色添加寿命数据和物品数据
-- Flyway 迁移脚本 V14

-- ========================================
-- 1. 为角色添加寿命数据
-- ========================================
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '寿命', '寿命', 100, 'general', 1, '角色的寿命', '影响角色的存活时间', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 100, 
update_time = CURRENT_TIMESTAMP;

-- ========================================
-- 2. 为角色添加物品数据
-- ========================================
-- 武器
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '装备', '铁剑', 1, 'weapon', 2, '一把普通的铁剑', '增加攻击力', '{"attack": 10, "crit": 5}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 1, 
update_time = CURRENT_TIMESTAMP;

-- 头部装备
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '装备', '皮帽', 1, 'head', 1, '一顶普通的皮帽', '增加防御力', '{"defense": 5}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 1, 
update_time = CURRENT_TIMESTAMP;

-- 身体装备
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '装备', '皮甲', 1, 'body', 1, '一件普通的皮甲', '增加防御力', '{"defense": 8}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 1, 
update_time = CURRENT_TIMESTAMP;

-- 腿部装备
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '装备', '皮裤', 1, 'legs', 1, '一条普通的皮裤', '增加防御力', '{"defense": 6}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 1, 
update_time = CURRENT_TIMESTAMP;

-- 鞋子
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '装备', '皮靴', 1, 'feet', 1, '一双普通的皮靴', '增加速度', '{"speed": 10}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 1, 
update_time = CURRENT_TIMESTAMP;

-- 饰品
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '装备', '铜戒指', 1, 'pet', 1, '一枚普通的铜戒指', '增加攻击力', '{"attack": 3}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 1, 
update_time = CURRENT_TIMESTAMP;

-- 消耗品
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '消耗品', '回血丹', 5, 'consumable', 1, '恢复气血的丹药', '恢复100点气血', '{"hp": 100}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 5, 
update_time = CURRENT_TIMESTAMP;

-- 丹药
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '丹药', '培元丹', 3, 'pill', 2, '提升修为的丹药', '增加100点修为', '{"exp": 100}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 3, 
update_time = CURRENT_TIMESTAMP;

-- 材料
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '材料', '铁矿石', 10, 'material', 1, '用于锻造的铁矿石', '锻造材料', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 10, 
update_time = CURRENT_TIMESTAMP;

-- 任务物品
INSERT INTO role_asset (role_id, asset_type, asset_name, quantity, subtype, rarity, description, effect, affixes, create_time, update_time)
VALUES 
(45, '任务物品', '狼皮', 2, 'quest', 1, '任务需要的狼皮', '任务物品', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
quantity = 2, 
update_time = CURRENT_TIMESTAMP;

-- ========================================
-- 3. 为角色添加初始装备
-- ========================================
INSERT INTO role_equipment (role_id, slot_id, item_name, item_type, rarity, base_stats, affixes, spirit, spirit_level, durability, create_time, update_time)
VALUES 
(45, 1, '铁剑', 'weapon', 2, '{"attack": 10, "crit": 5}', NULL, NULL, 0, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(45, 2, '皮帽', 'head', 1, '{"defense": 5}', NULL, NULL, 0, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(45, 3, '皮甲', 'body', 1, '{"defense": 8}', NULL, NULL, 0, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(45, 4, '皮裤', 'legs', 1, '{"defense": 6}', NULL, NULL, 0, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(45, 5, '皮靴', 'feet', 1, '{"speed": 10}', NULL, NULL, 0, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(45, 6, '铜戒指', 'pet', 1, '{"attack": 3}', NULL, NULL, 0, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE 
update_time = CURRENT_TIMESTAMP;
