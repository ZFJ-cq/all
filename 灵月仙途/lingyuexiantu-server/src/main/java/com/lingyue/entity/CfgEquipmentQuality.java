package com.lingyue.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

/**
 * 装备品质属性范围配置表
 */
@Entity
@Table(name = "cfg_equipment_quality")
public class CfgEquipmentQuality {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Integer id;

    @Column(name = "quality", nullable = false, length = 20)
    private String quality;

    @Column(name = "color", nullable = false, length = 20)
    private String color;

    @Column(name = "probability", nullable = false, precision = 5, scale = 4)
    private BigDecimal probability;

    @Column(name = "min_bonus", nullable = false)
    private Integer minBonus;

    @Column(name = "max_bonus", nullable = false)
    private Integer maxBonus;

    @Column(name = "special_effect_probability", nullable = false, precision = 5, scale = 4)
    private BigDecimal specialEffectProbability;

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getQuality() {
        return quality;
    }

    public void setQuality(String quality) {
        this.quality = quality;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public BigDecimal getProbability() {
        return probability;
    }

    public void setProbability(BigDecimal probability) {
        this.probability = probability;
    }

    public Integer getMinBonus() {
        return minBonus;
    }

    public void setMinBonus(Integer minBonus) {
        this.minBonus = minBonus;
    }

    public Integer getMaxBonus() {
        return maxBonus;
    }

    public void setMaxBonus(Integer maxBonus) {
        this.maxBonus = maxBonus;
    }

    public BigDecimal getSpecialEffectProbability() {
        return specialEffectProbability;
    }

    public void setSpecialEffectProbability(BigDecimal specialEffectProbability) {
        this.specialEffectProbability = specialEffectProbability;
    }
}