package com.lingyue.service;

import com.lingyue.entity.CfgRealmBreakthrough;
import com.lingyue.entity.GameRole;
import com.lingyue.entity.RoleRealm;
import com.lingyue.entity.RoleRealmBreakthrough;
import com.lingyue.entity.RoleResource;
import com.lingyue.repository.CfgRealmBreakthroughRepository;
import com.lingyue.repository.GameRoleRepository;
import com.lingyue.repository.RoleRealmBreakthroughRepository;
import com.lingyue.repository.RoleRealmRepository;
import com.lingyue.repository.RoleResourceRepository;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * 境界突破服务 (带幂等性保护)
 * 特性:
 * 1. Redis 分布式锁防止并发
 * 2. 请求 ID 幂等性检查
 * 3. 完整事务保护
 * 4. 乐观锁重试机制
 */
@Service
public class BreakthroughService {
    
    private static final Logger logger = LoggerFactory.getLogger(BreakthroughService.class);
    private static final int MAX_RETRY_COUNT = 3;
    private static final long LOCK_EXPIRE_SECONDS = 30;
    private static final long IDEMPOTENT_TTL_MINUTES = 10;
    
    private final RedissonClient redissonClient;
    private final RedisTemplate<String, String> redisTemplate;
    private final RoleRealmBreakthroughRepository breakthroughRepository;
    private final CfgRealmBreakthroughRepository cfgBreakthroughRepository;
    private final GameRoleRepository gameRoleRepository;
    private final RoleRealmRepository roleRealmRepository;
    private final RoleResourceRepository roleResourceRepository;
    
    public BreakthroughService(RedissonClient redissonClient,
                             RedisTemplate<String, String> redisTemplate,
                             RoleRealmBreakthroughRepository breakthroughRepository,
                             CfgRealmBreakthroughRepository cfgBreakthroughRepository,
                             GameRoleRepository gameRoleRepository,
                             RoleRealmRepository roleRealmRepository,
                             RoleResourceRepository roleResourceRepository) {
        this.redissonClient = redissonClient;
        this.redisTemplate = redisTemplate;
        this.breakthroughRepository = breakthroughRepository;
        this.cfgBreakthroughRepository = cfgBreakthroughRepository;
        this.gameRoleRepository = gameRoleRepository;
        this.roleRealmRepository = roleRealmRepository;
        this.roleResourceRepository = roleResourceRepository;
    }
    
