package com.example.lingyuexiantuserver.controller;

import com.example.lingyuexiantuserver.exception.GlobalExceptionHandler;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class LoginController {

    // 登录成功后的首页
    @GetMapping("/index")
    public ResponseEntity<GlobalExceptionHandler.Result> index() {
        // 获取当前登录用户
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok(new GlobalExceptionHandler.Result(200, "登录成功", auth.getName()));
    }

    // 退出登录
    @PostMapping("/logout")
    public ResponseEntity<GlobalExceptionHandler.Result> logout() {
        return ResponseEntity.ok(new GlobalExceptionHandler.Result(200, "退出成功", null));
    }
}
