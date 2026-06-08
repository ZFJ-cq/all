package com.lingyue.repository;

import com.lingyue.entity.PlayerStatsBase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PlayerStatsBaseRepository extends JpaRepository<PlayerStatsBase, Long> {
    Optional<PlayerStatsBase> findByRoleId(Long roleId);
    Optional<PlayerStatsBase> findByPlayerId(Long playerId);
}