    /**
     * 执行境界突破 (带完整幂等性保护)
     * 
     * @param roleId 角色 ID
     * @param requestId 请求 ID (前端传入，用于幂等性)
     * @param clientIp 客户端 IP
     * @return 突破结果
     */
    @Retryable(
        value = {OptimisticLockingFailureException.class},
        maxAttempts = MAX_RETRY_COUNT,
        backoff = @Backoff(delay = 100, multiplier = 2)
    )
    @Transactional(isolation = Isolation.READ_COMMITTED, rollbackFor = Exception.class)
    public Map<String, Object> executeBreakthrough(Long roleId, 
                                                   String requestId,
                                                   String clientIp) {
        
        logger.info("开始执行突破，roleId={}, requestId={}, clientIp={}", 
            roleId, requestId, clientIp);
        
        long startTime = System.currentTimeMillis();
        
        // 1. 幂等性检查：查询是否已处理过该请求
        String idempotentKey = "breakthrough:idempotent:" + roleId + ":" + requestId;
        String existingResult = redisTemplate.opsForValue().get(idempotentKey);
        
        if (existingResult != null) {
            logger.warn("重复的突破请求，requestId={}, existingResult={}", requestId, existingResult);
            // 返回已有结果
            return parseExistingResult(existingResult);
        }
        
        // 2. 获取 Redis 分布式锁 (防止并发)
        String lockKey = "breakthrough:lock:" + roleId;
        RLock lock = redissonClient.getLock(lockKey);
        
        boolean locked = false;
        try {
            locked = lock.tryLock(0, LOCK_EXPIRE_SECONDS, TimeUnit.SECONDS);
            
            if (!locked) {
                logger.error("获取锁失败，突破请求处理中，roleId={}", roleId);
                throw new IllegalStateException("突破请求正在处理中，请勿重复提交");
            }
            
            // 3. 再次检查幂等性 (双重检查)
            existingResult = redisTemplate.opsForValue().get(idempotentKey);
            if (existingResult != null) {
                return parseExistingResult(existingResult);
            }
            
            // 4. 执行突破逻辑
            Map<String, Object> result = doExecuteBreakthrough(roleId, requestId, clientIp);
            
            // 5. 保存结果到 Redis (10 分钟有效期)
            saveResultToRedis(idempotentKey, result);
            
            long executionTime = System.currentTimeMillis() - startTime;
            logger.info("突破执行成功，roleId={}, success={}, executionTime={}ms", 
                roleId, result.get("success"), executionTime);
            
            return result;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("获取锁被中断，roleId={}", roleId, e);
            throw new RuntimeException("突破请求被中断", e);
            
        } catch (Exception e) {
            logger.error("突破执行失败，roleId={}, requestId={}", roleId, requestId, e);
            throw e;
            
        } finally {
            // 6. 释放锁
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
                logger.debug("释放突破锁，roleId={}", roleId);
            }
        }
    }
    
    /**
     * 执行实际的突破逻辑
     */
    private Map<String, Object> doExecuteBreakthrough(Long roleId, 
                                                       String requestId,
                                                       String clientIp) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 1. 查询角色信息
            GameRole role = gameRoleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("角色不存在"));
            
            // 2. 查询角色当前境界
            RoleRealm roleRealm = roleRealmRepository.findByRoleId(roleId);
            if (roleRealm == null) {
                throw new IllegalArgumentException("角色境界信息不存在");
            }
            
            String currentRealm = roleRealm.getRealmName();
            
            // 3. 查询突破配置
            CfgRealmBreakthrough cfgBreakthrough = cfgBreakthroughRepository
                .findByFromRealm(currentRealm)
                .orElseThrow(() -> new IllegalArgumentException("当前境界无法突破"));
            
            // 4. 检查修为是否足够
            java.math.BigDecimal currentXiuwei = roleRealm.getTotalCultivation();
            Long requiredXiuwei = cfgBreakthrough.getXiuweiRequirement();
            
            if (currentXiuwei == null || currentXiuwei.longValue() < requiredXiuwei) {
                result.put("success", false);
                result.put("message", "修为不足，需要" + requiredXiuwei + "点修为");
                result.put("currentXiuwei", currentXiuwei != null ? currentXiuwei.longValue() : 0);
                result.put("requiredXiuwei", requiredXiuwei);
                return result;
            }
            
            // 5. 计算成功率 (可加入丹药、气运等加成)
            double successRate = cfgBreakthrough.getSuccessRate().doubleValue();
            
            // 6. 判定是否成功
            boolean success = Math.random() < successRate;
            
            // 7. 扣除修为 (无论成功失败都扣除)
            java.math.BigDecimal newXiuwei = currentXiuwei.subtract(java.math.BigDecimal.valueOf(requiredXiuwei));
            roleRealm.setTotalCultivation(newXiuwei);
            roleRealmRepository.save(roleRealm);
            
            // 8. 记录突破结果
            RoleRealmBreakthrough breakthroughRecord = new RoleRealmBreakthrough();
            breakthroughRecord.setRoleId(roleId);
            breakthroughRecord.setRoleName(role.getRoleName());
            breakthroughRecord.setOldRealm(currentRealm);
            breakthroughRecord.setNewRealm(cfgBreakthrough.getToRealm());
            breakthroughRecord.setSuccess(success ? 1 : 0);
            breakthroughRecord.setCostXiuwei(requiredXiuwei.intValue());
            breakthroughRecord.setBreakthroughTime(LocalDateTime.now());
            
            breakthroughRepository.save(breakthroughRecord);
            
            // 9. 如果成功，更新角色境界
            if (success) {
                roleRealm.setRealmName(cfgBreakthrough.getToRealm());
                roleRealm.setRealmLevel(roleRealm.getRealmLevel() + 1);
                roleRealmRepository.save(roleRealm);
                
                logger.info("突破成功，roleId={}, oldRealm={}, newRealm={}", 
                    roleId, currentRealm, cfgBreakthrough.getToRealm());
                
                result.put("success", true);
                result.put("message", "突破成功，晋升为" + cfgBreakthrough.getToRealm());
                result.put("oldRealm", currentRealm);
                result.put("newRealm", cfgBreakthrough.getToRealm());
                result.put("costXiuwei", requiredXiuwei);
                
            } else {
                logger.info("突破失败，roleId={}, realm={}, xiuweiPenalty={}", 
                    roleId, currentRealm, requiredXiuwei);
                
                result.put("success", false);
                result.put("message", "突破失败，损失" + requiredXiuwei + "点修为");
                result.put("currentRealm", currentRealm);
                result.put("costXiuwei", requiredXiuwei);
            }
            
            return result;
            
        } catch (IllegalArgumentException e) {
            result.put("success", false);
            result.put("message", e.getMessage());
            return result;
            
        } catch (Exception e) {
            logger.error("突破逻辑执行异常，roleId={}", roleId, e);
            result.put("success", false);
            result.put("message", "突破失败：" + e.getMessage());
            return result;
        }
    }
    
    /**
     * 保存结果到 Redis
     */
    private void saveResultToRedis(String key, Map<String, Object> result) {
        try {
            // 简单序列化 (生产环境建议使用 JSON)
            StringBuilder sb = new StringBuilder();
            sb.append(result.get("success")).append("|");
            sb.append(result.get("message")).append("|");
            if (result.get("newRealm") != null) {
                sb.append(result.get("newRealm"));
            }
            
            redisTemplate.opsForValue().set(key, sb.toString(), IDEMPOTENT_TTL_MINUTES, TimeUnit.MINUTES);
            
        } catch (Exception e) {
            logger.error("保存幂等结果失败，key={}", key, e);
        }
    }
    
    /**
     * 解析已有结果
     */
    private Map<String, Object> parseExistingResult(String existingResult) {
        Map<String, Object> result = new HashMap<>();
        String[] parts = existingResult.split("\\|");
        
        if (parts.length > 0) {
            result.put("success", Boolean.parseBoolean(parts[0]));
            result.put("message", parts.length > 1 ? parts[1] : "");
            result.put("repeated", true);
            result.put("existingResult", existingResult);
            
            if (parts.length > 2 && parts[2] != null && !parts[2].isEmpty()) {
                result.put("newRealm", parts[2]);
            }
        }
        
        return result;
    }
    
    /**
     * 生成请求 ID (如果前端未传入)
     */
    public String generateRequestId() {
        return UUID.randomUUID().toString();
    }
}
