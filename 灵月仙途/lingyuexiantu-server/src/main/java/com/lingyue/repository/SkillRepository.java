package com.lingyue.repository;

import com.lingyue.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    
    List<Skill> findByStatus(Integer status);
    
    List<Skill> findBySkillType(String skillType);
    
    @Query("SELECT s FROM Skill s WHERE s.skillName LIKE %?1%")
    List<Skill> searchByKeyword(String keyword);
}
