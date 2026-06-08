package com.lingyue.service.impl;

import com.lingyue.entity.SysOperationLog;
import com.lingyue.repository.SysOperationLogRepository;
import com.lingyue.service.SysOperationLogService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SysOperationLogServiceImpl implements SysOperationLogService {

    private final SysOperationLogRepository operationLogRepository;

    public SysOperationLogServiceImpl(SysOperationLogRepository operationLogRepository) {
        this.operationLogRepository = operationLogRepository;
    }

    @Override
    public void logOperation(SysOperationLog log) {
        log.setCreateTime(LocalDateTime.now());
        operationLogRepository.save(log);
    }

    @Override
    public Page<SysOperationLog> getOperationLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        return operationLogRepository.findAll(pageable);
    }

    @Override
    public Page<SysOperationLog> getLogsByOperatorId(Long operatorId, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        return operationLogRepository.findByOperatorId(operatorId, pageable);
    }

    @Override
    public Page<SysOperationLog> getLogsByOperatorUsername(String operatorUsername, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        return operationLogRepository.findByOperatorUsername(operatorUsername, pageable);
    }

    @Override
    public Page<SysOperationLog> getLogsByModule(String module, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        return operationLogRepository.findByModule(module, pageable);
    }

    @Override
    public Page<SysOperationLog> searchLogs(String username, String module, String operationType,
                                           LocalDateTime startTime, LocalDateTime endTime,
                                           int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "createTime"));
        return operationLogRepository.searchLogs(username, module, operationType, startTime, endTime, pageable);
    }

    @Override
    public List<SysOperationLog> getSensitiveLogs() {
        return operationLogRepository.findByIsSensitive(1);
    }

    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", operationLogRepository.count());
        stats.put("sensitiveLogs", operationLogRepository.countByIsSensitive(1));
        return stats;
    }

    @Override
    public List<SysOperationLog> exportLogs(LocalDateTime startTime, LocalDateTime endTime) {
        Pageable pageable = PageRequest.of(0, 10000, Sort.by(Sort.Direction.DESC, "createTime"));
        Page<SysOperationLog> page = operationLogRepository.findByCreateTimeBetween(startTime, endTime, pageable);
        return page.getContent();
    }
}