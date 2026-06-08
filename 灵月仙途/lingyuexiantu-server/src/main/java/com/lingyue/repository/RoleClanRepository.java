package com.lingyue.repository;

import com.lingyue.entity.RoleClan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoleClanRepository extends JpaRepository<RoleClan, Long> {
    RoleClan findByRoleId(Long roleId);
    List<RoleClan> findByClanId(Long clanId);
    List<RoleClan> findByClanIdAndPosition(Long clanId, String position);
}
