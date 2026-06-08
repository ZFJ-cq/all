package com.lingyue.controller;

import com.lingyuexiantu.common.Result;
import com.lingyue.entity.Achievement;
import com.lingyue.entity.RoleAchievement;
import com.lingyue.repository.AchievementRepository;
import com.lingyue.repository.RoleAchievementRepository;
import com.lingyue.service.AchievementService;
import com.lingyue.service.TitleAttributeService;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/achievement")
public class AchievementController {
    
    private final AchievementRepository achievementRepository;
    private final RoleAchievementRepository roleAchievementRepository;
    private final AchievementService achievementService;
    private final TitleAttributeService titleAttributeService;
    
    public AchievementController(AchievementRepository achievementRepository, 
                               RoleAchievementRepository roleAchievementRepository,
                               AchievementService achievementService,
                               TitleAttributeService titleAttributeService) {
        this.achievementRepository = achievementRepository;
        this.roleAchievementRepository = roleAchievementRepository;
        this.achievementService = achievementService;
        this.titleAttributeService = titleAttributeService;
    }
    
    /**
     * 获取所有成就列表
     */
    @GetMapping
    public Result<List<Map<String, Object>>> getAchievements() {
        try {
            // 从数据库获取启用的成就
            List<Achievement> achievements = achievementRepository.findByStatusOrderBySortOrderAsc(1);
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Achievement achievement : achievements) {
                Map<String, Object> achievementMap = new HashMap<>();
                achievementMap.put("id", achievement.getId());
                achievementMap.put("name", achievement.getName());
                achievementMap.put("type", achievement.getType());
                achievementMap.put("condition", achievement.getCondition());
                achievementMap.put("sort", achievement.getSortOrder());
                achievementMap.put("status", achievement.getStatus());
                achievementMap.put("rewards", achievement.getRewards());
                // 新增字段
                achievementMap.put("moduleType", achievement.getModuleType());
                achievementMap.put("conditionType", achievement.getConditionType());
                achievementMap.put("operator", achievement.getOperator());
                achievementMap.put("threshold", achievement.getThreshold());
                achievementMap.put("rewardAttributes", achievement.getRewardAttributes());
                achievementMap.put("title", achievement.getTitle());
                achievementMap.put("rarity", achievement.getRarity());
                achievementMap.put("icon", achievement.getIcon());
                achievementMap.put("hidden", achievement.getHidden());
                result.add(achievementMap);
            }
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取成就列表失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取角色的成就进度
     */
    @GetMapping("/role/{roleId}")
    public Result<Map<String, Object>> getRoleAchievements(@PathVariable Long roleId) {
        try {
            // 获取所有启用的成就
            List<Achievement> achievements = achievementRepository.findByStatusOrderBySortOrderAsc(1);
            // 获取角色的成就进度
            List<RoleAchievement> roleAchievements = roleAchievementRepository.findByRoleId(roleId);
            
            // 构建成就ID到进度的映射
            Map<Long, RoleAchievement> progressMap = new HashMap<>();
            for (RoleAchievement ra : roleAchievements) {
                progressMap.put(ra.getAchievementId(), ra);
            }
            
            // 构建结果
            List<Map<String, Object>> achievementList = new ArrayList<>();
            int completedCount = 0;
            int claimedCount = 0;
            
            for (Achievement achievement : achievements) {
                Map<String, Object> achievementMap = new HashMap<>();
                achievementMap.put("id", achievement.getId());
                achievementMap.put("name", achievement.getName());
                achievementMap.put("type", achievement.getType());
                achievementMap.put("condition", achievement.getCondition());
                achievementMap.put("rewards", achievement.getRewards());
                achievementMap.put("threshold", achievement.getThreshold());
                achievementMap.put("title", achievement.getTitle());
                achievementMap.put("rarity", achievement.getRarity());
                achievementMap.put("icon", achievement.getIcon());
                achievementMap.put("hidden", achievement.getHidden());
                achievementMap.put("conditionType", achievement.getConditionType());
                achievementMap.put("rewardAttributes", achievement.getRewardAttributes());
                achievementMap.put("moduleType", achievement.getModuleType());
                achievementMap.put("sortOrder", achievement.getSortOrder());
                
                // 添加进度信息
                RoleAchievement ra = progressMap.get(achievement.getId());
                if (ra != null) {
                    achievementMap.put("progress", ra.getProgress());
                    achievementMap.put("status", ra.getStatus());
                    achievementMap.put("completedTime", ra.getCompletedTime());
                    achievementMap.put("claimedTime", ra.getClaimedTime());
                    
                    if ("completed".equals(ra.getStatus())) {
                        completedCount++;
                    } else if ("claimed".equals(ra.getStatus())) {
                        claimedCount++;
                    }
                } else {
                    // 角色尚未开始此成就
                    achievementMap.put("progress", 0);
                    achievementMap.put("status", "in_progress");
                }
                
                achievementList.add(achievementMap);
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("achievements", achievementList);
            result.put("total", achievements.size());
            result.put("completed", completedCount);
            result.put("claimed", claimedCount);
            result.put("progress", String.format("%.1f%%", (double) claimedCount / achievements.size() * 100));
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取角色成就进度失败：" + e.getMessage());
        }
    }
    
    /**
     * 更新成就进度
     */
    @PostMapping("/progress")
    public Result<Map<String, Object>> updateProgress(@RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            Long achievementId = Long.parseLong(request.get("achievementId").toString());
            Integer progress = Integer.parseInt(request.get("progress").toString());
            Integer target = Integer.parseInt(request.get("target").toString());
            
            // 查找或创建角色成就记录
            RoleAchievement roleAchievement = roleAchievementRepository
                .findByRoleIdAndAchievementId(roleId, achievementId)
                .orElse(new RoleAchievement());
            
            if (roleAchievement.getId() == null) {
                roleAchievement.setRoleId(roleId);
                roleAchievement.setAchievementId(achievementId);
                roleAchievement.setProgress(0);
                roleAchievement.setStatus("in_progress");
            }
            
            // 更新进度
            roleAchievement.setProgress(progress);
            
            // 检查是否完成
            if (progress >= target && !"completed".equals(roleAchievement.getStatus()) && !"claimed".equals(roleAchievement.getStatus())) {
                roleAchievement.setStatus("completed");
                roleAchievement.setCompletedTime(LocalDateTime.now());
            }
            
            roleAchievementRepository.save(roleAchievement);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "进度更新成功");
            result.put("achievementId", achievementId);
            result.put("progress", progress);
            result.put("status", roleAchievement.getStatus());
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("更新成就进度失败：" + e.getMessage());
        }
    }
    
