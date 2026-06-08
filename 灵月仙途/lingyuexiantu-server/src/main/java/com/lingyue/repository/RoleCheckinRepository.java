package com.lingyue.repository;

import com.lingyue.entity.RoleCheckin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface RoleCheckinRepository extends JpaRepository<RoleCheckin, Long> {
    
    @Query("SELECT rc FROM RoleCheckin rc WHERE rc.roleId = :roleId AND rc.year = :year AND rc.month = :month")
    Optional<RoleCheckin> findByRoleIdAndYearAndMonth(@Param("roleId") Long roleId, 
                                                       @Param("year") Integer year, 
                                                       @Param("month") Integer month);
    
    @Query("SELECT rc FROM RoleCheckin rc WHERE rc.roleId = :roleId ORDER BY rc.year DESC, rc.month DESC LIMIT 1")
    Optional<RoleCheckin> findLatestByRoleId(@Param("roleId") Long roleId);
}
