package com.lingyue.dto;

/**
 * 突破结果 DTO
 */
public class BreakthroughResult {
    
    private Boolean success;
    private String message;
    private String oldRealmName;
    private String newRealmName;
    private Integer hpBonus;
    private Integer defenseBonus;
    private Integer strengthBonus;
    private Boolean mutationAwakened;
    private String mutationName;
    private String failurePenalty;
    
    public BreakthroughResult() {}
    
    public BreakthroughResult(Boolean success, String message, String oldRealmName, String newRealmName,
                             Integer hpBonus, Integer defenseBonus, Integer strengthBonus,
                             Boolean mutationAwakened, String mutationName, String failurePenalty) {
        this.success = success;
        this.message = message;
        this.oldRealmName = oldRealmName;
        this.newRealmName = newRealmName;
        this.hpBonus = hpBonus;
        this.defenseBonus = defenseBonus;
        this.strengthBonus = strengthBonus;
        this.mutationAwakened = mutationAwakened;
        this.mutationName = mutationName;
        this.failurePenalty = failurePenalty;
    }
    
    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public String getOldRealmName() { return oldRealmName; }
    public void setOldRealmName(String oldRealmName) { this.oldRealmName = oldRealmName; }
    public String getNewRealmName() { return newRealmName; }
    public void setNewRealmName(String newRealmName) { this.newRealmName = newRealmName; }
    public Integer getHpBonus() { return hpBonus; }
    public void setHpBonus(Integer hpBonus) { this.hpBonus = hpBonus; }
    public Integer getDefenseBonus() { return defenseBonus; }
    public void setDefenseBonus(Integer defenseBonus) { this.defenseBonus = defenseBonus; }
    public Integer getStrengthBonus() { return strengthBonus; }
    public void setStrengthBonus(Integer strengthBonus) { this.strengthBonus = strengthBonus; }
    public Boolean getMutationAwakened() { return mutationAwakened; }
    public void setMutationAwakened(Boolean mutationAwakened) { this.mutationAwakened = mutationAwakened; }
    public String getMutationName() { return mutationName; }
    public void setMutationName(String mutationName) { this.mutationName = mutationName; }
    public String getFailurePenalty() { return failurePenalty; }
    public void setFailurePenalty(String failurePenalty) { this.failurePenalty = failurePenalty; }
    
    public static BreakthroughResult success(String message, String oldRealm, String newRealm, 
                                            int hp, int def, int str, boolean mutationAwakened, String mutationName) {
        return new BreakthroughResult(true, message, oldRealm, newRealm, hp, def, str, mutationAwakened, mutationName, null);
    }
    
    public static BreakthroughResult failure(String message, String penalty) {
        return new BreakthroughResult(false, message, null, null, 0, 0, 0, false, null, penalty);
    }
}
