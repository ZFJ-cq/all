package com.lingyue.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.dto.CreateRoleRequest;
import com.lingyue.entity.GameRole;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.RoleDataService;
import com.lingyuexiantu.common.Result;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Tag(name = "Role Management", description = "APIs for managing game roles")
@RestController
@RequestMapping("/role")
public class RoleController {
    
    private static final Logger logger = LoggerFactory.getLogger(RoleController.class);
    
    private final GameRoleService roleService;
    private final RoleDataService roleDataService;
    
    public RoleController(GameRoleService roleService, RoleDataService roleDataService) {
        this.roleService = roleService;
        this.roleDataService = roleDataService;
    }
    
    @Operation(summary = "Create a new role", description = "Create a new game role with the provided information")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/create")
    public Result<GameRole> createRole(@RequestBody @Valid CreateRoleRequest request, HttpServletRequest httpRequest) {
        try {
            GameRole role = new GameRole();
            role.setRoleName(request.getName());
            role.setAvatar(request.getAvatar());
            
            if (request.getGender() != null) {
                try {
                    role.setGender(Integer.parseInt(request.getGender()));
                } catch (NumberFormatException e) {
                    role.setGender(0);
                }
            }
            
            if (request.getSpiritRoot() != null) {
                role.setSpiritRoot(request.getSpiritRoot());
            }
            
            if (request.getOrigin() != null) {
                role.setOrigin(request.getOrigin());
            }
            
            Long userId = (Long) httpRequest.getAttribute("userId");
            if (userId == null) {
                String userIdStr = httpRequest.getParameter("userId");
                if (userIdStr != null) {
                    try {
                        userId = Long.parseLong(userIdStr);
                    } catch (NumberFormatException e) {
                        return Result.error("无效的用户ID");
                    }
                } else {
                    String authHeader = httpRequest.getHeader("Authorization");
                    if (authHeader == null && !httpRequest.getRequestURI().contains("/role/create")) {
                        return Result.error("请先登录");
                    }
                    userId = 1L;
                }
            }
            role.setUserId(userId);
            
            GameRole created = roleService.createRole(role);
            
            if (created != null && created.getId() != null) {
                roleDataService.initializeRoleData(created.getId());
                logger.info("Role data initialized successfully, roleId: {}", created.getId());
            }
            
            return Result.success(created);
        } catch (Exception e) {
            logger.error("Failed to create role", e);
            e.printStackTrace();
            return Result.error("Failed to create role: " + e.getMessage());
        }
    }
    
    @Operation(summary = "Get roles by user ID", description = "Retrieve all roles belonging to a specific user")
    // 根据用户 ID 查询角色
    @GetMapping("/user/{userId}")
    public Result<List<GameRole>> getRolesByUserId(@Parameter(description = "User ID") @PathVariable Long userId, HttpServletRequest request) {
        try {
            // 获取当前用户 ID
            Long currentUserId = (Long) request.getAttribute("userId");
            logger.info("Get roles by user ID - Current user ID: {}, Requested user ID: {}", currentUserId, userId);
            
            if (currentUserId == null) {
                logger.warn("Unauthenticated user attempts to access user {}'s role list", userId);
                return Result.error("请先登录");
            }
            if (!currentUserId.equals(userId)) {
                logger.warn("User {} attempts to access user {}'s role list", currentUserId, userId);
                return Result.error("Access denied");
            }
            
            List<GameRole> roles = roleService.getRolesByUserId(userId);
            logger.info("Successfully retrieved role list for user {}, count: {}", userId, roles.size());
            return Result.success(roles);
        } catch (Exception e) {
            logger.error("Failed to get role list", e);
            e.printStackTrace();
            return Result.error("Failed to get role list: " + e.getMessage());
        }
    }
    
