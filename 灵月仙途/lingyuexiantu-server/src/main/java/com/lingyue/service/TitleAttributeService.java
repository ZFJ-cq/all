package com.lingyue.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lingyue.entity.Achievement;
import com.lingyue.entity.RoleAchievement;
import com.lingyue.repository.AchievementRepository;
import com.lingyue.repository.RoleAchievementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

/**
 * 称号属性计算服务
 * 特性：
 * 1. Redis 缓存 (Cache-Aside 模式)
 * 2. 动态属性加成计算
 * 3. 策略模式处理不同加成类型
 */
@Service
public class TitleAttributeService {
    
    private static final Logger log = LoggerFactory.getLogger(TitleAttributeService.class);
    
    private final RoleAchievementRepository roleAchievementRepository;
    private final AchievementRepository achievementRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    
    private static final String CACHE_KEY_PREFIX = "player:title:attr:";
    private static final long CACHE_TTL_SECONDS = 300; // 5 分钟
    
    public TitleAttributeService(RoleAchievementRepository roleAchievementRepository,
                                AchievementRepository achievementRepository,
                                RedisTemplate<String, String> redisTemplate,
                                ObjectMapper objectMapper) {
        this.roleAchievementRepository = roleAchievementRepository;
        this.achievementRepository = achievementRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }
    
    /**
     * 计算角色的称号属性加成
     * 
     * @param roleId 角色 ID
     * @return 属性加成 Map {attack: 100, defense: 50, ...}
     */
    public Map<String, Long> calculateTitleBonus(Long roleId) {
        // 1. 尝试从缓存读取
        String cacheKey = CACHE_KEY_PREFIX + roleId;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        
        if (cached != null) {
            try {
                Map<String, Long> cachedBonus = objectMapper.readValue(cached, Map.class);
                log.debug("命中称号属性缓存，roleId={}, bonus={}", roleId, cachedBonus);
                return cachedBonus;
            } catch (JsonProcessingException e) {
                log.error("解析缓存失败，roleId={}", roleId, e);
            }
        }
        
        // 2. 缓存未命中，从数据库计算
        Map<String, Long> bonus = calculateFromDatabase(roleId);
        
        // 3. 写入缓存 (Cache-Aside)
        try {
            String json = objectMapper.writeValueAsString(bonus);
            redisTemplate.opsForValue().set(cacheKey, json, CACHE_TTL_SECONDS, TimeUnit.SECONDS);
            log.debug("写入称号属性缓存，roleId={}, bonus={}", roleId, bonus);
        } catch (JsonProcessingException e) {
            log.error("序列化缓存失败，roleId={}", roleId, e);
        }
        
        return bonus;
    }
    
    /**
     * 从数据库计算称号属性
     */
    private Map<String, Long> calculateFromDatabase(Long roleId) {
        Map<String, Long> totalBonus = new HashMap<>();
        
        // 查询佩戴的称号
        Optional<RoleAchievement> equippedTitleOpt = roleAchievementRepository
            .findByRoleIdAndIsEquippedTrue(roleId);
        
        if (equippedTitleOpt.isEmpty()) {
            log.debug("角色未佩戴称号，roleId={}", roleId);
            return totalBonus;
        }
        
        RoleAchievement roleAchievement = equippedTitleOpt.get();
        
        // 查询成就配置
        Optional<Achievement> achievementOpt = achievementRepository
            .findById(roleAchievement.getAchievementId());
        
        if (achievementOpt.isEmpty()) {
            log.warn("称号对应的成就不存在，roleId={}, achievementId={}", 
                roleId, roleAchievement.getAchievementId());
            return totalBonus;
        }
        
        Achievement achievement = achievementOpt.get();
        
        // 解析奖励属性 JSON
        String rewardAttributes = achievement.getRewardAttributes();
        if (rewardAttributes == null || rewardAttributes.isEmpty()) {
            return totalBonus;
        }
        
        try {
            Map<String, Object> attributes = objectMapper.readValue(
                rewardAttributes, Map.class);
            
            // 计算每种属性的加成
            for (Map.Entry<String, Object> entry : attributes.entrySet()) {
                String attrName = entry.getKey();
                Object attrValue = entry.getValue();
                
                long bonus = parseAndCalculate(attrValue);
                totalBonus.put(attrName, bonus);
            }
            
            log.info("计算称号属性，roleId={}, title={}, bonus={}", 
                roleId, achievement.getTitle(), totalBonus);
            
        } catch (JsonProcessingException e) {
            log.error("解析奖励属性失败，roleId={}, json={}", 
                roleId, rewardAttributes, e);
        }
        
        return totalBonus;
    }
    
