package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "realm_config")
public class RealmConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "realm_name", nullable = false, length = 20)
    private String realmName;
    
    @Column(name = "realm_index", nullable = false)
    private Integer realmIndex;
    
    @Column(nullable = false)
    private Integer level;
    
    @Column(name = "full_realm_name", nullable = false, length = 30)
    private String fullRealmName;
    
    @Column(name = "required_xiuwei", nullable = false)
    private Long requiredXiuwei = 0L;
    
    @Column(name = "base_success_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal baseSuccessRate = new BigDecimal("60.00");
    
    @Column(name = "penalty_type", length = 20)
    private String penaltyType = "NONE";
    
    @Column(name = "penalty_value")
    private Integer penaltyValue = 0;
    
    @Column(name = "efficiency_multiplier", precision = 5, scale = 2)
    private BigDecimal efficiencyMultiplier = new BigDecimal("1.00");
    
    @Column(name = "required_pill", length = 50)
    private String requiredPill;
    
    @Column(name = "required_pill_count")
    private Integer requiredPillCount = 0;
    
    @Column(name = "is_major_breakthrough")
    private Boolean isMajorBreakthrough = false;
    
    @Column(name = "sort_order")
    private Integer sortOrder = 0;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    public RealmConfig() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRealmName() { return realmName; }
    public void setRealmName(String realmName) { this.realmName = realmName; }
    public Integer getRealmIndex() { return realmIndex; }
    public void setRealmIndex(Integer realmIndex) { this.realmIndex = realmIndex; }
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    public String getFullRealmName() { return fullRealmName; }
    public void setFullRealmName(String fullRealmName) { this.fullRealmName = fullRealmName; }
    public Long getRequiredXiuwei() { return requiredXiuwei; }
    public void setRequiredXiuwei(Long requiredXiuwei) { this.requiredXiuwei = requiredXiuwei; }
    public BigDecimal getBaseSuccessRate() { return baseSuccessRate; }
    public void setBaseSuccessRate(BigDecimal baseSuccessRate) { this.baseSuccessRate = baseSuccessRate; }
    public String getPenaltyType() { return penaltyType; }
    public void setPenaltyType(String penaltyType) { this.penaltyType = penaltyType; }
    public Integer getPenaltyValue() { return penaltyValue; }
    public void setPenaltyValue(Integer penaltyValue) { this.penaltyValue = penaltyValue; }
    public BigDecimal getEfficiencyMultiplier() { return efficiencyMultiplier; }
    public void setEfficiencyMultiplier(BigDecimal efficiencyMultiplier) { this.efficiencyMultiplier = efficiencyMultiplier; }
    public String getRequiredPill() { return requiredPill; }
    public void setRequiredPill(String requiredPill) { this.requiredPill = requiredPill; }
    public Integer getRequiredPillCount() { return requiredPillCount; }
    public void setRequiredPillCount(Integer requiredPillCount) { this.requiredPillCount = requiredPillCount; }
    public Boolean getIsMajorBreakthrough() { return isMajorBreakthrough; }
    public void setIsMajorBreakthrough(Boolean isMajorBreakthrough) { this.isMajorBreakthrough = isMajorBreakthrough; }
    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
