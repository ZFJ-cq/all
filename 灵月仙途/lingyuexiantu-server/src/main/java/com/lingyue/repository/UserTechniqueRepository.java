package com.lingyue.repository;

import com.lingyue.entity.UserTechnique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTechniqueRepository extends JpaRepository<UserTechnique, Long> {
    
    List<UserTechnique> findByUserIdAndIsEquippedTrue(Long userId);
    
    List<UserTechnique> findByRoleIdAndIsEquippedTrue(Long roleId);
    
    List<UserTechnique> findByUserId(Long userId);
    
    List<UserTechnique> findByRoleId(Long roleId);
    
    Optional<UserTechnique> findByUserIdAndTechniqueId(Long userId, Long techniqueId);
    
    Optional<UserTechnique> findByRoleIdAndTechniqueId(Long roleId, Long techniqueId);
    
    @Query("SELECT ut FROM UserTechnique ut WHERE ut.roleId = :roleId AND ut.isEquipped = true")
    List<UserTechnique> findEquippedTechniques(@Param("roleId") Long roleId);
    
    @Modifying
    @Transactional
    @Query("UPDATE UserTechnique ut SET ut.isEquipped = :isEquipped, " +
           "ut.equippedAt = CASE WHEN :isEquipped = true THEN CURRENT_TIMESTAMP ELSE ut.equippedAt END, " +
           "ut.unequippedAt = CASE WHEN :isEquipped = false THEN CURRENT_TIMESTAMP ELSE ut.unequippedAt END " +
           "WHERE ut.roleId = :roleId AND ut.techniqueId = :techniqueId")
    int updateEquippedStatus(@Param("roleId") Long roleId, 
                            @Param("techniqueId") Long techniqueId, 
                            @Param("isEquipped") Boolean isEquipped);
    
    long countByUserIdAndIsEquippedTrue(Long userId);
}