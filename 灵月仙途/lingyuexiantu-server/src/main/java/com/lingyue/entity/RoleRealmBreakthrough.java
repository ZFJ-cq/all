package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 角色境界突破记录实体
 */
@Entity
@Table(name = "role_realm_breakthrough")
public class RoleRealmBreakthrough {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Column(name = "role_name", length = 50)
    private String roleName;

    @Column(name = "old_realm", length = 50)
    private String oldRealm;

    @Column(name = "new_realm", length = 50)
    private String newRealm;

    @Column(name = "success")
    private Integer success = 1; // 0-失败 1-成功

    @Column(name = "cost_xiuwei")
    private Integer costXiuwei = 0;

    @Column(name = "breakthrough_time")
    private LocalDateTime breakthroughTime;

    // 构造函数
    public RoleRealmBreakthrough() {
        this.breakthroughTime = LocalDateTime.now();
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

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getOldRealm() {
        return oldRealm;
    }

    public void setOldRealm(String oldRealm) {
        this.oldRealm = oldRealm;
    }

    public String getNewRealm() {
        return newRealm;
    }

    public void setNewRealm(String newRealm) {
        this.newRealm = newRealm;
    }

    public Integer getSuccess() {
        return success;
    }

    public void setSuccess(Integer success) {
        this.success = success;
    }

    public Integer getCostXiuwei() {
        return costXiuwei;
    }

    public void setCostXiuwei(Integer costXiuwei) {
        this.costXiuwei = costXiuwei;
    }

    public LocalDateTime getBreakthroughTime() {
        return breakthroughTime;
    }

    public void setBreakthroughTime(LocalDateTime breakthroughTime) {
        this.breakthroughTime = breakthroughTime;
    }
}
