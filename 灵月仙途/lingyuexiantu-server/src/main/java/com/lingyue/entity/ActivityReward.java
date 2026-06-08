package com.lingyue.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "activity_reward")
public class ActivityReward {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "activity_threshold", nullable = false)
    private Integer activityThreshold;
    
    @Column(name = "name", nullable = false, length = 200)
    private String name;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "reward_xiuwei")
    private Integer rewardXiuwei;
    
    @Column(name = "reward_lingshi")
    private Integer rewardLingshi;
    
    @Column(name = "reward_items", length = 2000)
    private String rewardItems;
    
    @Column(name = "is_enabled", columnDefinition = "TINYINT DEFAULT 1")
    private Boolean isEnabled;
    
    @Column(name = "sort_order")
    private Integer sortOrder;
    
    @Column(name = "created_at")
    private Date createdAt;
    
    @Column(name = "updated_at")
    private Date updatedAt;
    
    public ActivityReward() {
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Integer getActivityThreshold() {
        return activityThreshold;
    }
    
    public void setActivityThreshold(Integer activityThreshold) {
        this.activityThreshold = activityThreshold;
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
    
    public String getRewardItems() {
        return rewardItems;
    }
    
    public void setRewardItems(String rewardItems) {
        this.rewardItems = rewardItems;
    }
    
    public Boolean getIsEnabled() {
        return isEnabled;
    }
    
    public void setIsEnabled(Boolean isEnabled) {
        this.isEnabled = isEnabled;
    }
    
    public Integer getSortOrder() {
        return sortOrder;
    }
    
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    public Date getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}
