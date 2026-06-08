package com.lingyue.repository;

import com.lingyue.entity.AchievementClaimRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 成就领取记录 Repository
 */
@Repository
public interface AchievementClaimRecordRepository extends JpaRepository<AchievementClaimRecord, Long> {
    
    /**
     * 根据请求 ID 查询记录 (幂等性检查)
     */
    Optional<AchievementClaimRecord> findByRequestId(String requestId);
}
