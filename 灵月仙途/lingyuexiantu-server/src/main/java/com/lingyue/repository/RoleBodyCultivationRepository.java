package com.lingyue.repository;

import com.lingyue.entity.RoleBodyCultivation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleBodyCultivationRepository extends JpaRepository<RoleBodyCultivation, Long> {
    
    Optional<RoleBodyCultivation> findByRoleId(Long roleId);
}
