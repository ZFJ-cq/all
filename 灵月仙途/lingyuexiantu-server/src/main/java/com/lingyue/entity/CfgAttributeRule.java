package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * 属性计算规则配置实体
 */
@Entity
@Table(name = "cfg_attribute_rules")
public class CfgAttributeRule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "rule_key", nullable = false, length = 50)
    private String ruleKey;
    
    @Column(name = "rule_name", nullable = false, length = 100)
    private String ruleName;
    
    @Column(name = "rule_type", nullable = false)
    private Integer ruleType;
    
    @Column(name = "attribute_type", length = 20)
    private String attributeType;
    
    @Column(columnDefinition = "VARCHAR(500)")
    private String formula;
    
    @Column(name = "base_value", precision = 10, scale = 4)
    private BigDecimal baseValue;
    
    @Column(name = "coeff_value", precision = 10, scale = 4)
    private BigDecimal coeffValue;
    
    @Column(name = "min_value", precision = 10, scale = 4)
    private BigDecimal minValue;
    
    @Column(name = "max_value", precision = 10, scale = 4)
    private BigDecimal maxValue;
    
    @Column(length = 500)
    private String description;
    
    private Integer priority;
    
    @Column(name = "is_active")
    private Boolean isActive;
    
    private Integer version;
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRuleKey() { return ruleKey; }
    public void setRuleKey(String ruleKey) { this.ruleKey = ruleKey; }
    
    public String getRuleName() { return ruleName; }
    public void setRuleName(String ruleName) { this.ruleName = ruleName; }
    
    public Integer getRuleType() { return ruleType; }
    public void setRuleType(Integer ruleType) { this.ruleType = ruleType; }
    
    public String getAttributeType() { return attributeType; }
    public void setAttributeType(String attributeType) { this.attributeType = attributeType; }
    
    public String getFormula() { return formula; }
    public void setFormula(String formula) { this.formula = formula; }
    
    public BigDecimal getBaseValue() { return baseValue; }
    public void setBaseValue(BigDecimal baseValue) { this.baseValue = baseValue; }
    
    public BigDecimal getCoeffValue() { return coeffValue; }
    public void setCoeffValue(BigDecimal coeffValue) { this.coeffValue = coeffValue; }
    
    public BigDecimal getMinValue() { return minValue; }
    public void setMinValue(BigDecimal minValue) { this.minValue = minValue; }
    
    public BigDecimal getMaxValue() { return maxValue; }
    public void setMaxValue(BigDecimal maxValue) { this.maxValue = maxValue; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public Integer getPriority() { return priority; }
    public void setPriority(Integer priority) { this.priority = priority; }
    
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
}
