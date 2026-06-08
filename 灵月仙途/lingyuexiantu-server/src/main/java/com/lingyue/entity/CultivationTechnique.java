package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cultivation_techniques", indexes = {
    @Index(name = "idx_technique_rarity", columnList = "rarity"),
    @Index(name = "idx_technique_active", columnList = "is_active")
})
public class CultivationTechnique {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "speed_addition", nullable = false, precision = 10)
    private Double speedAddition; // 百分比加成
    
    @Column(name = "speed_addition_flat", nullable = false)
    private Integer speedAdditionFlat; // 绝对值加成 (点/秒)
    
    @Column(name = "limit_addition", nullable = false)
    private Long limitAddition; // 上限加成
    
    @Column(name = "rarity", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TechniqueRarity rarity;
    
    @Column(name = "level_requirement", nullable = false)
    private Integer levelRequirement;
    
    @Column(name = "realm_requirement", length = 50)
    private String realmRequirement;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (speedAddition == null) speedAddition = 0.0;
        if (speedAdditionFlat == null) speedAdditionFlat = 0;
        if (limitAddition == null) limitAddition = 0L;
        if (isActive == null) isActive = true;
        if (levelRequirement == null) levelRequirement = 1;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum TechniqueRarity {
        COMMON("普通"),
        UNCOMMON("优秀"),
        RARE("稀有"),
        EPIC("史诗"),
        LEGENDARY("传说");
        
        private final String displayName;
        
        TechniqueRarity(String displayName) {
            this.displayName = displayName;
        }
        
        public String getDisplayName() {
            return displayName;
        }
    }
    
    // Constructors
    public CultivationTechnique() {}
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Double getSpeedAddition() {
        return speedAddition;
    }
    
    public void setSpeedAddition(Double speedAddition) {
        this.speedAddition = speedAddition;
    }
    
    public Integer getSpeedAdditionFlat() {
        return speedAdditionFlat;
    }
    
    public void setSpeedAdditionFlat(Integer speedAdditionFlat) {
        this.speedAdditionFlat = speedAdditionFlat;
    }
    
    public Long getLimitAddition() {
        return limitAddition;
    }
    
    public void setLimitAddition(Long limitAddition) {
        this.limitAddition = limitAddition;
    }
    
    public TechniqueRarity getRarity() {
        return rarity;
    }
    
    public void setRarity(TechniqueRarity rarity) {
        this.rarity = rarity;
    }
    
    public Integer getLevelRequirement() {
        return levelRequirement;
    }
    
    public void setLevelRequirement(Integer levelRequirement) {
        this.levelRequirement = levelRequirement;
    }
    
    public String getRealmRequirement() {
        return realmRequirement;
    }
    
    public void setRealmRequirement(String realmRequirement) {
        this.realmRequirement = realmRequirement;
    }
    
    public Boolean getIsActive() {
        return isActive;
    }
    
    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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