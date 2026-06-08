package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 锻体修炼日志实体（数据埋点）
 */
@Entity
@Table(name = "body_cultivation_log")
public class BodyCultivationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Column(name = "action_type", nullable = false, length = 50)
    private String actionType;

    @Column(name = "realm_id")
    private Long realmId;

    @Column(name = "part_id")
    private Long partId;

    private Integer success = 1;

    @Column(name = "pain_value_before", precision = 10, scale = 2)
    private BigDecimal painValueBefore;

    @Column(name = "pain_value_after", precision = 10, scale = 2)
    private BigDecimal painValueAfter;

    @Column(name = "tolerance_before")
    private Integer toleranceBefore;

    @Column(name = "tolerance_after")
    private Integer toleranceAfter;

    @Column(name = "exp_gained")
    private Long expGained = 0L;

    @Column(name = "materials_consumed", columnDefinition = "TEXT")
    private String materialsConsumed;

    @Column(name = "result_description", length = 500)
    private String resultDescription;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
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

    public String getActionType() {
        return actionType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public Long getRealmId() {
        return realmId;
    }

    public void setRealmId(Long realmId) {
        this.realmId = realmId;
    }

    public Long getPartId() {
        return partId;
    }

    public void setPartId(Long partId) {
        this.partId = partId;
    }

    public Integer getSuccess() {
        return success;
    }

    public void setSuccess(Integer success) {
        this.success = success;
    }

    public BigDecimal getPainValueBefore() {
        return painValueBefore;
    }

    public void setPainValueBefore(BigDecimal painValueBefore) {
        this.painValueBefore = painValueBefore;
    }

    public BigDecimal getPainValueAfter() {
        return painValueAfter;
    }

    public void setPainValueAfter(BigDecimal painValueAfter) {
        this.painValueAfter = painValueAfter;
    }

    public Integer getToleranceBefore() {
        return toleranceBefore;
    }

    public void setToleranceBefore(Integer toleranceBefore) {
        this.toleranceBefore = toleranceBefore;
    }

    public Integer getToleranceAfter() {
        return toleranceAfter;
    }

    public void setToleranceAfter(Integer toleranceAfter) {
        this.toleranceAfter = toleranceAfter;
    }

    public Long getExpGained() {
        return expGained;
    }

    public void setExpGained(Long expGained) {
        this.expGained = expGained;
    }

    public String getMaterialsConsumed() {
        return materialsConsumed;
    }

    public void setMaterialsConsumed(String materialsConsumed) {
        this.materialsConsumed = materialsConsumed;
    }

    public String getResultDescription() {
        return resultDescription;
    }

    public void setResultDescription(String resultDescription) {
        this.resultDescription = resultDescription;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
