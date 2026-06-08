package com.lingyue.service;

import com.lingyue.entity.RoleTask;
import java.util.List;

public interface RoleTaskService {
    List<RoleTask> getRoleTasks(Long roleId);
    List<RoleTask> getRoleTasksByStatus(Long roleId, Integer status);
    RoleTask getRoleTask(Long roleId, Long taskId);
    RoleTask acceptTask(Long roleId, Long taskId);
    RoleTask updateTaskProgress(Long roleId, Long taskId, Integer progress);
    RoleTask completeTask(Long roleId, Long taskId);
    RoleTask claimTaskReward(Long roleId, Long taskId);
    void abandonTask(Long roleId, Long taskId);
}
