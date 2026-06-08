package com.lingyue.repository;

import com.lingyue.entity.SysRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SysRoleRepository extends JpaRepository<SysRole, Long> {
    
    // 根据角色名称查找
    SysRole findByRoleName(String roleName);
    
    // 根据状态查找
    List<SysRole> findByStatus(Integer status);
    
    // 搜索角色
    @Query("SELECT r FROM SysRole r WHERE r.roleName LIKE %:keyword% OR r.description LIKE %:keyword%")
    List<SysRole> searchByKeyword(@Param("keyword") String keyword);
}