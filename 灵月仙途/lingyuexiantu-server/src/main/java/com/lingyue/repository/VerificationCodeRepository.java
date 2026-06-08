package com.lingyue.repository;

import com.lingyue.entity.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {
    
    // 根据手机号和状态查询未使用的验证码
    Optional<VerificationCode> findByPhoneAndStatus(String phone, Integer status);
    
    // 根据手机号查询最新的验证码
    Optional<VerificationCode> findFirstByPhoneOrderByCreatedAtDesc(String phone);
}