    /**
     * 领取成就奖励 (生产级实现)
     */
    @PostMapping("/claim/{achievementId}")
    public Result<Map<String, Object>> claimReward(@PathVariable Long achievementId, 
                                                @RequestBody Map<String, Object> request,
                                                HttpServletRequest httpRequest) {
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            
            // 生成唯一请求 ID (幂等性)
            String requestId = request.get("requestId") != null 
                ? request.get("requestId").toString() 
                : UUID.randomUUID().toString();
            
            // 获取客户端 IP
            String clientIp = httpRequest.getRemoteAddr();
            
            // 调用 Service 层发放奖励 (包含完整的事务和幂等性保护)
            Map<String, Object> rewardDetail = achievementService.claimReward(
                roleId, achievementId, requestId, clientIp);
            
            return Result.success(rewardDetail);
            
        } catch (IllegalArgumentException e) {
            e.printStackTrace();
            return Result.error("参数错误：" + e.getMessage());
        } catch (com.lingyue.exception.AchievementAlreadyClaimedException e) {
            return Result.error("奖励已领取");
        } catch (com.lingyue.exception.AchievementNotCompletedException e) {
            return Result.error("成就尚未完成");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("领取成就奖励失败：" + e.getMessage());
        }
    }
    
    /**
     * 佩戴称号 (集成属性计算)
     */
    @PostMapping("/equip/{achievementId}")
    public Result<Map<String, Object>> equipTitle(@PathVariable Long achievementId,
                                                  @RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            
            // 使用 TitleAttributeService 佩戴称号 (会自动清除缓存)
            titleAttributeService.equipTitle(roleId, achievementId);
            
            // 计算新的属性加成
            Map<String, Long> bonus = titleAttributeService.calculateTitleBonus(roleId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "称号佩戴成功");
            result.put("achievementId", achievementId);
            result.put("titleBonus", bonus);
            
            return Result.success(result);
        } catch (IllegalArgumentException e) {
            return Result.error("称号不存在");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("佩戴称号失败：" + e.getMessage());
        }
    }
    
    /**
     * 卸下称号 (集成属性计算)
     */
    @PostMapping("/unequip/{achievementId}")
    public Result<Map<String, Object>> unequipTitle(@PathVariable Long achievementId,
                                                    @RequestBody Map<String, Object> request) {
        try {
            Long roleId = Long.parseLong(request.get("roleId").toString());
            
            // 使用 TitleAttributeService 卸下称号
            titleAttributeService.unequipTitle(roleId, achievementId);
            
            // 计算卸下后的属性加成 (应该为 0)
            Map<String, Long> bonus = titleAttributeService.calculateTitleBonus(roleId);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "称号卸下成功");
            result.put("achievementId", achievementId);
            result.put("titleBonus", bonus);
            
            return Result.success(result);
        } catch (IllegalArgumentException e) {
            return Result.error("称号不存在");
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("卸下称号失败：" + e.getMessage());
        }
    }
    
    /**
     * 获取当前佩戴的称号及属性加成
     */
    @GetMapping("/role/{roleId}/equipped")
    public Result<Map<String, Object>> getEquippedTitle(@PathVariable Long roleId) {
        try {
            RoleAchievement roleAchievement = roleAchievementRepository
                .findByRoleIdAndIsEquippedTrue(roleId)
                .orElse(null);
            
            Map<String, Object> result = new HashMap<>();
            if (roleAchievement != null) {
                Achievement achievement = achievementRepository.findById(roleAchievement.getAchievementId())
                    .orElse(null);
                if (achievement != null) {
                    result.put("achievementId", achievement.getId());
                    result.put("title", achievement.getTitle());
                    result.put("rewardAttributes", achievement.getRewardAttributes());
                    result.put("icon", achievement.getIcon());
                    
                    // 计算并返回属性加成
                    Map<String, Long> bonus = titleAttributeService.calculateTitleBonus(roleId);
                    result.put("titleBonus", bonus);
                }
            } else {
                result.put("achievementId", null);
                result.put("titleBonus", Map.of());
            }
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("获取佩戴称号失败：" + e.getMessage());
        }
    }
    
    /**
     * 初始化角色成就数据
     */
    @PostMapping("/role/{roleId}/init")
    public Result<Map<String, Object>> initRoleAchievements(@PathVariable Long roleId) {
        try {
            // 获取所有启用的成就
            List<Achievement> achievements = achievementRepository.findByStatusOrderBySortOrderAsc(1);
            
            // 检查并创建角色成就记录
            for (Achievement achievement : achievements) {
                if (!roleAchievementRepository.findByRoleIdAndAchievementId(roleId, achievement.getId()).isPresent()) {
                    RoleAchievement roleAchievement = new RoleAchievement();
                    roleAchievement.setRoleId(roleId);
                    roleAchievement.setAchievementId(achievement.getId());
                    roleAchievement.setProgress(0);
                    roleAchievement.setStatus("in_progress");
                    roleAchievementRepository.save(roleAchievement);
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "角色成就数据初始化成功");
            result.put("total", achievements.size());
            
            return Result.success(result);
        } catch (Exception e) {
            e.printStackTrace();
            return Result.error("初始化角色成就数据失败：" + e.getMessage());
        }
    }
}