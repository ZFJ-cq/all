package com.lingyue.exception;

/**
 * 奖励发放失败异常
 */
public class RewardDistributionException extends AchievementException {
    public RewardDistributionException(String message) {
        super("REWARD_DISTRIBUTION_FAILED", message);
    }
    
    public RewardDistributionException(String message, Throwable cause) {
        super("REWARD_DISTRIBUTION_FAILED", message, cause);
    }
}
