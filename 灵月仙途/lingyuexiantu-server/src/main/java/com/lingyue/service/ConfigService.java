package com.lingyue.service;

import com.lingyue.entity.CfgEquipmentQuality;
import com.lingyue.entity.CfgNumericalRules;
import com.lingyue.entity.CfgPillEffect;
import com.lingyue.entity.CfgRealmBreakthrough;
import com.lingyue.entity.CfgSkillUpgrade;
import com.lingyue.repository.CfgEquipmentQualityRepository;
import com.lingyue.repository.CfgNumericalRulesRepository;
import com.lingyue.repository.CfgPillEffectRepository;
import com.lingyue.repository.CfgRealmBreakthroughRepository;
import com.lingyue.repository.CfgSkillUpgradeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ConfigService {
    
    @Autowired
    private CfgNumericalRulesRepository configRepository;
    
    @Autowired
    private CfgRealmBreakthroughRepository realmBreakthroughRepository;
    
    @Autowired
    private CfgEquipmentQualityRepository equipmentQualityRepository;
    
    @Autowired
    private CfgPillEffectRepository pillEffectRepository;
    
    @Autowired
    private CfgSkillUpgradeRepository skillUpgradeRepository;
    
    public CfgNumericalRules getConfig(String configKey) {
        return configRepository.findById(configKey).orElse(null);
    }
    
    public List<CfgNumericalRules> getAllConfigs() {
        return configRepository.findAll();
    }
    
    public CfgNumericalRules updateConfig(String configKey, String content, String description, String updatedBy) {
        CfgNumericalRules config = configRepository.findById(configKey).orElse(null);
        if (config == null) {
            config = new CfgNumericalRules(configKey, 1, content, description, updatedBy);
        } else {
            config.setContent(content);
            config.setDescription(description);
            config.setUpdatedBy(updatedBy);
            config.setConfigVersion(config.getConfigVersion() + 1);
        }
        config.setUpdatedAt(LocalDateTime.now());
        return configRepository.save(config);
    }
    
    public void deleteConfig(String configKey) {
        configRepository.deleteById(configKey);
    }
    
    public CfgNumericalRules createConfig(String configKey, String content, String description, String updatedBy) {
        CfgNumericalRules config = new CfgNumericalRules(configKey, 1, content, description, updatedBy);
        config.setUpdatedAt(LocalDateTime.now());
        return configRepository.save(config);
    }
    
    // 境界突破相关方法
    @Cacheable(value = "realmBreakthrough", key = "#fromRealm")
    public Optional<CfgRealmBreakthrough> getRealmBreakthrough(String fromRealm) {
        return realmBreakthroughRepository.findByFromRealm(fromRealm);
    }
    
    @Cacheable(value = "realmBreakthrough", key = "#fromRealm + '-' + #toRealm")
    public Optional<CfgRealmBreakthrough> getRealmBreakthrough(String fromRealm, String toRealm) {
        return realmBreakthroughRepository.findByFromRealmAndToRealm(fromRealm, toRealm);
    }
    
    @Cacheable(value = "realmBreakthroughs")
    public List<CfgRealmBreakthrough> getAllRealmBreakthroughs() {
        return realmBreakthroughRepository.findAll();
    }
    
    // 装备品质相关方法
    @Cacheable(value = "equipmentQuality", key = "#quality")
    public Optional<CfgEquipmentQuality> getEquipmentQuality(String quality) {
        return equipmentQualityRepository.findByQuality(quality);
    }
    
    @Cacheable(value = "equipmentQualities")
    public List<CfgEquipmentQuality> getAllEquipmentQualities() {
        return equipmentQualityRepository.findAll();
    }
    
    // 丹药效果相关方法
    @Cacheable(value = "pillEffect", key = "#pillName")
    public Optional<CfgPillEffect> getPillEffect(String pillName) {
        return pillEffectRepository.findByPillName(pillName);
    }
    
    @Cacheable(value = "pillEffects")
    public List<CfgPillEffect> getAllPillEffects() {
        return pillEffectRepository.findAll();
    }
    
    // 技能升级相关方法
    @Cacheable(value = "skillUpgrade", key = "#skillLevel")
    public Optional<CfgSkillUpgrade> getSkillUpgrade(String skillLevel) {
        return skillUpgradeRepository.findBySkillLevel(skillLevel);
    }
    
    @Cacheable(value = "skillUpgrades")
    public List<CfgSkillUpgrade> getAllSkillUpgrades() {
        return skillUpgradeRepository.findAll();
    }
    
    // 缓存管理方法
    @CacheEvict(value = {"realmBreakthrough", "realmBreakthroughs", "equipmentQuality", "equipmentQualities", "pillEffect", "pillEffects", "skillUpgrade", "skillUpgrades"}, allEntries = true)
    public void refreshCache() {
        // 清空所有缓存
    }
    
    @CacheEvict(value = {"realmBreakthrough", "realmBreakthroughs", "equipmentQuality", "equipmentQualities", "pillEffect", "pillEffects", "skillUpgrade", "skillUpgrades"}, allEntries = true)
    public void clearCache() {
        // 清空所有缓存
    }
}