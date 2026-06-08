package com.lingyue.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "sect_apply")
public class SectApply {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "sect_id")
    private Long sectId;
    
    private String message;
    
    private Integer status; // 0: 待审核, 1: 同意, 2: 拒绝
    
    @Column(name = "apply_time")
    private Date applyTime;
    
    @Column(name = "handle_time")
    private Date handleTime;
    
    @Column(name = "handler_id")
    private Long handlerId;
    
    public SectApply() {
    }
    
    public SectApply(Long id, Long userId, Long sectId, String message, Integer status, Date applyTime, Date handleTime, Long handlerId) {
        this.id = id;
        this.userId = userId;
        this.sectId = sectId;
        this.message = message;
        this.status = status;
        this.applyTime = applyTime;
        this.handleTime = handleTime;
        this.handlerId = handlerId;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
    }
    
    public Long getSectId() {
        return sectId;
    }
    
    public void setSectId(Long sectId) {
        this.sectId = sectId;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public Integer getStatus() {
        return status;
    }
    
    public void setStatus(Integer status) {
        this.status = status;
    }
    
    public Date getApplyTime() {
        return applyTime;
    }
    
    public void setApplyTime(Date applyTime) {
        this.applyTime = applyTime;
    }
    
    public Date getHandleTime() {
        return handleTime;
    }
    
    public void setHandleTime(Date handleTime) {
        this.handleTime = handleTime;
    }
    
    public Long getHandlerId() {
        return handlerId;
    }
    
    public void setHandlerId(Long handlerId) {
        this.handlerId = handlerId;
    }
}