    /**
     * 解析并计算属性值
     */
    private long parseAndCalculate(Object value) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        } else if (value instanceof String) {
            String strValue = (String) value;
            if (strValue.contains("%")) {
                // 百分比加成 (简化处理，假设基础值为 1000)
                double percent = Double.parseDouble(strValue.replace("%", "")) / 100.0;
                return (long) (1000 * percent);
            } else {
                return Long.parseLong(strValue);
            }
        }
        return 0;
    }
    
    /**
     * 授予称号
     */
    public void grantTitle(Long roleId, Long achievementId, String title) {
        // 检查是否已有该称号
        Optional<RoleAchievement> existingOpt = roleAchievementRepository
            .findByRoleIdAndAchievementId(roleId, achievementId);
        
        if (existingOpt.isEmpty()) {
            // 创建新记录
            RoleAchievement roleAchievement = new RoleAchievement();
            roleAchievement.setRoleId(roleId);
            roleAchievement.setAchievementId(achievementId);
            roleAchievement.setProgress(100);
            roleAchievement.setStatus("completed");
            roleAchievement.setCompletedTime(LocalDateTime.now());
            roleAchievement.setIsEquipped(false);
            
            roleAchievementRepository.save(roleAchievement);
        }
        
        // 清除缓存
        clearCache(roleId);
    }
    
    /**
     * 佩戴称号
     */
    @Transactional(rollbackFor = Exception.class)
    public void equipTitle(Long roleId, Long achievementId) {
        // 卸下当前称号
        roleAchievementRepository.findByRoleIdAndIsEquippedTrue(roleId)
            .ifPresent(ra -> {
                ra.setIsEquipped(false);
                roleAchievementRepository.save(ra);
            });
        
        // 佩戴新称号
        RoleAchievement newTitle = roleAchievementRepository
            .findByRoleIdAndAchievementId(roleId, achievementId)
            .orElseThrow(() -> new IllegalArgumentException("称号不存在"));
        
        newTitle.setIsEquipped(true);
        roleAchievementRepository.save(newTitle);
        
        // 清除缓存 (下次查询时重新计算)
        clearCache(roleId);
    }
    
    /**
     * 卸下称号
     */
    public void unequipTitle(Long roleId, Long achievementId) {
        RoleAchievement roleAchievement = roleAchievementRepository
            .findByRoleIdAndAchievementId(roleId, achievementId)
            .orElseThrow(() -> new IllegalArgumentException("称号不存在"));
        
        roleAchievement.setIsEquipped(false);
        roleAchievementRepository.save(roleAchievement);
        
        // 清除缓存
        clearCache(roleId);
    }
    
    /**
     * 清除缓存
     */
    private void clearCache(Long roleId) {
        String cacheKey = CACHE_KEY_PREFIX + roleId;
        redisTemplate.delete(cacheKey);
        log.debug("清除称号属性缓存，roleId={}", roleId);
    }
    
    /**
     * 批量计算多个角色的称号属性 (排行榜优化)
     */
    public Map<Long, Map<String, Long>> batchCalculateTitleBonus(List<Long> roleIds) {
        Map<Long, Map<String, Long>> result = new HashMap<>();
        
        for (Long roleId : roleIds) {
            result.put(roleId, calculateTitleBonus(roleId));
        }
        
        return result;
    }
}
