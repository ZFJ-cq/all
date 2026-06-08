package com.lingyue.service;

import com.lingyue.entity.CultivationTechnique;
import com.lingyue.entity.UserTechnique;
import com.lingyue.repository.CultivationTechniqueRepository;
import com.lingyue.repository.UserTechniqueRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class TechniqueService {
    
    private static final Logger logger = LoggerFactory.getLogger(TechniqueService.class);
    
    private final CultivationTechniqueRepository cultivationTechniqueRepository;
    private final UserTechniqueRepository userTechniqueRepository;
    
    @Autowired
    public TechniqueService(CultivationTechniqueRepository cultivationTechniqueRepository,
                          UserTechniqueRepository userTechniqueRepository) {
        this.cultivationTechniqueRepository = cultivationTechniqueRepository;
        this.userTechniqueRepository = userTechniqueRepository;
    }
    
    /**
     * 获取所有可用的功法
     */
    public List<CultivationTechnique> getAllTechniques() {
        return cultivationTechniqueRepository.findByIsActiveTrue();
    }
    
    /**
     * 获取用户拥有的所有功法
     */
    public List<UserTechnique> getUserTechniques(Long userId) {
        return userTechniqueRepository.findByUserId(userId);
    }
    
    /**
     * 获取用户已装备的功法
     */
    public List<UserTechnique> getEquippedTechniques(Long roleId) {
        return userTechniqueRepository.findByRoleIdAndIsEquippedTrue(roleId);
    }
    
    /**
     * 计算用户的功法总加成
     * 返回：{speedPercentage, speedFlat, limitBonus}
     */
    public Map<String, Object> calculateTotalBonus(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        List<UserTechnique> equippedTechniques = getEquippedTechniques(roleId);
        
        double totalSpeedPercentage = 0.0;
        int totalSpeedFlat = 0;
        long totalLimitBonus = 0;
        
        for (UserTechnique ut : equippedTechniques) {
            CultivationTechnique technique = cultivationTechniqueRepository.findById(ut.getTechniqueId()).orElse(null);
            if (technique != null && technique.getIsActive()) {
                totalSpeedPercentage += technique.getSpeedAddition() != null ? technique.getSpeedAddition() : 0.0;
                totalSpeedFlat += technique.getSpeedAdditionFlat() != null ? technique.getSpeedAdditionFlat() : 0;
                totalLimitBonus += technique.getLimitAddition() != null ? technique.getLimitAddition() : 0L;
            }
        }
        
        result.put("speedPercentage", totalSpeedPercentage);
        result.put("speedFlat", totalSpeedFlat);
        result.put("limitBonus", totalLimitBonus);
        result.put("equippedCount", equippedTechniques.size());
        
        return result;
    }
    
    /**
     * 获取用户的功法加成详情
     */
    public Map<String, Object> getTechniqueBonusDetail(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        List<UserTechnique> equippedTechniques = getEquippedTechniques(roleId);
        Map<String, Object> totalBonus = calculateTotalBonus(roleId);
        
        result.put("totalBonus", totalBonus);
        
        List<Map<String, Object>> techniqueDetails = new java.util.ArrayList<>();
        for (UserTechnique ut : equippedTechniques) {
            CultivationTechnique technique = cultivationTechniqueRepository.findById(ut.getTechniqueId()).orElse(null);
            if (technique != null) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("techniqueId", technique.getId());
                detail.put("techniqueName", technique.getName());
                detail.put("rarity", technique.getRarity() != null ? technique.getRarity().name() : "COMMON");
                detail.put("speedAddition", technique.getSpeedAddition());
                detail.put("speedAdditionFlat", technique.getSpeedAdditionFlat());
                detail.put("limitAddition", technique.getLimitAddition());
                techniqueDetails.add(detail);
            }
        }
        
        result.put("techniques", techniqueDetails);
        
        return result;
    }
    
    /**
     * 学习功法
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> learnTechnique(Long userId, Long roleId, Long techniqueId) {
        Map<String, Object> result = new HashMap<>();
        
        // 检查功法是否存在
        CultivationTechnique technique = cultivationTechniqueRepository.findById(techniqueId).orElse(null);
        if (technique == null || !technique.getIsActive()) {
            result.put("success", false);
            result.put("message", "功法不存在");
            return result;
        }
        
        // 检查是否已经学习
        if (userTechniqueRepository.findByUserIdAndTechniqueId(userId, techniqueId).isPresent()) {
            result.put("success", false);
            result.put("message", "已经学习过该功法");
            return result;
        }
        
        // 创建学习记录
        UserTechnique userTechnique = new UserTechnique(userId, roleId, techniqueId);
        userTechniqueRepository.save(userTechnique);
        
        logger.info("用户 {} 学习了功法 {}", userId, technique.getName());
        
        result.put("success", true);
        result.put("message", "学习成功");
        result.put("techniqueId", techniqueId);
        
        return result;
    }
    
    /**
     * 装备功法
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> equipTechnique(Long userId, Long roleId, Long techniqueId) {
        Map<String, Object> result = new HashMap<>();
        
        // 检查是否拥有该功法
        UserTechnique userTechnique = userTechniqueRepository.findByUserIdAndTechniqueId(userId, techniqueId).orElse(null);
        if (userTechnique == null) {
            result.put("success", false);
            result.put("message", "未拥有该功法");
            return result;
        }
        
        // 检查是否已经装备
        if (userTechnique.getIsEquipped()) {
            result.put("success", false);
            result.put("message", "该功法已装备");
            return result;
        }
        
        // 更新装备状态
        userTechnique.setIsEquipped(true);
        userTechnique.setEquippedAt(LocalDateTime.now());
        userTechniqueRepository.save(userTechnique);
        
        logger.info("用户 {} 装备了功法 {}", userId, techniqueId);
        
        result.put("success", true);
        result.put("message", "装备成功");
        
        return result;
    }
    
    /**
     * 卸下功法
     */
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> unequipTechnique(Long userId, Long roleId, Long techniqueId) {
        Map<String, Object> result = new HashMap<>();
        
        UserTechnique userTechnique = userTechniqueRepository.findByUserIdAndTechniqueId(userId, techniqueId).orElse(null);
        if (userTechnique == null) {
            result.put("success", false);
            result.put("message", "未拥有该功法");
            return result;
        }
        
        if (!userTechnique.getIsEquipped()) {
            result.put("success", false);
            result.put("message", "该功法未装备");
            return result;
        }
        
        userTechnique.setIsEquipped(false);
        userTechnique.setUnequippedAt(LocalDateTime.now());
        userTechniqueRepository.save(userTechnique);
        
        logger.info("用户 {} 卸下了功法 {}", userId, techniqueId);
        
        result.put("success", true);
        result.put("message", "卸下成功");
        
        return result;
    }
}