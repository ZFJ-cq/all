package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "role_base_stats")
public class RoleBaseStats {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id", unique = true, nullable = false)
    private Long roleId;
    
    private Integer vit; // 根骨
    private Integer spi; // 灵力
    private Integer agi; // 身法
    private Integer wis; // 悟性
    private Integer lck; // 气运
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public RoleBaseStats() {
    }
    
    public RoleBaseStats(Long id, Long roleId, Integer vit, Integer spi, Integer agi, Integer wis, Integer lck, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.roleId = roleId;
        this.vit = vit;
        this.spi = spi;
        this.agi = agi;
        this.wis = wis;
        this.lck = lck;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
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
    
    public Integer getVit() {
        return vit;
    }
    
    public void setVit(Integer vit) {
        this.vit = vit;
    }
    
    public Integer getSpi() {
        return spi;
    }
    
    public void setSpi(Integer spi) {
        this.spi = spi;
    }
    
    public Integer getAgi() {
        return agi;
    }
    
    public void setAgi(Integer agi) {
        this.agi = agi;
    }
    
    public Integer getWis() {
        return wis;
    }
    
    public void setWis(Integer wis) {
        this.wis = wis;
    }
    
    public Integer getLck() {
        return lck;
    }
    
    public void setLck(Integer lck) {
        this.lck = lck;
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
