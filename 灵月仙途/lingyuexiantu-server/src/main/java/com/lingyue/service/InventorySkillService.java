package com.lingyue.service;

import com.lingyue.entity.Inventory;
import com.lingyue.entity.Item;
import com.lingyue.entity.RoleSkill;
import com.lingyue.entity.Skill;
import com.lingyue.repository.InventoryRepository;
import com.lingyue.repository.ItemRepository;
import com.lingyue.repository.RoleSkillRepository;
import com.lingyue.repository.SkillRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 背包与技能服务
 */
@Service
public class InventorySkillService {
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    @Autowired
    private ItemRepository itemRepository;
    
    @Autowired
    private RoleSkillRepository roleSkillRepository;
    
    @Autowired
    private SkillRepository skillRepository;
    
    /**
     * 检查背包中是否有技能书简
     */
    public boolean hasSkillBookScroll(Long roleId) {
        List<Inventory> inventories = inventoryRepository.findByRoleId(roleId);
        for (Inventory inv : inventories) {
            if ("技能书简".equals(inv.getItemName())) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * 获取背包中技能书简的数量
     */
    public int getSkillBookScrollCount(Long roleId) {
        List<Inventory> inventories = inventoryRepository.findByRoleId(roleId);
        for (Inventory inv : inventories) {
            if ("技能书简".equals(inv.getItemName())) {
                return inv.getStackSize();
            }
        }
        return 0;
    }
    
    /**
     * 扣除技能书简
     */
    @Transactional
    public boolean consumeSkillBookScroll(Long roleId) {
        List<Inventory> inventories = inventoryRepository.findByRoleId(roleId);
        for (Inventory inv : inventories) {
            if ("技能书简".equals(inv.getItemName())) {
                if (inv.getStackSize() > 1) {
                    inv.setStackSize(inv.getStackSize() - 1);
                    inventoryRepository.save(inv);
                } else {
                    inventoryRepository.delete(inv);
                }
                return true;
            }
        }
        return false;
    }
    
    /**
     * 计算技能提供的属性加成
     */
    public Map<String, Object> calculateSkillBonus(Long roleId) {
        List<RoleSkill> roleSkills = roleSkillRepository.findByRoleId(roleId);
        
        Map<String, Object> bonus = new HashMap<>();
        bonus.put("attackBonus", 0);
        bonus.put("defenseBonus", 0);
        bonus.put("xiuweiBonus", 0);
        
        for (RoleSkill rs : roleSkills) {
            if (!rs.getEquipped()) {
                continue; // 只计算已装备技能的属性
            }
            
            Optional<Skill> skillOpt = skillRepository.findById(rs.getSkillId());
            if (skillOpt.isPresent()) {
                Skill skill = skillOpt.get();
                
                // 累加属性
                int currentAttack = (int) bonus.get("attackBonus");
                int currentDefense = (int) bonus.get("defenseBonus");
                int currentXiuwei = (int) bonus.get("xiuweiBonus");
                
                if (skill.getAttackBonus() != null) {
                    bonus.put("attackBonus", currentAttack + skill.getAttackBonus());
                }
                if (skill.getDefenseBonus() != null) {
                    bonus.put("defenseBonus", currentDefense + skill.getDefenseBonus());
                }
                if (skill.getXiuweiBonus() != null) {
                    bonus.put("xiuweiBonus", currentXiuwei + skill.getXiuweiBonus());
                }
            }
        }
        
        return bonus;
    }
    
    /**
     * 遗忘技能
     */
    @Transactional
    public Map<String, Object> forgetSkill(Long roleId, Long skillId) {
        Map<String, Object> result = new HashMap<>();
        
        // 1. 检查背包中是否有技能书简
        if (!hasSkillBookScroll(roleId)) {
            result.put("success", false);
            result.put("message", "背包中没有技能书简，无法遗忘技能");
            result.put("code", "NO_SCROLL");
            return result;
        }
        
        // 2. 查找角色技能
        Optional<RoleSkill> roleSkillOpt = roleSkillRepository.findByRoleIdAndSkillId(roleId, skillId);
        if (roleSkillOpt.isEmpty()) {
            result.put("success", false);
            result.put("message", "未找到该技能");
            result.put("code", "SKILL_NOT_FOUND");
            return result;
        }
        
        // 3. 获取技能信息（用于返回提示）
        RoleSkill roleSkill = roleSkillOpt.get();
        Optional<Skill> skillOpt = skillRepository.findById(skillId);
        String skillName = skillOpt.map(Skill::getSkillName).orElse("未知技能");
        
        // 4. 扣除技能书简
        if (!consumeSkillBookScroll(roleId)) {
            result.put("success", false);
            result.put("message", "扣除技能书简失败");
            result.put("code", "CONSUME_FAILED");
            return result;
        }
        
        // 5. 删除角色技能
        roleSkillRepository.deleteById(roleSkill.getId());
        
        // 6. 重新计算属性加成
        Map<String, Object> newBonus = calculateSkillBonus(roleId);
        
        result.put("success", true);
        result.put("message", "成功遗忘技能：" + skillName);
        result.put("skillName", skillName);
        result.put("newBonus", newBonus);
        
        return result;
    }
}
