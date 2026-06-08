package com.lingyue.service.impl;

import com.lingyue.entity.RoleSkill;
import com.lingyue.repository.RoleSkillRepository;
import com.lingyue.service.RoleSkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoleSkillServiceImpl implements RoleSkillService {
    
    @Autowired
    private RoleSkillRepository roleSkillRepository;
    
    @Override
    public List<RoleSkill> getAllRoleSkills() {
        return roleSkillRepository.findAll();
    }
    
    @Override
    public List<RoleSkill> getRoleSkillsByRoleId(Long roleId) {
        return roleSkillRepository.findByRoleId(roleId);
    }
    
    @Override
    public RoleSkill getRoleSkillById(Long id) {
        Optional<RoleSkill> roleSkill = roleSkillRepository.findById(id);
        return roleSkill.orElse(null);
    }
    
    @Override
    public RoleSkill createRoleSkill(RoleSkill roleSkill) {
        if (roleSkill.getSkillLevel() == null) {
            roleSkill.setSkillLevel(1);
        }
        if (roleSkill.getExperience() == null) {
            roleSkill.setExperience(0);
        }
        if (roleSkill.getEquipped() == null) {
            roleSkill.setEquipped(false);
        }
        return roleSkillRepository.save(roleSkill);
    }
    
    @Override
    public RoleSkill updateRoleSkill(Long id, RoleSkill roleSkill) {
        Optional<RoleSkill> existingRoleSkill = roleSkillRepository.findById(id);
        if (existingRoleSkill.isPresent()) {
            RoleSkill rs = existingRoleSkill.get();
            rs.setSkillLevel(roleSkill.getSkillLevel());
            rs.setExperience(roleSkill.getExperience());
            rs.setEquipped(roleSkill.getEquipped());
            return roleSkillRepository.save(rs);
        }
        return null;
    }
    
    @Override
    public void deleteRoleSkill(Long id) {
        roleSkillRepository.deleteById(id);
    }
    
    @Override
    public void deleteRoleSkillByRoleIdAndSkillId(Long roleId, Long skillId) {
        roleSkillRepository.deleteByRoleIdAndSkillId(roleId, skillId);
    }
    
    @Override
    public RoleSkill equipSkill(Long roleId, Long skillId) {
        Optional<RoleSkill> roleSkill = roleSkillRepository.findByRoleIdAndSkillId(roleId, skillId);
        if (roleSkill.isPresent()) {
            RoleSkill rs = roleSkill.get();
            rs.setEquipped(true);
            return roleSkillRepository.save(rs);
        }
        return null;
    }
    
    @Override
    public RoleSkill unequipSkill(Long roleId, Long skillId) {
        Optional<RoleSkill> roleSkill = roleSkillRepository.findByRoleIdAndSkillId(roleId, skillId);
        if (roleSkill.isPresent()) {
            RoleSkill rs = roleSkill.get();
            rs.setEquipped(false);
            return roleSkillRepository.save(rs);
        }
        return null;
    }
    
    @Override
    public List<RoleSkill> getEquippedSkills(Long roleId) {
        return roleSkillRepository.findEquippedSkills(roleId);
    }
}
