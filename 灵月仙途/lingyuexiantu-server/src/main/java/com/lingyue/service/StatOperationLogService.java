package com.lingyue.service;

import com.lingyue.entity.StatOperationLog;
import com.lingyue.repository.StatOperationLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StatOperationLogService {
    
    @Autowired
    private StatOperationLogRepository logRepository;
    
    public void createLog(Long playerId, String opType, String targetStat, Integer oldValue, Integer newValue, String contextInfo) {
        int changeDelta = newValue - oldValue;
        StatOperationLog log = new StatOperationLog(playerId, opType, targetStat, oldValue, newValue, changeDelta, contextInfo);
        logRepository.save(log);
    }
    
    public List<StatOperationLog> getPlayerLogs(Long playerId) {
        return logRepository.findByPlayerIdOrderByCreatedAtDesc(playerId);
    }
    
    public List<StatOperationLog> getPlayerLogsByType(Long playerId, String opType) {
        return logRepository.findByPlayerIdAndOpTypeOrderByCreatedAtDesc(playerId, opType);
    }
    
    public void batchCreateLogs(List<StatOperationLog> logs) {
        logRepository.saveAll(logs);
    }
}