package com.lingyue.dto;

import java.util.List;

public class ActivityDTO {
    private Long roleId;
    private Integer dailyActivity;
    private Integer totalActivity;
    private List<Long> claimedRewards;
    private List<ActivityRewardDTO> availableRewards;
    
    public Long getRoleId() {
        return roleId;
    }
    
    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
    
    public Integer getDailyActivity() {
        return dailyActivity;
    }
    
    public void setDailyActivity(Integer dailyActivity) {
        this.dailyActivity = dailyActivity;
    }
    
    public Integer getTotalActivity() {
        return totalActivity;
    }
    
    public void setTotalActivity(Integer totalActivity) {
        this.totalActivity = totalActivity;
    }
    
    public List<Long> getClaimedRewards() {
        return claimedRewards;
    }
    
    public void setClaimedRewards(List<Long> claimedRewards) {
        this.claimedRewards = claimedRewards;
    }
    
    public List<ActivityRewardDTO> getAvailableRewards() {
        return availableRewards;
    }
    
    public void setAvailableRewards(List<ActivityRewardDTO> availableRewards) {
        this.availableRewards = availableRewards;
    }
    
    public static class ActivityRewardDTO {
        private Long id;
        private Integer activityThreshold;
        private String name;
        private String description;
        private Integer rewardXiuwei;
        private Integer rewardLingshi;
        private String rewardItems;
        private Boolean claimed;
        private Boolean available;
        
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
        
        public Boolean getClaimed() {
            return claimed;
        }
        
        public void setClaimed(Boolean claimed) {
            this.claimed = claimed;
        }
        
        public Boolean getAvailable() {
            return available;
        }
        
        public void setAvailable(Boolean available) {
            this.available = available;
        }
    }
}
