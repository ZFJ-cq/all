-- 数据库迁移脚本

-- 1. 修改 GameRole 表，添加缺失的字段
ALTER TABLE game_role ADD COLUMN realm_stage VARCHAR(20) DEFAULT '初';
ALTER TABLE game_role ADD COLUMN world_level VARCHAR(20) DEFAULT '人间界';
ALTER TABLE game_role ADD COLUMN cultivation INT DEFAULT 0;
ALTER TABLE game_role ADD COLUMN cultivation_max INT DEFAULT 100;
ALTER TABLE game_role ADD COLUMN spirit_stones INT DEFAULT 0;
ALTER TABLE game_role ADD COLUMN profession VARCHAR(50);
ALTER TABLE game_role ADD COLUMN profession_level INT DEFAULT 0;
ALTER TABLE game_role ADD COLUMN profession_exp INT DEFAULT 0;
ALTER TABLE game_role ADD COLUMN profession_certified BOOLEAN DEFAULT false;
ALTER TABLE game_role ADD COLUMN sect VARCHAR(100);
ALTER TABLE game_role ADD COLUMN sect_position VARCHAR(50) DEFAULT '外门弟子';
ALTER TABLE game_role ADD COLUMN partner VARCHAR(100);
ALTER TABLE game_role ADD COLUMN today_cultivation_times INT DEFAULT 0;
ALTER TABLE game_role ADD COLUMN max_daily_cultivation_times INT DEFAULT 10;

-- 2. 修改 Inventory 表，添加绑定状态字段
ALTER TABLE inventory ADD COLUMN is_bound BOOLEAN DEFAULT false;

-- 3. 新增 ClanTask 表，用于存储宗门任务
CREATE TABLE clan_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clan_id BIGINT NOT NULL,
    task_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(20) NOT NULL, -- daily, sect, major, special
    contribution INT NOT NULL,
    description TEXT,
    time_required VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clan_id) REFERENCES clan(id)
);

-- 4. 新增 ClanTreasure 表，用于存储宗门藏阁物品
CREATE TABLE clan_treasure (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clan_id BIGINT NOT NULL,
    treasure_type VARCHAR(20) NOT NULL, -- treasure, artifact, pills, pets
    item_name VARCHAR(100) NOT NULL,
    contribution INT NOT NULL,
    description TEXT,
    discount DECIMAL(4,2) DEFAULT 1.0,
    status VARCHAR(20) DEFAULT 'available',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clan_id) REFERENCES clan(id)
);

-- 5. 新增 ClanWar 表，用于存储宗门战争信息
CREATE TABLE clan_war (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    clan_id BIGINT NOT NULL,
    target_clan_id BIGINT,
    war_type VARCHAR(20) NOT NULL, -- declare, defense, disciple, elder
    status VARCHAR(20) DEFAULT 'pending',
    cost VARCHAR(255),
    cooldown INT, -- 冷却时间（天）
    reward VARCHAR(255),
    punishment VARCHAR(255),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (clan_id) REFERENCES clan(id),
    FOREIGN KEY (target_clan_id) REFERENCES clan(id)
);

-- 6. 新增 RoleSkill 表，用于存储角色技能
CREATE TABLE role_skill (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    skill_type VARCHAR(20) NOT NULL, -- cultivation, movement, combat
    level INT DEFAULT 1,
    exp INT DEFAULT 0,
    max_exp INT DEFAULT 100,
    effect VARCHAR(255),
    unlocked BOOLEAN DEFAULT true,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES game_role(id)
);

-- 7. 新增 RoleProfession 表，用于存储角色职业信息
CREATE TABLE role_profession (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    profession_name VARCHAR(50) NOT NULL,
    level INT DEFAULT 0,
    exp INT DEFAULT 0,
    certified BOOLEAN DEFAULT false,
    core_role VARCHAR(100),
    unique_features VARCHAR(255),
    ultimate_skill VARCHAR(255),
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES game_role(id),
    UNIQUE KEY uk_role_profession (role_id, profession_name)
);

-- 8. 新增 RolePet 表，用于存储角色灵宠
CREATE TABLE role_pet (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    pet_name VARCHAR(100) NOT NULL,
    pet_type VARCHAR(50) NOT NULL,
    rarity VARCHAR(20) DEFAULT 'common',
    skills VARCHAR(255),
    intimacy INT DEFAULT 0,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES game_role(id)
);

-- 9. 新增 RoleDisciple 表，用于存储角色徒弟
CREATE TABLE role_disciple (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    master_id BIGINT NOT NULL,
    disciple_id BIGINT NOT NULL,
    relationship_status VARCHAR(20) DEFAULT 'active',
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (master_id) REFERENCES game_role(id),
    FOREIGN KEY (disciple_id) REFERENCES game_role(id)
);

-- 10. 新增 RoleTask 表，用于存储角色任务
CREATE TABLE role_task (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id BIGINT NOT NULL,
    task_id BIGINT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    progress INT DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    create_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES game_role(id)
);

-- 创建索引
CREATE INDEX idx_game_role_realm_stage ON game_role(realm_stage);
CREATE INDEX idx_game_role_world_level ON game_role(world_level);
CREATE INDEX idx_inventory_is_bound ON inventory(is_bound);
CREATE INDEX idx_clan_task_clan_id ON clan_task(clan_id);
CREATE INDEX idx_clan_task_task_type ON clan_task(task_type);
CREATE INDEX idx_clan_treasure_clan_id ON clan_treasure(clan_id);
CREATE INDEX idx_clan_treasure_treasure_type ON clan_treasure(treasure_type);
CREATE INDEX idx_clan_war_clan_id ON clan_war(clan_id);
CREATE INDEX idx_clan_war_target_clan_id ON clan_war(target_clan_id);
CREATE INDEX idx_clan_war_war_type ON clan_war(war_type);
CREATE INDEX idx_role_skill_role_id ON role_skill(role_id);
CREATE INDEX idx_role_skill_skill_type ON role_skill(skill_type);
CREATE INDEX idx_role_profession_role_id ON role_profession(role_id);
CREATE INDEX idx_role_pet_role_id ON role_pet(role_id);
CREATE INDEX idx_role_disciple_master_id ON role_disciple(master_id);
CREATE INDEX idx_role_disciple_disciple_id ON role_disciple(disciple_id);
CREATE INDEX idx_role_task_role_id ON role_task(role_id);
CREATE INDEX idx_role_task_completed ON role_task(completed);