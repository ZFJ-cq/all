package com.lingyue.repository;

import com.lingyue.entity.RoleBodyPartProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleBodyPartProgressRepository extends JpaRepository<RoleBodyPartProgress, Long> {
    
    Optional<RoleBodyPartProgress> findByRoleIdAndPartId(Long roleId, Long partId);
    
    List<RoleBodyPartProgress> findByRoleId(Long roleId);
}
