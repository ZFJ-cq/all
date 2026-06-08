package com.lingyue.dto;

import java.math.BigDecimal;

public class AttributeDTO {
    
    private Long roleId;
    
    private Long hp;
    private Long hpMax;
    private Long mp;
    private Long mpMax;
    private Long atk;
    private Long def;
    private Long speed;
    
    private BigDecimal critRate;
    private BigDecimal critDmg;
    private BigDecimal dodgeRate;
    private BigDecimal hitRate;
    private BigDecimal tenacity;
    private BigDecimal expBonus;
    
    private Integer totalVit;
    private Integer totalSpi;
    private Integer totalAgi;
    private Integer totalWis;
    private Integer totalLck;
    
    private Integer realmLevel;
    private String realmName;
    
    private Integer age;
    private Integer maxAge;
    private Integer lifeStatus;
    
    public AttributeDTO() {
        this.critRate = BigDecimal.ZERO;
        this.critDmg = BigDecimal.valueOf(150);
        this.dodgeRate = BigDecimal.ZERO;
        this.hitRate = BigDecimal.valueOf(100);
        this.tenacity = BigDecimal.ZERO;
        this.expBonus = BigDecimal.ONE;
    }
    
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
    
    public BigDecimal getCritDmg() { return critDmg; }
    public void setCritDmg(BigDecimal critDmg) { this.critDmg = critDmg; }
    
    public BigDecimal getDodgeRate() { return dodgeRate; }
    public void setDodgeRate(BigDecimal dodgeRate) { this.dodgeRate = dodgeRate; }
    
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
    
    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }
    
    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }
    
    public Integer getLifeStatus() { return lifeStatus; }
    public void setLifeStatus(Integer lifeStatus) { this.lifeStatus = lifeStatus; }
}
