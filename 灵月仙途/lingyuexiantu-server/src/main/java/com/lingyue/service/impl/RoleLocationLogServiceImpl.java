package com.lingyue.service.impl;

import com.lingyue.entity.RoleLocationLog;
import com.lingyue.repository.RoleLocationLogRepository;
import com.lingyue.service.RoleLocationLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoleLocationLogServiceImpl implements RoleLocationLogService {

    private final RoleLocationLogRepository logRepository;

    public RoleLocationLogServiceImpl(RoleLocationLogRepository logRepository) {
        this.logRepository = logRepository;
    }

    @Override
    @Transactional
    public RoleLocationLog recordVisit(Long roleId, Long locationId) {
        RoleLocationLog log = logRepository.findByRoleIdAndLocationId(roleId, locationId)
                .orElse(null);
        if (log == null) {
            log = new RoleLocationLog();
            log.setRoleId(roleId);
            log.setLocationId(locationId);
            log.setVisitCount(1);
            log.setLastVisitAt(LocalDateTime.now());
        } else {
            log.setVisitCount(log.getVisitCount() + 1);
            log.setLastVisitAt(LocalDateTime.now());
        }
        return logRepository.save(log);
    }

    @Override
    public List<RoleLocationLog> getRoleVisitHistory(Long roleId) {
        return logRepository.findByRoleIdOrderByLastVisitAtDesc(roleId);
    }

    @Override
    public RoleLocationLog getRoleLocationLog(Long roleId, Long locationId) {
        return logRepository.findByRoleIdAndLocationId(roleId, locationId).orElse(null);
    }
}
