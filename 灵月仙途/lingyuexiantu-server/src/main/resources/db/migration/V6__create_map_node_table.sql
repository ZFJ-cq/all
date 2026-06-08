-- 创建地图表
CREATE TABLE IF NOT EXISTS map_node (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '地图 ID',
    map_code VARCHAR(50) NOT NULL UNIQUE COMMENT '地图编码',
    map_name VARCHAR(100) NOT NULL COMMENT '地图名称',
    map_type INT NOT NULL COMMENT '地图类型：1-主城，2-野外，3-副本，4-秘境，5-宗门',
    layer_level INT NOT NULL COMMENT '层级等级（1-9 层）',
    recommend_level INT NOT NULL COMMENT '推荐等级',
    recommend_combat INT NOT NULL COMMENT '推荐战力',
    environment_desc VARCHAR(1000) COMMENT '环境描述',
    monster_density VARCHAR(500) COMMENT '怪物分布密度：低、中、高、极高',
    drop_weight VARCHAR(500) COMMENT '掉落权重：普通、优秀、稀有、史诗、传说',
    background_resource VARCHAR(500) COMMENT '背景资源路径',
    main_products VARCHAR(500) COMMENT '主要产出描述',
    status INT NOT NULL DEFAULT 1 COMMENT '状态：0-关闭，1-开启，2-维护',
    weather_type VARCHAR(500) COMMENT '天气类型（扩展字段）',
    special_event VARCHAR(500) COMMENT '特殊事件标识（扩展字段）',
    extension_field1 VARCHAR(500) COMMENT '扩展字段 1',
    extension_field2 VARCHAR(500) COMMENT '扩展字段 2',
    online_count INT NOT NULL DEFAULT 0 COMMENT '当前在线人数',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_map_code (map_code),
    INDEX idx_map_type (map_type),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地图表';

-- 插入初始地图数据
INSERT INTO map_node (map_code, map_name, map_type, layer_level, recommend_level, recommend_combat, environment_desc, monster_density, drop_weight, background_resource, main_products, status, online_count) VALUES
('MAP_001', '青云城', 1, 1, 1, 500, '繁华的主城，人来人往，商铺林立', '无', '无', '/images/maps/qingyun_city.jpg', '基础装备、药品', 1, 156),
('MAP_002', '妖兽森林外围', 2, 1, 5, 1000, '茂密的森林，时有妖兽出没', '低', '普通', '/images/maps/beast_forest_1.jpg', '妖兽材料、灵草', 1, 89),
('MAP_003', '妖兽森林深处', 2, 2, 15, 3000, '阴森恐怖，高级妖兽聚集地', '中', '优秀', '/images/maps/beast_forest_2.jpg', '高级妖兽材料、稀有灵草', 1, 45),
('MAP_004', '落云山脉', 2, 3, 25, 5000, '崇山峻岭，灵气浓郁', '高', '稀有', '/images/maps/luoyun_mountain.jpg', '灵石、矿石、妖兽内丹', 1, 67),
('MAP_005', '古修士洞府', 3, 1, 20, 4000, '上古修士遗留的洞府，机关重重', '中', '史诗', '/images/maps/ancient_cave.jpg', '功法秘籍、法宝碎片', 1, 34),
('MAP_006', '秘境 - 仙境', 4, 1, 30, 8000, '传说中的仙境，机缘与危险并存', '极高', '传说', '/images/maps/fairyland.jpg', '仙器碎片、稀有材料', 1, 23),
('MAP_007', '天剑宗', 5, 1, 10, 2000, '正道第一大派，剑气纵横', '无', '优秀', '/images/images/tianjian_sect.jpg', '宗门贡献、功法', 1, 198),
('MAP_008', '魔渊', 2, 4, 40, 10000, '魔族聚集地，阴森恐怖', '极高', '史诗', '/images/maps/demon_abyss.jpg', '魔核、黑暗属性材料', 1, 12),
('MAP_009', '葬仙谷', 4, 2, 50, 15000, '上古仙陨之地，充满危险与机遇', '高', '传说', '/images/maps/xian_valley.jpg', '仙遗法宝、稀有材料', 2, 0),
('MAP_010', '灵泉秘境', 4, 1, 35, 9000, '蕴含灵泉的秘境，修炼圣地', '低', '史诗', '/images/maps/spring_secret.jpg', '灵泉水、修炼资源', 1, 56);
