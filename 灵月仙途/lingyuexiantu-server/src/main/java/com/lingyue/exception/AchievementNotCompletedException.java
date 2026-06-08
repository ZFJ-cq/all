package com.lingyue.exception;

/**
 * 成就未完成异常
 */
public class AchievementNotCompletedException extends AchievementException {
    public AchievementNotCompletedException(Long achievementId) {
        super("ACHIEVEMENT_NOT_COMPLETED", "成就未完成，achievementId=" + achievementId);
    }
}
