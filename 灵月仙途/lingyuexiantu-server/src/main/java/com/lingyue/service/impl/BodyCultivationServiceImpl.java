package com.lingyue.service.impl;

import com.lingyue.dto.BodyCultivationDTO;
import com.lingyue.dto.CultivateResult;
import com.lingyue.dto.BreakthroughResult;
import com.lingyue.entity.BodyCultivationRealm;
import com.lingyue.entity.RoleBodyCultivation;
import com.lingyue.entity.BodyPart;
import com.lingyue.entity.RoleBodyPartProgress;
import com.lingyue.entity.BodyCultivationLog;
import com.lingyue.entity.BodyMutation;
import com.lingyue.repository.BodyCultivationRealmRepository;
import com.lingyue.repository.RoleBodyCultivationRepository;
import com.lingyue.repository.BodyPartRepository;
import com.lingyue.repository.RoleBodyPartProgressRepository;
import com.lingyue.repository.BodyCultivationLogRepository;
import com.lingyue.repository.BodyMutationRepository;
import com.lingyue.service.BodyCultivationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 锻体系统服务实现
 */
@Service
public class BodyCultivationServiceImpl implements BodyCultivationService {
    
    private final BodyCultivationRealmRepository realmRepository;
    private final RoleBodyCultivationRepository bodyCultivationRepository;
    private final BodyPartRepository partRepository;
    private final RoleBodyPartProgressRepository partProgressRepository;
    private final BodyCultivationLogRepository logRepository;
    private final BodyMutationRepository mutationRepository;
    
    public BodyCultivationServiceImpl(
        BodyCultivationRealmRepository realmRepository,
        RoleBodyCultivationRepository bodyCultivationRepository,
        BodyPartRepository partRepository,
        RoleBodyPartProgressRepository partProgressRepository,
        BodyCultivationLogRepository logRepository,
        BodyMutationRepository mutationRepository
    ) {
        this.realmRepository = realmRepository;
        this.bodyCultivationRepository = bodyCultivationRepository;
        this.partRepository = partRepository;
        this.partProgressRepository = partProgressRepository;
        this.logRepository = logRepository;
        this.mutationRepository = mutationRepository;
    }
    
    @Override
    public BodyCultivationDTO getBodyCultivationInfo(Long roleId) {
        RoleBodyCultivation bc = getOrCreateBodyCultivation(roleId);
        BodyCultivationRealm realm = realmRepository.findById(bc.getRealmId())
            .orElse(realmRepository.findAllActiveRealms().get(0));
        
        BodyCultivationDTO dto = new BodyCultivationDTO();
        dto.setRoleId(roleId);
        dto.setRealmId(realm.getId());
        dto.setRealmName(realm.getRealmName());
        dto.setRealmOrder(realm.getRealmOrder());
        dto.setBodyExp(bc.getBodyExp());
        dto.setRequiredExp(realm.getRequiredExp());
        dto.setPainValue(bc.getPainValue());
        dto.setTolerance(bc.getTolerance());
        dto.setStatus(bc.getStatus());
        dto.setInjuryRecoveryTime(bc.getInjuryRecoveryTime());
        
        List<RoleBodyPartProgress> progressList = partProgressRepository.findByRoleId(roleId);
        List<BodyPart> parts = partRepository.findAllActiveParts();
        
        List<BodyCultivationDTO.PartProgressInfo> partInfos = parts.stream().map(part -> {
            BodyCultivationDTO.PartProgressInfo info = new BodyCultivationDTO.PartProgressInfo();
            info.setPartId(part.getId());
            info.setPartName(part.getPartName());
            info.setPartCode(part.getPartCode());
            
            Optional<RoleBodyPartProgress> opt = progressList.stream()
                .filter(p -> p.getPartId().equals(part.getId())).findFirst();
            
            if (opt.isPresent()) {
                RoleBodyPartProgress p = opt.get();
                info.setLevel(p.getLevel());
                info.setExp(p.getExp());
                info.setCultivateCount(p.getCultivateCount());
                info.setIsLocked(p.getIsLocked() == 1);
                info.setRequiredExp(calculatePartExpRequired(part, p.getLevel()));
            } else {
                info.setLevel(1);
                info.setExp(0L);
                info.setCultivateCount(0);
                info.setIsLocked(false);
                info.setRequiredExp((long) part.getBaseExpRequirement());
            }
            return info;
        }).collect(Collectors.toList());
        
        dto.setPartProgressList(partInfos);
        return dto;
    }
    
