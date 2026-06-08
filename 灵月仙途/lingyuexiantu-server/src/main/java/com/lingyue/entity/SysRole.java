package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sys_role")
public class SysRole {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String roleName;
    
    @Column
    private String description;
    
    @Column(nullable = false, unique = true)
    private String roleCode;
    
    private Integer sort; // 排序
    
    @Column(name = "role_level")
    private Integer roleLevel = 1; // 角色级别：1-超级管理员 2-运营主管 3-普通客服 4-数据分析师
    
    @Column(name = "data_scope", length = 20)
    private String dataScope = "ALL"; // 数据范围：ALL-全部 CUSTOM-自定义 DEPT-部门 SELF-仅自己
    
    @Column(name = "custom_data_scope", length = 500)
    private String customDataScope; // 自定义数据范围 JSON 配置
    
    private Integer status; // 1: 启用，0: 禁用
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
    
    // 非持久化字段，用于返回角色关联的权限
    @Transient
    private List<Permission> permissions;
    
    public SysRole() {
    }
    
    public SysRole(Long id, String roleName, String description, String roleCode, Integer status, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.roleName = roleName;
        this.description = description;
        this.roleCode = roleCode;
        this.status = status;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getRoleName() {
        return roleName;
    }
    
    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getRoleCode() {
        return roleCode;
    }
    
    public void setRoleCode(String roleCode) {
        this.roleCode = roleCode;
    }
    
    public Integer getSort() {
        return sort;
    }
    
    public void setSort(Integer sort) {
        this.sort = sort;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
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
    
    public List<Permission> getPermissions() {
        return permissions;
    }
    
    public void setPermissions(List<Permission> permissions) {
        this.permissions = permissions;
    }
    
    public Integer getRoleLevel() {
        return roleLevel;
    }
    
    public void setRoleLevel(Integer roleLevel) {
        this.roleLevel = roleLevel;
    }
    
    public String getDataScope() {
        return dataScope;
    }
    
    public void setDataScope(String dataScope) {
        this.dataScope = dataScope;
    }
    
    public String getCustomDataScope() {
        return customDataScope;
    }
    
    public void setCustomDataScope(String customDataScope) {
        this.customDataScope = customDataScope;
    }
}