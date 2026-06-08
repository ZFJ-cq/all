package com.lingyue.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "task_log")
public class TaskLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id", nullable = false)
    private Long roleId;
    
    @Column(name = "task_id")
    private Long taskId;
    
    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;
    
    @Column(name = "loop_count")
    private Integer loopCount;
    
    @Column(name = "time_spent")
    private Integer timeSpent;
    
    @Column(name = "progress_before")
    private Integer progressBefore;
    
    @Column(name = "progress_after")
    private Integer progressAfter;
    
    @Column(name = "reward_info", length = 2000)
    private String rewardInfo;
    
    @Column(name = "ip_address", length = 50)
    private String ipAddress;
    
    @Column(name = "user_agent", length = 500)
    private String userAgent;
    
    @Column(name = "created_at")
    private Date createdAt;
    
    public TaskLog() {
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getRoleId() {
        return roleId;
    }
    
    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
    
    public Long getTaskId() {
        return taskId;
    }
    
    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
    
    public String getActionType() {
        return actionType;
    }
    
    public void setActionType(String actionType) {
        this.actionType = actionType;
    }
    
    public Integer getLoopCount() {
        return loopCount;
    }
    
    public void setLoopCount(Integer loopCount) {
        this.loopCount = loopCount;
    }
    
    public Integer getTimeSpent() {
        return timeSpent;
    }
    
    public void setTimeSpent(Integer timeSpent) {
        this.timeSpent = timeSpent;
    }
    
    public Integer getProgressBefore() {
        return progressBefore;
    }
    
    public void setProgressBefore(Integer progressBefore) {
        this.progressBefore = progressBefore;
    }
    
    public Integer getProgressAfter() {
        return progressAfter;
    }
    
    public void setProgressAfter(Integer progressAfter) {
        this.progressAfter = progressAfter;
    }
    
    public String getRewardInfo() {
        return rewardInfo;
    }
    
    public void setRewardInfo(String rewardInfo) {
        this.rewardInfo = rewardInfo;
    }
    
    public String getIpAddress() {
        return ipAddress;
    }
    
    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
    
    public String getUserAgent() {
        return userAgent;
    }
    
    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
}
