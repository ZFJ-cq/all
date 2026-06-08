package com.lingyue.dto;

import java.util.Date;

public class RoleTaskDTO {
    private Long id;
    private Long roleId;
    private Long taskId;
    private TaskDTO task;
    private Integer status;
    private Integer currentProgress;
    private Integer targetCount;
    private Integer loopCount;
    private Date acceptTime;
    private Date completeTime;
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getRoleId() {
        return roleId;
    }
    
    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
    
    public Long getTaskId() {
        return taskId;
    }
    
    public void setTaskId(Long taskId) {
        this.taskId = taskId;
    }
    
    public TaskDTO getTask() {
        return task;
    }
    
    public void setTask(TaskDTO task) {
        this.task = task;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    public Integer getCurrentProgress() {
        return currentProgress;
    }
    
    public void setCurrentProgress(Integer currentProgress) {
        this.currentProgress = currentProgress;
    }
    
    public Integer getTargetCount() {
        return targetCount;
    }
    
    public void setTargetCount(Integer targetCount) {
        this.targetCount = targetCount;
    }
    
    public Integer getLoopCount() {
        return loopCount;
    }
    
    public void setLoopCount(Integer loopCount) {
        this.loopCount = loopCount;
    }
    
    public Date getAcceptTime() {
        return acceptTime;
    }
    
    public void setAcceptTime(Date acceptTime) {
        this.acceptTime = acceptTime;
    }
    
    public Date getCompleteTime() {
        return completeTime;
    }
    
    public void setCompleteTime(Date completeTime) {
        this.completeTime = completeTime;
    }
}
