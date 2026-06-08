package com.lingyue.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "role_clan_skill")
public class RoleClanSkill {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id")
    private Long roleId;
    
    @Column(name = "clan_skill_id")
    private Long clanSkillId;
    
    @Column(name = "skill_level")
    private Integer skillLevel;
    
    @Column(name = "learn_time")
    private Date learnTime;
    
    public RoleClanSkill() {
    }
    
    public RoleClanSkill(Long id, Long roleId, Long clanSkillId, Integer skillLevel, Date learnTime) {
        this.id = id;
        this.roleId = roleId;
        this.clanSkillId = clanSkillId;
        this.skillLevel = skillLevel;
        this.learnTime = learnTime;
    }
    
    // Getters and Setters
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
    
    public Long getClanSkillId() {
        return clanSkillId;
    }
    
    public void setClanSkillId(Long clanSkillId) {
        this.clanSkillId = clanSkillId;
    }
    
    public Integer getSkillLevel() {
        return skillLevel;
    }
    
    public void setSkillLevel(Integer skillLevel) {
        this.skillLevel = skillLevel;
    }
    
    public Date getLearnTime() {
        return learnTime;
    }
    
    public void setLearnTime(Date learnTime) {
        this.learnTime = learnTime;
    }
}
