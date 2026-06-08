package com.lingyue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SpringBootApplication
@EnableRetry
public class LingyuexiantuServerApplication implements CommandLineRunner {
    
    private static final Logger logger = LoggerFactory.getLogger(LingyuexiantuServerApplication.class);
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    public static void main(String[] args) {
        SpringApplication.run(LingyuexiantuServerApplication.class, args);
    }
    
    @Override
    public void run(String... args) throws Exception {
        logger.info("开始修复skill表缺失字段...");
        try {
            // 检查skill表是否存在，如果不存在则创建
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS skill (id BIGINT PRIMARY KEY AUTO_INCREMENT, skill_name VARCHAR(255) NOT NULL COMMENT '技能名称', description TEXT COMMENT '技能描述', skill_type VARCHAR(50) NOT NULL DEFAULT '功法' COMMENT '技能类型：攻击、防御、辅助、身法、功法等', skill_level INT NOT NULL DEFAULT 1 COMMENT '技能等级（1-12 级）', max_level INT NOT NULL DEFAULT 12 COMMENT '最大等级', attack_bonus INT DEFAULT 0 COMMENT '增加攻击力', defense_bonus INT DEFAULT 0 COMMENT '增加防御力', xiuwei_bonus INT DEFAULT 0 COMMENT '增加修为', spirit_power_bonus INT DEFAULT 0 COMMENT '增加神力', speed_bonus INT DEFAULT 0 COMMENT '增加速度', critical_bonus INT DEFAULT 0 COMMENT '增加暴击率', dodge_bonus INT DEFAULT 0 COMMENT '增加闪避率', trigger_rate INT DEFAULT 50 COMMENT '技能触发概率（百分比），数值越大触发概率越低', status INT DEFAULT 1 COMMENT '状态：1 启用，0 禁用', created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            
            // 验证修改结果
            var result = jdbcTemplate.queryForList("SHOW COLUMNS FROM skill");
            logger.info("技能表缺失字段添加完成！共添加了 {} 个字段", result.size());
            
            // 初始化技能数据
            logger.info("开始初始化技能数据...");
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
            
            // 验证初始化结果
            var skillCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM skill", Integer.class);
            logger.info("技能数据初始化完成！共初始化了 {} 个技能", skillCount);
            
            // 初始化锻体部位数据（四肢和五脏）
            logger.info("开始初始化锻体部位数据...");
            try {
                var partCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM body_part", Integer.class);
                if (partCount == 0) {
                    jdbcTemplate.update("INSERT INTO body_part (part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status, sort_order) VALUES ('四肢', 'LIMBS', '双手双足，力量之源', '力量', '敏捷', 100, 1.2, 50, 1, 1)");
                    jdbcTemplate.update("INSERT INTO body_part (part_name, part_code, description, primary_attr, secondary_attr, base_exp_requirement, exp_growth_rate, max_level, status, sort_order) VALUES ('五脏', 'ORGANS', '心肝脾肺肾，生命之本', '气血', '精神', 150, 1.25, 50, 1, 2)");
                    logger.info("锻体部位初始化完成：四肢、五脏");
                } else {
                    logger.info("锻体部位已存在 {} 条记录，跳过初始化", partCount);
                }
            } catch (Exception e) {
                logger.error("初始化锻体部位失败", e);
            }
            
            // 更新角色的境界信息
            logger.info("开始更新角色境界信息...");
            try {
                // 为所有realm为null的角色设置默认境界为'凡人'
                int updatedCount = jdbcTemplate.update("UPDATE game_role SET realm = '凡人' WHERE realm IS NULL");
                logger.info("更新了 {} 个角色的境界信息", updatedCount);
            } catch (Exception e) {
                logger.error("更新角色境界信息失败", e);
            }
        } catch (Exception e) {
            logger.error("执行SQL脚本失败", e);
        }
    }
}
