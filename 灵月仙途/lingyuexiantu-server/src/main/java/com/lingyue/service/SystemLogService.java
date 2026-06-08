package com.lingyue.service;

import com.lingyue.entity.SystemLog;
import java.time.LocalDateTime;
import java.util.List;

public interface SystemLogService {
    // 记录日志
    void log(String level, String message, String source);
    
    // 获取所有日志
    List<SystemLog> getAllLogs();
    
    // 根据时间范围获取日志
    List<SystemLog> getLogsByTimeRange(LocalDateTime start, LocalDateTime end);
    
    // 根据级别获取日志
    List<SystemLog> getLogsByLevel(String level);
    
    // 根据来源获取日志
    List<SystemLog> getLogsBySource(String source);
    
    // 清空日志
    void clearLogs();
    
    // 删除指定时间之前的日志
    void deleteLogsBefore(LocalDateTime date);
}
