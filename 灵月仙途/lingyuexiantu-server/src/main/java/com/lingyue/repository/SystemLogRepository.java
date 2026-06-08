package com.lingyue.repository;

import com.lingyue.entity.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    // 根据时间范围查询日志
    List<SystemLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // 根据级别查询日志
    List<SystemLog> findByLevel(String level);
    
    // 根据来源查询日志
    List<SystemLog> findBySource(String source);
}
