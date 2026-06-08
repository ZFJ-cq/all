package com.lingyue.repository;

import com.lingyue.entity.SysRolePermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

/**
 * 系统角色权限关联 Repository
 */
public interface SysRolePermissionRepository extends JpaRepository<SysRolePermission, Long> {
    
    /**
     * 根据角色 ID 查询所有权限关联
     */
    List<SysRolePermission> findByRoleId(Long roleId);
    
    /**
     * 根据权限 ID 查询所有角色关联
     */
    List<SysRolePermission> findByPermissionId(Long permissionId);
    
    /**
     * 根据角色 ID 删除所有权限关联
     */
    void deleteByRoleId(Long roleId);
    
    /**
     * 根据权限 ID 删除所有角色关联
     */
    void deleteByPermissionId(Long permissionId);
    
    /**
     * 检查角色是否拥有指定权限
     */
    boolean existsByRoleIdAndPermissionId(Long roleId, Long permissionId);
    
    /**
     * 查询角色的权限 ID 列表
     */
    @Query("SELECT srp.permissionId FROM SysRolePermission srp WHERE srp.roleId = :roleId")
    List<Long> findPermissionIdsByRoleId(@Param("roleId") Long roleId);
}
