package com.lingyue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "role_clans")
public class RoleClan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "role_id")
    private Long roleId;
    
    @Column(name = "clan_id")
    private Long clanId;
    
    private String position; // 职位：leader, elder, member
    private int contribution; // 贡献值
    private String joinDate; // 加入日期
    private String status; // 状态：active, inactive, kicked
    
    @Column(name = "`rank`")
    private int rank; // 宗门内排名
    
    public RoleClan() {
    }
    
    public RoleClan(Long id, Long roleId, Long clanId, String position, int contribution, String joinDate, String status, int rank) {
        this.id = id;
        this.roleId = roleId;
        this.clanId = clanId;
        this.position = position;
        this.contribution = contribution;
        this.joinDate = joinDate;
        this.status = status;
        this.rank = rank;
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
    
    public Long getClanId() {
        return clanId;
    }
    
    public void setClanId(Long clanId) {
        this.clanId = clanId;
    }
    
    public String getPosition() {
        return position;
    }
    
    public void setPosition(String position) {
        this.position = position;
    }
    
    public int getContribution() {
        return contribution;
    }
    
    public void setContribution(int contribution) {
        this.contribution = contribution;
    }
    
    public String getJoinDate() {
        return joinDate;
    }
    
    public void setJoinDate(String joinDate) {
        this.joinDate = joinDate;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public int getRank() {
        return rank;
    }
    
    public void setRank(int rank) {
        this.rank = rank;
    }
}
