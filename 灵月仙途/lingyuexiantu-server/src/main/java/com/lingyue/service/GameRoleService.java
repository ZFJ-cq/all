package com.lingyue.service;

import com.lingyue.entity.GameRole;
import java.util.List;

public interface GameRoleService {
    // 创建角色
    GameRole createRole(GameRole role);
    
    // 根据用户ID查询角色
    List<GameRole> getRolesByUserId(Long userId);
    
    // 获取角色详情
    GameRole getRoleById(Long roleId);
    
    // 更新角色数据
    GameRole updateRole(Long roleId, GameRole role);
    
    // 删除角色
    GameRole deleteRole(Long roleId);
    
    // 更新角色境界
    GameRole updateRealm(Long roleId, String realm);
    
    // 获取角色等级
    int getRoleLevel(Long roleId);
    
    // 获取所有角色
    List<GameRole> getAllRoles();
    
    // 检查名字是否已存在
    boolean existsByName(String name);
}