package com.lingyue.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lingyue.entity.AuditLog;
import com.lingyue.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * 审计日志服务
 * 特性：
 * 1. 异步写入 (不阻塞主流程)
 * 2. 统一格式
 * 3. 分布式追踪 ID
 */
@Service
public class AuditLogService {
    
    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);
    
    private final AuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;
    
    public AuditLogService(AuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }
    
    /**
     * 记录成就领取审计日志
     */
    @Async
    @Transactional(rollbackFor = Exception.class)
    public void logAchievementClaim(Long roleId, Long achievementId, String achievementName,
                                   Map<String, Object> rewards, String clientIp, String requestId) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setTraceId(generateTraceId());
            auditLog.setModule("ACHIEVEMENT");
            auditLog.setOperation("CLAIM_REWARD");
            auditLog.setRoleId(roleId);
            auditLog.setOperatorIp(clientIp);
            auditLog.setRequestParams(toJson(Map.of(
                "achievementId", achievementId,
                "requestId", requestId
            )));
            auditLog.setNewValue(toJson(rewards));
            auditLog.setStatus("SUCCESS");
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            log.error("记录成就领取审计日志失败，roleId={}, achievementId={}", roleId, achievementId, e);
            // 审计日志失败不影响主流程
        }
    }
    
    /**
     * 记录成就进度更新审计日志
     */
    @Async
    public void logAchievementProgress(Long roleId, Long achievementId, String achievementName,
                                      int oldProgress, int newProgress, int delta, String eventType) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setTraceId(generateTraceId());
            auditLog.setModule("ACHIEVEMENT");
            auditLog.setOperation("UPDATE_PROGRESS");
            auditLog.setRoleId(roleId);
            auditLog.setRequestParams(toJson(Map.of(
                "achievementId", achievementId,
                "eventType", eventType
            )));
            auditLog.setOldValue(toJson(Map.of("progress", oldProgress)));
            auditLog.setNewValue(toJson(Map.of("progress", newProgress)));
            auditLog.setStatus("SUCCESS");
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            log.error("记录成就进度审计日志失败，roleId={}, achievementId={}", roleId, achievementId, e);
        }
    }
    
    /**
     * 记录突破操作审计日志
     */
    @Async
    public void logBreakthrough(Long roleId, String oldRealm, String newRealm, boolean isSuccess,
                               String clientIp, String requestId) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setTraceId(generateTraceId());
            auditLog.setModule("BREAKTHROUGH");
            auditLog.setOperation("BREAKTHROUGH");
            auditLog.setRoleId(roleId);
            auditLog.setOperatorIp(clientIp);
            auditLog.setRequestParams(toJson(Map.of(
                "oldRealm", oldRealm,
                "targetRealm", newRealm,
                "requestId", requestId
            )));
            auditLog.setNewValue(toJson(Map.of(
                "newRealm", newRealm,
                "success", isSuccess
            )));
            auditLog.setStatus("SUCCESS");
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            log.error("记录突破审计日志失败，roleId={}", roleId, e);
        }
    }
    
    /**
     * 记录资源操作审计日志
     */
    @Async
    public void logResourceOperation(Long roleId, String resourceType, String operationType,
                                    long quantity, long balanceBefore, long balanceAfter,
                                    String businessType, String businessId, String clientIp) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setTraceId(generateTraceId());
            auditLog.setModule("RESOURCE");
            auditLog.setOperation("RESOURCE_" + operationType);
            auditLog.setRoleId(roleId);
            auditLog.setOperatorIp(clientIp);
            auditLog.setRequestParams(toJson(Map.of(
                "resourceType", resourceType,
                "businessType", businessType,
                "businessId", businessId
            )));
            auditLog.setOldValue(toJson(Map.of("balance", balanceBefore)));
            auditLog.setNewValue(toJson(Map.of("balance", balanceAfter, "quantity", quantity)));
            auditLog.setStatus("SUCCESS");
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            log.error("记录资源操作审计日志失败，roleId={}", roleId, e);
        }
    }
    
    /**
     * 记录失败审计日志
     */
    @Async
    public void logFailure(String module, String operation, Long roleId, String errorMessage,
                          String clientIp, Map<String, Object> requestParams) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setTraceId(generateTraceId());
            auditLog.setModule(module);
            auditLog.setOperation(operation);
            auditLog.setRoleId(roleId);
            auditLog.setOperatorIp(clientIp);
            auditLog.setRequestParams(toJson(requestParams));
            auditLog.setStatus("FAILED");
            auditLog.setErrorMessage(errorMessage);
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            log.error("记录失败审计日志失败，module={}, operation={}", module, operation, e);
        }
    }
    
    /**
     * 生成分布式追踪 ID
     */
    private String generateTraceId() {
        return UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * 对象转 JSON
     */
    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            log.error("序列化 JSON 失败", e);
            return "{}";
        }
    }
}
