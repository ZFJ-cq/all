package com.lingyue.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lingyue.entity.Achievement;
import com.lingyue.entity.AchievementClaimRecord;
import com.lingyue.entity.RoleAchievement;
import com.lingyue.exception.*;
import com.lingyue.repository.AchievementClaimRecordRepository;
import com.lingyue.repository.AchievementRepository;
import com.lingyue.repository.RoleAchievementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 成就服务 - 生产级重构版
 * 特性：
 * 1. 完整事务控制
 * 2. 幂等性保护
 * 3. 审计日志
 * 4. MQ 异步通知
 */
@Service
public class AchievementService {
    
    private static final Logger log = LoggerFactory.getLogger(AchievementService.class);
    
    private final AchievementRepository achievementRepository;
    private final RoleAchievementRepository roleAchievementRepository;
    private final AchievementClaimRecordRepository achievementClaimRecordRepository;
    private final RoleAssetService roleAssetService;
    private final TitleAttributeService titleAttributeService;
    private final AuditLogService auditLogService;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    
    public AchievementService(AchievementRepository achievementRepository,
                            RoleAchievementRepository roleAchievementRepository,
                            AchievementClaimRecordRepository achievementClaimRecordRepository,
                            RoleAssetService roleAssetService,
                            TitleAttributeService titleAttributeService,
                            AuditLogService auditLogService,
                            RabbitTemplate rabbitTemplate,
                            ObjectMapper objectMapper) {
        this.achievementRepository = achievementRepository;
        this.roleAchievementRepository = roleAchievementRepository;
        this.achievementClaimRecordRepository = achievementClaimRecordRepository;
        this.roleAssetService = roleAssetService;
        this.titleAttributeService = titleAttributeService;
        this.auditLogService = auditLogService;
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }
    
