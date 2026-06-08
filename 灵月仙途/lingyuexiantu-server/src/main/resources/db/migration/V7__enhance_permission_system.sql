-- ============================================
-- 权限系统增强迁移脚本
-- 功能：角色分级、细粒度权限、数据范围隔离、审计日志
-- ============================================

-- 1. 扩展系统角色表，增加角色级别和数据范围字段
DELIMITER //
CREATE PROCEDURE add_role_columns_if_not_exists()
BEGIN
    -- 检查 role_level 列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'sys_role' AND column_name = 'role_level') THEN
        ALTER TABLE `sys_role` ADD COLUMN `role_level` INT DEFAULT 1 COMMENT '角色级别：1-超级管理员 2-运营主管 3-普通客服 4-数据分析师' AFTER `sort`;
    END IF;
    
    -- 检查 data_scope 列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'sys_role' AND column_name = 'data_scope') THEN
        ALTER TABLE `sys_role` ADD COLUMN `data_scope` VARCHAR(20) DEFAULT 'ALL' COMMENT '数据范围：ALL-全部 CUSTOM-自定义 DEPT-部门 SELF-仅自己' AFTER `role_level`;
    END IF;
    
    -- 检查 custom_data_scope 列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'sys_role' AND column_name = 'custom_data_scope') THEN
        ALTER TABLE `sys_role` ADD COLUMN `custom_data_scope` VARCHAR(500) COMMENT '自定义数据范围 JSON 配置' AFTER `data_scope`;
    END IF;
END //
DELIMITER ;

-- 执行存储过程
CALL add_role_columns_if_not_exists();

-- 删除存储过程
DROP PROCEDURE IF EXISTS add_role_columns_if_not_exists;

-- 更新现有角色的级别
UPDATE `sys_role` SET `role_level` = 1 WHERE `role_code` = 'ROLE_SUPER_ADMIN';
UPDATE `sys_role` SET `role_level` = 2, `data_scope` = 'ALL' WHERE `role_code` = 'ROLE_OPERATION_ADMIN';
UPDATE `sys_role` SET `role_level` = 3, `data_scope` = 'CUSTOM' WHERE `role_code` = 'ROLE_CUSTOMER_SERVICE';
UPDATE `sys_role` SET `role_level` = 4, `data_scope` = 'SELF' WHERE `role_code` = 'ROLE_DATA_ANALYST';

-- 2. 扩展权限表，增加 API 路径、按钮标识、敏感操作标识
DELIMITER //
CREATE PROCEDURE add_permission_columns_if_not_exists()
BEGIN
    -- 检查 api_path 列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'permission' AND column_name = 'api_path') THEN
        ALTER TABLE `permission` ADD COLUMN `api_path` VARCHAR(200) COMMENT 'API 路径' AFTER `code`;
    END IF;
    
    -- 检查 method 列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'permission' AND column_name = 'method') THEN
        ALTER TABLE `permission` ADD COLUMN `method` VARCHAR(10) COMMENT '请求方法：GET/POST/PUT/DELETE' AFTER `api_path`;
    END IF;
    
    -- 检查 is_button 列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'permission' AND column_name = 'is_button') THEN
        ALTER TABLE `permission` ADD COLUMN `is_button` TINYINT DEFAULT 0 COMMENT '是否按钮权限：0-否 1-是' AFTER `method`;
    END IF;
    
    -- 检查 is_sensitive 列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'permission' AND column_name = 'is_sensitive') THEN
        ALTER TABLE `permission` ADD COLUMN `is_sensitive` TINYINT DEFAULT 0 COMMENT '是否敏感操作：0-否 1-是' AFTER `is_button`;
    END IF;
    
    -- 检查 require_verification 列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'permission' AND column_name = 'require_verification') THEN
        ALTER TABLE `permission` ADD COLUMN `require_verification` TINYINT DEFAULT 0 COMMENT '是否需要二次验证：0-否 1-是' AFTER `is_sensitive`;
    END IF;
    
    -- 检查 parent_id 列是否存在
    IF NOT EXISTS (SELECT * FROM information_schema.columns WHERE table_name = 'permission' AND column_name = 'parent_id') THEN
        ALTER TABLE `permission` ADD COLUMN `parent_id` BIGINT DEFAULT 0 COMMENT '父权限 ID' AFTER `category`;
    END IF;
