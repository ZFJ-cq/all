package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_body_cultivation")
public class RoleBodyCultivation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id", nullable = false, unique = true)
    private Long roleId;
    
    @Column(name = "realm_id", nullable = false)
    private Long realmId;
    
    @Column(name = "body_exp", nullable = false)
    private Long bodyExp = 0L;
    
    @Column(name = "pain_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal painValue = BigDecimal.ZERO;
    
    @Column(name = "tolerance", nullable = false)
    private Integer tolerance = 0;
    
    @Column(name = "mutation_id")
    private Long mutationId;
    
    @Column(name = "status", nullable = false)
    private Integer status = 1;
    
    @Column(name = "injury_recovery_time")
    private LocalDateTime injuryRecoveryTime;
    
    @Column(name = "total_cultivate_count", nullable = false)
    private Integer totalCultivateCount = 0;
    
    @Column(name = "total_breakthrough_count", nullable = false)
    private Integer totalBreakthroughCount = 0;
    
    @Column(name = "failed_breakthrough_count", nullable = false)
    private Integer failedBreakthroughCount = 0;
    
    @Column(name = "last_cultivate_time")
    private LocalDateTime lastCultivateTime;
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public Long getRealmId() { return realmId; }
    public void setRealmId(Long realmId) { this.realmId = realmId; }
    public Long getBodyExp() { return bodyExp; }
    public void setBodyExp(Long bodyExp) { this.bodyExp = bodyExp; }
    public BigDecimal getPainValue() { return painValue; }
    public void setPainValue(BigDecimal painValue) { this.painValue = painValue; }
    public Integer getTolerance() { return tolerance; }
    public void setTolerance(Integer tolerance) { this.tolerance = tolerance; }
    public Long getMutationId() { return mutationId; }
    public void setMutationId(Long mutationId) { this.mutationId = mutationId; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public LocalDateTime getInjuryRecoveryTime() { return injuryRecoveryTime; }
    public void setInjuryRecoveryTime(LocalDateTime injuryRecoveryTime) { this.injuryRecoveryTime = injuryRecoveryTime; }
    public Integer getTotalCultivateCount() { return totalCultivateCount; }
    public void setTotalCultivateCount(Integer totalCultivateCount) { this.totalCultivateCount = totalCultivateCount; }
    public Integer getTotalBreakthroughCount() { return totalBreakthroughCount; }
    public void setTotalBreakthroughCount(Integer totalBreakthroughCount) { this.totalBreakthroughCount = totalBreakthroughCount; }
    public Integer getFailedBreakthroughCount() { return failedBreakthroughCount; }
    public void setFailedBreakthroughCount(Integer failedBreakthroughCount) { this.failedBreakthroughCount = failedBreakthroughCount; }
    public LocalDateTime getLastCultivateTime() { return lastCultivateTime; }
    public void setLastCultivateTime(LocalDateTime lastCultivateTime) { this.lastCultivateTime = lastCultivateTime; }
}
