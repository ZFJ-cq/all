package com.lingyue.repository;

import com.lingyue.entity.SysOperationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SysOperationLogRepository extends JpaRepository<SysOperationLog, Long> {
    
    /**
     * 按操作人 ID 分页查询
     */
    Page<SysOperationLog> findByOperatorId(Long operatorId, Pageable pageable);
    
    /**
     * 按操作人账号分页查询
     */
    Page<SysOperationLog> findByOperatorUsername(String operatorUsername, Pageable pageable);
    
    /**
     * 按模块分页查询
     */
    Page<SysOperationLog> findByModule(String module, Pageable pageable);
    
    /**
     * 按操作类型分页查询
     */
    Page<SysOperationLog> findByOperationType(String operationType, Pageable pageable);
    
    /**
     * 按敏感操作标识查询
     */
    List<SysOperationLog> findByIsSensitive(Integer isSensitive);
    
    /**
     * 按时间范围查询
     */
    Page<SysOperationLog> findByCreateTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 按操作人和时间范围查询
     */
    Page<SysOperationLog> findByOperatorUsernameAndCreateTimeBetween(String operatorUsername, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 搜索操作日志（支持多字段）
     */
    @Query("SELECT l FROM SysOperationLog l WHERE " +
           "(:username IS NULL OR l.operatorUsername LIKE %:username%) AND " +
           "(:module IS NULL OR l.module LIKE %:module%) AND " +
           "(:operationType IS NULL OR l.operationType LIKE %:operationType%) AND " +
           "(:startTime IS NULL OR l.createTime >= :startTime) AND " +
           "(:endTime IS NULL OR l.createTime <= :endTime)")
    Page<SysOperationLog> searchLogs(
        @Param("username") String username,
        @Param("module") String module,
        @Param("operationType") String operationType,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        Pageable pageable
    );
    
    /**
     * 统计敏感操作数量
     */
    Long countByIsSensitive(Integer isSensitive);
    
    /**
     * 统计指定操作人的操作数量
     */
    Long countByOperatorUsername(String operatorUsername);
}