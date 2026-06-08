package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 锻体部位配置实体
 */
@Entity
@Table(name = "body_part")
public class BodyPart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "part_name", nullable = false, length = 50)
    private String partName;

    @Column(name = "part_code", nullable = false, length = 50)
    private String partCode;

    @Column(length = 200)
    private String description;

    @Column(name = "primary_attr", length = 50)
    private String primaryAttr;

    @Column(name = "secondary_attr", length = 50)
    private String secondaryAttr;

    @Column(name = "base_exp_requirement")
    private Integer baseExpRequirement = 100;

    @Column(name = "exp_growth_rate", precision = 5, scale = 2)
    private BigDecimal expGrowthRate = new BigDecimal("1.5");

    @Column(name = "max_level")
    private Integer maxLevel = 100;

    private Integer status = 1;

    @Column(name = "sort_order")
    private Integer sortOrder = 0;

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

    public String getPartName() {
        return partName;
    }

    public void setPartName(String partName) {
        this.partName = partName;
    }

    public String getPartCode() {
        return partCode;
    }

    public void setPartCode(String partCode) {
        this.partCode = partCode;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPrimaryAttr() {
        return primaryAttr;
    }

    public void setPrimaryAttr(String primaryAttr) {
        this.primaryAttr = primaryAttr;
    }

    public String getSecondaryAttr() {
        return secondaryAttr;
    }

    public void setSecondaryAttr(String secondaryAttr) {
        this.secondaryAttr = secondaryAttr;
    }

    public Integer getBaseExpRequirement() {
        return baseExpRequirement;
    }

    public void setBaseExpRequirement(Integer baseExpRequirement) {
        this.baseExpRequirement = baseExpRequirement;
    }

    public BigDecimal getExpGrowthRate() {
        return expGrowthRate;
    }

    public void setExpGrowthRate(BigDecimal expGrowthRate) {
        this.expGrowthRate = expGrowthRate;
    }

    public Integer getMaxLevel() {
        return maxLevel;
    }

    public void setMaxLevel(Integer maxLevel) {
        this.maxLevel = maxLevel;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
