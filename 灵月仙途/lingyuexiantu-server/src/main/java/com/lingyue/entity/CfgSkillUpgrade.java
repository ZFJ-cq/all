package com.lingyue.entity;

import jakarta.persistence.*;

/**
 * 技能升级需求配置表
 */
@Entity
@Table(name = "cfg_skill_upgrade")
public class CfgSkillUpgrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Integer id;

    @Column(name = "skill_level", nullable = false, length = 20)
    private String skillLevel;

    @Column(name = "proficiency_requirement", nullable = false)
    private Integer proficiencyRequirement;

    @Column(name = "effect_increase", nullable = false, length = 50)
    private String effectIncrease;

    @Column(name = "mana_consumption", nullable = false, length = 50)
    private String manaConsumption;

    @Column(name = "cooldown", nullable = false, length = 50)
    private String cooldown;

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public Integer getProficiencyRequirement() {
        return proficiencyRequirement;
    }

    public void setProficiencyRequirement(Integer proficiencyRequirement) {
        this.proficiencyRequirement = proficiencyRequirement;
    }

    public String getEffectIncrease() {
        return effectIncrease;
    }

    public void setEffectIncrease(String effectIncrease) {
        this.effectIncrease = effectIncrease;
    }

    public String getManaConsumption() {
        return manaConsumption;
    }

    public void setManaConsumption(String manaConsumption) {
        this.manaConsumption = manaConsumption;
    }

    public String getCooldown() {
        return cooldown;
    }

    public void setCooldown(String cooldown) {
        this.cooldown = cooldown;
    }
}