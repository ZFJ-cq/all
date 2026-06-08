package com.lingyue.dto;

import java.math.BigDecimal;

/**
 * 修炼结果 DTO
 */
public class CultivateResult {
    
    private Boolean success;
    private String message;
    private Long expGained;
    private BigDecimal painIncrease;
    private Integer toleranceIncrease;
    private Integer partLevelUp;
    private String partName;
    
    public CultivateResult() {}
    
    public CultivateResult(Boolean success, String message, Long expGained, BigDecimal painIncrease, 
                          Integer toleranceIncrease, Integer partLevelUp, String partName) {
        this.success = success;
        this.message = message;
        this.expGained = expGained;
        this.painIncrease = painIncrease;
        this.toleranceIncrease = toleranceIncrease;
        this.partLevelUp = partLevelUp;
        this.partName = partName;
    }
    
    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Long getExpGained() { return expGained; }
    public void setExpGained(Long expGained) { this.expGained = expGained; }
    public BigDecimal getPainIncrease() { return painIncrease; }
    public void setPainIncrease(BigDecimal painIncrease) { this.painIncrease = painIncrease; }
    public Integer getToleranceIncrease() { return toleranceIncrease; }
    public void setToleranceIncrease(Integer toleranceIncrease) { this.toleranceIncrease = toleranceIncrease; }
    public Integer getPartLevelUp() { return partLevelUp; }
    public void setPartLevelUp(Integer partLevelUp) { this.partLevelUp = partLevelUp; }
    public String getPartName() { return partName; }
    public void setPartName(String partName) { this.partName = partName; }
    
    public static CultivateResult success(String message, Long expGained, BigDecimal painIncrease, Integer toleranceIncrease) {
        return new CultivateResult(true, message, expGained, painIncrease, toleranceIncrease, null, null);
    }
    
    public static CultivateResult failure(String message) {
        return new CultivateResult(false, message, 0L, BigDecimal.ZERO, 0, null, null);
    }
}
