package com.lingyue.controller;

import com.lingyue.entity.SysPermission;
import com.lingyue.service.SysPermissionService;
import com.lingyuexiantu.common.Result;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 系统权限控制器
 */
@RestController
@RequestMapping("/sys/permission")
@CrossOrigin(originPatterns = "*", maxAge = 3600)
public class SysPermissionController {
    
    private final SysPermissionService permissionService;
    
    public SysPermissionController(SysPermissionService permissionService) {
        this.permissionService = permissionService;
    }
    
    /**
     * 获取所有权限
     */
    @GetMapping
    public Result<List<SysPermission>> getAllPermissions() {
        try {
            List<SysPermission> permissions = permissionService.findAll();
            return Result.success(permissions);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取权限列表失败：" + e.getMessage());
        }
    }
    
    /**
     * 根据 ID 获取权限
     */
    @GetMapping("/{id}")
    public Result<SysPermission> getPermissionById(@PathVariable Long id) {
        try {
            return permissionService.findById(id)
                    .map(Result::success)
                    .orElse(Result.error("权限不存在"));
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取权限失败：" + e.getMessage());
        }
    }
    
    /**
     * 创建权限
     */
    @PostMapping
    public Result<SysPermission> createPermission(@RequestBody SysPermission permission) {
        try {
            SysPermission saved = permissionService.save(permission);
            return Result.success(saved);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("创建权限失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新权限
     */
    @PutMapping("/{id}")
    public Result<SysPermission> updatePermission(
            @PathVariable Long id,
            @RequestBody SysPermission permission) {
        try {
            permission.setId(id);
            SysPermission updated = permissionService.save(permission);
            return Result.success(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("更新权限失败：" + e.getMessage());
        }
    }
    
    /**
     * 删除权限
     */
    @DeleteMapping("/{id}")
    public Result<Void> deletePermission(@PathVariable Long id) {
        try {
            permissionService.deleteById(id);
            return Result.success(null);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("删除权限失败：" + e.getMessage());
        }
    }
}