package com.lingyue.service.impl;

import com.lingyue.entity.SysUser;
import com.lingyue.entity.SysRole;
import com.lingyue.entity.Permission;
import com.lingyue.entity.SysUserRole;
import com.lingyue.entity.SysRolePermission;
import com.lingyue.repository.SysUserRepository;
import com.lingyue.repository.SysRoleRepository;
import com.lingyue.repository.PermissionRepository;
import com.lingyue.repository.SysUserRoleRepository;
import com.lingyue.repository.SysRolePermissionRepository;
import com.lingyue.service.SysUserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SysUserServiceImpl implements SysUserService {
    
    private final SysUserRepository userRepository;
    private final SysRoleRepository sysRoleRepository;
    private final PermissionRepository permissionRepository;
    private final SysUserRoleRepository userRoleRepository;
    private final SysRolePermissionRepository rolePermissionRepository;
    
    public SysUserServiceImpl(
        SysUserRepository userRepository, 
        SysRoleRepository sysRoleRepository,
        PermissionRepository permissionRepository,
        SysUserRoleRepository userRoleRepository,
        SysRolePermissionRepository rolePermissionRepository
    ) {
        this.userRepository = userRepository;
        this.sysRoleRepository = sysRoleRepository;
        this.permissionRepository = permissionRepository;
        this.userRoleRepository = userRoleRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }
    
    // 初始化方法，在应用启动时自动创建 admin 用户
    @PostConstruct
    public void initAdminUser() {
        // 检查是否已存在 admin 用户
        SysUser existingUser = userRepository.findByUsername("admin");
        if (existingUser == null) {
            // 创建 admin 用户
            SysUser adminUser = new SysUser();
            adminUser.setUsername("admin");
            adminUser.setPassword("123456");
            adminUser.setNickname("管理员");
            adminUser.setPhone("13800138000");
            adminUser.setStatus(1);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(adminUser);
            System.out.println("Admin user created successfully!");
        } else {
            System.out.println("Admin user already exists!");
        }
    }
    
    @Override
    public List<SysUser> getAllUsers() {
        List<SysUser> users = userRepository.findAll();
        // 为每个用户加载角色和权限信息
        for (SysUser user : users) {
            loadUserRolesAndPermissions(user);
        }
        return users;
    }
    
    @Override
    public Map<String, Object> getUsersByPage(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<SysUser> userPage = userRepository.findAll(pageable);
        Map<String, Object> result = new HashMap<>();
        
        List<SysUser> usersWithRoles = userPage.getContent().stream()
            .peek(this::loadUserRolesAndPermissions)
            .collect(Collectors.toList());
        
        result.put("users", usersWithRoles);
        result.put("total", userPage.getTotalElements());
        result.put("pages", userPage.getTotalPages());
        result.put("currentPage", page);
        result.put("pageSize", size);
        return result;
    }
    
    @Override
    public SysUser getUserById(Long id) {
        SysUser user = userRepository.findById(id).orElse(null);
        if (user != null) {
            loadUserRolesAndPermissions(user);
        }
        return user;
    }
    
    @Override
    public SysUser getUserByUsername(String username) {
        SysUser user = userRepository.findByUsername(username);
        if (user != null) {
            loadUserRolesAndPermissions(user);
        }
        return user;
    }
    
    /**
     * 加载用户的角色和权限信息
     */
    private void loadUserRolesAndPermissions(SysUser user) {
        List<SysRole> roles = getUserRoles(user.getId());
        user.setRoles(roles);
        
        List<Permission> permissions = getUserPermissions(user.getId());
        user.setPermissions(permissions);
    }
    
    @Override
    public SysUser createUser(SysUser user) {
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    @Override
    @Transactional
    public SysUser updateUser(SysUser user) {
        try {
            SysUser existingUser = userRepository.findById(user.getId()).orElse(null);
            if (existingUser != null) {
                existingUser.setUsername(user.getUsername());
                if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                    existingUser.setPassword(user.getPassword());
                }
                existingUser.setNickname(user.getNickname());
                existingUser.setPhone(user.getPhone());
                if (user.getStatus() != null) {
                    existingUser.setStatus(user.getStatus());
                }
                if (user.getAvatar() != null) {
                    existingUser.setAvatar(user.getAvatar());
                }
                if (user.getLastLoginTime() != null) {
                    existingUser.setLastLoginTime(user.getLastLoginTime());
                }
                existingUser.setUpdatedAt(LocalDateTime.now());
                return userRepository.save(existingUser);
            }
            return null;
        } catch (Exception e) {
            System.err.println("更新用户失败：" + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
    
    @Override
    public boolean deleteUser(Long id) {
        try {
            // 先删除用户的角色关联
            userRoleRepository.deleteByUserId(id);
            // 再删除用户
            userRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
    
    @Override
    public List<SysUser> searchUsers(String keyword) {
        List<SysUser> users = userRepository.searchByKeyword(keyword);
        // 为每个用户加载角色和权限信息
        for (SysUser user : users) {
            loadUserRolesAndPermissions(user);
        }
        return users;
    }
    
    @Override
    public List<SysUser> getUsersByRoleId(Long roleId) {
        List<SysUserRole> userRoles = userRoleRepository.findByRoleId(roleId);
        List<Long> userIds = userRoles.stream()
            .map(SysUserRole::getUserId)
            .collect(Collectors.toList());
        
        List<SysUser> users = userRepository.findAllById(userIds);
        for (SysUser user : users) {
            loadUserRolesAndPermissions(user);
        }
        return users;
    }
    
    @Override
    public List<SysUser> getUsersByStatus(Integer status) {
        return userRepository.findByStatus(status);
    }
    
    @Override
    public SysUser getUserByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }
    
    @Override
    public SysUser login(String username, String password) {
        // 尝试通过用户名查找
        SysUser user = userRepository.findByUsername(username);
        if (user == null) {
            // 尝试通过手机号查找
            user = userRepository.findByPhone(username);
        }
        
        if (user != null && user.getPassword().equals(password)) {
            // 更新最后登录时间
            user.setLastLoginTime(LocalDateTime.now());
            userRepository.save(user);
            // 加载角色和权限
            loadUserRolesAndPermissions(user);
            return user;
        }
        return null;
    }
    
    @Override
    public SysUser register(String phone, String password, String nickname) {
        // 检查手机号是否已注册
        if (userRepository.findByPhone(phone) != null) {
            return null;
        }
        
        // 创建新用户
        SysUser user = new SysUser();
        user.setUsername(phone); // 使用手机号作为用户名
        user.setPassword(password);
        user.setNickname(nickname);
        user.setPhone(phone);
        user.setStatus(1); // 启用
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    @Override
    public Map<String, Object> getUserWithRoles(Long userId) {
        Map<String, Object> result = new HashMap<>();
        
        // 获取用户信息
        SysUser user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            loadUserRolesAndPermissions(user);
            result.put("user", user);
            
            // 获取所有系统角色列表（用于前端选择）
            List<SysRole> allRoles = sysRoleRepository.findAll();
            result.put("allRoles", allRoles);
        }
        
        return result;
    }
    
    // ========== 用户角色权限管理方法实现 ==========
    
    @Override
    @Transactional
    public void assignRolesToUser(Long userId, List<Long> roleIds) {
        // 删除用户现有的所有角色关联
        userRoleRepository.deleteByUserId(userId);
        
        // 添加新的角色关联
        if (roleIds != null && !roleIds.isEmpty()) {
            for (Long roleId : roleIds) {
                SysUserRole userRole = new SysUserRole();
                userRole.setUserId(userId);
                userRole.setRoleId(roleId);
                userRole.setCreateTime(LocalDateTime.now());
                userRoleRepository.save(userRole);
            }
        }
    }
    
    @Override
    public List<SysRole> getUserRoles(Long userId) {
        List<Long> roleIds = userRoleRepository.findRoleIdsByUserId(userId);
        if (roleIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<SysRole> roles = sysRoleRepository.findAllById(roleIds);
        
        // 为每个角色加载权限
        for (SysRole role : roles) {
            List<Permission> permissions = getRolePermissions(role.getId());
            role.setPermissions(permissions);
        }
        
        return roles;
    }
    
    @Override
    public List<Permission> getUserPermissions(Long userId) {
        // 获取用户的所有角色 ID
        List<Long> roleIds = userRoleRepository.findRoleIdsByUserId(userId);
        if (roleIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        // 获取所有角色的权限 ID（去重）
        Set<Long> permissionIds = new HashSet<>();
        for (Long roleId : roleIds) {
            List<Long> rolePermissionIds = rolePermissionRepository.findPermissionIdsByRoleId(roleId);
            permissionIds.addAll(rolePermissionIds);
        }
        
        if (permissionIds.isEmpty()) {
            return new ArrayList<>();
        }
        
        return permissionRepository.findAllById(new ArrayList<>(permissionIds));
    }
    
    @Override
    public boolean hasPermission(Long userId, String permissionCode) {
        List<Permission> permissions = getUserPermissions(userId);
        return permissions.stream()
            .anyMatch(p -> permissionCode.equals(p.getCode()));
    }
    
    @Override
    public boolean hasRole(Long userId, String roleCode) {
        List<SysRole> roles = getUserRoles(userId);
        return roles.stream()
            .anyMatch(r -> roleCode.equals(r.getRoleCode()));
    }
    
    /**
     * 获取角色的权限列表
     */
    private List<Permission> getRolePermissions(Long roleId) {
        List<Long> permissionIds = rolePermissionRepository.findPermissionIdsByRoleId(roleId);
        if (permissionIds.isEmpty()) {
            return new ArrayList<>();
        }
        return permissionRepository.findAllById(permissionIds);
    }
}
