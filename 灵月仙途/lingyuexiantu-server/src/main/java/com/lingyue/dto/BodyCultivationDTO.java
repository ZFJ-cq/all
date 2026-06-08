package com.lingyue.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 锻体系统 DTO
 */
public class BodyCultivationDTO {
    
    private Long roleId;
    private Long realmId;
    private String realmName;
    private Integer realmOrder;
    private Long bodyExp;
    private Long requiredExp;
    private BigDecimal painValue;
    private Integer tolerance;
    private Integer status;
    private LocalDateTime injuryRecoveryTime;
    private MutationInfo mutation;
    private List<PartProgressInfo> partProgressList;
    
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public Long getRealmId() { return realmId; }
    public void setRealmId(Long realmId) { this.realmId = realmId; }
    public String getRealmName() { return realmName; }
    public void setRealmName(String realmName) { this.realmName = realmName; }
    public Integer getRealmOrder() { return realmOrder; }
    public void setRealmOrder(Integer realmOrder) { this.realmOrder = realmOrder; }
    public Long getBodyExp() { return bodyExp; }
    public void setBodyExp(Long bodyExp) { this.bodyExp = bodyExp; }
    public Long getRequiredExp() { return requiredExp; }
    public void setRequiredExp(Long requiredExp) { this.requiredExp = requiredExp; }
    public BigDecimal getPainValue() { return painValue; }
    public void setPainValue(BigDecimal painValue) { this.painValue = painValue; }
    public Integer getTolerance() { return tolerance; }
    public void setTolerance(Integer tolerance) { this.tolerance = tolerance; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public LocalDateTime getInjuryRecoveryTime() { return injuryRecoveryTime; }
    public void setInjuryRecoveryTime(LocalDateTime injuryRecoveryTime) { this.injuryRecoveryTime = injuryRecoveryTime; }
    public MutationInfo getMutation() { return mutation; }
    public void setMutation(MutationInfo mutation) { this.mutation = mutation; }
    public List<PartProgressInfo> getPartProgressList() { return partProgressList; }
    public void setPartProgressList(List<PartProgressInfo> partProgressList) { this.partProgressList = partProgressList; }
    
    public static class RealmInfo {
        private Long id;
        private String realmName;
        private Integer realmOrder;
        private String description;
        private Integer baseHpBonus;
        private Integer baseDefenseBonus;
        private Integer baseStrengthBonus;
        private BigDecimal breakthroughSuccessRate;
        private Long requiredExp;
        private BigDecimal painGrowthRate;
        private BigDecimal mutationProbability;
        private String failurePenalty;
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getRealmName() { return realmName; }
        public void setRealmName(String realmName) { this.realmName = realmName; }
        public Integer getRealmOrder() { return realmOrder; }
        public void setRealmOrder(Integer realmOrder) { this.realmOrder = realmOrder; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getBaseHpBonus() { return baseHpBonus; }
        public void setBaseHpBonus(Integer baseHpBonus) { this.baseHpBonus = baseHpBonus; }
        public Integer getBaseDefenseBonus() { return baseDefenseBonus; }
        public void setBaseDefenseBonus(Integer baseDefenseBonus) { this.baseDefenseBonus = baseDefenseBonus; }
        public Integer getBaseStrengthBonus() { return baseStrengthBonus; }
        public void setBaseStrengthBonus(Integer baseStrengthBonus) { this.baseStrengthBonus = baseStrengthBonus; }
        public BigDecimal getBreakthroughSuccessRate() { return breakthroughSuccessRate; }
        public void setBreakthroughSuccessRate(BigDecimal breakthroughSuccessRate) { this.breakthroughSuccessRate = breakthroughSuccessRate; }
        public Long getRequiredExp() { return requiredExp; }
        public void setRequiredExp(Long requiredExp) { this.requiredExp = requiredExp; }
        public BigDecimal getPainGrowthRate() { return painGrowthRate; }
        public void setPainGrowthRate(BigDecimal painGrowthRate) { this.painGrowthRate = painGrowthRate; }
        public BigDecimal getMutationProbability() { return mutationProbability; }
        public void setMutationProbability(BigDecimal mutationProbability) { this.mutationProbability = mutationProbability; }
        public String getFailurePenalty() { return failurePenalty; }
        public void setFailurePenalty(String failurePenalty) { this.failurePenalty = failurePenalty; }
    }
    
    public static class PartInfo {
        private Long id;
        private String partName;
        private String partCode;
        private String description;
        private String primaryAttr;
        private String secondaryAttr;
        private Integer baseExpRequirement;
        private BigDecimal expGrowthRate;
        private Integer maxLevel;
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getPartName() { return partName; }
        public void setPartName(String partName) { this.partName = partName; }
        public String getPartCode() { return partCode; }
        public void setPartCode(String partCode) { this.partCode = partCode; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPrimaryAttr() { return primaryAttr; }
        public void setPrimaryAttr(String primaryAttr) { this.primaryAttr = primaryAttr; }
        public String getSecondaryAttr() { return secondaryAttr; }
        public void setSecondaryAttr(String secondaryAttr) { this.secondaryAttr = secondaryAttr; }
        public Integer getBaseExpRequirement() { return baseExpRequirement; }
        public void setBaseExpRequirement(Integer baseExpRequirement) { this.baseExpRequirement = baseExpRequirement; }
        public BigDecimal getExpGrowthRate() { return expGrowthRate; }
        public void setExpGrowthRate(BigDecimal expGrowthRate) { this.expGrowthRate = expGrowthRate; }
        public Integer getMaxLevel() { return maxLevel; }
        public void setMaxLevel(Integer maxLevel) { this.maxLevel = maxLevel; }
    }
    
    public static class PartProgressInfo {
        private Long partId;
        private String partName;
        private String partCode;
        private Integer level;
        private Long exp;
        private Long requiredExp;
        private Integer cultivateCount;
        private Boolean isLocked;
        
        public Long getPartId() { return partId; }
        public void setPartId(Long partId) { this.partId = partId; }
        public String getPartName() { return partName; }
        public void setPartName(String partName) { this.partName = partName; }
        public String getPartCode() { return partCode; }
        public void setPartCode(String partCode) { this.partCode = partCode; }
        public Integer getLevel() { return level; }
        public void setLevel(Integer level) { this.level = level; }
        public Long getExp() { return exp; }
        public void setExp(Long exp) { this.exp = exp; }
        public Long getRequiredExp() { return requiredExp; }
        public void setRequiredExp(Long requiredExp) { this.requiredExp = requiredExp; }
        public Integer getCultivateCount() { return cultivateCount; }
        public void setCultivateCount(Integer cultivateCount) { this.cultivateCount = cultivateCount; }
        public Boolean getIsLocked() { return isLocked; }
        public void setIsLocked(Boolean isLocked) { this.isLocked = isLocked; }
    }
    
    public static class MutationInfo {
        private Long id;
        private String mutationName;
        private String mutationCode;
        private String description;
        private String rarity;
        private String effectType;
        private String effectValue;
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getMutationName() { return mutationName; }
        public void setMutationName(String mutationName) { this.mutationName = mutationName; }
        public String getMutationCode() { return mutationCode; }
        public void setMutationCode(String mutationCode) { this.mutationCode = mutationCode; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getRarity() { return rarity; }
        public void setRarity(String rarity) { this.rarity = rarity; }
        public String getEffectType() { return effectType; }
        public void setEffectType(String effectType) { this.effectType = effectType; }
        public String getEffectValue() { return effectValue; }
        public void setEffectValue(String effectValue) { this.effectValue = effectValue; }
    }
    
    public static class LogInfo {
        private Long id;
        private String actionType;
        private Boolean success;
        private BigDecimal painValueBefore;
        private BigDecimal painValueAfter;
        private Integer toleranceBefore;
        private Integer toleranceAfter;
        private Long expGained;
        private String resultDescription;
        private LocalDateTime createdAt;
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getActionType() { return actionType; }
        public void setActionType(String actionType) { this.actionType = actionType; }
        public Boolean getSuccess() { return success; }
        public void setSuccess(Boolean success) { this.success = success; }
        public BigDecimal getPainValueBefore() { return painValueBefore; }
        public void setPainValueBefore(BigDecimal painValueBefore) { this.painValueBefore = painValueBefore; }
        public BigDecimal getPainValueAfter() { return painValueAfter; }
        public void setPainValueAfter(BigDecimal painValueAfter) { this.painValueAfter = painValueAfter; }
        public Integer getToleranceBefore() { return toleranceBefore; }
        public void setToleranceBefore(Integer toleranceBefore) { this.toleranceBefore = toleranceBefore; }
        public Integer getToleranceAfter() { return toleranceAfter; }
        public void setToleranceAfter(Integer toleranceAfter) { this.toleranceAfter = toleranceAfter; }
        public Long getExpGained() { return expGained; }
        public void setExpGained(Long expGained) { this.expGained = expGained; }
        public String getResultDescription() { return resultDescription; }
        public void setResultDescription(String resultDescription) { this.resultDescription = resultDescription; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }
}
