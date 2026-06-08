package com.lingyue.repository;

import com.lingyue.entity.RoleLocationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RoleLocationLogRepository extends JpaRepository<RoleLocationLog, Long> {
    Optional<RoleLocationLog> findByRoleIdAndLocationId(Long roleId, Long locationId);
    List<RoleLocationLog> findByRoleIdOrderByLastVisitAtDesc(Long roleId);
}
