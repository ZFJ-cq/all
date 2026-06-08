package com.lingyue.entity;

import jakarta.persistence.*;

/**
 * 丹药效果配置表
 */
@Entity
@Table(name = "cfg_pill_effect")
public class CfgPillEffect {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Integer id;

    @Column(name = "pill_name", nullable = false, length = 50)
    private String pillName;

    @Column(name = "pill_rank", nullable = false)
    private Integer rank;

    @Column(name = "effect", nullable = false, length = 100)
    private String effect;

    @Column(name = "duration", nullable = false, length = 50)
    private String duration;

    @Column(name = "cooldown", nullable = false, length = 50)
    private String cooldown;

    @Column(name = "material_cost", nullable = false)
    private Integer materialCost;

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getPillName() {
        return pillName;
    }

    public void setPillName(String pillName) {
        this.pillName = pillName;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public String getEffect() {
        return effect;
    }

    public void setEffect(String effect) {
        this.effect = effect;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public String getCooldown() {
        return cooldown;
    }

    public void setCooldown(String cooldown) {
        this.cooldown = cooldown;
    }

    public Integer getMaterialCost() {
        return materialCost;
    }

    public void setMaterialCost(Integer materialCost) {
        this.materialCost = materialCost;
    }
}