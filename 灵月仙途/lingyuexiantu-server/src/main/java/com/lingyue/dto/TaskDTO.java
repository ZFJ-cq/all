package com.lingyue.dto;

import java.util.Date;

public class TaskDTO {
    private Long id;
    private String name;
    private String description;
    private Integer type;
    private String subType;
    private Integer levelRequirement;
    private String realmRequirement;
    private String targetType;
    private Long targetId;
    private Integer targetCount;
    private Integer rewardExp;
    private Integer rewardXiuwei;
    private Integer rewardLingshi;
    private Integer rewardClanContribution;
    private Integer rewardActivity;
    private String rewardItems;
    private Boolean isDaily;
    private Boolean isLoop;
    private Integer sortOrder;
    
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
    
    public Integer getType() {
        return type;
    }
    
    public void setType(Integer type) {
        this.type = type;
    }
    
    public String getSubType() {
        return subType;
    }
    
    public void setSubType(String subType) {
        this.subType = subType;
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
    
    public String getTargetType() {
        return targetType;
    }
    
    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }
    
    public Long getTargetId() {
        return targetId;
    }
    
    public void setTargetId(Long targetId) {
        this.targetId = targetId;
    }
    
    public Integer getTargetCount() {
        return targetCount;
    }
    
    public void setTargetCount(Integer targetCount) {
        this.targetCount = targetCount;
    }
    
    public Integer getRewardExp() {
        return rewardExp;
    }
    
    public void setRewardExp(Integer rewardExp) {
        this.rewardExp = rewardExp;
    }
    
    public Integer getRewardXiuwei() {
        return rewardXiuwei;
    }
    
    public void setRewardXiuwei(Integer rewardXiuwei) {
        this.rewardXiuwei = rewardXiuwei;
    }
    
    public Integer getRewardLingshi() {
        return rewardLingshi;
    }
    
    public void setRewardLingshi(Integer rewardLingshi) {
        this.rewardLingshi = rewardLingshi;
    }
    
    public Integer getRewardClanContribution() {
        return rewardClanContribution;
    }
    
    public void setRewardClanContribution(Integer rewardClanContribution) {
        this.rewardClanContribution = rewardClanContribution;
    }
    
    public Integer getRewardActivity() {
        return rewardActivity;
    }
    
    public void setRewardActivity(Integer rewardActivity) {
        this.rewardActivity = rewardActivity;
    }
    
    public String getRewardItems() {
        return rewardItems;
    }
    
    public void setRewardItems(String rewardItems) {
        this.rewardItems = rewardItems;
    }
    
    public Boolean getIsDaily() {
        return isDaily;
    }
    
    public void setIsDaily(Boolean isDaily) {
        this.isDaily = isDaily;
    }
    
    public Boolean getIsLoop() {
        return isLoop;
    }
    
    public void setIsLoop(Boolean isLoop) {
        this.isLoop = isLoop;
    }
    
    public Integer getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
}
