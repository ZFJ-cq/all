package com.lingyue.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 宗门建筑实体
 */
@Data
@Entity
@Table(name = "clan_building")
public class ClanBuilding {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "clan_id", nullable = false)
    private Long clanId;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "level", nullable = false)
    private Integer level = 1;
    
    @Column(name = "max_level", nullable = false)
    private Integer maxLevel = 10;
    
    @Column(name = "effect", length = 200)
    private String effect;
    
    @Column(name = "upgrade_cost", nullable = false)
    private Integer upgradeCost = 1000;
    
    @Column(name = "type", length = 20)
    private String type = "normal";
    
    @Column(name = "status")
    private Integer status = 1; // 0-停用，1-启用
    
    @Column(name = "create_time")
    private LocalDateTime createTime;
    
    @Column(name = "update_time")
    private LocalDateTime updateTime;
    
    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
    
    // Manual getters and setters for compatibility
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getClanId() { return clanId; }
    public void setClanId(Long clanId) { this.clanId = clanId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    public Integer getMaxLevel() { return maxLevel; }
    public void setMaxLevel(Integer maxLevel) { this.maxLevel = maxLevel; }
    public String getEffect() { return effect; }
    public void setEffect(String effect) { this.effect = effect; }
    public Integer getUpgradeCost() { return upgradeCost; }
    public void setUpgradeCost(Integer upgradeCost) { this.upgradeCost = upgradeCost; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
