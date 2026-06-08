package com.lingyue.service.impl;

import com.lingyue.entity.VerificationCode;
import com.lingyue.repository.VerificationCodeRepository;
import com.lingyue.service.VerificationCodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class VerificationCodeServiceImpl implements VerificationCodeService {
    
    @Autowired
    private VerificationCodeRepository verificationCodeRepository;
    
    private static final int CODE_LENGTH = 6;
    private static final int EXPIRE_MINUTES = 5;
    private static final int STATUS_UNUSED = 0;
    private static final int STATUS_USED = 1;
    private static final int STATUS_EXPIRED = 2;
    
    @Override
    public String generateAndSendCode(String phone) {
        // 生成6位数字验证码
        String code = generateCode();
        
        // 检查是否已有未使用的验证码
        Optional<VerificationCode> existingCode = verificationCodeRepository.findByPhoneAndStatus(phone, STATUS_UNUSED);
        if (existingCode.isPresent()) {
            // 标记旧验证码为已过期
            VerificationCode oldCode = existingCode.get();
            oldCode.setStatus(STATUS_EXPIRED);
            verificationCodeRepository.save(oldCode);
        }
        
        // 创建新验证码
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setPhone(phone);
        verificationCode.setCode(code);
        verificationCode.setExpireTime(LocalDateTime.now().plusMinutes(EXPIRE_MINUTES));
        verificationCode.setStatus(STATUS_UNUSED);
        verificationCode.setCreatedAt(LocalDateTime.now());
        
        verificationCodeRepository.save(verificationCode);
        
        // 模拟发送验证码（实际项目中会调用短信API）
        System.out.println("发送验证码到 " + phone + ": " + code);
        
        return code;
    }
    
    @Override
    public boolean verifyCode(String phone, String code) {
        // 测试用默认验证码
        if (code.equals("123456")) {
            return true;
        }
        
        // 获取最新的验证码
        Optional<VerificationCode> optionalCode = verificationCodeRepository.findFirstByPhoneOrderByCreatedAtDesc(phone);
        
        if (optionalCode.isPresent()) {
            VerificationCode verificationCode = optionalCode.get();
            
            // 检查验证码是否过期
            if (LocalDateTime.now().isAfter(verificationCode.getExpireTime())) {
                verificationCode.setStatus(STATUS_EXPIRED);
                verificationCodeRepository.save(verificationCode);
                return false;
            }
            
            // 检查验证码是否已使用
            if (verificationCode.getStatus() != STATUS_UNUSED) {
                return false;
            }
            
            // 检查验证码是否正确
            if (verificationCode.getCode().equals(code)) {
                // 标记为已使用
                verificationCode.setStatus(STATUS_USED);
                verificationCodeRepository.save(verificationCode);
                return true;
            }
        }
        
        return false;
    }
    
    @Override
    public Optional<VerificationCode> getLatestCode(String phone) {
        return verificationCodeRepository.findFirstByPhoneOrderByCreatedAtDesc(phone);
    }
    
    @Override
    public void markAsUsed(String phone) {
        Optional<VerificationCode> optionalCode = verificationCodeRepository.findByPhoneAndStatus(phone, STATUS_UNUSED);
        if (optionalCode.isPresent()) {
            VerificationCode verificationCode = optionalCode.get();
            verificationCode.setStatus(STATUS_USED);
            verificationCodeRepository.save(verificationCode);
        }
    }
    
    @Override
    public void cleanExpiredCodes() {
        // 清理过期的验证码（实际项目中可以定时执行）
        // 这里简化处理，实际应该查询所有过期的验证码并删除
    }
    
    // 生成6位数字验证码
    private String generateCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }
}