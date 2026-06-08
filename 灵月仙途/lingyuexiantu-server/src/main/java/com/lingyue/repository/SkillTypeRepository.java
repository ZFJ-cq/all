package com.lingyue.repository;

import com.lingyue.entity.SkillType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillTypeRepository extends JpaRepository<SkillType, Long> {
    
    List<SkillType> findByIsActive(Boolean isActive);
    
    List<SkillType> findAllByOrderBySortOrderAsc();
    
    @Query("SELECT st FROM SkillType st WHERE st.isActive = true ORDER BY st.sortOrder ASC")
    List<SkillType> findActiveTypes();
    
    SkillType findByTypeCode(String typeCode);
}
