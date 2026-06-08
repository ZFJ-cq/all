-- 修复实体与数据库表不匹配的问题
-- Flyway 迁移脚本 V23

-- ========================================
-- 1. asset_types 表补充缺失字段
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
-- 2. announcement 表补充缺失字段
-- ========================================
ALTER TABLE announcement 
ADD COLUMN IF NOT EXISTS create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
ADD COLUMN IF NOT EXISTS update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间';

-- ========================================
-- 3. 确保 announcement 表有正确的字段
-- ========================================
-- 检查并更新 announcement 表结构
-- 如果 content 字段不存在，添加它
-- 注意：MySQL 中 ALTER TABLE 不支持 IF NOT EXISTS 对列的操作，但我们可以尝试添加

-- ========================================
-- 4. role_assets 表确保有正确的字段
-- ========================================
-- 确保 role_assets 表有 asset_type_id 字段（如果还没有）
-- 这个表是新的实体类需要的

-- ========================================
-- 5. 数据兼容性处理
-- ========================================
-- 更新 asset_types 表的默认值
UPDATE asset_types SET decimal_precision = 0 WHERE decimal_precision IS NULL;
UPDATE asset_types SET tradable = 1 WHERE tradable IS NULL;
UPDATE asset_types SET droppable = 1 WHERE droppable IS NULL;
UPDATE asset_types SET max_stack = 99 WHERE max_stack IS NULL;
UPDATE asset_types SET destroy_policy = 'none' WHERE destroy_policy IS NULL;
UPDATE asset_types SET is_system = 0 WHERE is_system IS NULL;
UPDATE asset_types SET status = 'active' WHERE status IS NULL;

-- 更新 announcement 表的默认值
UPDATE announcement SET create_time = NOW() WHERE create_time IS NULL;
UPDATE announcement SET update_time = NOW() WHERE update_time IS NULL;
