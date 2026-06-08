package com.lingyue.service.impl;

import com.lingyue.entity.*;
import com.lingyue.repository.*;
import com.lingyue.service.RoleTaskService;
import com.lingyue.service.InventoryService;
import com.lingyue.service.RoleResourceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RoleTaskServiceImpl implements RoleTaskService {
    
    private final RoleTaskRepository roleTaskRepository;
    private final TaskRepository taskRepository;
    private final InventoryService inventoryService;
    private final RoleResourceService roleResourceService;
    
    public RoleTaskServiceImpl(RoleTaskRepository roleTaskRepository,
                             TaskRepository taskRepository,
                             InventoryService inventoryService,
                             RoleResourceService roleResourceService) {
        this.roleTaskRepository = roleTaskRepository;
        this.taskRepository = taskRepository;
        this.inventoryService = inventoryService;
        this.roleResourceService = roleResourceService;
    }
    
    @Override
    public List<RoleTask> getRoleTasks(Long roleId) {
        return roleTaskRepository.findByRoleId(roleId);
    }
    
    @Override
    public List<RoleTask> getRoleTasksByStatus(Long roleId, Integer status) {
        // 这里需要根据实际的状态映射进行调整
        String statusStr = "in_progress";
        if (status == 2) statusStr = "completed";
        if (status == 3) statusStr = "claimed";
        return roleTaskRepository.findByRoleIdAndStatus(roleId, statusStr);
    }
    
    @Override
    public RoleTask getRoleTask(Long roleId, Long taskId) {
        return roleTaskRepository.findByRoleIdAndTaskId(roleId, taskId).orElse(null);
    }
    
    @Override
    @Transactional
    public RoleTask acceptTask(Long roleId, Long taskId) {
        // 检查任务是否存在
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        
        // 检查是否已经接取了该任务
        Optional<RoleTask> existingTaskOpt = roleTaskRepository.findByRoleIdAndTaskId(roleId, taskId);
        if (existingTaskOpt.isPresent()) {
            RoleTask existingTask = existingTaskOpt.get();
            if (!"claimed".equals(existingTask.getStatus())) {
                throw new RuntimeException("该任务已在进行中");
            }
        }
        
        // 创建新的任务实例
        RoleTask roleTask = new RoleTask();
        roleTask.setRoleId(roleId);
        roleTask.setTaskId(taskId);
        roleTask.setProgress(0);
        roleTask.setTarget(task.getConditionValue());
        roleTask.setStatus("in_progress");
        roleTask.setCreateTime(LocalDateTime.now());
        roleTask.setUpdateTime(LocalDateTime.now());
        
        return roleTaskRepository.save(roleTask);
    }
    
    @Override
    @Transactional
    public RoleTask updateTaskProgress(Long roleId, Long taskId, Integer progress) {
        RoleTask roleTask = roleTaskRepository.findByRoleIdAndTaskId(roleId, taskId).orElse(null);
        if (roleTask == null) {
            throw new RuntimeException("任务不存在");
        }
        
        if (!"in_progress".equals(roleTask.getStatus())) {
            throw new RuntimeException("任务不在进行中");
        }
        
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        
        int target = task.getConditionValue();
        roleTask.setProgress(Math.min(progress, target));
        roleTask.setUpdateTime(LocalDateTime.now());
        
        if (roleTask.getProgress() >= target) {
            roleTask.setStatus("completed");
        }
        
        return roleTaskRepository.save(roleTask);
    }
    
    @Override
    @Transactional
    public RoleTask completeTask(Long roleId, Long taskId) {
        RoleTask roleTask = roleTaskRepository.findByRoleIdAndTaskId(roleId, taskId).orElse(null);
        if (roleTask == null) {
            throw new RuntimeException("任务不存在");
        }
        
        if (!"in_progress".equals(roleTask.getStatus())) {
            throw new RuntimeException("任务不在进行中");
        }
        
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        
        roleTask.setProgress(task.getConditionValue());
        roleTask.setStatus("completed");
        roleTask.setUpdateTime(LocalDateTime.now());
        
        return roleTaskRepository.save(roleTask);
    }
    
    @Override
    @Transactional
    public RoleTask claimTaskReward(Long roleId, Long taskId) {
        RoleTask roleTask = roleTaskRepository.findByRoleIdAndTaskId(roleId, taskId).orElse(null);
        if (roleTask == null) {
            throw new RuntimeException("任务不存在");
        }
        
        if (!"completed".equals(roleTask.getStatus())) {
            throw new RuntimeException("任务未完成");
        }
        
        // 获取任务信息
        Task task = taskRepository.findById(taskId).orElse(null);
        if (task == null) {
            throw new RuntimeException("任务不存在");
        }
        
        // 发放奖励
        try {
            // 这里简化处理，实际应该解析rewards JSON字段
            // 暂时发放固定奖励
            roleResourceService.addResource(roleId, 1L, 100); // 假设1是修为资源类型ID，发放100修为
            roleResourceService.addResource(roleId, 2L, 50); // 假设2是灵石资源类型ID，发放50灵石
            
            // 更新任务状态
            roleTask.setStatus("claimed");
            roleTask.setClaimTime(LocalDateTime.now());
            roleTask.setUpdateTime(LocalDateTime.now());
            
            return roleTaskRepository.save(roleTask);
        } catch (Exception e) {
            // 事务会自动回滚
            throw new RuntimeException("领取奖励失败: " + e.getMessage());
        }
    }
    
    @Override
    @Transactional
    public void abandonTask(Long roleId, Long taskId) {
        RoleTask roleTask = roleTaskRepository.findByRoleIdAndTaskId(roleId, taskId).orElse(null);
        if (roleTask == null) {
            throw new RuntimeException("任务不存在");
        }
        
        roleTaskRepository.delete(roleTask);
    }
}