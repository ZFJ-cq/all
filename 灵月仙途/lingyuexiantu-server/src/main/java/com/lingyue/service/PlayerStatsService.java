package com.lingyue.service;

import com.lingyue.dto.DerivedStats;
import com.lingyue.entity.PlayerStatsBase;
import com.lingyue.repository.PlayerStatsBaseRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlayerStatsService {
    
    private static final Logger logger = LoggerFactory.getLogger(PlayerStatsService.class);
    
    @Autowired
    private PlayerStatsBaseRepository statsRepository;
    
    @Autowired
    private StatCalculator statCalculator;
    
    @Autowired
    private StatOperationLogService logService;
    
    public PlayerStatsBase getPlayerStats(Long playerId) {
        return statsRepository.findByRoleId(playerId).orElse(null);
    }
    
    public PlayerStatsBase createPlayerStats(Long playerId) {
        PlayerStatsBase stats = new PlayerStatsBase();
        stats.setRoleId(playerId);
        stats.setPlayerId(playerId);
        return statsRepository.save(stats);
    }
    
    @Transactional
    public PlayerStatsBase updateBaseStats(Long playerId, String statType, int value, String opType, String contextInfo) {
        PlayerStatsBase stats = statsRepository.findByRoleId(playerId).orElse(null);
        if (stats == null) {
            stats = createPlayerStats(playerId);
        }
        
        int oldValue = 0;
        switch (statType) {
            case "base_vit":
                oldValue = stats.getBaseVit();
                stats.setBaseVit(value);
                break;
            case "base_spi":
                oldValue = stats.getBaseSpi();
                stats.setBaseSpi(value);
                break;
            case "base_agi":
                oldValue = stats.getBaseAgi();
                stats.setBaseAgi(value);
                break;
            case "base_wis":
                oldValue = stats.getBaseWis();
                stats.setBaseWis(value);
                break;
            case "base_lck":
                oldValue = stats.getBaseLck();
                stats.setBaseLck(value);
                break;
            case "perm_vit":
                oldValue = stats.getPermVit();
                stats.setPermVit(value);
                break;
            case "perm_spi":
                oldValue = stats.getPermSpi();
                stats.setPermSpi(value);
                break;
            case "perm_agi":
                oldValue = stats.getPermAgi();
                stats.setPermAgi(value);
                break;
            case "perm_wis":
                oldValue = stats.getPermWis();
                stats.setPermWis(value);
                break;
            case "perm_lck":
                oldValue = stats.getPermLck();
                stats.setPermLck(value);
                break;
            case "tmp_vit":
                oldValue = stats.getTmpVit();
                stats.setTmpVit(value);
                break;
            case "tmp_spi":
                oldValue = stats.getTmpSpi();
                stats.setTmpSpi(value);
                break;
            case "tmp_agi":
                oldValue = stats.getTmpAgi();
                stats.setTmpAgi(value);
                break;
            case "tmp_wis":
                oldValue = stats.getTmpWis();
                stats.setTmpWis(value);
                break;
            case "tmp_lck":
                oldValue = stats.getTmpLck();
                stats.setTmpLck(value);
                break;
            default:
                logger.warn("未知的属性类型：{}，跳过更新", statType);
                return stats;
        }
        
        stats.setLastCalcVer(stats.getLastCalcVer() + 1);
        PlayerStatsBase updatedStats = statsRepository.save(stats);
        
        logService.createLog(playerId, opType, statType, oldValue, value, contextInfo);
        
        return updatedStats;
    }
    
    public DerivedStats calculateDerivedStats(Long playerId) {
        PlayerStatsBase stats = statsRepository.findByRoleId(playerId).orElse(null);
        if (stats == null) {
            stats = createPlayerStats(playerId);
        }
        return statCalculator.calculate(stats);
    }
    
    @Transactional
    public PlayerStatsBase updateRealmLevel(Long playerId, int realmLevel, int realmStage, String contextInfo) {
        PlayerStatsBase stats = statsRepository.findByRoleId(playerId).orElse(null);
        if (stats == null) {
            stats = createPlayerStats(playerId);
        }
        
        int oldRealmLevel = stats.getRealmLevel();
        int oldRealmStage = stats.getRealmStage();
        
        stats.setRealmLevel(realmLevel);
        stats.setRealmStage(realmStage);
        stats.setLastCalcVer(stats.getLastCalcVer() + 1);
        
        PlayerStatsBase updatedStats = statsRepository.save(stats);
        
        logService.createLog(playerId, "BREAKTHROUGH", "realm_level", oldRealmLevel, realmLevel, contextInfo);
        logService.createLog(playerId, "BREAKTHROUGH", "realm_stage", oldRealmStage, realmStage, contextInfo);
        
        return updatedStats;
    }
    
    @Transactional
    public PlayerStatsBase addExperience(Long playerId, long expAmount, String contextInfo) {
        PlayerStatsBase stats = statsRepository.findByRoleId(playerId).orElse(null);
        if (stats == null) {
            stats = createPlayerStats(playerId);
        }
        
        long oldExp = stats.getExpCurr();
        long newExp = oldExp + expAmount;
        
        while (newExp >= stats.getExpMax()) {
            newExp -= stats.getExpMax();
            int newStage = stats.getRealmStage() + 1;
            int newLevel = stats.getRealmLevel();
            
            if (newStage > 9) {
                newStage = 1;
                newLevel += 1;
            }
            
            stats.setRealmLevel(newLevel);
            stats.setRealmStage(newStage);
            stats.setExpMax((long) (stats.getExpMax() * 1.5));
        }
        
        stats.setExpCurr(newExp);
        stats.setLastCalcVer(stats.getLastCalcVer() + 1);
        
        PlayerStatsBase updatedStats = statsRepository.save(stats);
        
        logService.createLog(playerId, "LEVEL_UP", "exp_curr", (int) oldExp, (int) newExp, contextInfo);
        
        return updatedStats;
    }
}
