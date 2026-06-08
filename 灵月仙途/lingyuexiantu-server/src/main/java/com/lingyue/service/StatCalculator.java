package com.lingyue.service;

import com.lingyue.dto.DerivedStats;
import com.lingyue.entity.PlayerStatsBase;
import com.lingyue.entity.CfgNumericalRules;
import com.lingyue.repository.CfgNumericalRulesRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class StatCalculator {
    
    private static final Logger logger = LoggerFactory.getLogger(StatCalculator.class);
    
    private static final Map<String, BigDecimal> CAPS = new ConcurrentHashMap<>();
    static {
        CAPS.put("crit_rate", new BigDecimal("60"));
        CAPS.put("dodge_rate", new BigDecimal("45"));
        CAPS.put("hit_rate", new BigDecimal("95"));
        CAPS.put("crit_dmg", new BigDecimal("500"));
    }
    
    @Autowired
    private CfgNumericalRulesRepository configRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    public DerivedStats calculate(PlayerStatsBase player) {
        int totalVit = player.getBaseVit() + player.getPermVit() + player.getTmpVit();
        int totalSpi = player.getBaseSpi() + player.getPermSpi() + player.getTmpSpi();
        int totalAgi = player.getBaseAgi() + player.getPermAgi() + player.getTmpAgi();
        int totalWis = player.getBaseWis() + player.getPermWis() + player.getTmpWis();
        int totalLck = player.getBaseLck() + player.getPermLck() + player.getTmpLck();
        
        Map<String, Object> realmMult = getRealmMultiplier(player.getRealmLevel());
        
        double hpMul = ((Number) realmMult.getOrDefault("hp_mul", 1.0)).doubleValue();
        double atkMul = ((Number) realmMult.getOrDefault("atk_mul", 1.0)).doubleValue();
        double defMul = ((Number) realmMult.getOrDefault("def_mul", 1.0)).doubleValue();
        int realmWeight = ((Number) realmMult.getOrDefault("weight", 1)).intValue();
        
        int maxHp = (int) ((totalVit * 100) * hpMul);
        
        int rawAtk = (totalSpi * 8) + (totalVit * 1);
        int attack = (int) (rawAtk * atkMul);
        
        int rawDef = (totalVit * 5) + (totalAgi * 2);
        int defense = (int) (rawDef * defMul);
        
        int speed = totalAgi * 10;
        
        double rawCrit = (totalLck * 0.1) + (totalSpi * 0.02);
        BigDecimal critRate = capValue(BigDecimal.valueOf(rawCrit), "crit_rate");
        
        double rawDodge = totalAgi * 0.5;
        BigDecimal dodgeRate = capValue(BigDecimal.valueOf(rawDodge), "dodge_rate");
        
        double rawHit = 90 + (totalAgi * 0.3);
        BigDecimal hitRate = capValue(BigDecimal.valueOf(rawHit), "hit_rate");
        
        BigDecimal critDmg = BigDecimal.valueOf(150 + totalSpi * 0.5);
        critDmg = capValue(critDmg, "crit_dmg");
        
        BigDecimal tenacity = BigDecimal.valueOf(totalVit * 0.2);
        
        BigDecimal expBonus = BigDecimal.valueOf(1.0 + (totalWis * 0.01));
        
        double cp = (
            attack * 10 +
            defense * 5 +
            maxHp * 0.1 +
            (speed * 2) +
            (critRate.doubleValue() * 50) +
            (dodgeRate.doubleValue() * 50) +
            (realmWeight * 1000)
        );
        
        Map<String, Object> detail = new ConcurrentHashMap<>();
        detail.put("total_vit", totalVit);
        detail.put("total_spi", totalSpi);
        detail.put("total_agi", totalAgi);
        detail.put("total_wis", totalWis);
        detail.put("total_lck", totalLck);
        detail.put("mult_info", realmMult);
        
        return new DerivedStats(maxHp, attack, defense, speed, critRate, dodgeRate, hitRate, expBonus, (int) cp, detail);
    }
    
    private Map<String, Object> getRealmMultiplier(int realmLevel) {
        try {
            CfgNumericalRules config = configRepository.findById("realm_mult").orElse(null);
            if (config != null) {
                Map<String, Object> realmConfig = objectMapper.readValue(config.getContent(), Map.class);
                Map<String, Object> realmData = (Map<String, Object>) realmConfig.get(String.valueOf(realmLevel));
                if (realmData != null) {
                    Map<String, Object> mult = new ConcurrentHashMap<>();
                    mult.put("hp_mul", realmData.getOrDefault("hp_mul", 1.0));
                    mult.put("atk_mul", realmData.getOrDefault("atk_mul", 1.0));
                    mult.put("def_mul", realmData.getOrDefault("def_mul", 1.0));
                    mult.put("weight", realmData.getOrDefault("weight", 1));
                    return mult;
                }
            }
        } catch (Exception e) {
            logger.warn("获取境界倍率配置失败，使用默认值，realmLevel={}", realmLevel);
        }
        
        Map<String, Object> defaultMult = new ConcurrentHashMap<>();
        defaultMult.put("hp_mul", 1.0);
        defaultMult.put("atk_mul", 1.0);
        defaultMult.put("def_mul", 1.0);
        defaultMult.put("weight", 1);
        return defaultMult;
    }
    
    private BigDecimal capValue(BigDecimal value, String capKey) {
        BigDecimal cap = CAPS.get(capKey);
        if (cap != null && value.compareTo(cap) > 0) {
            return cap;
        }
        BigDecimal min = BigDecimal.ZERO;
        if (value.compareTo(min) < 0) {
            return min;
        }
        return value.setScale(4, RoundingMode.HALF_UP);
    }
}
