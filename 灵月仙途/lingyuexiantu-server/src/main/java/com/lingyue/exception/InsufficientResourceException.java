package com.lingyue.exception;

/**
 * 资源不足异常
 */
public class InsufficientResourceException extends RuntimeException {
    public InsufficientResourceException(String message) {
        super(message);
    }
    
    public InsufficientResourceException(String message, Throwable cause) {
        super(message, cause);
    }
}
