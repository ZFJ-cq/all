package com.lingyue.dto;

public class TaskRewardDTO {
    private Boolean success;
    private String message;
    private Integer rewardXiuwei;
    private Integer rewardLingshi;
    private Integer rewardActivity;
    private Integer rewardClanContribution;
    private String rewardItems;
    private Integer newDailyActivity;
    
    public Boolean getSuccess() {
        return success;
    }
    
    public void setSuccess(Boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
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
    
    public Integer getRewardActivity() {
        return rewardActivity;
    }
    
    public void setRewardActivity(Integer rewardActivity) {
        this.rewardActivity = rewardActivity;
    }
    
    public Integer getRewardClanContribution() {
        return rewardClanContribution;
    }
    
    public void setRewardClanContribution(Integer rewardClanContribution) {
        this.rewardClanContribution = rewardClanContribution;
    }
    
    public String getRewardItems() {
        return rewardItems;
    }
    
    public void setRewardItems(String rewardItems) {
        this.rewardItems = rewardItems;
    }
    
    public Integer getNewDailyActivity() {
        return newDailyActivity;
    }
    
    public void setNewDailyActivity(Integer newDailyActivity) {
        this.newDailyActivity = newDailyActivity;
    }
}
