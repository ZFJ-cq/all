package com.lingyue.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "role_checkin")
public class RoleCheckin {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long roleId;
    
    @Column(nullable = false)
    private Integer month;
    
    @Column(nullable = false)
    private Integer year;
    
    // 存储 30 天的签到状态，用逗号分隔：1-签到，0-未签到，2-补签
    @Column(length = 100)
    private String checkinDays;
    
    private LocalDate lastCheckinDate;
    
    private Integer continuousDays = 0;
    
    private Integer totalDays = 0;
    
    private Integer supplementCount = 0; // 补签次数
    
    private LocalDate createTime;
    
    private LocalDate updateTime;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    
    public String getCheckinDays() { return checkinDays; }
    public void setCheckinDays(String checkinDays) { this.checkinDays = checkinDays; }
    
    public LocalDate getLastCheckinDate() { return lastCheckinDate; }
    public void setLastCheckinDate(LocalDate lastCheckinDate) { this.lastCheckinDate = lastCheckinDate; }
    
    public Integer getContinuousDays() { return continuousDays; }
    public void setContinuousDays(Integer continuousDays) { this.continuousDays = continuousDays; }
    
    public Integer getTotalDays() { return totalDays; }
    public void setTotalDays(Integer totalDays) { this.totalDays = totalDays; }
    
    public Integer getSupplementCount() { return supplementCount; }
    public void setSupplementCount(Integer supplementCount) { this.supplementCount = supplementCount; }
    
    public LocalDate getCreateTime() { return createTime; }
    public void setCreateTime(LocalDate createTime) { this.createTime = createTime; }
    
    public LocalDate getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDate updateTime) { this.updateTime = updateTime; }
}
