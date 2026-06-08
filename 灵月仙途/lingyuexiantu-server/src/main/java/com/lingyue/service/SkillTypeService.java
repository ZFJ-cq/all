package com.lingyue.service;

import com.lingyue.entity.SkillType;
import com.lingyue.repository.SkillTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SkillTypeService {
    
    @Autowired
    private SkillTypeRepository skillTypeRepository;
    
    public List<SkillType> getAllActiveTypes() {
        return skillTypeRepository.findActiveTypes();
    }
    
    public List<SkillType> getAllTypes() {
        return skillTypeRepository.findAllByOrderBySortOrderAsc();
    }
    
    public SkillType getTypeByCode(String typeCode) {
        return skillTypeRepository.findByTypeCode(typeCode);
    }
    
    public SkillType createType(SkillType skillType) {
        return skillTypeRepository.save(skillType);
    }
    
    public SkillType updateType(Long id, SkillType skillType) {
        SkillType existingType = skillTypeRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("技能类型不存在"));
        
        existingType.setTypeName(skillType.getTypeName());
        existingType.setDisplayName(skillType.getDisplayName());
        existingType.setDescription(skillType.getDescription());
        existingType.setIcon(skillType.getIcon());
        existingType.setColor(skillType.getColor());
        existingType.setSortOrder(skillType.getSortOrder());
        existingType.setIsActive(skillType.getIsActive());
        
        return skillTypeRepository.save(existingType);
    }
    
    public void deleteType(Long id) {
        skillTypeRepository.deleteById(id);
    }
}
