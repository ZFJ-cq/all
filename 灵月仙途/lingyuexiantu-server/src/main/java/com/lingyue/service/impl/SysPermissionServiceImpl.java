package com.lingyue.service.impl;

import com.lingyue.entity.SysPermission;
import com.lingyue.repository.SysPermissionRepository;
import com.lingyue.service.SysPermissionService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SysPermissionServiceImpl implements SysPermissionService {
    
    private final SysPermissionRepository permissionRepository;
    
    public SysPermissionServiceImpl(SysPermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }
    
    @Override
    public List<SysPermission> findAll() {
        return permissionRepository.findAll();
    }
    
    @Override
    public Optional<SysPermission> findById(Long id) {
        return permissionRepository.findById(id);
    }
    
    @Override
    public SysPermission save(SysPermission permission) {
        if (permission.getId() == null) {
            permission.setCreatedAt(LocalDateTime.now());
        }
        permission.setUpdatedAt(LocalDateTime.now());
        return permissionRepository.save(permission);
    }
    
    @Override
    public void deleteById(Long id) {
        permissionRepository.deleteById(id);
    }
    
    @Override
    public List<SysPermission> findByStatus(Integer status) {
        return permissionRepository.findByStatus(status);
    }
    
    @Override
    public List<SysPermission> searchByKeyword(String keyword) {
        return permissionRepository.searchByKeyword(keyword);
    }
}