package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_realms")
public class RoleRealm {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_id", nullable = false, unique = true)
    private Long roleId;

    @Column(name = "realm_name", nullable = false)
    private String realmName; // 境界名称，如：炼气期、筑基期等

    @Column(name = "realm_level", nullable = false)
    private Integer realmLevel; // 境界等级，如：炼气期一层、炼气期二层等

    @Column(name = "total_cultivation", precision = 20, scale = 2)
    private java.math.BigDecimal totalCultivation; // 总修为值

    @Column(name = "next_realm_cultivation", precision = 20, scale = 2)
    private java.math.BigDecimal nextRealmCultivation; // 下一境界所需修为

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
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

    // Getter and Setter methods
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

    public String getRealmName() {
        return realmName;
    }

    public void setRealmName(String realmName) {
        this.realmName = realmName;
    }

    public Integer getRealmLevel() {
        return realmLevel;
    }

    public void setRealmLevel(Integer realmLevel) {
        this.realmLevel = realmLevel;
    }

    public java.math.BigDecimal getTotalCultivation() {
        return totalCultivation;
    }

    public void setTotalCultivation(java.math.BigDecimal totalCultivation) {
        this.totalCultivation = totalCultivation;
    }

    public java.math.BigDecimal getNextRealmCultivation() {
        return nextRealmCultivation;
    }

    public void setNextRealmCultivation(java.math.BigDecimal nextRealmCultivation) {
        this.nextRealmCultivation = nextRealmCultivation;
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