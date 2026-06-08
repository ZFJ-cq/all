package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 成就领取记录实体
 */
@Entity
@Table(name = "achievement_claim_record")
public class AchievementClaimRecord {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id", nullable = false)
    private Long roleId;
    
    @Column(name = "achievement_id", nullable = false)
    private Long achievementId;
    
    @Column(name = "request_id", nullable = false, length = 64)
    private String requestId;
    
    @Column(name = "reward_items", columnDefinition = "JSON")
    private String rewardItems;
    
    @Column(name = "reward_attributes", length = 500)
    private String rewardAttributes;
    
    @Column(name = "title_granted", length = 50)
    private String titleGranted;
    
    @Column(name = "claim_ip", length = 50)
    private String claimIp;
    
    @Column(name = "claim_time", nullable = false)
    private LocalDateTime claimTime;
    
    @Column(name = "status", nullable = false, length = 20)
    private String status;
    
    @Column(name = "error_message", length = 500)
    private String errorMessage;
    
    @Column(name = "trace_id", length = 64)
    private String traceId;
    
    @Version
    private Integer version;
    
    public AchievementClaimRecord() {
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
    
    public String getRequestId() {
        return requestId;
    }
    
    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
    
    public String getRewardItems() {
        return rewardItems;
    }
    
    public void setRewardItems(String rewardItems) {
        this.rewardItems = rewardItems;
    }
    
    public String getRewardAttributes() {
        return rewardAttributes;
    }
    
    public void setRewardAttributes(String rewardAttributes) {
        this.rewardAttributes = rewardAttributes;
    }
    
    public String getTitleGranted() {
        return titleGranted;
    }
    
    public void setTitleGranted(String titleGranted) {
        this.titleGranted = titleGranted;
    }
    
    public String getClaimIp() {
        return claimIp;
    }
    
    public void setClaimIp(String claimIp) {
        this.claimIp = claimIp;
    }
    
    public LocalDateTime getClaimTime() {
        return claimTime;
    }
    
    public void setClaimTime(LocalDateTime claimTime) {
        this.claimTime = claimTime;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public String getTraceId() {
        return traceId;
    }
    
    public void setTraceId(String traceId) {
        this.traceId = traceId;
    }
    
    public Integer getVersion() {
        return version;
    }
    
    public void setVersion(Integer version) {
        this.version = version;
    }
}