    /**
     * 检查并发放成就奖励 (带完整事务)
     * 
     * @param roleId 角色 ID
     * @param achievementId 成就 ID
     * @param requestId 请求 ID (幂等性)
     * @param clientIp 客户端 IP
     * @return 奖励详情
     */
    @Transactional(rollbackFor = Exception.class, timeout = 30)
    public Map<String, Object> claimReward(Long roleId, 
                                          Long achievementId, 
                                          String requestId,
                                          String clientIp) {
        
        log.info("开始领取成就奖励，roleId={}, achievementId={}, requestId={}", 
            roleId, achievementId, requestId);
        
        long startTime = System.currentTimeMillis();
        
        // 1. 幂等性检查：查询是否已处理过该请求
        Optional<AchievementClaimRecord> existingRecord = 
            achievementClaimRecordRepository.findByRequestId(requestId);
        
        if (existingRecord.isPresent()) {
            log.warn("重复的领取请求，requestId={}", requestId);
            AchievementClaimRecord record = existingRecord.get();
            if ("SUCCESS".equals(record.getStatus())) {
                // 返回已有成功结果
                return buildClaimResult(record);
            } else {
                throw new AchievementException("CLAIM_FAILED", 
                    "该请求已处理但失败：" + record.getErrorMessage());
            }
        }
        
        try {
            // 2. 查询成就记录 (使用悲观锁防止并发)
            RoleAchievement roleAchievement = roleAchievementRepository
                .findByRoleIdAndAchievementIdForUpdate(roleId, achievementId)
                .orElseThrow(() -> new AchievementException("ACHIEVEMENT_NOT_FOUND",
                    "成就记录不存在，roleId=" + roleId + ", achievementId=" + achievementId));
            
            // 3. 校验成就状态
            if (!"completed".equals(roleAchievement.getStatus())) {
                throw new AchievementNotCompletedException(achievementId);
            }
            
            // 4. 检查是否已领取
            if ("claimed".equals(roleAchievement.getStatus())) {
                throw new AchievementAlreadyClaimedException();
            }
            
            // 5. 查询成就配置
            Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new AchievementException("ACHIEVEMENT_CONFIG_NOT_FOUND",
                    "成就配置不存在，achievementId=" + achievementId));
            
            // 6. 更新成就状态 (CAS 操作)
            int updated = roleAchievementRepository.updateStatusCas(
                roleId, 
                achievementId, 
                "completed", 
                "claimed", 
                LocalDateTime.now(),
                requestId,
                clientIp,
                roleAchievement.getVersion()
            );
            
            if (updated == 0) {
                throw new OptimisticLockingFailureException(
                    "成就状态已被其他操作修改，请重试");
            }
            
            // 7. 发放奖励 (事务内)
            Map<String, Object> rewardDetail = distributeReward(roleId, achievement);
            
            // 8. 记录领取记录
            AchievementClaimRecord claimRecord = saveClaimRecord(
                roleId, achievementId, requestId, achievement, rewardDetail, clientIp);
            
            // 9. 记录审计日志
            auditLogService.logAchievementClaim(
                roleId, 
                achievementId, 
                achievement.getName(),
                rewardDetail,
                clientIp,
                requestId
            );
            
            // 10. 发送 MQ 消息 (异步通知)
            sendAchievementCompletedMQ(roleId, achievement);
            
            long executionTime = System.currentTimeMillis() - startTime;
            log.info("成就奖励领取成功，roleId={}, achievementId={}, executionTime={}ms", 
                roleId, achievementId, executionTime);
            
            return buildClaimResult(claimRecord);
            
        } catch (AchievementException e) {
            log.error("领取成就奖励失败，roleId={}, achievementId={}, error={}", 
                roleId, achievementId, e.getMessage());
            
            // 记录失败审计日志
            auditLogService.logFailure(
                "ACHIEVEMENT",
                "CLAIM_REWARD",
                roleId,
                e.getMessage(),
                clientIp,
                Map.of("achievementId", achievementId, "requestId", requestId)
            );
            
            throw e;
            
        } catch (Exception e) {
            log.error("领取成就奖励异常，roleId={}, achievementId={}", 
                roleId, achievementId, e);
            
            // 记录失败审计日志
            auditLogService.logFailure(
                "ACHIEVEMENT",
                "CLAIM_REWARD",
                roleId,
                e.getMessage(),
                clientIp,
                Map.of("achievementId", achievementId, "requestId", requestId)
            );
            
            throw new RewardDistributionException(
                "奖励发放失败：" + e.getMessage(), e);
        }
    }
    
    /**
     * 发放奖励 (物品 + 属性 + 称号)
     */
    private Map<String, Object> distributeReward(Long roleId, Achievement achievement) {
        Map<String, Object> rewardDetail = new HashMap<>();
        List<Map<String, Object>> rewards = new ArrayList<>();
        
        try {
            // 1. 发放属性奖励 (解析 JSON)
            String rewardAttributes = achievement.getRewardAttributes();
            if (StringUtils.hasText(rewardAttributes)) {
                Map<String, Object> attributes = objectMapper.readValue(
                    rewardAttributes, Map.class);
                
                // 增加角色属性
                roleAssetService.addAttributes(roleId, attributes);
                
                Map<String, Object> attrReward = new HashMap<>();
                attrReward.put("type", "ATTRIBUTES");
                attrReward.put("detail", attributes);
                rewards.add(attrReward);
                
                log.info("发放属性奖励，roleId={}, attributes={}", roleId, attributes);
            }
            
            // 2. 授予称号 (如果成就有称号)
            String title = achievement.getTitle();
            if (StringUtils.hasText(title)) {
                // 将称号添加到角色称号列表
                titleAttributeService.grantTitle(roleId, achievement.getId(), title);
                
                Map<String, Object> titleReward = new HashMap<>();
                titleReward.put("type", "TITLE");
                titleReward.put("title", title);
                titleReward.put("achievementId", achievement.getId());
                rewards.add(titleReward);
                
                log.info("授予称号，roleId={}, title={}", roleId, title);
            }
            
            rewardDetail.put("rewards", rewards);
            return rewardDetail;
            
        } catch (JsonProcessingException e) {
            throw new RewardDistributionException(
                "奖励解析失败：" + e.getMessage(), e);
        }
    }
    
    /**
     * 保存领取记录
     */
    private AchievementClaimRecord saveClaimRecord(Long roleId,
                                                   Long achievementId,
                                                   String requestId,
                                                   Achievement achievement,
                                                   Map<String, Object> rewardDetail,
                                                   String clientIp) {
        AchievementClaimRecord record = new AchievementClaimRecord();
        record.setRoleId(roleId);
        record.setAchievementId(achievementId);
        record.setRequestId(requestId);
        record.setRewardAttributes(achievement.getRewardAttributes());
        record.setTitleGranted(achievement.getTitle());
        record.setClaimIp(clientIp);
        record.setClaimTime(LocalDateTime.now());
        record.setStatus("SUCCESS");
        
        try {
            record.setRewardItems(objectMapper.writeValueAsString(
                rewardDetail.get("rewards")));
        } catch (JsonProcessingException e) {
            log.error("序列化奖励 JSON 失败", e);
        }
        
        return achievementClaimRecordRepository.save(record);
    }
    
    /**
     * 发送 MQ 消息
     */
    private void sendAchievementCompletedMQ(Long roleId, Achievement achievement) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("roleId", roleId);
            message.put("achievementId", achievement.getId());
            message.put("achievementName", achievement.getName());
            message.put("rarity", achievement.getRarity());
            message.put("title", achievement.getTitle());
            message.put("timestamp", System.currentTimeMillis());
            
            rabbitTemplate.convertAndSend(
                "achievement.exchange",
                "achievement.completed",
                message
            );
            
            log.info("发送 MQ 消息，roleId={}, achievementId={}", 
                roleId, achievement.getId());
            
        } catch (Exception e) {
            // MQ 发送失败不影响主流程，记录日志
            log.error("发送 MQ 消息失败，roleId={}, achievementId={}", 
                roleId, achievement.getId(), e);
        }
    }
    
    /**
     * 构建返回结果
     */
    private Map<String, Object> buildClaimResult(AchievementClaimRecord record) {
        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("achievementId", record.getAchievementId());
        result.put("claimTime", record.getClaimTime());
        result.put("rewards", record.getRewardItems());
        result.put("title", record.getTitleGranted());
        return result;
    }
}
