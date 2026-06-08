package com.lingyue.repository;

import com.lingyue.entity.RoleBaseStats;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoleBaseStatsRepository extends JpaRepository<RoleBaseStats, Long> {
    Optional<RoleBaseStats> findByRoleId(Long roleId);
}
