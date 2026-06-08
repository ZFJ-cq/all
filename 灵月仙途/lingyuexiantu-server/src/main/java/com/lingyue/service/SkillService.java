package com.lingyue.service;

import com.lingyue.entity.Skill;
import java.util.List;

public interface SkillService {
    
    List<Skill> getAllSkills();
    
    List<Skill> getEnabledSkills();
    
    Skill getSkillById(Long id);
    
    Skill createSkill(Skill skill);
    
    Skill updateSkill(Long id, Skill skill);
    
    void deleteSkill(Long id);
    
    List<Skill> getSkillsByType(String type);
    
    List<Skill> searchSkills(String keyword);
}
