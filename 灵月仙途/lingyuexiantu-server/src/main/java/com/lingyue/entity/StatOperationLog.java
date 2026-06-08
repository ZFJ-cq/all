package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_stat_operation_log")
public class StatOperationLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "log_id")
    private Long logId;
    
    @Column(name = "player_id", nullable = false)
    private Long playerId;
    
    @Column(name = "op_type", nullable = false, length = 32)
    private String opType;
    
    @Column(name = "target_stat", nullable = false, length = 10)
    private String targetStat;
    
    @Column(name = "old_value", nullable = false, columnDefinition = "INT UNSIGNED")
    private Integer oldValue;
    
    @Column(name = "new_value", nullable = false, columnDefinition = "INT UNSIGNED")
    private Integer newValue;
    
    @Column(name = "change_delta", nullable = false)
    private Integer changeDelta;
    
    @Column(name = "context_info", columnDefinition = "JSON")
    private String contextInfo;
    
    @Column(name = "created_at", columnDefinition = "DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)")
    private LocalDateTime createdAt;
    
    public StatOperationLog() {
    }
    
    public StatOperationLog(Long playerId, String opType, String targetStat, Integer oldValue, Integer newValue, Integer changeDelta, String contextInfo) {
        this.playerId = playerId;
        this.opType = opType;
        this.targetStat = targetStat;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.changeDelta = changeDelta;
        this.contextInfo = contextInfo;
    }
    
    // Getters and Setters
    public Long getLogId() { return logId; }
    public void setLogId(Long logId) { this.logId = logId; }
    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
    public String getOpType() { return opType; }
    public void setOpType(String opType) { this.opType = opType; }
    public String getTargetStat() { return targetStat; }
    public void setTargetStat(String targetStat) { this.targetStat = targetStat; }
    public Integer getOldValue() { return oldValue; }
    public void setOldValue(Integer oldValue) { this.oldValue = oldValue; }
    public Integer getNewValue() { return newValue; }
    public void setNewValue(Integer newValue) { this.newValue = newValue; }
    public Integer getChangeDelta() { return changeDelta; }
    public void setChangeDelta(Integer changeDelta) { this.changeDelta = changeDelta; }
    public String getContextInfo() { return contextInfo; }
    public void setContextInfo(String contextInfo) { this.contextInfo = contextInfo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}