    @Override
    @Transactional
    public CultivateResult cultivate(Long roleId, Long partId, Integer qteScore) {
        RoleBodyCultivation bc = getOrCreateBodyCultivation(roleId);
        
        if (bc.getStatus() == 0 && bc.getInjuryRecoveryTime() != null 
            && bc.getInjuryRecoveryTime().isAfter(LocalDateTime.now())) {
            return CultivateResult.failure("当前处于重伤状态，无法修炼");
        }
        
        BodyPart part = partRepository.findById(partId)
            .orElseThrow(() -> new RuntimeException("部位不存在"));
        
        RoleBodyPartProgress progress = getOrCreatePartProgress(roleId, partId);
        
        if (progress.getLevel() >= part.getMaxLevel()) {
            return CultivateResult.failure(part.getPartName() + "已达到最大等级");
        }
        
        BigDecimal painCoeff = calculatePainCoefficient(bc.getPainValue());
        BigDecimal qteMultiplier = BigDecimal.valueOf(0.5 + (qteScore / 100.0) * 1.5);
        
        long baseExp = calculatePartExpRequired(part, progress.getLevel());
        long expGained = BigDecimal.valueOf(baseExp).multiply(painCoeff).multiply(qteMultiplier)
            .setScale(0, RoundingMode.HALF_UP).longValue();
        
        BodyCultivationRealm realm = realmRepository.findById(bc.getRealmId()).get();
        BigDecimal painIncrease = BigDecimal.TEN.multiply(realm.getPainGrowthRate());
        int toleranceIncrease = qteScore / 20;
        
        bc.setPainValue(bc.getPainValue().add(painIncrease));
        bc.setTolerance(bc.getTolerance() + toleranceIncrease);
        bc.setTotalCultivateCount(bc.getTotalCultivateCount() + 1);
        bc.setLastCultivateTime(LocalDateTime.now());
        
        progress.setExp(progress.getExp() + expGained);
        progress.setCultivateCount(progress.getCultivateCount() + 1);
        
        int partLevelUp = 0;
        long requiredExp = calculatePartExpRequired(part, progress.getLevel());
        while (progress.getExp() >= requiredExp && progress.getLevel() < part.getMaxLevel()) {
            progress.setExp(progress.getExp() - requiredExp);
            progress.setLevel(progress.getLevel() + 1);
            partLevelUp++;
            requiredExp = calculatePartExpRequired(part, progress.getLevel());
        }
        
        bodyCultivationRepository.save(bc);
        partProgressRepository.save(progress);
        
        logCultivation(roleId, partId, "CULTIVATE", true, 
            bc.getPainValue().subtract(painIncrease), bc.getPainValue(),
            bc.getTolerance() - toleranceIncrease, bc.getTolerance(),
            expGained, null, String.format("修炼%s成功，QTE 得分：%d", part.getPartName(), qteScore));
        
        String msg = String.format("修炼%s成功！获得%d经验，痛苦值+%.1f，耐受度+%d",
            part.getPartName(), expGained, painIncrease, toleranceIncrease);
        if (partLevelUp > 0) msg += String.format("，%s升级 +%d", part.getPartName(), partLevelUp);
        
        return CultivateResult.success(msg, expGained, painIncrease, toleranceIncrease);
    }
    
