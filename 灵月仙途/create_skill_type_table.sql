-- 创建技能类型管理表
CREATE TABLE IF NOT EXISTS skill_type (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键 ID',
    type_code VARCHAR(50) NOT NULL UNIQUE COMMENT '类型代码：ATTACK, DEFENSE, SUPPORT, MOVEMENT, CULTIVATION',
    type_name VARCHAR(50) NOT NULL COMMENT '类型名称：攻击、防御、辅助、身法、功法',
    display_name VARCHAR(50) COMMENT '显示名称（前端标签显示）',
    description VARCHAR(500) COMMENT '类型描述',
    icon VARCHAR(100) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色代码',
    sort_order INT COMMENT '排序顺序',
    is_active BOOLEAN DEFAULT TRUE COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_type_code (type_code),
    INDEX idx_sort_order (sort_order),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='技能类型管理表';

-- 初始化技能类型数据
INSERT INTO skill_type (type_code, type_name, display_name, description, icon, color, sort_order, is_active) VALUES
('SUPPORT', '辅助', '辅助', '辅助类技能，提供增益效果或特殊能力', '✨', '#9370DB', 1, TRUE),
('MOVEMENT', '身法', '身法', '身法类技能，提高移动速度和闪避率', '💨', '#20B2AA', 2, TRUE),
('ATTACK', '攻击', '攻击', '攻击类技能，造成直接伤害', '⚔️', '#DC143C', 3, TRUE),
('CULTIVATION', '功法', '功法', '修炼功法，提升整体实力', '📖', '#8B4513', 4, TRUE)
ON DUPLICATE KEY UPDATE 
    type_name = VALUES(type_name),
    display_name = VALUES(display_name),
    description = VALUES(description),
    icon = VALUES(icon),
    color = VALUES(color),
    sort_order = VALUES(sort_order);

-- 修改 skill 表，添加 type_id 外键（可选，为了兼容性先不强制）
-- ALTER TABLE skill ADD COLUMN type_id BIGINT COMMENT '技能类型 ID';
-- ALTER TABLE skill ADD CONSTRAINT fk_skill_type FOREIGN KEY (type_id) REFERENCES skill_type(id);
