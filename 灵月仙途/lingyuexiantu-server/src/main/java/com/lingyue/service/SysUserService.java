package com.lingyue.service;

import com.lingyue.entity.SysUser;
import com.lingyue.entity.SysRole;
import com.lingyue.entity.Permission;
import java.util.List;
import java.util.Map;

public interface SysUserService {
    
    // 获取所有系统用户
    List<SysUser> getAllUsers();
    
    // 分页获取系统用户
    Map<String, Object> getUsersByPage(int page, int size);
    
    // 根据 ID 获取用户
    SysUser getUserById(Long id);
    
    // 根据用户名获取用户
    SysUser getUserByUsername(String username);
    
    // 创建用户
    SysUser createUser(SysUser user);
    
    // 更新用户
    SysUser updateUser(SysUser user);
    
    // 删除用户
    boolean deleteUser(Long id);
    
    // 搜索用户
    List<SysUser> searchUsers(String keyword);
    
    // 根据角色 ID 获取用户
    List<SysUser> getUsersByRoleId(Long roleId);
    
    // 根据状态获取用户
    List<SysUser> getUsersByStatus(Integer status);
    
    // 根据手机号获取用户
    SysUser getUserByPhone(String phone);
    
    // 用户登录
    SysUser login(String username, String password);
    
    // 用户注册
    SysUser register(String phone, String password, String nickname);
    
    // 获取用户及其角色信息
    Map<String, Object> getUserWithRoles(Long userId);
    
    // ========== 新增的用户角色权限管理方法 ==========
    
    /**
     * 为用户分配角色
     */
    void assignRolesToUser(Long userId, List<Long> roleIds);
    
    /**
     * 获取用户的所有角色
     */
    List<SysRole> getUserRoles(Long userId);
    
    /**
     * 获取用户的所有权限（所有角色的权限并集）
     */
    List<Permission> getUserPermissions(Long userId);
    
    /**
     * 检查用户是否拥有指定权限
     */
    boolean hasPermission(Long userId, String permissionCode);
    
    /**
     * 检查用户是否拥有指定角色
     */
    boolean hasRole(Long userId, String roleCode);
}
