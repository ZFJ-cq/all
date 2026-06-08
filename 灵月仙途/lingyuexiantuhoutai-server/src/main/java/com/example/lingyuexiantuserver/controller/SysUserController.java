package com.example.lingyuexiantuserver.controller;

import com.example.lingyuexiantuserver.entity.SysUser;
import com.example.lingyuexiantuserver.exception.GlobalExceptionHandler;
import com.example.lingyuexiantuserver.service.SysUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/user")
public class SysUserController {

    private final SysUserService userService;

    public SysUserController(SysUserService userService) {
        this.userService = userService;
    }

    // 新增用户
    @PostMapping
    public ResponseEntity<GlobalExceptionHandler.Result> createUser(@RequestBody SysUser user) {
        SysUser newUser = userService.createUser(user);
        return ResponseEntity.ok(new GlobalExceptionHandler.Result(200, "创建成功", newUser));
    }

    // 修改用户
    @PutMapping("/{id}")
    public ResponseEntity<GlobalExceptionHandler.Result> updateUser(@PathVariable Long id, @RequestBody SysUser user) {
        SysUser updatedUser = userService.updateUser(id, user);
        return ResponseEntity.ok(new GlobalExceptionHandler.Result(200, "修改成功", updatedUser));
    }

    // 删除用户
    @DeleteMapping("/{id}")
    public ResponseEntity<GlobalExceptionHandler.Result> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(new GlobalExceptionHandler.Result(200, "删除成功", null));
    }

    // 查询所有用户
    @GetMapping
    public ResponseEntity<GlobalExceptionHandler.Result> getAllUsers() {
        List<SysUser> users = userService.getAllUsers();
        return ResponseEntity.ok(new GlobalExceptionHandler.Result(200, "查询成功", users));
    }

    // 根据ID查询用户
    @GetMapping("/{id}")
    public ResponseEntity<GlobalExceptionHandler.Result> getUserById(@PathVariable Long id) {
        SysUser user = userService.getUserById(id);
        return ResponseEntity.ok(new GlobalExceptionHandler.Result(200, "查询成功", user));
    }
}
