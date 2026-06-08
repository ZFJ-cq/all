package com.lingyue.controller;

import org.springframework.web.bind.annotation.CrossOrigin;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.ResourceType;
import com.lingyue.entity.RoleResource;
import com.lingyue.service.GameRoleService;
import com.lingyue.service.ResourceTypeService;
import com.lingyue.service.RoleResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/body-training")
public class BodyTrainingController {
    
    private final GameRoleService gameRoleService;
    private final RoleResourceService roleResourceService;
    private final ResourceTypeService resourceTypeService;
    
    public BodyTrainingController(GameRoleService gameRoleService, 
                                  RoleResourceService roleResourceService,
                                  ResourceTypeService resourceTypeService) {
        this.gameRoleService = gameRoleService;
        this.roleResourceService = roleResourceService;
        this.resourceTypeService = resourceTypeService;
    }
    
    private Long getResourceTypeIdByCode(String code) {
        ResourceType resourceType = resourceTypeService.getResourceTypeByCode(code);
        if (resourceType != null) {
            return resourceType.getId();
        }
        throw new RuntimeException("未找到资源类型: " + code);
    }
    
    // 获取锻体状态
    @GetMapping("/status/{roleId}")
    public Map<String, Object> getBodyTrainingStatus(@PathVariable Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            GameRole role = gameRoleService.getRoleById(roleId);
            
            // 这里假设角色实体中有肉身境界相关字段
            // 如果没有，需要添加相关字段
            String bodyLevel = role.getBodyLevel() != null ? role.getBodyLevel() : "凡人之体";
            int bodyStrength = role.getBodyStrength() != null ? role.getBodyStrength() : 0;
            int maxBodyStrength = 100; // 假设每级肉身境界的最大强度为100
            
            // 计算锻体效率
            int efficiency = calculateTrainingEfficiency(bodyLevel);
            
            // 计算锻体效果
            int physicalAttack = calculatePhysicalAttack(bodyLevel, bodyStrength);
            int physicalDefense = calculatePhysicalDefense(bodyLevel, bodyStrength);
            int health = calculateHealth(bodyLevel, bodyStrength);
            
            result.put("success", true);
            result.put("bodyLevel", bodyLevel);
            result.put("bodyStrength", bodyStrength);
            result.put("maxBodyStrength", maxBodyStrength);
            result.put("efficiency", efficiency);
            result.put("physicalAttack", physicalAttack);
            result.put("physicalDefense", physicalDefense);
            result.put("health", health);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "获取锻体状态失败: " + e.getMessage());
        }
        
        return result;
    }
    
    // 开始锻体
    @PostMapping("/start")
    public Map<String, Object> startBodyTraining(@RequestParam Long roleId, @RequestParam String method) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            GameRole role = gameRoleService.getRoleById(roleId);
            
            // 计算锻体消耗
            int cost = calculateTrainingCost(method);
            
            // 检查资源是否足够
            Long xiuweiResourceTypeId = getResourceTypeIdByCode("xiuwei");
            RoleResource xiuweiResource = roleResourceService.getResourceByType(roleId, xiuweiResourceTypeId);
            if (xiuweiResource == null || xiuweiResource.getQuantity() < cost) {
                result.put("success", false);
                result.put("message", "修为不足，无法锻体");
                result.put("requiredXiuwei", cost);
                result.put("currentXiuwei", xiuweiResource != null ? xiuweiResource.getQuantity() : 0);
                return result;
            }
            
            // 消耗修为
            roleResourceService.addResource(roleId, xiuweiResourceTypeId, -cost);
            
            // 计算锻体收益
            int gainedStrength = calculateTrainingGain(method);
            int currentStrength = role.getBodyStrength() != null ? role.getBodyStrength() : 0;
            int newStrength = currentStrength + gainedStrength;
            
            // 检查是否突破肉身境界
            String currentBodyLevel = role.getBodyLevel() != null ? role.getBodyLevel() : "凡人之体";
            String newBodyLevel = currentBodyLevel;
            if (newStrength >= 100) {
                newBodyLevel = getNextBodyLevel(currentBodyLevel);
                newStrength = newStrength - 100;
            }
            
            // 更新角色肉身境界和强度
            role.setBodyLevel(newBodyLevel);
            role.setBodyStrength(newStrength);
            gameRoleService.updateRole(roleId, role);
            
            result.put("success", true);
            result.put("message", "锻体成功");
            result.put("gainedStrength", gainedStrength);
            result.put("newBodyLevel", newBodyLevel);
            result.put("newBodyStrength", newStrength);
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "锻体失败: " + e.getMessage());
        }
        
        return result;
    }
    
    // 辅助方法：计算锻体效率
    private int calculateTrainingEfficiency(String bodyLevel) {
        switch (bodyLevel) {
            case "凡人之体": return 10;
            case "炼体一层": return 15;
            case "炼体二层": return 20;
            case "炼体三层": return 25;
            case "炼体四层": return 30;
            case "炼体五层": return 35;
            case "炼体六层": return 40;
            case "炼体七层": return 45;
            case "炼体八层": return 50;
            case "炼体九层": return 55;
            case "渡劫肉身": return 60;
            default: return 10;
        }
    }
    
    // 辅助方法：计算物理攻击
    private int calculatePhysicalAttack(String bodyLevel, int bodyStrength) {
        int baseAttack = 100;
        int levelBonus = 0;
        
        switch (bodyLevel) {
            case "凡人之体": levelBonus = 0;
                break;
            case "炼体一层": levelBonus = 50;
                break;
            case "炼体二层": levelBonus = 100;
                break;
            case "炼体三层": levelBonus = 150;
                break;
            case "炼体四层": levelBonus = 200;
                break;
            case "炼体五层": levelBonus = 250;
                break;
            case "炼体六层": levelBonus = 300;
                break;
            case "炼体七层": levelBonus = 350;
                break;
            case "炼体八层": levelBonus = 400;
                break;
            case "炼体九层": levelBonus = 450;
                break;
            case "渡劫肉身": levelBonus = 500;
                break;
        }
        
        return baseAttack + levelBonus + (bodyStrength * 2);
    }
    
    // 辅助方法：计算物理防御
    private int calculatePhysicalDefense(String bodyLevel, int bodyStrength) {
        int baseDefense = 50;
        int levelBonus = 0;
        
        switch (bodyLevel) {
            case "凡人之体": levelBonus = 0;
                break;
            case "炼体一层": levelBonus = 30;
                break;
            case "炼体二层": levelBonus = 60;
                break;
            case "炼体三层": levelBonus = 90;
                break;
            case "炼体四层": levelBonus = 120;
                break;
            case "炼体五层": levelBonus = 150;
                break;
            case "炼体六层": levelBonus = 180;
                break;
            case "炼体七层": levelBonus = 210;
                break;
            case "炼体八层": levelBonus = 240;
                break;
            case "炼体九层": levelBonus = 270;
                break;
            case "渡劫肉身": levelBonus = 300;
                break;
        }
        
        return baseDefense + levelBonus + bodyStrength;
    }
    
    // 辅助方法：计算生命值
    private int calculateHealth(String bodyLevel, int bodyStrength) {
        int baseHealth = 1000;
        int levelBonus = 0;
        
        switch (bodyLevel) {
            case "凡人之体": levelBonus = 0;
                break;
            case "炼体一层": levelBonus = 200;
                break;
            case "炼体二层": levelBonus = 400;
                break;
            case "炼体三层": levelBonus = 600;
                break;
            case "炼体四层": levelBonus = 800;
                break;
            case "炼体五层": levelBonus = 1000;
                break;
            case "炼体六层": levelBonus = 1200;
                break;
            case "炼体七层": levelBonus = 1400;
                break;
            case "炼体八层": levelBonus = 1600;
                break;
            case "炼体九层": levelBonus = 1800;
                break;
            case "渡劫肉身": levelBonus = 2000;
                break;
        }
        
        return baseHealth + levelBonus + (bodyStrength * 10);
    }
    
    // 辅助方法：计算锻体消耗
    private int calculateTrainingCost(String method) {
        switch (method) {
            case "basic": return 100;
            case "advanced": return 500;
            case "special": return 1000;
            default: return 100;
        }
    }
    
    // 辅助方法：计算锻体收益
    private int calculateTrainingGain(String method) {
        switch (method) {
            case "basic": return 10;
            case "advanced": return 20;
            case "special": return 30;
            default: return 10;
        }
    }
    
    // 辅助方法：获取下一个肉身境界
    private String getNextBodyLevel(String currentBodyLevel) {
        switch (currentBodyLevel) {
            case "凡人之体": return "炼体一层";
            case "炼体一层": return "炼体二层";
            case "炼体二层": return "炼体三层";
            case "炼体三层": return "炼体四层";
            case "炼体四层": return "炼体五层";
            case "炼体五层": return "炼体六层";
            case "炼体六层": return "炼体七层";
            case "炼体七层": return "炼体八层";
            case "炼体八层": return "炼体九层";
            case "炼体九层": return "渡劫肉身";
            default: return currentBodyLevel;
        }
    }
}