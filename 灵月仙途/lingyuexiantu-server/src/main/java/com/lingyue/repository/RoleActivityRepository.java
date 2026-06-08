package com.lingyue.repository;

import com.lingyue.entity.RoleActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface RoleActivityRepository extends JpaRepository<RoleActivity, Long> {
    
    Optional<RoleActivity> findByRoleId(@Param("roleId") Long roleId);
}
