-- 初始化系统配置数据

-- 检查并创建 system_setting 表
CREATE TABLE IF NOT EXISTS system_setting (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 初始化初始基础属性配置
INSERT IGNORE INTO system_setting (setting_key, setting_value, description, updated_at)
VALUES ('initial_base_stats', '{"vit": 10, "spi": 10, "agi": 10, "wis": 10, "lck": 10}', '初始基础属性配置', NOW());

-- 初始化灵根影响配置
INSERT IGNORE INTO system_setting (setting_key, setting_value, description, updated_at)
VALUES ('spirit_root_bonus', '{"金灵根": {"spi": 5}, "木灵根": {"vit": 5}, "水灵根": {"wis": 5}, "火灵根": {"agi": 5}, "土灵根": {"vit": 3, "def": 2}}', '灵根对基础属性的影响', NOW());

-- 完成消息
SELECT '✅ 系统配置数据初始化完成！' AS message;