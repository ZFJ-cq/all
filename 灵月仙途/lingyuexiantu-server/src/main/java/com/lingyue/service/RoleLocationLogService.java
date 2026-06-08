package com.lingyue.service;

import com.lingyue.entity.RoleLocationLog;
import java.util.List;

public interface RoleLocationLogService {
    RoleLocationLog recordVisit(Long roleId, Long locationId);
    List<RoleLocationLog> getRoleVisitHistory(Long roleId);
    RoleLocationLog getRoleLocationLog(Long roleId, Long locationId);
}
