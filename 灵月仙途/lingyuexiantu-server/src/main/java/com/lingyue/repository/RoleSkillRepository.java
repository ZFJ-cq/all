package com.lingyue.repository;

import com.lingyue.entity.RoleSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleSkillRepository extends JpaRepository<RoleSkill, Long> {
    
    List<RoleSkill> findByRoleId(Long roleId);
    
    List<RoleSkill> findBySkillId(Long skillId);
    
    Optional<RoleSkill> findByRoleIdAndSkillId(Long roleId, Long skillId);
    
    @Query("SELECT rs FROM RoleSkill rs WHERE rs.roleId = ?1 AND rs.equipped = true")
    List<RoleSkill> findEquippedSkills(Long roleId);
    
    void deleteByRoleIdAndSkillId(Long roleId, Long skillId);
}
