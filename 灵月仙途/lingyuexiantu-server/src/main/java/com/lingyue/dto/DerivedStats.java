package com.lingyue.dto;

import java.math.BigDecimal;
import java.util.Map;

public class DerivedStats {
    private int maxHp;
    private int attack;
    private int defense;
    private int speed;
    private BigDecimal critRate;
    private BigDecimal dodgeRate;
    private BigDecimal hitRate;
    private BigDecimal expBonus;
    private int powerLevel; // 战力
    private Map<String, Object> detail; // 用于前端展示来源
    
    public DerivedStats() {
    }
    
    public DerivedStats(int maxHp, int attack, int defense, int speed, BigDecimal critRate, BigDecimal dodgeRate, BigDecimal hitRate, BigDecimal expBonus, int powerLevel, Map<String, Object> detail) {
        this.maxHp = maxHp;
        this.attack = attack;
        this.defense = defense;
        this.speed = speed;
        this.critRate = critRate;
        this.dodgeRate = dodgeRate;
        this.hitRate = hitRate;
        this.expBonus = expBonus;
        this.powerLevel = powerLevel;
        this.detail = detail;
    }
    
    // Getters and Setters
    public int getMaxHp() { return maxHp; }
    public void setMaxHp(int maxHp) { this.maxHp = maxHp; }
    public int getAttack() { return attack; }
    public void setAttack(int attack) { this.attack = attack; }
    public int getDefense() { return defense; }
    public void setDefense(int defense) { this.defense = defense; }
    public int getSpeed() { return speed; }
    public void setSpeed(int speed) { this.speed = speed; }
    public BigDecimal getCritRate() { return critRate; }
    public void setCritRate(BigDecimal critRate) { this.critRate = critRate; }
    public BigDecimal getDodgeRate() { return dodgeRate; }
    public void setDodgeRate(BigDecimal dodgeRate) { this.dodgeRate = dodgeRate; }
    public BigDecimal getHitRate() { return hitRate; }
    public void setHitRate(BigDecimal hitRate) { this.hitRate = hitRate; }
    public BigDecimal getExpBonus() { return expBonus; }
    public void setExpBonus(BigDecimal expBonus) { this.expBonus = expBonus; }
    public int getPowerLevel() { return powerLevel; }
    public void setPowerLevel(int powerLevel) { this.powerLevel = powerLevel; }
    public Map<String, Object> getDetail() { return detail; }
    public void setDetail(Map<String, Object> detail) { this.detail = detail; }
}