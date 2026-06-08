package com.lingyue.repository;

import com.lingyue.entity.TaskLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskLogRepository extends JpaRepository<TaskLog, Long> {
    List<TaskLog> findByRoleIdOrderByCreatedAtDesc(Long roleId);
    List<TaskLog> findByRoleIdAndActionType(Long roleId, String actionType);
}
