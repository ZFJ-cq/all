package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * 境界属性倍率配置实体
 */
@Entity
@Table(name = "cfg_realm_attribute_mult")
public class CfgRealmAttributeMult {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "realm_name", nullable = false, length = 50)
    private String realmName;
    
    @Column(name = "realm_level", nullable = false)
    private Integer realmLevel;
    
    @Column(name = "hp_mult", precision = 10, scale = 4)
    private BigDecimal hpMult;
    
    @Column(name = "atk_mult", precision = 10, scale = 4)
    private BigDecimal atkMult;
    
    @Column(name = "def_mult", precision = 10, scale = 4)
    private BigDecimal defMult;
    
    @Column(name = "speed_mult", precision = 10, scale = 4)
    private BigDecimal speedMult;
    
    @Column(name = "crit_mult", precision = 10, scale = 4)
    private BigDecimal critMult;
    
    @Column(name = "dodge_mult", precision = 10, scale = 4)
    private BigDecimal dodgeMult;
    
    @Column(name = "exp_mult", precision = 10, scale = 4)
    private BigDecimal expMult;
    
    @Column(name = "max_age")
    private Integer maxAge;
    
    @Column(name = "vit_bonus")
    private Integer vitBonus;
    
    @Column(name = "spi_bonus")
    private Integer spiBonus;
    
    @Column(name = "agi_bonus")
    private Integer agiBonus;
    
    @Column(name = "wis_bonus")
    private Integer wisBonus;
    
    @Column(name = "lck_bonus")
    private Integer lckBonus;
    
    @Column(length = 200)
    private String description;
    
    // Constructors
    public CfgRealmAttributeMult() {
        this.hpMult = BigDecimal.ONE;
        this.atkMult = BigDecimal.ONE;
        this.defMult = BigDecimal.ONE;
        this.speedMult = BigDecimal.ONE;
        this.critMult = BigDecimal.ONE;
        this.dodgeMult = BigDecimal.ONE;
        this.expMult = BigDecimal.ONE;
        this.maxAge = 100;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getRealmName() { return realmName; }
    public void setRealmName(String realmName) { this.realmName = realmName; }
    
    public Integer getRealmLevel() { return realmLevel; }
    public void setRealmLevel(Integer realmLevel) { this.realmLevel = realmLevel; }
    
    public BigDecimal getHpMult() { return hpMult; }
    public void setHpMult(BigDecimal hpMult) { this.hpMult = hpMult; }
    
    public BigDecimal getAtkMult() { return atkMult; }
    public void setAtkMult(BigDecimal atkMult) { this.atkMult = atkMult; }
    
    public BigDecimal getDefMult() { return defMult; }
    public void setDefMult(BigDecimal defMult) { this.defMult = defMult; }
    
    public BigDecimal getSpeedMult() { return speedMult; }
    public void setSpeedMult(BigDecimal speedMult) { this.speedMult = speedMult; }
    
    public BigDecimal getCritMult() { return critMult; }
    public void setCritMult(BigDecimal critMult) { this.critMult = critMult; }
    
    public BigDecimal getDodgeMult() { return dodgeMult; }
    public void setDodgeMult(BigDecimal dodgeMult) { this.dodgeMult = dodgeMult; }
    
    public BigDecimal getExpMult() { return expMult; }
    public void setExpMult(BigDecimal expMult) { this.expMult = expMult; }
    
    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }
    
    public Integer getVitBonus() { return vitBonus; }
    public void setVitBonus(Integer vitBonus) { this.vitBonus = vitBonus; }
    
    public Integer getSpiBonus() { return spiBonus; }
    public void setSpiBonus(Integer spiBonus) { this.spiBonus = spiBonus; }
    
    public Integer getAgiBonus() { return agiBonus; }
    public void setAgiBonus(Integer agiBonus) { this.agiBonus = agiBonus; }
    
    public Integer getWisBonus() { return wisBonus; }
    public void setWisBonus(Integer wisBonus) { this.wisBonus = wisBonus; }
    
    public Integer getLckBonus() { return lckBonus; }
    public void setLckBonus(Integer lckBonus) { this.lckBonus = lckBonus; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
