-- 创建角色基础属性表并初始化数据

-- 1. 确保 game_role 表存在
CREATE TABLE IF NOT EXISTS game_role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role_name VARCHAR(100) NOT NULL,
    gender INT,
    realm VARCHAR(50),
    level INT,
    hp INT,
    mp INT,
    spirit_root VARCHAR(100),
    avatar VARCHAR(255),
    body_level VARCHAR(50),
    body_strength INT,
    age INT,
    max_age INT,
    life_status INT,
    death_time DATETIME,
    reincarnation_count INT,
    cultivation_base DOUBLE,
    longevity_bonus INT,
    create_time DATETIME,
    status INT,
    INDEX idx_user_id (user_id),
    INDEX idx_realm (realm),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. 创建 role_base_stats 表
CREATE TABLE IF NOT EXISTS role_base_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL UNIQUE,
    vit INT DEFAULT 10, -- 根骨
    spi INT DEFAULT 10, -- 灵力
    agi INT DEFAULT 10, -- 身法
    wis INT DEFAULT 10, -- 悟性
    lck INT DEFAULT 10, -- 气运
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES game_role(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. 为角色 45 初始化数据
-- 3.1 确保角色 45 存在
INSERT INTO game_role (id, user_id, role_name, gender, realm, level, hp, mp, spirit_root, avatar, body_level, body_strength, age, max_age, life_status, reincarnation_count, cultivation_base, longevity_bonus, create_time, status)
SELECT 45, 1, '测试角色', 1, '凡人', 1, 1000, 500, '金灵根', '', '锻体初期', 10, 18, 100, 0, 0, 1.0, 0, NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM game_role WHERE id = 45);

-- 3.2 为角色 45 初始化基础属性
INSERT INTO role_base_stats (role_id, vit, spi, agi, wis, lck, created_at, updated_at)
SELECT 45, 15, 18, 12, 10, 8, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_base_stats WHERE role_id = 45);

-- 4. 为角色 1 初始化数据
-- 4.1 确保角色 1 存在
INSERT INTO game_role (id, user_id, role_name, gender, realm, level, hp, mp, spirit_root, avatar, body_level, body_strength, age, max_age, life_status, reincarnation_count, cultivation_base, longevity_bonus, create_time, status)
SELECT 1, 1, '默认角色', 1, '凡人', 1, 1000, 500, '木灵根', '', '锻体初期', 10, 18, 100, 0, 0, 1.0, 0, NOW(), 1
WHERE NOT EXISTS (SELECT 1 FROM game_role WHERE id = 1);

-- 4.2 为角色 1 初始化基础属性
INSERT INTO role_base_stats (role_id, vit, spi, agi, wis, lck, created_at, updated_at)
SELECT 1, 10, 10, 10, 10, 10, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM role_base_stats WHERE role_id = 1);

-- 5. 创建系统配置表并初始化数据
CREATE TABLE IF NOT EXISTS system_setting (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5.1 初始化初始基础属性配置
INSERT INTO system_setting (setting_key, setting_value, description, created_at, updated_at)
SELECT 'initial_base_stats', '{"vit": 10, "spi": 10, "agi": 10, "wis": 10, "lck": 10}', '初始基础属性', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM system_setting WHERE setting_key = 'initial_base_stats');

-- 5.2 初始化灵根影响配置
INSERT INTO system_setting (setting_key, setting_value, description, created_at, updated_at)
SELECT 'spirit_root_bonus', '{"金灵根": {"spi": 5}, "木灵根": {"vit": 5}, "水灵根": {"wis": 5}, "火灵根": {"agi": 5}, "土灵根": {"vit": 3, "def": 2}}', '灵根对基础属性的影响', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM system_setting WHERE setting_key = 'spirit_root_bonus');

-- 6. 完成消息
SELECT '✅ 角色基础属性表创建和数据初始化完成！' AS message;