package com.lingyue.repository;

import com.lingyue.entity.SysPermission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SysPermissionRepository extends JpaRepository<SysPermission, Long> {
    /**
     * 根据状态获取权限
     */
    List<SysPermission> findByStatus(Integer status);
    
    /**
     * 根据关键词搜索权限
     */
    @Query("SELECT p FROM SysPermission p WHERE p.name LIKE %:keyword% OR p.code LIKE %:keyword% OR p.description LIKE %:keyword%")
    List<SysPermission> searchByKeyword(@Param("keyword") String keyword);
}