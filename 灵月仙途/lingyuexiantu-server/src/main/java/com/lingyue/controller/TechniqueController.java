package com.lingyue.controller;

import com.lingyuexiantu.common.Result;
import com.lingyue.service.CultivationService;
import com.lingyue.service.TechniqueService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/technique")
public class TechniqueController {
    
    private static final Logger logger = LoggerFactory.getLogger(TechniqueController.class);
    
    private final TechniqueService techniqueService;
    private final CultivationService cultivationService;
    
    public TechniqueController(TechniqueService techniqueService, CultivationService cultivationService) {
        this.techniqueService = techniqueService;
        this.cultivationService = cultivationService;
    }
    
    /**
     * 获取所有可用功法
     */
    @GetMapping("/list")
    public Result<Object> getAllTechniques() {
        try {
            return Result.success(techniqueService.getAllTechniques());
        } catch (Exception e) {
            logger.error("获取功法列表失败", e);
            return Result.error("获取功法列表失败");
        }
    }
    
    /**
     * 获取用户拥有的功法
     */
    @GetMapping("/user/{userId}")
    public Result<Object> getUserTechniques(@PathVariable Long userId) {
        try {
            return Result.success(techniqueService.getUserTechniques(userId));
        } catch (Exception e) {
            logger.error("获取用户功法失败", e);
            return Result.error("获取用户功法失败");
        }
    }
    
    /**
     * 获取用户已装备的功法
     */
    @GetMapping("/user/{userId}/equipped")
    public Result<Object> getEquippedTechniques(@PathVariable Long userId) {
        try {
            return Result.success(techniqueService.getEquippedTechniques(userId));
        } catch (Exception e) {
            logger.error("获取已装备功法失败", e);
            return Result.error("获取已装备功法失败");
        }
    }
    
    /**
     * 获取用户功法总加成
     */
    @GetMapping("/user/{userId}/bonus")
    public Result<Object> getUserTechniqueBonus(@PathVariable Long userId) {
        try {
            return Result.success(techniqueService.calculateTotalBonus(userId));
        } catch (Exception e) {
            logger.error("获取功法加成失败", e);
            return Result.error("获取功法加成失败");
        }
    }
    
    /**
     * 学习功法
     */
    @PostMapping("/learn")
    public Result<Object> learnTechnique(
            @RequestParam Long userId,
            @RequestParam Long roleId,
            @RequestParam Long techniqueId) {
        try {
            Map<String, Object> result = techniqueService.learnTechnique(userId, roleId, techniqueId);
            
            if ((Boolean) result.get("success")) {
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            logger.error("学习功法失败", e);
            return Result.error("学习功法失败");
        }
    }
    
    /**
     * 装备功法
     */
    @PostMapping("/equip")
    public Result<Object> equipTechnique(
            @RequestParam Long userId,
            @RequestParam Long roleId,
            @RequestParam Long techniqueId) {
        try {
            // 装备功法
            Map<String, Object> result = techniqueService.equipTechnique(userId, roleId, techniqueId);
            
            if ((Boolean) result.get("success")) {
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            logger.error("装备功法失败", e);
            return Result.error("装备功法失败");
        }
    }
    
    /**
     * 卸下功法
     */
    @PostMapping("/unequip")
    public Result<Object> unequipTechnique(
            @RequestParam Long userId,
            @RequestParam Long roleId,
            @RequestParam Long techniqueId) {
        try {
            Map<String, Object> result = techniqueService.unequipTechnique(userId, roleId, techniqueId);
            
            if ((Boolean) result.get("success")) {
                return Result.success(result);
            } else {
                return Result.error((String) result.get("message"));
            }
        } catch (Exception e) {
            logger.error("卸下功法失败", e);
            return Result.error("卸下功法失败");
        }
    }
}