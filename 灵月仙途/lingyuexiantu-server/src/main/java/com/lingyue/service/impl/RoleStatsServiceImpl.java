package com.lingyue.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RoleBaseStats;
import com.lingyue.entity.PlayerStatsBase;
import com.lingyue.entity.SystemSetting;
import com.lingyue.repository.RoleBaseStatsRepository;
import com.lingyue.repository.PlayerStatsBaseRepository;
import com.lingyue.service.RoleStatsService;
import com.lingyue.service.SystemSettingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class RoleStatsServiceImpl implements RoleStatsService {
    
    private static final Logger logger = LoggerFactory.getLogger(RoleStatsServiceImpl.class);
    
    private final SystemSettingService systemSettingService;
    private final RoleBaseStatsRepository roleBaseStatsRepository;
    private final PlayerStatsBaseRepository playerStatsBaseRepository;
    private final ObjectMapper objectMapper;
    
    public RoleStatsServiceImpl(SystemSettingService systemSettingService, 
                                RoleBaseStatsRepository roleBaseStatsRepository,
                                PlayerStatsBaseRepository playerStatsBaseRepository) {
        this.systemSettingService = systemSettingService;
        this.roleBaseStatsRepository = roleBaseStatsRepository;
        this.playerStatsBaseRepository = playerStatsBaseRepository;
        this.objectMapper = new ObjectMapper();
    }
    
    @Override
    public Map<String, Integer> calculateInitialBaseStats(GameRole role) {
        // 1. 获取初始基础属性配置
        Map<String, Integer> baseStats = getInitialBaseStats();
        
        // 2. 应用灵根影响
        if (role.getSpiritRoot() != null) {
            applySpiritRootBonus(baseStats, role.getSpiritRoot());
        }
        
        return baseStats;
    }
    
    @Override
    public Map<String, Integer> getBaseStats(Long roleId) {
        Optional<RoleBaseStats> optionalStats = roleBaseStatsRepository.findByRoleId(roleId);
        if (optionalStats.isPresent()) {
            RoleBaseStats stats = optionalStats.get();
            Map<String, Integer> result = new HashMap<>();
            result.put("vit", stats.getVit());
            result.put("spi", stats.getSpi());
            result.put("agi", stats.getAgi());
            result.put("wis", stats.getWis());
            result.put("lck", stats.getLck());
            return result;
        }
        
        // 如果没有找到，返回默认值
        return getInitialBaseStats();
    }
    
    @Override
    public void updateBaseStats(Long roleId, Map<String, Integer> stats) {
        Optional<RoleBaseStats> optionalStats = roleBaseStatsRepository.findByRoleId(roleId);
        RoleBaseStats roleStats;
        
        if (optionalStats.isPresent()) {
            roleStats = optionalStats.get();
        } else {
            roleStats = new RoleBaseStats();
            roleStats.setRoleId(roleId);
            roleStats.setCreatedAt(LocalDateTime.now());
        }
        
        // 更新属性
        roleStats.setVit(stats.getOrDefault("vit", 10));
        roleStats.setSpi(stats.getOrDefault("spi", 10));
        roleStats.setAgi(stats.getOrDefault("agi", 10));
        roleStats.setWis(stats.getOrDefault("wis", 10));
        roleStats.setLck(stats.getOrDefault("lck", 10));
        roleStats.setUpdatedAt(LocalDateTime.now());
        
        roleBaseStatsRepository.save(roleStats);
        
        syncToPlayerStatsBase(roleId, roleStats);
    }
    
    private void syncToPlayerStatsBase(Long roleId, RoleBaseStats roleStats) {
        try {
            Optional<PlayerStatsBase> opt = playerStatsBaseRepository.findByRoleId(roleId);
            PlayerStatsBase psb;
            if (opt.isPresent()) {
                psb = opt.get();
                psb.setBaseVit(roleStats.getVit());
                psb.setBaseSpi(roleStats.getSpi());
                psb.setBaseAgi(roleStats.getAgi());
                psb.setBaseWis(roleStats.getWis());
                psb.setBaseLck(roleStats.getLck());
            } else {
                psb = new PlayerStatsBase();
                psb.setRoleId(roleId);
                psb.setPlayerId(roleId);
                psb.setBaseVit(roleStats.getVit());
                psb.setBaseSpi(roleStats.getSpi());
                psb.setBaseAgi(roleStats.getAgi());
                psb.setBaseWis(roleStats.getWis());
                psb.setBaseLck(roleStats.getLck());
                psb.setPermVit(0);
                psb.setPermSpi(0);
                psb.setPermAgi(0);
                psb.setPermWis(0);
                psb.setPermLck(0);
                psb.setTmpVit(0);
                psb.setTmpSpi(0);
                psb.setTmpAgi(0);
                psb.setTmpWis(0);
                psb.setTmpLck(0);
                psb.setRealmLevel(0);
                psb.setRealmStage(1);
                psb.setExpCurr(0L);
                psb.setExpMax(1000L);
                psb.setCultivationSpeed(1.0);
            }
            playerStatsBaseRepository.save(psb);
        } catch (Exception e) {
            logger.warn("同步PlayerStatsBase失败，roleId={}, error={}", roleId, e.getMessage());
        }
    }
    
    /**
     * 为新角色保存初始基础属性
     */
    public void saveInitialBaseStats(Long roleId, Map<String, Integer> stats) {
        RoleBaseStats roleStats = new RoleBaseStats();
        roleStats.setRoleId(roleId);
        roleStats.setVit(stats.getOrDefault("vit", 10));
        roleStats.setSpi(stats.getOrDefault("spi", 10));
        roleStats.setAgi(stats.getOrDefault("agi", 10));
        roleStats.setWis(stats.getOrDefault("wis", 10));
        roleStats.setLck(stats.getOrDefault("lck", 10));
        roleStats.setCreatedAt(LocalDateTime.now());
        roleStats.setUpdatedAt(LocalDateTime.now());
        
        roleBaseStatsRepository.save(roleStats);
    }
    
    /**
     * 获取初始基础属性配置
     */
    private Map<String, Integer> getInitialBaseStats() {
        SystemSetting setting = systemSettingService.getSettingByKey("initial_base_stats");
        if (setting != null && setting.getValue() != null) {
            try {
                return objectMapper.readValue(setting.getValue(), Map.class);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        
        // 默认值
        Map<String, Integer> defaultStats = new HashMap<>();
        defaultStats.put("vit", 10);
        defaultStats.put("spi", 10);
        defaultStats.put("agi", 10);
        defaultStats.put("wis", 10);
        defaultStats.put("lck", 10);
        return defaultStats;
    }
    
    /**
     * 应用灵根对基础属性的影响
     */
    private void applySpiritRootBonus(Map<String, Integer> stats, String spiritRoot) {
        SystemSetting setting = systemSettingService.getSettingByKey("spirit_root_bonus");
        if (setting != null && setting.getValue() != null) {
            try {
                Map<String, Map<String, Integer>> bonusConfig = objectMapper.readValue(setting.getValue(), Map.class);
                Map<String, Integer> bonus = bonusConfig.get(spiritRoot);
                if (bonus != null) {
                    for (Map.Entry<String, Integer> entry : bonus.entrySet()) {
                        String stat = entry.getKey();
                        Integer value = entry.getValue();
                        stats.put(stat, stats.getOrDefault(stat, 0) + value);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }
}
