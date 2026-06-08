-- ========================================
-- 数据库迁移脚本 - 添加乐观锁字段
-- 执行时间：2026-03-25
-- 说明：为 RoleResource 和 RoleAchievement 表添加 version 字段
-- ========================================

-- 1. 给 role_resource 表添加 version 字段
ALTER TABLE role_resource 
ADD COLUMN version INT DEFAULT 0 NOT NULL COMMENT '乐观锁版本号';

-- 2. 给 role_achievement 表添加字段
ALTER TABLE role_achievement 
ADD COLUMN claimed_request_id VARCHAR(100) DEFAULT NULL COMMENT '领取请求 ID',
ADD COLUMN claimed_ip VARCHAR(50) DEFAULT NULL COMMENT '领取 IP 地址',
ADD COLUMN version INT DEFAULT 0 NOT NULL COMMENT '乐观锁版本号';

-- ========================================
-- 验证迁移结果
-- ========================================

-- 检查 role_resource 表结构
DESC role_resource;

-- 检查 role_achievement 表结构
DESC role_achievement;

-- ========================================
-- 回滚脚本（如果需要）
-- ========================================

-- ALTER TABLE role_resource DROP COLUMN version;
-- ALTER TABLE role_achievement DROP COLUMN claimed_request_id;
-- ALTER TABLE role_achievement DROP COLUMN claimed_ip;
-- ALTER TABLE role_achievement DROP COLUMN version;
