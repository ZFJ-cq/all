package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_achievement")
public class RoleAchievement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id", nullable = false)
    private Long roleId;
    
    @Column(name = "achievement_id", nullable = false)
    private Long achievementId;
    
    private Integer progress; // 进度
    
    private String status; // in_progress, completed, claimed
    
    @Column(name = "completed_time")
    private LocalDateTime completedTime;
    
    @Column(name = "claimed_time")
    private LocalDateTime claimedTime;
    
    @Column(name = "claimed_request_id", length = 100)
    private String claimedRequestId;
    
    @Column(name = "claimed_ip", length = 50)
    private String claimedIp;
    
    @Column(name = "version")
    private Integer version = 0;
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @Column(name = "update_time")
    private LocalDateTime updateTime;
    
    @Column
    private Boolean isEquipped; // 是否佩戴此称号
    
    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
        isEquipped = false;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
    
    public RoleAchievement() {
    }
    
    public RoleAchievement(Long id, Long roleId, Long achievementId, Integer progress, String status, 
                         LocalDateTime completedTime, LocalDateTime claimedTime, 
                         LocalDateTime createTime, LocalDateTime updateTime, Boolean isEquipped) {
        this.id = id;
        this.roleId = roleId;
        this.achievementId = achievementId;
        this.progress = progress;
        this.status = status;
        this.completedTime = completedTime;
        this.claimedTime = claimedTime;
        this.createTime = createTime;
        this.updateTime = updateTime;
        this.isEquipped = isEquipped;
        this.version = 0;
    }
    
    // Getters and Setters
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
    
    public Long getAchievementId() {
        return achievementId;
    }
    
    public void setAchievementId(Long achievementId) {
        this.achievementId = achievementId;
    }
    
    public Integer getProgress() {
        return progress;
    }
    
    public void setProgress(Integer progress) {
        this.progress = progress;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public LocalDateTime getCompletedTime() {
        return completedTime;
    }
    
    public void setCompletedTime(LocalDateTime completedTime) {
        this.completedTime = completedTime;
    }
    
    public LocalDateTime getClaimedTime() {
        return claimedTime;
    }
    
    public void setClaimedTime(LocalDateTime claimedTime) {
        this.claimedTime = claimedTime;
    }
    
    public String getClaimedRequestId() {
        return claimedRequestId;
    }
    
    public void setClaimedRequestId(String claimedRequestId) {
        this.claimedRequestId = claimedRequestId;
    }
    
    public String getClaimedIp() {
        return claimedIp;
    }
    
    public void setClaimedIp(String claimedIp) {
        this.claimedIp = claimedIp;
    }
    
    public Integer getVersion() {
        return version;
    }
    
    public void setVersion(Integer version) {
        this.version = version;
    }
    
    public LocalDateTime getCreateTime() {
        return createTime;
    }
    
    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
    
    public LocalDateTime getUpdateTime() {
        return updateTime;
    }
    
    public void setUpdateTime(LocalDateTime updateTime) {
        this.updateTime = updateTime;
    }
    
    public Boolean getIsEquipped() {
        return isEquipped;
    }
    
    public void setIsEquipped(Boolean isEquipped) {
        this.isEquipped = isEquipped;
    }
}