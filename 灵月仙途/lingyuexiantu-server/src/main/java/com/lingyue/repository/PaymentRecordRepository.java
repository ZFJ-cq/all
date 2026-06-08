package com.lingyue.repository;

import com.lingyue.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    
    List<PaymentRecord> findByUserId(Long userId);
    
    PaymentRecord findByOrderNo(String orderNo);
    
    List<PaymentRecord> findByUserIdAndStatus(Long userId, String status);
}
