package com.lingyue.service;

import com.lingyue.entity.SysRole;
import java.util.List;
import java.util.Map;

public interface SysRoleService {
    
    // 获取所有角色
    List<SysRole> getAllRoles();
    
    // 分页获取角色
    Map<String, Object> getRolesByPage(int page, int size);
    
    // 根据ID获取角色
    SysRole getRoleById(Long id);
    
    // 根据角色名称获取角色
    SysRole getRoleByRoleName(String roleName);
    
    // 创建角色
    SysRole createRole(SysRole role);
    
    // 更新角色
    SysRole updateRole(SysRole role);
    
    // 删除角色
    boolean deleteRole(Long id);
    
    // 搜索角色
    List<SysRole> searchRoles(String keyword);
    
    // 根据状态获取角色
    List<SysRole> getRolesByStatus(Integer status);
}