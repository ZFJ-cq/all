package com.lingyue.service.impl;

import com.lingyue.entity.Skill;
import com.lingyue.repository.SkillRepository;
import com.lingyue.service.SkillService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SkillServiceImpl implements SkillService {
    
    @Autowired
    private SkillRepository skillRepository;
    
    @Override
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }
    
    @Override
    public List<Skill> getEnabledSkills() {
        return skillRepository.findByStatus(1);
    }
    
    @Override
    public Skill getSkillById(Long id) {
        Optional<Skill> skill = skillRepository.findById(id);
        return skill.orElse(null);
    }
    
    @Override
    public Skill createSkill(Skill skill) {
        if (skill.getStatus() == null) {
            skill.setStatus(1);
        }
        if (skill.getSkillLevel() == null) {
            skill.setSkillLevel(1);
        }
        if (skill.getMaxLevel() == null) {
            skill.setMaxLevel(12);
        }
        if (skill.getTriggerRate() == null) {
            skill.setTriggerRate(50);
        }
        return skillRepository.save(skill);
    }
    
    @Override
    public Skill updateSkill(Long id, Skill skill) {
        Optional<Skill> existingSkill = skillRepository.findById(id);
        if (existingSkill.isPresent()) {
            Skill s = existingSkill.get();
            s.setSkillName(skill.getSkillName());
            s.setDescription(skill.getDescription());
            s.setSkillType(skill.getSkillType());
            s.setSkillLevel(skill.getSkillLevel());
            s.setMaxLevel(skill.getMaxLevel());
            s.setAttackBonus(skill.getAttackBonus());
            s.setDefenseBonus(skill.getDefenseBonus());
            s.setXiuweiBonus(skill.getXiuweiBonus());
            s.setSpiritPowerBonus(skill.getSpiritPowerBonus());
            s.setSpeedBonus(skill.getSpeedBonus());
            s.setCriticalBonus(skill.getCriticalBonus());
            s.setDodgeBonus(skill.getDodgeBonus());
            s.setTriggerRate(skill.getTriggerRate());
            s.setStatus(skill.getStatus());
            return skillRepository.save(s);
        }
        return null;
    }
    
    @Override
    public void deleteSkill(Long id) {
        skillRepository.deleteById(id);
    }
    
    @Override
    public List<Skill> getSkillsByType(String type) {
        return skillRepository.findBySkillType(type);
    }
    
    @Override
    public List<Skill> searchSkills(String keyword) {
        return skillRepository.searchByKeyword(keyword);
    }
}
