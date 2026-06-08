package com.example.lingyuexiantuserver.controller;

import com.example.lingyuexiantuserver.entity.SysUser;
import com.example.lingyuexiantuserver.exception.GlobalExceptionHandler;
import com.example.lingyuexiantuserver.service.SysUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final SysUserService userService;

    public AuthController(SysUserService userService) {
        this.userService = userService;
    }

    /**
     * 公开注册接口，角色默认为普通用户。
     */
    @PostMapping("/register")
    public ResponseEntity<GlobalExceptionHandler.Result> register(@RequestBody SysUser user) {
        // 强制把角色设置为普通用户，避免传入admin
        user.setRole(0);
        SysUser saved = userService.createUser(user);
        return ResponseEntity.ok(new GlobalExceptionHandler.Result(200, "注册成功", saved));
    }
}