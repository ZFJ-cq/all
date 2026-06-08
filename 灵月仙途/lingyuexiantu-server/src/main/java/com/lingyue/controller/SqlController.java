package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/sql")
public class SqlController {
    
    private static final Logger logger = LoggerFactory.getLogger(SqlController.class);
    private final JdbcTemplate jdbcTemplate;
    
    public SqlController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }
    
    @PostMapping("/fix-skill-columns")
    public Map<String, Object> fixSkillColumns() {
        try {
            // 直接添加缺失的列，不尝试创建整个表
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS description TEXT COMMENT '技能描述' AFTER skill_name");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS skill_type VARCHAR(50) NOT NULL DEFAULT '功法' COMMENT '技能类型：攻击、防御、辅助、身法、功法等' AFTER description");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS skill_level INT NOT NULL DEFAULT 1 COMMENT '技能等级（1-12 级）' AFTER skill_type");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS max_level INT NOT NULL DEFAULT 12 COMMENT '最大等级' AFTER skill_level");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS attack_bonus INT DEFAULT 0 COMMENT '增加攻击力' AFTER max_level");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS defense_bonus INT DEFAULT 0 COMMENT '增加防御力' AFTER attack_bonus");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS xiuwei_bonus INT DEFAULT 0 COMMENT '增加修为' AFTER defense_bonus");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS spirit_power_bonus INT DEFAULT 0 COMMENT '增加神力' AFTER xiuwei_bonus");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS speed_bonus INT DEFAULT 0 COMMENT '增加速度' AFTER spirit_power_bonus");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS critical_bonus INT DEFAULT 0 COMMENT '增加暴击率' AFTER speed_bonus");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS dodge_bonus INT DEFAULT 0 COMMENT '增加闪避率' AFTER critical_bonus");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS trigger_rate INT DEFAULT 50 COMMENT '技能触发概率（百分比），数值越大触发概率越低' AFTER dodge_bonus");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS status INT DEFAULT 1 COMMENT '状态：1 启用，0 禁用' AFTER trigger_rate");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER status");
            jdbcTemplate.execute("ALTER TABLE skill ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at");
            
            // 验证修改结果
            List<Map<String, Object>> result = jdbcTemplate.queryForList("SHOW COLUMNS FROM skill");
            
            return Map.of(
                "code", 0,
                "message", "技能表缺失字段添加完成！",
                "data", result
            );
        } catch (Exception e) {
            logger.error("执行SQL脚本失败", e);
            return Map.of(
                "code", 500,
                "message", "执行SQL脚本失败：" + e.getMessage(),
                "data", null
            );
        }
    }
    
    @PostMapping("/init-skill-data")
    public Map<String, Object> initSkillData() {
        try {
            // 初始化技能数据
            String[] skillNames = {"清心诀", "金雁功", "九阳神功", "九阴白骨爪", "降龙十八掌", "六脉神剑", "易筋经", "洗髓经", "太极剑法", "少林长拳"};
            String[] skillTypes = {"辅助", "身法", "攻击", "攻击", "攻击", "攻击", "辅助", "辅助", "攻击", "攻击"};
            String[] descriptions = {
                "使你的内力修炼速度增加 15 点/12 秒。心若止水，方能证道。",
                "提高你的移动速度和闪避率。身轻如燕，来去如风。",
                "强大的纯阳内功，提高攻击力和防御力。九阳归一，无坚不摧。",
                "阴毒的爪法，有几率造成额外伤害。九阴白骨，爪爪致命。",
                "刚猛的掌法，威力无穷。降龙十八，威震天下。",
                "大理段氏绝学，远程攻击技能。六脉神剑，剑气纵横。",
                "少林绝学，提高各项属性。易筋洗髓，脱胎换骨。",
                "少林绝学，提高内力恢复速度。洗髓伐毛，内力自生。",
                "武当绝学，以柔克刚。太极剑法，四两拨千斤。",
                "少林基础拳法，简单实用。少林长拳，刚劲有力。"
            };
            
            for (int i = 0; i < skillNames.length; i++) {
                String sql = "INSERT IGNORE INTO skill (skill_name, description, skill_type, skill_level, max_level, attack_bonus, defense_bonus, xiuwei_bonus, spirit_power_bonus, speed_bonus, critical_bonus, dodge_bonus, trigger_rate, status) VALUES (?, ?, ?, 1, 12, ?, ?, ?, ?, ?, ?, ?, 50, 1)";
                jdbcTemplate.update(sql, 
                    skillNames[i],
                    descriptions[i],
                    skillTypes[i],
                    i * 5, // attack_bonus
                    i * 3, // defense_bonus
                    i * 2, // xiuwei_bonus
                    i * 4, // spirit_power_bonus
                    i * 6, // speed_bonus
                    i * 2, // critical_bonus
                    i * 3  // dodge_bonus
                );
            }
            
            // 验证修改结果
            List<Map<String, Object>> result = jdbcTemplate.queryForList("SELECT * FROM skill LIMIT 10");
            
            return Map.of(
                "code", 0,
                "message", "技能数据初始化完成！",
                "data", result
            );
        } catch (Exception e) {
            return Map.of(
                "code", 500,
                "message", "初始化技能数据失败：" + e.getMessage(),
                "data", null
            );
        }
    }
}