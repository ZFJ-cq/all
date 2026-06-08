package com.lingyue.repository;

import com.lingyue.entity.CultivationTask;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CultivationTaskRepository extends JpaRepository<CultivationTask, Long> {
    
    Optional<CultivationTask> findByRoleIdAndStatus(Long roleId, String status);
    
    List<CultivationTask> findByRoleIdAndStatusOrderByEndTimeDesc(Long roleId, String status);
    
    List<CultivationTask> findByRoleIdOrderByEndTimeDesc(Long roleId, Pageable pageable);
    
    @Query("SELECT ct FROM CultivationTask ct WHERE ct.roleId = :roleId AND ct.endTime <= :now AND ct.status = 'ACTIVE'")
    List<CultivationTask> findCompletedTasks(@Param("roleId") Long roleId, @Param("now") LocalDateTime now);
    
    @Query("SELECT ct FROM CultivationTask ct WHERE ct.roleId = :roleId AND ct.status = 'ACTIVE'")
    List<CultivationTask> findActiveTasks(@Param("roleId") Long roleId);
    
    long countByRoleIdAndStatus(Long roleId, String status);
}