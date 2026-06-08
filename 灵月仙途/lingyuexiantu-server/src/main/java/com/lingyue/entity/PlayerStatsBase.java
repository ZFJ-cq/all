package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "t_player_stats_base")
public class PlayerStatsBase {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id", nullable = false, unique = true)
    private Long roleId;
    
    @Column(name = "player_id")
    private Long playerId;
    
    @Column(name = "realm_level", nullable = false, columnDefinition = "TINYINT UNSIGNED DEFAULT 1")
    private Integer realmLevel;
    
    @Column(name = "realm_stage", nullable = false, columnDefinition = "TINYINT UNSIGNED DEFAULT 1")
    private Integer realmStage;
    
    @Column(name = "exp_curr", nullable = false, columnDefinition = "BIGINT UNSIGNED DEFAULT 0")
    private Long expCurr;
    
    @Column(name = "exp_max", nullable = false, columnDefinition = "BIGINT UNSIGNED DEFAULT 1000")
    private Long expMax;
    
    @Column(name = "cultivation_speed", nullable = false, columnDefinition = "DECIMAL(10,4) DEFAULT 1.0000")
    private Double cultivationSpeed;
    
    @Column(name = "base_vit", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 10")
    private Integer baseVit;
    
    @Column(name = "base_spi", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 10")
    private Integer baseSpi;
    
    @Column(name = "base_agi", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 10")
    private Integer baseAgi;
    
    @Column(name = "base_wis", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 10")
    private Integer baseWis;
    
    @Column(name = "base_lck", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 5")
    private Integer baseLck;
    
    @Column(name = "perm_vit", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer permVit;
    
    @Column(name = "perm_spi", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer permSpi;
    
    @Column(name = "perm_agi", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer permAgi;
    
    @Column(name = "perm_wis", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer permWis;
    
    @Column(name = "perm_lck", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer permLck;
    
    @Column(name = "tmp_vit", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer tmpVit;
    
    @Column(name = "tmp_spi", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer tmpSpi;
    
    @Column(name = "tmp_agi", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer tmpAgi;
    
    @Column(name = "tmp_wis", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer tmpWis;
    
    @Column(name = "tmp_lck", nullable = false, columnDefinition = "INT UNSIGNED DEFAULT 0")
    private Integer tmpLck;
    
    @Column(name = "last_calc_ver", columnDefinition = "BIGINT UNSIGNED DEFAULT 0")
    private Long lastCalcVer;
    
    @Column(name = "updated_at", columnDefinition = "DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)")
    private LocalDateTime updatedAt;

    public PlayerStatsBase() {
        this.realmLevel = 1;
        this.realmStage = 1;
        this.expCurr = 0L;
        this.expMax = 1000L;
        this.cultivationSpeed = 1.0;
        this.baseVit = 10;
        this.baseSpi = 10;
        this.baseAgi = 10;
        this.baseWis = 10;
        this.baseLck = 5;
        this.permVit = 0;
        this.permSpi = 0;
        this.permAgi = 0;
        this.permWis = 0;
        this.permLck = 0;
        this.tmpVit = 0;
        this.tmpSpi = 0;
        this.tmpAgi = 0;
        this.tmpWis = 0;
        this.tmpLck = 0;
        this.lastCalcVer = 0L;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    
    public Long getPlayerId() { return playerId; }
    public void setPlayerId(Long playerId) { this.playerId = playerId; }
    
    public Integer getRealmLevel() { return realmLevel; }
    public void setRealmLevel(Integer realmLevel) { this.realmLevel = realmLevel; }
    public Integer getRealmStage() { return realmStage; }
    public void setRealmStage(Integer realmStage) { this.realmStage = realmStage; }
    public Long getExpCurr() { return expCurr; }
    public void setExpCurr(Long expCurr) { this.expCurr = expCurr; }
    public Long getExpMax() { return expMax; }
    public void setExpMax(Long expMax) { this.expMax = expMax; }
    public Double getCultivationSpeed() { return cultivationSpeed; }
    public void setCultivationSpeed(Double cultivationSpeed) { this.cultivationSpeed = cultivationSpeed; }
    public Integer getBaseVit() { return baseVit; }
    public void setBaseVit(Integer baseVit) { this.baseVit = baseVit; }
    public Integer getBaseSpi() { return baseSpi; }
    public void setBaseSpi(Integer baseSpi) { this.baseSpi = baseSpi; }
    public Integer getBaseAgi() { return baseAgi; }
    public void setBaseAgi(Integer baseAgi) { this.baseAgi = baseAgi; }
    public Integer getBaseWis() { return baseWis; }
    public void setBaseWis(Integer baseWis) { this.baseWis = baseWis; }
    public Integer getBaseLck() { return baseLck; }
    public void setBaseLck(Integer baseLck) { this.baseLck = baseLck; }
    public Integer getPermVit() { return permVit; }
    public void setPermVit(Integer permVit) { this.permVit = permVit; }
    public Integer getPermSpi() { return permSpi; }
    public void setPermSpi(Integer permSpi) { this.permSpi = permSpi; }
    public Integer getPermAgi() { return permAgi; }
    public void setPermAgi(Integer permAgi) { this.permAgi = permAgi; }
    public Integer getPermWis() { return permWis; }
    public void setPermWis(Integer permWis) { this.permWis = permWis; }
    public Integer getPermLck() { return permLck; }
    public void setPermLck(Integer permLck) { this.permLck = permLck; }
    public Integer getTmpVit() { return tmpVit; }
    public void setTmpVit(Integer tmpVit) { this.tmpVit = tmpVit; }
    public Integer getTmpSpi() { return tmpSpi; }
    public void setTmpSpi(Integer tmpSpi) { this.tmpSpi = tmpSpi; }
    public Integer getTmpAgi() { return tmpAgi; }
    public void setTmpAgi(Integer tmpAgi) { this.tmpAgi = tmpAgi; }
    public Integer getTmpWis() { return tmpWis; }
    public void setTmpWis(Integer tmpWis) { this.tmpWis = tmpWis; }
    public Integer getTmpLck() { return tmpLck; }
    public void setTmpLck(Integer tmpLck) { this.tmpLck = tmpLck; }
    public Long getLastCalcVer() { return lastCalcVer; }
    public void setLastCalcVer(Long lastCalcVer) { this.lastCalcVer = lastCalcVer; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public int getTotalVit() {
        return baseVit + permVit + tmpVit + (realmLevel * 2);
    }
    
    public int getTotalSpi() {
        return baseSpi + permSpi + tmpSpi + (realmLevel * 3);
    }
    
    public int getTotalAgi() {
        return baseAgi + permAgi + tmpAgi + realmLevel;
    }
    
    public int getTotalWis() {
        return baseWis + permWis + tmpWis + realmLevel;
    }
    
    public int getTotalLck() {
        return baseLck + permLck + tmpLck;
    }
}
