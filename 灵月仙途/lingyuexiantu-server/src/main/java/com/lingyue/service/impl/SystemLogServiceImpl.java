package com.lingyue.service.impl;

import com.lingyue.entity.SystemLog;
import com.lingyue.repository.SystemLogRepository;
import com.lingyue.service.SystemLogService;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SystemLogServiceImpl implements SystemLogService {
    
    private final SystemLogRepository logRepository;
    
    public SystemLogServiceImpl(SystemLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Override
    public void log(String level, String message, String source) {
        SystemLog log = new SystemLog();
        log.setLevel(level);
        log.setMessage(message);
        log.setSource(source);
        logRepository.save(log);
    }

    @Override
    public List<SystemLog> getAllLogs() {
        return logRepository.findAll();
    }

    @Override
    public List<SystemLog> getLogsByTimeRange(LocalDateTime start, LocalDateTime end) {
        return logRepository.findByCreatedAtBetween(start, end);
    }

    @Override
    public List<SystemLog> getLogsByLevel(String level) {
        return logRepository.findByLevel(level);
    }

    @Override
    public List<SystemLog> getLogsBySource(String source) {
        return logRepository.findBySource(source);
    }

    @Override
    public void clearLogs() {
        logRepository.deleteAll();
    }

    @Override
    public void deleteLogsBefore(LocalDateTime date) {
        List<SystemLog> logs = logRepository.findByCreatedAtBetween(LocalDateTime.MIN, date);
        logRepository.deleteAll(logs);
    }
}
