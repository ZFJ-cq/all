package com.lingyue.service.impl;

import com.lingyue.entity.Permission;
import com.lingyue.entity.SysRolePermission;
import com.lingyue.repository.PermissionRepository;
import com.lingyue.repository.SysRolePermissionRepository;
import com.lingyue.service.RolePermissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 角色权限服务实现
 */
@Service
public class RolePermissionServiceImpl implements RolePermissionService {
    
    private final SysRolePermissionRepository rolePermissionRepository;
    private final PermissionRepository permissionRepository;
    
    public RolePermissionServiceImpl(
        SysRolePermissionRepository rolePermissionRepository,
        PermissionRepository permissionRepository
    ) {
        this.rolePermissionRepository = rolePermissionRepository;
        this.permissionRepository = permissionRepository;
    }
    
    @Override
    @Transactional
    public void assignPermissionsToRole(Long roleId, List<Long> permissionIds) {
        // 删除角色现有的所有权限关联
        rolePermissionRepository.deleteByRoleId(roleId);
        
        // 添加新的权限关联
        if (permissionIds != null && !permissionIds.isEmpty()) {
            for (Long permissionId : permissionIds) {
                SysRolePermission rolePermission = new SysRolePermission();
                rolePermission.setRoleId(roleId);
                rolePermission.setPermissionId(permissionId);
                rolePermission.setCreateTime(LocalDateTime.now());
                rolePermissionRepository.save(rolePermission);
            }
        }
    }
    
    @Override
    public List<Permission> getRolePermissions(Long roleId) {
        List<Long> permissionIds = rolePermissionRepository.findPermissionIdsByRoleId(roleId);
        if (permissionIds.isEmpty()) {
            return new ArrayList<>();
        }
        return permissionRepository.findAllById(permissionIds);
    }
    
    @Override
    public boolean hasPermission(Long roleId, String permissionCode) {
        List<Permission> permissions = getRolePermissions(roleId);
        return permissions.stream()
            .anyMatch(p -> permissionCode.equals(p.getCode()));
    }
    
    @Override
    @Transactional
    public void addPermissionToRole(Long roleId, Long permissionId) {
        // 检查是否已存在
        if (!rolePermissionRepository.existsByRoleIdAndPermissionId(roleId, permissionId)) {
            SysRolePermission rolePermission = new SysRolePermission();
            rolePermission.setRoleId(roleId);
            rolePermission.setPermissionId(permissionId);
            rolePermission.setCreateTime(LocalDateTime.now());
            rolePermissionRepository.save(rolePermission);
        }
    }
    
    @Override
    @Transactional
    public void removePermissionFromRole(Long roleId, Long permissionId) {
        // 查找并删除关联
        List<SysRolePermission> rolePermissions = rolePermissionRepository.findByRoleId(roleId);
        for (SysRolePermission rolePermission : rolePermissions) {
            if (rolePermission.getPermissionId().equals(permissionId)) {
                rolePermissionRepository.deleteById(rolePermission.getId());
                break;
            }
        }
    }
}
