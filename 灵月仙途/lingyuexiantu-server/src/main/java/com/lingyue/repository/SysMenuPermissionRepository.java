package com.lingyue.repository;

import com.lingyue.entity.SysMenuPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

/**
 * 系统菜单权限关联 Repository
 */
public interface SysMenuPermissionRepository extends JpaRepository<SysMenuPermission, Long> {
    
    /**
     * 根据菜单 ID 查询所有权限关联
     */
    List<SysMenuPermission> findByMenuId(Long menuId);
    
    /**
     * 根据权限 ID 查询所有菜单关联
     */
    List<SysMenuPermission> findByPermissionId(Long permissionId);
    
    /**
     * 根据菜单 ID 删除所有权限关联
     */
    void deleteByMenuId(Long menuId);
    
    /**
     * 根据权限 ID 删除所有菜单关联
     */
    void deleteByPermissionId(Long permissionId);
    
    /**
     * 检查菜单是否拥有指定权限
     */
    boolean existsByMenuIdAndPermissionId(Long menuId, Long permissionId);
    
    /**
     * 查询菜单的权限 ID 列表
     */
    @Query("SELECT smp.permissionId FROM SysMenuPermission smp WHERE smp.menuId = :menuId")
    List<Long> findPermissionIdsByMenuId(@Param("menuId") Long menuId);
}
