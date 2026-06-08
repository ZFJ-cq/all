package com.example.lingyuexiantuserver.service;

import com.example.lingyuexiantuserver.entity.SysUser;
import java.util.List;

public interface SysUserService {
    // 新增用户
    SysUser createUser(SysUser user);

    // 修改用户
    SysUser updateUser(Long id, SysUser user);

    // 删除用户
    void deleteUser(Long id);

    // 查询所有用户
    List<SysUser> getAllUsers();

    // 根据ID查询用户
    SysUser getUserById(Long id);

    // 根据用户名查询用户
    SysUser getUserByUsername(String username);
}
