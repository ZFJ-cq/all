package com.lingyue.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "clans")
public class Clan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private String logo;
    private int level;
    private int membersCount;
    private int contribution;
    private String leaderName;
    private Long leaderId;
    private String status; // 宗门状态：active, inactive, disbanded
    private String location;
    private int maxMembers;
    private int requiredLevel;
    private Long spiritStone; // 宗门灵石
    
    public Clan() {
    }
    
    public Clan(Long id, String name, String description, String logo, int level, int membersCount, int contribution, String leaderName, Long leaderId, String status, String location, int maxMembers, int requiredLevel, Long spiritStone) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.logo = logo;
        this.level = level;
        this.membersCount = membersCount;
        this.contribution = contribution;
        this.leaderName = leaderName;
        this.leaderId = leaderId;
        this.status = status;
        this.location = location;
        this.maxMembers = maxMembers;
        this.requiredLevel = requiredLevel;
        this.spiritStone = spiritStone;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public String getLogo() {
        return logo;
    }
    
    public void setLogo(String logo) {
        this.logo = logo;
    }
    
    public int getLevel() {
        return level;
    }
    
    public void setLevel(int level) {
        this.level = level;
    }
    
    public int getMembersCount() {
        return membersCount;
    }
    
    public void setMembersCount(int membersCount) {
        this.membersCount = membersCount;
    }
    
    public int getContribution() {
        return contribution;
    }
    
    public void setContribution(int contribution) {
        this.contribution = contribution;
    }
    
    public String getLeaderName() {
        return leaderName;
    }
    
    public void setLeaderName(String leaderName) {
        this.leaderName = leaderName;
    }
    
    public Long getLeaderId() {
        return leaderId;
    }
    
    public void setLeaderId(Long leaderId) {
        this.leaderId = leaderId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getLocation() {
        return location;
    }
    
    public void setLocation(String location) {
        this.location = location;
    }
    
    public int getMaxMembers() {
        return maxMembers;
    }
    
    public void setMaxMembers(int maxMembers) {
        this.maxMembers = maxMembers;
    }
    
    public int getRequiredLevel() {
        return requiredLevel;
    }
    
    public void setRequiredLevel(int requiredLevel) {
        this.requiredLevel = requiredLevel;
    }
    
    public Long getSpiritStone() {
        return spiritStone;
    }
    
    public void setSpiritStone(Long spiritStone) {
        this.spiritStone = spiritStone;
    }
}
