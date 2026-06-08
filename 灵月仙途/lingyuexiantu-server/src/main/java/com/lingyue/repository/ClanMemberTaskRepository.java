package com.lingyue.repository;

import com.lingyue.entity.ClanMemberTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 宗门成员任务进度 Repository
 */
@Repository
public interface ClanMemberTaskRepository extends JpaRepository<ClanMemberTask, Long> {
    
    /**
     * 查询角色的任务进度
     */
    List<ClanMemberTask> findByRoleId(Long roleId);
    
    /**
     * 查询角色的特定任务进度
     */
    Optional<ClanMemberTask> findByRoleIdAndTaskId(Long roleId, Long taskId);
    
    /**
     * 查询宗门的所有任务进度
     */
    List<ClanMemberTask> findByClanId(Long clanId);
}
