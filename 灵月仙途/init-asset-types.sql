-- ============================================  
-- 灵月仙途 - 资产类型初始化脚本  
-- 用于初始化必要的资产类型，确保签到奖励能正确发放  
-- ============================================

-- 插入资产类型数据（避免重复）
INSERT IGNORE INTO `asset_types` (`code`, `name`, `type`, `category`, `description`, `icon`, `is_system`, `status`) VALUES
('LINGSHI', '灵石', 'CURRENCY', '资源', '修仙世界的通用货币', '💰', 1, 'ACTIVE'),
('XIANSHI', '仙石', 'CURRENCY', '资源', '仙界的高级货币', '💎', 1, 'ACTIVE'),
('XIUWEI', '修为', 'RESOURCE', '资源', '修炼所需的能量', '🧘', 1, 'ACTIVE'),
('HUNSHI', '魂石', 'RESOURCE', '资源', '提升灵魂强度的石头', '💀', 1, 'ACTIVE'),
('SHOUMING', '寿命', 'RESOURCE', '资源', '角色的寿命', '⏰', 1, 'ACTIVE'),
('QIXUE', '气血', 'RESOURCE', '资源', '角色的气血值', '❤️', 1, 'ACTIVE'),
('FALI', '法力', 'RESOURCE', '资源', '角色的法力值', '🔮', 1, 'ACTIVE'),
('SHENLI', '神力', 'RESOURCE', '资源', '角色的神力值', '⚡', 1, 'ACTIVE');

-- 验证插入结果
SELECT '✅ 资产类型初始化完成！' AS message;

-- 查看已插入的资产类型
SELECT 
  `code`,
  `name`,
  `type`,
  `category`,
  `description`,
  `icon`
FROM `asset_types`
WHERE `code` IN (
  'LINGSHI',
  'XIANSHI',
  'XIUWEI',
  'HUNSHI',
  'SHOUMING',
  'QIXUE',
  'FALI',
  'SHENLI'
)
ORDER BY `code`;