package com.lingyue.exception;

/**
 * 成就已完成异常
 */
public class AchievementAlreadyClaimedException extends AchievementException {
    public AchievementAlreadyClaimedException() {
        super("ACHIEVEMENT_ALREADY_CLAIMED", "该成就奖励已被领取");
    }
}
