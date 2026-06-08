package com.example.lingyuexiantuserver.service.impl;

import com.example.lingyuexiantuserver.entity.SysUser;
import com.example.lingyuexiantuserver.exception.GlobalExceptionHandler;
import com.example.lingyuexiantuserver.repository.SysUserRepository;
import com.example.lingyuexiantuserver.service.SysUserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class SysUserServiceImpl implements SysUserService {

    private final SysUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public SysUserServiceImpl(SysUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public SysUser createUser(SysUser user) {
        // 检查用户名是否已存在
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new GlobalExceptionHandler.BusinessException(400, "用户名已存在");
        }
        // 加密密码
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // 设置默认状态
        if (user.getStatus() == null) {
            user.setStatus(1); // 默认为正常
        }
        if (user.getRole() == null) {
            user.setRole(0); // 默认为普通用户
        }
        return userRepository.save(user);
    }

    @Override
    public SysUser updateUser(Long id, SysUser user) {
        SysUser existingUser = userRepository.findById(id)
                .orElseThrow(() -> new GlobalExceptionHandler.BusinessException(404, "用户不存在"));

        // 更新用户信息
        if (user.getUsername() != null) {
            // 检查新用户名是否已被其他用户使用
            if (!existingUser.getUsername().equals(user.getUsername()) &&
                    userRepository.findByUsername(user.getUsername()).isPresent()) {
                throw new GlobalExceptionHandler.BusinessException(400, "用户名已存在");
            }
            existingUser.setUsername(user.getUsername());
        }
        if (user.getPassword() != null) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }
        if (user.getNickname() != null) {
            existingUser.setNickname(user.getNickname());
        }
        if (user.getPhone() != null) {
            existingUser.setPhone(user.getPhone());
        }
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }
        if (user.getStatus() != null) {
            existingUser.setStatus(user.getStatus());
        }
        if (user.getRole() != null) {
            existingUser.setRole(user.getRole());
        }

        return userRepository.save(existingUser);
    }

    @Override
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new GlobalExceptionHandler.BusinessException(404, "用户不存在");
        }
        userRepository.deleteById(id);
    }

    @Override
    public List<SysUser> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public SysUser getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new GlobalExceptionHandler.BusinessException(404, "用户不存在"));
    }

    @Override
    public SysUser getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalExceptionHandler.BusinessException(404, "用户不存在"));
    }
}
