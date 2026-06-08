-- 系统菜单表
CREATE TABLE IF NOT EXISTS `sys_menu` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `menu_name` VARCHAR(50) NOT NULL COMMENT '菜单名称',
  `parent_id` BIGINT DEFAULT 0 COMMENT '父菜单 ID',
  `menu_type` INT COMMENT '菜单类型：1-目录 2-菜单 3-按钮',
  `path` VARCHAR(200) COMMENT '路由路径',
  `component` VARCHAR(200) COMMENT '组件路径',
  `perm` VARCHAR(100) COMMENT '权限标识',
  `icon` VARCHAR(50) COMMENT '图标',
  `sort` INT DEFAULT 0 COMMENT '排序',
  `status` INT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统菜单表';

-- 插入初始菜单数据
INSERT INTO `sys_menu` (`menu_name`, `parent_id`, `menu_type`, `path`, `component`, `perm`, `icon`, `sort`, `status`) VALUES
('系统管理', 0, 1, '/system', NULL, 'system:manage', 'setting', 1, 1),
('用户管理', 1, 2, '/system/user', 'system/user', 'system:user:manage', 'user', 1, 1),
('角色管理', 1, 2, '/system/role', 'system/role', 'system:role:manage', 'peoples', 2, 1),
('菜单管理', 1, 2, '/system/menu', 'system/menu', 'system:menu:manage', 'tree-table', 3, 1),
('权限管理', 1, 2, '/system/permission', 'system/permission', 'system:permission:manage', 'lock', 4, 1),
('游戏管理', 0, 1, '/game', NULL, 'game:manage', 'game', 2, 1),
('玩家管理', 6, 2, '/game/player', 'game/player', 'game:player:manage', 'user', 1, 1),
('境界突破', 6, 2, '/game/realm', 'game/realm', 'game:realm:manage', 'skill', 2, 1),
('活动管理', 6, 2, '/game/activity', 'game/activity', 'game:activity:manage', 'date', 3, 1);

-- 权限表
CREATE TABLE IF NOT EXISTS `permission` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL COMMENT '权限名称',
  `code` VARCHAR(50) NOT NULL COMMENT '权限码',
  `description` VARCHAR(200) COMMENT '权限描述',
  `category` VARCHAR(30) COMMENT '权限分类',
  `status` INT DEFAULT 1 COMMENT '状态：0-禁用 1-启用',
  `create_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='权限表';

-- 插入初始权限数据
INSERT INTO `permission` (`name`, `code`, `description`, `category`, `status`) VALUES
('系统管理', 'system:manage', '系统管理权限', 'system', 1),
('用户管理', 'system:user:manage', '用户管理权限', 'system', 1),
('角色管理', 'system:role:manage', '角色管理权限', 'system', 1),
('菜单管理', 'system:menu:manage', '菜单管理权限', 'system', 1),
('权限管理', 'system:permission:manage', '权限管理权限', 'system', 1),
('游戏管理', 'game:manage', '游戏管理权限', 'game', 1),
('玩家管理', 'game:player:manage', '玩家管理权限', 'game', 1),
('境界突破', 'game:realm:manage', '境界突破权限', 'game', 1),
('活动管理', 'game:activity:manage', '活动管理权限', 'game', 1),
('资产管理', 'game:asset:manage', '资产管理权限', 'game', 1);

-- 角色权限关联表
CREATE TABLE IF NOT EXISTS `sys_role_permission` (
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `permission_id` BIGINT NOT NULL COMMENT '权限 ID',
  PRIMARY KEY (`role_id`, `permission_id`),
  INDEX `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_role_permission_role` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_permission_permission` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='角色权限关联表';

-- 菜单权限关联表
CREATE TABLE IF NOT EXISTS `sys_menu_permission` (
  `menu_id` BIGINT NOT NULL COMMENT '菜单 ID',
  `permission_id` BIGINT NOT NULL COMMENT '权限 ID',
  PRIMARY KEY (`menu_id`, `permission_id`),
  INDEX `idx_permission_id` (`permission_id`),
  CONSTRAINT `fk_menu_permission_menu` FOREIGN KEY (`menu_id`) REFERENCES `sys_menu` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_menu_permission_permission` FOREIGN KEY (`permission_id`) REFERENCES `permission` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单权限关联表';

-- 境界突破记录表
CREATE TABLE IF NOT EXISTS `role_realm_breakthrough` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL COMMENT '角色 ID',
  `role_name` VARCHAR(50) COMMENT '角色名称',
  `old_realm` VARCHAR(50) COMMENT '原境界',
  `new_realm` VARCHAR(50) COMMENT '新境界',
  `success` TINYINT DEFAULT 1 COMMENT '是否成功：0-失败 1-成功',
  `cost_xiuwei` INT DEFAULT 0 COMMENT '消耗修为',
  `breakthrough_time` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '突破时间',
  PRIMARY KEY (`id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_breakthrough_time` (`breakthrough_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='境界突破记录表';
