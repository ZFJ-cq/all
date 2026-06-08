-- 修复境界配置表缺失问题
-- 创建 realm_breakthrough 表并插入完整的境界配置数据

USE lingyuexiantu;

-- 1. 如果表不存在，创建 realm_breakthrough 表
CREATE TABLE IF NOT EXISTS `realm_breakthrough` (
  `id` BIGINT NOT NULL AUTO_INCREMENT COMMENT '主键 ID',
  `from_realm` VARCHAR(50) NOT NULL COMMENT '当前境界',
  `to_realm` VARCHAR(50) NOT NULL COMMENT '突破后境界',
  `xiuwei_requirement` INT NOT NULL DEFAULT 0 COMMENT '修为需求',
  `success_rate_base` DECIMAL(5,2) NOT NULL DEFAULT 90.00 COMMENT '基础成功率 (%)',
  `description` VARCHAR(500) DEFAULT NULL COMMENT '境界描述',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `create_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_from_realm` (`from_realm`),
  KEY `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='境界突破配置表';

-- 2. 检查现有数据
SELECT '现有境界配置数据：' AS info;
SELECT * FROM realm_breakthrough ORDER BY sort_order;

-- 3. 插入完整的境界配置数据（如果不存在）
INSERT INTO realm_breakthrough (from_realm, to_realm, xiuwei_requirement, success_rate_base, description, sort_order)
VALUES 
-- 凡人 → 炼气期
('凡人', '炼气期', 100, 95.00, '从凡人踏入炼气期，开启修仙之路', 1),
-- 炼气期 → 筑基期
('炼气期', '筑基期', 500, 90.00, '炼气化神，铸就道基', 2),
-- 筑基期 → 金丹期
('筑基期', '金丹期', 2000, 80.00, '凝气成丹，大道可期', 3),
-- 金丹期 → 元婴期
('金丹期', '元婴期', 10000, 70.00, '丹破婴生，神通初显', 4),
-- 元婴期 → 化神期
('元婴期', '化神期', 50000, 60.00, '婴神合一，感悟天地', 5),
-- 化神期 → 炼虚期
('化神期', '炼虚期', 200000, 50.00, '虚实相生，通天达地', 6),
-- 炼虚期 → 合体期
('炼虚期', '合体期', 1000000, 40.00, '身合大道，逆天改命', 7),
-- 合体期 → 大乘期
('合体期', '大乘期', 5000000, 30.00, '功德圆满，渡劫飞升', 8),
-- 大乘期 → 真仙期
('大乘期', '真仙期', 20000000, 20.00, '历经天劫，超脱凡俗', 9),
-- 真仙期 → 更高境界（可选扩展）
('真仙期', '更高境界', 100000000, 10.00, '仙路漫漫，永无止境', 10)
ON DUPLICATE KEY UPDATE 
  to_realm = VALUES(to_realm),
  xiuwei_requirement = VALUES(xiuwei_requirement),
  success_rate_base = VALUES(success_rate_base),
  description = VALUES(description),
  sort_order = VALUES(sort_order);

-- 4. 验证插入结果
SELECT '插入后的境界配置数据：' AS info;
SELECT * FROM realm_breakthrough ORDER BY sort_order;

-- 5. 确保角色 45 的境界为"凡人"（如果是 NULL 或空）
UPDATE game_role SET realm = '凡人' WHERE id = 45 AND (realm IS NULL OR realm = '');

-- 6. 验证角色 45 的境界
SELECT '角色 45 的境界信息：' AS info;
SELECT id, name, realm FROM game_role WHERE id = 45;

-- 7. 显示所有表，确认 realm_breakthrough 已创建
SHOW TABLES LIKE '%realm%';
