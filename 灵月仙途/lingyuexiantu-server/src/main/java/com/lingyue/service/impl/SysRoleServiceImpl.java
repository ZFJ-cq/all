package com.lingyue.service.impl;

import com.lingyue.entity.SysRole;
import com.lingyue.repository.SysRoleRepository;
import com.lingyue.service.SysRoleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SysRoleServiceImpl implements SysRoleService {
    
    private final SysRoleRepository roleRepository;
    
    public SysRoleServiceImpl(SysRoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }
    
    @Override
    public List<SysRole> getAllRoles() {
        return roleRepository.findAll();
    }
    
    @Override
    public Map<String, Object> getRolesByPage(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<SysRole> rolePage = roleRepository.findAll(pageable);
        Map<String, Object> result = new HashMap<>();
        result.put("roles", rolePage.getContent());
        result.put("total", rolePage.getTotalElements());
        result.put("pages", rolePage.getTotalPages());
        result.put("currentPage", page);
        result.put("pageSize", size);
        return result;
    }
    
    @Override
    public SysRole getRoleById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }
    
    @Override
    public SysRole getRoleByRoleName(String roleName) {
        return roleRepository.findByRoleName(roleName);
    }
    
    @Override
    public SysRole createRole(SysRole role) {
        try {
            System.out.println("Creating role: " + role);
            // 生成默认的roleCode
            if (role.getRoleCode() == null || role.getRoleCode().isEmpty()) {
                String roleCode = "ROLE_" + role.getRoleName().toUpperCase().replace(" ", "_");
                role.setRoleCode(roleCode);
            }
            role.setCreatedAt(LocalDateTime.now());
            role.setUpdatedAt(LocalDateTime.now());
            System.out.println("Role before save: " + role);
            SysRole savedRole = roleRepository.save(role);
            System.out.println("Role after save: " + savedRole);
            return savedRole;
        } catch (Exception e) {
            System.out.println("Error creating role: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public SysRole updateRole(SysRole role) {
        SysRole existingRole = roleRepository.findById(role.getId()).orElse(null);
        if (existingRole != null) {
            existingRole.setRoleName(role.getRoleName());
            existingRole.setDescription(role.getDescription());
            existingRole.setStatus(role.getStatus());
            existingRole.setUpdatedAt(LocalDateTime.now());
            return roleRepository.save(existingRole);
        }
        return null;
    }
    
    @Override
    public boolean deleteRole(Long id) {
        try {
            roleRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public List<SysRole> searchRoles(String keyword) {
        return roleRepository.searchByKeyword(keyword);
    }
    
    @Override
    public List<SysRole> getRolesByStatus(Integer status) {
        return roleRepository.findByStatus(status);
    }
}