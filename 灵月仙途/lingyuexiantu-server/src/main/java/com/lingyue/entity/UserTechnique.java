package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_techniques", 
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "technique_id"}),
    indexes = {
        @Index(name = "idx_user_equipped", columnList = "user_id, is_equipped"),
        @Index(name = "idx_role_equipped", columnList = "role_id, is_equipped")
    })
public class UserTechnique {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "role_id", nullable = false)
    private Long roleId;
    
    @Column(name = "technique_id", nullable = false)
    private Long techniqueId;
    
    @Column(name = "is_equipped", nullable = false)
    private Boolean isEquipped;
    
    @Column(name = "acquired_at", nullable = false)
    private LocalDateTime acquiredAt;
    
    @Column(name = "equipped_at")
    private LocalDateTime equippedAt;
    
    @Column(name = "unequipped_at")
    private LocalDateTime unequippedAt;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isEquipped == null) isEquipped = false;
        if (acquiredAt == null) acquiredAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Constructors
    public UserTechnique() {}
    
    public UserTechnique(Long userId, Long roleId, Long techniqueId) {
        this.userId = userId;
        this.roleId = roleId;
        this.techniqueId = techniqueId;
        this.isEquipped = false;
        this.acquiredAt = LocalDateTime.now();
    }
    
    // Getters and Setters
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
    
    public Long getRoleId() {
        return roleId;
    }
    
    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
    
    public Long getTechniqueId() {
        return techniqueId;
    }
    
    public void setTechniqueId(Long techniqueId) {
        this.techniqueId = techniqueId;
    }
    
    public Boolean getIsEquipped() {
        return isEquipped;
    }
    
    public void setIsEquipped(Boolean isEquipped) {
        this.isEquipped = isEquipped;
    }
    
    public LocalDateTime getAcquiredAt() {
        return acquiredAt;
    }
    
    public void setAcquiredAt(LocalDateTime acquiredAt) {
        this.acquiredAt = acquiredAt;
    }
    
    public LocalDateTime getEquippedAt() {
        return equippedAt;
    }
    
    public void setEquippedAt(LocalDateTime equippedAt) {
        this.equippedAt = equippedAt;
    }
    
    public LocalDateTime getUnequippedAt() {
        return unequippedAt;
    }
    
    public void setUnequippedAt(LocalDateTime unequippedAt) {
        this.unequippedAt = unequippedAt;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}