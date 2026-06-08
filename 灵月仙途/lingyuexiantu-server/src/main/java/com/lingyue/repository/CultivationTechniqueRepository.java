package com.lingyue.repository;

import com.lingyue.entity.CultivationTechnique;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CultivationTechniqueRepository extends JpaRepository<CultivationTechnique, Long> {
    
    List<CultivationTechnique> findByIsActiveTrue();
    
    @Query("SELECT t FROM CultivationTechnique t WHERE t.isActive = true AND t.levelRequirement <= :level")
    List<CultivationTechnique> findAvailableTechniques(@Param("level") Integer level);
    
    @Query("SELECT t FROM CultivationTechnique t WHERE t.isActive = true AND " +
           "(t.realmRequirement IS NULL OR t.realmRequirement = :realm)")
    List<CultivationTechnique> findAvailableByRealm(@Param("realm") String realm);
}