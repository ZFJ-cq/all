package com.lingyue.config;

import com.lingyuexiantu.common.Result;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.sql.SQLException;
import java.util.concurrent.TimeoutException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    private static final String DEFAULT_ERROR_MESSAGE = "Internal server error, please try again later";
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Result<?>> handleIllegalArgumentException(IllegalArgumentException e) {
        logger.warn("Invalid argument: {}", e.getMessage());
        Result<?> result = Result.error("Invalid argument: " + e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Result<?>> handleAccessDeniedException(AccessDeniedException e) {
        logger.warn("Access denied: {}", e.getMessage());
        Result<?> result = Result.error("Access denied");
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Result<?>> handleBadCredentialsException(BadCredentialsException e) {
        logger.warn("Authentication failed: {}", e.getMessage());
        Result<?> result = Result.error("Invalid username or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Result<?>> handleValidationException(MethodArgumentNotValidException e) {
        logger.warn("Validation failed: {}", e.getBindingResult().getFieldError());
        String message = e.getBindingResult().getFieldError() != null 
            ? e.getBindingResult().getFieldError().getDefaultMessage() 
            : "Validation failed";
        Result<?> result = Result.error(message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }
    
    @ExceptionHandler(BindException.class)
    public ResponseEntity<Result<?>> handleBindException(BindException e) {
        logger.warn("Parameter binding failed: {}", e.getFieldError());
        String message = e.getFieldError() != null 
            ? e.getFieldError().getDefaultMessage() 
            : "Parameter binding failed";
        Result<?> result = Result.error(message);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }
    
    @ExceptionHandler(DuplicateKeyException.class)
    public ResponseEntity<Result<?>> handleDuplicateKeyException(DuplicateKeyException e) {
        logger.warn("Duplicate key: {}", e.getMessage());
        Result<?> result = Result.error("Data already exists");
        return ResponseEntity.badRequest().body(result);
    }
    
    @ExceptionHandler(SQLException.class)
    public ResponseEntity<Result<?>> handleSQLException(SQLException e) {
        logger.error("Database error: ", e);
        Result<?> result = Result.error("Database operation failed");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
    }
    
    @ExceptionHandler(OptimisticLockingFailureException.class)
    public ResponseEntity<Result<?>> handleOptimisticLockingFailureException(OptimisticLockingFailureException e) {
        logger.warn("Optimistic lock conflict: {}", e.getMessage());
        Result<?> result = Result.error("Data has been modified, please refresh and try again");
        return ResponseEntity.status(HttpStatus.CONFLICT).body(result);
    }
    
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Result<?>> handleNoHandlerFoundException(NoHandlerFoundException e) {
        logger.warn("Resource not found: {}", e.getRequestURL());
        Result<?> result = Result.error("Resource not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(result);
    }
    
    @ExceptionHandler(TimeoutException.class)
    public ResponseEntity<Result<?>> handleTimeoutException(TimeoutException e) {
        logger.warn("Request timeout: {}", e.getMessage());
        Result<?> result = Result.error("Request timeout, please try again");
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT).body(result);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Result<?>> handleException(Exception e) {
        logger.error("Global exception handler: ", e);
        Result<?> result = Result.error(DEFAULT_ERROR_MESSAGE);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Result<?>> handleRuntimeException(RuntimeException e) {
        logger.error("Runtime exception: ", e);
        Result<?> result = Result.error(DEFAULT_ERROR_MESSAGE);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(result);
    }
}
