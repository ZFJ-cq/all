ALTER TABLE t_role_attribute_cache ADD COLUMN realm_level INT DEFAULT 0 COMMENT '境界等级' AFTER total_lck;
ALTER TABLE t_role_attribute_cache ADD COLUMN realm_name VARCHAR(50) DEFAULT '凡人' COMMENT '境界名称' AFTER realm_level;
