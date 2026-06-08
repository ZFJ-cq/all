package com.lingyue.service;

import com.lingyue.entity.Permission;
import java.util.List;

/**
 * 角色权限服务
 */
public interface RolePermissionService {
    
    /**
     * 为角色分配权限
     */
    void assignPermissionsToRole(Long roleId, List<Long> permissionIds);
    
    /**
     * 获取角色的所有权限
     */
    List<Permission> getRolePermissions(Long roleId);
    
    /**
     * 检查角色是否拥有指定权限
     */
    boolean hasPermission(Long roleId, String permissionCode);
    
    /**
     * 添加权限到角色
     */
    void addPermissionToRole(Long roleId, Long permissionId);
    
    /**
     * 从角色移除权限
     */
    void removePermissionFromRole(Long roleId, Long permissionId);
}
