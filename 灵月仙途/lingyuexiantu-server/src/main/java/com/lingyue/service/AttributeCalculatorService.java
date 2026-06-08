package com.lingyue.service;

import com.lingyue.entity.*;
import com.lingyue.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 属性计算服务（混合策略）
 * 核心思想：
 * - 数据库存储基础属性（原材料）和计算规则
 * - 缓存存储实时计算结果
 * - 触发事件：装备变化、技能升级、Buff 变化时重新计算
 */
@Service
public class AttributeCalculatorService {
    
    private static final Logger logger = LoggerFactory.getLogger(AttributeCalculatorService.class);
    
    @Autowired
    private CfgAttributeRuleRepository attributeRuleRepository;
    
    @Autowired
    private CfgRealmAttributeMultRepository realmAttributeMultRepository;
    
    @Autowired
    private PlayerStatsBaseRepository playerStatsBaseRepository;
    
    @Autowired
    private RoleAttributeCacheRepository attributeCacheRepository;
    
    @Autowired
    private RoleEquipmentRepository roleEquipmentRepository;
    
    @Autowired
    private EquipmentRepository equipmentRepository;
    
    @Autowired
    private RoleBaseStatsRepository roleBaseStatsRepository;
    
    @Autowired
    private GameRoleRepository gameRoleRepository;
    
    @Autowired(required = false)
    private TitleAttributeService titleAttributeService;
    
