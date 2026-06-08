package com.lingyue.exception;

/**
 * 成就系统异常基类
 */
public class AchievementException extends RuntimeException {
    
    private final String errorCode;
    
    public AchievementException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }
    
    public AchievementException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
