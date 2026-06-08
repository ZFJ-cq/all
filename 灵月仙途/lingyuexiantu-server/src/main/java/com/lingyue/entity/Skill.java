package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "skill")
public class Skill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String skillName; // 技能名称
    
    @Column(length = 500)
    private String description; // 技能描述
    
    @Column(nullable = false)
    private String skillType; // 技能类型：攻击、防御、辅助、身法、功法等
    
    @Column(nullable = false)
    private Integer skillLevel; // 技能等级（1-12 级）
    
    @Column(nullable = false)
    private Integer maxLevel; // 最大等级
    
    private Integer attackBonus; // 增加攻击力
    
    private Integer defenseBonus; // 增加防御力
    
    private Integer xiuweiBonus; // 增加修为
    
    private Integer spiritPowerBonus; // 增加神力
    
    private Integer speedBonus; // 增加速度
    
    private Integer criticalBonus; // 增加暴击率
    
    private Integer dodgeBonus; // 增加闪避率
    
    private Integer triggerRate;
    
    @Column(length = 255)
    private String icon;
    
    @Column(length = 50, name = "`rank`")
    private String rank;
    
    @Column(length = 50, name = "rank_name")
    private String rankName;
    
    private Integer status;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getSkillName() {
        return skillName;
    }
    
    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getSkillType() {
        return skillType;
    }
    
    public void setSkillType(String skillType) {
        this.skillType = skillType;
    }
    
    public Integer getSkillLevel() {
        return skillLevel;
    }
    
    public void setSkillLevel(Integer skillLevel) {
        this.skillLevel = skillLevel;
    }
    
    public Integer getMaxLevel() {
        return maxLevel;
    }
    
    public void setMaxLevel(Integer maxLevel) {
        this.maxLevel = maxLevel;
    }
    
    public Integer getAttackBonus() {
        return attackBonus;
    }
    
    public void setAttackBonus(Integer attackBonus) {
        this.attackBonus = attackBonus;
    }
    
    public Integer getDefenseBonus() {
        return defenseBonus;
    }
    
    public void setDefenseBonus(Integer defenseBonus) {
        this.defenseBonus = defenseBonus;
    }
    
    public Integer getXiuweiBonus() {
        return xiuweiBonus;
    }
    
    public void setXiuweiBonus(Integer xiuweiBonus) {
        this.xiuweiBonus = xiuweiBonus;
    }
    
    public Integer getSpiritPowerBonus() {
        return spiritPowerBonus;
    }
    
    public void setSpiritPowerBonus(Integer spiritPowerBonus) {
        this.spiritPowerBonus = spiritPowerBonus;
    }
    
    public Integer getSpeedBonus() {
        return speedBonus;
    }
    
    public void setSpeedBonus(Integer speedBonus) {
        this.speedBonus = speedBonus;
    }
    
    public Integer getCriticalBonus() {
        return criticalBonus;
    }
    
    public void setCriticalBonus(Integer criticalBonus) {
        this.criticalBonus = criticalBonus;
    }
    
    public Integer getDodgeBonus() {
        return dodgeBonus;
    }
    
    public void setDodgeBonus(Integer dodgeBonus) {
        this.dodgeBonus = dodgeBonus;
    }
    
    public Integer getTriggerRate() {
        return triggerRate;
    }
    
    public void setTriggerRate(Integer triggerRate) {
        this.triggerRate = triggerRate;
    }
    
    public String getIcon() {
        return icon;
    }
    
    public void setIcon(String icon) {
        this.icon = icon;
    }
    
    public String getRank() {
        return rank;
    }
    
    public void setRank(String rank) {
        this.rank = rank;
    }
    
    public String getRankName() {
        return rankName;
    }
    
    public void setRankName(String rankName) {
        this.rankName = rankName;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