    /**
     * 计算角色属性（核心计算方法）
     * 计算公式：
     * - HP = (根骨 × 100) × 境界血量系数
     * - ATK = (灵力 × 8 + 根骨 × 1) × 境界攻击系数
     * - DEF = (根骨 × 5 + 身法 × 2) × 境界防御系数
     * - Speed = 身法 × 10
     * - Crit Rate = (气运 × 0.1% + 灵力 × 0.02%)
     * - Dodge Rate = (身法 × 0.5%)
     * - Exp Bonus = 1.0 + (悟性 × 1%)
     */
    @Transactional
    public RoleAttributeCache calculateAttributes(Long roleId) {
        logger.info("开始计算角色属性，roleId={}", roleId);
        
        // 1. 获取角色基础属性数据（优先从PlayerStatsBase，回退到RoleBaseStats）
        PlayerStatsBase stats = playerStatsBaseRepository.findByRoleId(roleId).orElse(null);
        
        if (stats == null) {
            logger.info("PlayerStatsBase不存在，尝试从RoleBaseStats回退，roleId={}", roleId);
            stats = createStatsFromRoleBaseStats(roleId);
        }
        
        if (stats == null) {
            logger.warn("角色属性数据不存在，无法计算，roleId={}", roleId);
            return null;
        }
        
        // 2. 获取境界倍率（从配置表读取）
        CfgRealmAttributeMult realmMult = realmAttributeMultRepository.findByRealmLevel(stats.getRealmLevel())
            .orElseGet(() -> realmAttributeMultRepository.findByRealmLevel(0).orElse(null));
        
        if (realmMult == null) {
            logger.warn("未找到境界倍率配置，使用默认值，realmLevel={}", stats.getRealmLevel());
            realmMult = createDefaultRealmMult();
        }
        
        // 3. 获取属性计算规则（从配置表读取系数）
        List<CfgAttributeRule> rules = attributeRuleRepository.findByIsActiveTrue();
        Map<String, CfgAttributeRule> ruleMap = new HashMap<>();
        for (CfgAttributeRule rule : rules) {
            ruleMap.put(rule.getRuleKey(), rule);
        }
        
        // 4. 计算总属性（基础 + 永久 + 临时 + 境界加成）
        int realmVitBonus = realmMult.getVitBonus() != null ? realmMult.getVitBonus() : 0;
        int realmSpiBonus = realmMult.getSpiBonus() != null ? realmMult.getSpiBonus() : 0;
        int realmAgiBonus = realmMult.getAgiBonus() != null ? realmMult.getAgiBonus() : 0;
        int realmWisBonus = realmMult.getWisBonus() != null ? realmMult.getWisBonus() : 0;
        int realmLckBonus = realmMult.getLckBonus() != null ? realmMult.getLckBonus() : 0;
        
        int totalVit = stats.getBaseVit() + stats.getPermVit() + stats.getTmpVit() + realmVitBonus;
        int totalSpi = stats.getBaseSpi() + stats.getPermSpi() + stats.getTmpSpi() + realmSpiBonus;
        int totalAgi = stats.getBaseAgi() + stats.getPermAgi() + stats.getTmpAgi() + realmAgiBonus;
        int totalWis = stats.getBaseWis() + stats.getPermWis() + stats.getTmpWis() + realmWisBonus;
        int totalLck = stats.getBaseLck() + stats.getPermLck() + stats.getTmpLck() + realmLckBonus;
        
        logger.debug("总属性：vit={}, spi={}, agi={}, wis={}, lck={}", 
            totalVit, totalSpi, totalAgi, totalWis, totalLck);
        
        // 5. 应用计算公式
        // HP = (根骨 × 100) × 境界血量系数
        BigDecimal hpBase = getRuleValue(ruleMap, "hp_base", BigDecimal.valueOf(100));
        BigDecimal hp = BigDecimal.valueOf(totalVit).multiply(hpBase)
            .multiply(realmMult.getHpMult());
        
        // ATK = (灵力 × 8 + 根骨 × 1) × 境界攻击系数
        BigDecimal atkSpiCoeff = getRuleValue(ruleMap, "atk_spi_coeff", BigDecimal.valueOf(8));
        BigDecimal atkVitCoeff = getRuleValue(ruleMap, "atk_vit_coeff", BigDecimal.valueOf(1));
        BigDecimal atk = BigDecimal.valueOf(totalSpi).multiply(atkSpiCoeff)
            .add(BigDecimal.valueOf(totalVit).multiply(atkVitCoeff))
            .multiply(realmMult.getAtkMult());
        
        // DEF = (根骨 × 5 + 身法 × 2) × 境界防御系数
        BigDecimal defVitCoeff = getRuleValue(ruleMap, "def_vit_coeff", BigDecimal.valueOf(5));
        BigDecimal defAgiCoeff = getRuleValue(ruleMap, "def_agi_coeff", BigDecimal.valueOf(2));
        BigDecimal def = BigDecimal.valueOf(totalVit).multiply(defVitCoeff)
            .add(BigDecimal.valueOf(totalAgi).multiply(defAgiCoeff))
            .multiply(realmMult.getDefMult());
        
        // Speed = 身法 × 10
        BigDecimal speedCoeff = getRuleValue(ruleMap, "speed_coeff", BigDecimal.valueOf(10));
        BigDecimal speed = BigDecimal.valueOf(totalAgi).multiply(speedCoeff)
            .multiply(realmMult.getSpeedMult());
        
        // Crit Rate = (气运 × 0.1% + 灵力 × 0.02%)
        BigDecimal critLckCoeff = getRuleValue(ruleMap, "crit_lck_coeff", BigDecimal.valueOf(0.001));
        BigDecimal critSpiCoeff = getRuleValue(ruleMap, "crit_spi_coeff", BigDecimal.valueOf(0.0002));
        BigDecimal crit = BigDecimal.valueOf(totalLck).multiply(critLckCoeff)
            .add(BigDecimal.valueOf(totalSpi).multiply(critSpiCoeff))
            .multiply(realmMult.getCritMult())
            .multiply(BigDecimal.valueOf(100)); // 转换为百分比
        
        // Dodge Rate = (身法 × 0.5%)
        BigDecimal dodgeCoeff = getRuleValue(ruleMap, "dodge_coeff", BigDecimal.valueOf(0.005));
        BigDecimal dodge = BigDecimal.valueOf(totalAgi).multiply(dodgeCoeff)
            .multiply(realmMult.getDodgeMult())
            .multiply(BigDecimal.valueOf(100));
        
        // Crit Damage = 150% + (灵力 × 0.5%)
        BigDecimal critDmgBase = getRuleValue(ruleMap, "crit_dmg_base", BigDecimal.valueOf(150));
        BigDecimal critDmgSpiCoeff = getRuleValue(ruleMap, "crit_dmg_spi_coeff", BigDecimal.valueOf(0.5));
        BigDecimal critDmg = critDmgBase.add(BigDecimal.valueOf(totalSpi).multiply(critDmgSpiCoeff));
        
        // Hit Rate = 100% + (悟性 × 0.3%)
        BigDecimal hitRateBase = getRuleValue(ruleMap, "hit_rate_base", BigDecimal.valueOf(100));
        BigDecimal hitRateWisCoeff = getRuleValue(ruleMap, "hit_rate_wis_coeff", BigDecimal.valueOf(0.3));
        BigDecimal hitRate = hitRateBase.add(BigDecimal.valueOf(totalWis).multiply(hitRateWisCoeff));
        
        // Tenacity = (根骨 × 0.2%)
        BigDecimal tenacityCoeff = getRuleValue(ruleMap, "tenacity_coeff", BigDecimal.valueOf(0.2));
        BigDecimal tenacity = BigDecimal.valueOf(totalVit).multiply(tenacityCoeff);
        
        // Exp Bonus = 1.0 + (悟性 × 1%)
        BigDecimal expBase = getRuleValue(ruleMap, "exp_base", BigDecimal.ONE);
        BigDecimal expWisCoeff = getRuleValue(ruleMap, "exp_wis_coeff", BigDecimal.valueOf(0.01));
        BigDecimal expBonus = expBase.add(BigDecimal.valueOf(totalWis).multiply(expWisCoeff))
            .multiply(realmMult.getExpMult());
        
        // 6. 计算装备加成
        int equipAttack = 0;
        int equipDefense = 0;
        int equipHpBonus = 0;
        int equipMpBonus = 0;
        Map<String, Object> equipmentBonusMap = new HashMap<>();
        
        try {
            List<RoleEquipment> equippedItems = roleEquipmentRepository.findByRoleIdAndStatus(roleId, 1);
            for (RoleEquipment roleEquip : equippedItems) {
                Optional<Equipment> equipOpt = equipmentRepository.findById(roleEquip.getEquipmentId());
                if (equipOpt.isPresent()) {
                    Equipment equip = equipOpt.get();
                    int eAtk = equip.getAttack() != null ? equip.getAttack() : 0;
                    int eDef = equip.getDefense() != null ? equip.getDefense() : 0;
                    int eHpB = equip.getHpBonus() != null ? equip.getHpBonus() : 0;
                    int eMpB = equip.getMpBonus() != null ? equip.getMpBonus() : 0;
                    equipAttack += eAtk;
                    equipDefense += eDef;
                    equipHpBonus += eHpB;
                    equipMpBonus += eMpB;
                    
                    Map<String, Object> equipInfo = new HashMap<>();
                    equipInfo.put("name", equip.getName());
                    equipInfo.put("slot", roleEquip.getSlot());
                    equipInfo.put("attack", eAtk);
                    equipInfo.put("defense", eDef);
                    equipInfo.put("hpBonus", eHpB);
                    equipInfo.put("mpBonus", eMpB);
                    equipmentBonusMap.put("slot_" + roleEquip.getSlot(), equipInfo);
                }
            }
        } catch (Exception e) {
            logger.warn("查询装备加成失败，roleId={}, error={}", roleId, e.getMessage());
        }
        
        logger.debug("装备加成：attack={}, defense={}, hpBonus={}, mpBonus={}", 
            equipAttack, equipDefense, equipHpBonus, equipMpBonus);
        
        // 6.5 计算称号加成
        long titleAttack = 0;
        long titleDefense = 0;
        long titleHpBonus = 0;
        
        if (titleAttributeService != null) {
            try {
                Map<String, Long> titleBonus = titleAttributeService.calculateTitleBonus(roleId);
                if (titleBonus != null) {
                    titleAttack = titleBonus.getOrDefault("attack", 0L);
                    titleDefense = titleBonus.getOrDefault("defense", 0L);
                    titleHpBonus = titleBonus.getOrDefault("hp", 0L);
                    logger.debug("称号加成：attack={}, defense={}, hpBonus={}", titleAttack, titleDefense, titleHpBonus);
                }
            } catch (Exception e) {
                logger.debug("称号加成计算失败，roleId={}, error={}", roleId, e.getMessage());
            }
        }
        
        // 7. 创建或更新属性缓存（存储实时计算结果）
        RoleAttributeCache cache = attributeCacheRepository.findById(roleId).orElse(null);
        
        if (cache == null) {
            cache = new RoleAttributeCache();
            cache.setRoleId(roleId);
        }
        
        // 设置计算结果（基础属性 + 装备加成）
        long finalHp = hp.longValue() + equipHpBonus + titleHpBonus;
        long finalMp = BigDecimal.valueOf(totalSpi * 50).longValue() + equipMpBonus;
        long finalAtk = atk.longValue() + equipAttack + titleAttack;
        long finalDef = def.longValue() + equipDefense + titleDefense;
        
        cache.setHpMax(finalHp);
        if (cache.getHp() == null || cache.getHp() <= 0 || cache.getHp() > finalHp) {
            cache.setHp(finalHp);
        }
        cache.setMpMax(finalMp);
        if (cache.getMp() == null || cache.getMp() <= 0 || cache.getMp() > finalMp) {
            cache.setMp(finalMp);
        }
        cache.setAtk(finalAtk);
        cache.setDef(finalDef);
        cache.setSpeed(speed.longValue());
        cache.setCritRate(applyRange(crit.setScale(4, RoundingMode.HALF_UP), ruleMap, "crit_rate"));
        cache.setCritDmg(applyRange(critDmg.setScale(4, RoundingMode.HALF_UP), ruleMap, "crit_dmg"));
        cache.setDodgeRate(applyRange(dodge.setScale(4, RoundingMode.HALF_UP), ruleMap, "dodge_rate"));
        cache.setHitRate(applyRange(hitRate.setScale(4, RoundingMode.HALF_UP), ruleMap, "hit_rate"));
        cache.setTenacity(applyRange(tenacity.setScale(4, RoundingMode.HALF_UP), ruleMap, "tenacity"));
        cache.setExpBonus(expBonus.setScale(4, RoundingMode.HALF_UP));
        
        // 保存总属性
        cache.setTotalVit(totalVit);
        cache.setTotalSpi(totalSpi);
        cache.setTotalAgi(totalAgi);
        cache.setTotalWis(totalWis);
        cache.setTotalLck(totalLck);
        
        cache.setRealmLevel(stats.getRealmLevel());
        try {
            String realmName = realmMult.getRealmName() != null ? realmMult.getRealmName() : "凡人";
            cache.setRealmName(realmName);
        } catch (Exception e) {
            cache.setRealmName("凡人");
        }
        
        // 保存装备加成JSON
        try {
            cache.setEquipmentBonus(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(equipmentBonusMap));
        } catch (Exception e) {
            cache.setEquipmentBonus("{}");
        }
        
        // 更新计算版本和时间（用于缓存失效）
        long newVersion = System.currentTimeMillis();
        cache.setCalcVersion(newVersion);
        cache.setCalculatedAt(LocalDateTime.now());
        cache.setUpdatedAt(LocalDateTime.now());
        
        // 保存到数据库（缓存）
        attributeCacheRepository.save(cache);
        
        logger.info("属性计算完成，roleId={}, version={}, hp={}, atk={}, def={}, crit={}%, dodge={}%",
            roleId, newVersion, cache.getHpMax(), cache.getAtk(), cache.getDef(), 
            cache.getCritRate(), cache.getDodgeRate());
        
        return cache;
    }
    
