package com.lingyue.repository;

import com.lingyue.entity.SysLoginLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SysLoginLogRepository extends JpaRepository<SysLoginLog, Long> {
    
    /**
     * 按用户 ID 分页查询
     */
    Page<SysLoginLog> findByUserId(Long userId, Pageable pageable);
    
    /**
     * 按用户名分页查询
     */
    Page<SysLoginLog> findByUsername(String username, Pageable pageable);
    
    /**
     * 按登录状态查询
     */
    List<SysLoginLog> findByLoginStatus(Integer loginStatus);
    
    /**
     * 按时间范围查询
     */
    Page<SysLoginLog> findByLoginTimeBetween(LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 按用户和时间范围查询
     */
    Page<SysLoginLog> findByUsernameAndLoginTimeBetween(String username, LocalDateTime startTime, LocalDateTime endTime, Pageable pageable);
    
    /**
     * 搜索登录日志
     */
    @Query("SELECT l FROM SysLoginLog l WHERE " +
           "(:username IS NULL OR l.username LIKE %:username%) AND " +
           "(:ipAddress IS NULL OR l.ipAddress LIKE %:ipAddress%) AND " +
           "(:startTime IS NULL OR l.loginTime >= :startTime) AND " +
           "(:endTime IS NULL OR l.loginTime <= :endTime)")
    Page<SysLoginLog> searchLogs(
        @Param("username") String username,
        @Param("ipAddress") String ipAddress,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        Pageable pageable
    );
    
    /**
     * 查询用户最近一次登录记录
     */
    SysLoginLog findTopByUserIdOrderByLoginTimeDesc(Long userId);
    
    /**
     * 统计指定用户的登录次数
     */
    Long countByUserId(Long userId);
}