-- ============================================
-- 世界地点系统表结构
-- 版本: V35
-- 描述: 创建世界地点、地点功能、角色地点状态等表
-- ============================================

-- 世界地点表
CREATE TABLE IF NOT EXISTS `world_location` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL COMMENT '地点名称',
    `description` VARCHAR(200) NOT NULL COMMENT '地点描述',
    `icon` VARCHAR(10) COMMENT '地点图标(emoji)',
    `bg_color` VARCHAR(50) COMMENT '背景色',
    `sort_order` INT DEFAULT 0 COMMENT '排序顺序',
    `category` VARCHAR(50) COMMENT '地点分类: combat,trade,social,training,special',
    `required_level` INT DEFAULT 0 COMMENT '所需等级',
    `required_realm` VARCHAR(50) COMMENT '所需境界',
    `page_url` VARCHAR(200) COMMENT '跳转页面URL',
    `is_active` TINYINT DEFAULT 1 COMMENT '是否启用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='世界地点表';

-- 地点功能表
CREATE TABLE IF NOT EXISTS `world_location_feature` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `location_id` BIGINT NOT NULL COMMENT '地点ID',
    `feature_name` VARCHAR(50) NOT NULL COMMENT '功能名称',
    `feature_desc` VARCHAR(200) COMMENT '功能描述',
    `feature_icon` VARCHAR(10) COMMENT '功能图标',
    `feature_type` VARCHAR(50) COMMENT '功能类型: action,shop,craft,train',
    `feature_data` JSON COMMENT '功能参数(JSON)',
    `sort_order` INT DEFAULT 0 COMMENT '排序',
    `is_active` TINYINT DEFAULT 1 COMMENT '是否启用',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`location_id`) REFERENCES `world_location`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地点功能表';

-- 角色地点访问记录
CREATE TABLE IF NOT EXISTS `role_location_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `role_id` BIGINT NOT NULL COMMENT '角色ID',
    `location_id` BIGINT NOT NULL COMMENT '地点ID',
    `visit_count` INT DEFAULT 1 COMMENT '访问次数',
    `last_visit_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '最后访问时间',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY `uk_role_location` (`role_id`, `location_id`),
    INDEX `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色地点访问记录';

-- ============================================
-- 初始化地点数据
-- ============================================

INSERT INTO `world_location` (`name`, `description`, `icon`, `bg_color`, `sort_order`, `category`, `required_level`, `required_realm`, `page_url`, `is_active`) VALUES
('酒楼', '对酒当歌，广交豪杰', '🏮', 'rgba(120, 80, 40, 0.9)', 1, 'social', 0, NULL, '../restaurant.html', 1),
('交易行', '买进卖出，财源广进', '💰', 'rgba(120, 120, 60, 0.9)', 2, 'trade', 0, NULL, '../trade/trade.html', 1),
('副本', '挑战秘境，获取机缘', '⚔️', 'rgba(100, 100, 40, 0.9)', 3, 'combat', 5, '炼气', '../fuben.html', 1),
('兽岛', '妖兽聚集，狩猎宝地', '🐉', 'rgba(80, 120, 100, 0.9)', 4, 'combat', 10, '炼气', '../beast-island/index.html', 1),
('炼丹室', '炼制丹药，提升修为', '🔥', 'rgba(120, 60, 60, 0.9)', 5, 'craft', 0, NULL, '../guild/liandan.html', 1),
('锻器室', '锻造法宝，威力无穷', '🔨', 'rgba(100, 60, 120, 0.9)', 6, 'craft', 0, NULL, '../guild/forge.html', 1),
('修仙洞府', '闭关修炼，悟道成仙', '🏔️', 'rgba(40, 100, 120, 0.9)', 7, 'training', 15, '筑基', '../guild/cave.html', 1),
('拍卖行', '珍稀宝物，竞价获取', '💎', 'rgba(120, 60, 120, 0.9)', 8, 'trade', 20, '筑基', '../auction/auction.html', 1),
('道侣', '双修伴侣，共赴仙途', '💕', 'rgba(120, 60, 100, 0.9)', 9, 'social', 10, '炼气', '../partner/partner.html', 1);

-- ============================================
-- 初始化地点功能数据
-- ============================================

INSERT INTO `world_location_feature` (`location_id`, `feature_name`, `feature_desc`, `feature_icon`, `feature_type`, `sort_order`) VALUES
(1, '灵酒', '品尝灵酒恢复灵力', '🍷', 'action', 1),
(1, '打听消息', '获取修仙界情报', '👂', 'action', 2),
(1, '结交修士', '认识新的修仙者', '🤝', 'social', 3),
(2, '购买道具', '购买修炼所需道具', '🛒', 'shop', 1),
(2, '出售物品', '出售不需要的物品', '💰', 'shop', 2),
(2, '拍卖', '参与拍卖竞价', '🔨', 'shop', 3),
(3, '进入秘境', '挑战秘境副本', '⚔️', 'action', 1),
(3, '组队', '与其他修士组队', '👥', 'social', 2),
(4, '狩猎妖兽', '猎杀妖兽获取材料', '🗡️', 'action', 1),
(4, '采集灵材', '采集妖兽岛上的灵材', '🌿', 'action', 2),
(5, '炼丹', '使用丹方炼制丹药', '🔥', 'craft', 1),
(5, '丹方', '查看和学习丹方', '📜', 'craft', 2),
(6, '锻器', '使用图纸锻造法宝', '🔨', 'craft', 1),
(6, '图纸', '查看和学习锻造图纸', '📜', 'craft', 2),
(7, '闭关', '闭关修炼提升修为', '🧘', 'train', 1),
(7, '悟道', '参悟天道法则', '💡', 'train', 2),
(8, '竞拍', '参与拍卖竞价', '🔨', 'shop', 1),
(8, '寄售', '寄售自己的物品', '📦', 'shop', 2),
(9, '互动', '与道侣互动增进感情', '💞', 'social', 1),
(9, '双修', '与道侣双修提升修为', '☯️', 'train', 2);