    /**
     * 从缓存获取属性（如果缓存不存在或失效则重新计算）
     * @param roleId 角色 ID
     * @param forceRecalculate 是否强制重新计算
     * @return 属性缓存对象
     */
    public RoleAttributeCache getAttributes(Long roleId, boolean forceRecalculate) {
        logger.debug("获取角色属性，roleId={}, forceRecalculate={}", roleId, forceRecalculate);
        
        if (forceRecalculate) {
            return calculateAttributes(roleId);
        }
        
        // 检查缓存
        Optional<RoleAttributeCache> cacheOpt = attributeCacheRepository.findById(roleId);
        
        if (cacheOpt.isPresent()) {
            RoleAttributeCache cache = cacheOpt.get();
            
            // 检查缓存是否有效（可以根据 calc_version 或时间判断）
            if (cache.getCalcVersion() != null && cache.getCalcVersion() > 0) {
                logger.debug("使用缓存属性，roleId={}, version={}", roleId, cache.getCalcVersion());
                return cache;
            }
        }
        
        // 缓存不存在或失效，重新计算
        logger.info("缓存不存在或失效，重新计算属性，roleId={}", roleId);
        return calculateAttributes(roleId);
    }
    
    /**
     * 获取属性（不强制重新计算）
     */
    public RoleAttributeCache getAttributes(Long roleId) {
        return getAttributes(roleId, false);
    }
    
