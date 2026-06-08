package com.lingyue.repository;

import com.lingyue.entity.SysUserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

/**
 * 系统用户角色关联 Repository
 */
public interface SysUserRoleRepository extends JpaRepository<SysUserRole, Long> {
    
    /**
     * 根据用户 ID 查询所有角色关联
     */
    List<SysUserRole> findByUserId(Long userId);
    
    /**
     * 根据角色 ID 查询所有用户关联
     */
    List<SysUserRole> findByRoleId(Long roleId);
    
    /**
     * 根据用户 ID 删除所有角色关联
     */
    void deleteByUserId(Long userId);
    
    /**
     * 根据角色 ID 删除所有用户关联
     */
    void deleteByRoleId(Long roleId);
    
    /**
     * 检查用户是否拥有指定角色
     */
    boolean existsByUserIdAndRoleId(Long userId, Long roleId);
    
    /**
     * 查询用户的角色 ID 列表
     */
    @Query("SELECT sur.roleId FROM SysUserRole sur WHERE sur.userId = :userId")
    List<Long> findRoleIdsByUserId(@Param("userId") Long userId);
}
