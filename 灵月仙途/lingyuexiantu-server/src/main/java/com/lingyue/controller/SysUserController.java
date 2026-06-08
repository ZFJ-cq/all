package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.SysUser;
import com.lingyue.entity.Permission;
import com.lingyue.service.SysUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/sys/user")
public class SysUserController {
    
    private final SysUserService userService;
    
    public SysUserController(SysUserService userService) {
        this.userService = userService;
    }
    
    // 登录端点
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");
            
            // 验证参数
            if (username == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户名和密码不能为空"));
            }
            
            // 调用登录方法
            SysUser user = userService.login(username, password);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "用户名或密码错误"));
            }
            
            // 返回用户信息
            Map<String, Object> response = new HashMap<>();
            response.put("message", "登录成功");
            response.put("userId", user.getId());
            response.put("username", user.getUsername());
            response.put("nickname", user.getNickname());
            response.put("phone", user.getPhone());
            response.put("status", user.getStatus());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "登录失败: " + e.getMessage()));
        }
    }
    
    // 获取所有系统用户
    @GetMapping
    public ResponseEntity<List<SysUser>> getAllUsers() {
        List<SysUser> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    // 分页获取系统用户
    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getUsersByPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = userService.getUsersByPage(page, size);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }
    
    // 根据ID获取用户
    @GetMapping("/{id}")
    public ResponseEntity<SysUser> getUserById(@PathVariable Long id) {
        SysUser user = userService.getUserById(id);
        if (user != null) {
            return new ResponseEntity<>(user, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // 搜索用户
    @GetMapping("/search")
    public ResponseEntity<List<SysUser>> searchUsers(@RequestParam String keyword) {
        List<SysUser> users = userService.searchUsers(keyword);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    // 创建用户
    @PostMapping
    public ResponseEntity<SysUser> createUser(@RequestBody SysUser user) {
        SysUser createdUser = userService.createUser(user);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }
    
    // 更新用户
    @PutMapping("/{id}")
    public ResponseEntity<SysUser> updateUser(@PathVariable Long id, @RequestBody SysUser user) {
        user.setId(id);
        SysUser updatedUser = userService.updateUser(user);
        if (updatedUser != null) {
            return new ResponseEntity<>(updatedUser, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // 删除用户
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean deleted = userService.deleteUser(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // 根据角色ID获取用户
    @GetMapping("/role/{roleId}")
    public ResponseEntity<List<SysUser>> getUsersByRoleId(@PathVariable Long roleId) {
        List<SysUser> users = userService.getUsersByRoleId(roleId);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    // 根据状态获取用户
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SysUser>> getUsersByStatus(@PathVariable Integer status) {
        List<SysUser> users = userService.getUsersByStatus(status);
        return new ResponseEntity<>(users, HttpStatus.OK);
    }
    
    // 获取用户及其角色信息
    @GetMapping("/{id}/roles")
    public ResponseEntity<Map<String, Object>> getUserWithRoles(@PathVariable Long id) {
        Map<String, Object> result = userService.getUserWithRoles(id);
        if (result != null) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
    // ========== 用户角色管理接口 ==========
    
    /**
     * 为用户分配角色
     */
    @PostMapping("/{id}/roles")
    public ResponseEntity<Void> assignRolesToUser(
            @PathVariable Long id,
            @RequestBody List<Long> roleIds) {
        userService.assignRolesToUser(id, roleIds);
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    /**
     * 获取用户的权限列表
     */
    @GetMapping("/{id}/permissions")
    public ResponseEntity<List<Permission>> getUserPermissions(@PathVariable Long id) {
        List<Permission> permissions = userService.getUserPermissions(id);
        return new ResponseEntity<>(permissions, HttpStatus.OK);
    }
    
    /**
     * 检查用户是否拥有指定权限
     */
    @GetMapping("/{id}/permissions/check/{permissionCode}")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable Long id,
            @PathVariable String permissionCode) {
        boolean hasPermission = userService.hasPermission(id, permissionCode);
        return new ResponseEntity<>(hasPermission, HttpStatus.OK);
    }
}