    /**
     * 清除属性缓存（当装备、技能等变化时调用）
     * 触发重新计算的事件：
     * 1. 装备穿戴/卸下
     * 2. 技能升级
     * 3. Buff/Debuff 变化
     * 4. 在线状态变化（玩家上线）
     */
    public void clearCache(Long roleId) {
        logger.info("清除属性缓存，roleId={}", roleId);
        attributeCacheRepository.deleteById(roleId);
    }
    
    /**
     * 从规则 Map 中获取规则值
     */
    private BigDecimal getRuleValue(Map<String, CfgAttributeRule> ruleMap, String ruleKey, BigDecimal defaultValue) {
        CfgAttributeRule rule = ruleMap.get(ruleKey);
        if (rule != null) {
            return rule.getCoeffValue() != null ? rule.getCoeffValue() : 
                   rule.getBaseValue() != null ? rule.getBaseValue() : defaultValue;
        }
        return defaultValue;
    }
    
    private BigDecimal applyRange(BigDecimal value, Map<String, CfgAttributeRule> ruleMap, String attributeType) {
        for (CfgAttributeRule rule : ruleMap.values()) {
            if (attributeType.equals(rule.getAttributeType()) && Boolean.TRUE.equals(rule.getIsActive())) {
                if (rule.getMinValue() != null && value.compareTo(rule.getMinValue()) < 0) {
                    return rule.getMinValue();
                }
                if (rule.getMaxValue() != null && value.compareTo(rule.getMaxValue()) > 0) {
                    return rule.getMaxValue();
                }
                break;
            }
        }
        return value;
    }
    
