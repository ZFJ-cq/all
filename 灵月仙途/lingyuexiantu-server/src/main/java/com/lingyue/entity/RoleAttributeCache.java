package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 角色属性缓存实体
 */
@Entity
@Table(name = "t_role_attribute_cache")
public class RoleAttributeCache {
    
    @Id
    @Column(name = "role_id")
    private Long roleId;
    
    private Long hp;
    
    @Column(name = "hp_max")
    private Long hpMax;
    
    private Long mp;
    
    @Column(name = "mp_max")
    private Long mpMax;
    
    private Long atk;
    
    private Long def;
    
    private Long speed;
    
    @Column(name = "crit_rate")
    private BigDecimal critRate;
    
    @Column(name = "dodge_rate")
    private BigDecimal dodgeRate;
    
    @Column(name = "crit_dmg")
    private BigDecimal critDmg;
    
    @Column(name = "hit_rate")
    private BigDecimal hitRate;
    
    @Column(name = "tenacity")
    private BigDecimal tenacity;
    
    @Column(name = "exp_bonus")
    private BigDecimal expBonus;
    
    @Column(name = "total_vit")
    private Integer totalVit;
    
    @Column(name = "total_spi")
    private Integer totalSpi;
    
    @Column(name = "total_agi")
    private Integer totalAgi;
    
    @Column(name = "total_wis")
    private Integer totalWis;
    
    @Column(name = "total_lck")
    private Integer totalLck;
    
    @Column(name = "realm_level")
    private Integer realmLevel;
    
    @Column(name = "realm_name", length = 50)
    private String realmName;
    
    @Column(name = "equipment_bonus", columnDefinition = "TEXT")
    private String equipmentBonus;
    
    @Column(name = "skill_bonus", columnDefinition = "TEXT")
    private String skillBonus;
    
    @Column(name = "buff_bonus", columnDefinition = "TEXT")
    private String buffBonus;
    
    @Column(name = "calc_version")
    private Long calcVersion;
    
    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;
    
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Constructors
    public RoleAttributeCache() {
        this.critRate = BigDecimal.ZERO;
        this.dodgeRate = BigDecimal.ZERO;
        this.critDmg = BigDecimal.valueOf(150);
        this.hitRate = BigDecimal.valueOf(100);
        this.tenacity = BigDecimal.ZERO;
        this.expBonus = BigDecimal.ONE;
        this.totalVit = 0;
        this.totalSpi = 0;
        this.totalAgi = 0;
        this.totalWis = 0;
        this.totalLck = 0;
        this.calcVersion = 0L;
    }
    
    // Getters and Setters
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    
    public Long getHp() { return hp; }
    public void setHp(Long hp) { this.hp = hp; }
    
    public Long getHpMax() { return hpMax; }
    public void setHpMax(Long hpMax) { this.hpMax = hpMax; }
    
    public Long getMp() { return mp; }
    public void setMp(Long mp) { this.mp = mp; }
    
    public Long getMpMax() { return mpMax; }
    public void setMpMax(Long mpMax) { this.mpMax = mpMax; }
    
    public Long getAtk() { return atk; }
    public void setAtk(Long atk) { this.atk = atk; }
    
    public Long getDef() { return def; }
    public void setDef(Long def) { this.def = def; }
    
    public Long getSpeed() { return speed; }
    public void setSpeed(Long speed) { this.speed = speed; }
    
    public BigDecimal getCritRate() { return critRate; }
    public void setCritRate(BigDecimal critRate) { this.critRate = critRate; }
    
    public BigDecimal getDodgeRate() { return dodgeRate; }
    public void setDodgeRate(BigDecimal dodgeRate) { this.dodgeRate = dodgeRate; }
    
    public BigDecimal getCritDmg() { return critDmg; }
    public void setCritDmg(BigDecimal critDmg) { this.critDmg = critDmg; }
    
    public BigDecimal getHitRate() { return hitRate; }
    public void setHitRate(BigDecimal hitRate) { this.hitRate = hitRate; }
    
    public BigDecimal getTenacity() { return tenacity; }
    public void setTenacity(BigDecimal tenacity) { this.tenacity = tenacity; }
    
    public BigDecimal getExpBonus() { return expBonus; }
    public void setExpBonus(BigDecimal expBonus) { this.expBonus = expBonus; }
    
    public Integer getTotalVit() { return totalVit; }
    public void setTotalVit(Integer totalVit) { this.totalVit = totalVit; }
    
    public Integer getTotalSpi() { return totalSpi; }
    public void setTotalSpi(Integer totalSpi) { this.totalSpi = totalSpi; }
    
    public Integer getTotalAgi() { return totalAgi; }
    public void setTotalAgi(Integer totalAgi) { this.totalAgi = totalAgi; }
    
    public Integer getTotalWis() { return totalWis; }
    public void setTotalWis(Integer totalWis) { this.totalWis = totalWis; }
    
    public Integer getTotalLck() { return totalLck; }
    public void setTotalLck(Integer totalLck) { this.totalLck = totalLck; }
    
    public Integer getRealmLevel() { return realmLevel; }
    public void setRealmLevel(Integer realmLevel) { this.realmLevel = realmLevel; }
    
    public String getRealmName() { return realmName; }
    public void setRealmName(String realmName) { this.realmName = realmName; }
    
    public String getEquipmentBonus() { return equipmentBonus; }
    public void setEquipmentBonus(String equipmentBonus) { this.equipmentBonus = equipmentBonus; }
    
    public String getSkillBonus() { return skillBonus; }
    public void setSkillBonus(String skillBonus) { this.skillBonus = skillBonus; }
    
    public String getBuffBonus() { return buffBonus; }
    public void setBuffBonus(String buffBonus) { this.buffBonus = buffBonus; }
    
    public Long getCalcVersion() { return calcVersion; }
    public void setCalcVersion(Long calcVersion) { this.calcVersion = calcVersion; }
    
    public LocalDateTime getCalculatedAt() { return calculatedAt; }
    public void setCalculatedAt(LocalDateTime calculatedAt) { this.calculatedAt = calculatedAt; }
    
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
