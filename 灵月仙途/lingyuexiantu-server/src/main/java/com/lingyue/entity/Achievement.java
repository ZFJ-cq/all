package com.lingyue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "achievement")
public class Achievement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String name;
    
    @Column(nullable = false, length = 50)
    private String type;
    
    @Column(name = "`condition`", nullable = false, length = 200)
    private String condition;
    
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    private Integer status; // 1: 启用，0: 禁用
    
    @Column(length = 255)
    private String rewards;
    
    @Column(length = 100)
    private String moduleType; // cultivation, sect, skill, world
    
    @Column(length = 50)
    private String conditionType; // realm_breakthrough, cultivation_count, etc.
    
    @Column(length = 10)
    private String operator; // >=, ==, >, <, <=
    
    @Column
    private Integer threshold; // 阈值
    
    @Column(length = 255)
    private String rewardAttributes; // JSON 格式的属性加成 {attack: 10, defense: 5}
    
    @Column(length = 50)
    private String title; // 奖励称号名称
    
    @Column(length = 20)
    private String rarity; // common, rare, epic, legendary
    
    @Column(length = 10)
    private String icon; // 图标
    
    @Column
    private Boolean hidden; // 是否隐藏成就
    
    public Achievement() {
    }
    
    public Achievement(Long id, String name, String type, String condition, Integer sortOrder, Integer status, String rewards,
                      String moduleType, String conditionType, String operator, Integer threshold, 
                      String rewardAttributes, String title, String rarity, String icon, Boolean hidden) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.condition = condition;
        this.sortOrder = sortOrder;
        this.status = status;
        this.rewards = rewards;
        this.moduleType = moduleType;
        this.conditionType = conditionType;
        this.operator = operator;
        this.threshold = threshold;
        this.rewardAttributes = rewardAttributes;
        this.title = title;
        this.rarity = rarity;
        this.icon = icon;
        this.hidden = hidden;
    }
    
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
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getCondition() {
        return condition;
    }
    
    public void setCondition(String condition) {
        this.condition = condition;
    }
    
    public Integer getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    public String getRewards() {
        return rewards;
    }
    
    public void setRewards(String rewards) {
        this.rewards = rewards;
    }
    
    public String getModuleType() {
        return moduleType;
    }
    
    public void setModuleType(String moduleType) {
        this.moduleType = moduleType;
    }
    
    public String getConditionType() {
        return conditionType;
    }
    
    public void setConditionType(String conditionType) {
        this.conditionType = conditionType;
    }
    
    public String getOperator() {
        return operator;
    }
    
    public void setOperator(String operator) {
        this.operator = operator;
    }
    
    public Integer getThreshold() {
        return threshold;
    }
    
    public void setThreshold(Integer threshold) {
        this.threshold = threshold;
    }
    
    public String getRewardAttributes() {
        return rewardAttributes;
    }
    
    public void setRewardAttributes(String rewardAttributes) {
        this.rewardAttributes = rewardAttributes;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getRarity() {
        return rarity;
    }
    
    public void setRarity(String rarity) {
        this.rarity = rarity;
    }
    
    public String getIcon() {
        return icon;
    }
    
    public void setIcon(String icon) {
        this.icon = icon;
    }
    
    public Boolean getHidden() {
        return hidden;
    }
    
    public void setHidden(Boolean hidden) {
        this.hidden = hidden;
    }
}