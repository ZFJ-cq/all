package com.lingyue.repository;

import com.lingyue.entity.BodyCultivationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BodyCultivationLogRepository extends JpaRepository<BodyCultivationLog, Long> {
    
    @Query("SELECT l FROM BodyCultivationLog l WHERE l.roleId = ?1 AND l.createdAt >= ?2")
    List<BodyCultivationLog> findByRoleIdAndTimeRange(Long roleId, LocalDateTime startTime);
}
