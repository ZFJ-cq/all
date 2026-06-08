-- 添加角色年龄和最大寿命字段
ALTER TABLE game_role ADD COLUMN age INT DEFAULT 18;
ALTER TABLE game_role ADD COLUMN max_age INT DEFAULT 100;

-- 为 game_role 表添加索引
CREATE INDEX idx_game_role_user_id ON game_role(user_id);
CREATE INDEX idx_game_role_status ON game_role(status);

-- 为 role_asset 表添加索引
CREATE INDEX idx_role_asset_role_id ON role_asset(role_id);
CREATE INDEX idx_role_asset_asset_type_id ON role_asset(asset_type_id);

-- 为 role_equipment 表添加索引
CREATE INDEX idx_role_equipment_role_id ON role_equipment(role_id);
CREATE INDEX idx_role_equipment_slot ON role_equipment(slot);

-- 为 inventory 表添加索引
CREATE INDEX idx_inventory_role_id ON inventory(role_id);
CREATE INDEX idx_inventory_item_type ON inventory(item_type);
