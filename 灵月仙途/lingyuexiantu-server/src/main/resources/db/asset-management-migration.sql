-- 资产类型配置表升级脚本

-- 1. 修改 asset_types 表，添加缺失的核心字段
ALTER TABLE asset_types ADD COLUMN unit_of_measure VARCHAR(50) DEFAULT '个'; -- 计量单位
ALTER TABLE asset_types ADD COLUMN decimal_precision INT DEFAULT 0; -- 小数精度（0-6位）
ALTER TABLE asset_types ADD COLUMN icon_path VARCHAR(255); -- 图标路径
ALTER TABLE asset_types ADD COLUMN is_system BOOLEAN DEFAULT false; -- 是否系统内置
ALTER TABLE asset_types ADD COLUMN deleted_at TIMESTAMP; -- 软删除时间戳

-- 2. 创建资产信息表（数据存储层）
CREATE TABLE asset_information (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    asset_type_code VARCHAR(100) NOT NULL, -- 关联资产类型编码
    name VARCHAR(255) NOT NULL, -- 资产名称（如困仙绳）
    description TEXT, -- 资产描述
    value DECIMAL(20,6) DEFAULT 0, -- 资产数值（关联类型精度）
    is_active BOOLEAN DEFAULT true, -- 是否激活
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP, -- 软删除时间戳
    FOREIGN KEY (asset_type_code) REFERENCES asset_types(code)
);

-- 3. 创建资产修改日志表
CREATE TABLE asset_modification_log (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    asset_id BIGINT NOT NULL,
    field_name VARCHAR(100) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    modified_by VARCHAR(100),
    modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES asset_information(id)
);

-- 4. 添加索引优化查询性能
CREATE INDEX idx_asset_types_code ON asset_types(code);
CREATE INDEX idx_asset_types_name ON asset_types(name);
CREATE INDEX idx_asset_types_category ON asset_types(category);
CREATE INDEX idx_asset_information_type_name ON asset_information(asset_type_code, name);
CREATE INDEX idx_asset_information_deleted_at ON asset_information(deleted_at);

-- 5. 插入基础资产类型数据
INSERT INTO asset_types (name, code, unit_of_measure, decimal_precision, tradable, status) VALUES
('灵石', 'ling_shi', '个', 0, true, 'enabled'),
('法宝', 'fa_bao', '件', 0, true, 'enabled'),
('丹药', 'dan_yao', '颗', 0, true, 'enabled'),
('材料', 'cai_liao', '份', 0, true, 'enabled'),
('符箓', 'fu_lu', '张', 0, true, 'enabled');

-- 6. 插入基础资产信息数据
INSERT INTO asset_information (asset_type_code, name, description, value) VALUES
('ling_shi', '下品灵石', '基础修炼资源', 100),
('ling_shi', '中品灵石', '中级修炼资源', 1000),
('ling_shi', '上品灵石', '高级修炼资源', 10000),
('fa_bao', '青锋剑', '下品法器，锋利无比', 1),
('fa_bao', '玄铁盾', '中品法器，防御力强', 1),
('dan_yao', '聚气丹', '加快灵气吸收', 1),
('dan_yao', '筑基丹', '突破筑基期必备', 1),
('cai_liao', '月华草', '稀有灵草，可用于炼制疗伤丹药', 1),
('cai_liao', '玄铁矿', '炼制飞剑材料', 1),
('fu_lu', '火属性符纸', '可绘制火焰类符箓的材料', 1);