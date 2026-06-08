package com.lingyue.repository;

import com.lingyue.entity.RoleWalkFireStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RoleWalkFireStatusRepository extends JpaRepository<RoleWalkFireStatus, Long> {
    
    /**
     * 查询角色当前激活的走火入魔状态
     */
    List<RoleWalkFireStatus> findByRoleIdAndIsActive(Long roleId, Integer isActive);
    
    /**
     * 查询过期的走火入魔状态
     */
    List<RoleWalkFireStatus> findByEndTimeBeforeAndIsActive(LocalDateTime endTime, Integer isActive);
}