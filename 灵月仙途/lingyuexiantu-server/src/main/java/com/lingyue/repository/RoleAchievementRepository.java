package com.lingyue.repository;

import com.lingyue.entity.RoleAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoleAchievementRepository extends JpaRepository<RoleAchievement, Long> {
    
    // 根据角色 ID 查询所有成就进度
    List<RoleAchievement> findByRoleId(Long roleId);
    
    // 根据角色 ID 和成就 ID 查询特定成就进度
    Optional<RoleAchievement> findByRoleIdAndAchievementId(Long roleId, Long achievementId);
    
    // 根据角色 ID 和状态查询成就进度
    List<RoleAchievement> findByRoleIdAndStatus(Long roleId, String status);
    
    // 查询角色当前佩戴的称号
    Optional<RoleAchievement> findByRoleIdAndIsEquippedTrue(Long roleId);
    
    /**
     * 根据角色 ID 和成就 ID 查询 (使用悲观锁)
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT ra FROM RoleAchievement ra " +
           "WHERE ra.roleId = :roleId AND ra.achievementId = :achievementId")
    Optional<RoleAchievement> findByRoleIdAndAchievementIdForUpdate(
        @Param("roleId") Long roleId,
        @Param("achievementId") Long achievementId
    );
    
    /**
     * CAS 操作更新成就状态
     * @return 受影响的行数 (0 表示更新失败，version 不匹配)
     */
    @Modifying
    @Query("UPDATE RoleAchievement ra SET " +
           "ra.status = :newStatus, " +
           "ra.claimedTime = :claimedTime, " +
           "ra.claimedRequestId = :requestId, " +
           "ra.claimedIp = :clientIp, " +
           "ra.version = ra.version + 1 " +
           "WHERE ra.roleId = :roleId " +
           "AND ra.achievementId = :achievementId " +
           "AND ra.status = :oldStatus " +
           "AND ra.version = :version")
    int updateStatusCas(
        @Param("roleId") Long roleId,
        @Param("achievementId") Long achievementId,
        @Param("oldStatus") String oldStatus,
        @Param("newStatus") String newStatus,
        @Param("claimedTime") LocalDateTime claimedTime,
        @Param("requestId") String requestId,
        @Param("clientIp") String clientIp,
        @Param("version") Integer version
    );
}
