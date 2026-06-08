package com.lingyue.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "clan_member")
public class ClanMember {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "clan_id")
    private Long clanId;
    
    @Column(name = "role_id")
    private Long roleId;
    
    @Column(name = "position")
    private Integer position;
    
    @Column(name = "contribution")
    private Integer contribution;
    
    @Column(name = "join_time")
    private Date joinTime;
    
    @Column(name = "status")
    private Integer status;
    
    @Column(name = "total_contribution")
    private Long totalContribution;
    
    @Column(name = "last_login_time")
    private Date lastLoginTime;
    
    @Column(name = "is_approved")
    private Integer isApproved;

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

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public Integer getContribution() {
        return contribution;
    }

    public void setContribution(Integer contribution) {
        this.contribution = contribution;
    }

    public Date getJoinTime() {
        return joinTime;
    }

    public void setJoinTime(Date joinTime) {
        this.joinTime = joinTime;
    }

    public Integer getStatus() {
        return status;
    }

    public void setStatus(Integer status) {
        this.status = status;
    }

    public Long getTotalContribution() {
        return totalContribution;
    }

    public void setTotalContribution(Long totalContribution) {
        this.totalContribution = totalContribution;
    }

    public Date getLastLoginTime() {
        return lastLoginTime;
    }

    public void setLastLoginTime(Date lastLoginTime) {
        this.lastLoginTime = lastLoginTime;
    }

    public Integer getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Integer isApproved) {
        this.isApproved = isApproved;
    }
}