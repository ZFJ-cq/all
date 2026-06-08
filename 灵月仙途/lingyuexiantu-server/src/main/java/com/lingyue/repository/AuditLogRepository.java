package com.lingyue.repository;

import com.lingyue.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 审计日志 Repository
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    /**
     * 根据 traceId 查询审计日志
     */
    List<AuditLog> findByTraceId(String traceId);
    
    /**
     * 根据模块查询审计日志
     */
    List<AuditLog> findByModuleOrderByCreateTimeDesc(String module);
    
    /**
     * 根据角色 ID 查询审计日志
     */
    List<AuditLog> findByRoleIdOrderByCreateTimeDesc(Long roleId);
}
