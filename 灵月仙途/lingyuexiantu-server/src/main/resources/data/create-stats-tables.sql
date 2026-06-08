-- 创建玩家属性主表
CREATE TABLE IF NOT EXISTS t_player_stats_base (
  player_id BIGINT UNSIGNED NOT NULL COMMENT '玩家ID',
  
  -- [境界状态]
  realm_level TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '大境界 (1-9)',
  realm_stage TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT '小境界 (1-9)',
  exp_curr BIGINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '当前经验值',
  exp_max BIGINT UNSIGNED NOT NULL DEFAULT 1000 COMMENT '升级所需经验',
  cultivation_speed DECIMAL(10,4) NOT NULL DEFAULT 1.0000 COMMENT '修炼倍率 (基础1.0)',
  
  -- [真属性：先天基数 (创角生成)]
  base_vit INT UNSIGNED NOT NULL DEFAULT 10,
  base_spi INT UNSIGNED NOT NULL DEFAULT 10,
  base_agi INT UNSIGNED NOT NULL DEFAULT 10,
  base_wis INT UNSIGNED NOT NULL DEFAULT 10,
  base_lck INT UNSIGNED NOT NULL DEFAULT 5,
  
  -- [真属性：后天永久加成 (突破/天赋/永久丹药)]
  perm_vit INT UNSIGNED NOT NULL DEFAULT 0,
  perm_spi INT UNSIGNED NOT NULL DEFAULT 0,
  perm_agi INT UNSIGNED NOT NULL DEFAULT 0,
  perm_wis INT UNSIGNED NOT NULL DEFAULT 0,
  perm_lck INT UNSIGNED NOT NULL DEFAULT 0,
  
  -- [真属性：临时/装备加成 (卸下装备即失效，此处存累加值)]
  tmp_vit INT UNSIGNED NOT NULL DEFAULT 0,
  tmp_spi INT UNSIGNED NOT NULL DEFAULT 0,
  tmp_agi INT UNSIGNED NOT NULL DEFAULT 0,
  tmp_wis INT UNSIGNED NOT NULL DEFAULT 0,
  tmp_lck INT UNSIGNED NOT NULL DEFAULT 0,
  
  -- [系统字段]
  last_calc_ver BIGINT UNSIGNED DEFAULT 0 COMMENT '计算版本号，用于缓存一致性校验',
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  PRIMARY KEY (player_id),
  INDEX idx_realm_rank (realm_level DESC, exp_curr DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='玩家真属性基底表';

-- 创建属性变更日志表
CREATE TABLE IF NOT EXISTS t_stat_operation_log (
  log_id BIGINT UNSIGNED AUTO_INCREMENT,
  player_id BIGINT UNSIGNED NOT NULL,
  op_type VARCHAR(32) NOT NULL COMMENT '操作类型: LEVEL_UP, EQUIP_CHANGE, PILL_USE, BREAKTHROUGH',
  target_stat VARCHAR(10) NOT NULL COMMENT '受影响属性: base_vit, tmp_spi...',
  old_value INT UNSIGNED NOT NULL,
  new_value INT UNSIGNED NOT NULL,
  change_delta INT SIGNED NOT NULL,
  context_info JSON COMMENT '上下文: {"item_id": 1001, "realm_from": 1, "realm_to": 2}',
  created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (log_id),
  INDEX idx_player_time (player_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='属性变更审计日志';

-- 创建数值配置表
CREATE TABLE IF NOT EXISTS t_cfg_numerical_rules (
  config_key VARCHAR(64) NOT NULL COMMENT '配置键: realm_mult_2, formula_atk',
  config_version INT NOT NULL DEFAULT 1,
  content JSON NOT NULL COMMENT '具体的JSON配置内容',
  description VARCHAR(255),
  updated_by VARCHAR(32),
  updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数值策划配置表';

-- 插入初始数值配置
INSERT IGNORE INTO t_cfg_numerical_rules (config_key, content, description)
VALUES 
('realm_mult', '{"1": {"hp_mul": 1.0, "atk_mul": 1.0, "def_mul": 1.0, "weight": 1}, "2": {"hp_mul": 5.5, "atk_mul": 4.2, "def_mul": 3.5, "weight": 15}, "3": {"hp_mul": 22.0, "atk_mul": 16.0, "def_mul": 12.0, "weight": 150}, "4": {"hp_mul": 88.0, "atk_mul": 64.0, "def_mul": 48.0, "weight": 1500}, "5": {"hp_mul": 352.0, "atk_mul": 256.0, "def_mul": 192.0, "weight": 15000}, "6": {"hp_mul": 1408.0, "atk_mul": 1024.0, "def_mul": 768.0, "weight": 150000}, "7": {"hp_mul": 5632.0, "atk_mul": 4096.0, "def_mul": 3072.0, "weight": 1500000}, "8": {"hp_mul": 22528.0, "atk_mul": 16384.0, "def_mul": 12288.0, "weight": 15000000}, "9": {"hp_mul": 90112.0, "atk_mul": 65536.0, "def_mul": 49152.0, "weight": 150000000}}', '境界倍数配置'),
('formula_atk', '{"base": 10, "spi_coef": 2.5, "vit_coef": 0.5}', '攻击力计算公式'),
('formula_def', '{"base": 5, "vit_coef": 1.8, "agi_coef": 0.6}', '防御力计算公式'),
('formula_hp', '{"base": 100, "vit_coef": 100}', '气血计算公式'),
('formula_crit', '{"base": 0.05, "lck_coef": 0.005, "agi_coef": 0.002}', '暴击率计算公式'),
('formula_dodge', '{"base": 0.03, "agi_coef": 0.008, "lck_coef": 0.001}', '闪避率计算公式'),
('formula_hit', '{"base": 0.9, "agi_coef": 0.003}', '命中率计算公式');
