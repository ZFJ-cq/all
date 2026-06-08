package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 角色自动修炼配置实体
 */
@Entity
@Table(name = "role_auto_cultivation_config")
public class RoleAutoCultivationConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_id", nullable = false, unique = true)
    private Long roleId;

    @Column(name = "is_enabled")
    private Integer isEnabled = 0;

    @Column(name = "cultivation_interval")
    private Integer cultivationInterval = 60;

    @Column(name = "last_cultivation_time")
    private LocalDateTime lastCultivationTime;

    @Column(name = "total_xiuwei_gained")
    private Long totalXiuweiGained = 0L;

    @Column(name = "auto_breakthrough")
    private Integer autoBreakthrough = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    // 构造函数
    public RoleAutoCultivationConfig() {}

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

    public Integer getIsEnabled() {
        return isEnabled;
    }

    public void setIsEnabled(Integer isEnabled) {
        this.isEnabled = isEnabled;
    }

    public Integer getCultivationInterval() {
        return cultivationInterval;
    }

    public void setCultivationInterval(Integer cultivationInterval) {
        this.cultivationInterval = cultivationInterval;
    }

    public LocalDateTime getLastCultivationTime() {
        return lastCultivationTime;
    }

    public void setLastCultivationTime(LocalDateTime lastCultivationTime) {
        this.lastCultivationTime = lastCultivationTime;
    }

    public Long getTotalXiuweiGained() {
        return totalXiuweiGained;
    }

    public void setTotalXiuweiGained(Long totalXiuweiGained) {
        this.totalXiuweiGained = totalXiuweiGained;
    }

    public Integer getAutoBreakthrough() {
        return autoBreakthrough;
    }

    public void setAutoBreakthrough(Integer autoBreakthrough) {
        this.autoBreakthrough = autoBreakthrough;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}