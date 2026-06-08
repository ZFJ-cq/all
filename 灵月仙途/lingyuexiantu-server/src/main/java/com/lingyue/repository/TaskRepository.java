package com.lingyue.repository;

import com.lingyue.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByTaskTypeAndIsActiveOrderBySortOrderAsc(String taskType, Boolean isActive);
    
    List<Task> findByIsActiveTrueOrderBySortOrderAsc();
    
    @Query("SELECT t FROM Task t WHERE t.taskType = :taskType AND t.isActive = true ORDER BY t.sortOrder ASC")
    List<Task> findActiveTasksByType(@Param("taskType") String taskType);
}
