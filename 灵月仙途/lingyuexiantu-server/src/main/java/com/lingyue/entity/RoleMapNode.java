package com.lingyue.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "role_map_node")
public class RoleMapNode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long roleId;
    private Long mapNodeId;
    private boolean unlocked = false;
    private LocalDateTime unlockedAt;
    private int visitCount = 0;
    private LocalDateTime lastVisitedAt;
    
    @PrePersist
    protected void onCreate() {
        lastVisitedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        lastVisitedAt = LocalDateTime.now();
    }
    
    public RoleMapNode() {
    }
    
    public RoleMapNode(Long id, Long roleId, Long mapNodeId, boolean unlocked, LocalDateTime unlockedAt, int visitCount, LocalDateTime lastVisitedAt) {
        this.id = id;
        this.roleId = roleId;
        this.mapNodeId = mapNodeId;
        this.unlocked = unlocked;
        this.unlockedAt = unlockedAt;
        this.visitCount = visitCount;
        this.lastVisitedAt = lastVisitedAt;
    }
    
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
    
    public Long getMapNodeId() {
        return mapNodeId;
    }
    
    public void setMapNodeId(Long mapNodeId) {
        this.mapNodeId = mapNodeId;
    }
    
    public boolean isUnlocked() {
        return unlocked;
    }
    
    public void setUnlocked(boolean unlocked) {
        this.unlocked = unlocked;
    }
    
    public LocalDateTime getUnlockedAt() {
        return unlockedAt;
    }
    
    public void setUnlockedAt(LocalDateTime unlockedAt) {
        this.unlockedAt = unlockedAt;
    }
    
    public int getVisitCount() {
        return visitCount;
    }
    
    public void setVisitCount(int visitCount) {
        this.visitCount = visitCount;
    }
    
    public LocalDateTime getLastVisitedAt() {
        return lastVisitedAt;
    }
    
    public void setLastVisitedAt(LocalDateTime lastVisitedAt) {
        this.lastVisitedAt = lastVisitedAt;
    }
}