package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "body_cultivation_realm")
public class BodyCultivationRealm {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "realm_name", nullable = false, length = 50)
    private String realmName;
    
    @Column(name = "realm_order", nullable = false)
    private Integer realmOrder;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "base_hp_bonus", nullable = false)
    private Integer baseHpBonus = 0;
    
    @Column(name = "base_defense_bonus", nullable = false)
    private Integer baseDefenseBonus = 0;
    
    @Column(name = "base_strength_bonus", nullable = false)
    private Integer baseStrengthBonus = 0;
    
    @Column(name = "breakthrough_success_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal breakthroughSuccessRate;
    
    @Column(name = "required_exp", nullable = false)
    private Long requiredExp;
    
    @Column(name = "pain_growth_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal painGrowthRate;
    
    @Column(name = "mutation_probability", nullable = false, precision = 5, scale = 2)
    private BigDecimal mutationProbability;
    
    @Column(name = "failure_penalty", length = 20)
    private String failurePenalty;
    
    @Column(name = "status", nullable = false)
    private Integer status = 1;
    
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
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
}