    @Override
    @Transactional
    public BreakthroughResult breakthrough(Long roleId, Boolean useMedicine) {
        RoleBodyCultivation bc = getOrCreateBodyCultivation(roleId);
        BodyCultivationRealm current = realmRepository.findById(bc.getRealmId()).get();
        
        if (bc.getBodyExp() < current.getRequiredExp()) {
            return BreakthroughResult.failure("锻体经验不足", null);
        }
        
        List<BodyCultivationRealm> nextRealms = realmRepository.findNextRealms(current.getRealmOrder());
        if (nextRealms.isEmpty()) {
            return BreakthroughResult.failure("已达到最高境界", null);
        }
        
        BodyCultivationRealm next = nextRealms.get(0);
        BigDecimal successRate = current.getBreakthroughSuccessRate();
        if (useMedicine) successRate = successRate.multiply(BigDecimal.valueOf(1.2));
        
        boolean success = new BigDecimal(Math.random()).multiply(BigDecimal.valueOf(100))
            .compareTo(successRate) < 0;
        
        String oldRealmName = current.getRealmName();
        
        if (success) {
            bc.setRealmId(next.getId());
            bc.setBodyExp(bc.getBodyExp() - current.getRequiredExp());
            bc.setTotalBreakthroughCount(bc.getTotalBreakthroughCount() + 1);
            
            boolean mutationAwakened = false;
            String mutationName = null;
            if (new BigDecimal(Math.random()).multiply(BigDecimal.valueOf(100))
                .compareTo(next.getMutationProbability()) < 0) {
                List<BodyMutation> mutations = mutationRepository.findAll().stream()
                    .filter(m -> m.getStatus() == 1).collect(Collectors.toList());
                if (!mutations.isEmpty()) {
                    BodyMutation m = mutations.get(new Random().nextInt(mutations.size()));
                    bc.setMutationId(m.getId());
                    mutationAwakened = true;
                    mutationName = m.getMutationName();
                }
            }
            
            bodyCultivationRepository.save(bc);
            logCultivation(roleId, null, "BREAKTHROUGH", true, null, null, null, null, null, null,
                String.format("突破成功：%s→%s%s", oldRealmName, next.getRealmName(),
                    mutationAwakened ? "，觉醒：" + mutationName : ""));
            
            return BreakthroughResult.success(
                String.format("恭喜突破成功！从%s进入%s境界！%s", oldRealmName, next.getRealmName(),
                    mutationAwakened ? "觉醒了[" + mutationName + "]异变！" : ""),
                oldRealmName, next.getRealmName(),
                next.getBaseHpBonus(), next.getBaseDefenseBonus(), next.getBaseStrengthBonus(),
                mutationAwakened, mutationName);
        } else {
            bc.setFailedBreakthroughCount(bc.getFailedBreakthroughCount() + 1);
            String penalty = current.getFailurePenalty();
            
            if ("INJURY".equals(penalty)) {
                bc.setStatus(0);
                bc.setInjuryRecoveryTime(LocalDateTime.now().plusHours(24));
                bodyCultivationRepository.save(bc);
                return BreakthroughResult.failure("突破失败！受到重伤，24 小时内无法修炼", "INJURY");
            } else if ("ATTR_DECAY".equals(penalty)) {
                long expLoss = bc.getBodyExp() / 10;
                bc.setBodyExp(bc.getBodyExp() - expLoss);
                bodyCultivationRepository.save(bc);
                return BreakthroughResult.failure(String.format("突破失败！锻体经验损失：%d", expLoss), "ATTR_DECAY");
            }
            
            return BreakthroughResult.failure("突破失败！", "NONE");
        }
    }
    
    @Override
    public List<BodyCultivationDTO.RealmInfo> getAllRealms() {
        return realmRepository.findAllActiveRealms().stream().map(realm -> {
            BodyCultivationDTO.RealmInfo info = new BodyCultivationDTO.RealmInfo();
            info.setId(realm.getId());
            info.setRealmName(realm.getRealmName());
            info.setRealmOrder(realm.getRealmOrder());
            info.setDescription(realm.getDescription());
            info.setBaseHpBonus(realm.getBaseHpBonus());
            info.setBaseDefenseBonus(realm.getBaseDefenseBonus());
            info.setBaseStrengthBonus(realm.getBaseStrengthBonus());
            info.setBreakthroughSuccessRate(realm.getBreakthroughSuccessRate());
            info.setRequiredExp(realm.getRequiredExp());
            info.setPainGrowthRate(realm.getPainGrowthRate());
            info.setMutationProbability(realm.getMutationProbability());
            info.setFailurePenalty(realm.getFailurePenalty());
            return info;
        }).collect(Collectors.toList());
    }
    
    @Override
    public List<BodyCultivationDTO.PartInfo> getAllParts() {
        return partRepository.findAllActiveParts().stream().map(part -> {
            BodyCultivationDTO.PartInfo info = new BodyCultivationDTO.PartInfo();
            info.setId(part.getId());
            info.setPartName(part.getPartName());
            info.setPartCode(part.getPartCode());
            info.setDescription(part.getDescription());
            info.setPrimaryAttr(part.getPrimaryAttr());
            info.setSecondaryAttr(part.getSecondaryAttr());
            info.setBaseExpRequirement(part.getBaseExpRequirement());
            info.setExpGrowthRate(part.getExpGrowthRate());
            info.setMaxLevel(part.getMaxLevel());
            return info;
        }).collect(Collectors.toList());
    }
    
    @Override
    public List<BodyCultivationDTO.LogInfo> getCultivationLogs(Long roleId, Integer days) {
        LocalDateTime startTime = LocalDateTime.now().minusDays(days);
        return logRepository.findByRoleIdAndTimeRange(roleId, startTime).stream().map(log -> {
            BodyCultivationDTO.LogInfo info = new BodyCultivationDTO.LogInfo();
            info.setId(log.getId());
            info.setActionType(log.getActionType());
            info.setSuccess(log.getSuccess() == 1);
            info.setPainValueBefore(log.getPainValueBefore());
            info.setPainValueAfter(log.getPainValueAfter());
            info.setToleranceBefore(log.getToleranceBefore());
            info.setToleranceAfter(log.getToleranceAfter());
            info.setExpGained(log.getExpGained());
            info.setResultDescription(log.getResultDescription());
            info.setCreatedAt(log.getCreatedAt());
            return info;
        }).collect(Collectors.toList());
    }
    
