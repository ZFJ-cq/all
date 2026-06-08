package com.lingyue.service;

import com.lingyue.entity.GameUser;
import java.util.List;

public interface GameUserService {
    // 获取所有游戏用户
    List<GameUser> getAllUsers();
    
    // 根据ID获取用户
    GameUser getUserById(Long id);
    
    // 根据用户名获取用户
    GameUser getUserByUsername(String username);
    
    // 根据手机号获取用户
    GameUser getUserByPhone(String phone);
    
    // 创建用户
    GameUser createUser(GameUser user);
    
    // 更新用户
    GameUser updateUser(GameUser user);
    
    // 禁用用户（同时禁用关联的角色）
    GameUser disableUser(Long id);
    
    // 启用用户
    GameUser enableUser(Long id);
    
    // 获取用户数量
    long getUserCount();
}
