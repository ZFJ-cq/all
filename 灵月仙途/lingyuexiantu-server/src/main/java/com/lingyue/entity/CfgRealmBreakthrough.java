package com.lingyue.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

/**
 * 境界突破需求配置表
 */
@Entity
@Table(name = "cfg_realm_breakthrough")
public class CfgRealmBreakthrough {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Integer id;

    @Column(name = "from_realm", nullable = false, length = 20)
    private String fromRealm;

    @Column(name = "to_realm", nullable = false, length = 20)
    private String toRealm;

    @Column(name = "xiuwei_requirement", nullable = false)
    private Long xiuweiRequirement;

    @Column(name = "pill_name", nullable = false, length = 50)
    private String pillName;

    @Column(name = "success_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal successRate;

    @Column(name = "failure_penalty", nullable = false, length = 100)
    private String failurePenalty;

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
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

    public Long getXiuweiRequirement() {
        return xiuweiRequirement;
    }

    public void setXiuweiRequirement(Long xiuweiRequirement) {
        this.xiuweiRequirement = xiuweiRequirement;
    }

    public String getPillName() {
        return pillName;
    }

    public void setPillName(String pillName) {
        this.pillName = pillName;
    }

    public BigDecimal getSuccessRate() {
        return successRate;
    }

    public void setSuccessRate(BigDecimal successRate) {
        this.successRate = successRate;
    }

    public String getFailurePenalty() {
        return failurePenalty;
    }

    public void setFailurePenalty(String failurePenalty) {
        this.failurePenalty = failurePenalty;
    }
}