package com.lingyue.repository;

import com.lingyue.entity.RoleTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface RoleTaskRepository extends JpaRepository<RoleTask, Long> {
    
    List<RoleTask> findByRoleIdAndStatus(Long roleId, String status);
    
    @Query("SELECT rt FROM RoleTask rt WHERE rt.roleId = :roleId")
    List<RoleTask> findByRoleId(@Param("roleId") Long roleId);
    
    Optional<RoleTask> findByRoleIdAndTaskId(Long roleId, Long taskId);
    
    @Query("SELECT rt FROM RoleTask rt WHERE rt.roleId = :roleId AND rt.taskId = :taskId")
    Optional<RoleTask> findByRoleIdAndTaskIdCustom(@Param("roleId") Long roleId, @Param("taskId") Long taskId);
}
