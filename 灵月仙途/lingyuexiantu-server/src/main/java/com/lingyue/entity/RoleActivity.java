package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_activity")
public class RoleActivity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id", nullable = false, unique = true)
    private Long roleId;
    
    @Column(name = "daily_activity", nullable = false)
    private Integer dailyActivity = 0;
    
    @Column(name = "total_activity", nullable = false)
    private Integer totalActivity = 0;
    
    @Column(name = "claimed_rewards", length = 500)
    private String claimedRewards;
    
    @Column(name = "daily_reset_time")
    private LocalDateTime dailyResetTime;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }

    public Integer getDailyActivity() { return dailyActivity; }
    public void setDailyActivity(Integer dailyActivity) { this.dailyActivity = dailyActivity; }

    public Integer getTotalActivity() { return totalActivity; }
    public void setTotalActivity(Integer totalActivity) { this.totalActivity = totalActivity; }

    public String getClaimedRewards() { return claimedRewards; }
    public void setClaimedRewards(String claimedRewards) { this.claimedRewards = claimedRewards; }

    public LocalDateTime getDailyResetTime() { return dailyResetTime; }
    public void setDailyResetTime(LocalDateTime dailyResetTime) { this.dailyResetTime = dailyResetTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
