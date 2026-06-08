package com.lingyue.repository;

import com.lingyue.entity.BattleRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BattleRecordRepository extends JpaRepository<BattleRecord, Long> {

    List<BattleRecord> findByRoleIdOrderByCreateTimeDesc(Long roleId);

    List<BattleRecord> findByRoleIdAndVictoryOrderByCreateTimeDesc(Long roleId, Boolean victory);

    long countByRoleIdAndVictory(Long roleId, Boolean victory);

    @Query("SELECT b FROM BattleRecord b WHERE b.roleId = :roleId ORDER BY b.createTime DESC")
    List<BattleRecord> findRecentByRoleId(@Param("roleId") Long roleId);

    @Query("SELECT COUNT(b) FROM BattleRecord b WHERE b.roleId = :roleId AND b.createTime > :since")
    long countRecentBattles(@Param("roleId") Long roleId, @Param("since") java.time.LocalDateTime since);
}
