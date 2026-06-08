package com.lingyue.controller;

import com.lingyue.dto.AttributeDTO;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RoleAttributeCache;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.service.AttributeCalculatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * 属性计算控制器
 */
@RestController
@CrossOrigin(originPatterns = "*", maxAge = 3600)
@RequestMapping("/attributes")
public class AttributeController {
    
    private static final Logger logger = LoggerFactory.getLogger(AttributeController.class);
    
    @Autowired
    private AttributeCalculatorService attributeCalculatorService;
    
    @Autowired
    private GameRoleRepository gameRoleRepository;
    
    /**
     * 获取角色属性
     * @param roleId 角色 ID
     * @param forceRecalculate 是否强制重新计算
     * @return 角色属性数据
     */
    @GetMapping("/{roleId}")
    public ResponseEntity<Map<String, Object>> getAttributes(
            @PathVariable Long roleId,
            @RequestParam(defaultValue = "false") boolean forceRecalculate) {
        
        logger.info("获取角色属性，roleId={}, forceRecalculate={}", roleId, forceRecalculate);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            RoleAttributeCache cache = attributeCalculatorService.getAttributes(roleId, forceRecalculate);
            
            if (cache == null) {
                response.put("success", false);
                response.put("message", "角色属性数据不存在，请先创建角色");
                return ResponseEntity.ok(response);
            }
            
            AttributeDTO dto = convertToDTO(cache, roleId);
            
            response.put("success", true);
            response.put("data", dto);
            response.put("message", "获取属性成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("获取属性失败，roleId={}", roleId, e);
            response.put("success", false);
            response.put("message", "获取属性失败：" + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 重新计算角色属性（当装备、技能变化时调用）
     * @param roleId 角色 ID
     * @return 计算结果
     */
    @PostMapping("/{roleId}/recalculate")
    public ResponseEntity<Map<String, Object>> recalculateAttributes(@PathVariable Long roleId) {
        logger.info("重新计算角色属性，roleId={}", roleId);
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 强制重新计算
            RoleAttributeCache cache = attributeCalculatorService.calculateAttributes(roleId);
            
            // 转换为 DTO
            AttributeDTO dto = convertToDTO(cache, roleId);
            
            response.put("success", true);
            response.put("data", dto);
            response.put("message", "重新计算成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("重新计算属性失败，roleId={}", roleId, e);
            response.put("success", false);
            response.put("message", "重新计算属性失败：" + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 获取境界最大年龄
     * @param realmLevel 境界等级
     * @return 最大年龄
     */
    @GetMapping("/realm-max-age/{realmLevel}")
    public ResponseEntity<Map<String, Object>> getRealmMaxAge(@PathVariable Integer realmLevel) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            int maxAge = attributeCalculatorService.getRealmMaxAge(realmLevel);
            
            response.put("success", true);
            response.put("data", maxAge);
            response.put("message", "获取境界最大年龄成功");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("获取境界最大年龄失败，realmLevel={}", realmLevel, e);
            response.put("success", false);
            response.put("message", "获取境界最大年龄失败：" + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * 转换为 DTO
     */
    private AttributeDTO convertToDTO(RoleAttributeCache cache, Long roleId) {
        AttributeDTO dto = new AttributeDTO();
        
        dto.setRoleId(roleId);
        dto.setHp(cache.getHp() != null ? cache.getHp() : 0L);
        dto.setHpMax(cache.getHpMax() != null ? cache.getHpMax() : 0L);
        dto.setMp(cache.getMp() != null ? cache.getMp() : 0L);
        dto.setMpMax(cache.getMpMax() != null ? cache.getMpMax() : 0L);
        dto.setAtk(cache.getAtk() != null ? cache.getAtk() : 0L);
        dto.setDef(cache.getDef() != null ? cache.getDef() : 0L);
        dto.setSpeed(cache.getSpeed() != null ? cache.getSpeed() : 0L);
        dto.setCritRate(cache.getCritRate() != null ? cache.getCritRate() : BigDecimal.ZERO);
        dto.setCritDmg(cache.getCritDmg() != null ? cache.getCritDmg() : BigDecimal.valueOf(150));
        dto.setDodgeRate(cache.getDodgeRate() != null ? cache.getDodgeRate() : BigDecimal.ZERO);
        dto.setHitRate(cache.getHitRate() != null ? cache.getHitRate() : BigDecimal.valueOf(100));
        dto.setTenacity(cache.getTenacity() != null ? cache.getTenacity() : BigDecimal.ZERO);
        dto.setExpBonus(cache.getExpBonus() != null ? cache.getExpBonus() : BigDecimal.ONE);
        
        dto.setTotalVit(cache.getTotalVit());
        dto.setTotalSpi(cache.getTotalSpi());
        dto.setTotalAgi(cache.getTotalAgi());
        dto.setTotalWis(cache.getTotalWis());
        dto.setTotalLck(cache.getTotalLck());
        
        dto.setRealmLevel(cache.getRealmLevel());
        dto.setRealmName(cache.getRealmName() != null ? cache.getRealmName() : "凡人");
        
        // 获取寿命信息
        Optional<GameRole> roleOpt = gameRoleRepository.findById(roleId);
        if (roleOpt.isPresent()) {
            GameRole role = roleOpt.get();
            dto.setAge(role.getAge() != null ? role.getAge() : 18);
            dto.setMaxAge(role.getMaxAge() != null ? role.getMaxAge() : 100);
            dto.setLifeStatus(role.getLifeStatus() != null ? role.getLifeStatus() : 0);
        }
        
        return dto;
    }
}
