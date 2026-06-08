package com.lingyue.service;

import com.lingyue.entity.RoleSkill;
import java.util.List;

public interface RoleSkillService {
    
    List<RoleSkill> getAllRoleSkills();
    
    List<RoleSkill> getRoleSkillsByRoleId(Long roleId);
    
    RoleSkill getRoleSkillById(Long id);
    
    RoleSkill createRoleSkill(RoleSkill roleSkill);
    
    RoleSkill updateRoleSkill(Long id, RoleSkill roleSkill);
    
    void deleteRoleSkill(Long id);
    
    void deleteRoleSkillByRoleIdAndSkillId(Long roleId, Long skillId);
    
    RoleSkill equipSkill(Long roleId, Long skillId);
    
    RoleSkill unequipSkill(Long roleId, Long skillId);
    
    List<RoleSkill> getEquippedSkills(Long roleId);
}
