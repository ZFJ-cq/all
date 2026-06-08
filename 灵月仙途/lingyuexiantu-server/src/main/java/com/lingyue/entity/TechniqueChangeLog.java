package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "technique_change_log", indexes = {
    @Index(name = "idx_user_change_time", columnList = "user_id, change_time"),
    @Index(name = "idx_role_change_time", columnList = "role_id, change_time")
})
public class TechniqueChangeLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "role_id", nullable = false)
    private Long roleId;
    
    @Column(name = "technique_id", nullable = false)
    private Long techniqueId;
    
    @Column(name = "action_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ActionType actionType;
    
    @Column(name = "old_speed_bonus", precision = 10)
    private Double oldSpeedBonus;
    
    @Column(name = "old_limit_bonus")
    private Long oldLimitBonus;
    
    @Column(name = "new_speed_bonus", precision = 10)
    private Double newSpeedBonus;
    
    @Column(name = "new_limit_bonus")
    private Long newLimitBonus;
    
    @Column(name = "cultivation_task_id")
    private Long cultivationTaskId;
    
    @Column(name = "cultivation_progress", precision = 10)
    private Double cultivationProgress;
    
    @Column(name = "current_xiuwei")
    private Integer currentXiuwei;
    
    @Column(name = "change_time", nullable = false)
    private LocalDateTime changeTime;
    
    public enum ActionType {
        EQUIP,
        UNEQUIP
    }
    
    @PrePersist
    protected void onCreate() {
        changeTime = LocalDateTime.now();
    }
    
    // Constructors
    public TechniqueChangeLog() {}
    
    public TechniqueChangeLog(Long userId, Long roleId, Long techniqueId, ActionType actionType,
                             Double oldSpeedBonus, Long oldLimitBonus,
                             Double newSpeedBonus, Long newLimitBonus,
                             Long cultivationTaskId, Double cultivationProgress, Integer currentXiuwei) {
        this.userId = userId;
        this.roleId = roleId;
        this.techniqueId = techniqueId;
        this.actionType = actionType;
        this.oldSpeedBonus = oldSpeedBonus;
        this.oldLimitBonus = oldLimitBonus;
        this.newSpeedBonus = newSpeedBonus;
        this.newLimitBonus = newLimitBonus;
        this.cultivationTaskId = cultivationTaskId;
        this.cultivationProgress = cultivationProgress;
        this.currentXiuwei = currentXiuwei;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getRoleId() {
        return roleId;
    }
    
    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
    
    public Long getTechniqueId() {
        return techniqueId;
    }
    
    public void setTechniqueId(Long techniqueId) {
        this.techniqueId = techniqueId;
    }
    
    public ActionType getActionType() {
        return actionType;
    }
    
    public void setActionType(ActionType actionType) {
        this.actionType = actionType;
    }
    
    public Double getOldSpeedBonus() {
        return oldSpeedBonus;
    }
    
    public void setOldSpeedBonus(Double oldSpeedBonus) {
        this.oldSpeedBonus = oldSpeedBonus;
    }
    
    public Long getOldLimitBonus() {
        return oldLimitBonus;
    }
    
    public void setOldLimitBonus(Long oldLimitBonus) {
        this.oldLimitBonus = oldLimitBonus;
    }
    
    public Double getNewSpeedBonus() {
        return newSpeedBonus;
    }
    
    public void setNewSpeedBonus(Double newSpeedBonus) {
        this.newSpeedBonus = newSpeedBonus;
    }
    
    public Long getNewLimitBonus() {
        return newLimitBonus;
    }
    
    public void setNewLimitBonus(Long newLimitBonus) {
        this.newLimitBonus = newLimitBonus;
    }
    
    public Long getCultivationTaskId() {
        return cultivationTaskId;
    }
    
    public void setCultivationTaskId(Long cultivationTaskId) {
        this.cultivationTaskId = cultivationTaskId;
    }
    
    public Double getCultivationProgress() {
        return cultivationProgress;
    }
    
    public void setCultivationProgress(Double cultivationProgress) {
        this.cultivationProgress = cultivationProgress;
    }
    
    public Integer getCurrentXiuwei() {
        return currentXiuwei;
    }
    
    public void setCurrentXiuwei(Integer currentXiuwei) {
        this.currentXiuwei = currentXiuwei;
    }
    
    public LocalDateTime getChangeTime() {
        return changeTime;
    }
    
    public void setChangeTime(LocalDateTime changeTime) {
        this.changeTime = changeTime;
    }
}