package com.lingyue.repository;

import com.lingyue.entity.StatOperationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StatOperationLogRepository extends JpaRepository<StatOperationLog, Long> {
    
    @Query("SELECT l FROM StatOperationLog l WHERE l.playerId = :playerId ORDER BY l.createdAt DESC")
    List<StatOperationLog> findByPlayerIdOrderByCreatedAtDesc(@Param("playerId") Long playerId);
    
    @Query("SELECT l FROM StatOperationLog l WHERE l.playerId = :playerId AND l.opType = :opType ORDER BY l.createdAt DESC")
    List<StatOperationLog> findByPlayerIdAndOpTypeOrderByCreatedAtDesc(@Param("playerId") Long playerId, @Param("opType") String opType);
}