    @Operation(summary = "Get all roles", description = "Retrieve all roles in the system (public API)")
    // 获取所有角色（公开接口）
    @GetMapping("/all")
    public Result<List<GameRole>> getAllRoles() {
        try {
            List<GameRole> roles = roleService.getAllRoles();
            logger.info("Successfully retrieved all roles, count: {}", roles.size());
            return Result.success(roles);
        } catch (Exception e) {
            logger.error("Failed to get all roles", e);
            e.printStackTrace();
            return Result.error("Failed to get all roles: " + e.getMessage());
        }
    }
    
    @Operation(summary = "Get role by ID", description = "Retrieve detailed information about a specific role")
    @SecurityRequirement(name = "bearerAuth")
    // 获取角色详情
    @GetMapping("/{roleId}")
    public Result<GameRole> getRoleById(@Parameter(description = "Role ID") @PathVariable Long roleId, HttpServletRequest request) {
        try {
            // 获取当前用户 ID
            Long userId = (Long) request.getAttribute("userId");
            
            GameRole role = roleService.getRoleById(roleId);
            if (role == null) {
                return Result.error("Role does not exist");
            }
            
            // 验证角色归属（如果用户已认证）
            if (userId != null && !role.getUserId().equals(userId)) {
                return Result.error("Access denied");
            }
            
            return Result.success(role);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("Failed to get role details: " + e.getMessage());
        }
    }
    
    @Operation(summary = "Update role", description = "Update an existing role's information")
    @SecurityRequirement(name = "bearerAuth")
    // 更新角色数据
    @PutMapping("/{roleId}")
    public Result<GameRole> updateRole(@Parameter(description = "Role ID") @PathVariable Long roleId, @RequestBody GameRole role, HttpServletRequest request) {
        try {
            // 获取当前用户 ID
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return Result.error("Unauthorized");
            }
            
            // 验证角色归属
            GameRole existingRole = roleService.getRoleById(roleId);
            if (existingRole == null) {
                return Result.error("Role does not exist");
            }
            if (!existingRole.getUserId().equals(userId)) {
                return Result.error("Access denied");
            }
            
            role.setId(roleId);
            GameRole updated = roleService.updateRole(roleId, role);
            return Result.success(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("Failed to update role: " + e.getMessage());
        }
    }
    
    @Operation(summary = "Delete role", description = "Delete a role by ID")
    @SecurityRequirement(name = "bearerAuth")
    // 删除角色
    @DeleteMapping("/{roleId}")
    public Result<GameRole> deleteRole(@Parameter(description = "Role ID") @PathVariable Long roleId, HttpServletRequest request) {
        try {
            // 获取当前用户 ID
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return Result.error("Unauthorized");
            }
            
            // 验证角色归属
            GameRole existingRole = roleService.getRoleById(roleId);
            if (existingRole == null) {
                return Result.error("Role does not exist");
            }
            if (!existingRole.getUserId().equals(userId)) {
                return Result.error("Access denied");
            }
            
            GameRole deleted = roleService.deleteRole(roleId);
            return Result.success(deleted);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("Failed to delete role: " + e.getMessage());
        }
    }
    
    @Operation(summary = "Update role realm", description = "Update a role's cultivation realm")
    @SecurityRequirement(name = "bearerAuth")
    // 更新角色境界
    @PutMapping("/{roleId}/realm")
    public Result<GameRole> updateRealm(@Parameter(description = "Role ID") @PathVariable Long roleId, 
                                       @Parameter(description = "New realm") @RequestParam String realm, 
                                       HttpServletRequest request) {
        try {
            // 获取当前用户 ID
            Long userId = (Long) request.getAttribute("userId");
            if (userId == null) {
                return Result.error("Unauthorized");
            }
            
            // 验证角色归属
            GameRole existingRole = roleService.getRoleById(roleId);
            if (existingRole == null) {
                return Result.error("Role does not exist");
            }
            if (!existingRole.getUserId().equals(userId)) {
                return Result.error("Access denied");
            }
            
            GameRole updated = roleService.updateRealm(roleId, realm);
            return Result.success(updated);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("Failed to update realm: " + e.getMessage());
        }
    }
    

}