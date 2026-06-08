package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.SysRole;
import com.lingyue.entity.Permission;
import com.lingyue.service.SysRoleService;
import com.lingyue.service.RolePermissionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/sys/role")
public class SysRoleController {

    private final SysRoleService sysRoleService;
    private final RolePermissionService rolePermissionService;

    public SysRoleController(SysRoleService sysRoleService, RolePermissionService rolePermissionService) {
        this.sysRoleService = sysRoleService;
        this.rolePermissionService = rolePermissionService;
    }

    @GetMapping
    public ResponseEntity<List<SysRole>> getAllRoles() {
        List<SysRole> roles = sysRoleService.getAllRoles();
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }

    @GetMapping("/page")
    public ResponseEntity<Map<String, Object>> getRolesByPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Map<String, Object> result = sysRoleService.getRolesByPage(page, size);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SysRole> getRoleById(@PathVariable Long id) {
        SysRole role = sysRoleService.getRoleById(id);
        if (role != null) {
            return new ResponseEntity<>(role, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping
    public ResponseEntity<SysRole> createRole(@RequestBody SysRole role) {
        SysRole createdRole = sysRoleService.createRole(role);
        return new ResponseEntity<>(createdRole, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SysRole> updateRole(@PathVariable Long id, @RequestBody SysRole role) {
        role.setId(id);
        SysRole updatedRole = sysRoleService.updateRole(role);
        if (updatedRole != null) {
            return new ResponseEntity<>(updatedRole, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRole(@PathVariable Long id) {
        boolean deleted = sysRoleService.deleteRole(id);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<SysRole>> searchRoles(@RequestParam String keyword) {
        List<SysRole> roles = sysRoleService.searchRoles(keyword);
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<SysRole>> getRolesByStatus(@PathVariable Integer status) {
        List<SysRole> roles = sysRoleService.getRolesByStatus(status);
        return new ResponseEntity<>(roles, HttpStatus.OK);
    }
    
    // ========== 角色权限管理接口 ==========
    
    /**
     * 获取角色的权限列表
     */
    @GetMapping("/{id}/permissions")
    public ResponseEntity<List<Permission>> getRolePermissions(@PathVariable Long id) {
        List<Permission> permissions = rolePermissionService.getRolePermissions(id);
        return new ResponseEntity<>(permissions, HttpStatus.OK);
    }
    
    /**
     * 为角色分配权限
     */
    @PostMapping("/{id}/permissions")
    public ResponseEntity<Void> assignPermissionsToRole(
            @PathVariable Long id,
            @RequestBody List<Long> permissionIds) {
        rolePermissionService.assignPermissionsToRole(id, permissionIds);
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    /**
     * 为角色添加单个权限
     */
    @PostMapping("/{id}/permissions/{permissionId}")
    public ResponseEntity<Void> addPermissionToRole(
            @PathVariable Long id,
            @PathVariable Long permissionId) {
        rolePermissionService.addPermissionToRole(id, permissionId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
    
    /**
     * 从角色移除权限
     */
    @DeleteMapping("/{id}/permissions/{permissionId}")
    public ResponseEntity<Void> removePermissionFromRole(
            @PathVariable Long id,
            @PathVariable Long permissionId) {
        rolePermissionService.removePermissionFromRole(id, permissionId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    
    /**
     * 检查角色是否拥有指定权限
     */
    @GetMapping("/{id}/permissions/check/{permissionCode}")
    public ResponseEntity<Boolean> hasPermission(
            @PathVariable Long id,
            @PathVariable String permissionCode) {
        boolean hasPermission = rolePermissionService.hasPermission(id, permissionCode);
        return new ResponseEntity<>(hasPermission, HttpStatus.OK);
    }
}
