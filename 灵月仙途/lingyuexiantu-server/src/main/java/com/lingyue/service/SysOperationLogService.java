package com.lingyue.service;

import com.lingyue.entity.SysOperationLog;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface SysOperationLogService {
    
    /**
     * 记录操作日志
     */
    void logOperation(SysOperationLog log);
    
    /**
     * 分页查询操作日志
     */
    Page<SysOperationLog> getOperationLogs(int page, int size);
    
    /**
     * 按操作人 ID 分页查询
     */
    Page<SysOperationLog> getLogsByOperatorId(Long operatorId, int page, int size);
    
    /**
     * 按操作人账号分页查询
     */
    Page<SysOperationLog> getLogsByOperatorUsername(String operatorUsername, int page, int size);
    
    /**
     * 按模块分页查询
     */
    Page<SysOperationLog> getLogsByModule(String module, int page, int size);
    
    /**
     * 搜索操作日志
     */
    Page<SysOperationLog> searchLogs(String username, String module, String operationType,
                                     LocalDateTime startTime, LocalDateTime endTime,
                                     int page, int size);
    
    /**
     * 获取敏感操作日志
     */
    List<SysOperationLog> getSensitiveLogs();
    
    /**
     * 统计操作日志
     */
    Map<String, Object> getStatistics();
    
    /**
     * 导出操作日志
     */
    List<SysOperationLog> exportLogs(LocalDateTime startTime, LocalDateTime endTime);
}