package com.lingyue.service;

import com.lingyue.entity.SysPermission;
import java.util.List;
import java.util.Optional;

public interface SysPermissionService {
    /**
     * 获取所有权限
     */
    List<SysPermission> findAll();
    
    /**
     * 根据 ID 获取权限
     */
    Optional<SysPermission> findById(Long id);
    
    /**
     * 保存权限
     */
    SysPermission save(SysPermission permission);
    
    /**
     * 根据 ID 删除权限
     */
    void deleteById(Long id);
    
    /**
     * 根据状态获取权限
     */
    List<SysPermission> findByStatus(Integer status);
    
    /**
     * 搜索权限
     */
    List<SysPermission> searchByKeyword(String keyword);
}