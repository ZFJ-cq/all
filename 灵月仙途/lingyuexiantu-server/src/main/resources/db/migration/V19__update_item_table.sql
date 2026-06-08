-- 更新物品表结构以匹配 Item 实体类

DELIMITER //
CREATE PROCEDURE update_item_table()
BEGIN
    -- 检查并添加 id 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'item' AND column_name = 'id') THEN
        ALTER TABLE `item` ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY;
    END IF;
    
    -- 检查并添加 price 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'item' AND column_name = 'price') THEN
        ALTER TABLE `item` ADD COLUMN `price` INT DEFAULT 0;
    END IF;
    
    -- 检查并添加 status 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'item' AND column_name = 'status') THEN
        ALTER TABLE `item` ADD COLUMN `status` INT DEFAULT 1;
    END IF;
    
    -- 检查并添加 max_stack 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'item' AND column_name = 'max_stack') THEN
        ALTER TABLE `item` ADD COLUMN `max_stack` INT DEFAULT 1;
    END IF;
    
    -- 检查并添加 stackable 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'item' AND column_name = 'stackable') THEN
        ALTER TABLE `item` ADD COLUMN `stackable` INT DEFAULT 1;
    END IF;
    
    -- 检查并修改 description 列类型
    IF EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'item' AND column_name = 'description' AND data_type != 'text') THEN
        ALTER TABLE `item` MODIFY COLUMN `description` TEXT;
    END IF;
    
    -- 检查并修改 type 列类型
    IF EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'item' AND column_name = 'type') THEN
        ALTER TABLE `item` MODIFY COLUMN `type` INT DEFAULT 1;
    ELSE
        ALTER TABLE `item` ADD COLUMN `type` INT DEFAULT 1;
    END IF;
    
    -- 检查并添加 use_effect 列
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'item' AND column_name = 'use_effect') THEN
        ALTER TABLE `item` ADD COLUMN `use_effect` VARCHAR(255);
    END IF;
END //
DELIMITER ;

CALL update_item_table();
DROP PROCEDURE IF EXISTS update_item_table;

-- 更新物品数据
UPDATE `item` SET `stackable` = 1, `price` = 0, `status` = 1 WHERE `stackable` IS NULL OR `price` IS NULL OR `status` IS NULL;

-- 插入一些基本物品数据
INSERT IGNORE INTO `item` (`name`, `description`, `type`, `use_effect`, `stackable`, `max_stack`, `price`, `status`)
VALUES 
('聚气丹', '聚集天地灵气，增加修为', 1, '增加100点修为', 1, 99, 100, 1),
('筑基丹', '辅助突破筑基境界', 1, '增加突破成功率50%', 1, 10, 1000, 1),
('金丹丹', '辅助凝结金丹', 1, '增加突破成功率80%', 1, 5, 5000, 1),
('回春丹', '恢复生命值', 1, '恢复500点生命值', 1, 99, 50, 1),
('回灵丹', '恢复法力值', 1, '恢复300点法力值', 1, 99, 50, 1),
('灵石', '通用货币', 2, '用于交易', 1, 999999, 1, 1),
('下品灵石', '含有少量灵气', 2, '用于交易', 1, 999999, 1, 1),
('中品灵石', '含有中等灵气', 2, '用于交易', 1, 999999, 10, 1),
('上品灵石', '含有大量灵气', 2, '用于交易', 1, 999999, 100, 1),
('千年灵芝', '珍贵药材，可炼制丹药', 2, '炼丹材料', 1, 99, 2000, 1),
('妖兽内丹', '妖兽精华所在', 2, '炼丹材料', 1, 99, 500, 1),
('铁矿石', '常见的矿石', 2, '炼器材料', 1, 999, 10, 1),
('玄铁矿', '稀有矿石', 2, '炼器材料', 1, 999, 100, 1),
('传送符', '瞬间传送到指定地点', 3, '传送功能', 1, 20, 500, 1),
('隐身符', '临时隐身', 3, '隐身效果', 1, 10, 1000, 1);