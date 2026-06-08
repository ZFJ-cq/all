package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 锻体异变配置实体
 */
@Entity
@Table(name = "body_mutation")
public class BodyMutation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mutation_name", nullable = false, length = 100)
    private String mutationName;

    @Column(name = "mutation_code", nullable = false, length = 50)
    private String mutationCode;

    @Column(length = 500)
    private String description;

    @Column(name = "effect_type", length = 50)
    private String effectType;

    @Column(name = "effect_value", length = 200)
    private String effectValue;

    private String rarity = "RARE";

    @Column(name = "activation_condition", length = 200)
    private String activationCondition;

    private Integer status = 1;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMutationName() {
        return mutationName;
    }

    public void setMutationName(String mutationName) {
        this.mutationName = mutationName;
    }

    public String getMutationCode() {
        return mutationCode;
    }

    public void setMutationCode(String mutationCode) {
        this.mutationCode = mutationCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEffectType() {
        return effectType;
    }

    public void setEffectType(String effectType) {
        this.effectType = effectType;
    }

    public String getEffectValue() {
        return effectValue;
    }

    public void setEffectValue(String effectValue) {
        this.effectValue = effectValue;
    }

    public String getRarity() {
        return rarity;
    }

    public void setRarity(String rarity) {
        this.rarity = rarity;
    }

    public String getActivationCondition() {
        return activationCondition;
    }

    public void setActivationCondition(String activationCondition) {
        this.activationCondition = activationCondition;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