    // ========== 辅助方法 ==========
    
    private RoleBodyCultivation getOrCreateBodyCultivation(Long roleId) {
        try {
            return bodyCultivationRepository.findByRoleId(roleId).orElseGet(() -> {
                RoleBodyCultivation bc = new RoleBodyCultivation();
                bc.setRoleId(roleId);
                bc.setRealmId(1L);
                bc.setBodyExp(0L);
                bc.setPainValue(BigDecimal.ZERO);
                bc.setTolerance(0);
                bc.setStatus(1);
                return bodyCultivationRepository.save(bc);
            });
        } catch (Exception e) {
            // 处理查询返回多个结果的情况
            List<RoleBodyCultivation> list = bodyCultivationRepository.findAll();
            for (RoleBodyCultivation bc : list) {
                if (bc.getRoleId().equals(roleId)) {
                    return bc;
                }
            }
            // 如果没有找到，创建新记录
            RoleBodyCultivation bc = new RoleBodyCultivation();
            bc.setRoleId(roleId);
            bc.setRealmId(1L);
            bc.setBodyExp(0L);
            bc.setPainValue(BigDecimal.ZERO);
            bc.setTolerance(0);
            bc.setStatus(1);
            return bodyCultivationRepository.save(bc);
        }
    }
    
    private RoleBodyPartProgress getOrCreatePartProgress(Long roleId, Long partId) {
        try {
            return partProgressRepository.findByRoleIdAndPartId(roleId, partId).orElseGet(() -> {
                RoleBodyPartProgress p = new RoleBodyPartProgress();
                p.setRoleId(roleId);
                p.setPartId(partId);
                p.setLevel(1);
                p.setExp(0L);
                p.setCultivateCount(0);
                p.setIsLocked(0);
                return partProgressRepository.save(p);
            });
        } catch (Exception e) {
            // 处理查询返回多个结果的情况
            List<RoleBodyPartProgress> list = partProgressRepository.findAll();
            for (RoleBodyPartProgress p : list) {
                if (p.getRoleId().equals(roleId) && p.getPartId().equals(partId)) {
                    return p;
                }
            }
            // 如果没有找到，创建新记录
            RoleBodyPartProgress p = new RoleBodyPartProgress();
            p.setRoleId(roleId);
            p.setPartId(partId);
            p.setLevel(1);
            p.setExp(0L);
            p.setCultivateCount(0);
            p.setIsLocked(0);
            return partProgressRepository.save(p);
        }
    }
    
    private long calculatePartExpRequired(BodyPart part, int level) {
        BigDecimal base = BigDecimal.valueOf(part.getBaseExpRequirement());
        BigDecimal growth = part.getExpGrowthRate();
        return base.multiply(growth.pow(level - 1)).setScale(0, RoundingMode.HALF_UP).longValue();
    }
    
    private BigDecimal calculatePainCoefficient(BigDecimal painValue) {
        if (painValue.compareTo(BigDecimal.valueOf(300)) >= 0) return BigDecimal.valueOf(0.2);
        if (painValue.compareTo(BigDecimal.valueOf(200)) >= 0) return BigDecimal.valueOf(0.5);
        if (painValue.compareTo(BigDecimal.valueOf(100)) >= 0) return BigDecimal.valueOf(0.8);
        return BigDecimal.ONE;
    }
    
    private void logCultivation(Long roleId, Long partId, String actionType, boolean success,
                               BigDecimal painBefore, BigDecimal painAfter,
                               Integer toleranceBefore, Integer toleranceAfter,
                               Long expGained, String materialsConsumed, String resultDesc) {
        BodyCultivationLog log = new BodyCultivationLog();
        log.setRoleId(roleId);
        log.setActionType(actionType);
        log.setSuccess(success ? 1 : 0);
        log.setPainValueBefore(painBefore);
        log.setPainValueAfter(painAfter);
        log.setToleranceBefore(toleranceBefore);
        log.setToleranceAfter(toleranceAfter);
        log.setExpGained(expGained);
        log.setMaterialsConsumed(materialsConsumed);
        log.setResultDescription(resultDesc);
        logRepository.save(log);
    }
}
