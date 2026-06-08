package com.lingyue.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 突破历史记录实体
 */
@Entity
@Table(name = "breakthrough_history")
public class BreakthroughHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Column(name = "role_name", length = 50)
    private String roleName;

    @Column(name = "from_realm", nullable = false, length = 50)
    private String fromRealm;

    @Column(name = "to_realm", nullable = false, length = 50)
    private String toRealm;

    @Column(name = "success_rate", nullable = false, precision = 5, scale = 2)
    private BigDecimal successRate;

    @Column(name = "random_seed", precision = 5, scale = 2)
    private BigDecimal randomSeed;

    @Column(name = "is_success", nullable = false)
    private Integer isSuccess;

    @Column(name = "consumed_xiuwei", nullable = false)
    private Integer consumedXiuwei;

    @Column(name = "penalty_type", length = 20)
    private String penaltyType;

    @Column(name = "penalty_value")
    private Integer penaltyValue;

    @Column(name = "pity_count")
    private Integer pityCount;

    @Column(name = "bonus_items", length = 500)
    private String bonusItems;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "create_time")
    private LocalDateTime createTime = LocalDateTime.now();

    // 构造函数
    public BreakthroughHistory() {}

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

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getFromRealm() {
        return fromRealm;
    }

    public void setFromRealm(String fromRealm) {
        this.fromRealm = fromRealm;
    }

    public String getToRealm() {
        return toRealm;
    }

    public void setToRealm(String toRealm) {
        this.toRealm = toRealm;
    }

    public BigDecimal getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(BigDecimal successRate) {
        this.successRate = successRate;
    }

    public BigDecimal getRandomSeed() {
        return randomSeed;
    }

    public void setRandomSeed(BigDecimal randomSeed) {
        this.randomSeed = randomSeed;
    }

    public Integer getIsSuccess() {
        return isSuccess;
    }

    public void setIsSuccess(Integer isSuccess) {
        this.isSuccess = isSuccess;
    }

    public Integer getConsumedXiuwei() {
        return consumedXiuwei;
    }

    public void setConsumedXiuwei(Integer consumedXiuwei) {
        this.consumedXiuwei = consumedXiuwei;
    }

    public String getPenaltyType() {
        return penaltyType;
    }

    public void setPenaltyType(String penaltyType) {
        this.penaltyType = penaltyType;
    }

    public Integer getPenaltyValue() {
        return penaltyValue;
    }

    public void setPenaltyValue(Integer penaltyValue) {
        this.penaltyValue = penaltyValue;
    }

    public Integer getPityCount() {
        return pityCount;
    }

    public void setPityCount(Integer pityCount) {
        this.pityCount = pityCount;
    }

    public String getBonusItems() {
        return bonusItems;
    }

    public void setBonusItems(String bonusItems) {
        this.bonusItems = bonusItems;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getCreateTime() {
        return createTime;
    }

    public void setCreateTime(LocalDateTime createTime) {
        this.createTime = createTime;
    }
}