END //
DELIMITER ;

-- 执行存储过程
CALL add_permission_columns_if_not_exists();

-- 删除存储过程
DROP PROCEDURE IF EXISTS add_permission_columns_if_not_exists;

-- 3. 创建操作日志表（全链路审计）
CREATE TABLE IF NOT EXISTS `sys_operation_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `operator_id` BIGINT NOT NULL COMMENT '操作人 ID',
  `operator_username` VARCHAR(50) NOT NULL COMMENT '操作人账号',
  `operator_nickname` VARCHAR(50) COMMENT '操作人昵称',
  `module` VARCHAR(50) COMMENT '操作模块',
  `operation_type` VARCHAR(50) COMMENT '操作类型：CREATE/UPDATE/DELETE/QUERY/EXPORT/IMPORT',
  `api_path` VARCHAR(200) NOT NULL COMMENT 'API 路径',
  `request_method` VARCHAR(10) COMMENT '请求方法',
  `request_params` TEXT COMMENT '请求参数',
  `response_status` INT DEFAULT 200 COMMENT '响应状态码',
  `ip_address` VARCHAR(50) COMMENT '操作 IP',
  `ip_location` VARCHAR(100) COMMENT 'IP 归属地',
  `user_agent` VARCHAR(500) COMMENT '浏览器标识',
  `execution_time` INT COMMENT '执行时间（毫秒）',
  `data_snapshot_before` TEXT COMMENT '操作前数据快照',
  `data_snapshot_after` TEXT COMMENT '操作后数据快照',
  `is_sensitive` TINYINT DEFAULT 0 COMMENT '是否敏感操作',
  `verification_code` VARCHAR(50) COMMENT '二次验证码',
  `status` INT DEFAULT 1 COMMENT '状态：0-失败 1-成功',
  `error_message` VARCHAR(1000) COMMENT '错误信息',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  PRIMARY KEY (`id`),
  INDEX `idx_operator_id` (`operator_id`),
  INDEX `idx_operator_username` (`operator_username`),
  INDEX `idx_module` (`module`),
  INDEX `idx_operation_type` (`operation_type`),
  INDEX `idx_create_time` (`create_time`),
  INDEX `idx_is_sensitive` (`is_sensitive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统操作日志表';

