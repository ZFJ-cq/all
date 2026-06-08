package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cultivation_tasks", indexes = {
    @Index(name = "idx_cultivation_task_role_id", columnList = "role_id"),
    @Index(name = "idx_cultivation_task_status", columnList = "status"),
    @Index(name = "idx_cultivation_task_end_time", columnList = "end_time")
})
public class CultivationTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id", nullable = false)
    private Long roleId;
    
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    
    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;
    
    @Column(name = "expected_xiuwei", nullable = false)
    private Integer expectedXiuwei;
    
    @Column(name = "actual_xiuwei", nullable = false)
    private Integer actualXiuwei;
    
    @Column(name = "efficiency_multiplier", nullable = false)
    private Double efficiencyMultiplier;
    
    @Column(name = "status", nullable = false)
    private String status; // ACTIVE, COMPLETED, INTERRUPTED
    
    @Column(name = "boost_type")
    private String boostType; // NONE, LINGSHI, PILL
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
        if (actualXiuwei == null) {
            actualXiuwei = 0;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public CultivationTask() {}
    
    public CultivationTask(Long roleId, LocalDateTime startTime, LocalDateTime endTime, 
                          Integer expectedXiuwei, Double efficiencyMultiplier, String boostType) {
        this.roleId = roleId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.expectedXiuwei = expectedXiuwei;
        this.efficiencyMultiplier = efficiencyMultiplier;
        this.boostType = boostType;
        this.status = "ACTIVE";
        this.actualXiuwei = 0;
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
    
    public LocalDateTime getStartTime() {
        return startTime;
    }
    
    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
    
    public LocalDateTime getEndTime() {
        return endTime;
    }
    
    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }
    
    public Integer getExpectedXiuwei() {
        return expectedXiuwei;
    }
    
    public void setExpectedXiuwei(Integer expectedXiuwei) {
        this.expectedXiuwei = expectedXiuwei;
    }
    
    public Integer getActualXiuwei() {
        return actualXiuwei;
    }
    
    public void setActualXiuwei(Integer actualXiuwei) {
        this.actualXiuwei = actualXiuwei;
    }
    
    public Double getEfficiencyMultiplier() {
        return efficiencyMultiplier;
    }
    
    public void setEfficiencyMultiplier(Double efficiencyMultiplier) {
        this.efficiencyMultiplier = efficiencyMultiplier;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getBoostType() {
        return boostType;
    }
    
    public void setBoostType(String boostType) {
        this.boostType = boostType;
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