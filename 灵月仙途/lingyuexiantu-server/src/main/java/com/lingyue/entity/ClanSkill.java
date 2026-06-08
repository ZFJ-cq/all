package com.lingyue.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "clan_skill")
public class ClanSkill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "clan_id")
    private Long clanId;
    
    @Column(name = "skill_name")
    private String skillName;
    
    @Column(name = "skill_level")
    private Integer skillLevel;
    
    @Column(name = "skill_effect")
    private String skillEffect;
    
    @Column(name = "required_level")
    private Integer requiredLevel;
    
    @Column(name = "required_contribution")
    private Long requiredContribution;
    
    @Column(name = "create_time")
    private Date createTime;
    
    @Column(name = "update_time")
    private Date updateTime;
    
    public ClanSkill() {
    }
    
    public ClanSkill(Long id, Long clanId, String skillName, Integer skillLevel, String skillEffect, Integer requiredLevel, Long requiredContribution, Date createTime, Date updateTime) {
        this.id = id;
        this.clanId = clanId;
        this.skillName = skillName;
        this.skillLevel = skillLevel;
        this.skillEffect = skillEffect;
        this.requiredLevel = requiredLevel;
        this.requiredContribution = requiredContribution;
        this.createTime = createTime;
        this.updateTime = updateTime;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getClanId() {
        return clanId;
    }
    
    public void setClanId(Long clanId) {
        this.clanId = clanId;
    }
    
    public String getSkillName() {
        return skillName;
    }
    
    public void setSkillName(String skillName) {
        this.skillName = skillName;
    }
    
    public Integer getSkillLevel() {
        return skillLevel;
    }
    
    public void setSkillLevel(Integer skillLevel) {
        this.skillLevel = skillLevel;
    }
    
    public String getSkillEffect() {
        return skillEffect;
    }
    
    public void setSkillEffect(String skillEffect) {
        this.skillEffect = skillEffect;
    }
    
    public Integer getRequiredLevel() {
        return requiredLevel;
    }
    
    public void setRequiredLevel(Integer requiredLevel) {
        this.requiredLevel = requiredLevel;
    }
    
    public Long getRequiredContribution() {
        return requiredContribution;
    }
    
    public void setRequiredContribution(Long requiredContribution) {
        this.requiredContribution = requiredContribution;
    }
    
    public Date getCreateTime() {
        return createTime;
    }
    
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }
    
    public Date getUpdateTime() {
        return updateTime;
    }
    
    public void setUpdateTime(Date updateTime) {
        this.updateTime = updateTime;
    }
}
