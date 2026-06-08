-- Flyway 迁移脚本 V24
-- 为现有表添加缺失的列以匹配实体类

-- ========================================
-- 1. asset_types 表添加缺失的列
-- ========================================
ALTER TABLE asset_types 
ADD COLUMN IF NOT EXISTS icon VARCHAR(255) COMMENT '图标',
ADD COLUMN IF NOT EXISTS icon_path VARCHAR(255) COMMENT '图标路径',
ADD COLUMN IF NOT EXISTS decimal_precision INT COMMENT '小数精度',
ADD COLUMN IF NOT EXISTS tradable TINYINT(1) DEFAULT 1 COMMENT '是否可交易',
ADD COLUMN IF NOT EXISTS droppable TINYINT(1) DEFAULT 1 COMMENT '是否可掉落',
ADD COLUMN IF NOT EXISTS max_stack INT DEFAULT 99 COMMENT '最大堆叠',
ADD COLUMN IF NOT EXISTS destroy_policy VARCHAR(50) DEFAULT 'none' COMMENT '销毁策略',
ADD COLUMN IF NOT EXISTS modules VARCHAR(255) COMMENT '模块',
ADD COLUMN IF NOT EXISTS is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统资产',
ADD COLUMN IF NOT EXISTS deleted_at DATETIME COMMENT '删除时间';

-- ========================================
-- 2. role_asset 表修改
-- ========================================
-- 注意：我们不修改role_asset表，因为RoleAsset实体需要和它匹配
-- 我们暂时用JdbcTemplate来查询

-- ========================================
-- 3. 创建缺失的表（如果不存在）
-- ========================================
-- 创建 resource_type 表（如果不存在）
CREATE TABLE IF NOT EXISTS resource_type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) UNIQUE,
    description VARCHAR(255),
    unit VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建 role_resource 表（如果不存在）
CREATE TABLE IF NOT EXISTS role_resource (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    resource_type_id BIGINT NOT NULL,
    quantity BIGINT DEFAULT 0,
    version INT DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_resource (role_id, resource_type_id),
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建 inventory 表（如果不存在）
CREATE TABLE IF NOT EXISTS inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    item_id BIGINT NOT NULL,
    item_name VARCHAR(100),
    item_type VARCHAR(50),
    rarity VARCHAR(20) DEFAULT 'common',
    stack_size INT DEFAULT 1,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 4. 填充缺失的数据
-- ========================================
-- 将 asset_types 中的数据复制到 resource_type
INSERT IGNORE INTO resource_type (name, code, description, unit)
SELECT name, code, description, unit_of_measure 
FROM asset_types;

-- 为新字段设置默认值
UPDATE asset_types SET decimal_precision = 0 WHERE decimal_precision IS NULL;
UPDATE asset_types SET tradable = 1 WHERE tradable IS NULL;
UPDATE asset_types SET droppable = 1 WHERE droppable IS NULL;
UPDATE asset_types SET max_stack = 99 WHERE max_stack IS NULL;
UPDATE asset_types SET destroy_policy = 'none' WHERE destroy_policy IS NULL;
UPDATE asset_types SET is_system = 0 WHERE is_system IS NULL;

-- ========================================
-- 5. 复制 role_asset 数据到 role_resource（如果需要）
-- ========================================
-- 暂时不执行，需要先确定数据映射关系
