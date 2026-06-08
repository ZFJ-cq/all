package com.lingyue.service;

import com.lingyue.entity.CultivationTask;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RealmConfig;
import com.lingyue.entity.RoleAsset;
import com.lingyue.entity.TechniqueChangeLog;
import com.lingyue.repository.CultivationTaskRepository;
import com.lingyue.repository.RealmConfigRepository;
import com.lingyue.repository.TechniqueChangeLogRepository;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class CultivationService {
    
    private static final Logger logger = LoggerFactory.getLogger(CultivationService.class);
    
    private static final String XIUWEI_ASSET_CODE = "XIUWEI";
    private static final int BASE_XIUWEI_PER_SECOND = 1;
    private static final int DEFAULT_CULTIVATION_DURATION_SECONDS = 30;
    private static final int MAX_OFFLINE_DURATION_HOURS = 24;
    private static final double LINGSHI_BOOST_MULTIPLIER = 2.0;
    private static final double PILL_BOOST_MULTIPLIER = 3.0;
    private static final int PITY_THRESHOLD = 5;
    private static final long CULTIVATION_LOCK_EXPIRE_SECONDS = 10;
    private static final long BREAKTHROUGH_LOCK_EXPIRE_SECONDS = 30;
    private static final long IDEMPOTENT_TTL_MINUTES = 5;
    
    private static final Map<String, Double> REALM_EFFICIENCY_MULTIPLIERS = Map.ofEntries(
        Map.entry("凡人", 1.0),
        Map.entry("炼体", 1.0),
        Map.entry("炼气", 1.5),
        Map.entry("筑基", 2.0),
        Map.entry("金丹", 2.5),
        Map.entry("元婴", 3.0),
        Map.entry("化神", 3.5),
        Map.entry("炼虚", 4.0),
        Map.entry("合体", 4.5),
        Map.entry("大乘", 5.0),
        Map.entry("无修为", 1.0)
    );
    
    private final CultivationTaskRepository cultivationTaskRepository;
    private final TechniqueChangeLogRepository techniqueChangeLogRepository;
    private final GameRoleService gameRoleService;
    private final RoleResourceService roleResourceService;
    private final ResourceTypeService resourceTypeService;
    private final TechniqueService techniqueService;
    private final RoleAssetService roleAssetService;
    private final AssetTypeService assetTypeService;
    private final RealmConfigRepository realmConfigRepository;
    private final RedissonClient redissonClient;
    private final RedisTemplate<String, String> redisTemplate;
    private final Random random = new Random();
    
    @Autowired
    public CultivationService(CultivationTaskRepository cultivationTaskRepository,
                           TechniqueChangeLogRepository techniqueChangeLogRepository,
                           GameRoleService gameRoleService,
                           RoleResourceService roleResourceService,
                           ResourceTypeService resourceTypeService,
                           TechniqueService techniqueService,
                           RoleAssetService roleAssetService,
                           AssetTypeService assetTypeService,
                           RealmConfigRepository realmConfigRepository,
                           RedissonClient redissonClient,
                           RedisTemplate<String, String> redisTemplate) {
        this.cultivationTaskRepository = cultivationTaskRepository;
        this.techniqueChangeLogRepository = techniqueChangeLogRepository;
        this.gameRoleService = gameRoleService;
        this.roleResourceService = roleResourceService;
        this.resourceTypeService = resourceTypeService;
        this.techniqueService = techniqueService;
        this.roleAssetService = roleAssetService;
        this.assetTypeService = assetTypeService;
        this.realmConfigRepository = realmConfigRepository;
        this.redissonClient = redissonClient;
        this.redisTemplate = redisTemplate;
    }
    
    private com.lingyue.entity.AssetType getXiuweiAssetType() {
        return assetTypeService.getAssetTypeByCode(XIUWEI_ASSET_CODE);
    }
    
    private double getRealmEfficiencyMultiplier(String realm) {
        return REALM_EFFICIENCY_MULTIPLIERS.getOrDefault(realm, 1.0);
    }
    
    private int getCurrentXiuwei(Long roleId) {
        com.lingyue.entity.AssetType xiuweiAssetType = getXiuweiAssetType();
        if (xiuweiAssetType == null) return 0;
        try {
            List<RoleAsset> assets = roleAssetService.getRoleAssets(roleId);
            int total = 0;
            if (assets != null) {
                for (RoleAsset asset : assets) {
                    if (asset != null && asset.getAssetTypeCode() != null &&
                        (asset.getAssetTypeCode().equalsIgnoreCase("xiuwei") || asset.getAssetTypeCode().equalsIgnoreCase("xiuxiuwei"))) {
                        total += asset.getQuantity() != null ? asset.getQuantity().intValue() : 0;
                    }
                }
            }
            return total;
        } catch (Exception e) {
            return 0;
        }
    }
    
    private boolean deductAsset(Long roleId, String assetCode, int amount) {
        try {
            com.lingyue.entity.AssetType assetType = assetTypeService.getAssetTypeByCode(assetCode);
            if (assetType == null) return false;
            List<RoleAsset> assets = roleAssetService.getRoleAssets(roleId);
            if (assets == null) return false;
            for (RoleAsset asset : assets) {
                if (asset != null && asset.getAssetTypeCode() != null &&
                    asset.getAssetTypeCode().equalsIgnoreCase(assetCode.toLowerCase())) {
                    int current = asset.getQuantity() != null ? asset.getQuantity().intValue() : 0;
                    if (current < amount) return false;
                    roleAssetService.updateRoleAsset(roleId, assetType.getId(), (long) -amount);
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            logger.error("扣除资源失败: {}", e.getMessage());
            return false;
        }
    }
    
    private int getAssetQuantity(Long roleId, String assetCode) {
        try {
            List<RoleAsset> assets = roleAssetService.getRoleAssets(roleId);
            if (assets == null) return 0;
            int total = 0;
            for (RoleAsset asset : assets) {
                if (asset != null && asset.getAssetTypeCode() != null &&
                    asset.getAssetTypeCode().equalsIgnoreCase(assetCode.toLowerCase())) {
                    total += asset.getQuantity() != null ? asset.getQuantity().intValue() : 0;
                }
            }
            return total;
        } catch (Exception e) {
            return 0;
        }
    }
    
    public String getFullRealmName(GameRole role) {
        if (role == null) return "凡人";
        String realm = role.getRealm();
        Integer level = role.getRealmLevel();
        if (realm == null || realm.isEmpty() || "凡人".equals(realm)) return "凡人";
        if (level == null) level = 1;
        String[] levelNames = {"一", "二", "三", "四", "五", "六", "七", "八", "九", "十"};
        String levelStr = level <= 10 ? levelNames[level - 1] : String.valueOf(level);
        return realm + levelStr + "层";
    }
    
    public RealmConfig getCurrentRealmConfig(GameRole role) {
        if (role == null) return null;
        String realm = role.getRealm();
        Integer level = role.getRealmLevel();
        if (realm == null || "凡人".equals(realm)) {
            return null;
        }
        if (level == null) level = 1;
        return realmConfigRepository.findByRealmNameAndLevel(realm, level).orElse(null);
    }
    
    public RealmConfig getNextRealmConfig(GameRole role) {
        if (role == null) return null;
        String realm = role.getRealm();
        Integer level = role.getRealmLevel();
        if (level == null) level = 1;
        
        if (realm == null || "凡人".equals(realm)) {
            return realmConfigRepository.findByRealmNameAndLevel("炼体", 1).orElse(null);
        }
        
        if (level < 10) {
            return realmConfigRepository.findByRealmNameAndLevel(realm, level + 1).orElse(null);
        }
        
        int nextRealmIndex = getNextRealmIndex(realm);
        if (nextRealmIndex < 0) return null;
        return realmConfigRepository.findByRealmIndexOrderBySortOrder(nextRealmIndex)
            .stream().findFirst().orElse(null);
    }
    
    private int getNextRealmIndex(String realm) {
        Map<String, Integer> realmOrder = Map.of(
            "炼体", 1, "炼气", 2, "筑基", 3, "金丹", 4,
            "元婴", 5, "化神", 6, "炼虚", 7, "合体", 8, "大乘", 9
        );
        Integer current = realmOrder.get(realm);
        if (current == null) return 1;
        return current < 9 ? current + 1 : -1;
    }
    
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> autoCultivation(Long roleId, String boostType) {
        String lockKey = "cultivation:lock:" + roleId;
        RLock lock = redissonClient.getLock(lockKey);
        boolean locked = false;
        
        try {
            locked = lock.tryLock(0, CULTIVATION_LOCK_EXPIRE_SECONDS, TimeUnit.SECONDS);
            if (!locked) {
                logger.warn("修炼请求正在处理中，roleId={}", roleId);
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "修炼请求正在处理中，请勿重复提交");
                return result;
            }
            
            return doAutoCultivation(roleId, boostType);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("获取修炼锁被中断，roleId={}", roleId, e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "修炼请求被中断");
            return result;
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
    
    private Map<String, Object> doAutoCultivation(Long roleId, String boostType) {
        Map<String, Object> result = new HashMap<>();
        
        GameRole role = gameRoleService.getRoleById(roleId);
        if (role == null) {
            result.put("success", false);
            result.put("message", "角色不存在");
            return result;
        }
        
        if (isWalkFireActive(role)) {
            result.put("success", false);
            result.put("message", "走火入魔中，无法修炼");
            return result;
        }
        
        Map<String, Object> techniqueBonus = techniqueService.calculateTotalBonus(roleId);
        double techniqueSpeedBonus = (double) techniqueBonus.getOrDefault("speedPercentage", 0.0);
        int techniqueSpeedFlat = (int) techniqueBonus.getOrDefault("speedFlat", 0);
        long techniqueLimitBonus = (long) techniqueBonus.getOrDefault("limitBonus", 0L);
        
        double realmEfficiency = getRealmEfficiencyMultiplier(role.getRealm());
        
        double boostMultiplier = 1.0;
        int cost = 0;
        String costAssetCode = null;
        
        if ("LINGSHI".equals(boostType)) {
            boostMultiplier = LINGSHI_BOOST_MULTIPLIER;
            cost = 100;
            costAssetCode = "LINGSHI";
        } else if ("PILL".equals(boostType)) {
            boostMultiplier = PILL_BOOST_MULTIPLIER;
            RealmConfig currentRealmCfg = getCurrentRealmConfig(role);
            if (currentRealmCfg != null && currentRealmCfg.getRequiredPill() != null) {
                costAssetCode = currentRealmCfg.getRequiredPill();
            } else {
                String realmName = role.getRealm();
                if ("凡人".equals(realmName) || realmName == null) {
                    costAssetCode = "LIANTIDAN";
                } else {
                    switch (realmName) {
                        case "炼体": costAssetCode = "LIANTIDAN"; break;
                        case "炼气": costAssetCode = "LIANQIDAN"; break;
                        case "筑基": costAssetCode = "ZHUJIDAN"; break;
                        case "金丹": costAssetCode = "JINDANDAN"; break;
                        case "元婴": costAssetCode = "YUANYINGDAN"; break;
                        case "化神": costAssetCode = "HUASHENDAN"; break;
                        case "炼虚": costAssetCode = "LIANXUDAN"; break;
                        case "合体": costAssetCode = "HETIDAN"; break;
                        case "大乘": costAssetCode = "DACHENGDAN"; break;
                        default: costAssetCode = "ZHUJIDAN"; break;
                    }
                }
            }
            cost = 1;
        } else if ("BATTLE_WIN".equals(boostType)) {
            result.put("success", true);
            result.put("message", "请使用 /combat/result 接口保存战斗结果");
            result.put("deprecated", true);
            return result;
        } else if ("BATTLE_LOSS".equals(boostType)) {
            result.put("success", true);
            result.put("message", "请使用 /combat/result 接口保存战斗结果");
            result.put("deprecated", true);
            return result;
        }
        
        if (cost > 0 && costAssetCode != null) {
            if (!deductAsset(roleId, costAssetCode, cost)) {
                result.put("success", false);
                result.put("message", costAssetCode.equals("LINGSHI") ? "灵石不足" : "丹药不足");
                return result;
            }
        }
        
        int baseXiuwei = (int) (BASE_XIUWEI_PER_SECOND * DEFAULT_CULTIVATION_DURATION_SECONDS);
        double effectiveSpeed = (BASE_XIUWEI_PER_SECOND * (1 + techniqueSpeedBonus) + techniqueSpeedFlat) * realmEfficiency * boostMultiplier;
        int totalXiuwei = (int) (effectiveSpeed * DEFAULT_CULTIVATION_DURATION_SECONDS);
        
        long effectiveLimit = baseXiuwei + techniqueLimitBonus;
        if (totalXiuwei > effectiveLimit) {
            totalXiuwei = (int) effectiveLimit;
        }
        
        try {
            com.lingyue.entity.AssetType xiuweiAssetType = getXiuweiAssetType();
            if (xiuweiAssetType != null) {
                roleAssetService.addAsset(roleId, xiuweiAssetType.getId(), totalXiuwei);
            }
        } catch (Exception e) {
            logger.error("添加修为失败: {}", e.getMessage());
        }
        
        LocalDateTime now = LocalDateTime.now();
        role.setLastCultivationTime(now);
        gameRoleService.updateRole(roleId, role);
        
        result.put("success", true);
        result.put("totalXiuwei", totalXiuwei);
        result.put("boostType", boostType != null ? boostType : "NONE");
        result.put("boostMultiplier", boostMultiplier);
        result.put("currentXiuwei", getCurrentXiuwei(roleId));
        result.put("fullRealmName", getFullRealmName(role));
        result.put("nextCultivationTime", now.plusSeconds(DEFAULT_CULTIVATION_DURATION_SECONDS).toString());
        
        return result;
    }
    
    public Map<String, Object> autoCultivation(Long roleId) {
        return autoCultivation(roleId, null);
    }
    
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> calculateOfflineCultivation(Long roleId) {
        String lockKey = "cultivation:lock:" + roleId;
        RLock lock = redissonClient.getLock(lockKey);
        boolean locked = false;
        
        try {
            locked = lock.tryLock(0, CULTIVATION_LOCK_EXPIRE_SECONDS, TimeUnit.SECONDS);
            if (!locked) {
                logger.warn("离线修炼请求正在处理中，roleId={}", roleId);
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "修炼请求正在处理中，请稍后再试");
                return result;
            }
            
            return doCalculateOfflineCultivation(roleId);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("获取离线修炼锁被中断，roleId={}", roleId, e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "离线修炼请求被中断");
            return result;
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
    
    private Map<String, Object> doCalculateOfflineCultivation(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        GameRole role = gameRoleService.getRoleById(roleId);
        if (role == null) {
            result.put("success", false);
            result.put("message", "角色不存在");
            return result;
        }
        
        LocalDateTime lastOnline = role.getLastOnlineTime();
        if (lastOnline == null) {
            lastOnline = role.getLastCultivationTime();
        }
        if (lastOnline == null) {
            result.put("success", true);
            result.put("offlineXiuwei", 0);
            result.put("offlineMinutes", 0);
            return result;
        }
        
        LocalDateTime now = LocalDateTime.now();
        long offlineMinutes = Duration.between(lastOnline, now).toMinutes();
        if (offlineMinutes <= 0) {
            result.put("success", true);
            result.put("offlineXiuwei", 0);
            result.put("offlineMinutes", 0);
            return result;
        }
        
        long maxOfflineMinutes = MAX_OFFLINE_DURATION_HOURS * 60L;
        if (offlineMinutes > maxOfflineMinutes) {
            offlineMinutes = maxOfflineMinutes;
        }
        
        double realmEfficiency = getRealmEfficiencyMultiplier(role.getRealm());
        Map<String, Object> techniqueBonus = techniqueService.calculateTotalBonus(roleId);
        double techniqueSpeedBonus = (double) techniqueBonus.getOrDefault("speedPercentage", 0.0);
        int techniqueSpeedFlat = (int) techniqueBonus.getOrDefault("speedFlat", 0);
        
        double effectiveSpeed = (BASE_XIUWEI_PER_SECOND * (1 + techniqueSpeedBonus) + techniqueSpeedFlat) * realmEfficiency;
        int offlineXiuwei = (int) (effectiveSpeed * offlineMinutes * 60 * 0.5);
        
        try {
            com.lingyue.entity.AssetType xiuweiAssetType = getXiuweiAssetType();
            if (xiuweiAssetType != null && offlineXiuwei > 0) {
                roleAssetService.addAsset(roleId, xiuweiAssetType.getId(), offlineXiuwei);
            }
        } catch (Exception e) {
            logger.error("离线修为添加失败: {}", e.getMessage());
        }
        
        role.setLastOnlineTime(now);
        role.setLastCultivationTime(now);
        gameRoleService.updateRole(roleId, role);
        
        result.put("success", true);
        result.put("offlineXiuwei", offlineXiuwei);
        result.put("offlineMinutes", offlineMinutes);
        result.put("currentXiuwei", getCurrentXiuwei(roleId));
        result.put("fullRealmName", getFullRealmName(role));
        
        return result;
    }
    
    private boolean isWalkFireActive(GameRole role) {
        if (role == null || role.getWalkFireUntil() == null) return false;
        return LocalDateTime.now().isBefore(role.getWalkFireUntil());
    }
    
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> breakthrough(Long roleId, String pillCode) {
        String lockKey = "breakthrough:lock:" + roleId;
        RLock lock = redissonClient.getLock(lockKey);
        boolean locked = false;
        
        try {
            locked = lock.tryLock(0, BREAKTHROUGH_LOCK_EXPIRE_SECONDS, TimeUnit.SECONDS);
            if (!locked) {
                logger.warn("突破请求正在处理中，roleId={}", roleId);
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "突破请求正在处理中，请勿重复提交");
                return result;
            }
            
            String idempotentKey = "cultivation:breakthrough:idempotent:" + roleId;
            String existingResult = null;
            try {
                existingResult = redisTemplate.opsForValue().get(idempotentKey);
            } catch (Exception e) {
                logger.warn("幂等性检查失败，继续执行突破: {}", e.getMessage());
            }
            
            if (existingResult != null) {
                logger.warn("重复的突破请求，roleId={}", roleId);
                Map<String, Object> result = new HashMap<>();
                result.put("success", false);
                result.put("message", "请勿重复提交突破请求");
                result.put("repeated", true);
                return result;
            }
            
            Map<String, Object> result = doBreakthrough(roleId, pillCode);
            
            try {
                redisTemplate.opsForValue().set(idempotentKey, 
                    String.valueOf(result.get("breakthroughSuccess")), 
                    IDEMPOTENT_TTL_MINUTES, TimeUnit.MINUTES);
            } catch (Exception e) {
                logger.warn("保存幂等标记失败: {}", e.getMessage());
            }
            
            return result;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("获取突破锁被中断，roleId={}", roleId, e);
            Map<String, Object> result = new HashMap<>();
            result.put("success", false);
            result.put("message", "突破请求被中断");
            return result;
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
    
    private Map<String, Object> doBreakthrough(Long roleId, String pillCode) {
        Map<String, Object> result = new HashMap<>();
        
        GameRole role = gameRoleService.getRoleById(roleId);
        if (role == null) {
            result.put("success", false);
            result.put("message", "角色不存在");
            return result;
        }
        
        if (isWalkFireActive(role)) {
            result.put("success", false);
            result.put("message", "走火入魔中，无法突破");
            return result;
        }
        
        RealmConfig nextConfig = getNextRealmConfig(role);
        if (nextConfig == null) {
            result.put("success", false);
            result.put("message", "已达到最高境界");
            return result;
        }
        
        long requiredXiuwei = nextConfig.getRequiredXiuwei() != null ? nextConfig.getRequiredXiuwei() : 0L;
        int currentXiuwei = getCurrentXiuwei(roleId);
        
        if (currentXiuwei < requiredXiuwei) {
            result.put("success", false);
            result.put("message", "修为不足，需要 " + requiredXiuwei + " 修为");
            return result;
        }
        
        if (nextConfig.getRequiredPill() != null && nextConfig.getRequiredPillCount() > 0) {
            String requiredPill = nextConfig.getRequiredPill();
            int requiredCount = nextConfig.getRequiredPillCount();
            String pillToUse = pillCode != null ? pillCode : requiredPill;
            
            if (!pillToUse.equalsIgnoreCase(requiredPill)) {
                result.put("success", false);
                result.put("message", "此境界需要使用" + getAssetTypeName(requiredPill));
                return result;
            }
            
            if (!deductAsset(roleId, pillToUse, requiredCount)) {
                result.put("success", false);
                result.put("message", getAssetTypeName(pillToUse) + "不足");
                return result;
            }
        }
        
        com.lingyue.entity.AssetType xiuweiAssetType = getXiuweiAssetType();
        if (xiuweiAssetType == null) {
            result.put("success", false);
            result.put("message", "系统配置错误：修为资产类型不存在");
            return result;
        }
        roleAssetService.updateRoleAsset(roleId, xiuweiAssetType.getId(), -requiredXiuwei);
        
        BigDecimal baseRate = nextConfig.getBaseSuccessRate();
        int failures = role.getConsecutiveBreakthroughFailures() != null ? role.getConsecutiveBreakthroughFailures() : 0;
        double pityBonus = failures >= PITY_THRESHOLD ? 20.0 : failures * 4.0;
        double finalRate = Math.min(baseRate.doubleValue() + pityBonus, 100.0);
        
        double roll = random.nextDouble() * 100;
        boolean success = roll < finalRate;
        
        if (success) {
            String oldRealm = getFullRealmName(role);
            role.setRealm(nextConfig.getRealmName());
            role.setRealmLevel(nextConfig.getLevel());
            role.setConsecutiveBreakthroughFailures(0);
            role.setLastCultivationTime(LocalDateTime.now());
            gameRoleService.updateRole(roleId, role);
            
            result.put("success", true);
            result.put("breakthroughSuccess", true);
            result.put("oldRealm", oldRealm);
            result.put("newRealm", nextConfig.getFullRealmName());
            result.put("consumedXiuwei", requiredXiuwei);
            result.put("successRate", finalRate);
            result.put("roll", roll);
            result.put("fullRealmName", nextConfig.getFullRealmName());
            result.put("currentXiuwei", getCurrentXiuwei(roleId));
        } else {
            role.setConsecutiveBreakthroughFailures(failures + 1);
            String penaltyType = nextConfig.getPenaltyType();
            int penaltyValue = nextConfig.getPenaltyValue() != null ? nextConfig.getPenaltyValue() : 0;
            String penaltyDesc = applyPenalty(role, roleId, penaltyType, penaltyValue);
            
            role.setLastCultivationTime(LocalDateTime.now());
            gameRoleService.updateRole(roleId, role);
            
            result.put("success", true);
            result.put("breakthroughSuccess", false);
            result.put("message", "突破失败！" + penaltyDesc);
            result.put("penaltyType", penaltyType);
            result.put("penaltyValue", penaltyValue);
            result.put("successRate", finalRate);
            result.put("roll", roll);
            result.put("consecutiveFailures", failures + 1);
            result.put("fullRealmName", getFullRealmName(role));
            result.put("currentXiuwei", getCurrentXiuwei(roleId));
        }
        
        return result;
    }
    
    private String applyPenalty(GameRole role, Long roleId, String penaltyType, int penaltyValue) {
        if (penaltyType == null || "NONE".equals(penaltyType)) {
            return "无惩罚";
        }
        
        switch (penaltyType) {
            case "LOSS_XIUWEI": {
                int currentXiuwei = getCurrentXiuwei(roleId);
                int lossAmount = (int) (currentXiuwei * penaltyValue / 100.0);
                if (lossAmount > 0) {
                    com.lingyue.entity.AssetType xiuweiAssetType = getXiuweiAssetType();
                    if (xiuweiAssetType != null) {
                        roleAssetService.updateRoleAsset(roleId, xiuweiAssetType.getId(), (long) -lossAmount);
                    }
                }
                return "损失" + penaltyValue + "%修为（-" + lossAmount + "）";
            }
            case "WALK_FIRE": {
                int durationMinutes = penaltyValue > 0 ? penaltyValue : 30;
                role.setWalkFireUntil(LocalDateTime.now().plusMinutes(durationMinutes));
                int currentHp = role.getHp() != null ? role.getHp() : 100;
                int maxHp = currentHp > 0 ? Math.max(currentHp, 100) : 100;
                if (role.getMaxAge() != null && role.getMaxAge() > maxHp) {
                    maxHp = role.getMaxAge();
                }
                role.setHp((int) (maxHp * 0.3));
                return "走火入魔！气血降至30%，持续" + durationMinutes + "分钟";
            }
            default:
                return "未知惩罚";
        }
    }
    
    private String getAssetTypeName(String code) {
        Map<String, String> names = Map.of(
            "LIANTIDAN", "炼体丹", "LIANQIDAN", "炼气丹", "ZHUJIDAN", "筑基丹",
            "JINDANDAN", "金丹丹", "YUANYINGDAN", "元婴丹", "HUASHENDAN", "化神丹",
            "LIANXUDAN", "炼虚丹", "HETIDAN", "合体丹", "DACHENGDAN", "大乘丹",
            "LINGSHI", "灵石"
        );
        return names.getOrDefault(code, code);
    }
    
    public Map<String, Object> getNextRealm(String currentRealm) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("nextRealm", "请使用 /cultivation/realm-info 接口");
        result.put("requiredXiuwei", 0);
        return result;
    }
    
    public Map<String, Object> getRealmInfo(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        
        GameRole role = gameRoleService.getRoleById(roleId);
        if (role == null) {
            result.put("success", false);
            result.put("message", "角色不存在");
            return result;
        }
        
        RealmConfig currentConfig = getCurrentRealmConfig(role);
        RealmConfig nextConfig = getNextRealmConfig(role);
        
        result.put("success", true);
        result.put("currentRealm", role.getRealm());
        result.put("currentLevel", role.getRealmLevel());
        result.put("fullRealmName", getFullRealmName(role));
        result.put("currentXiuwei", getCurrentXiuwei(roleId));
        result.put("isWalkFire", isWalkFireActive(role));
        result.put("walkFireUntil", role.getWalkFireUntil());
        result.put("consecutiveFailures", role.getConsecutiveBreakthroughFailures());
        
        if (currentConfig != null) {
            result.put("currentEfficiency", currentConfig.getEfficiencyMultiplier());
        }
        
        if (nextConfig != null) {
            result.put("nextRealmName", nextConfig.getFullRealmName());
            result.put("nextRealm", nextConfig.getRealmName());
            result.put("nextLevel", nextConfig.getLevel());
            result.put("requiredXiuwei", nextConfig.getRequiredXiuwei());
            result.put("baseSuccessRate", nextConfig.getBaseSuccessRate());
            result.put("penaltyType", nextConfig.getPenaltyType());
            result.put("penaltyValue", nextConfig.getPenaltyValue());
            result.put("requiredPill", nextConfig.getRequiredPill());
            result.put("requiredPillCount", nextConfig.getRequiredPillCount());
            result.put("isMajorBreakthrough", nextConfig.getIsMajorBreakthrough());
            
            int failures = role.getConsecutiveBreakthroughFailures() != null ? role.getConsecutiveBreakthroughFailures() : 0;
            double pityBonus = failures >= PITY_THRESHOLD ? 20.0 : failures * 4.0;
            double finalRate = Math.min(nextConfig.getBaseSuccessRate().doubleValue() + pityBonus, 100.0);
            result.put("finalSuccessRate", finalRate);
            result.put("pityBonus", pityBonus);
        } else {
            result.put("nextRealmName", "已达到最高境界");
            result.put("requiredXiuwei", 0);
        }
        
        return result;
    }
    
    public Map<String, Object> getAllRealmConfigs() {
        Map<String, Object> result = new HashMap<>();
        List<RealmConfig> configs = realmConfigRepository.findAllByOrderBySortOrderAsc();
        result.put("success", true);
        result.put("realms", configs);
        return result;
    }
    
    public Map<String, Object> getCultivationStatus(Long roleId) {
        return getRealmInfo(roleId);
    }
    
    public Map<String, Object> onTechniqueChange(Long userId, Long roleId, Long techniqueId, boolean isEquip) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", isEquip ? "功法已装备" : "功法已卸下");
        return result;
    }
    
    public Map<String, Object> startCultivation(Long roleId, String boostType) {
        return autoCultivation(roleId, boostType);
    }
    
    public Map<String, Object> claimCultivation(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "已领取");
        return result;
    }
    
    public Map<String, Object> interruptCultivation(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("message", "已中断");
        return result;
    }
    
    public Map<String, Object> getServerTime() {
        Map<String, Object> result = new HashMap<>();
        result.put("serverTime", LocalDateTime.now().toString());
        result.put("timestamp", System.currentTimeMillis());
        return result;
    }
    
    public Map<String, Object> processOfflineCultivation(Long roleId, LocalDateTime lastLoginTime) {
        return calculateOfflineCultivation(roleId);
    }
    
    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> heartbeat(Long roleId) {
        Map<String, Object> result = new HashMap<>();
        GameRole role = gameRoleService.getRoleById(roleId);
        if (role == null) {
            result.put("success", false);
            result.put("message", "角色不存在");
            return result;
        }
        role.setLastOnlineTime(LocalDateTime.now());
        gameRoleService.updateRole(roleId, role);
        result.put("success", true);
        return result;
    }
}
