package com.lingyue.repository;

import com.lingyue.entity.TechniqueChangeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TechniqueChangeLogRepository extends JpaRepository<TechniqueChangeLog, Long> {
    
    List<TechniqueChangeLog> findByRoleIdOrderByChangeTimeDesc(Long roleId);
    
    List<TechniqueChangeLog> findByRoleIdAndCultivationTaskIdOrderByChangeTimeDesc(Long roleId, Long cultivationTaskId);
}