    /**
     * 获取境界最大年龄
     * @param realmLevel 境界等级
     * @return 最大年龄
     */
    public int getRealmMaxAge(int realmLevel) {
        return realmAttributeMultRepository.findByRealmLevel(realmLevel)
            .map(CfgRealmAttributeMult::getMaxAge)
            .orElse(100); // 默认凡人 100 岁
    }
    
    /**
     * 创建默认境界倍率（当配置表中找不到时使用）
     */
    private CfgRealmAttributeMult createDefaultRealmMult() {
        CfgRealmAttributeMult mult = new CfgRealmAttributeMult();
        mult.setHpMult(BigDecimal.ONE);
        mult.setAtkMult(BigDecimal.ONE);
        mult.setDefMult(BigDecimal.ONE);
        mult.setSpeedMult(BigDecimal.ONE);
        mult.setCritMult(BigDecimal.ONE);
        mult.setDodgeMult(BigDecimal.ONE);
        mult.setExpMult(BigDecimal.ONE);
        mult.setMaxAge(100);
        return mult;
    }
    
    private PlayerStatsBase createStatsFromRoleBaseStats(Long roleId) {
        try {
            int baseVit = 10, baseSpi = 10, baseAgi = 10, baseWis = 10, baseLck = 5;
            
            Optional<RoleBaseStats> roleBaseStatsOpt = roleBaseStatsRepository.findByRoleId(roleId);
            if (roleBaseStatsOpt.isPresent()) {
                RoleBaseStats roleBaseStats = roleBaseStatsOpt.get();
                baseVit = roleBaseStats.getVit() != null ? roleBaseStats.getVit() : 10;
                baseSpi = roleBaseStats.getSpi() != null ? roleBaseStats.getSpi() : 10;
                baseAgi = roleBaseStats.getAgi() != null ? roleBaseStats.getAgi() : 10;
                baseWis = roleBaseStats.getWis() != null ? roleBaseStats.getWis() : 10;
                baseLck = roleBaseStats.getLck() != null ? roleBaseStats.getLck() : 5;
            } else {
                logger.info("RoleBaseStats不存在，使用默认值创建PlayerStatsBase，roleId={}", roleId);
            }
            
            int realmLevel = 0;
            try {
                GameRole role = gameRoleRepository.findById(roleId).orElse(null);
                if (role != null) {
                    if (role.getRealmLevel() != null && role.getRealmLevel() > 0) {
                        realmLevel = role.getRealmLevel();
                    } else if (role.getRealm() != null) {
                        String realm = role.getRealm();
                        if (realm.contains("炼气")) realmLevel = 1;
                        else if (realm.contains("筑基")) realmLevel = 2;
                        else if (realm.contains("金丹")) realmLevel = 3;
                        else if (realm.contains("元婴")) realmLevel = 4;
                        else if (realm.contains("化神")) realmLevel = 5;
                        else if (realm.contains("炼虚")) realmLevel = 6;
                        else if (realm.contains("合体")) realmLevel = 7;
                        else if (realm.contains("大乘")) realmLevel = 8;
                        else if (realm.contains("渡劫")) realmLevel = 9;
                    }
                }
            } catch (Exception e) {
                logger.debug("获取角色境界失败，使用默认值0，roleId={}", roleId);
            }
            
            PlayerStatsBase stats = new PlayerStatsBase();
            stats.setRoleId(roleId);
            stats.setPlayerId(roleId);
            stats.setBaseVit(baseVit);
            stats.setBaseSpi(baseSpi);
            stats.setBaseAgi(baseAgi);
            stats.setBaseWis(baseWis);
            stats.setBaseLck(baseLck);
            stats.setPermVit(0);
            stats.setPermSpi(0);
            stats.setPermAgi(0);
            stats.setPermWis(0);
            stats.setPermLck(0);
            stats.setTmpVit(0);
            stats.setTmpSpi(0);
            stats.setTmpAgi(0);
            stats.setTmpWis(0);
            stats.setTmpLck(0);
            stats.setRealmLevel(realmLevel);
            stats.setRealmStage(1);
            stats.setExpCurr(0L);
            stats.setExpMax(1000L);
            stats.setCultivationSpeed(1.0);
            
            stats = playerStatsBaseRepository.save(stats);
            logger.info("创建PlayerStatsBase成功，roleId={}, realmLevel={}, vit={}, spi={}, agi={}, wis={}, lck={}", 
                roleId, realmLevel, baseVit, baseSpi, baseAgi, baseWis, baseLck);
            return stats;
        } catch (Exception e) {
            logger.warn("创建PlayerStatsBase失败，roleId={}, error={}", roleId, e.getMessage());
            return null;
        }
    }
}
