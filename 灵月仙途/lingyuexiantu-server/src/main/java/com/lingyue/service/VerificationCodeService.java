package com.lingyue.service;

import com.lingyue.entity.VerificationCode;
import java.util.Optional;

public interface VerificationCodeService {
    
    // 生成并发送验证码
    String generateAndSendCode(String phone);
    
    // 验证验证码
    boolean verifyCode(String phone, String code);
    
    // 获取最新的验证码
    Optional<VerificationCode> getLatestCode(String phone);
    
    // 标记验证码为已使用
    void markAsUsed(String phone);
    
    // 清理过期验证码
    void cleanExpiredCodes();
}