-- 4. 创建数据范围配置表
CREATE TABLE IF NOT EXISTS `sys_data_scope` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `scope_type` VARCHAR(20) NOT NULL COMMENT '范围类型：SERVER-服务器 CHANNEL-渠道 REGION-区域',
  `scope_value` VARCHAR(100) NOT NULL COMMENT '范围值',
  `scope_name` VARCHAR(100) COMMENT '范围名称',
  `description` VARCHAR(200) COMMENT '描述',
  `status` INT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_role_id` (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据范围配置表';

-- 5. 创建二次验证记录表
CREATE TABLE IF NOT EXISTS `sys_verification_record` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `verification_type` VARCHAR(20) NOT NULL COMMENT '验证类型：SMS/EMAIL/TOTP',
  `verification_code` VARCHAR(10) NOT NULL COMMENT '验证码',
  `business_type` VARCHAR(50) NOT NULL COMMENT '业务类型',
  `business_id` VARCHAR(50) COMMENT '业务 ID',
  `is_used` TINYINT DEFAULT 0 COMMENT '是否已使用',
  `expire_time` DATETIME NOT NULL COMMENT '过期时间',
  `use_time` DATETIME COMMENT '使用时间',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_verification_code` (`verification_code`),
  INDEX `idx_expire_time` (`expire_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='二次验证记录表';

-- 6. 创建登录日志表
CREATE TABLE IF NOT EXISTS `sys_login_log` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL COMMENT '用户 ID',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `login_type` VARCHAR(20) COMMENT '登录类型：ACCOUNT/MOBILE/EMAIL',
  `ip_address` VARCHAR(50) COMMENT 'IP 地址',
  `ip_location` VARCHAR(100) COMMENT 'IP 归属地',
  `user_agent` VARCHAR(500) COMMENT '浏览器标识',
  `login_status` INT DEFAULT 1 COMMENT '登录状态：0-失败 1-成功',
  `error_message` VARCHAR(200) COMMENT '错误信息',
  `login_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '登录时间',
  `logout_time` DATETIME COMMENT '登出时间',
  PRIMARY KEY (`id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_username` (`username`),
  INDEX `idx_login_time` (`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统登录日志表';

-- 7. 插入细粒度权限数据
INSERT INTO `permission` (`name`, `code`, `description`, `category`, `api_path`, `method`, `is_button`, `is_sensitive`, `require_verification`, `status`) VALUES
-- 系统管理权限
('查看用户列表', 'system:user:view', '查看用户列表权限', 'system', '/sys/user', 'GET', 0, 0, 0, 1),
('新增用户', 'system:user:add', '新增用户权限', 'system', '/sys/user', 'POST', 1, 0, 0, 1),
('编辑用户', 'system:user:edit', '编辑用户权限', 'system', '/sys/user/*', 'PUT', 1, 0, 0, 1),
('删除用户', 'system:user:delete', '删除用户权限', 'system', '/sys/user/*', 'DELETE', 1, 1, 1, 1),
('重置密码', 'system:user:resetPwd', '重置用户密码权限', 'system', '/sys/user/resetPwd', 'POST', 1, 1, 1, 1),
('分配角色', 'system:user:assignRole', '分配角色权限', 'system', '/sys/user/*/roles', 'POST', 1, 0, 0, 1),

-- 角色管理权限
('查看角色列表', 'system:role:view', '查看角色列表权限', 'system', '/sys/role', 'GET', 0, 0, 0, 1),
('新增角色', 'system:role:add', '新增角色权限', 'system', '/sys/role', 'POST', 1, 0, 0, 1),
('编辑角色', 'system:role:edit', '编辑角色权限', 'system', '/sys/role/*', 'PUT', 1, 0, 0, 1),
('删除角色', 'system:role:delete', '删除角色权限', 'system', '/sys/role/*', 'DELETE', 1, 1, 1, 1),
('分配权限', 'system:role:assignPermission', '分配权限权限', 'system', '/sys/role/*/permissions', 'POST', 1, 0, 0, 1),

-- 玩家管理权限
('查看玩家列表', 'game:player:view', '查看玩家列表权限', 'game', '/game/player', 'GET', 0, 0, 0, 1),
('查看玩家详情', 'game:player:detail', '查看玩家详情权限', 'game', '/game/player/*', 'GET', 0, 0, 0, 1),
('查看玩家背包', 'game:player:inventory', '查看玩家背包权限', 'game', '/game/player/*/inventory', 'GET', 1, 0, 0, 1),
('修改玩家物品', 'game:player:item:modify', '修改玩家物品权限', 'game', '/game/player/item', 'POST', 1, 1, 1, 1),
('刷物品', 'game:player:item:grant', '刷物品权限', 'game', '/game/player/grantItem', 'POST', 1, 1, 1, 1),
('封禁玩家', 'game:player:ban', '封禁玩家权限', 'game', '/game/player/ban', 'POST', 1, 1, 1, 1),
('解封玩家', 'game:player:unban', '解封玩家权限', 'game', '/game/player/unban', 'POST', 1, 1, 1, 1),
('修改玩家数据', 'game:player:modify', '修改玩家数据权限', 'game', '/game/player/*', 'PUT', 1, 1, 1, 1),

-- 活动管理权限
('查看活动列表', 'game:activity:view', '查看活动列表权限', 'game', '/game/activity', 'GET', 0, 0, 0, 1),
('新增活动', 'game:activity:add', '新增活动权限', 'game', '/game/activity', 'POST', 1, 0, 0, 1),
('编辑活动', 'game:activity:edit', '编辑活动权限', 'game', '/game/activity/*', 'PUT', 1, 0, 0, 1),
('删除活动', 'game:activity:delete', '删除活动权限', 'game', '/game/activity/*', 'DELETE', 1, 0, 0, 1),
('发布活动', 'game:activity:publish', '发布活动权限', 'game', '/game/activity/publish', 'POST', 1, 1, 1, 1),

-- 邮件管理权限
('查看邮件列表', 'game:mail:view', '查看邮件列表权限', 'game', '/game/mail', 'GET', 0, 0, 0, 1),
('发送邮件', 'game:mail:send', '发送邮件权限', 'game', '/game/mail/send', 'POST', 1, 0, 0, 1),
('发送全服邮件', 'game:mail:global', '发送全服邮件权限', 'game', '/game/mail/global', 'POST', 1, 1, 1, 1),

-- 数据查询权限
('查看统计数据', 'game:stats:view', '查看统计数据权限', 'game', '/game/stats', 'GET', 0, 0, 0, 1),
('导出数据', 'game:data:export', '导出数据权限', 'game', '/game/data/export', 'POST', 1, 0, 0, 1),
('查看日志', 'game:log:view', '查看日志权限', 'game', '/game/log', 'GET', 0, 0, 0, 1),

-- 资产管理权限
('查看资产列表', 'game:asset:view', '查看资产列表权限', 'game', '/game/asset', 'GET', 0, 0, 0, 1),
('新增资产', 'game:asset:add', '新增资产权限', 'game', '/game/asset', 'POST', 1, 0, 0, 1),
('编辑资产', 'game:asset:edit', '编辑资产权限', 'game', '/game/asset/*', 'PUT', 1, 0, 0, 1),
('删除资产', 'game:asset:delete', '删除资产权限', 'game', '/game/asset/*', 'DELETE', 1, 0, 0, 1),

-- 技能管理权限
('查看技能列表', 'game:skill:view', '查看技能列表权限', 'game', '/game/skill', 'GET', 0, 0, 0, 1),
('新增技能', 'game:skill:add', '新增技能权限', 'game', '/game/skill', 'POST', 1, 0, 0, 1),
('编辑技能', 'game:skill:edit', '编辑技能权限', 'game', '/game/skill/*', 'PUT', 1, 0, 0, 1),
('删除技能', 'game:skill:delete', '删除技能权限', 'game', '/game/skill/*', 'DELETE', 1, 0, 0, 1),

-- 地图管理权限
('查看地图列表', 'game:map:view', '查看地图列表权限', 'game', '/game/map', 'GET', 0, 0, 0, 1),
('新增地图', 'game:map:add', '新增地图权限', 'game', '/game/map', 'POST', 1, 0, 0, 1),
('编辑地图', 'game:map:edit', '编辑地图权限', 'game', '/game/map/*', 'PUT', 1, 0, 0, 1),
('删除地图', 'game:map:delete', '删除地图权限', 'game', '/game/map/*', 'DELETE', 1, 0, 0, 1),

-- 日志审计权限
('查看操作日志', 'system:log:operation', '查看操作日志权限', 'system', '/system/log/operation', 'GET', 0, 0, 0, 1),
('查看登录日志', 'system:log:login', '查看登录日志权限', 'system', '/system/log/login', 'GET', 0, 0, 0, 1),
('导出日志', 'system:log:export', '导出日志权限', 'system', '/system/log/export', 'POST', 1, 0, 0, 1);

-- 8. 为超级管理员角色分配所有权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 1, id FROM `permission`;

-- 9. 为运营主管分配活动、公告相关权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 2, id FROM `permission` WHERE code LIKE 'game:activity:%' OR code LIKE 'game:mail:%';

-- 10. 为普通客服分配玩家查询和封禁权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 3, id FROM `permission` WHERE code LIKE 'game:player:view%' OR code LIKE 'game:player:detail%' OR code LIKE 'game:player:ban%' OR code LIKE 'game:player:inventory%';

-- 11. 为数据分析师分配只读数据权限
INSERT INTO `sys_role_permission` (`role_id`, `permission_id`)
SELECT 4, id FROM `permission` WHERE code LIKE '%:view' OR code LIKE '%:detail' OR code LIKE 'game:stats:%' OR code LIKE 'game:data:export';
