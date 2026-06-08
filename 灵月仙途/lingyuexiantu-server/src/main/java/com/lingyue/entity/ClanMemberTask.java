package com.lingyue.entity;

import jakarta.persistence.*;
import java.util.Date;

/**
 * 宗门成员任务进度实体
 */
@Entity
@Table(name = "clan_member_task")
public class ClanMemberTask {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "clan_id", nullable = false)
    private Long clanId;
    
    @Column(name = "role_id", nullable = false)
    private Long roleId;
    
    @Column(name = "task_id", nullable = false)
    private Long taskId;
    
    @Column(name = "progress", nullable = false)
    private Integer progress = 0;
    
    @Column(name = "status", length = 20)
    private String status = "available";
    
    @Column(name = "accept_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date acceptTime;
    
    @Column(name = "complete_time")
    @Temporal(TemporalType.TIMESTAMP)
    private Date completeTime;
    
    // Getters and Setters
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getClanId() {
        return clanId;
    }
    
    public void setClanId(Long clanId) {
        this.clanId = clanId;
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
    
    public Integer getProgress() {
        return progress;
    }
    
    public void setProgress(Integer progress) {
        this.progress = progress;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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
