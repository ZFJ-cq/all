package com.lingyue.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 角色资产 DTO - 用于前端展示，包含角色名称和用户名称
 */
public class RoleAssetDTO {
    private Long id;
    private Long roleId;
    private String roleName;      // 角色名称
    private String username;      // 用户名称
    private Long assetTypeId;
    private String assetTypeName; // 资产类型名称
    private BigDecimal quantity;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public RoleAssetDTO() {
    }

    public RoleAssetDTO(Long id, Long roleId, String roleName, String username, 
                       Long assetTypeId, String assetTypeName, BigDecimal quantity,
                       LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.roleId = roleId;
        this.roleName = roleName;
        this.username = username;
        this.assetTypeId = assetTypeId;
        this.assetTypeName = assetTypeName;
        this.quantity = quantity;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Long getAssetTypeId() {
        return assetTypeId;
    }

    public void setAssetTypeId(Long assetTypeId) {
        this.assetTypeId = assetTypeId;
    }

    public String getAssetTypeName() {
        return assetTypeName;
    }

    public void setAssetTypeName(String assetTypeName) {
        this.assetTypeName = assetTypeName;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
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
