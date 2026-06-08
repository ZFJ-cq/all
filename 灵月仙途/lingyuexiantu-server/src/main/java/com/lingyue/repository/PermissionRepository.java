package com.lingyue.repository;

import com.lingyue.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 权限 Repository
 */
@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    // 根据权限码查询
    Permission findByCode(String code);

    // 根据状态查询权限
    List<Permission> findByStatus(Integer status);

    // 搜索权限
    @Query("SELECT p FROM Permission p WHERE p.name LIKE %:keyword% OR p.code LIKE %:keyword% OR p.description LIKE %:keyword%")
    List<Permission> searchPermissions(@Param("keyword") String keyword);

    // 根据分类查询权限
    List<Permission> findByCategory(String category);
}
